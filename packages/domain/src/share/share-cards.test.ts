import { describe, expect, it } from 'vitest';

import type { DiarySpend } from '../diary/week-recap';
import {
  biggestFullJar,
  closeRunTo,
  monthCard,
  placesByVisits,
  runDays,
  setAsideInYear,
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

describe('monthCard', () => {
  it('draws a sun per day, Monday first, ending with the month', () => {
    const card = monthCard({
      month: '2026-10',
      today: '2026-10-20',
      closed: [
        { day: '2026-10-01', spent: 100_000, line: 200_000 },
        { day: '2026-10-02', spent: 300_000, line: 200_000 },
        { day: '2026-10-19', spent: 0, line: 200_000 },
        { day: '2026-09-30', spent: 0, line: 200_000 },
      ],
      spends: [],
      notDaily: new Set(),
    });
    // 1 Oct 2026 is a Thursday: three blanks first.
    expect(card.suns.slice(0, 5)).toEqual([null, null, null, 'under', 'over']);
    expect(card.suns).toHaveLength(3 + 31);
    expect(card.suns[3 + 2]).toBe('missed');
    expect(card.suns[3 + 18]).toBe('under');
    expect(card.suns[3 + 19]).toBe('ahead');
    expect(card.closed).toBe(3);
    expect(card.under).toBe(2);
    expect(card.spent).toBe(400_000);
  });

  it('ranks places by visits on closed days only, never by spend', () => {
    const card = monthCard({
      month: '2026-10',
      today: '2026-10-31',
      closed: [
        { day: '2026-10-01', spent: 0, line: 1 },
        { day: '2026-10-02', spent: 0, line: 1 },
      ],
      spends: [
        spend('2026-10-01', 'Highlands Coffee', 45_000),
        spend('2026-10-02', 'highlands coffee ', 45_000),
        spend('2026-10-01', 'Grab', 900_000),
        spend('2026-10-03', 'Highlands Coffee'),
        spend('2026-10-03', 'Circle K'),
      ],
      notDaily: new Set(),
    });
    expect(card.places).toEqual([
      { merchant: 'Highlands Coffee', visits: 2 },
      { merchant: 'Grab', visits: 1 },
    ]);
  });

  it('leaves out spends that never counted', () => {
    expect(
      placesByVisits(
        [
          { ...spend('2026-10-01', 'A'), status: 'skipped' },
          { ...spend('2026-10-01', 'B'), direction: 'in' },
          spend('2026-10-01', 'C'),
        ],
        new Set(),
      ),
    ).toEqual([{ merchant: 'C', visits: 1 }]);
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
