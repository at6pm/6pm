import { describe, expect, it } from 'vitest';

import { dailyNumber, type DailyNumberInput } from './daily-number';
import { lineWithTopUp, nextSetAsideWith } from './jar-add';
import { payCycleOn, type Payday } from './pay-cycle';
import { dueSetAsides, occasionsOf, potTotals, type PotMove } from './pots';

const lastDay: Payday = { kind: 'lastDay' };
const today = '2026-10-11';
const cycle = payCycleOn(today, lastDay);
const dayOf = (instant: string) => instant.slice(0, 10);

const wedding = {
  id: 'wedding',
  kind: 'occasion' as const,
  goal: 50_000_000,
  neededBy: '2027-08',
  monthly: null,
  share: null,
  paused: false,
  createdAt: '2026-10-11T03:00:00.000Z',
};

/** The cycle's set-aside, recorded the moment the jar started, as the phone does. */
const started: PotMove[] = dueSetAsides({
  pots: [wedding],
  moves: [],
  futureYou: 0,
  payday: lastDay,
  today,
  dayOf,
}).map((d) => ({ ...d, kind: 'setAside' }));

/** Today's number from the moves, with this cycle's set-aside already written. */
function inputOf(moves: readonly PotMove[]): DailyNumberInput {
  const totals = potTotals(moves, new Set(['wedding']), cycle.start);
  return {
    plan: {
      income: 40_000_000,
      bills: 5_000_000,
      futureYou: 0,
      occasions: occasionsOf([wedding], totals.setAside),
      topUps: totals.topUps,
    },
    spentBefore: 0,
    today: [],
    notDaily: new Set(),
    daysLeft: 20,
  };
}

const add = (kind: 'topUp' | 'opening', amount: number): PotMove => ({
  potId: 'wedding',
  kind,
  cycle: cycle.start,
  amount,
});

describe('adding to a jar from this month’s money', () => {
  it('lowers today’s number by the top-up, as the line under the keypad says', () => {
    const before = dailyNumber(inputOf(started)).line;
    const after = dailyNumber(inputOf([...started, add('topUp', 2_100_000)])).line;
    expect(after).toBeLessThan(before);
    expect(lineWithTopUp(inputOf(started), 2_100_000)).toBe(after);
    expect(lineWithTopUp(inputOf(started), 0)).toBe(before);
  });
});

describe('adding money already saved', () => {
  it('leaves today’s number and this cycle’s set-aside alone', () => {
    const before = dailyNumber(inputOf(started));
    const moves = [...started, add('opening', 10_000_000)];
    expect(dailyNumber(inputOf(moves))).toEqual(before);
    expect(potTotals(moves, new Set(['wedding']), cycle.start).topUps).toBe(0);
    // A second launch finds this cycle written and writes nothing over it.
    expect(
      dueSetAsides({ pots: [wedding], moves, futureYou: 0, payday: lastDay, today, dayOf }),
    ).toEqual([]);
  });

  it('counts in what the jar holds, so the next payday takes less from a dated jar', () => {
    const effect = nextSetAsideWith({
      pot: wedding,
      moves: started,
      cycle,
      payday: lastDay,
      amount: 10_000_000,
    });
    // 5tr went in this cycle: 45tr left over 9 months is 5tr; with 10tr more, 35tr is 3.9tr.
    expect(effect).toEqual({ before: 5_000_000, after: 3_900_000 });
    const later = dueSetAsides({
      pots: [wedding],
      moves: [...started, add('opening', 10_000_000)],
      futureYou: 0,
      payday: lastDay,
      today: '2026-11-02',
      dayOf,
    });
    expect(later.map((d) => d.amount)).toEqual([effect?.after]);
  });

  it('has no payday effect on a jar filled by hand, Future you or a 2.1 goal', () => {
    const base = { moves: started, cycle, payday: lastDay, amount: 1_000_000 };
    const byHand = { ...wedding, id: 'hand', neededBy: null, monthly: null };
    const goal = { ...wedding, id: 'old', kind: 'goal' as const, neededBy: null, share: 0.5 };
    expect(nextSetAsideWith({ ...base, pot: byHand })).toBeNull();
    expect(nextSetAsideWith({ ...base, pot: goal })).toBeNull();
    expect(nextSetAsideWith({ ...base, pot: { ...goal, id: 'futureYou' } })).toBeNull();
  });

  it('caps a steady jar at its target', () => {
    const steady = {
      ...wedding,
      id: 'steady',
      goal: 6_000_000,
      neededBy: null,
      monthly: 2_000_000,
    };
    const moves: PotMove[] = [
      { potId: 'steady', kind: 'opening', cycle: cycle.start, amount: 3_000_000 },
    ];
    expect(
      nextSetAsideWith({ pot: steady, moves, cycle, payday: lastDay, amount: 2_000_000 }),
    ).toEqual({ before: 2_000_000, after: 1_000_000 });
  });
});
