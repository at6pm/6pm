import { describe, expect, it } from 'vitest';

import { addDays, type LocalDate } from '../time/local-date';
import { dailyNumber } from './daily-number';
import { incomePeriod, type PeriodBill, type PeriodInput, type PlacedPay } from './income-period';
import type { Income } from './incomes';
import {
  landedMaths,
  landedView,
  lastUntilChoices,
  lastUntilPreview,
  setAsideNamed,
} from './landed-view';
import { payCycleOn, type Payday } from './pay-cycle';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

/** Example B as the canvas draws it: rent due Tue 10, the phone Fri 20, Future you 500.000. */
const jobs: Income = { id: 'jobs', name: null, rhythm: { kind: 'none' }, amount: 0 };
const bills: PeriodBill[] = [
  { amount: 3_000_000, dueDay: 10, paidCycle: null },
  { amount: 200_000, dueDay: 20, paidCycle: null },
];
const FUTURE_YOU = 500_000;
const studioMay: PlacedPay = { incomeId: 'jobs', day: '2026-11-08', amount: 18_000_000 };

/** Closed days before `day`, each having spent `spent`: a usual day of 200.000 by default. */
function closed(day: LocalDate, count: number, spent = 200_000) {
  return Array.from({ length: count }, (_, i) => ({ day: addDays(day, -1 - i), spent, line: 0 }));
}

function viewOn(day: LocalDate, over: Partial<PeriodInput> = {}, spentBefore = 0) {
  const input: PeriodInput = {
    day,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    incomes: [jobs],
    bills,
    jars: FUTURE_YOU,
    joinedOn: '2026-09-01',
    lastUntil: null,
    placed: [studioMay],
    closedDays: closed('2026-11-08', 28),
    ...over,
  };
  const period = incomePeriod(input);
  const number = dailyNumber({
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    period: {
      credited: period.credited,
      reserved: period.reserved,
      cap: period.cap,
      minDays: period.minDays,
      ahead: period.ahead,
    },
    spentBefore,
    today: [],
    notDaily: new Set(),
    daysLeft: period.daysLeft,
  });
  const landings = (input.placed ?? []).filter((p) => p.day <= day).map((p) => p.amount);
  const view = landedView({
    today: day,
    cycle: input.cycle,
    anchor: CALENDAR,
    period,
    startFree: number.startFree,
    landings,
    inHand: 0,
    bills,
    futureYou: FUTURE_YOU,
    otherJars: 0,
  });
  return { view, landings, number };
}

describe('before anything has landed (Mon 2 Nov)', () => {
  it('makes no number and says what the bills still need, earliest first', () => {
    const { view, number } = viewOn('2026-11-02', { placed: [] });
    expect(number.line).toBe(0);
    expect(view).toMatchObject({
      state: 'empty',
      landed: 0,
      required: 3_700_000,
      reserved: 0,
      stillNeeded: 3_700_000,
      billsStillNeed: 3_200_000,
    });
    expect(view.items.map((i) => [i.kind, i.due, i.amount, i.covered])).toEqual([
      ['bill', '2026-11-10', 3_000_000, 0],
      ['bill', '2026-11-20', 200_000, 0],
      ['futureYou', null, 500_000, 0],
    ]);
    expect(view.nextNeed).toMatchObject({ index: 0, due: '2026-11-10' });
  });

  it('fills the bills first, earliest due date first, when a landing is too small', () => {
    const { view } = viewOn('2026-11-08', { placed: [{ ...studioMay, amount: 2_500_000 }] });
    expect(view).toMatchObject({ state: 'short', stillNeeded: 1_200_000, billsStillNeed: 700_000 });
    expect(view.items.map((i) => i.covered)).toEqual([2_500_000, 0, 0]);
  });
});

describe('the landing becomes the number (Sun 8 Nov, example B)', () => {
  it('sets 3.700.000 aside, caps the day at 300.000 and keeps the rest in hand', () => {
    const { view } = viewOn('2026-11-08');
    expect(view).toMatchObject({
      state: 'landed',
      landed: 18_000_000,
      landings: 1,
      bills: 3_200_000,
      jars: 500_000,
      toShare: 14_300_000,
      pool: 14_300_000,
      on: '2026-11-30',
      stretchDays: 23,
      evenly: 621_000,
      capped: 300_000,
      spreadDays: null,
      line: 300_000,
      atLine: 6_900_000,
      beyond: 7_400_000,
    });
  });

  it('covers 36 days, to 13 Dec, paying December’s jars and rent on the way', () => {
    const { view } = viewOn('2026-11-08');
    expect(view).toMatchObject({ covered: 36, coveredTo: '2026-12-13', inHandDays: 13 });
  });

  it('adds up in Today’s maths', () => {
    const { view, landings } = viewOn('2026-11-08');
    expect(landedMaths(view, landings).map((r) => [r.kind, r.amount, r.count ?? null])).toEqual([
      ['landed', 18_000_000, null],
      ['bills', -3_200_000, null],
      ['jars', -500_000, null],
      ['toShare', 14_300_000, null],
      ['evenly', 621_000, 23],
      ['cap', 300_000, null],
      ['atLine', 6_900_000, 23],
      ['beyond', 7_400_000, 13],
    ]);
  });

  it('spreads over six weeks before there are seven closed days, paying December on the way', () => {
    const { view, number } = viewOn('2026-11-08', { closedDays: closed('2026-11-08', 6) });
    // Six weeks from 8 Nov reach 19 Dec: December's jars (1 Dec) and rent (10 Dec) come out first,
    // so the day is 10.800.000 over 42 days, and the money lasts every one of them.
    expect(view).toMatchObject({
      capped: null,
      spreadDays: 42,
      ahead: 3_500_000,
      through: '2026-12-19',
      line: 257_000,
      covered: 42,
      coveredTo: '2026-12-19',
      inHandDays: 19,
    });
    expect(number.line).toBe(view.line);
    expect(landedMaths(view, [18_000_000]).find((r) => r.kind === 'spread')).toMatchObject({
      amount: 257_000,
      count: 42,
    });
    expect(landedMaths(view, [18_000_000]).find((r) => r.kind === 'ahead')).toMatchObject({
      amount: -3_500_000,
      on: '2026-12-19',
    });
  });
});

describe('twelve days with nothing landed (Fri 20 Nov)', () => {
  it('holds the day at 300.000 with 11.300.000 left, covered to 15 Dec', () => {
    // The usual day is still 200.000 (as the canvas has it), so the cap still holds the day.
    const { view } = viewOn('2026-11-20', { closedDays: closed('2026-11-20', 28) }, 12 * 250_000);
    expect(view).toMatchObject({ pool: 11_300_000, line: 300_000, capped: 300_000 });
    expect(view).toMatchObject({ covered: 26, coveredTo: '2026-12-15', inHandDays: 15 });
  });
});

describe('make it last until', () => {
  const base = {
    today: '2026-11-08',
    pool: 14_300_000,
    cap: 300_000,
    minDays: 0,
    cycle: payCycleOn('2026-11-08', CALENDAR),
    anchor: CALENDAR,
    bills,
    jars: FUTURE_YOU,
  } as const;

  it('gives the capped day for a date nearer than the money reaches, and Plan’s days in hand', () => {
    // The days in hand are the ones Plan says for the same day (13), December's rent and jars paid.
    expect(lastUntilPreview({ ...base, until: '2026-11-30' })).toEqual({
      until: '2026-11-30',
      days: 23,
      line: 300_000,
      beyond: 7_400_000,
      inHandDays: 13,
      coveredTo: '2026-12-13',
    });
    expect(viewOn('2026-11-08').view).toMatchObject({ inHandDays: 13, coveredTo: '2026-12-13' });
  });

  it('gives less for a date past what the money reaches, keeping December’s bills', () => {
    // 8 Nov to 31 Dec is 54 days; December takes 3.700.000 within them: 10.600.000 over 54.
    expect(lastUntilPreview({ ...base, until: '2026-12-31' })).toMatchObject({
      days: 54,
      line: 196_000,
      inHandDays: 0,
      coveredTo: '2026-12-31',
    });
    // Saved, Plan and the daily number say the same day.
    const saved = viewOn('2026-11-08', { lastUntil: '2026-12-31' });
    expect(saved.view).toMatchObject({ line: 196_000, stretchDays: 54, inHandDays: 0 });
    expect(saved.number.line).toBe(196_000);
  });

  it('offers the month’s end, then the 15th and the end of the months after', () => {
    expect(lastUntilChoices('2026-11-08', CALENDAR)).toEqual([
      '2026-11-30',
      '2026-12-15',
      '2026-12-31',
      '2027-01-15',
      '2027-01-31',
      '2027-02-15',
      '2027-02-28',
    ]);
  });
});

describe('what a landing names as set aside, and a remainder with no whole day in hand', () => {
  it('names the bills and Future you only once each has its whole amount', () => {
    // 18.000.000 covers rent, the phone and Future you.
    expect(setAsideNamed(viewOn('2026-11-08').view)).toBe('both');
    // 3.300.000 covers the bills and 100.000 of Future you's 500.000: only the bills.
    const short = viewOn('2026-11-08', { placed: [{ ...studioMay, amount: 3_300_000 }] }).view;
    expect(short.items.map((i) => [i.kind, i.covered])).toEqual([
      ['bill', 3_000_000],
      ['bill', 200_000],
      ['futureYou', 100_000],
    ]);
    expect(setAsideNamed(short)).toBe('bills');
    // No bills this month and Future you whole: Future you alone; with nothing at all, neither.
    expect(setAsideNamed({ items: [] })).toBe('none');
    expect(
      setAsideNamed({
        items: [
          {
            kind: 'futureYou',
            index: null,
            due: null,
            amount: 500_000,
            covered: 500_000,
            paid: false,
          },
        ],
      }),
    ).toBe('futureYou');
  });

  it('keeps what pays no whole day in hand with the free money, out of In hand', () => {
    // To 31 Dec with no usual day: 54 days at 196.000, and the remainder is less than a day.
    const { view, landings } = viewOn('2026-11-08', {
      lastUntil: '2026-12-31',
      closedDays: closed('2026-11-08', 6),
    });
    expect(view.inHandDays).toBe(0);
    expect(view.beyond).toBe(0);
    expect(view.leftOver).toBe(view.pool - view.ahead - view.atLine);
    expect(view.leftOver).toBeGreaterThan(0);
    expect(view.leftOver).toBeLessThan(view.line);
    const rows = landedMaths(view, landings);
    expect(rows.some((r) => r.kind === 'beyond')).toBe(false);
    expect(rows.at(-1)).toMatchObject({ kind: 'leftOver', amount: view.leftOver, result: true });
  });

  it('with whole days in hand, keeps them in hand and leaves nothing over', () => {
    const { view } = viewOn('2026-11-08');
    expect(view).toMatchObject({ beyond: 7_400_000, leftOver: 0, inHandDays: 13 });
  });
});
