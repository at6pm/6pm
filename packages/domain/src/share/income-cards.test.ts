import { describe, expect, it } from 'vitest';

import type { PeriodBill, PeriodInput } from '../plan/income-period';
import type { Income } from '../plan/incomes';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import type { LocalDate } from '../time/local-date';
import {
  coveredCard,
  coveredMoments,
  fifthPayCard,
  fifthPayMoment,
  saysSoldOut,
  shopMonthCard,
  shopMonthMoment,
  thankYouCard,
  workYearCard,
  workYearMoment,
  type ShopRow,
  type WorkYearCardRow,
} from './income-cards';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

describe('days covered', () => {
  const landings = [
    { day: '2026-11-03', work: true },
    { day: '2026-11-08', work: true },
  ];

  it('splits the days covered at the end of the stretch, as Today’s ruler does', () => {
    expect(
      coveredCard({
        today: '2026-11-20',
        landings,
        covered: 47,
        stretchDays: 11,
        inHand: 7_100_000,
      }),
    ).toEqual({
      landings: 2,
      jobs: true,
      covered: 47,
      stretch: 11,
      inHandDays: 36,
      quietDays: 12,
      inHand: 7_100_000,
    });
  });

  it('says job only when every landing was stamped work', () => {
    const mixed = coveredCard({
      today: '2026-11-20',
      landings: [...landings, { day: '2026-11-10', work: false }],
      covered: 20,
      stretchDays: 30,
      inHand: 0,
    });
    expect(mixed).toMatchObject({ jobs: false, landings: 3, stretch: 20, inHandDays: 0 });
  });

  it('is nothing with no days covered or nothing landed', () => {
    const base = { today: '2026-11-20', stretchDays: 10, inHand: 0 };
    expect(coveredCard({ ...base, landings, covered: null })).toBeNull();
    expect(coveredCard({ ...base, landings, covered: 0 })).toBeNull();
    expect(coveredCard({ ...base, landings: [], covered: 30 })).toBeNull();
    // A landing dated after today is not one yet.
    expect(
      coveredCard({ ...base, landings: [{ day: '2026-11-21', work: true }], covered: 30 }),
    ).toBeNull();
  });

  it('is offered the evening a landing is placed, and once days covered pass 30', () => {
    expect(coveredMoments({ today: '2026-11-08', landings, covered: 12 })).toEqual([
      'covered:2026-11-08',
    ]);
    expect(coveredMoments({ today: '2026-11-20', landings, covered: 30 })).toEqual([]);
    expect(coveredMoments({ today: '2026-11-20', landings, covered: 31 })).toEqual([
      'covered:past30',
    ]);
  });
});

describe('the fifth Friday', () => {
  /** 4.000.000 every Friday, rent 3.000.000 due the 18th, jars 800.000 a month. */
  const weekly: Income = {
    id: 'shifts',
    name: null,
    rhythm: { kind: 'weekly', weekday: 4 },
    amount: 4_000_000,
  };
  const rent: PeriodBill = { amount: 3_000_000, dueDay: 18, paidCycle: null };
  const on = (day: LocalDate, over: Partial<PeriodInput> = {}): PeriodInput => ({
    day,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    incomes: [weekly],
    bills: [rent],
    jars: 800_000,
    joinedOn: '2026-09-01',
    lastUntil: null,
    ...over,
  });

  it('draws the month’s pays, the fifth kept, and the days it adds at the line', () => {
    // Fri 30 Oct 2026 is October's fifth; it keeps the jars' slice it has nowhere to put.
    const card = fifthPayCard(on('2026-10-30'), 100_000);
    expect(card).toEqual({
      payOn: '2026-10-30',
      pays: [
        { day: '2026-10-02', kept: false },
        { day: '2026-10-09', kept: false },
        { day: '2026-10-16', kept: false },
        { day: '2026-10-23', kept: false },
        { day: '2026-10-30', kept: true },
      ],
      base: 4,
      ofMonth: 5,
      kept: 200_000,
      daysInHand: 2,
      // November's rent is November's to fill.
      billsWhole: true,
      weekday: 4,
      weekly: true,
    });
    expect(fifthPayCard(on('2026-10-30'), 0)?.daysInHand).toBe(0);
  });

  it('is nothing for a usual pay', () => {
    expect(fifthPayCard(on('2026-10-23'), 100_000)).toBeNull();
    expect(fifthPayCard(on('2026-11-13'), 100_000)).toBeNull();
  });

  it('is offered on the day the pay lands only', () => {
    const card = fifthPayCard(on('2026-10-30'), 100_000);
    expect(fifthPayMoment(card, '2026-10-30')).toBe('fifth:2026-10-30');
    expect(fifthPayMoment(card, '2026-10-31')).toBeNull();
    expect(fifthPayMoment(null, '2026-10-30')).toBeNull();
  });
});

describe('my shop’s month', () => {
  const taking = (
    day: LocalDate,
    amount: number,
    merchant: string,
    over: Partial<ShopRow> = {},
  ): ShopRow => ({
    day,
    amount,
    merchant,
    status: 'kept',
    direction: 'in',
    forWork: true,
    source: 'alert',
    ...over,
  });
  const rows: ShopRow[] = [
    taking('2026-11-02', 300_000, 'PHAM THI DIEP'),
    taking('2026-11-02', 200_000, 'NGUYEN VAN AN'),
    taking('2026-11-03', 900_000, 'PHAM THI DIEP'),
    taking('2026-11-03', 150_000, '', { source: 'cash' }),
    taking('2026-11-09', 400_000, 'pham thi diep '),
    taking('2026-11-09', 100_000, 'NGUYEN VAN AN'),
    // A cost of the work, and money set aside as not mine, never take.
    { day: '2026-11-03', amount: 250_000, status: 'kept', forWork: true, merchant: 'Flour' },
    taking('2026-11-04', 500_000, 'NGUYEN VAN AN', { status: 'skipped' }),
    // Another month.
    taking('2026-10-31', 999_000, 'PHAM THI DIEP'),
  ];
  const card = shopMonthCard({
    from: '2026-11-01',
    to: '2026-11-10',
    today: '2026-11-09',
    rows,
    notes: [
      { day: '2026-11-03', note: 'Hết hàng lúc 3 giờ' },
      { day: '2026-11-09', note: 'sold out by noon!' },
      { day: '2026-11-02', note: 'rainy' },
      { day: '2026-10-30', note: 'sold out' },
    ],
  });

  it('draws a bar a day of takings, shut days and days ahead apart', () => {
    expect(card.days).toHaveLength(10);
    expect(card.days[0]).toEqual({ kind: 'shut' });
    expect(card.days[1]).toEqual({ kind: 'open', takings: 500_000 });
    expect(card.days[2]).toEqual({ kind: 'open', takings: 1_050_000 });
    expect(card.days[3]).toEqual({ kind: 'shut' });
    expect(card.days[9]).toEqual({ kind: 'ahead' });
    expect(card.open).toBe(3);
  });

  it('counts the best day, the transfers, the regulars and what was kept', () => {
    expect(card).toMatchObject({
      best: '2026-11-03',
      transfers: 5,
      // Only the sender seen three times; the names never leave the count.
      regulars: 1,
      soldOut: 2,
      kept: 1_800_000,
      bestWeekday: 1,
    });
    expect(JSON.stringify(card)).not.toMatch(/PHAM|NGUYEN/i);
  });

  it('reads sold out in the languages 6pm speaks, and nothing else', () => {
    for (const note of [
      'SOLD OUT',
      'bán hết rồi',
      'Hết sớm',
      '完売しました',
      '품절',
      'Ausverkauft!',
    ]) {
      expect(saysSoldOut(note)).toBe(true);
    }
    for (const note of ['soldier out', 'hết', '', null, 'not sold']) {
      expect(saysSoldOut(note)).toBe(false);
    }
  });

  it('is offered the evening the month’s last day is closed, and the morning after', () => {
    const closed = new Set(['2026-11-30']);
    const month = { from: '2026-11-01', to: '2026-11-30' };
    expect(shopMonthMoment({ today: '2026-11-30', anchor: CALENDAR, closed })).toEqual(month);
    expect(shopMonthMoment({ today: '2026-12-01', anchor: CALENDAR, closed })).toEqual(month);
    expect(shopMonthMoment({ today: '2026-12-02', anchor: CALENDAR, closed })).toBeNull();
    expect(
      shopMonthMoment({ today: '2026-11-30', anchor: CALENDAR, closed: new Set() }),
    ).toBeNull();
  });
});

describe('paid, thank you', () => {
  const line = {
    name: 'cô Diệp',
    job: 'Menu quán Lá',
    code: 'K7Q2',
    amount: 1_800_000,
    settledBy: 'payback',
    settledSpendId: 'in-1',
  };
  const moneyIn = { id: 'in-1', day: '2026-11-24', at: '2026-11-24T03:41:00.000Z' };

  it('is a receipt of what was asked and when it landed, for its own addressee', () => {
    expect(thankYouCard({ line, askedOn: '2026-10-27', moneyIn })).toEqual({
      name: 'cô Diệp',
      job: 'Menu quán Lá',
      code: 'K7Q2',
      amount: 1_800_000,
      askedOn: '2026-10-27',
      landedOn: '2026-11-24',
      landedAt: '2026-11-24T03:41:00.000Z',
    });
  });

  it('is nothing unless that money paid the request', () => {
    expect(thankYouCard({ line, askedOn: '2026-10-27', moneyIn: null })).toBeNull();
    expect(
      thankYouCard({ line: { ...line, settledBy: null }, askedOn: '2026-10-27', moneyIn }),
    ).toBeNull();
    expect(
      thankYouCard({ line, askedOn: '2026-10-27', moneyIn: { ...moneyIn, id: 'in-2' } }),
    ).toBeNull();
    expect(
      thankYouCard({ line: { ...line, code: null }, askedOn: '2026-10-27', moneyIn }),
    ).toBeNull();
  });
});

describe('my work year', () => {
  const job = (id: string, day: LocalDate, amount: number, merchant: string): WorkYearCardRow => ({
    id,
    day,
    amount,
    merchant,
    status: 'kept',
    direction: 'in',
    forWork: true,
    source: 'alert',
  });
  const rows: WorkYearCardRow[] = [
    job('a', '2026-01-10', 5_000_000, 'CONG TY A'),
    { ...job('b', '2026-03-02', 9_000_000, 'CONG TY B'), heldBack: 1_000_000 },
    job('c', '2026-03-20', 4_000_000, 'cong ty a'),
    job('d', '2026-06-01', 2_000_000, 'PHAM THI DIEP'),
    // Waiting for the close, a cost, and last year: not jobs of this year.
    { ...job('e', '2026-06-02', 1_000_000, 'X'), status: 'pending' },
    { ...job('f', '2026-06-03', 300_000, 'PAPER'), direction: 'out' },
    job('g', '2025-12-30', 7_000_000, 'CONG TY A'),
  ];
  const card = workYearCard({
    year: 2026,
    today: '2026-12-05',
    rows,
    codePaid: new Set(['b', 'c', 'g']),
  });

  it('counts jobs, clients and payments a code found, never naming one', () => {
    expect(card).toMatchObject({ jobs: 4, clients: 3, paidByCode: 2, daysOpen: 4 });
    expect(JSON.stringify(card)).not.toMatch(/CONG|DIEP/i);
  });

  it('bills the months as the year does, the busiest, and the months to come', () => {
    expect(card.months).toEqual([5_000_000, 0, 14_000_000, 0, 0, 2_000_000, 0, 0, 0, 0, 0, 0]);
    expect(card.billed).toBe(21_000_000);
    expect(card.busiest).toBe(2);
    // December is under way: the months after November are still to come.
    expect(card.toCome).toBe(12);
    expect(
      workYearCard({ year: 2026, today: '2026-08-15', rows, codePaid: new Set() }).toCome,
    ).toBe(8);
    expect(
      workYearCard({ year: 2025, today: '2026-08-15', rows, codePaid: new Set() }).toCome,
    ).toBe(12);
  });

  it('finds the longest quiet between jobs and since the last one', () => {
    // 1 Jun to 5 Dec: 187 days with nothing in.
    expect(card.longestQuiet).toBe(187);
    expect(
      workYearCard({ year: 2026, today: '2026-06-10', rows, codePaid: new Set() }).longestQuiet,
    ).toBe(72);
    expect(
      workYearCard({ year: 2026, today: '2026-12-05', rows: [], codePaid: new Set() }),
    ).toMatchObject({ jobs: 0, busiest: null, longestQuiet: 0 });
  });

  it('is offered from 1 December, once a year', () => {
    expect(workYearMoment('2026-11-30')).toBeNull();
    expect(workYearMoment('2026-12-01')).toBe('work-year:2026');
    expect(workYearMoment('2026-12-31')).toBe('work-year:2026');
  });
});
