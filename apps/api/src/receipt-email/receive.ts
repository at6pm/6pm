import {
  EMAIL_CAPTURES_MAX_PENDING,
  emailCaptureSchema,
  handleOfRecipient,
  parseForwardingConfirmation,
  type ReceiptEmail,
} from '@6pm/domain';
import PostalMime from 'postal-mime';

import type { Bindings } from '../env';
import { storeForwardingCheck } from './forwarding-checks';
import { deviceOfHandle } from './handles';
import { readSpend } from './read-spend';
import { sealCapture, sealKeyOf } from './seal';

/**
 * A receipt is a few kilobytes; a mail past this is mostly pictures and attachments, and only
 * this much of its start is read: its text and HTML parts come before what is attached.
 */
export const EMAIL_MAX_BYTES = 1024 * 1024;
/** Email Routing hands over nothing larger; anything claiming more is turned away unread. */
export const EMAIL_ROUTING_MAX_BYTES = 25 * 1024 * 1024;
/** A receipt no phone has fetched in this long is deleted unread. */
export const EMAIL_CAPTURE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** The parts of an Email Routing message the handler uses, so tests can hand one in. */
export type InboundEmail = Pick<ForwardableEmailMessage, 'to' | 'raw' | 'rawSize' | 'setReject'>;

/** What became of one email, for tests and the log; never anything from the email itself. */
export type ReceiveOutcome =
  | 'unknown_address'
  | 'too_large'
  | 'rate_limited'
  | 'not_configured'
  | 'unreadable'
  | 'not_a_receipt'
  | 'forwarding_check'
  | 'full'
  | 'stored';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

/**
 * The capture's id, from the device and what makes the payment one: the bank's transaction code
 * with its amount when the receipt prints one (so the same alert forwarded twice, by a filter and
 * by hand, is one receipt), else the email's Message-ID (the same email sent twice). Either way
 * it is one receipt here, and on the phone after it was fetched.
 */
async function captureIdOf(
  deviceHash: string,
  messageId: string | undefined,
  read: { readonly bank: string | null; readonly code: string | null; readonly amount: number },
): Promise<string> {
  const seed = read.code
    ? `code\n${read.bank ?? ''}\n${read.code}\n${read.amount}`
    : messageId?.trim() || crypto.randomUUID();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${deviceHash}\n${seed}`),
  );
  return toBase64Url(new Uint8Array(digest)).slice(0, 32);
}

/**
 * The first `limit` bytes of a mail, the rest left unread: its headers and the text and HTML
 * parts that come before its attachments. What is cut off is never parsed or kept.
 */
async function headOf(raw: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = raw.getReader();
  const head = new Uint8Array(limit);
  let size = 0;
  try {
    while (size < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      const take = Math.min(value.byteLength, limit - size);
      head.set(value.subarray(0, take), size);
      size += take;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return head.slice(0, size);
}

function instantOrNull(value: string | undefined): string | null {
  const ms = value ? Date.parse(value) : NaN;
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/**
 * Takes one email sent to `<handle>@<host>`. Mail to an address no phone holds is refused (the
 * sender gets a bounce). Mail larger than a receipt can be is read from its first
 * `EMAIL_MAX_BYTES` only, its attachments dropped unread, and refused only when that start holds
 * no text to read. Mail to a real handle is read in memory,
 * by the model when it answers and by the rules when it does not (`readSpend`): when it holds a
 * payment, only what was read is kept, sealed, for the phone to fetch; the email itself is never
 * stored, and goes nowhere but to the model, and nothing from it is logged. Anything that is not a
 * receipt is dropped without a bounce, so a forwarding filter is never turned off by one. A mail
 * service's "confirm forwarding" email is read first: its code and confirm link are kept, sealed,
 * for the phone to show, since forwarding cannot start until the person uses one of them.
 */
export async function receiveEmail(
  message: InboundEmail,
  env: Bindings,
  now = new Date(),
): Promise<ReceiveOutcome> {
  const unknown = (): ReceiveOutcome => {
    message.setReject('No such 6pm address');
    return 'unknown_address';
  };
  const handle = handleOfRecipient(message.to);
  if (handle === null) return unknown();
  const tooLarge = (): ReceiveOutcome => {
    message.setReject('Message too large for a receipt');
    return 'too_large';
  };
  if (message.rawSize > EMAIL_ROUTING_MAX_BYTES) return tooLarge();
  const trimmed = message.rawSize > EMAIL_MAX_BYTES;
  const deviceHash = await deviceOfHandle(env.DB, handle);
  if (deviceHash === null) return unknown();
  const { success } = await env.EMAIL_RATE_LIMIT.limit({ key: handle });
  if (!success) {
    message.setReject('Too many messages to this address, try again later');
    return 'rate_limited';
  }
  const secret = sealKeyOf(env);
  if (secret === null) {
    console.error('receipt email: EMAIL_SEAL_KEY is not set, refusing mail');
    message.setReject('This address is not taking mail right now');
    return 'not_configured';
  }

  let email: ReceiptEmail;
  let messageId: string | undefined;
  try {
    const source = trimmed ? await headOf(message.raw, EMAIL_MAX_BYTES) : message.raw;
    const parsed = await PostalMime.parse(source, { maxNestingDepth: 20 });
    const from = parsed.from?.address
      ? { name: parsed.from.name, address: parsed.from.address }
      : null;
    email = {
      from,
      subject: parsed.subject ?? '',
      date: instantOrNull(parsed.date),
      text: parsed.text ?? null,
      html: parsed.html ?? null,
    };
    messageId = parsed.messageId;
  } catch {
    console.error('receipt email: a message could not be decoded');
    return trimmed ? tooLarge() : 'unreadable';
  }
  // A large mail whose start holds no words is pictures or attachments only: still refused.
  if (trimmed && !email.text?.trim() && !email.html?.trim()) return tooLarge();

  const confirmation = parseForwardingConfirmation(email, { receivedAt: now.toISOString() });
  if (confirmation !== null) {
    const kept = await storeForwardingCheck(env.DB, secret, deviceHash, confirmation, now);
    return kept ? 'forwarding_check' : 'not_a_receipt';
  }

  const read = await readSpend(email, env, deviceHash, now);
  if (read === null) return 'not_a_receipt';
  const capture = emailCaptureSchema.safeParse({
    id: await captureIdOf(deviceHash, messageId, read),
    amount: read.amount,
    merchant: read.merchant.slice(0, 120),
    at: read.at,
    from: read.from?.slice(0, 254) ?? null,
    bank: read.bank?.slice(0, 60) ?? null,
    code: read.code?.slice(0, 40) ?? null,
    memo: read.memo,
    currency: read.currency,
    category: read.category,
    kind: read.kind,
    atKind: read.atKind,
  });
  if (!capture.success) return 'not_a_receipt';

  const waiting = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM email_captures WHERE device_hash = ?',
  )
    .bind(deviceHash)
    .first<{ n: number }>();
  if ((waiting?.n ?? 0) >= EMAIL_CAPTURES_MAX_PENDING) return 'full';

  const sealed = await sealCapture(secret, deviceHash, capture.data);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM email_captures WHERE received_at < ?').bind(
      new Date(now.getTime() - EMAIL_CAPTURE_TTL_MS).toISOString(),
    ),
    env.DB.prepare(
      'INSERT OR IGNORE INTO email_captures (id, device_hash, sealed, received_at) VALUES (?, ?, ?, ?)',
    ).bind(capture.data.id, deviceHash, sealed, now.toISOString()),
  ]);
  return 'stored';
}
