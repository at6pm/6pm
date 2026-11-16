import { describe, expect, it } from 'vitest';

import { currencyOf, VND } from '../money/currency';
import {
  homeChangeSample,
  inNewHome,
  isHomeChange,
  planInNewHome,
  plannedInNewHome,
  spendInNewHome,
  type HomeChange,
} from './home-change';

const USD = currencyOf('USD');
/** A plan set up in dollars by a phone whose region is the US, moving to đồng. */
const toDong: HomeChange = { from: USD, to: VND, rate: '25400' };
/** The other way: one đồng in dollars. */
const toDollars: HomeChange = { from: VND, to: USD, rate: '0.00003937007874' };

describe('isHomeChange', () => {
  it('needs two currencies and a rate above zero', () => {
    expect(isHomeChange(toDong)).toBe(true);
    expect(isHomeChange({ ...toDong, to: USD })).toBe(false);
    expect(isHomeChange({ ...toDong, rate: '0' })).toBe(false);
    expect(isHomeChange({ ...toDong, rate: 'about 25k' })).toBe(false);
  });
});

describe('inNewHome', () => {
  it('counts cents in đồng at the rate', () => {
    expect(inNewHome(350, toDong)).toBe(88_900);
    expect(inNewHome(1, toDong)).toBe(254);
    expect(inNewHome(0, toDong)).toBe(0);
  });

  it('counts đồng in cents, to the nearest cent', () => {
    expect(inNewHome(55_000, toDollars)).toBe(217);
    expect(inNewHome(25_400, toDollars)).toBe(100);
  });

  it('never turns something into nothing', () => {
    expect(inNewHome(100, toDollars)).toBe(1);
  });

  it('keeps the sign of money that left a jar', () => {
    expect(inNewHome(-350, toDong)).toBe(-88_900);
    expect(inNewHome(-100, toDollars)).toBe(-1);
  });

  it('keeps one amount no larger than another it was no larger than', () => {
    for (const [small, large] of [
      [12_345, 12_346],
      [999, 55_000],
      [126, 127],
    ] as const) {
      expect(inNewHome(small, toDollars)).toBeLessThanOrEqual(inNewHome(large, toDollars));
    }
  });
});

describe('plannedInNewHome', () => {
  it('rounds what is planned to the step', () => {
    // $1,234.56 is 31.357.824₫: planned as 31.358.000₫.
    expect(plannedInNewHome(123_456, toDong)).toBe(31_358_000);
    // 15.500.000₫ is $610.24: planned as $610.
    expect(plannedInNewHome(15_500_000, toDollars)).toBe(61_000);
  });

  it('keeps a small plan at one step, and nothing at nothing', () => {
    expect(plannedInNewHome(10_000, toDollars)).toBe(100);
    expect(plannedInNewHome(0, toDong)).toBe(0);
  });
});

describe('spendInNewHome', () => {
  it('converts a spend typed in the old home', () => {
    expect(spendInNewHome({ amount: 350, foreignAmount: null }, toDong)).toEqual({
      amount: 88_900,
      foreignAmount: null,
      fromPotAmount: null,
    });
  });

  it('puts a receipt printed in the new home back to its printed amount', () => {
    const caught = {
      amount: 217,
      foreignAmount: { currency: 'VND', amount: 55_000, rate: 0.0000394 },
    };
    expect(spendInNewHome(caught, toDong)).toEqual({
      amount: 55_000,
      foreignAmount: null,
      fromPotAmount: null,
    });
  });

  it('prices one that was still waiting for a rate', () => {
    const waiting = { amount: 0, foreignAmount: { currency: 'VND', amount: 120_000, rate: 0 } };
    expect(spendInNewHome(waiting, toDong).amount).toBe(120_000);
    expect(spendInNewHome(waiting, toDong).foreignAmount).toBeNull();
  });

  it('keeps a third currency printed as it was, at a rate in the new home', () => {
    const baht = { amount: 300, foreignAmount: { currency: 'THB', amount: 100, rate: 0.03 } };
    const moved = spendInNewHome(baht, toDong);
    expect(moved.amount).toBe(76_200);
    expect(moved.foreignAmount?.currency).toBe('THB');
    expect(moved.foreignAmount?.amount).toBe(100);
    expect(moved.foreignAmount?.rate).toBeCloseTo(762, 6);
  });

  it('leaves a third currency that is still waiting, waiting', () => {
    const waiting = { amount: 0, foreignAmount: { currency: 'THB', amount: 100, rate: 0 } };
    expect(spendInNewHome(waiting, toDong)).toEqual({
      amount: 0,
      foreignAmount: { currency: 'THB', amount: 100, rate: 0 },
      fromPotAmount: null,
    });
  });

  it('converts what a jar covered, never past the spend', () => {
    expect(
      spendInNewHome({ amount: 1000, foreignAmount: null, fromPotAmount: 400 }, toDong),
    ).toMatchObject({ amount: 254_000, fromPotAmount: 101_600 });
    const whole = { amount: 100, foreignAmount: null, fromPotAmount: 100 };
    expect(spendInNewHome(whole, toDollars)).toMatchObject({ amount: 1, fromPotAmount: 1 });
    const printed = {
      amount: 217,
      foreignAmount: { currency: 'VND', amount: 55_000, rate: 0.0000394 },
      fromPotAmount: 217,
    };
    expect(spendInNewHome(printed, toDong)).toMatchObject({
      amount: 55_000,
      fromPotAmount: 55_000,
    });
  });
});

describe('planInNewHome', () => {
  it('moves money in and Future you to the step and what was spent to the unit', () => {
    const plan = { income: 120_000, futureYou: 14_400, spentSincePayday: 12_345, closeAt: '18:00' };
    expect(planInNewHome(plan, toDong)).toEqual({
      income: 30_480_000,
      futureYou: 3_658_000,
      spentSincePayday: 3_135_630,
      closeAt: '18:00',
    });
  });

  it('adds no answer a plan never had', () => {
    const moved = planInNewHome({ income: 120_000, futureYou: 0 }, toDong);
    expect('spentSincePayday' in moved).toBe(false);
  });

  it('never lets Future you pass money in', () => {
    const moved = planInNewHome({ income: 10_000, futureYou: 10_000 }, toDollars);
    expect(moved.futureYou).toBeLessThanOrEqual(moved.income);
  });
});

describe('homeChangeSample', () => {
  it('says one unit of the dearer currency in the cheaper one, either way', () => {
    expect(homeChangeSample(toDong)).toEqual({ from: 100, to: 25_400 });
    expect(homeChangeSample(toDollars)).toEqual({ from: 25_400, to: 100 });
  });
});
