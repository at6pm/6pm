import type { Money as Vnd } from '../money/currency';
import { billsThisCycle, type CycleBill } from '../plan/bills';
import { dailyNumber, type DailyNumber, type DailyNumberInput } from '../plan/daily-number';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import { countsTowardDay, dayPartOf, jarCover, type CountedSpend } from '../spend/spend';
import { diffDays, type LocalDate } from '../time/local-date';

/**
 * Where a spend sits in the cycle's number: on today, on an earlier day of this cycle (counted
 * in what went before), or before the cycle (in no number of this cycle).
 */
export type SpendPlace = 'today' | 'earlier' | 'outside';

/** What taking a spend from a jar would do, for the close's "From your {jar}?" and Details. */
export interface JarChoice {
  /** What the jar takes of the spend: all of it, or what it holds (M13). */
  readonly cover: Vnd;
  /** What still counts on the day: the spend less the cover. */
  readonly rest: Vnd;
  /** What the jar holds once it has taken its part. */
  readonly heldAfter: Vnd;
  /** Today's number left with the spend from the jar ("Today stays 49.000₫"). */
  readonly todayStays: Vnd;
  /** Tomorrow's line as if the spend never counted: the jar took it all. */
  readonly tomorrowClear: Vnd;
  /** Tomorrow's line with the spend from the jar: only the rest counts. */
  readonly tomorrowFrom: Vnd;
  /** Tomorrow's line with the spend counted in full ("No, count it all"). */
  readonly tomorrowAll: Vnd;
}

/** A spend's cover is marked with any jar: the number only asks whether one is set. */
const SOME_JAR = 'jar';

/**
 * The close's question and Details' switch, worked out with the one engine. `without` is the day's
 * number input with this spend left out; the spend is put back in at its place three ways: from
 * the jar, counted in full, and not at all.
 */
export function jarChoice(
  without: DailyNumberInput,
  spend: CountedSpend,
  held: Vnd,
  place: SpendPlace,
): JarChoice {
  const plain: CountedSpend = { ...spend, fromPot: null, fromPotAmount: null };
  const cover = countsTowardDay(plain, without.notDaily) ? jarCover(spend.amount, held) : 0;
  const withSpend = (s: CountedSpend): DailyNumber =>
    place === 'today'
      ? dailyNumber({ ...without, today: [...without.today, s] })
      : place === 'earlier'
        ? dailyNumber({
            ...without,
            spentBefore: without.spentBefore + dayPartOf(s, without.notDaily),
          })
        : dailyNumber(without);
  const fromJar = withSpend({ ...plain, fromPot: SOME_JAR, fromPotAmount: cover });
  return {
    cover,
    rest: Math.max(0, spend.amount - cover),
    heldAfter: Math.max(0, Math.round(held) - cover),
    todayStays: fromJar.safe,
    tomorrowClear: dailyNumber(without).tomorrow,
    tomorrowFrom: fromJar.tomorrow,
    tomorrowAll: withSpend(plain).tomorrow,
  };
}

/** The ready moment's pill: each day from payday, while the jar takes its part and once it stops. */
export interface JarStopsLine {
  readonly before: Vnd;
  readonly after: Vnd;
}

/**
 * "From payday, each day 351k → 382k": the next cycle's line, split evenly over its days from
 * payday, with the jar still taking what it took this cycle and once it stops. Only a jar that
 * sets money aside out of free money moves the line; a 2.1 goal fills from Future you's slice
 * (`fromSlice`), which stays as it is, so its line does not move.
 */
export function jarStopsLine(input: {
  readonly today: LocalDate;
  readonly payday: Payday;
  readonly income: Vnd;
  readonly bills: readonly CycleBill[];
  readonly futureYou: Vnd;
  /** What the other jars (this one included) set aside out of free money this cycle. */
  readonly occasions: Vnd;
  /** What this jar set aside this cycle. */
  readonly took: Vnd;
  readonly fromSlice: boolean;
  readonly currency?: DailyNumberInput['currency'];
}): JarStopsLine {
  const cycle = payCycleOn(input.today, input.payday);
  const next = payCycleOn(cycle.payday, input.payday);
  const took = input.fromSlice ? 0 : Math.max(0, Math.min(input.took, input.occasions));
  const lineWith = (occasions: Vnd) =>
    dailyNumber({
      plan: {
        income: input.income,
        bills: billsThisCycle(input.bills, next),
        futureYou: input.futureYou,
        occasions,
        topUps: 0,
      },
      spentBefore: 0,
      today: [],
      notDaily: new Set(),
      daysLeft: next.daysLeft,
      ...(input.currency ? { currency: input.currency } : {}),
    }).line;
  return { before: lineWith(input.occasions), after: lineWith(input.occasions - took) };
}

/** How early a jar filled before its month: "three weeks early". */
export interface JarEarly {
  readonly unit: 'month' | 'week' | 'day';
  readonly count: number;
}

/**
 * How long before its month a dated jar filled, counted to the month's first day: whole months
 * from eight weeks (rounded), whole weeks from seven days, else days. Null for a jar with no date, or one
 * that filled in its month or after.
 */
export function jarEarly(today: LocalDate, neededBy: string | null): JarEarly | null {
  if (neededBy === null || !/^\d{4}-\d{2}$/.test(neededBy)) return null;
  const first = `${neededBy}-01`;
  const days = diffDays(first, today);
  if (days <= 0) return null;
  if (days >= 56) return { unit: 'month', count: Math.max(2, Math.round(days / 30)) };
  if (days >= 7) return { unit: 'week', count: Math.floor(days / 7) };
  return { unit: 'day', count: days };
}
