import type { SpendDirection, SpendSource, SpendStatus } from '../spend/spend';
import { foldWords } from './spoken-spend';

/** Two sightings of one payment arrive within this long of each other. */
export const DUPLICATE_WINDOW_MS = 3 * 60_000;

/**
 * A QR scan still waiting to be paid is matched by its bank's receipt (email, shared receipt,
 * Apple Pay) arriving up to this long after the tap: the user may finish paying in the bank app a
 * while later. Never before the tap.
 */
export const QR_RECEIPT_WINDOW_MS = 20 * 60_000;

/**
 * A notice of a payment (the bank's email or its alert) is written after the money moved and can
 * reach the phone late: a bank's email is often sent minutes after the transfer, and when it prints
 * no time it is dated when it was sent. It is matched with another sighting of the payment up to
 * this long after it, and up to `DUPLICATE_WINDOW_MS` before it.
 */
export const NOTICE_LATE_WINDOW_MS = 15 * 60_000;

/**
 * Two sightings a fee apart are one payment: a bank's debit can carry a small charge the shop's
 * or the other bank's figure leaves out (32.000₫ and 32.300₫). At most this share of the larger
 * amount, rounded down to the đồng; two coffees of 45.000₫ and 46.000₫ are two coffees.
 */
export const FEE_SLACK_RATIO = 0.01;

/**
 * A charge abroad seen twice: the bank's alert debits it in the home currency, the shop's receipt
 * prints it in its own, priced here at the day's rate. The two differ by the bank's foreign fee and
 * its spread (about 2–3% at Vietnamese banks), so they are one payment at most this share apart,
 * and only when both name the same payee.
 */
export const FX_SLACK_RATIO = 0.05;

/**
 * Sources 6pm hears about a payment from. Two of these seeing one payment are two witnesses of it;
 * something the user typed (Quick add, voice, cash) is a spend they chose to record, never a
 * second sighting of a capture.
 */
const OBSERVED: ReadonlySet<SpendSource> = new Set(['qr', 'shared', 'email', 'applePay', 'alert']);

/** Sources that hear from the bank or the wallet once money has actually moved. */
const PAID: ReadonlySet<SpendSource> = new Set(['shared', 'email', 'applePay', 'alert']);

/** Sources that tell of a payment after it, by the bank's or the shop's own message. */
const NOTICE: ReadonlySet<SpendSource> = new Set(['email', 'alert']);

/**
 * One way a payment was seen: its source, and who told 6pm (an email's sender, an alert's bank or
 * wallet).
 */
export interface Witness {
  readonly source: SpendSource;
  readonly detail?: string | null | undefined;
}

export interface SightedSpend {
  readonly id: string;
  readonly amount: number;
  readonly source: SpendSource;
  readonly status: SpendStatus;
  /** When it happened, ISO 8601. */
  readonly at: string;
  /** Who told 6pm: for an email, the address it came from. */
  readonly detail?: string | null;
  /** The amount in the currency it was paid in, when that is not the home currency. */
  readonly foreignAmount?: ForeignSighting | null;
  /** `in` for money that came in; absent means spending. */
  readonly direction?: SpendDirection | null | undefined;
  /**
   * Every other way it was seen already (its trail of sightings), when it was merged: a payment
   * seen once by a source is never seen by that source again.
   */
  readonly seenBy?: readonly Witness[] | undefined;
  /** Who was paid, as captured; empty when the source named nobody. */
  readonly merchant?: string | null | undefined;
}

/** An amount paid in another currency, in its major units (99 for $99.00). */
export interface ForeignSighting {
  readonly currency: string;
  readonly amount: number;
}

export interface NewSighting {
  readonly amount: number;
  readonly source: SpendSource;
  readonly at: string;
  /** How the capture arrives; a scan arrives `pending`. Left out, it is not a waiting scan. */
  readonly status?: SpendStatus;
  /** Who told 6pm: for an email, the address it came from. */
  readonly detail?: string | null;
  readonly foreignAmount?: ForeignSighting | null;
  /** `in` for money that came in; absent means spending. */
  readonly direction?: SpendDirection | null | undefined;
  /** Who was paid, as captured; empty when the source named nobody. */
  readonly merchant?: string | null | undefined;
}

interface Sighting {
  readonly source: SpendSource;
  readonly status?: SpendStatus | undefined;
  readonly at: number;
}

/**
 * The same amount: in the currency it was paid in when both were paid abroad (one may still wait
 * for its rate, at 0 in the home currency), else in the home currency.
 */
function sameAmount(
  a: { readonly amount: number; readonly foreignAmount?: ForeignSighting | null | undefined },
  b: { readonly amount: number; readonly foreignAmount?: ForeignSighting | null | undefined },
): boolean {
  const x = a.foreignAmount;
  const y = b.foreignAmount;
  if (x && y) {
    return x.currency === y.currency && Math.round(x.amount * 100) === Math.round(y.amount * 100);
  }
  return a.amount > 0 && a.amount === b.amount;
}

type Amounts = {
  readonly amount: number;
  readonly foreignAmount?: ForeignSighting | null | undefined;
};

/** Home amounts a fee apart (`FEE_SLACK_RATIO`), neither paid abroad nor the same. */
function feeApart(a: Amounts, b: Amounts): boolean {
  if (a.foreignAmount || b.foreignAmount || !(a.amount > 0) || !(b.amount > 0)) return false;
  const gap = Math.abs(a.amount - b.amount);
  return gap > 0 && gap <= Math.floor(Math.max(a.amount, b.amount) * FEE_SLACK_RATIO);
}

/**
 * One amount paid abroad (priced in the home currency) and the other in the home currency only,
 * within `FX_SLACK_RATIO` of each other.
 */
function convertedApart(a: Amounts, b: Amounts): boolean {
  if (Boolean(a.foreignAmount) === Boolean(b.foreignAmount)) return false;
  if (!(a.amount > 0) || !(b.amount > 0)) return false;
  const gap = Math.abs(a.amount - b.amount);
  return gap <= Math.max(a.amount, b.amount) * FX_SLACK_RATIO;
}

/**
 * Whether a spend already saved can be the same payment as an amount just captured: the same
 * amount, a fee apart, or paid abroad (matched by the amount in its own currency).
 */
export function mayBeSamePayment(existing: Amounts, amount: number): boolean {
  if (existing.foreignAmount) return true;
  return amount > 0 && (existing.amount === amount || feeApart(existing, { amount }));
}

/** Two names that can be one payee: either is unnamed, one holds the other, or they share a word. */
function namesAgree(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = foldWords(a ?? '').trim();
  const y = foldWords(b ?? '').trim();
  if (x === '' || y === '') return true;
  const [cx, cy] = [x.replace(/ /g, ''), y.replace(/ /g, '')];
  if (cx.includes(cy) || cy.includes(cx)) return true;
  const words = new Set(x.split(' ').filter((w) => w.length >= 4));
  return y.split(' ').some((w) => words.has(w));
}

/** Two emails from one named sender. */
function sameSender(a: Witness, b: Witness): boolean {
  if (a.source !== 'email' || b.source !== 'email' || !a.detail || !b.detail) return false;
  return a.detail.trim().toLowerCase() === b.detail.trim().toLowerCase();
}

/** Both name a payee, and the names agree: a looser amount needs a surer name. */
function namesMatch(
  a: { readonly merchant?: string | null | undefined },
  b: { readonly merchant?: string | null | undefined },
): boolean {
  return (
    Boolean(a.merchant?.trim()) && Boolean(b.merchant?.trim()) && namesAgree(a.merchant, b.merchant)
  );
}

/**
 * Two witnesses of one payment: different capture sources, two emails from different senders (the
 * bank's email and the shop's receipt for one order), or two alerts from different apps (the
 * wallet's and the bank's it drew the money from).
 */
function differentWitnesses(a: Witness, b: Witness): boolean {
  if (a.source !== b.source) return true;
  if (!NOTICE.has(a.source) || !a.detail || !b.detail) return false;
  return a.detail.trim().toLowerCase() !== b.detail.trim().toLowerCase();
}

/** A spend not yet seen by this witness: neither its first sighting nor any merged into it. */
function newWitness(spend: SightedSpend, incoming: Witness): boolean {
  return [spend, ...(spend.seenBy ?? [])].every((seen) => differentWitnesses(seen, incoming));
}

/** A scan still waiting and the bank's word that it was paid, from the tap to 20 minutes after. */
function paysWaitingScan(scan: Sighting, receipt: Sighting): boolean {
  if (scan.source !== 'qr' || scan.status !== 'pending' || !PAID.has(receipt.source)) return false;
  const after = receipt.at - scan.at;
  return after >= 0 && after <= QR_RECEIPT_WINDOW_MS;
}

/** A bank's notice of a payment, reaching 6pm up to fifteen minutes after another sighting of it. */
function noticeAfter(first: Sighting, notice: Sighting): boolean {
  if (!NOTICE.has(notice.source)) return false;
  const after = notice.at - first.at;
  return after >= 0 && after <= NOTICE_LATE_WINDOW_MS;
}

/** Whether two sightings from different capture sources are close enough to be one payment. */
function closeEnough(a: Sighting, b: Sighting): boolean {
  return (
    Math.abs(a.at - b.at) <= DUPLICATE_WINDOW_MS ||
    paysWaitingScan(a, b) ||
    paysWaitingScan(b, a) ||
    noticeAfter(a, b) ||
    noticeAfter(b, a)
  );
}

/**
 * The spend a new capture is the same payment as: same amount (in the currency paid, abroad), or
 * failing that a fee apart (`FEE_SLACK_RATIO`) when the names do not say two payees, a
 * different capture source (QR, shared receipt, email, Apple Pay, bank alert), an email from
 * another sender or an alert from another app, within three minutes (the nearest in time wins). A
 * QR scan still pending is also matched by a bank receipt, shared receipt, Apple Pay or alert from
 * its tap up to twenty minutes after it, never before; a bank's email or alert is matched up to
 * fifteen minutes after another sighting, since it is written after the payment. A payment already
 * seen by a witness (first, or merged in since) never absorbs another sighting from it: that is a
 * second payment, unless it sends the same amount stamped the same second (an invoice and its
 * confirmation). A charge abroad priced at the day's rate matches the bank's home-currency debit
 * of it within `FX_SLACK_RATIO` when both name the payee; an exact amount wins over a fee apart,
 * and a fee apart over a converted one. Skipped and deleted spends never absorb a capture. A
 * spend the user typed (Quick add, voice, cash) is never merged with anything: each was entered on
 * purpose, and no other source can have seen cash. Money in and money out of the same amount are
 * two movements, never one.
 */
export function findDuplicate(
  incoming: NewSighting,
  existing: readonly SightedSpend[],
): SightedSpend | null {
  const at = Date.parse(incoming.at);
  const foreign = incoming.foreignAmount;
  if (Number.isNaN(at) || (incoming.amount <= 0 && !(foreign && foreign.amount > 0))) return null;
  const arriving: Sighting = { source: incoming.source, status: incoming.status, at };
  let best: SightedSpend | null = null;
  let bestGap = Infinity;
  let nearFee: SightedSpend | null = null;
  let nearFeeGap = Infinity;
  let nearConverted: SightedSpend | null = null;
  let nearConvertedGap = Infinity;
  for (const spend of existing) {
    if (spend.status === 'skipped' || spend.status === 'deleted') continue;
    if ((spend.direction ?? 'out') !== (incoming.direction ?? 'out')) continue;
    if (!OBSERVED.has(spend.source) || !OBSERVED.has(incoming.source)) continue;
    const exact = sameAmount(spend, incoming);
    const seen: Sighting = { source: spend.source, status: spend.status, at: Date.parse(spend.at) };
    // A sender writing twice about one purchase (an invoice and its confirmation) sends the same
    // amount stamped the same second. Only a time to the second says so: a receipt that prints the
    // minute (13:30, read as 13:30:00) can be two orders in that minute.
    const echo = exact && seen.at === at && at % 60_000 !== 0 && sameSender(spend, incoming);
    if (!echo && !newWitness(spend, incoming)) continue;
    const fee =
      !exact && feeApart(spend, incoming) && namesAgree(spend.merchant, incoming.merchant);
    const converted =
      !exact && !fee && convertedApart(spend, incoming) && namesMatch(spend, incoming);
    if (!exact && !fee && !converted) continue;
    const gap = Math.abs(seen.at - at);
    if (!echo && !closeEnough(seen, arriving)) continue;
    if (exact && gap < bestGap) {
      best = spend;
      bestGap = gap;
    } else if (fee && gap < nearFeeGap) {
      nearFee = spend;
      nearFeeGap = gap;
    } else if (converted && gap < nearConvertedGap) {
      nearConverted = spend;
      nearConvertedGap = gap;
    }
  }
  return best ?? nearFee ?? nearConverted;
}

/** What a merged spend becomes: confirmed if either sighting was, otherwise as it was. */
export function mergedStatus(existing: SpendStatus, incoming: SpendStatus): SpendStatus {
  return existing === 'kept' || incoming === 'kept' ? 'kept' : existing;
}
