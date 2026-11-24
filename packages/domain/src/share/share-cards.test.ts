import { describe, expect, it } from 'vitest';

import type { DiarySpend } from '../diary/week-recap';
import {
  biggestFullJar,
  closeRunTo,
  monthHabit,
  runDays,
  setAsideInYear,
  streakCardOffer,
  streakMilestoneOf,
  yearCard,
  yearCardYear,
} from './share-cards';

const spend = (day: string, merchant: string, amount = 50_000): DiarySpend => ({
  day,
  merchant,
  amount,
  category: 'food',
  status: 'kept',
});

describe('close streak', () => {
  const days = ['2026-10-01', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'];

  it('runs back from the day through every evening closed before it', () => {
    expect(closeRunTo(days, '2026-10-06')).toEqual({
      days: 4,
      from: '2026-10-03',
      to: '2026-10-06',
    });
    expect(closeRunTo(days, '2026-10-01')).toEqual({
      days: 1,
      from: '2026-10-01',
      to: '2026-10-01',
    });
  });

  it('is nothing for a day that was not closed', () => {
    expect(closeRunTo(days, '2026-10-02')).toBeNull();
  });

  it('crosses month and year ends', () => {
    const long = Array.from({ length: 100 }, (_, i) =>
      new Date(Date.UTC(2026, 8, 25 + i)).toISOString().slice(0, 10),
    );
    const run = closeRunTo(long, '2027-01-02');
    expect(run).toEqual({ days: 100, from: '2026-09-25', to: '2027-01-02' });
    expect(run && runDays(run)).toHaveLength(100);
    expect(run && runDays(run)[99]).toBe('2027-01-02');
  });

  it('names 7, 30 and 100 as milestones and nothing else', () => {
    expect(streakMilestoneOf(7)).toBe(7);
    expect(streakMilestoneOf(30)).toBe(30);
    expect(streakMilestoneOf(100)).toBe(100);
    expect(streakMilestoneOf(8)).toBeNull();
    expect(streakMilestoneOf(14)).toBeNull();
    expect(streakMilestoneOf(0)).toBeNull();
  });
});

describe('streakCardOffer', () => {
  const run = (to: string, days: number) =>
    Array.from({ length: days }, (_, i) =>
      new Date(Date.parse(`${to}T00:00:00Z`) - i * 86_400_000).toISOString().slice(0, 10),
    );

  it('offers the milestone the evening being closed reaches, counting that evening', () => {
    // Six evenings closed before tonight: tonight makes seven.
    expect(
      streakCardOffer({ closedDays: run('2026-11-23', 6), day: '2026-11-24', offered: [] }),
    ).toBe(7);
    expect(
      streakCardOffer({ closedDays: run('2026-11-23', 29), day: '2026-11-24', offered: [7] }),
    ).toBe(30);
    expect(
      streakCardOffer({ closedDays: run('2026-11-23', 99), day: '2026-11-24', offered: [7, 30] }),
    ).toBe(100);
  });

  it('offers each milestone once, ever', () => {
    expect(
      streakCardOffer({ closedDays: run('2026-11-23', 6), day: '2026-11-24', offered: [7] }),
    ).toBeNull();
  });

  it('offers nothing between milestones or past the last', () => {
    for (const before of [5, 7, 13, 28, 30, 98, 100, 199]) {
      expect(
        streakCardOffer({ closedDays: run('2026-11-23', before), day: '2026-11-24', offered: [] }),
      ).toBeNull();
    }
  });

  it('counts only evenings back to back: a gap starts the run again', () => {
    const broken = [...run('2026-11-23', 3), ...run('2026-11-19', 10)];
    expect(streakCardOffer({ closedDays: broken, day: '2026-11-24', offered: [] })).toBeNull();
    expect(
      streakCardOffer({ closedDays: run('2026-11-23', 6), day: '2026-11-24', offered: [] }),
    ).toBe(7);
  });
});

describe('monthHabit', () => {
  const visits = (merchant: string, n: number, category = 'food', amount = 50_000) =>
    Array.from({ length: n }, (_, i) => ({
      ...spend(`2026-10-${String(i + 1).padStart(2, '0')}`, merchant, amount),
      category,
    }));

  it('names the shop once it is visited five times and more than any other', () => {
    const habit = monthHabit(
      [
        ...visits('Cơm tấm Cali', 5),
        ...visits('Highlands', 4, 'coffee'),
        ...visits('Grab', 3, 'move'),
      ],
      new Set(),
    );
    expect(habit?.lead).toBe('shop');
    expect(habit?.shop).toEqual({ key: 'Cơm tấm Cali', count: 5, spent: 250_000 });
    expect(habit?.category).toEqual({ key: 'food', count: 5, spent: 250_000 });
  });

  it('names the category when the top shop has fewer than five visits', () => {
    const habit = monthHabit(
      [...visits('Cơm tấm Cali', 4), ...visits('Phở 24', 3), ...visits('Grab', 2, 'move')],
      new Set(),
    );
    expect(habit?.lead).toBe('category');
    expect(habit?.category).toEqual({ key: 'food', count: 7, spent: 350_000 });
    // The shop is still there for a tap on the headline.
    expect(habit?.shop?.key).toBe('Cơm tấm Cali');
  });

  it('names the category when two shops tie for the lead, and offers no shop', () => {
    const habit = monthHabit([...visits('A', 6), ...visits('B', 6, 'coffee')], new Set());
    expect(habit?.lead).toBe('category');
    expect(habit?.shop).toBeNull();
  });

  it('offers no shop visited only once', () => {
    const habit = monthHabit([...visits('A', 1), ...visits('B', 1)], new Set());
    expect(habit?.shop).toBeNull();
    expect(habit?.category.count).toBe(2);
  });

  it('counts visits, not money, and groups a shop however it was written', () => {
    const habit = monthHabit(
      [
        ...visits('Highlands Coffee', 3, 'coffee', 45_000),
        ...visits(' highlands coffee', 3, 'coffee', 45_000),
        ...visits('Vincom', 2, 'shop', 9_000_000),
      ],
      new Set(),
    );
    expect(habit?.lead).toBe('shop');
    expect(habit?.shop).toEqual({ key: 'Highlands Coffee', count: 6, spent: 270_000 });
    expect(habit?.category.key).toBe('coffee');
  });

  it('leaves out spends that never counted, and is nothing when none did', () => {
    const habit = monthHabit(
      [
        ...visits('A', 6).map((s) => ({ ...s, status: 'skipped' as const })),
        ...visits('B', 6).map((s) => ({ ...s, direction: 'in' as const })),
        ...visits('C', 6, 'rent'),
        ...visits('D', 2, 'food'),
      ],
      new Set(['rent']),
    );
    expect(habit?.lead).toBe('category');
    expect(habit?.category).toEqual({ key: 'food', count: 2, spent: 100_000 });
    expect(monthHabit(visits('A', 3, 'rent'), new Set(['rent']))).toBeNull();
  });
});

describe('yearCard', () => {
  it('prints a dot per day, counts no-spend evenings and finds the best month', () => {
    const card = yearCard('2026', [
      { day: '2026-03-01', spent: 0, line: 100 },
      { day: '2026-03-02', spent: 200, line: 100 },
      { day: '2026-08-01', spent: 50, line: 100 },
      { day: '2026-08-02', spent: 20, line: 100 },
      { day: '2025-12-31', spent: 0, line: 100 },
    ]);
    expect(card.months).toHaveLength(12);
    expect(card.months[1]?.closed).toHaveLength(28);
    expect(card.months[2]?.closed.slice(0, 3)).toEqual([true, true, false]);
    expect(card.months[2]?.count).toBe(2);
    expect(card.closed).toBe(4);
    expect(card.noSpend).toBe(1);
    expect(card.under).toBe(3);
    expect(card.best).toBe('2026-08');
  });

  it('breaks a tie on evenings inside by evenings closed, then the earlier month', () => {
    const tie = yearCard('2026', [
      { day: '2026-01-01', spent: 0, line: 1 },
      { day: '2026-02-01', spent: 0, line: 1 },
      { day: '2026-02-02', spent: 5, line: 1 },
    ]);
    expect(tie.best).toBe('2026-02');
    expect(
      yearCard('2026', [
        { day: '2026-01-01', spent: 0, line: 1 },
        { day: '2026-02-01', spent: 0, line: 1 },
      ]).best,
    ).toBe('2026-01');
    expect(yearCard('2026', []).best).toBeNull();
  });

  it('sits on Today from 20 December to 5 January', () => {
    expect(yearCardYear('2026-12-19')).toBeNull();
    expect(yearCardYear('2026-12-20')).toBe('2026');
    expect(yearCardYear('2026-12-31')).toBe('2026');
    expect(yearCardYear('2027-01-01')).toBe('2026');
    expect(yearCardYear('2027-01-05')).toBe('2026');
    expect(yearCardYear('2027-01-06')).toBeNull();
    expect(yearCardYear('2026-07-15')).toBeNull();
  });

  it('names the full jar with the biggest target', () => {
    const pots = [
      { id: 'a', goal: 5_000_000 },
      { id: 'b', goal: 12_000_000 },
      { id: 'c', goal: 20_000_000 },
      { id: 'd', goal: 0 },
    ];
    expect(biggestFullJar(pots, { a: 5_000_000, b: 13_000_000, c: 19_999_999, d: 9 })).toBe('b');
    expect(biggestFullJar(pots, {})).toBeNull();
  });
});

describe('setAsideInYear', () => {
  it('adds the year’s set-asides and top-ups, less what was taken back', () => {
    expect(
      setAsideInYear(
        [
          { kind: 'setAside', cycle: '2026-01-31', amount: 2_000_000 },
          { kind: 'topUp', cycle: '2026-03-31', amount: 500_000 },
          { kind: 'topUp', cycle: '2026-04-30', amount: -200_000 },
          { kind: 'opening', cycle: '2026-01-31', amount: 9_000_000 },
          { kind: 'spent', cycle: '2026-05-31', amount: 100_000 },
          { kind: 'setAside', cycle: '2025-12-31', amount: 2_000_000 },
        ],
        '2026',
      ),
    ).toBe(2_300_000);
    expect(setAsideInYear([], '2026')).toBe(0);
  });
});
