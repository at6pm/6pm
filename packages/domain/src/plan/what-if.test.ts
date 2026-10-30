import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import type { DailyNumberInput } from './daily-number';
import { whatIfNote, whatIfRange } from './what-if';

describe('whatIfRange', () => {
  it('runs to 80% of the income on the design’s 250k notches', () => {
    // 15tr × 80% = 12tr: 48 notches of 250k.
    expect(whatIfRange(15_000_000, 2_000_000)).toEqual({ max: 12_000_000, step: 250_000 });
  });

  it('floors 80% of the income to a whole notch', () => {
    // 11tr × 80% = 8,8tr.
    expect(whatIfRange(11_000_000, 0)).toEqual({ max: 8_750_000, step: 250_000 });
  });

  it('moves to a wider notch when 250k would make too many', () => {
    // 30tr × 80% = 24tr: 96 notches of 250k, 48 of 500k.
    expect(whatIfRange(30_000_000, 6_000_000)).toEqual({ max: 24_000_000, step: 500_000 });
    // 100tr × 80% = 80tr: 1tr would be 80 notches, 2,5tr is 32.
    expect(whatIfRange(100_000_000, 0)).toEqual({ max: 80_000_000, step: 2_500_000 });
  });

  it('never ends below the amount already set, ceiled to a notch', () => {
    // 10tr × 80% = 8tr, but onboarding set 9,1tr.
    expect(whatIfRange(10_000_000, 9_100_000)).toEqual({ max: 9_250_000, step: 250_000 });
    expect(whatIfRange(10_000_000, 8_000_000).max).toBe(8_000_000);
  });

  it('runs to the design’s 4tr when no income is known, or further for the amount set', () => {
    expect(whatIfRange(0, 1_000_000)).toEqual({ max: 4_000_000, step: 250_000 });
    expect(whatIfRange(0, 5_100_000)).toEqual({ max: 5_250_000, step: 250_000 });
    expect(whatIfRange(Number.NaN, 0)).toEqual({ max: 4_000_000, step: 250_000 });
  });

  it('keeps at least one notch on a tiny income', () => {
    expect(whatIfRange(200_000, 0)).toEqual({ max: 250_000, step: 250_000 });
  });

  it('scales the notch to a dollar home by value', () => {
    const usd = currencyOf('USD');
    // $2,000 × 80% = $1,600: $10 notches would be 160, $40 makes 40.
    expect(whatIfRange(200_000, 0, usd)).toEqual({ max: 160_000, step: 4_000 });
    expect(whatIfRange(0, 0, usd)).toEqual({ max: 15_000, step: 1_000 });
  });
});

const input = (over: Partial<DailyNumberInput> = {}): DailyNumberInput => ({
  plan: { income: 17_400_000, bills: 4_000_000, futureYou: 2_000_000, occasions: 0, topUps: 0 },
  spentBefore: 0,
  today: [],
  notDaily: new Set<string>(),
  daysLeft: 6,
  ...over,
});

describe('whatIfNote', () => {
  it('says nothing moved at the plan', () => {
    expect(whatIfNote(input(), 2_000_000, 2_000_000)).toEqual({ kind: 'same' });
  });

  it('gives what each day until payday loses or gains', () => {
    // 11,4tr free, 4tr spent, 6 days after today: 4tr more takes 667k from each of them.
    const spent = input({ spentBefore: 4_000_000 });
    expect(whatIfNote(spent, 2_000_000, 6_000_000)).toEqual({
      kind: 'more',
      amount: 4_000_000,
      daily: 667_000,
    });
    expect(whatIfNote(spent, 2_000_000, 1_000_000)).toEqual({
      kind: 'less',
      amount: 1_000_000,
      daily: 167_000,
    });
  });

  it('says how far past the plan the cycle would be, not "0 a day"', () => {
    // 11,4tr free, 12tr spent: already 600k past the plan, so every day is already nothing.
    const past = input({ spentBefore: 12_000_000 });
    expect(whatIfNote(past, 2_000_000, 6_000_000)).toEqual({
      kind: 'moreOver',
      amount: 4_000_000,
      over: 4_600_000,
    });
    expect(whatIfNote(past, 2_000_000, 1_750_000)).toEqual({
      kind: 'lessOver',
      amount: 250_000,
      over: 350_000,
    });
    // Saving enough less brings the days back: that is a daily gain again.
    expect(whatIfNote(past, 2_000_000, 0)).toEqual({
      kind: 'less',
      amount: 2_000_000,
      daily: 233_000,
    });
  });

  it('says so when Future you starts at payday and no day moves', () => {
    expect(whatIfNote(input({ futureYouSkipped: true }), 0, 4_000_000)).toEqual({
      kind: 'atPayday',
      amount: 4_000_000,
    });
  });
});
