import { describe, expect, it, jest } from '@jest/globals';

import { FUTURE_YOU_POT_ID, restateClosedDays } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { countedSpendOf } from '../features/diary/jar-lines';
import { futureYouOfMonth, readDayNumber, readDayReceipt } from './diary-queries';
import { createMoneyStore, dayOf } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));
jest.mock('./money-provider', () => ({ useMoneySelector: jest.fn(), useMoneyStore: jest.fn() }));

const lastDay = { kind: 'lastDay' } as const;

describe('futureYouOfMonth', () => {
  const moves = [
    // The cycle that began on 30 Sep ends on 31 Oct, so it is October's.
    { kind: 'setAside', amount: 2_000_000, cycle: '2026-09-30', at: '2026-09-30T20:00:00.000Z' },
    { kind: 'setAside', amount: 2_000_000, cycle: '2026-10-31', at: '2026-10-31T20:00:00.000Z' },
    { kind: 'topUp', amount: 100_000, cycle: '2026-09-30', at: '2026-10-05T05:00:00.000Z' },
    { kind: 'topUp', amount: 300_000, cycle: '2026-10-31', at: '2026-11-02T05:00:00.000Z' },
  ];

  it('files a top-up in the month it was made, not the pay cycle it belongs to', () => {
    // 5 Oct falls in the cycle that began on 30 Sep, but it is October's money diary.
    const october = futureYouOfMonth(moves, '2026-10', lastDay);
    expect(october.added).toBe(2_000_000 + 100_000);
  });

  it('files a cycle’s set-aside in the month the cycle is named after', () => {
    const november = futureYouOfMonth(moves, '2026-11', lastDay);
    expect(november.added).toBe(2_000_000 + 300_000);
  });

  it('takes a spend from the jar out of the total, never adds it', () => {
    const spent = {
      kind: 'spent',
      amount: 1_200_000,
      cycle: '2026-10-20',
      at: '2026-10-20T05:00:00.000Z',
    };
    const october = futureYouOfMonth([...moves, spent], '2026-10', lastDay);
    expect(october.total).toBe(2_100_000 - 1_200_000);
    expect(october.added).toBe(2_100_000);
  });

  it('adds everything up to the end of the month for the total', () => {
    expect(futureYouOfMonth(moves, '2026-10', lastDay).total).toBe(2_100_000);
    expect(futureYouOfMonth(moves, '2026-11', lastDay).total).toBe(4_400_000);
    expect(futureYouOfMonth(moves, '2026-09', lastDay)).toEqual({ added: 0, total: 0 });
  });

  it('holds what a goal had before 6pm from the start, never as money added in a month', () => {
    const opening = {
      kind: 'opening',
      amount: 20_000_000,
      cycle: '2026-10-31',
      at: '2026-11-02T05:00:00.000Z',
    };
    const all = [...moves, opening];
    expect(futureYouOfMonth(all, '2026-11', lastDay)).toEqual({
      added: 2_300_000,
      total: 24_400_000,
    });
    expect(futureYouOfMonth(all, '2026-09', lastDay)).toEqual({ added: 0, total: 20_000_000 });
  });
});

describe('readDayNumber', () => {
  it('works out a day that has gone by from that day alone, whatever day the store shows now', async () => {
    const db = openMemoryDb();
    const store = createMoneyStore(db, '2026-10-12');
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, payday: lastDay });
    await store.tables.categories.put({
      id: 'food',
      name: 'Food',
      icon: 'restaurant',
      hue: 40,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    const put = (id: string, day: string, amount: number) =>
      store.tables.spends.put({
        id,
        day,
        at: `${day}T05:00:00.000Z`,
        amount,
        categoryId: 'food',
        merchant: id,
        note: null,
        source: 'cash',
        status: 'kept',
        previousStatus: null,
        wallet: 'Cash',
        forWork: false,
        detail: null,
        foreignAmount: null,
        createdAt: '2026-10-11T05:00:00.000Z',
        updatedAt: '2026-10-11T05:00:00.000Z',
      });
    await put('lunch', '2026-10-11', 120_000);
    await put('cash-at-close', '2026-10-11', 20_000);
    await store.load('2026-10-12');

    const closed = await readDayNumber(store, store.getSnapshot(), '2026-10-11');
    // The 11th closed with its own spending, and its tomorrow is the 12th's line.
    expect(closed?.spent).toBe(140_000);
    expect(dayOf(store.getSnapshot())?.spent).toBe(0);
    expect(closed?.tomorrow).toBe(dayOf(store.getSnapshot())?.line);
  });
});

describe('readDayReceipt', () => {
  it('prints a spend from a jar in full, and the jar lines take the jar’s part back off', async () => {
    const db = openMemoryDb();
    const store = createMoneyStore(db, '2026-10-12');
    await store.tables.categories.put({
      id: 'food',
      name: 'Food',
      icon: 'restaurant',
      hue: 40,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    const put = (
      id: string,
      hour: string,
      amount: number,
      fromPot?: string,
      fromPotAmount?: number,
    ) =>
      store.tables.spends.put({
        id,
        day: '2026-10-11',
        at: `2026-10-11T${hour}:00:00.000Z`,
        amount,
        categoryId: 'food',
        merchant: id,
        note: null,
        source: 'cash',
        status: 'kept',
        previousStatus: null,
        wallet: 'Cash',
        forWork: false,
        detail: null,
        foreignAmount: null,
        createdAt: '2026-10-11T05:00:00.000Z',
        updatedAt: '2026-10-11T05:00:00.000Z',
        ...(fromPot ? { fromPot, fromPotAmount: fromPotAmount ?? amount } : {}),
      });
    await put('lunch', '05', 120_000);
    await put('hotel', '06', 1_200_000, 'dalat');
    // The jar held 30k when the coffee was taken from it: the rest counted that day.
    await put('coffee', '07', 50_000, 'dalat', 30_000);
    await put('gift', '08', 300_000, FUTURE_YOU_POT_ID);

    const receipt = await readDayReceipt(store, '2026-10-11', new Set());
    expect(receipt.spends.map((s) => s.amount)).toEqual([120_000, 1_200_000, 50_000, 300_000]);
    expect(receipt.jars).toEqual([
      { potId: 'dalat', amount: 1_230_000 },
      { potId: FUTURE_YOU_POT_ID, amount: 300_000 },
    ]);
    const lines = receipt.spends.reduce((sum, s) => sum + s.amount, 0);
    const jars = receipt.jars.reduce((sum, j) => sum + j.amount, 0);
    // The day's total, as the close and the calendar count it: only what the number counted.
    const [restated] = restateClosedDays(
      [{ day: '2026-10-11', spent: 0 }],
      receipt.spends.map((s) => ({ ...countedSpendOf(s), day: s.day })),
      new Set(),
      { from: '2026-10-11', to: '2026-10-11' },
    );
    expect(lines - jars).toBe(140_000);
    expect(restated?.spent).toBe(lines - jars);
  });
});
