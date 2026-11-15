import { describe, expect, it } from 'vitest';

import { addDays } from '../time/local-date';
import {
  incomesOf,
  moneyNext,
  moneyNextOf,
  payEvents,
  PLAN_INCOME_ID,
  type Income,
  type Rhythm,
} from './incomes';
import { payCycleOn, type Payday } from './pay-cycle';

/** Every payday rule there is: the 1st to the 31st, the last day, and "it varies". */
const paydays: Payday[] = [
  ...Array.from({ length: 31 }, (_, i): Payday => ({ kind: 'sameDay', day: i + 1 })),
  { kind: 'lastDay' },
  { kind: 'varies' },
];

const FRIDAY = 4;

function income(rhythm: Rhythm, amount = 4_000_000, id = 'a'): Income {
  return { id, name: null, rhythm, amount };
}

function daysOf(rhythm: Rhythm, from: string, to: string): string[] {
  return payEvents([income(rhythm)], from, to).map((event) => event.day);
}

function extrasOf(rhythm: Rhythm, from: string, to: string, anchor?: Payday): string[] {
  return payEvents([income(rhythm)], from, to, anchor)
    .filter((event) => event.extra)
    .map((event) => event.day);
}

describe('incomesOf', () => {
  it('reads a plan that was never asked as one monthly pay on its payday', () => {
    expect(incomesOf({ income: 18_000_000, payday: { kind: 'sameDay', day: 25 } })).toEqual([
      {
        id: PLAN_INCOME_ID,
        name: null,
        rhythm: { kind: 'monthly', day: 25 },
        amount: 18_000_000,
      },
    ]);
  });

  it('puts the last day and "it varies" on the last day of the month', () => {
    for (const kind of ['lastDay', 'varies'] as const) {
      const [only, ...rest] = incomesOf({ income: 9_000_000, payday: { kind } });
      expect(rest).toEqual([]);
      expect(only?.rhythm).toEqual({ kind: 'monthly', day: 'last' });
    }
  });

  it('returns the incomes the plan holds, even when there are none', () => {
    const weekly = income({ kind: 'weekly', weekday: FRIDAY });
    const plan = { income: 18_000_000, payday: { kind: 'lastDay' } as const };
    expect(incomesOf({ ...plan, incomes: [weekly] })).toEqual([weekly]);
    expect(incomesOf({ ...plan, incomes: [] })).toEqual([]);
  });
});

describe('moneyNext for a monthly salary', () => {
  it('counts the same days as the pay cycle, for every payday rule and every day of three years', () => {
    const wrong: string[] = [];
    for (const rule of paydays) {
      const incomes = incomesOf({ income: 18_000_000, payday: rule });
      for (let day = '2026-01-01'; day <= '2028-12-31'; day = addDays(day, 1)) {
        const cycle = payCycleOn(day, rule);
        const next = moneyNext(day, cycle, incomes, null);
        if (next.daysLeft !== cycle.daysLeft || next.on !== cycle.payday) {
          wrong.push(`${JSON.stringify(rule)} ${day}: ${next.on} for ${cycle.payday}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('falls back to the month’s last day when the plan has no income yet', () => {
    const rule: Payday = { kind: 'sameDay', day: 10 };
    const cycle = payCycleOn('2026-11-15', rule);
    expect(moneyNext('2026-11-15', cycle, incomesOf({ income: 0, payday: rule }), null)).toEqual({
      on: '2026-12-09',
      daysLeft: 24,
    });
  });
});

describe('payEvents', () => {
  it('pays weekly on the weekday and marks the fifth Friday of a month extra', () => {
    const fridays: Rhythm = { kind: 'weekly', weekday: FRIDAY };
    expect(payEvents([income(fridays)], '2026-01-01', '2026-01-31')).toEqual([
      { day: '2026-01-02', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-09', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-16', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-23', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-30', incomeId: 'a', amount: 4_000_000, extra: true },
    ]);
    expect(extrasOf(fridays, '2026-02-01', '2026-02-28')).toEqual([]);
  });

  it('marks exactly one pay extra in each five-Friday month of a year', () => {
    const fridays: Rhythm = { kind: 'weekly', weekday: FRIDAY };
    expect(daysOf(fridays, '2026-01-01', '2026-12-31')).toHaveLength(52);
    expect(extrasOf(fridays, '2026-01-01', '2026-12-31')).toEqual([
      '2026-01-30',
      '2026-05-29',
      '2026-07-31',
      '2026-10-30',
    ]);
  });

  it('counts from the start of the month, wherever the range starts', () => {
    const fridays: Rhythm = { kind: 'weekly', weekday: FRIDAY };
    expect(extrasOf(fridays, '2026-01-30', '2026-01-30')).toEqual(['2026-01-30']);
    expect(extrasOf(fridays, '2026-01-23', '2026-02-06')).toEqual(['2026-01-30']);
  });

  it('counts the extra pay inside the budget month, not the calendar month', () => {
    const fridays: Rhythm = { kind: 'weekly', weekday: FRIDAY };
    // 15 Jan to 14 Feb holds five Fridays: 16, 23, 30 Jan and 6, 13 Feb.
    expect(extrasOf(fridays, '2026-01-15', '2026-02-14', { kind: 'sameDay', day: 15 })).toEqual([
      '2026-02-13',
    ]);
  });

  it('pays every two weeks from the anchor, across the end of a month and a year', () => {
    const fortnight: Rhythm = { kind: 'everyTwoWeeks', anchor: '2026-12-25' };
    expect(daysOf(fortnight, '2026-12-01', '2027-01-31')).toEqual([
      '2026-12-11',
      '2026-12-25',
      '2027-01-08',
      '2027-01-22',
    ]);
    expect(daysOf(fortnight, '2028-02-15', '2028-03-15')).toEqual(['2028-02-18', '2028-03-03']);
  });

  it('marks the third fortnight of a month extra', () => {
    const fortnight: Rhythm = { kind: 'everyTwoWeeks', anchor: '2026-01-02' };
    expect(payEvents([income(fortnight)], '2026-01-01', '2026-02-28')).toEqual([
      { day: '2026-01-02', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-16', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-01-30', incomeId: 'a', amount: 4_000_000, extra: true },
      { day: '2026-02-13', incomeId: 'a', amount: 4_000_000, extra: false },
      { day: '2026-02-27', incomeId: 'a', amount: 4_000_000, extra: false },
    ]);
  });

  it('clamps a monthly day to February, in a leap year too', () => {
    for (const day of [29, 30, 31, 'last'] as const) {
      expect(daysOf({ kind: 'monthly', day }, '2026-02-01', '2026-02-28')).toEqual(['2026-02-28']);
      expect(daysOf({ kind: 'monthly', day }, '2028-02-01', '2028-02-29')).toEqual(['2028-02-29']);
    }
    expect(daysOf({ kind: 'monthly', day: 31 }, '2026-03-01', '2026-04-30')).toEqual([
      '2026-03-31',
      '2026-04-30',
    ]);
    expect(extrasOf({ kind: 'monthly', day: 31 }, '2026-01-01', '2028-12-31')).toEqual([]);
  });

  it('never marks a monthly pay extra, even when its day clamps beside the anchor', () => {
    // Anchored on the 30th: 28 Feb and 29 Mar both fall in the month that starts on 28 Feb.
    const anchor: Payday = { kind: 'sameDay', day: 30 };
    const monthly: Rhythm = { kind: 'monthly', day: 29 };
    expect(daysOf(monthly, '2026-02-01', '2026-03-31')).toEqual(['2026-02-28', '2026-03-29']);
    expect(extrasOf(monthly, '2026-01-01', '2028-12-31', anchor)).toEqual([]);
  });

  it('pays twice a month, the second day clamped or the last', () => {
    expect(
      daysOf({ kind: 'twiceMonthly', days: [15, 'last'] }, '2026-01-01', '2026-03-31'),
    ).toEqual(['2026-01-15', '2026-01-31', '2026-02-15', '2026-02-28', '2026-03-15', '2026-03-31']);
    expect(daysOf({ kind: 'twiceMonthly', days: [1, 30] }, '2028-02-01', '2028-02-29')).toEqual([
      '2028-02-01',
      '2028-02-29',
    ]);
    expect(
      extrasOf({ kind: 'twiceMonthly', days: [15, 'last'] }, '2026-01-01', '2028-12-31'),
    ).toEqual([]);
  });

  it('counts two days that clamp onto each other as one pay', () => {
    expect(
      daysOf({ kind: 'twiceMonthly', days: [30, 'last'] }, '2026-02-01', '2026-03-31'),
    ).toEqual(['2026-02-28', '2026-03-30', '2026-03-31']);
  });

  it('lists several incomes by day, and nothing for money that only lands', () => {
    const events = payEvents(
      [
        income({ kind: 'monthly', day: 5 }, 9_000_000, 'salary'),
        income({ kind: 'none' }, 0, 'landed'),
        income({ kind: 'weekly', weekday: 0 }, 0, 'tips'),
      ],
      '2026-11-01',
      '2026-11-10',
    );
    expect(events.map((event) => [event.day, event.incomeId, event.amount])).toEqual([
      ['2026-11-02', 'tips', 0],
      ['2026-11-05', 'salary', 9_000_000],
      ['2026-11-09', 'tips', 0],
    ]);
  });

  it('has nothing in a range that ends before it starts', () => {
    expect(daysOf({ kind: 'weekly', weekday: FRIDAY }, '2026-02-01', '2026-01-01')).toEqual([]);
  });
});

describe('moneyNext', () => {
  const rule: Payday = { kind: 'sameDay', day: 1 };
  const today = '2026-11-15';
  const cycle = payCycleOn(today, rule);

  it('is the next counted pay, strictly after today', () => {
    const fridays = [income({ kind: 'weekly', weekday: FRIDAY })];
    expect(moneyNext('2026-11-12', cycle, fridays, null)).toEqual({
      on: '2026-11-13',
      daysLeft: 1,
    });
    expect(moneyNext('2026-11-13', cycle, fridays, null)).toEqual({
      on: '2026-11-20',
      daysLeft: 7,
    });
  });

  it('takes the soonest of several incomes', () => {
    const incomes = [
      income({ kind: 'monthly', day: 'last' }, 9_000_000, 'salary'),
      income({ kind: 'everyTwoWeeks', anchor: '2026-11-06' }, 2_000_000, 'shifts'),
    ];
    expect(moneyNext(today, cycle, incomes, null)).toEqual({ on: '2026-11-20', daysLeft: 5 });
  });

  it('is never set by an income with no counted-on amount', () => {
    const landed = [
      income({ kind: 'weekly', weekday: FRIDAY }, 0, 'tips'),
      income({ kind: 'none' }, 0, 'jobs'),
    ];
    expect(moneyNext(today, cycle, landed, null)).toEqual({ on: '2026-11-30', daysLeft: 15 });
    expect(
      moneyNext(today, cycle, [...landed, income({ kind: 'monthly', day: 28 }, 5_000_000)], null),
    ).toEqual({ on: '2026-11-28', daysLeft: 13 });
  });

  it('lasts until the day the user asked for when no pay is counted on', () => {
    const landed = [income({ kind: 'none' }, 0)];
    expect(moneyNext(today, cycle, landed, '2026-12-20')).toEqual({
      on: '2026-12-20',
      daysLeft: 35,
    });
    expect(moneyNext(today, cycle, [], '2026-11-16')).toEqual({ on: '2026-11-16', daysLeft: 1 });
  });

  it('puts a counted pay before the day the user asked for', () => {
    const fridays = [income({ kind: 'weekly', weekday: FRIDAY })];
    expect(moneyNext(today, cycle, fridays, '2026-12-20').on).toBe('2026-11-20');
  });

  it('keeps a last-until day through the day itself, and ignores one that has passed', () => {
    const landed = [income({ kind: 'none' }, 0)];
    expect(moneyNext(today, cycle, landed, today)).toEqual({ on: today, daysLeft: 0 });
    for (const lastUntil of ['2026-11-14', '2026-11-01', '2025-12-31']) {
      expect(moneyNext(today, cycle, landed, lastUntil)).toEqual({
        on: '2026-11-30',
        daysLeft: 15,
      });
    }
  });
});

describe('moneyNextOf', () => {
  const plan = { income: 18_000_000, payday: { kind: 'sameDay', day: 1 } as const };

  it('is the pay cycle itself for a plan never asked about its incomes', () => {
    for (const day of ['2026-11-01', '2026-11-08', '2026-11-30']) {
      const cycle = payCycleOn(day, plan.payday);
      expect(moneyNextOf(day, plan)).toEqual({ on: cycle.payday, daysLeft: cycle.daysLeft });
    }
  });

  it('counts the days up to and including the day the money has to last until', () => {
    // 8 Nov to "end of month": 23 days to divide by, today and the 30th both counted, whether
    // the 30th was picked or left as the month's end.
    const landed = { ...plan, incomes: [income({ kind: 'none' }, 0)], lastUntil: '2026-11-30' };
    expect(moneyNextOf('2026-11-08', landed)).toEqual({ on: '2026-11-30', daysLeft: 22 });
    expect(moneyNextOf('2026-11-08', { ...landed, lastUntil: null })).toEqual({
      on: '2026-11-30',
      daysLeft: 22,
    });
  });

  it('runs to the next Friday for a weekly pay', () => {
    const weekly = { ...plan, incomes: [income({ kind: 'weekly', weekday: FRIDAY })] };
    expect(moneyNextOf('2026-11-13', weekly)).toEqual({ on: '2026-11-20', daysLeft: 7 });
  });
});
