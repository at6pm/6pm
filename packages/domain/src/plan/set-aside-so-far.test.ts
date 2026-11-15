import { describe, expect, it } from 'vitest';

import { incomePeriod } from './income-period';
import type { Income } from './incomes';
import { payCycleOn, type Payday } from './pay-cycle';
import { payStretch } from './pay-stretch';
import { setAsideSoFar } from './set-aside-so-far';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

describe('what each jar has had set aside so far', () => {
  it('is its share of what the pays so far set aside, never more than its month', () => {
    expect(setAsideSoFar({ futureYou: 1_900_000 }, 950_000, 1_900_000)).toEqual({
      futureYou: 950_000,
    });
    // Shares in whole đồng; what rounding leaves goes to the jar that sets aside most.
    expect(setAsideSoFar({ futureYou: 1_000_000, trip: 500_000 }, 500_001, 1_500_000)).toEqual({
      futureYou: 333_334,
      trip: 166_667,
    });
    expect(setAsideSoFar({ futureYou: 1_900_000 }, 1_900_000, 1_900_000)).toEqual({
      futureYou: 1_900_000,
    });
    expect(setAsideSoFar({ futureYou: 1_900_000 }, 0, 1_900_000)).toEqual({ futureYou: 0 });
    expect(setAsideSoFar({ futureYou: 1_900_000 }, 500_000, 0)).toEqual({ futureYou: 1_900_000 });
  });

  it('agrees with the pay’s slip for someone who joined mid-month on a weekly pay', () => {
    // 4.000.000 every Friday, rent 3.000.000 due the 18th, Future you 1.900.000 a month; joined on
    // Sunday 15 November, two Fridays into the month: the pay in hand sets aside two slices.
    const weekly: Income = {
      id: 'pay',
      name: null,
      rhythm: { kind: 'weekly', weekday: 4 },
      amount: 4_000_000,
    };
    const input = {
      day: '2026-11-15',
      cycle: payCycleOn('2026-11-15', CALENDAR),
      anchor: CALENDAR,
      incomes: [weekly],
      bills: [{ amount: 3_000_000, dueDay: 18, paidCycle: null }],
      jars: 1_900_000,
      joinedOn: '2026-11-15',
      lastUntil: null,
      placed: [],
    };
    const period = incomePeriod(input);
    const stretch = payStretch(input);
    expect(period.jars).toBe(950_000);
    expect(stretch).toMatchObject({ jarSlice: 950_000, jarSlices: 2 });
    expect(setAsideSoFar({ futureYou: 1_900_000 }, period.jars, input.jars)).toEqual({
      futureYou: 950_000,
    });
  });
});
