import { describe, expect, it } from 'vitest';

import type { LocalDate } from '../time/local-date';
import { dailyNumber } from './daily-number';
import { incomePeriod, type PeriodBill, type PeriodInput } from './income-period';
import type { Income } from './incomes';
import { payCycleOn, type Payday } from './pay-cycle';
import { payStretch, perPayOf, stretchDays, stretchMaths } from './pay-stretch';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

/** Example A: 4.000.000 every Friday, rent 3.000.000 due the 18th, jars 800.000 a month. */
const weekly: Income = {
  id: 'shifts',
  name: null,
  rhythm: { kind: 'weekly', weekday: 4 },
  amount: 4_000_000,
};
const rent: PeriodBill = { amount: 3_000_000, dueDay: 18, paidCycle: null };

function on(day: LocalDate, over: Partial<PeriodInput> = {}): PeriodInput {
  return {
    day,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    incomes: [weekly],
    bills: [rent],
    jars: 800_000,
    joinedOn: '2026-09-01',
    lastUntil: null,
    ...over,
  };
}

function dayOf(input: PeriodInput, spentBefore: number) {
  const period = incomePeriod(input);
  return dailyNumber({
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    period: { credited: period.credited, reserved: period.reserved },
    spentBefore,
    today: [],
    notDaily: new Set(),
    daysLeft: period.daysLeft,
  });
}

describe('a pay, as Plan draws it for example A', () => {
  it('is Friday 13 Nov’s 4.000.000: rent’s fourth slice makes it whole, the jars take a quarter', () => {
    const stretch = payStretch(on('2026-11-13'));
    expect(stretch).toMatchObject({
      payOn: '2026-11-13',
      pay: 4_000_000,
      next: '2026-11-20',
      daysLeft: 7,
      extra: false,
      base: 4,
      billSlice: 750_000,
      jarSlice: 200_000,
      jarSlices: 1,
      kept: 0,
      free: 3_050_000,
      whole: false,
      joinedGap: false,
    });
    expect(stretch?.bills).toEqual([
      {
        index: 0,
        due: '2026-11-18',
        amount: 3_000_000,
        slice: 750_000,
        gap: 0,
        usual: 750_000,
        whole: true,
        count: 4,
        slices: ['earlier', 'earlier', 'earlier', 'this'],
        joined: false,
      },
    ]);
  });

  it('adds up to 397.000 a day with 130.000 left from the week before', () => {
    const input = on('2026-11-13');
    const stretch = payStretch(input)!;
    const day = dayOf(input, 2_920_000);
    expect(day.line).toBe(397_000);
    const rows = stretchMaths(stretch, {
      startFree: day.startFree,
      line: day.line,
      inHand: 0,
      spentSince: 0,
    });
    expect(rows.map((r) => [r.kind, r.amount])).toEqual([
      ['pay', 4_000_000],
      ['bill', -750_000],
      ['jars', -200_000],
      ['freePay', 3_050_000],
      ['leftBefore', 130_000],
      ['divide', 3_180_000],
      ['each', 397_000],
    ]);
    expect(rows.find((r) => r.kind === 'bill')).toMatchObject({ count: 4, whole: true });
    expect(rows.find((r) => r.kind === 'jars')).toMatchObject({ count: 1, base: 4 });
    expect(rows.find((r) => r.kind === 'divide')?.count).toBe(8);
  });

  it('says what was spent since the pay on the days after it', () => {
    // Saturday, 300.000 spent on Friday: 2.880.000 over the 7 days to Fri 20 is 411.000.
    const input = on('2026-11-14');
    const stretch = payStretch(input)!;
    expect(stretch).toMatchObject({ payOn: '2026-11-13', free: 3_050_000, daysLeft: 6 });
    const day = dayOf(input, 2_920_000 + 300_000);
    expect(day.line).toBe(411_000);
    const rows = stretchMaths(stretch, {
      startFree: day.startFree,
      line: day.line,
      inHand: 0,
      spentSince: 300_000,
    });
    expect(rows.map((r) => [r.kind, r.amount])).toEqual([
      ['pay', 4_000_000],
      ['bill', -750_000],
      ['jars', -200_000],
      ['freePay', 3_050_000],
      ['leftBefore', 130_000],
      ['spentSince', -300_000],
      ['divide', 2_880_000],
      ['each', 411_000],
    ]);
  });

  it('draws Free as the eight days from the pay through the next', () => {
    const days = stretchDays({
      payOn: '2026-11-13',
      next: '2026-11-20',
      today: '2026-11-13',
      line: 397_000,
      free: 3_180_000,
      spends: [],
      notDaily: new Set(),
    });
    expect(days).toHaveLength(8);
    expect(days.map((d) => d.kind)).toEqual(['today', ...Array<string>(7).fill('future')]);
  });
});

describe('the gap week, joining on Fri 13 Nov', () => {
  it('covers the rent earlier pays never set aside, and takes two of the jars’ four slices', () => {
    const input = on('2026-11-13', { joinedOn: '2026-11-13' });
    const stretch = payStretch(input);
    expect(stretch).toMatchObject({
      pay: 4_000_000,
      billSlice: 3_000_000,
      jarSlice: 400_000,
      jarSlices: 2,
      free: 600_000,
      joinedGap: true,
    });
    expect(stretch?.bills[0]).toMatchObject({
      slice: 3_000_000,
      gap: 2_250_000,
      usual: 750_000,
      whole: true,
      slices: ['gap', 'gap', 'gap', 'this'],
      joined: true,
    });
    const day = dayOf(input, 0);
    expect(day.line).toBe(75_000);
  });

  it('is the same pay for someone who joined on the Sunday after it', () => {
    const input = on('2026-11-15', { joinedOn: '2026-11-15' });
    const stretch = payStretch(input);
    expect(stretch).toMatchObject({
      payOn: '2026-11-13',
      billSlice: 3_000_000,
      jarSlice: 400_000,
      free: 600_000,
      daysLeft: 5,
    });
    expect(dayOf(input, 0).line).toBe(100_000);
  });

  it('is an ordinary pay a week later, with the slices before it set aside earlier', () => {
    const stretch = payStretch(on('2026-11-20', { joinedOn: '2026-11-13' }));
    expect(stretch).toMatchObject({ billSlice: 750_000, jarSlice: 200_000, joinedGap: false });
    // December's rent: the pay of the 20th is its first slice.
    expect(stretch?.bills[0]).toMatchObject({
      due: '2026-12-18',
      count: 1,
      whole: false,
      slices: ['this', 'coming', 'coming', 'coming'],
    });
  });
});

describe('a pay beyond the usual count', () => {
  it('keeps the slice that has nothing to go to, and frees what any Friday frees', () => {
    // Fri 30 Oct 2026 is October's fifth: the jars are whole, rent takes its slice for 18 Nov.
    const stretch = payStretch(on('2026-10-30'));
    expect(stretch).toMatchObject({
      extra: true,
      ofMonth: 5,
      billSlice: 750_000,
      jarSlice: 0,
      kept: 200_000,
      free: 3_050_000,
      whole: false,
    });
  });

  it('keeps all of it when the bills and the jars are already whole', () => {
    // Fri 16 Oct is the fifth pay since rent fell due on 18 Sep.
    const stretch = payStretch(on('2026-10-16'));
    expect(stretch).toMatchObject({ billSlice: 0, jarSlice: 200_000, kept: 750_000 });
    expect(stretch?.bills[0]).toMatchObject({ whole: true, count: 5 });
    expect(stretch?.bills[0]?.slices).toEqual(['earlier', 'earlier', 'earlier', 'earlier']);
    const whole = payStretch(on('2026-10-16', { jars: 0 }));
    expect(whole).toMatchObject({ kept: 750_000, whole: true, free: 3_250_000 });
  });
});

describe('a pay that has not landed', () => {
  it('keeps the stretch of the pay before it while the month waits', () => {
    const sixth = { incomeId: 'shifts', day: '2026-11-06', amount: 4_000_000 };
    expect(payStretch(on('2026-11-13', { placed: [sixth] }))?.payOn).toBe('2026-11-06');
    const late = payStretch(
      on('2026-11-14', { placed: [sixth, { ...sixth, day: '2026-11-14', amount: 3_800_000 }] }),
    );
    expect(late).toMatchObject({ payOn: '2026-11-14', pay: 3_800_000 });
  });
});

describe('plans a stretch is not for', () => {
  it('is null for a monthly lead and for money that only lands', () => {
    const salary: Income = {
      id: 's',
      name: null,
      rhythm: { kind: 'monthly', day: 25 },
      amount: 20_000_000,
    };
    const jobs: Income = { id: 'j', name: null, rhythm: { kind: 'none' }, amount: 0 };
    expect(payStretch(on('2026-11-13', { incomes: [salary] }))).toBeNull();
    expect(payStretch(on('2026-11-13', { incomes: [jobs] }))).toBeNull();
  });
});

describe('each payday’s share of a month', () => {
  it('is a quarter for a weekly pay, a half for a fortnightly one, and all of it for a salary', () => {
    expect(perPayOf(1_900_000, [weekly])).toBe(475_000);
    expect(perPayOf(800_000, undefined)).toBe(800_000);
    const fortnight: Income = {
      ...weekly,
      rhythm: { kind: 'everyTwoWeeks', anchor: '2026-11-06' },
    };
    expect(perPayOf(1_000_000, [fortnight])).toBe(500_000);
    const salary: Income = { ...weekly, rhythm: { kind: 'monthly', day: 25 } };
    expect(perPayOf(800_000, [salary])).toBe(800_000);
  });
});
