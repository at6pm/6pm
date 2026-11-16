import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { splitShares, wholePercents } from './shares';

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

describe('wholePercents', () => {
  it('splits a 15tr salary into the canvas shares', () => {
    // Bills 4,2tr, Future you 2tr, Đà Lạt 700k, Tết 1tr, free money 7,1tr.
    expect(wholePercents([4_200_000, 2_000_000, 700_000, 1_000_000, 7_100_000])).toEqual([
      28, 13, 5, 7, 47,
    ]);
  });

  it('gives the left-over points to the largest remainders', () => {
    // Thirds: 33.3 each, the first takes the last point.
    expect(wholePercents([1, 1, 1])).toEqual([34, 33, 33]);
    // 16.67 ×6: four parts take a point.
    expect(wholePercents([1, 1, 1, 1, 1, 1])).toEqual([17, 17, 17, 17, 16, 16]);
    // 2/3 and 1/3: the larger remainder (.67) wins.
    expect(wholePercents([2, 1])).toEqual([67, 33]);
  });

  it('gives nothing to a part that holds nothing, and never to it as a remainder', () => {
    expect(wholePercents([0, 1, 1, 1])).toEqual([0, 34, 33, 33]);
    expect(wholePercents([-5, 3, Number.NaN, 1])).toEqual([0, 75, 0, 25]);
  });

  it('is all zeros when nothing holds anything', () => {
    expect(wholePercents([])).toEqual([]);
    expect(wholePercents([0, 0, -1])).toEqual([0, 0, 0]);
  });

  it('always adds up to 100 and stays within a point of the exact share', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 50_000_000 }), { minLength: 1, maxLength: 12 }),
        (amounts) => {
          const total = sum(amounts);
          const percents = wholePercents(amounts);
          if (total === 0) {
            expect(percents.every((p) => p === 0)).toBe(true);
            return;
          }
          expect(sum(percents)).toBe(100);
          percents.forEach((p, i) => {
            const exact = ((amounts[i] ?? 0) * 100) / total;
            expect(Number.isInteger(p)).toBe(true);
            expect(p).toBeGreaterThanOrEqual(Math.floor(exact));
            expect(p).toBeLessThanOrEqual(Math.floor(exact) + 1);
            if (amounts[i] === 0) expect(p).toBe(0);
          });
        },
      ),
    );
  });
});

describe('splitShares', () => {
  it('keeps the parts in order with their amounts and percents', () => {
    expect(
      splitShares([
        { key: 'bills', amount: 3_000_000 },
        { key: 'free', amount: 7_000_000 },
        { key: 'jar', amount: -10 },
      ]),
    ).toEqual([
      { key: 'bills', amount: 3_000_000, percent: 30 },
      { key: 'free', amount: 7_000_000, percent: 70 },
      { key: 'jar', amount: 0, percent: 0 },
    ]);
  });
});
