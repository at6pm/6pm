import { describe, expect, it } from 'vitest';

import { dailyNumber, type DailyNumberInput } from './daily-number';
import { joinedCycle } from './joined-cycle';
import { payCycleOn } from './pay-cycle';
import { whatIfDaily, whatIfOver, withFutureYou } from './plan-river';
import { planSplit } from './plan-split';
import { whatIfRange } from './what-if';

const cycle = payCycleOn('2026-11-13', { kind: 'sameDay', day: 1 });

/** Example A on Friday 13 Nov, as the store hands it over: a weekly pay, two Fridays in. */
const weekly: DailyNumberInput = {
  plan: { income: 16_000_000, bills: 3_000_000, futureYou: 800_000, occasions: 0, topUps: 0 },
  period: {
    credited: 8_000_000,
    reserved: 1_900_000,
    bills: 1_500_000,
    coming: 4_000_000,
    cap: null,
    minDays: 0,
    hold: null,
  },
  spentBefore: 2_920_000,
  today: [],
  notDaily: new Set(),
  daysLeft: 7,
};

describe('Plan’s split for a plan that holds its incomes', () => {
  it('splits what came in into its bills, its jars and what is free, adding up to the line', () => {
    const split = planSplit({
      input: weekly,
      cycle,
      today: '2026-11-13',
      spends: [],
      joinedOn: null,
    });
    expect(split).toMatchObject({ pay: 8_000_000, bills: 1_500_000, pots: 400_000, line: 397_000 });
    expect(split.bills + split.pots + split.free).toBe(split.pay);
    expect(split.maths.map((r) => [r.kind, r.amount])).toEqual([
      ['free', 6_100_000],
      ['spentBefore', -2_920_000],
      ['left', 3_180_000],
      ['divide', 397_000],
    ]);
    expect(split.line).toBe(dailyNumber(weekly).line);
  });

  it('says what the next pay brings the day before it, and divides over six weeks at first', () => {
    const eve = planSplit({
      input: { ...weekly, daysLeft: 1 },
      cycle,
      today: '2026-11-19',
      spends: [],
      joinedOn: null,
    });
    expect(eve.maths.at(-1)).toMatchObject({ kind: 'tomorrow', amount: 4_000_000 });
    const landed = planSplit({
      input: { ...weekly, period: { ...weekly.period!, minDays: 42 } },
      cycle,
      today: '2026-11-13',
      spends: [],
      joinedOn: null,
    });
    expect(landed.maths.find((r) => r.kind === 'divide')?.count).toBe(42);
  });
});

describe('the what-if for a plan that holds its incomes', () => {
  it('moves what the month reserves, so a bigger Future you lowers the days', () => {
    expect(withFutureYou(weekly, 1_200_000).period?.reserved).toBe(2_300_000);
    expect(whatIfDaily(weekly, 1_200_000)).toBeLessThan(whatIfDaily(weekly, 800_000));
    expect(whatIfOver(weekly, 1_200_000)).toBe(0);
    // Past what the month has: 1.900.000 + 5.200.000 reserved, 2.920.000 spent, from 8.000.000.
    expect(whatIfOver(weekly, 6_000_000)).toBe(2_020_000);
  });

  it('reaches the month’s counted income, not the design’s 4tr, on the slider', () => {
    expect(whatIfRange(16_000_000, 800_000).max).toBe(12_500_000);
  });
});

describe('joining part-way for a plan not paid by the month', () => {
  it('estimates nothing before joining, and keeps starting Future you at payday', () => {
    const answers = { on: '2026-11-13', spentSincePayday: 2_000_000, futureYouAtPayday: true };
    expect(joinedCycle(cycle, answers)).toMatchObject({ share: 1, beforeJoining: 2_000_000 });
    expect(joinedCycle(cycle, { ...answers, spentSincePayday: null }).share).toBeLessThan(1);
    expect(joinedCycle(cycle, answers, false)).toEqual({
      joined: true,
      share: 1,
      beforeJoining: null,
      futureYouSkipped: true,
    });
  });
});
