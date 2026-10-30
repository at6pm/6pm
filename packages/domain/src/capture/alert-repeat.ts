import type { SpendSource } from '../spend/spend';
import type { BankAlertInput } from './bank-alert';
import { DUPLICATE_WINDOW_MS } from './duplicate';

/**
 * One bank notification can reach "Catch a bank alert" more than once: the automation runs again
 * for it (Wallet does the same for one tap), or the bank posts the same words twice. Each run
 * leaves its own inbox item, so without this one payment became two spends. A repeat is told by
 * the notification's own words, never kept: an alert's id starts with a fingerprint of the app
 * and the words, and two ids with the same fingerprint are one notification. Two payments of the
 * same amount from one bank differ in their words (the balance after each, "SD"), so they stay
 * two.
 */

/** A repeat of one notification arrives within this long of the first. */
export const ALERT_REPEAT_WINDOW_MS = DUPLICATE_WINDOW_MS;

/** FNV-1a over UTF-16 code units, from a seed. */
function fnv1a(text: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * The notification's 48-bit fingerprint, in 12 hex digits: the app it came from and its title,
 * subtitle and body, spaces evened out. Not its date: a bank posting the same words twice posts
 * them a moment apart.
 */
export function alertFingerprint(input: BankAlertInput): string {
  const words = [input.app, input.title, input.subtitle, input.body]
    .map((part) => (part ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim())
    .join('\n');
  const high = fnv1a(words, 0x811c9dc5).toString(16).padStart(8, '0');
  const low = (fnv1a(words, 0x050c5d1f) >>> 16).toString(16).padStart(4, '0');
  return `${high}${low}`;
}

/**
 * An alert's inbox id: a UUID (RFC 9562 version 8, the application's own layout) whose first 48
 * bits are the notification's fingerprint and the rest drawn from `random`, a lower-case UUID.
 */
export function heardAlertId(input: BankAlertInput, random: string): string {
  const digits = `${alertFingerprint(input)}8${random.replace(/-/g, '').toLowerCase().slice(13)}`;
  return [
    digits.slice(0, 8),
    digits.slice(8, 12),
    digits.slice(12, 16),
    digits.slice(16, 20),
    digits.slice(20, 32),
  ].join('-');
}

/** The fingerprint an alert's id carries; null for any other id (an older alert's, a tap's). */
export function heardKeyOf(id: string | null | undefined): string | null {
  const match = /^([0-9a-f]{8})-([0-9a-f]{4})-8/i.exec(id ?? '');
  return match ? `${match[1]}${match[2]}`.toLowerCase() : null;
}

/** An alert as saved: a spend it became, or its sighting on a payment seen another way. */
export interface AlertSighting {
  readonly source: SpendSource;
  /** The id it was captured with: the inbox item's. */
  readonly id: string | null | undefined;
  /** When it happened, ISO 8601. */
  readonly at: string;
  /** The bank or wallet that told 6pm. */
  readonly detail?: string | null | undefined;
  /** The amount it was saved with; unknown for a sighting on another spend. */
  readonly amount?: number | null | undefined;
}

/**
 * Whether an alert just caught is one already saved, delivered again: both alerts, with the same
 * fingerprint, at most `ALERT_REPEAT_WINDOW_MS` apart. Alerts caught before ids carried one are
 * known by the bank, the amount and the same instant to the millisecond (a notification's own
 * delivery time, which a second run of the automation hands over unchanged); a time on the whole
 * minute is only what the alert printed, which two payments can share.
 */
export function repeatsAlert(incoming: AlertSighting, seen: AlertSighting): boolean {
  if (incoming.source !== 'alert' || seen.source !== 'alert') return false;
  const a = Date.parse(incoming.at);
  const b = Date.parse(seen.at);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  const key = heardKeyOf(incoming.id);
  if (key !== null && key === heardKeyOf(seen.id)) return Math.abs(a - b) <= ALERT_REPEAT_WINDOW_MS;
  const bank = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();
  const amounts =
    incoming.amount === null ||
    incoming.amount === undefined ||
    seen.amount === null ||
    seen.amount === undefined ||
    incoming.amount === seen.amount;
  return a === b && a % 60_000 !== 0 && bank(incoming.detail) === bank(seen.detail) && amounts;
}
