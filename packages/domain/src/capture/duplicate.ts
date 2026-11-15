import type { SpendDirection, SpendSource, SpendStatus } from '../spend/spend';
import type { SightingAtKind } from './sighting';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';
import { namesAgree, namesNoPayee } from './payee-names';
import { foldWords } from './spoken-spend';
import {
  WALLET_SHOP_WINDOW_MS,
  cardAbroadAndItsShop,
  toldBy,
  walletAndItsShop,
  type Told,
} from './witness-pairs';

export { namesNoPayee };

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
 * and only when both name the same payee. A card charged in đồng at a site registered abroad
 * carries the same fee, and is the same share apart from that site's own total
 * (`cardAbroadAndItsShop`).
 */
export const FX_SLACK_RATIO = 0.05;

/**
 * A charge abroad told of twice by notices from two witnesses (the card's bank and the shop's own
 * receipt) can be hours apart: a shop emails its receipt when it bills, a bank when the charge
 * posts. Two such notices with the same amount to the cent in the currency paid, both naming the
 * same payee, are one payment up to this long apart.
 */
export const ABROAD_NOTICE_WINDOW_MS = 6 * 60 * 60_000;

/**
 * A mail dated when it was sent, not when the money moved, is matched up to this long from another
 * sighting of the payment when the bank or the account agrees (`SightingAtKind` `sent`).
 */
export const SENT_WINDOW_MS = 6 * 60 * 60_000;

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
export interface Witness extends Keys {
  readonly source: SpendSource;
  readonly detail?: string | null | undefined;
  /** When this witness saw it, ISO 8601; the spend's own time when absent. */
  readonly at?: string | null | undefined;
}

/** What a sighting says besides its amount: what its time is, and the account it names. */
interface Keys {
  readonly atKind?: SightingAtKind | null | undefined;
  /** The bank or wallet holding the account, by its catalogue name. */
  readonly bank?: string | null | undefined;
  /** The last digits of the account. */
  readonly accountTail?: string | null | undefined;
}

export interface SightedSpend extends Keys {
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

export interface NewSighting extends Keys {
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

interface Sighting extends Keys {
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
 * Two home amounts a foreign fee apart (`FX_SLACK_RATIO`): a bank's card notice of a charge at a
 * site registered abroad and that site's own email, either way round (`cardAbroadAndItsShop`).
 * Two payments at home this far apart stay two.
 */
function chargedAbroadApart(a: Amounts & Told, b: Amounts & Told): boolean {
  if (a.foreignAmount || b.foreignAmount || !(a.amount > 0) || !(b.amount > 0)) return false;
  const gap = Math.abs(a.amount - b.amount);
  return (
    gap > 0 && gap <= Math.max(a.amount, b.amount) * FX_SLACK_RATIO && cardAbroadAndItsShop(a, b)
  );
}

/**
 * Whether a spend already saved can be the same payment as an amount just captured: the same
 * amount, a fee apart, or paid abroad (matched by the amount in its own currency); given who told
 * of the capture, also a card charged abroad and its site's own total (`chargedAbroadApart`).
 */
export function mayBeSamePayment(
  existing: Amounts & Partial<Told>,
  amount: number,
  told?: Told,
): boolean {
  if (existing.foreignAmount) return true;
  if (!(amount > 0)) return false;
  if (existing.amount === amount || feeApart(existing, { amount })) return true;
  return (
    told !== undefined &&
    existing.source !== undefined &&
    chargedAbroadApart({ ...existing, source: existing.source }, { ...told, amount })
  );
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

/** The bank (never a wallet) a notice came from: an email's sending domain, an alert's app. */
function bankOfNotice(witness: Witness): string | null {
  if (!NOTICE.has(witness.source) || !witness.detail) return null;
  const bank =
    witness.source === 'alert'
      ? bankOfApp(witness.detail)
      : bankNamedIn((witness.detail.split('@')[1] ?? '').replace(/[^a-z0-9]+/gi, ' '));
  return bank?.kind === 'bank' ? bank.id : null;
}

/**
 * Two banks each telling of money that left them, each naming who was paid, and the names are
 * not one payee's: a card charged at a shop and a transfer to someone else. One payment leaves
 * one bank, so these are two, however alike the amount and the minute. A wallet and the bank it
 * drew from, or a bank and the shop's own receipt, are not judged here: their names for one
 * payee can differ too much to compare.
 */
function twoBanksTwoPayees(spend: SightedSpend, incoming: NewSighting): boolean {
  const [a, b] = [bankOfNotice(spend), bankOfNotice(incoming)];
  if (a === null || b === null || a === b) return false;
  const [x, y] = [spend.merchant ?? '', incoming.merchant ?? ''];
  return !namesNoPayee(x) && !namesNoPayee(y) && !namesAgree(x, y);
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

/**
 * Two notices (emails or alerts) of one charge abroad: the same amount to the cent in the same
 * currency, and both name the payee and agree on it.
 */
function sameChargeAbroad(spend: SightedSpend, incoming: NewSighting): boolean {
  if (!spend.foreignAmount || !incoming.foreignAmount) return false;
  if (!NOTICE.has(spend.source) || !NOTICE.has(incoming.source)) return false;
  return sameAmount(spend, incoming) && namesMatch(spend, incoming);
}

const fold = (text: string | null | undefined) => foldWords(text ?? '').trim();

/** Two account tails that can be one account: one ends with the other ("456" and "3456"). */
function tailsAgree(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return true;
  return a.endsWith(b) || b.endsWith(a);
}

/** Both name the same bank, and any account tails they print agree. */
export function sameAccount(a: Keys, b: Keys): boolean {
  const [x, y] = [fold(a.bank), fold(b.bank)];
  return x !== '' && x === y && tailsAgree(a.accountTail, b.accountTail);
}

/** How strong a time is: printed or delivered beats one caught now, which beats a mail's sent date. */
const STRENGTH: Readonly<Record<SightingAtKind, number>> = {
  printed: 2,
  delivered: 2,
  now: 2,
  sent: 0,
};

/**
 * How far apart two sightings of one payment can be, set by the weaker of their times: a time
 * printed, delivered or caught now, three minutes; a mail's sent date, six hours when the bank or
 * the account agrees, else fifteen minutes. Null when either does not say what its time is: the
 * windows by source then apply.
 */
function windowOf(a: Sighting, b: Sighting): number | null {
  if (!a.atKind || !b.atKind) return null;
  const weaker = STRENGTH[a.atKind] <= STRENGTH[b.atKind] ? a.atKind : b.atKind;
  if (weaker !== 'sent') return DUPLICATE_WINDOW_MS;
  return sameAccount(a, b) ? SENT_WINDOW_MS : NOTICE_LATE_WINDOW_MS;
}

/** Whether two sightings from different capture sources are close enough to be one payment. */
function closeEnough(a: Sighting, b: Sighting): boolean {
  if (paysWaitingScan(a, b) || paysWaitingScan(b, a)) return true;
  const window = windowOf(a, b);
  if (window !== null) return Math.abs(a.at - b.at) <= window;
  return Math.abs(a.at - b.at) <= DUPLICATE_WINDOW_MS || noticeAfter(a, b) || noticeAfter(b, a);
}

/**
 * The nearest of a spend's sightings (its first, and each merged into it that says when) close
 * enough to the arriving one; Infinity when none is.
 */
function nearestClose(spend: SightedSpend, arriving: Sighting): number {
  const keys = (k: Keys) => ({ atKind: k.atKind, bank: k.bank, accountTail: k.accountTail });
  const seen: Sighting[] = [
    { source: spend.source, status: spend.status, at: Date.parse(spend.at), ...keys(spend) },
    ...(spend.seenBy ?? []).flatMap((w): Sighting[] => {
      const at = w.at ? Date.parse(w.at) : Number.NaN;
      return Number.isNaN(at) ? [] : [{ source: w.source, status: spend.status, at, ...keys(w) }];
    }),
  ];
  let nearest = Infinity;
  for (const one of seen) {
    if (Number.isNaN(one.at) || !closeEnough(one, arriving)) continue;
    nearest = Math.min(nearest, Math.abs(one.at - arriving.at));
  }
  return nearest;
}

/**
 * A wallet's or a card's notice and the receipt of the shop it names as paid, the same amount, up
 * to `WALLET_SHOP_WINDOW_MS` apart (`walletAndItsShop`), with nothing else of that amount told by
 * that payer or that shop that near the arriving sighting: with two, which is whose cannot be told.
 */
function walletPaidItsShop(
  spend: SightedSpend,
  incoming: NewSighting,
  existing: readonly SightedSpend[],
): boolean {
  const pair = walletAndItsShop(spend, incoming);
  if (pair === null) return false;
  const at = Date.parse(incoming.at);
  return !existing.some(
    (other) =>
      other.id !== spend.id &&
      other.status !== 'deleted' &&
      (other.direction ?? 'out') === (incoming.direction ?? 'out') &&
      sameAmount(other, incoming) &&
      Math.abs(Date.parse(other.at) - at) <= WALLET_SHOP_WINDOW_MS &&
      [other, ...(other.seenBy ?? [])].some((told) => toldBy(told, pair)),
  );
}

/**
 * How `findDuplicate` is loosened for a message that is not a second sighting of a payment but
 * tells what became of one: a failed charge may come from the witness that told of it, and the
 * other half of an own transfer goes the other way.
 */
export interface MatchRules {
  readonly anyWitness?: boolean;
  readonly anyDirection?: boolean;
}

/** A sighting's keys for matching by the bank's own code. */
export interface Referenced {
  readonly reference?: string | null | undefined;
  readonly direction?: SpendDirection | null | undefined;
  readonly bank?: string | null | undefined;
  readonly accountTail?: string | null | undefined;
}

/**
 * Two sightings carrying the same bank code for one account, the same way: one payment, however
 * far apart they arrive. A code alone is no key (two banks can print the same one), so both must
 * name the bank, and any account tails they print must agree.
 */
export function sameReference(a: Referenced, b: Referenced): boolean {
  const [x, y] = [
    (a.reference ?? '').trim().toUpperCase(),
    (b.reference ?? '').trim().toUpperCase(),
  ];
  if (x === '' || x !== y) return false;
  if ((a.direction ?? 'out') !== (b.direction ?? 'out')) return false;
  return sameAccount(a, b);
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
 * and a fee apart over a converted one. Two notices (emails or alerts) of a charge abroad, with
 * the same amount to the cent in the currency paid and the same payee named, are matched up to
 * `ABROAD_NOTICE_WINDOW_MS` apart, either way round. A wallet's or a card's notice and the receipt
 * of the shop it names, the same amount, are matched up to `WALLET_SHOP_WINDOW_MS` apart when
 * nothing else of that amount from that payer or shop is that near (`walletPaidItsShop`); a card
 * charged in đồng at a site abroad and that site's own total, a foreign fee apart
 * (`chargedAbroadApart`). Skipped and deleted spends never absorb a capture. A
 * spend the user typed (Quick add, voice, cash) is never merged with anything: each was entered on
 * purpose, and no other source can have seen cash. Money in and money out of the same amount are
 * two movements, never one; so are two banks' notices that each name a payee, when the names are
 * not one payee's (`twoBanksTwoPayees`).
 */
export function findDuplicate(
  incoming: NewSighting,
  existing: readonly SightedSpend[],
  rules: MatchRules = {},
): SightedSpend | null {
  const at = Date.parse(incoming.at);
  const foreign = incoming.foreignAmount;
  if (Number.isNaN(at) || (incoming.amount <= 0 && !(foreign && foreign.amount > 0))) return null;
  const arriving: Sighting = {
    source: incoming.source,
    status: incoming.status,
    at,
    atKind: incoming.atKind,
    bank: incoming.bank,
    accountTail: incoming.accountTail,
  };
  // Within each tier a spend whose payee agrees comes first, then the nearest in time.
  type Pick = { readonly spend: SightedSpend; readonly agrees: boolean; readonly gap: number };
  const better = (next: Pick, held: Pick | null) =>
    held === null ||
    (next.agrees && !held.agrees) ||
    (next.agrees === held.agrees && next.gap < held.gap);
  let best: Pick | null = null;
  let nearFee: Pick | null = null;
  let nearConverted: Pick | null = null;
  for (const spend of existing) {
    if (spend.status === 'skipped' || spend.status === 'deleted') continue;
    if (!rules.anyDirection && (spend.direction ?? 'out') !== (incoming.direction ?? 'out')) {
      continue;
    }
    if (!OBSERVED.has(spend.source) || !OBSERVED.has(incoming.source)) continue;
    const exact = sameAmount(spend, incoming);
    const seen: Sighting = { source: spend.source, status: spend.status, at: Date.parse(spend.at) };
    // A sender writing twice about one purchase (an invoice and its confirmation) sends the same
    // amount stamped the same second. Only a time to the second says so: a receipt that prints the
    // minute (13:30, read as 13:30:00) can be two orders in that minute.
    const echo = exact && seen.at === at && at % 60_000 !== 0 && sameSender(spend, incoming);
    if (!echo && !rules.anyWitness && !newWitness(spend, incoming)) continue;
    if (twoBanksTwoPayees(spend, incoming)) continue;
    // A message about what became of a payment (a failed charge, an own transfer) is matched by
    // the near rules only: a day apart or a fee abroad apart, it may be another payment's.
    const plain = !rules.anyWitness && !rules.anyDirection;
    const fee =
      !exact && feeApart(spend, incoming) && namesAgree(spend.merchant, incoming.merchant);
    const converted =
      !exact &&
      !fee &&
      ((convertedApart(spend, incoming) && namesMatch(spend, incoming)) ||
        (plain && chargedAbroadApart(spend, incoming)));
    if (!exact && !fee && !converted) continue;
    const first = Math.abs(seen.at - at);
    const abroad = exact && first <= ABROAD_NOTICE_WINDOW_MS && sameChargeAbroad(spend, incoming);
    const paidShop =
      plain &&
      exact &&
      first <= WALLET_SHOP_WINDOW_MS &&
      walletPaidItsShop(spend, incoming, existing);
    const close = nearestClose(spend, arriving);
    if (!echo && !abroad && !paidShop && close === Infinity) continue;
    const gap = close === Infinity ? first : close;
    const pick: Pick = { spend, agrees: namesMatch(spend, incoming), gap };
    if (exact) {
      if (better(pick, best)) best = pick;
    } else if (fee) {
      if (better(pick, nearFee)) nearFee = pick;
    } else if (better(pick, nearConverted)) {
      nearConverted = pick;
    }
  }
  return (best ?? nearFee ?? nearConverted)?.spend ?? null;
}

/** What a merged spend becomes: confirmed if either sighting was, otherwise as it was. */
export function mergedStatus(existing: SpendStatus, incoming: SpendStatus): SpendStatus {
  return existing === 'kept' || incoming === 'kept' ? 'kept' : existing;
}

/** How a sighting names a payment, and the category it filed it under. */
export interface Naming {
  readonly merchant: string;
  readonly categoryId: string;
  readonly source: SpendSource;
}

/**
 * How much a name says about who was paid: nothing, then a bank alert's (who a transfer went to,
 * or its memo), then any other source's (a receipt's, a shop's code, Wallet's, or the payee an
 * email's reader named).
 */
function nameWeight({ merchant, source }: Naming): number {
  if (namesNoPayee(merchant)) return 0;
  return source === 'alert' ? 1 : 2;
}

/** Written all in capitals, as a bank's card line prints a shop ("CLOUDFLARE"). */
function inCapitals(name: string): boolean {
  return /\p{Lu}/u.test(name) && !/\p{Ll}/u.test(name);
}

/**
 * What a payment seen a second way is called and filed under, whichever sighting came first: the
 * name that says most about who was paid (a named payee over a blank or a bank's or transfer's
 * label, any other source's name over a bank alert's), with the category that came with it,
 * unless the user already kept the spend. Between two names of one payee that say as much, the
 * shop's own spelling replaces a bank's capitals ("Cloudflare" for "CLOUDFLARE"), the category
 * kept.
 */
export function mergedNaming(
  existing: Naming & { readonly status: SpendStatus },
  incoming: Naming,
): { readonly merchant: string; readonly categoryId: string } {
  const named = incoming.merchant.trim();
  const before = nameWeight(existing);
  const after = nameWeight(incoming);
  if (after > before) {
    return {
      merchant: named,
      categoryId: existing.status === 'kept' ? existing.categoryId : incoming.categoryId,
    };
  }
  const respelt =
    after === before &&
    after > 0 &&
    inCapitals(existing.merchant) &&
    !inCapitals(named) &&
    namesAgree(existing.merchant, named);
  return { merchant: respelt ? named : existing.merchant, categoryId: existing.categoryId };
}
