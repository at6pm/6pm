import { describe, expect, it } from 'vitest';

import { addDays, type LocalDate } from '../time/local-date';
import { billsThisCycle } from './bills';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import {
  incomePeriod,
  leadIncome,
  reservedOn,
  type PeriodBill,
  type PeriodInput,
} from './income-period';
import { incomesOf, type Income } from './incomes';
import { payCycleOn, type Payday } from './pay-cycle';

const FRIDAY = 4;
const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

/** Example A: 4.000.000 every Friday, rent 3.000.000 due the 18th, jars 800.000 a month. */
const weekly: Income = {
  id: 'shifts',
  name: null,
  rhythm: { kind: 'weekly', weekday: FRIDAY },
  amount: 4_000_000,
};

function rent(paid: Partial<PeriodBill> = {}): PeriodBill {
  return { amount: 3_000_000, dueDay: 18, paidCycle: null, ...paid };
}

function periodOn(day: LocalDate, over: Partial<PeriodInput> = {}): PeriodInput {
  return {
    day,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    incomes: [weekly],
    bills: [rent()],
    jars: 800_000,
    joinedOn: '2026-09-01',
    lastUntil: null,
    ...over,
  };
}

/** The number for a period, with what was spent in the month before today and today. */
function numberOf(input: PeriodInput, spentBefore: number, spentToday = 0) {
  const period = incomePeriod(input);
  return dailyNumber({
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    period: {
      credited: period.credited,
      reserved: period.reserved,
      cap: period.cap,
      minDays: period.minDays,
      hold: period.hold,
    },
    spentBefore,
    today: spentToday > 0 ? [{ amount: spentToday, category: 'food', status: 'kept' }] : [],
    notDaily: new Set(),
    daysLeft: period.daysLeft,
  });
}

/** What the month has set aside by the end of `day`, everything together. */
function reservedBy(day: LocalDate, over: Partial<PeriodInput> = {}): number {
  const { required, kept } = reservedOn(periodOn(day, over));
  return required + kept;
}

describe('a weekly pay, as example A counts it', () => {
  it('sets aside a quarter of the rent and of the jars from each Friday', () => {
    // 6 Nov is the third pay since rent fell due on 18 Oct; 13 Nov the fourth.
    expect(reservedBy('2026-11-06') - reservedBy('2026-11-05')).toBe(950_000);
    expect(reservedBy('2026-11-13') - reservedBy('2026-11-12')).toBe(950_000);
    // November's own pays: half of the rent due on the 18th, two of four jar slices.
    expect(reservedOn(periodOn('2026-11-13'))).toEqual({ required: 1_900_000, kept: 0 });
  });

  it('gives 397.000 a day on Friday 13 Nov, with 130.000 left from the week before', () => {
    // Before this pay: 4.000.000 on 6 Nov, 950.000 set aside, 2.920.000 spent since 1 Nov.
    const input = periodOn('2026-11-13');
    const period = incomePeriod(input);
    expect(period).toMatchObject({ credited: 8_000_000, reserved: 1_900_000, on: '2026-11-20' });
    expect(period?.daysLeft).toBe(7);
    const day = numberOf(input, 2_920_000);
    expect(day.startFree).toBe(3_180_000);
    expect(day.line).toBe(397_000);
  });

  it('gives 411.000 tomorrow once 300.000 is spent', () => {
    const day = numberOf(periodOn('2026-11-13'), 2_920_000, 300_000);
    expect(day.free).toBe(2_880_000);
    expect(day.tomorrow).toBe(411_000);
  });

  it('counts what is in hand with the month’s pays', () => {
    const day = numberOf(periodOn('2026-11-13', { inHand: 130_000 }), 3_050_000);
    expect(day.startFree).toBe(3_180_000);
    expect(day.line).toBe(397_000);
  });
});

describe('joining part-way through a pay', () => {
  it('sets the whole rent aside from the pay before it is due, and the jar’s two slices', () => {
    // Example A: starting on Fri 13 Nov with nothing set aside. The next pay (the 20th) comes
    // after the rent (the 18th), so this pay covers all of it; it is the month's second pay.
    const input = periodOn('2026-11-13', { joinedOn: '2026-11-13' });
    expect(reservedOn(input)).toEqual({ required: 3_400_000, kept: 0 });
    expect(incomePeriod(input)).toMatchObject({ credited: 4_000_000, monthly: false });
    const day = numberOf(input, 0);
    expect(day.startFree).toBe(600_000);
    expect(day.line).toBe(75_000);
  });

  it('counts from the pay the joining day sits after, not from the joining day', () => {
    const input = periodOn('2026-11-15', { joinedOn: '2026-11-15' });
    expect(incomePeriod(input)).toMatchObject({ credited: 4_000_000, reserved: 3_400_000 });
    // Sunday through Friday the 20th: six days for 600.000.
    expect(numberOf(input, 0).line).toBe(100_000);
  });

  it('leaves out a bill that fell due before the day they joined', () => {
    // Joined on Sat 21 Nov: rent of the 18th is behind them; December's has one slice so far.
    const input = periodOn('2026-11-21', { joinedOn: '2026-11-21' });
    expect(reservedOn(input)).toEqual({ required: 750_000 + 600_000, kept: 0 });
    expect(incomePeriod(input)?.credited).toBe(4_000_000);
  });

  it('counts the month from its start for someone who joined in an earlier month', () => {
    expect(incomePeriod(periodOn('2026-11-15'))?.credited).toBe(8_000_000);
  });
});

describe('a bill paid early', () => {
  it('sets the rest of it aside the day it is paid, and the next pay takes none of it', () => {
    const paid = { bills: [rent({ paidCycle: '2026-11-01' })] };
    // Tue 10 Nov: three slices are in (two from October's pays); paying it takes the fourth now.
    expect(reservedBy('2026-11-10', paid) - reservedBy('2026-11-10')).toBe(750_000);
    expect(reservedBy('2026-11-10', paid)).toBe(1_500_000 + 200_000);
    // Friday's pay sets only the jars' slice aside.
    expect(reservedBy('2026-11-13', paid) - reservedBy('2026-11-10', paid)).toBe(200_000);
  });

  it('sets aside what was paid when it was not the bill’s amount', () => {
    const paid = { bills: [rent({ paidCycle: '2026-11-01', paidAmount: 3_200_000 })] };
    expect(reservedBy('2026-11-10', paid)).toBe(3_200_000 - 1_500_000 + 200_000);
  });

  it('leaves a bill paid in another month alone', () => {
    const paid = { bills: [rent({ paidCycle: '2026-10-01' })] };
    expect(reservedBy('2026-11-10', paid)).toBe(reservedBy('2026-11-10'));
  });
});

describe('an extra payday', () => {
  // October 2026 has five Fridays: 2, 9, 16, 23 and 30.
  const fridays = ['2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30'];

  it('keeps every pay’s slice the same, so the number stays flat', () => {
    for (const friday of fridays) {
      expect(reservedBy(friday) - reservedBy(addDays(friday, -1))).toBe(950_000);
    }
  });

  it('keeps aside what has no bill or jar to go to, for the buffer', () => {
    // The fifth pay since rent fell due on 18 Sep (the 16th) and the fifth in the month (the 30th).
    expect(reservedOn(periodOn('2026-10-15')).kept).toBe(0);
    expect(reservedOn(periodOn('2026-10-16')).kept).toBe(750_000);
    expect(reservedOn(periodOn('2026-10-30'))).toEqual({
      required: 3_000_000 + 800_000,
      kept: 750_000 + 200_000,
    });
  });

  it('frees the same each Friday: the 30th gives the line the 23rd gave', () => {
    const after = (friday: LocalDate) => {
      const input = periodOn(friday);
      const period = incomePeriod(input);
      return (period?.credited ?? 0) - (period?.reserved ?? 0);
    };
    expect(after('2026-10-30') - after('2026-10-23')).toBe(3_050_000);
    expect(after('2026-10-23') - after('2026-10-16')).toBe(3_050_000);
  });
});

describe('a fortnightly pay', () => {
  const fortnight: Income = {
    id: 'site',
    name: null,
    rhythm: { kind: 'everyTwoWeeks', anchor: '2026-11-06' },
    amount: 7_000_000,
  };

  it('takes half the rent from each pay, and all of what is left from the last before it is due', () => {
    // Pays on 23 Oct, 6 Nov, 20 Nov; rent due the 18th. 6 Nov is the last pay before it.
    const input = (day: LocalDate) => periodOn(day, { incomes: [fortnight] });
    expect(reservedOn(input('2026-11-05')).required).toBe(0);
    expect(reservedOn(input('2026-11-06')).required).toBe(1_500_000 + 400_000);
    expect(reservedOn(input('2026-11-20')).required).toBe(1_500_000 + 1_500_000 + 800_000);
  });
});

describe('the lead income', () => {
  it('is the one that brings the most in a usual month, the first of equals', () => {
    const salary: Income = {
      id: 'salary',
      name: null,
      rhythm: { kind: 'monthly', day: 25 },
      amount: 15_000_000,
    };
    expect(leadIncome([weekly, salary])).toBe(weekly);
    expect(leadIncome([salary, { ...weekly, amount: 3_000_000 }])).toBe(salary);
    expect(
      leadIncome([
        { ...weekly, amount: 0 },
        { ...weekly, id: 'b', rhythm: { kind: 'none' } },
      ]),
    ).toBeNull();
  });

  it('counts money that only lands when nothing is counted on', () => {
    expect(incomePeriod(periodOn('2026-11-13', { incomes: [{ ...weekly, amount: 0 }] })).kind).toBe(
      'landed',
    );
  });

  it('adds a side income’s pays to the month as they come', () => {
    const side: Income = {
      ...weekly,
      id: 'side',
      amount: 500_000,
      rhythm: { kind: 'monthly', day: 10 },
    };
    const input = periodOn('2026-11-13', { incomes: [weekly, side] });
    expect(incomePeriod(input)?.credited).toBe(8_500_000);
    expect(incomePeriod(input)?.reserved).toBe(1_900_000);
  });
});

/** Every payday rule there is: the 1st to the 31st, the last day, and "it varies". */
const paydays: Payday[] = [
  ...Array.from({ length: 31 }, (_, i): Payday => ({ kind: 'sameDay', day: i + 1 })),
  { kind: 'lastDay' },
  { kind: 'varies' },
];

describe('a monthly salary read as incomes', () => {
  const bills: PeriodBill[] = [
    { amount: 4_000_000, dueDay: 5, paidCycle: null },
    { amount: 1_200_000, dueDay: 31, paidCycle: null, lastMonth: '2027-06' },
  ];

  it('gives the same number as the plan always did, for every payday rule and every day of three years', () => {
    const wrong: string[] = [];
    for (const rule of paydays) {
      const incomes = incomesOf({ income: 18_000_000, payday: rule });
      for (let day = '2026-01-01'; day <= '2028-12-31'; day = addDays(day, 1)) {
        const cycle = payCycleOn(day, rule);
        const cycleBills = bills.map((bill, i) =>
          i === 0 && day.endsWith('7')
            ? { ...bill, paidCycle: cycle.start, paidAmount: 4_100_000 }
            : bill,
        );
        const planned: DailyNumberInput = {
          plan: {
            income: 18_000_000,
            bills: billsThisCycle(cycleBills, cycle),
            futureYou: 2_000_000,
            occasions: 650_000,
            topUps: 100_000,
          },
          spentBefore: 3_210_000,
          moneyIn: 40_000,
          today: [{ amount: 95_000, category: 'food', status: 'caught' }],
          notDaily: new Set(),
          daysLeft: cycle.daysLeft,
          share: 0.6,
          beforeJoining: null,
        };
        const reserved = reservedOn({
          day,
          cycle,
          anchor: rule,
          incomes,
          bills: cycleBills,
          jars: 2_650_000,
          joinedOn: '2025-12-01',
        });
        const period = incomePeriod({
          day,
          cycle,
          anchor: rule,
          incomes,
          bills: cycleBills,
          jars: 2_650_000,
          joinedOn: '2025-12-01',
          lastUntil: null,
        });
        const withPeriod = dailyNumber({
          ...planned,
          daysLeft: period.daysLeft,
          period: {
            credited: period.credited,
            reserved: period.reserved,
            cap: period.cap,
            minDays: period.minDays,
            hold: period.hold,
          },
        });
        if (
          reserved.required !== planned.plan.bills + 2_650_000 ||
          reserved.kept !== 0 ||
          JSON.stringify(withPeriod) !== JSON.stringify(dailyNumber(planned))
        ) {
          wrong.push(`${JSON.stringify(rule)} ${day}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });
});
