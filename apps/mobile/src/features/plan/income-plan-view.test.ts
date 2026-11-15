import { describe, expect, it, jest } from '@jest/globals';

import { addDays, type BillRow, type LocalDate, type SpendRow } from '@6pm/domain';

import { createMoneyStore, dayOf } from '../../data/money-store';
import { openMoneyTables } from '../../data/money-tables';
import { DEFAULT_PLAN, writePlan, type PlanSettings } from '../../data/plan-settings';
import { openMemoryDb } from '../backup/test/memory-db';
import { coverRulerOf, incomePlanOf, landedNeedOf, paidTodayOf } from './income-plan-view';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

function row(over: Partial<SpendRow> & Pick<SpendRow, 'id' | 'day' | 'amount'>): SpendRow {
  return {
    at: `${over.day}T05:00:00.000Z`,
    categoryId: 'food',
    merchant: 'Quán Gió',
    note: null,
    source: 'manual',
    status: 'kept',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: `${over.day}T05:00:00.000Z`,
    updatedAt: `${over.day}T05:00:00.000Z`,
    ...over,
  };
}

function bill(id: string, amount: number, dueDay: number): BillRow {
  return {
    id,
    name: id,
    icon: 'home',
    hue: 30,
    amount,
    dueDay,
    paidCycle: null,
    sort: 0,
    archivedAt: null,
    kind: 'other',
    lastMonth: null,
    paidAmount: null,
    askedCycle: null,
  };
}

async function storeOn(
  today: LocalDate,
  plan: Partial<PlanSettings>,
  bills: readonly BillRow[],
  spends: readonly SpendRow[],
  closed: readonly { day: LocalDate; spent: number }[] = [],
) {
  const db = openMemoryDb();
  const tables = openMoneyTables(db);
  await writePlan(db, { ...DEFAULT_PLAN, payday: { kind: 'sameDay', day: 1 }, ...plan });
  await tables.categories.put({
    id: 'food',
    name: 'Ăn uống',
    icon: 'restaurant',
    hue: 45,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  for (const b of bills) await tables.bills.put(b);
  for (const s of spends) await tables.spends.put(s);
  for (const d of closed) {
    await tables.closedDays.put({
      day: d.day,
      closedAt: `${d.day}T11:00:00.000Z`,
      late: false,
      spent: d.spent,
      line: d.spent,
      tomorrow: d.spent,
      note: null,
    });
  }
  const store = createMoneyStore(db, today);
  await store.load(today);
  return store.getSnapshot();
}

/** Example A: 4.000.000 every Friday, rent 3.000.000 due the 18th, jars 800.000 a month. */
const weekly: Partial<PlanSettings> = {
  futureYou: 800_000,
  startedOn: '2026-09-01',
  incomes: [
    { id: 'shifts', name: null, rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 },
  ],
};
const pay = (day: LocalDate) =>
  row({
    id: `pay-${day}`,
    day,
    amount: 4_000_000,
    direction: 'in',
    moneyIn: 'pay',
    incomeId: 'shifts',
  });

describe('Plan for a pay, example A', () => {
  it('draws Fri 13 Nov’s pay with the maths Today’s 397.000 comes from', async () => {
    const snap = await storeOn(
      '2026-11-13',
      weekly,
      [bill('rent', 3_000_000, 18)],
      [
        pay('2026-11-06'),
        pay('2026-11-13'),
        row({ id: 'w', day: '2026-11-10', amount: 2_920_000 }),
      ],
    );
    expect(dayOf(snap)?.line).toBe(397_000);
    const view = incomePlanOf(snap);
    if (view?.kind !== 'pay') throw new Error('expected a pay');
    expect(view.stretch).toMatchObject({
      payOn: '2026-11-13',
      pay: 4_000_000,
      next: '2026-11-20',
      billSlice: 750_000,
      jarSlice: 200_000,
      free: 3_050_000,
    });
    expect(view.rows.map((r) => [r.kind, r.amount])).toEqual([
      ['pay', 4_000_000],
      ['bill', -750_000],
      ['jars', -200_000],
      ['freePay', 3_050_000],
      ['leftBefore', 130_000],
      ['divide', 3_180_000],
      ['each', 397_000],
    ]);
    expect(view.days).toHaveLength(8);
    expect(paidTodayOf(snap, view)).toEqual({ next: '2026-11-20' });
  });

  it('draws the gap week for someone who joined that Friday', async () => {
    const snap = await storeOn(
      '2026-11-13',
      { ...weekly, startedOn: '2026-11-13' },
      [bill('rent', 3_000_000, 18)],
      [],
    );
    expect(dayOf(snap)?.line).toBe(75_000);
    const view = incomePlanOf(snap);
    if (view?.kind !== 'pay') throw new Error('expected a pay');
    expect(view.stretch).toMatchObject({
      billSlice: 3_000_000,
      jarSlice: 400_000,
      jarSlices: 2,
      free: 600_000,
      joinedGap: true,
    });
    expect(view.stretch.bills[0]).toMatchObject({
      gap: 2_250_000,
      slices: ['gap', 'gap', 'gap', 'this'],
    });
  });

  it('is not drawn for a monthly salary', async () => {
    const snap = await storeOn('2026-11-13', { income: 15_000_000 }, [], []);
    expect(incomePlanOf(snap)).toBeNull();
  });
});

/** Example B: money that only lands; rent due the 10th, the phone the 20th, Future you 500.000. */
const freelance: Partial<PlanSettings> = {
  futureYou: 500_000,
  startedOn: '2026-09-01',
  incomes: [{ id: 'landed', name: null, rhythm: { kind: 'none' }, amount: 0 }],
};
const usualDays = (before: LocalDate) =>
  Array.from({ length: 28 }, (_, i) => ({ day: addDays(before, -1 - i), spent: 200_000 }));

describe('Plan and Today for money that lands, example B', () => {
  const bills = [bill('rent', 3_000_000, 10), bill('phone', 200_000, 20)];

  it('has no number and says what the bills need before anything lands', async () => {
    const snap = await storeOn('2026-11-02', freelance, bills, [], usualDays('2026-11-02'));
    const view = incomePlanOf(snap);
    if (view?.kind !== 'landed') throw new Error('expected landed');
    expect(view.day.line).toBe(0);
    expect(view.view).toMatchObject({ state: 'empty', billsStillNeed: 3_200_000 });
    expect(view.view.nextNeed).toMatchObject({ due: '2026-11-10' });
    expect(coverRulerOf(view.view)).toBeNull();
  });

  it('makes Studio Mây’s 18.000.000 a day of 300.000 with the rest in hand', async () => {
    const landing = row({
      id: 'studio',
      day: '2026-11-08',
      amount: 18_000_000,
      merchant: 'Studio Mây',
      direction: 'in',
      moneyIn: 'pay',
      incomeId: 'landed',
    });
    const snap = await storeOn('2026-11-08', freelance, bills, [landing], usualDays('2026-11-08'));
    const view = incomePlanOf(snap);
    if (view?.kind !== 'landed') throw new Error('expected landed');
    expect(view.landings).toEqual([{ name: 'Studio Mây', amount: 18_000_000, day: '2026-11-08' }]);
    expect(view.view).toMatchObject({
      state: 'landed',
      toShare: 14_300_000,
      on: '2026-11-30',
      evenly: 621_000,
      capped: 300_000,
      line: 300_000,
      atLine: 6_900_000,
      beyond: 7_400_000,
      covered: 36,
      coveredTo: '2026-12-13',
    });
    expect(coverRulerOf(view.view)).toEqual({
      covered: 36,
      to: '2026-12-13',
      stretch: 23,
      inHand: 13,
    });
    expect(view.days).toHaveLength(23);
  });
});

describe('what Plan asks for before money that only lands has made a number', () => {
  const item = (kind: 'bill' | 'futureYou' | 'jars', amount: number, covered = 0) => ({
    kind,
    index: kind === 'bill' ? 0 : null,
    due: null,
    amount,
    covered,
    paid: false,
  });

  it('a seller with no bills and no jars: nothing to set aside, never “Bills need 0k”', () => {
    expect(landedNeedOf({ items: [], billsStillNeed: 0 })).toEqual({
      kind: 'none',
      amount: 0,
      thenFutureYou: false,
    });
  });

  it('no bills but Future you: Future you first, then the days', () => {
    expect(landedNeedOf({ items: [item('futureYou', 500_000)], billsStillNeed: 0 })).toEqual({
      kind: 'futureYou',
      amount: 500_000,
      thenFutureYou: true,
    });
  });

  it('bills first, and says Future you comes next only when it still needs money', () => {
    const items = [item('bill', 3_000_000), item('futureYou', 500_000)];
    expect(landedNeedOf({ items, billsStillNeed: 3_000_000 })).toMatchObject({
      kind: 'bills',
      thenFutureYou: true,
    });
    expect(
      landedNeedOf({ items: [item('bill', 3_000_000)], billsStillNeed: 3_000_000 }),
    ).toMatchObject({ kind: 'bills', thenFutureYou: false });
  });
});
