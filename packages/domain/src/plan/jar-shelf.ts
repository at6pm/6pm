import { designAmount, floorToStep, VND, type Currency } from '../money/currency';
import type { PotRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import { cycleMonth, type PayCycle } from './pay-cycle';
import { addMonthsTo } from './plan-river';
import { FUTURE_YOU_POT_ID, isLegacyGoal, jarFillOf } from './pots';
import { whatIfRange } from './what-if';

type JarTerms = Pick<PotRow, 'id' | 'kind' | 'neededBy' | 'monthly'>;

/**
 * What each jar takes each payday, as the shelf, Pots and a jar's page say it: Future you's jar
 * the slice less what the 2.1 goals still take of it, every other jar what it set aside this
 * cycle, and a jar filled by hand nothing. Added up they are `intoJarsEachPayday`.
 */
export function jarsEachPayday(input: {
  readonly pots: readonly JarTerms[];
  readonly setAside: Readonly<Record<string, Vnd>>;
  /** Future you's slice as this cycle counts it (`cycleFutureYou`). */
  readonly slice: Vnd;
}): Record<string, Vnd> {
  const { pots, setAside } = input;
  const goals = pots.reduce((sum, p) => (isLegacyGoal(p) ? sum + (setAside[p.id] ?? 0) : sum), 0);
  const out: Record<string, Vnd> = {};
  for (const pot of pots) {
    const fill = jarFillOf(pot);
    out[pot.id] =
      fill === 'futureYou'
        ? Math.max(0, input.slice - goals)
        : fill === 'byHand'
          ? 0
          : Math.max(0, setAside[pot.id] ?? 0);
  }
  return out;
}

/** What a jar shows beyond its fill (Pots canvas, edge states). */
export type JarShelfState = 'normal' | 'paused' | 'pastDate' | 'full' | 'empty';

/**
 * A jar's edge state: paused (Future you with no slice this month, or a jar paused), full (it has
 * a target and holds it), spent to empty (it holds nothing and spends were taken from it), past
 * its date before it filled, or none of these.
 */
export function jarShelfState(input: {
  readonly pot: Pick<PotRow, 'id' | 'goal' | 'neededBy' | 'paused'>;
  readonly saved: Vnd;
  /** Future you's slice in the plan. */
  readonly futureYou: Vnd;
  readonly cycle: PayCycle;
  /** Spends were ever taken from the jar. */
  readonly spentFrom: boolean;
}): JarShelfState {
  const { pot, saved } = input;
  if (pot.id === FUTURE_YOU_POT_ID ? input.futureYou <= 0 : pot.paused) return 'paused';
  if (pot.goal > 0 && saved >= pot.goal) return 'full';
  if (saved <= 0 && input.spentFrom) return 'empty';
  if (pot.neededBy !== null && cycleMonth(input.cycle) > pot.neededBy) return 'pastDate';
  return 'normal';
}

/**
 * Today's line (Today's "of 351k") with Future you's slice at `candidate`: what the what-if on
 * Future you's jar shows as the thumb moves. A cycle that starts Future you at payday is unmoved.
 */
export function lineWithFutureYou(input: DailyNumberInput, candidate: Vnd): Vnd {
  if (input.futureYouSkipped === true) return dailyNumber(input).line;
  return dailyNumber({ ...input, plan: { ...input.plan, futureYou: Math.max(0, candidate) } }).line;
}

/**
 * Today's line with `extra` more set aside into jars this cycle (less when negative): what a new
 * jar, or a change to how one fills, does to the day, since a jar's first set-aside is recorded
 * the moment it starts.
 */
export function lineWithSetAside(input: DailyNumberInput, extra: Vnd): Vnd {
  return dailyNumber({
    ...input,
    plan: { ...input.plan, occasions: Math.max(0, input.plan.occasions + extra) },
  }).line;
}

/** Future you's slice as a whole percent of the plan's income ("12% of each pay"); 0 with none. */
export function sliceShareOf(futureYou: Vnd, income: Vnd): number {
  if (!(income > 0) || !(futureYou > 0)) return 0;
  return Math.round((futureYou / income) * 100);
}

/** The design's slice when Future you is resumed: 12% of each pay. */
const RESUME_SHARE = 0.12;

/**
 * What "Resume" puts back into Future you's jar after a month with none: 12% of the income,
 * floored to a what-if notch and never less than one notch.
 */
export function futureYouResume(income: Vnd, currency: Currency = VND): Vnd {
  const { step } = whatIfRange(income, 0, currency);
  const want = income > 0 ? income * RESUME_SHARE : designAmount(2_100_000, currency);
  return Math.max(step, Math.floor(want / step) * step);
}

/** The months New jar offers for "By a date": the `count` months after the cycle's own. */
export function newJarMonths(cycle: PayCycle, count: number): string[] {
  const from = cycleMonth(cycle);
  return Array.from({ length: Math.max(0, count) }, (_, i) => addMonthsTo(from, i + 1));
}

/** New jar's steady amounts for "Each payday": the design's 200k, 500k, 1tr and 2tr, by value. */
export function steadyChoices(currency: Currency = VND): Vnd[] {
  return [200_000, 500_000, 1_000_000, 2_000_000].map((d) =>
    currency.code === 'VND'
      ? d
      : Math.max(currency.step, floorToStep(designAmount(d, currency), currency)),
  );
}
