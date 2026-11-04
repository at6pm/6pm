import type { Vnd } from '../money/format';
import { appStoreUrl, marketUrl, playStoreUrl, type BankInfo, type IosApp } from './bank-catalogue';
import { encodeVietQR, type VietQRInput } from './encode-vietqr';
import type { VietQR } from './parse-vietqr';
import { utf8 } from './utf8';

/**
 * The VietQR a bank app should open for this payment. The scanned code is passed on untouched when
 * it already asks for this amount, and always for a shop's code, which 6pm must not rewrite. A
 * transfer to a person's account the user typed an amount for is written again with that amount;
 * if it cannot be, the scanned code goes as it is.
 */
export function payloadFor(qr: VietQR, amount: Vnd): string {
  if (qr.amount === amount || qr.service === 'merchant') return qr.raw;
  const input: VietQRInput = { bin: qr.bin, account: qr.account, amount, service: qr.service };
  if (qr.note !== null) input.note = qr.note;
  if (qr.merchantName !== null) input.merchantName = qr.merchantName;
  try {
    return encodeVietQR(input);
  } catch {
    return qr.raw;
  }
}

/**
 * The link that opens this transfer filled in, in the bank app's own form, or null when the bank
 * has no known form for it.
 */
export function transferLink(app: IosApp, qr: VietQR, amount: Vnd): string | null {
  const { link } = app;
  if (link === null) return null;
  if (link.kind === 'qrPay') {
    const content = encodeURIComponent(payloadFor(qr, amount));
    return `${app.scheme}${link.path}?targetPage=QRPay&qrContent=${content}`;
  }
  if (link.kind === 'momoP2P') return momoTransferLink(app, qr, amount);
  // Nam A takes the fields, not the code, so a shop's code (with fields of its own) cannot go.
  if (qr.service === 'merchant') return null;
  const data = {
    bankId: qr.bin,
    accountNumber: qr.account,
    accountName: qr.merchantName ?? '',
    amount: String(amount),
    description: qr.note ?? '',
    partnerName: '6pm',
    partnerId: '',
  };
  return `${app.scheme}ops.namabank.com.vn/?data=${encodeURIComponent(base64(JSON.stringify(data)))}`;
}

/**
 * A Vietnamese mobile number as MoMo names a wallet: ten digits from 03, 05, 07, 08 or 09. MoMo
 * also takes the retired eleven-digit 01x numbers; those, and +84 or 84 forms, open MoMo at its home.
 */
const MOBILE = /^0[35789]\d{8}$/;

/**
 * MoMo's transfer link, which opens its transfer screen filled in for a MoMo wallet named by its
 * phone number, so it serves only a code for an account at MoMo that is such a number. A bank
 * account, a card or a shop has no MoMo link. The fields go as base64 JSON inside a JSON `extra`,
 * the whole of it percent-encoded: MoMo cuts a query value at its first raw `=`.
 */
function momoTransferLink(app: IosApp, qr: VietQR, amount: Vnd): string | null {
  if (qr.service !== 'account' || qr.bank?.id !== 'MOMO' || !MOBILE.test(qr.account)) return null;
  const data = { userId: qr.account, amount, message: qr.note ?? '' };
  const extra = JSON.stringify({ dataExtract: base64(JSON.stringify(data)) });
  return `${app.scheme}app?action=p2p&extra=${encodeURIComponent(extra)}`;
}

/** What 6pm opens: the filled-in transfer when the bank's form is known, else the app's home. */
export function handoffUrl(app: IosApp, qr: VietQR, amount: Vnd): string {
  return transferLink(app, qr, amount) ?? app.scheme;
}

/** How a payment is handed to a bank app on a phone. */
export interface HandoffPlan {
  /** Opened first: the bank's own link. Null when only the store can find the app. */
  readonly open: string | null;
  /** The bank opens with the payment filled in, so its QR need not be saved for it. */
  readonly filledIn: boolean;
  /** Tried in turn when `open` fails or is null: the app's store page. */
  readonly store: readonly string[];
}

/**
 * What to open to hand a payment to a bank, on iOS or Android; null when 6pm has no way to its app.
 * iOS opens the bank's transfer link (or its home, with no known link) and falls back to the App Store.
 * Android tries the same scheme at the app's home, since no bank's transfer link has been seen to
 * open filled in there, then the app's Play Store page, which opens it when installed.
 */
export function handoffPlan(
  bank: BankInfo | null,
  os: 'ios' | 'android',
  qr: VietQR,
  amount: Vnd,
): HandoffPlan | null {
  const ios = bank?.ios ?? null;
  if (os === 'ios') {
    if (ios === null) return null;
    const open = handoffUrl(ios, qr, amount);
    return { open, filledIn: open !== ios.scheme, store: [appStoreUrl(ios)] };
  }
  const android = bank?.android ?? null;
  if (android === null) return null;
  return {
    open: ios?.scheme ?? null,
    filledIn: false,
    store: [marketUrl(android), playStoreUrl(android)],
  };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Standard base64 of a string's UTF-8 bytes (`btoa` takes Latin-1 only). */
function base64(text: string): string {
  const bytes = utf8(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += ALPHABET.charAt((n >> 18) & 63) + ALPHABET.charAt((n >> 12) & 63);
    out += b === undefined ? '=' : ALPHABET.charAt((n >> 6) & 63);
    out += c === undefined ? '=' : ALPHABET.charAt(n & 63);
  }
  return out;
}
