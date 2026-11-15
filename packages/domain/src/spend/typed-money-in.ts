import { merchantKeyOf } from '../capture/merchant-rule';
import type { MerchantRuleRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import type { Income } from '../plan/incomes';
import { coverDays } from '../plan/landed';
import type { Payday } from '../plan/pay-cycle';
import { addDays, type LocalDate } from '../time/local-date';
import { incomeMatchOf, rememberedPlaceOf, type RememberedPlace } from './income-pay';

/**
 * Where money typed into Quick add's "Got paid" goes the moment it is kept: it never waits for the
 * close. `asLastTime` says it follows what the sender's money did before.
 */
export type TypedMoneyIn =
  | { readonly moneyIn: 'pay'; readonly incomeId: string; readonly asLastTime: boolean }
  | { readonly moneyIn: 'saved'; readonly savedTo: string; readonly asLastTime: true }
  | { readonly moneyIn: 'spread'; readonly asLastTime: boolean };

/**
 * The place for money typed in by hand: the pay the person said it is (`expected`); else a
 * remembered sender's place as last time (`remembered`,
 * from `rememberedPlaceOf`); else what `incomeMatchOf` makes of it (the pay of the counted income
 * it looks like, or a landing when nothing is counted on); else ordinary money in, spread over
 * the days.
 */
export function typedMoneyIn(
  money: { readonly day: LocalDate; readonly amount: Vnd },
  context: {
    readonly remembered: RememberedPlace | null;
    /** The plan's incomes, once it holds them. */
    readonly incomes?: readonly Income[] | undefined;
    readonly anchor: Payday;
    /** The income the person said this is the pay of (the close's "It landed"), if they did. */
    readonly expected?: string | null | undefined;
  },
): TypedMoneyIn {
  const { remembered, expected } = context;
  if (expected != null && (context.incomes ?? []).some((income) => income.id === expected)) {
    return { moneyIn: 'pay', incomeId: expected, asLastTime: false };
  }
  if (remembered !== null) {
    if (remembered.moneyIn === 'pay' && remembered.incomeId !== null) {
      return { moneyIn: 'pay', incomeId: remembered.incomeId, asLastTime: true };
    }
    if (remembered.moneyIn === 'saved' && remembered.savedTo !== null) {
      return { moneyIn: 'saved', savedTo: remembered.savedTo, asLastTime: true };
    }
    return { moneyIn: 'spread', asLastTime: true };
  }
  const match = incomeMatchOf(money, context.incomes, context.anchor);
  return match.kind === 'spread'
    ? { moneyIn: 'spread', asLastTime: false }
    : { moneyIn: 'pay', incomeId: match.incomeId, asLastTime: false };
}

/** A sender whose money was placed before, as Quick add's "Who from" offers it. */
export interface RememberedSender {
  readonly merchantKey: string;
  readonly merchant: string;
  /** Their money is work: the WORK stamp comes with them. */
  readonly work: boolean;
  readonly place: RememberedPlace;
}

/**
 * The senders "Who from" offers: every rule that remembers a place still usable
 * (`rememberedPlaceOf`), the one whose money came in most recently first (`lastIn`: the latest
 * time money in from each merchant key was seen), those never seen last, by name.
 */
export function rememberedSenders(
  rules: readonly MerchantRuleRow[],
  lastIn: ReadonlyMap<string, string>,
  live: { readonly jars: ReadonlySet<string>; readonly incomes: ReadonlySet<string> },
): RememberedSender[] {
  const senders: RememberedSender[] = [];
  for (const rule of rules) {
    const place = rememberedPlaceOf(rule, live);
    if (place === null) continue;
    senders.push({
      merchantKey: rule.merchantKey,
      merchant: rule.merchant,
      work: rule.work === true,
      place,
    });
  }
  return senders.sort((a, b) => {
    const x = lastIn.get(a.merchantKey) ?? '';
    const y = lastIn.get(b.merchantKey) ?? '';
    if (x !== y) return x < y ? 1 : -1;
    return a.merchant.localeCompare(b.merchant);
  });
}

/** The latest time money in came from each merchant key, from rows of merchant and time. */
export function lastMoneyIn(
  rows: readonly { readonly merchant: string; readonly at: string }[],
): Map<string, string> {
  const latest = new Map<string, string>();
  for (const row of rows) {
    const key = merchantKeyOf(row.merchant);
    if (key === '') continue;
    const seen = latest.get(key);
    if (seen === undefined || row.at > seen) latest.set(key, row.at);
  }
  return latest;
}

/** What money that lands adds, for someone whose day is at its cap: days, and the last of them. */
export interface LandingDays {
  readonly days: number;
  /** The last day the money now covers, at today's line. */
  readonly to: LocalDate;
}

/**
 * For money that only lands, once the day's line is at its cap (`lineCap`), more money cannot
 * raise the line: it adds days instead. They are the days the pool covers with the money
 * (`coverDays`) less those it covered without, walking the coming bills and jars on their days.
 * Null when the line is below its cap (or has none), when nothing is added, or with no line.
 */
export function landingDays(
  input: Parameters<typeof coverDays>[0] & {
    readonly amount: Vnd;
    /** The most a day's line can be; null for no cap. */
    readonly cap: Vnd | null;
  },
): LandingDays | null {
  const { amount, cap, ...cover } = input;
  if (cap === null || amount <= 0 || cover.line < cap) return null;
  const before = coverDays(cover);
  const after = coverDays({ ...cover, pool: cover.pool + amount });
  if (before === null || after === null || after <= before) return null;
  return { days: after - before, to: addDays(cover.day, after - 1) };
}
