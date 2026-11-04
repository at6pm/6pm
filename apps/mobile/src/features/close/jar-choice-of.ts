import { jarChoice, type JarChoice, type SpendRow } from '@6pm/domain';

import { dailyInputOf, type MoneySnapshot } from '../../data/money-store';

/** A spend as the jar question reads it: one already kept, or one being typed in Quick add. */
export type ChoiceSpend = Pick<
  SpendRow,
  'amount' | 'categoryId' | 'day' | 'status' | 'forWork' | 'paysBill' | 'direction'
> &
  Partial<Pick<SpendRow, 'id' | 'fromPot' | 'fromPotAmount'>>;

/**
 * What taking a spend from a jar would do to today and tomorrow, from the snapshot: the spend is
 * left out of the day's number and put back three ways by the domain (`jarChoice`). The jar
 * holds what it holds now plus this spend's own earlier part, as `takeFromJar` counts it.
 */
export function jarChoiceOf(
  snap: MoneySnapshot,
  spend: ChoiceSpend,
  jarId: string,
): JarChoice | null {
  const others =
    spend.id === undefined ? snap.cycleSpends : snap.cycleSpends.filter((s) => s.id !== spend.id);
  const without = dailyInputOf({ ...snap, cycleSpends: others });
  if (without === null) return null;
  const own = spend.fromPot === jarId ? (spend.fromPotAmount ?? spend.amount) : 0;
  const held = (snap.potSaved[jarId] ?? 0) + own;
  const place =
    spend.day === snap.today ? 'today' : spend.day >= snap.cycle.start ? 'earlier' : 'outside';
  return jarChoice(
    without,
    {
      amount: spend.amount,
      category: spend.categoryId,
      status: spend.status,
      forWork: spend.forWork,
      paysBill: spend.paysBill,
      direction: spend.direction,
    },
    held,
    place,
  );
}
