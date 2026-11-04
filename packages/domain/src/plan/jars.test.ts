import { describe, expect, it } from 'vitest';

import { VND, currencyOf } from '../money/currency';
import { dayPartOf, jarCover, jarPartOf, sumCounted, sumDayPart } from '../spend/spend';
import type { CountedSpend } from '../spend/spend';
import { dailyNumber, type MonthPlan } from './daily-number';
import { deletedJarsKeep, jarSpendMoves } from './jar-spending';
import { hasTet, jarPresets } from './jar-presets';
import { payCycleOn, type Payday } from './pay-cycle';
import {
  dueSetAsides,
  FUTURE_YOU_POT_ID,
  futureYouPotRow,
  intoJarsEachPayday,
  isLegacyGoal,
  jarFillOf,
  newJarLocked,
  occasionsOf,
  potSetAside,
  potTotals,
  savedBefore,
  shelfOrder,
  type PotMove,
} from './pots';

const lastDay: Payday = { kind: 'lastDay' };
const today = '2026-10-11';
const cycle = payCycleOn(today, lastDay);
const dayOf = (instant: string) => instant.slice(0, 10);
const noCategories = new Set<string>();

const base = {
  hue: 0,
  icon: 'savings',
  paused: false,
  archivedAt: null,
  monthly: null,
};
const goalA = {
  ...base,
  id: 'emergency',
  kind: 'goal' as const,
  name: 'Emergency',
  goal: 30_000_000,
  neededBy: null,
  share: 0.6,
  createdAt: '2026-03-02T03:00:00.000Z',
};
const goalB = {
  ...goalA,
  id: 'laptop',
  name: 'Laptop',
  goal: 25_000_000,
  share: 0.4,
};
const tet = {
  ...base,
  id: 'tet',
  kind: 'occasion' as const,
  name: 'Tết',
  icon: 'local_florist',
  goal: 7_000_000,
  neededBy: '2027-02',
  share: null,
  createdAt: '2026-08-02T03:00:00.000Z',
};

const setAside = (potId: string, amount: number, at = cycle.start): PotMove => ({
  potId,
  kind: 'setAside',
  cycle: at,
  amount,
});

/** Today's line from pots and moves, the way the phone works it out on every load. */
function lineOf(input: {
  pots: readonly Parameters<typeof dueSetAsides>[0]['pots'][number][];
  moves: readonly PotMove[];
  futureYou: number;
  spends?: readonly (CountedSpend & { day: string })[];
}) {
  const spentMoves = jarSpendMoves(input.spends ?? [], lastDay, noCategories);
  const moves = [...input.moves, ...spentMoves];
  const due = dueSetAsides({
    pots: input.pots,
    moves,
    futureYou: input.futureYou,
    payday: lastDay,
    today,
    dayOf,
  });
  const all = [...moves, ...due.map((d): PotMove => ({ ...d, kind: 'setAside' }))];
  const totals = potTotals(all, new Set(input.pots.map((p) => p.id)), cycle.start);
  const plan: MonthPlan = {
    income: 17_400_000,
    bills: 4_200_000,
    futureYou: input.futureYou,
    occasions: occasionsOf(input.pots, totals.setAside),
    topUps: totals.topUps,
  };
  const spends = input.spends ?? [];
  const day = dailyNumber({
    plan,
    spentBefore: sumDayPart(
      spends.filter((s) => s.day < today),
      noCategories,
    ),
    today: spends.filter((s) => s.day === today),
    notDaily: noCategories,
    daysLeft: cycle.daysLeft,
  });
  return { day, totals, due };
}

describe('updating from 2.1 keeps every number', () => {
  // As 2.1 recorded it at this cycle's payday: Future you's 3tr split 60/40, Tết's share.
  const recorded21: PotMove[] = [
    setAside('emergency', 1_800_000),
    setAside('laptop', 1_200_000),
    setAside('tet', 1_000_000),
    setAside('emergency', 9_000_000, '2026-04-30'),
    setAside('laptop', 6_000_000, '2026-04-30'),
  ];

  it('Future you 3tr across two goals and a dated jar: the same line to the đồng', () => {
    const before = lineOf({ pots: [goalA, goalB, tet], moves: recorded21, futureYou: 3_000_000 });
    const futureYou = futureYouPotRow('2026-11-04T10:00:00.000Z');
    // The update lands mid-cycle, a year after the plan started.
    const after = lineOf({
      pots: [futureYou, goalA, goalB, tet],
      moves: recorded21,
      futureYou: 3_000_000,
    });
    expect(after.day.line).toBe(before.day.line);
    expect(after.day.startFree).toBe(before.day.startFree);
    // The goals take the whole slice this cycle, so Future you's jar starts with nothing.
    expect(after.due).toEqual([{ potId: FUTURE_YOU_POT_ID, cycle: cycle.start, amount: 0 }]);
    expect(after.totals.saved[FUTURE_YOU_POT_ID]).toBe(0);
    expect(after.totals.saved.emergency).toBe(10_800_000);
  });

  it('a person with no goals: the same line, and Future you holds this cycle only', () => {
    const before = lineOf({ pots: [], moves: [], futureYou: 3_000_000 });
    const after = lineOf({
      pots: [futureYouPotRow('2026-11-04T10:00:00.000Z')],
      moves: [],
      futureYou: 3_000_000,
    });
    expect(after.day.line).toBe(before.day.line);
    expect(after.due).toHaveLength(1);
    expect(after.totals.saved[FUTURE_YOU_POT_ID]).toBe(3_000_000);
  });

  it('a 2.1 goal keeps its share next cycle; Future you takes the rest of the slice', () => {
    const next = payCycleOn('2026-11-05', lastDay);
    const due = dueSetAsides({
      pots: [futureYouPotRow('2026-10-11T10:00:00.000Z'), { ...goalA, share: 0.6 }],
      moves: [setAside(FUTURE_YOU_POT_ID, 1_200_000), setAside('emergency', 1_800_000)],
      futureYou: 3_000_000,
      payday: lastDay,
      today: '2026-11-05',
      dayOf,
    });
    expect(due).toEqual([
      { potId: FUTURE_YOU_POT_ID, cycle: next.start, amount: 1_200_000 },
      { potId: 'emergency', cycle: next.start, amount: 1_800_000 },
    ]);
  });

  it('renaming or changing a goal’s target never makes it a jar of its own', () => {
    const renamed = { ...goalA, name: 'Quỹ khẩn cấp', goal: 40_000_000 };
    expect(isLegacyGoal(renamed)).toBe(true);
    expect(jarFillOf(goalA)).toBe('slice');
    expect(jarFillOf({ ...goalA, kind: 'occasion', monthly: 500_000 })).toBe('steady');
    expect(isLegacyGoal(futureYouPotRow('2026-11-04T10:00:00.000Z'))).toBe(false);
  });
});

describe('jars in the daily number', () => {
  it('a steady jar puts its amount in each payday and lowers the number by it', () => {
    const rainy = { ...tet, id: 'rainy', neededBy: null, goal: 12_600_000, monthly: 400_000 };
    const without = lineOf({ pots: [], moves: [], futureYou: 0 });
    const withJar = lineOf({ pots: [rainy], moves: [], futureYou: 0 });
    expect(withJar.totals.setAside.rainy).toBe(400_000);
    expect(without.day.startFree - withJar.day.startFree).toBe(400_000);
    expect(jarFillOf(rainy)).toBe('steady');
  });

  it('a steady jar stops at its target; one filled by hand takes nothing', () => {
    const cycleTerms = { cycle, futureYou: 0 };
    const rainy = { ...tet, neededBy: null, goal: 1_000_000, monthly: 400_000 };
    expect(potSetAside({ ...cycleTerms, pot: rainy, savedBefore: 800_000 })).toBe(200_000);
    expect(potSetAside({ ...cycleTerms, pot: { ...rainy, goal: 0 }, savedBefore: 9e6 })).toBe(
      400_000,
    );
    expect(potSetAside({ ...cycleTerms, pot: { ...rainy, monthly: null }, savedBefore: 0 })).toBe(
      0,
    );
  });

  it('a dated jar spreads what is left over the months to its date', () => {
    expect(potSetAside({ pot: tet, savedBefore: 3_000_000, futureYou: 0, cycle })).toBe(1_000_000);
  });

  it('Future you’s jar never lowers the number twice: the slice is taken once', () => {
    const fy = futureYouPotRow('2026-10-11T03:00:00.000Z');
    const a = lineOf({ pots: [], moves: [], futureYou: 2_100_000 });
    const b = lineOf({ pots: [fy], moves: [], futureYou: 2_100_000 });
    expect(b.day.line).toBe(a.day.line);
    expect(intoJarsEachPayday(2_100_000, [fy, tet], { tet: 1_000_000 })).toBe(3_100_000);
  });

  it('a spend from a jar leaves the number alone and the jar holds less', () => {
    const dalat = { ...tet, id: 'dalat', name: 'Đà Lạt', neededBy: '2026-12', goal: 6_000_000 };
    const moves = [setAside('dalat', 4_200_000, '2026-08-31')];
    const hotel = {
      amount: 1_200_000,
      category: 'travel',
      status: 'kept' as const,
      day: today,
      fromPot: 'dalat',
      fromPotAmount: 1_200_000,
    };
    const without = lineOf({ pots: [dalat], moves, futureYou: 0 });
    const withSpend = lineOf({ pots: [dalat], moves, futureYou: 0, spends: [hotel] });
    expect(withSpend.day.safe).toBe(without.day.safe);
    expect(withSpend.day.line).toBe(without.day.line);
    expect(withSpend.totals.saved.dalat).toBe(without.totals.saved.dalat! - 1_200_000);
    // Spending in history all the same.
    expect(sumCounted([hotel], noCategories)).toBe(1_200_000);
  });

  it('7tr from a jar holding 6tr: 6tr from the jar, 1tr counts today', () => {
    const covered = jarCover(7_000_000, 6_000_000);
    expect(covered).toBe(6_000_000);
    const flight = {
      amount: 7_000_000,
      category: 'travel',
      status: 'kept' as const,
      fromPot: 'dalat',
      fromPotAmount: covered,
    };
    expect(jarPartOf(flight, noCategories)).toBe(6_000_000);
    expect(dayPartOf(flight, noCategories)).toBe(1_000_000);
    expect(jarPartOf(flight, noCategories) + dayPartOf(flight, noCategories)).toBe(
      sumCounted([flight], noCategories),
    );
    const day = dailyNumber({
      plan: { income: 10_000_000, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
      spentBefore: 0,
      today: [flight],
      notDaily: noCategories,
      daysLeft: 9,
    });
    expect(day.spent).toBe(1_000_000);
  });

  it('undoing a spend from a jar gives the jar its money back', () => {
    const spend = {
      amount: 500_000,
      category: 'food',
      status: 'kept' as const,
      day: today,
      fromPot: 'dalat',
      fromPotAmount: 500_000,
    };
    const moves = [setAside('dalat', 1_000_000, '2026-08-31')];
    expect(
      savedBefore(
        [...moves, ...jarSpendMoves([spend], lastDay, noCategories)],
        'dalat',
        '2026-12-31',
      ),
    ).toBe(500_000);
    for (const status of ['deleted', 'skipped'] as const) {
      expect(jarSpendMoves([{ ...spend, status }], lastDay, noCategories)).toEqual([]);
    }
    expect(jarSpendMoves([{ ...spend, fromPot: null }], lastDay, noCategories)).toEqual([]);
  });

  it('a jar never goes below zero', () => {
    const moves: PotMove[] = [
      setAside('dalat', 100_000, '2026-08-31'),
      { potId: 'dalat', kind: 'spent', cycle: '2026-08-31', amount: 400_000 },
    ];
    expect(savedBefore(moves, 'dalat', cycle.start)).toBe(0);
    expect(potTotals(moves, new Set(['dalat']), cycle.start).saved.dalat).toBe(0);
  });

  it('deleting a jar returns its set-aside, less what was spent from it this cycle', () => {
    // 1tr set aside this cycle, 300k topped up, 1,2tr spent from it: nothing comes back.
    expect(deletedJarsKeep([{ setAside: 1_000_000, topUps: 300_000, covered: 1_200_000 }])).toBe(
      1_200_000,
    );
    // Only 200k spent: 1,1tr of the 1,3tr returns to free money.
    expect(deletedJarsKeep([{ setAside: 1_000_000, topUps: 300_000, covered: 200_000 }])).toBe(
      200_000,
    );
    // Spends paid from older savings keep their cover; this cycle's money all returns.
    expect(deletedJarsKeep([{ setAside: 0, topUps: 0, covered: 900_000 }])).toBe(0);
  });

  it('Future you is first on the shelf, the rest as they were made', () => {
    const fy = futureYouPotRow('2026-11-04T10:00:00.000Z');
    expect(shelfOrder([tet, goalA, fy]).map((p) => p.id)).toEqual([
      FUTURE_YOU_POT_ID,
      'emergency',
      'tet',
    ]);
  });
});

describe('Tết only for those who keep it', () => {
  it('a home in đồng or a phone in Vietnam keeps Tết', () => {
    expect(hasTet({ currency: 'VND', region: 'US' })).toBe(true);
    expect(hasTet({ currency: 'USD', region: 'VN' })).toBe(true);
    expect(hasTet({ currency: 'USD', region: 'US' })).toBe(false);
    expect(hasTet({ currency: null, region: null })).toBe(false);
  });

  it('the preset list starts with Tết in Vietnam and with a trip in the US', () => {
    const vn = jarPresets(hasTet({ currency: 'VND', region: 'VN' }), VND);
    expect(vn.map((p) => p.id)).toEqual(['tet', 'trip', 'phone', 'rainy', 'wedding', 'other']);
    const us = jarPresets(hasTet({ currency: 'USD', region: 'US' }), currencyOf('USD'));
    expect(us.map((p) => p.id)).toEqual(['trip', 'phone', 'rainy', 'wedding', 'other']);
    expect(us.some((p) => p.icon === 'local_florist')).toBe(false);
    expect(us[0]?.target).toBeLessThan(6_000_000);
  });
});

describe('jars without Max', () => {
  it('Future you and one jar of one’s own are free; Max has no limit', () => {
    const fy = futureYouPotRow('2026-11-04T10:00:00.000Z');
    expect(newJarLocked([fy], false)).toBe(false);
    expect(newJarLocked([fy, tet], false)).toBe(true);
    expect(newJarLocked([fy, tet, goalA], true)).toBe(false);
  });
});
