import { describe, expect, it } from 'vitest';

import { addDays, type LocalDate } from '../time/local-date';
import { addsToFree, sumMoneyIn } from '../spend/money-in';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import {
  carriesOver,
  incomePeriod,
  type IncomePeriod,
  type PeriodBill,
  type PeriodInput,
  type PlacedPay,
} from './income-period';
import type { Income } from './incomes';
import { bufferOf, coverDays, cycleCarry, lineCap } from './landed';
import { nextPay, nextPayJarLine } from './next-pay';
import { payCycleOn, type Payday } from './pay-cycle';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

/** Example B: freelance work that only lands; rent, a phone and Future you. */
const jobs: Income = { id: 'jobs', name: null, rhythm: { kind: 'none' }, amount: 0 };
const bills: PeriodBill[] = [
  { amount: 3_000_000, dueDay: 5, paidCycle: null },
  { amount: 200_000, dueDay: 10, paidCycle: null },
];
const FUTURE_YOU = 500_000;

/** Closed days before `day`, the latest first, each having spent `spent` against `line`. */
function closed(day: LocalDate, count: number, spent: number, line = spent) {
  return Array.from({ length: count }, (_, i) => ({ day: addDays(day, -1 - i), spent, line }));
}

/** The 18.000.000 that lands on 8 Nov, 2.000.000 having been held back by the client. */
const landing: PlacedPay = { incomeId: 'jobs', day: '2026-11-08', amount: 18_000_000 };

function landedOn(day: LocalDate, over: Partial<PeriodInput> = {}): PeriodInput {
  return {
    day,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    incomes: [jobs],
    bills,
    jars: FUTURE_YOU,
    joinedOn: '2026-09-01',
    lastUntil: null,
    placed: [landing],
    closedDays: closed('2026-11-08', 28, 200_000),
    ...over,
  };
}

function numberOf(period: IncomePeriod, spentBefore: number): ReturnType<typeof dailyNumber> {
  const input: DailyNumberInput = {
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    period: {
      credited: period.credited,
      reserved: period.reserved,
      cap: period.cap,
      minDays: period.minDays,
      hold: period.hold,
    },
    spentBefore,
    today: [],
    notDaily: new Set(),
    daysLeft: period.daysLeft,
  };
  return dailyNumber(input);
}

describe('money that only lands, as example B counts it', () => {
  it('sets the month aside from the 18.000.000 that landed, and caps the line at the usual day', () => {
    const period = incomePeriod(landedOn('2026-11-08'));
    expect(period).toMatchObject({
      kind: 'landed',
      credited: 18_000_000,
      required: 3_700_000,
      reserved: 3_700_000,
      stillNeeded: 0,
      cap: 300_000,
      on: '2026-11-30',
      daysLeft: 22,
    });
    const day = numberOf(period, 0);
    expect(day.startFree).toBe(14_300_000);
    // Evenly over the 23 days through the month's end, 30 Nov, it would be 621.000.
    expect(Math.floor(day.startFree / 23 / 1000) * 1000).toBe(621_000);
    expect(day.line).toBe(300_000);
    expect(bufferOf(day.startFree, day.line, period.daysLeft)).toBe(7_400_000);
  });

  it('has 11.300.000 on 20 Nov after twelve days at 250.000 with nothing landing', () => {
    // The twelve days closed at the capped 300.000 line; the cap reads what they spent, so the
    // line never lifts its own cap. With the usual day still 200.000, it holds at 300.000.
    const usual = [
      ...closed('2026-11-20', 12, 200_000, 300_000),
      ...closed('2026-11-08', 16, 200_000),
    ];
    const period = incomePeriod(landedOn('2026-11-20', { closedDays: usual }));
    expect(period.cap).toBe(300_000);
    const day = numberOf(period, 12 * 250_000);
    expect(day.startFree).toBe(11_300_000);
    expect(day.line).toBe(300_000);
    // Twelve days that really spent 250.000 move the usual day to 221.428, and the cap with it.
    const spent = [
      ...closed('2026-11-20', 12, 250_000, 300_000),
      ...closed('2026-11-08', 16, 200_000),
    ];
    expect(incomePeriod(landedOn('2026-11-20', { closedDays: spent })).cap).toBe(332_000);
  });

  it('walks forward to count the days covered, paying December’s bills and jars as they come', () => {
    const cycle = payCycleOn('2026-11-20', CALENDAR);
    const covered = coverDays({
      day: '2026-11-20',
      pool: 11_300_000,
      line: 300_000,
      cycle,
      anchor: CALENDAR,
      bills,
      jars: FUTURE_YOU,
    });
    // Divided without the walk it would read 37; December's 3.700.000 takes twelve of them.
    expect(Math.floor(11_300_000 / 300_000)).toBe(37);
    expect(covered).toBe(25);
    expect(
      coverDays({
        day: '2026-11-20',
        pool: 11_300_000,
        line: 0,
        cycle,
        anchor: CALENDAR,
        bills,
        jars: 0,
      }),
    ).toBeNull();
    expect(
      coverDays({
        day: '2026-11-20',
        pool: 600_000,
        line: 300_000,
        cycle,
        anchor: CALENDAR,
        bills,
        jars: 0,
        stillNeeded: 300_000,
      }),
    ).toBe(1);
  });

  it('carries what is in hand into the month with what lands', () => {
    const period = incomePeriod(landedOn('2026-12-02', { placed: [], inHand: 7_000_000 }));
    expect(period).toMatchObject({ credited: 7_000_000, reserved: 3_700_000, stillNeeded: 0 });
  });
});

describe('nothing landed yet', () => {
  it('sets aside only what there is, owes the rest, and has no line', () => {
    const period = incomePeriod(landedOn('2026-11-03', { placed: [], closedDays: [] }));
    expect(period).toMatchObject({ credited: 0, reserved: 0, stillNeeded: 3_700_000 });
    const day = numberOf(period, 0);
    expect(day.line).toBe(0);
    expect(day.overspent).toBe(false);
  });

  it('never opens a month overspent: what lands short of the bills goes to the bills', () => {
    const short = incomePeriod(
      landedOn('2026-11-08', { placed: [{ ...landing, amount: 2_500_000 }] }),
    );
    expect(short).toMatchObject({
      credited: 2_500_000,
      reserved: 2_500_000,
      stillNeeded: 1_200_000,
    });
    expect(numberOf(short, 0).startFree).toBe(0);
  });
});

describe('the cap’s first week', () => {
  it('has no cap before seven closed days, and spreads over at least six weeks', () => {
    const period = incomePeriod(
      landedOn('2026-11-08', { closedDays: closed('2026-11-08', 6, 200_000) }),
    );
    expect(period).toMatchObject({ cap: null, minDays: 42 });
    const day = numberOf(period, 0);
    expect(day.line).toBe(340_000);
    expect(day.tomorrow).toBe(348_000);
  });

  it('reads the usual day from what the last 28 closed days spent, floored to a step', () => {
    expect(lineCap(closed('2026-11-08', 6, 200_000), '2026-11-08')).toBeNull();
    expect(lineCap(closed('2026-11-08', 7, 200_000), '2026-11-08')).toBe(300_000);
    // The lines the days closed at do not move it.
    expect(lineCap(closed('2026-11-08', 7, 200_000, 900_000), '2026-11-08')).toBe(300_000);
    // Older than the last 28, and days that spent nothing, say nothing.
    const days = [
      ...closed('2026-11-08', 28, 201_000),
      ...closed('2026-10-11', 30, 900_000),
      { day: '2026-11-07', spent: 0, line: 0 },
    ];
    expect(lineCap(days, '2026-11-08')).toBe(301_000);
    expect(
      lineCap([...closed('2026-11-08', 3, 0), ...closed('2026-11-05', 6, 200_000)], '2026-11-08'),
    ).toBeNull();
    // Today's own close is not part of the usual day it is capped by.
    expect(lineCap(closed('2026-11-09', 7, 200_000), '2026-11-07')).toBeNull();
  });
});

describe('a counted pay counts when it lands', () => {
  const weekly: Income = {
    id: 'shifts',
    name: null,
    rhythm: { kind: 'weekly', weekday: 4 },
    amount: 4_000_000,
  };
  const rent: PeriodBill = { amount: 3_000_000, dueDay: 18, paidCycle: null };
  const weekOn = (day: LocalDate, placed: PlacedPay[], heldLine: number | null = 380_000) =>
    incomePeriod({
      day,
      cycle: payCycleOn(day, CALENDAR),
      anchor: CALENDAR,
      incomes: [weekly],
      bills: [rent],
      jars: 800_000,
      joinedOn: '2026-09-01',
      lastUntil: null,
      placed,
      heldLine,
    });
  const sixth: PlacedPay = { incomeId: 'shifts', day: '2026-11-06', amount: 4_000_000 };

  it('waits on Friday while the pay has not landed, holding the line to what is left', () => {
    const period = weekOn('2026-11-13', [sixth]);
    expect(period).toMatchObject({
      waiting: true,
      credited: 4_000_000,
      reserved: 950_000,
      hold: 380_000,
      // The late pay is still the next money, due today; nothing past it is divided over.
      on: '2026-11-13',
      due: '2026-11-13',
      daysLeft: 0,
      coming: 4_000_000,
    });
    // 130.000 is left of the week before: the day stays at 380.000 as far as that goes.
    expect(numberOf(period, 2_920_000)).toMatchObject({ line: 130_000, tomorrow: 130_000 });
    expect(numberOf({ ...period, reserved: 0 }, 0)).toMatchObject({
      line: 380_000,
      tomorrow: 380_000,
    });
  });

  it('keeps waiting for the pay on the days after its date', () => {
    const period = weekOn('2026-11-15', [sixth]);
    expect(period).toMatchObject({
      waiting: true,
      on: '2026-11-13',
      due: '2026-11-13',
      daysLeft: 0,
      hold: 380_000,
    });
    // 3.000.000 left and in hand: the day holds at 380.000, not the whole of it.
    expect(numberOf({ ...period, credited: 3_950_000 }, 0).line).toBe(380_000);
  });

  it('spreads what is left through the pay after the late one when no day before it is known', () => {
    const period = weekOn('2026-11-13', [sixth], null);
    expect(period).toMatchObject({ waiting: true, on: '2026-11-13', hold: null, daysLeft: 7 });
    expect(numberOf(period, 2_920_000).line).toBe(16_000);
  });

  it('counts the pay from the day it lands, with its slices', () => {
    const period = weekOn('2026-11-14', [sixth, { ...sixth, day: '2026-11-14' }]);
    expect(period).toMatchObject({ waiting: false, credited: 8_000_000, reserved: 1_900_000 });
    expect(numberOf(period, 2_920_000).line).toBe(454_000);
  });

  it('counts a pay that lands early from that day', () => {
    const period = weekOn('2026-11-12', [sixth, { ...sixth, day: '2026-11-12' }]);
    expect(period).toMatchObject({ waiting: false, credited: 8_000_000, reserved: 1_900_000 });
  });

  it('counts the actual amount that landed', () => {
    const period = weekOn('2026-11-06', [{ ...sixth, amount: 3_800_000 }]);
    expect(period.credited).toBe(3_800_000);
  });
});

describe('money in that is the pay of an income with nothing counted on', () => {
  const pay = { amount: 2_000_000, status: 'kept', direction: 'in', moneyIn: 'pay' } as const;

  it('adds to free money, while a counted pay never does', () => {
    const landed = new Set(['tips']);
    expect(addsToFree({ ...pay, incomeId: 'tips' }, landed)).toBe(true);
    expect(addsToFree({ ...pay, incomeId: 'salary' }, landed)).toBe(false);
    expect(addsToFree({ ...pay, incomeId: null }, landed)).toBe(false);
    expect(addsToFree({ ...pay, incomeId: 'tips' })).toBe(false);
    expect(addsToFree({ ...pay, moneyIn: 'payback', incomeId: 'tips' }, landed)).toBe(false);
    expect(
      sumMoneyIn(
        [
          { ...pay, incomeId: 'tips' },
          { ...pay, moneyIn: 'spread' },
        ],
        landed,
      ),
    ).toBe(4_000_000);
  });
});

describe('carrying a month over', () => {
  it('carries only for a plan whose lead income is not a monthly pay', () => {
    const monthly: Income = {
      id: 's',
      name: null,
      rhythm: { kind: 'monthly', day: 25 },
      amount: 9_000_000,
    };
    const weekly: Income = {
      id: 'w',
      name: null,
      rhythm: { kind: 'weekly', weekday: 4 },
      amount: 1_000_000,
    };
    expect(carriesOver({})).toBe(false);
    expect(carriesOver({ incomes: [monthly] })).toBe(false);
    expect(carriesOver({ incomes: [monthly, weekly] })).toBe(false);
    expect(carriesOver({ incomes: [monthly, { ...weekly, amount: 3_000_000 }] })).toBe(true);
    expect(carriesOver({ incomes: [jobs] })).toBe(true);
    expect(carriesOver({ incomes: [] })).toBe(true);
  });

  it('carries what was free at the end, never below nothing, and what extra pays kept', () => {
    expect(cycleCarry({ free: 1_200_000, kept: 0 })).toBe(1_200_000);
    expect(cycleCarry({ free: -300_000, kept: 950_000 })).toBe(950_000);
  });
});

describe('the next pay, projected', () => {
  const weekly: Income = {
    id: 'shifts',
    name: null,
    rhythm: { kind: 'weekly', weekday: 4 },
    amount: 4_000_000,
  };
  const input = {
    today: '2026-11-14',
    anchor: CALENDAR,
    incomes: [weekly],
    bills: [{ amount: 3_000_000, dueDay: 18, paidCycle: null }],
    jars: 800_000,
  };

  it('frees the pay less its slices, over its days through the pay after it', () => {
    expect(nextPay(input)).toEqual({
      on: '2026-11-20',
      until: '2026-11-27',
      jars: 200_000,
      daily: 381_000,
    });
  });

  it('is the late pay while the month waits for it, as Plan names it', () => {
    // Friday 20 has come and its pay has not landed: the reminder speaks of it, not of the 27th.
    expect(nextPay({ ...input, today: '2026-11-20', waitingFor: '2026-11-20' })).toMatchObject({
      on: '2026-11-20',
      until: '2026-11-27',
    });
    expect(nextPay({ ...input, today: '2026-11-20' })).toMatchObject({ on: '2026-11-27' });
  });

  it('shows the line with a jar still taking its part, and once it stops', () => {
    expect(nextPayJarLine({ ...input, took: 400_000 })).toEqual({
      before: 381_000,
      after: 393_000,
    });
  });

  it('is not for a monthly lead or money that only lands', () => {
    const salary: Income = {
      id: 's',
      name: null,
      rhythm: { kind: 'monthly', day: 25 },
      amount: 20_000_000,
    };
    expect(nextPay({ ...input, incomes: [salary, weekly] })).toBeNull();
    expect(nextPay({ ...input, incomes: [jobs] })).toBeNull();
  });
});
