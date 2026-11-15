import { describe, expect, it, jest } from '@jest/globals';

import { BUFFER_POT_ID, type SpendRow } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { paydayNoticeOf } from '../features/reminders/notification-inputs';
import { nextMoneyDay } from '../features/surfaces/surface-snapshot';
import { createMoneyStore, dayOf } from './money-store';
import { openMoneyTables } from './money-tables';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

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

/** Example A's weekly pay on the last day of November: every Friday's pay landed, 10.000.000 spent. */
async function endOfNovember() {
  const db = openMemoryDb();
  const tables = openMoneyTables(db);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    payday: { kind: 'sameDay', day: 1 },
    futureYou: 800_000,
    startedOn: '2026-09-01',
    incomes: [
      { id: 'shifts', name: null, rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 },
    ],
  });
  await tables.categories.put({
    id: 'food',
    name: 'Ăn uống',
    icon: 'restaurant',
    hue: 45,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await tables.bills.put({
    id: 'rent',
    name: 'Tiền nhà',
    icon: 'home',
    hue: 30,
    amount: 3_000_000,
    dueDay: 18,
    paidCycle: null,
    sort: 0,
    archivedAt: null,
    kind: 'other',
    lastMonth: null,
    paidAmount: null,
    askedCycle: null,
  });
  for (const day of ['2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27']) {
    await tables.spends.put(
      row({
        id: `pay-${day}`,
        day,
        amount: 4_000_000,
        direction: 'in',
        moneyIn: 'pay',
        incomeId: 'shifts',
      }),
    );
  }
  await tables.spends.put(row({ id: 'month', day: '2026-11-25', amount: 10_000_000 }));
  const store = createMoneyStore(db, '2026-11-30');
  await store.load('2026-11-30');
  return store.getSnapshot();
}

describe('the widget’s next money day', () => {
  it('starts December with what November leaves in hand', async () => {
    const snap = await endOfNovember();
    // 16.000.000 landed, 3.800.000 set aside, 10.000.000 spent.
    expect(dayOf(snap)?.free).toBe(2_200_000);
    const next = nextMoneyDay(snap);
    expect(next.potSaved[BUFFER_POT_ID]).toBe(2_200_000);
    // To Friday 4 Dec: four days for what is in hand.
    expect(dayOf(next)).toMatchObject({ startFree: 2_200_000, line: 550_000 });
  });
});

describe('payday’s notification', () => {
  it('comes on the next Friday with the line that pay brings', async () => {
    const snap = await endOfNovember();
    expect(paydayNoticeOf(snap)).toEqual({
      on: '2026-12-04',
      preview: { jars: 200_000, daily: 381_000, until: '2026-12-11' },
    });
  });

  it('never comes for money that only lands', async () => {
    const snap = await endOfNovember();
    const plan = snap.plan ?? DEFAULT_PLAN;
    const landed = {
      ...snap,
      plan: {
        ...plan,
        incomes: [{ id: 'jobs', name: null, rhythm: { kind: 'none' as const }, amount: 0 }],
      },
    };
    expect(paydayNoticeOf(landed)).toBeNull();
  });
});
