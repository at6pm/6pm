import {
  deletedJarsKeep,
  jarPartOf,
  jarSpendMoves,
  potTotals,
  type PotMove,
  type SpendRow,
} from '@6pm/domain';

import type { MoneySnapshot } from './money-store';

/** The fields a snapshot's jar totals are worked out from, on every publish. */
type JarTotals = Pick<
  MoneySnapshot,
  'potSaved' | 'topUpsThisCycle' | 'setAsideThisCycle' | 'potSpentThisCycle' | 'deletedJarsKept'
>;

/** The categories whose spending stays out of the daily number. */
export function notDailyOf(snapshot: Pick<MoneySnapshot, 'categories'>): Set<string> {
  return new Set(snapshot.categories.filter((c) => !c.countsDaily).map((c) => c.id));
}

/** A spend as the daily number counts it, with its day. */
export const countedOf = (s: SpendRow) => ({
  amount: s.amount,
  category: s.categoryId,
  status: s.status,
  forWork: s.forWork,
  paysBill: s.paysBill,
  direction: s.direction,
  fromPot: s.fromPot,
  fromPotAmount: s.fromPotAmount,
  day: s.day,
});

/**
 * What every jar holds, sets aside and gave this cycle, from the stored moves and the spends taken
 * from jars. Worked out again whenever a snapshot is published, so a spend marked "From a jar",
 * edited, skipped or undone moves its jar at once.
 */
export function jarTotalsOf(
  snapshot: Omit<MoneySnapshot, keyof JarTotals> & Partial<JarTotals>,
): JarTotals {
  const payday = snapshot.plan?.payday ?? { kind: 'lastDay' as const };
  const notDaily = notDailyOf(snapshot);
  const spends = [...snapshot.earlierJarSpends, ...snapshot.cycleSpends].map(countedOf);
  const spent = jarSpendMoves(spends, payday, notDaily);
  const totals = potTotals(
    [...snapshot.potMoves, ...spent],
    new Set(snapshot.pots.map((p) => p.id)),
    snapshot.cycle.start,
  );
  const covered = (potId: string) =>
    snapshot.cycleSpends
      .filter((s) => s.fromPot === potId)
      .reduce((sum, s) => sum + jarPartOf(countedOf(s), notDaily), 0);
  const deleted = snapshot.deletedPots.map((pot) => {
    const thisCycle = snapshot.potMoves.filter(
      (m) => m.potId === pot.id && m.cycle === snapshot.cycle.start,
    );
    const of = (kind: PotMove['kind']) =>
      thisCycle.filter((m) => m.kind === kind).reduce((sum, m) => sum + m.amount, 0);
    return {
      setAside: pot.kind === 'occasion' ? of('setAside') : 0,
      topUps: of('topUp'),
      covered: covered(pot.id),
    };
  });
  return {
    potSaved: totals.saved,
    topUpsThisCycle: totals.topUps + snapshot.togetherThisCycle,
    setAsideThisCycle: totals.setAside,
    potSpentThisCycle: totals.spent,
    deletedJarsKept: deletedJarsKeep(deleted),
  };
}
