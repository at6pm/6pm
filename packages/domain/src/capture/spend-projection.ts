import type { SpendSource, SpendStatus } from '../spend/spend';
import { namesNoPayee } from './payee-names';
import { channelOfSource, type SightingAtKind, type SightingChannel } from './sighting';
import { foldWords } from './spoken-spend';

/**
 * A spend is a projection of its sightings: each field comes from the witness best placed to know
 * it. The amount from the bank (what actually left the account), the name from the shop or the
 * person, the time from the most exact kind of time. What the person typed always wins over what
 * was read, and a field the person changed on the row is never taken back by a later sighting.
 */

/** One sighting of a row, as the projection reads it. */
export interface SeenOnRow {
  /** Stable for this sighting (`sightingKey`): ties between equals are broken by it. */
  readonly key: string;
  readonly source: SpendSource;
  /** How it came; for a sighting kept before sightings said, its source's. */
  readonly channel?: SightingChannel | null | undefined;
  /** Who spoke; for a sighting kept before sightings said, its source's usual witness. */
  readonly witness?: 'bank' | 'wallet' | 'shop' | 'person' | null | undefined;
  /** In minor units of `currency`; absent when this witness gave none. */
  readonly amount?: number | null | undefined;
  readonly currency?: string | null | undefined;
  /** When this witness says it happened, ISO 8601. */
  readonly at: string;
  readonly atKind?: SightingAtKind | null | undefined;
  /** Who was paid, as this witness named them. */
  readonly payee?: string | null | undefined;
}

/** What the sightings together say the spend is; null for a field none of them gave. */
export interface Projection {
  /** In the home currency's minor units. */
  readonly amount: number | null;
  readonly payee: string | null;
  readonly at: string | null;
  /** The sighting each field came from. */
  readonly from: {
    readonly amount: string | null;
    readonly payee: string | null;
    readonly at: string | null;
  };
}

/** A sighting's key: the capture it came from, else its source and the instant it gives. */
export function sightingKey(s: {
  readonly captureId?: string | null | undefined;
  readonly source: SpendSource;
  readonly at: string;
}): string {
  return s.captureId ?? `${s.source}@${new Date(s.at).toISOString()}`;
}

/** Ways in where the person speaks: typed, said, or cash counted at the close. */
const TYPED: ReadonlySet<SightingChannel> = new Set(['typed', 'voice', 'cash']);

const channelOf = (s: SeenOnRow): SightingChannel => s.channel ?? channelOfSource(s.source);

/** Who speaks for a sighting that did not say: a bank's alert, a wallet's tap, a shop's mail. */
function witnessOf(s: SeenOnRow): NonNullable<SeenOnRow['witness']> {
  if (s.witness) return s.witness;
  switch (s.source) {
    case 'alert':
      return 'bank';
    case 'applePay':
      return 'wallet';
    case 'email':
    case 'shared':
      return 'shop';
    case 'manual':
    case 'voice':
    case 'cash':
    case 'qr':
    case 'import':
      return 'person';
  }
}

const typed = (s: SeenOnRow) => TYPED.has(channelOf(s));

/** The amount's witnesses, best first: the person's own word, the bank, the wallet, the shop. */
function amountRank(s: SeenOnRow): number {
  if (typed(s)) return 5;
  switch (witnessOf(s)) {
    case 'bank':
      return 4;
    case 'wallet':
      return 3;
    case 'shop':
      return 2;
    case 'person':
      return 1;
  }
}

/** Who names a payee best: the person, the shop, a wallet or a code scanned, a bank, its alert. */
function namerRank(s: SeenOnRow): number {
  if (typed(s)) return 5;
  switch (witnessOf(s)) {
    case 'shop':
      return 4;
    case 'wallet':
    case 'person':
      return 3;
    case 'bank':
      return channelOf(s) === 'alert' ? 1 : 2;
  }
}

/**
 * The name's witnesses, best first (`namerRank`). A name that says nothing about who was paid
 * ("CHUYEN TIEN", "Techcombank QR") is only a label, used when no sighting names anyone.
 */
function payeeRank(s: SeenOnRow): number {
  const name = s.payee?.trim() ?? '';
  if (name === '') return 0;
  return (namesNoPayee(name) ? 0 : 10) + namerRank(s);
}

/**
 * How exact a time is: one the person chose, printed in the message, the moment the phone was
 * handed it, the moment it was caught, a mail's sent date, unknown.
 */
function timeRank(s: SeenOnRow): number {
  if (typed(s) && !s.atKind) return 5;
  switch (s.atKind) {
    case 'printed':
      return 4;
    case 'delivered':
      return 3;
    case 'now':
      return 2;
    case 'sent':
      return 1;
    case null:
    case undefined:
      return 0;
  }
}

/** Written all in capitals, as a bank's card line prints a shop ("CLOUDFLARE"). */
const inCapitals = (name: string) => /\p{Lu}/u.test(name) && !/\p{Ll}/u.test(name);

/** Of two equals, the earlier said; of two said at once, the lower key. */
function earlier(a: SeenOnRow, b: SeenOnRow): number {
  const gap = Date.parse(a.at) - Date.parse(b.at);
  if (gap !== 0 && !Number.isNaN(gap)) return gap;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/** The best of some sightings by `rank` (above 0 only), ties broken by `tie`, then `earlier`. */
function best(
  seen: readonly SeenOnRow[],
  rank: (s: SeenOnRow) => number,
  tie: (a: SeenOnRow, b: SeenOnRow) => number = () => 0,
): SeenOnRow | null {
  let found: SeenOnRow | null = null;
  for (const s of seen) {
    if (rank(s) <= 0) continue;
    // Negative when `s` is the better of the two.
    const order = found === null ? -1 : rank(found) - rank(s) || tie(s, found) || earlier(s, found);
    if (order < 0) found = s;
  }
  return found;
}

/**
 * What a row's sightings say it is: the amount in the home currency from the best witness of it,
 * the name from the best witness of who was paid (a shop's own spelling over capitals between two
 * equals), the time from the most exact kind. Every choice is the same whatever order the
 * sightings arrived in.
 */
export function projectSpend(seen: readonly SeenOnRow[], home: string): Projection {
  const priced = (s: SeenOnRow) =>
    typeof s.amount === 'number' && s.amount > 0 && (s.currency ?? home) === home;
  const amount = best(seen, (s) => (priced(s) ? amountRank(s) : 0));
  const payee = best(
    seen,
    payeeRank,
    (a, b) => Number(inCapitals(a.payee ?? '')) - Number(inCapitals(b.payee ?? '')),
  );
  const at = best(seen, (s) => (Number.isNaN(Date.parse(s.at)) ? 0 : timeRank(s) + 1));
  return {
    amount: amount?.amount ?? null,
    payee: payee?.payee?.trim() ?? null,
    at: at ? new Date(at.at).toISOString() : null,
    from: { amount: amount?.key ?? null, payee: payee?.key ?? null, at: at?.key ?? null },
  };
}

const sameName = (a: string, b: string) => foldWords(a).trim() === foldWords(b).trim();

/** A row as a merge sees it. */
export interface RowAsSeen {
  readonly amount: number;
  readonly merchant: string;
  readonly at: string;
  readonly categoryId: string;
  readonly status: SpendStatus;
  /** Paid abroad: its home amount was priced at a rate, not said by a witness. */
  readonly foreignAmount?: unknown;
}

/** Whether the row's amount is one its sightings gave, or none at all: nobody changed it. */
function amountUnchanged(row: RowAsSeen, seen: readonly SeenOnRow[], home: string): boolean {
  const said = projectSpend(seen, home).amount;
  if (said === null) return row.amount <= 0 || row.foreignAmount != null;
  return (
    row.amount === said ||
    seen.some((s) => s.amount === row.amount && (s.currency ?? home) === home)
  );
}

/** Whether the row's name is one its sightings gave, or no name at all. */
function payeeUnchanged(row: RowAsSeen, seen: readonly SeenOnRow[]): boolean {
  if (row.merchant.trim() === '' || namesNoPayee(row.merchant)) return true;
  return seen.some((s) => s.payee != null && sameName(s.payee, row.merchant));
}

/** Whether the row's time is one its sightings gave. */
function atUnchanged(row: RowAsSeen, seen: readonly SeenOnRow[]): boolean {
  const at = Date.parse(row.at);
  return seen.some((s) => Date.parse(s.at) === at);
}

/** What a row becomes from its sightings: each field the projection's, unless the person set it. */
export interface Reprojected {
  readonly amount: number;
  readonly merchant: string;
  readonly at: string;
  readonly categoryId: string;
  /** The name now comes from the sighting just added: its category comes with it. */
  readonly namedByIncoming: boolean;
}

/**
 * A row seen once more: each field becomes what all its sightings say (`projectSpend`), unless
 * the row's value is one no sighting gave (the person typed it, or named the payee before), which
 * stays. The category comes with a new name, unless the person already kept the spend. Merging
 * the same sightings in any order gives the same row.
 */
export function mergeProjected(
  row: RowAsSeen,
  before: readonly SeenOnRow[],
  incoming: SeenOnRow,
  incomingCategory: string,
  home: string,
): Reprojected {
  const after = projectSpend([...before, incoming], home);
  const was = before.find((s) => s.key === projectSpend(before, home).from.payee);
  const amount =
    amountUnchanged(row, before, home) && after.amount !== null ? after.amount : row.amount;
  const renamed = payeeUnchanged(row, before) && after.payee !== null;
  const merchant = renamed ? (after.payee ?? row.merchant) : row.merchant;
  // A name that says more brings its category; the same name better spelt keeps the row's.
  const namedByIncoming =
    renamed &&
    after.from.payee === incoming.key &&
    (was === undefined || payeeRank(incoming) > payeeRank(was));
  const at = atUnchanged(row, before) && after.at !== null ? after.at : row.at;
  return {
    amount,
    merchant,
    at,
    categoryId: namedByIncoming && row.status !== 'kept' ? incomingCategory : row.categoryId,
    namedByIncoming,
  };
}

/**
 * A row with one of its sightings taken away ("These are two"): each field the projection of the
 * sightings left, unless the person set it.
 */
export function splitProjected(
  row: RowAsSeen,
  before: readonly SeenOnRow[],
  leaving: string,
  home: string,
): Pick<Reprojected, 'amount' | 'merchant' | 'at'> {
  const left = before.filter((s) => s.key !== leaving);
  const now = projectSpend(left, home);
  return {
    amount: amountUnchanged(row, before, home) && now.amount !== null ? now.amount : row.amount,
    merchant: payeeUnchanged(row, before) && now.payee !== null ? now.payee : row.merchant,
    at: atUnchanged(row, before) && now.at !== null ? now.at : row.at,
  };
}
