import { describe, expect, it } from 'vitest';

import type { DailyNumberInput } from '../plan/daily-number';
import { dailyNumber } from '../plan/daily-number';
import type { CountedSpend } from '../spend/spend';
import { jarChoice, jarEarly, jarStopsLine } from './jar-moments';

const day: DailyNumberInput = {
  plan: {
    income: 17_400_000,
    bills: 3_000_000,
    futureYou: 2_100_000,
    occasions: 1_000_000,
    topUps: 0,
  },
  spentBefore: 3_000_000,
  today: [{ amount: 50_000, category: 'food', status: 'kept' }],
  notDaily: new Set(),
  daysLeft: 22,
};

const spend = (amount: number): CountedSpend => ({ amount, category: 'shopping', status: 'kept' });

describe('jarChoice', () => {
  it('keeps today where it was when the jar holds the whole spend', () => {
    const choice = jarChoice(day, spend(1_200_000), 4_200_000, 'today');
    expect(choice.cover).toBe(1_200_000);
    expect(choice.rest).toBe(0);
    expect(choice.heldAfter).toBe(3_000_000);
    expect(choice.todayStays).toBe(dailyNumber(day).safe);
    expect(choice.tomorrowFrom).toBe(choice.tomorrowClear);
    expect(choice.tomorrowAll).toBeLessThan(choice.tomorrowFrom);
  });

  it('counts what the jar cannot hold, and tomorrow pays for it', () => {
    const choice = jarChoice(day, spend(7_000_000), 6_000_000, 'today');
    expect(choice.cover).toBe(6_000_000);
    expect(choice.rest).toBe(1_000_000);
    expect(choice.heldAfter).toBe(0);
    expect(choice.todayStays).toBe(dailyNumber(day).safe - 1_000_000);
    // The 1tr over 22 days: about 45k off tomorrow.
    const free = dailyNumber(day).free;
    expect(choice.tomorrowClear).toBe(Math.floor(free / 22 / 1000) * 1000);
    expect(choice.tomorrowFrom).toBe(Math.floor((free - 1_000_000) / 22 / 1000) * 1000);
  });

  it('never takes more than the jar holds, and nothing from an empty one', () => {
    expect(jarChoice(day, spend(500_000), 0, 'today').cover).toBe(0);
    expect(jarChoice(day, spend(500_000), -10, 'today').heldAfter).toBe(0);
  });

  it('puts an earlier day’s spend back into what went before', () => {
    const choice = jarChoice(day, spend(7_000_000), 6_000_000, 'earlier');
    const before = { ...day, spentBefore: day.spentBefore + 1_000_000 };
    expect(choice.todayStays).toBe(dailyNumber(before).safe);
  });

  it('leaves the number alone for a spend from before the cycle', () => {
    const choice = jarChoice(day, spend(7_000_000), 6_000_000, 'outside');
    expect(choice.tomorrowAll).toBe(choice.tomorrowClear);
    expect(choice.todayStays).toBe(dailyNumber(day).safe);
  });

  it('takes nothing for a spend that is not spending', () => {
    const work = { ...spend(800_000), forWork: true };
    expect(jarChoice(day, work, 6_000_000, 'today').cover).toBe(0);
  });
});

describe('jarStopsLine', () => {
  const base = {
    today: '2026-10-09',
    payday: { kind: 'lastDay' } as const,
    income: 17_400_000,
    bills: [],
    futureYou: 2_100_000,
    occasions: 1_900_000,
  };

  it('gives each day of the next cycle what the jar stops taking', () => {
    const line = jarStopsLine({ ...base, took: 930_000, fromSlice: false });
    // 31 Oct to 30 Nov: 30 days after payday, 31 with payday itself.
    expect(line.before).toBe(Math.floor((17_400_000 - 2_100_000 - 1_900_000) / 31 / 1000) * 1000);
    expect(line.after).toBe(Math.floor((17_400_000 - 2_100_000 - 970_000) / 31 / 1000) * 1000);
    expect(line.after).toBeGreaterThan(line.before);
  });

  it('moves nothing for a 2.1 goal, which fills from Future you’s slice', () => {
    const line = jarStopsLine({ ...base, took: 500_000, fromSlice: true });
    expect(line.after).toBe(line.before);
  });

  it('never gives back more than the jars took', () => {
    const line = jarStopsLine({ ...base, took: 9_000_000, fromSlice: false });
    expect(line.after).toBe(
      jarStopsLine({ ...base, occasions: 0, took: 0, fromSlice: false }).before,
    );
  });
});

describe('jarEarly', () => {
  it('counts weeks to the jar’s month', () => {
    expect(jarEarly('2026-10-09', '2026-11')).toEqual({ unit: 'week', count: 3 });
  });

  it('counts days in the last week, and months from eight weeks', () => {
    expect(jarEarly('2026-10-28', '2026-11')).toEqual({ unit: 'day', count: 4 });
    expect(jarEarly('2026-10-09', '2027-02')).toEqual({ unit: 'month', count: 4 });
  });

  it('is not early in its month, after it, or with no date', () => {
    expect(jarEarly('2026-11-02', '2026-11')).toBeNull();
    expect(jarEarly('2026-12-02', '2026-11')).toBeNull();
    expect(jarEarly('2026-10-09', null)).toBeNull();
  });
});
