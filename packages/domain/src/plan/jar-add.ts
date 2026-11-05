import { VND, type Currency } from '../money/currency';
import type { PotRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import { payCycleOn, type PayCycle, type Payday } from './pay-cycle';
import { jarFillOf, potSetAside, savedBefore, type PotMove } from './pots';

/**
 * Where money added on a jar's page comes from (M4): this pay cycle's free money (a top-up, which
 * lowers today's number), or money already saved before (in the bank, from before 6pm), which
 * counts in what the jar holds and never in this cycle's top-ups, so today's number stays.
 */
export type JarAddFrom = 'cycle' | 'saved';

/** Today's line (Today's "of 351k") with `amount` more topped up into jars this cycle. */
export function lineWithTopUp(input: DailyNumberInput, amount: Vnd): Vnd {
  return dailyNumber({
    ...input,
    plan: { ...input.plan, topUps: input.plan.topUps + Math.max(0, Math.round(amount)) },
  }).line;
}

/**
 * What a jar takes on the next payday, before and after `amount` more goes in now (from either
 * place: both count in what it holds by then). This cycle's set-aside is left as it was, so the
 * change starts from the next set-aside on. Null for a jar whose payday share does not follow what
 * it holds: Future you's jar, a 2.1 goal, a jar filled by hand.
 */
export function nextSetAsideWith(input: {
  readonly pot: Pick<PotRow, 'id' | 'kind' | 'goal' | 'neededBy' | 'monthly' | 'share' | 'paused'>;
  readonly moves: readonly PotMove[];
  readonly cycle: PayCycle;
  readonly payday: Payday;
  readonly amount: Vnd;
  readonly currency?: Currency;
}): { readonly before: Vnd; readonly after: Vnd } | null {
  const { pot, moves, cycle, payday, currency = VND } = input;
  const fill = jarFillOf(pot);
  if (fill !== 'date' && fill !== 'steady') return null;
  const next = payCycleOn(cycle.payday, payday);
  if (next.start <= cycle.start) return null;
  const held = savedBefore(moves, pot.id, next.start);
  const take = (have: Vnd) =>
    potSetAside({ pot, savedBefore: have, futureYou: 0, cycle: next, currency });
  return { before: take(held), after: take(held + Math.max(0, Math.round(input.amount))) };
}
