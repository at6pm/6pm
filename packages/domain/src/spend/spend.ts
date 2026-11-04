import type { Vnd } from '../money/format';

/**
 * Where a spend came from. Shown on cards, rows and the source trail. `import` is history brought
 * in from another app's export: it is never counted, closed or asked about.
 */
export type SpendSource =
  'manual' | 'voice' | 'shared' | 'qr' | 'email' | 'applePay' | 'cash' | 'alert' | 'import';

/** Spending goes out; money that came in comes in (see `money-in.ts`). */
export type SpendDirection = 'out' | 'in';

/**
 * Where a spend is in its life:
 * - `caught`: arrived on its own and waits for the close,
 * - `pending`: a QR handed off to a bank app, not yet confirmed as paid,
 * - `kept`: confirmed by the user,
 * - `skipped`: "Not mine" — stays visible, struck through, never counted,
 * - `deleted`: removed; kept briefly so it can be undone.
 */
export type SpendStatus = 'caught' | 'pending' | 'kept' | 'skipped' | 'deleted';

/** The fields the daily number reads. Storage rows carry more. */
export interface CountedSpend {
  readonly amount: Vnd;
  readonly category: string;
  readonly status: SpendStatus;
  /** Marked "for work" in the close: moves to Claim back, out of the daily number. */
  readonly forWork?: boolean;
  /** Paid a bill (its id) or a card or loan with none: the bill already came off the plan. */
  readonly paysBill?: string | null | undefined;
  /** `in` for money that came in: never spending, whatever its status. */
  readonly direction?: SpendDirection | null | undefined;
  /** The jar this spend came out of (its id), as chosen in Details, Quick add or the close (M13). */
  readonly fromPot?: string | null | undefined;
  /**
   * How much of `amount` the jar covered: what it held when the spend was taken from it, at most
   * the spend. Null or absent with a jar set means the whole spend.
   */
  readonly fromPotAmount?: Vnd | null | undefined;
}

/**
 * Whether a spend lowers the daily number. Caught and pending spends count until the user says
 * otherwise, so the number never flatters the day; skipped, deleted and work spends never count,
 * nor does money that came in (it is added to free money once kept, see `money-in.ts`),
 * nor does paying a bill (the bill came off the plan already), nor categories the user marked as
 * not daily.
 */
export function countsTowardDay(spend: CountedSpend, notDaily: ReadonlySet<string>): boolean {
  if (spend.direction === 'in') return false;
  if (spend.status === 'skipped' || spend.status === 'deleted') return false;
  if (spend.forWork === true) return false;
  if (spend.paysBill != null) return false;
  return !notDaily.has(spend.category);
}

/**
 * What a spend adds to spending in history: the Diary, the week recap, insights, Ask, the CSV, the
 * year book and the close receipt's lines. A spend from a jar is spending like any other, in full;
 * only the jar's part stays out of the daily number (`dayPartOf`).
 */
export function sumCounted(spends: readonly CountedSpend[], notDaily: ReadonlySet<string>): Vnd {
  let total = 0;
  for (const spend of spends) if (countsTowardDay(spend, notDaily)) total += spend.amount;
  return total;
}

/**
 * The part of a spend its jar covered (M13): nothing when it is not spending or came from no jar,
 * never more than the spend, never below zero.
 */
export function jarPartOf(spend: CountedSpend, notDaily: ReadonlySet<string>): Vnd {
  if (spend.fromPot == null || !countsTowardDay(spend, notDaily)) return 0;
  const covered = spend.fromPotAmount ?? spend.amount;
  return Math.max(0, Math.min(spend.amount, Number.isFinite(covered) ? Math.round(covered) : 0));
}

/**
 * The part of a spend that lowers the daily number: its spending less what its jar covered. This
 * and `jarPartOf` always add up to what `sumCounted` counts for it.
 */
export function dayPartOf(spend: CountedSpend, notDaily: ReadonlySet<string>): Vnd {
  return countsTowardDay(spend, notDaily) ? spend.amount - jarPartOf(spend, notDaily) : 0;
}

/** The daily number's spending: every spend's day part. */
export function sumDayPart(spends: readonly CountedSpend[], notDaily: ReadonlySet<string>): Vnd {
  let total = 0;
  for (const spend of spends) total += dayPartOf(spend, notDaily);
  return total;
}

/**
 * What a jar covers of a spend taken from it: all of it when the jar holds enough, else what the
 * jar holds; the rest counts today (M13). A jar never goes below zero.
 */
export function jarCover(amount: Vnd, held: Vnd): Vnd {
  return Math.max(0, Math.min(Math.round(amount), Math.round(held)));
}

/** Spends the close walks through: everything still waiting for a yes. */
export function needsReview(spend: { readonly status: SpendStatus }): boolean {
  return spend.status === 'caught' || spend.status === 'pending';
}
