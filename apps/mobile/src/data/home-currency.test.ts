import { describe, expect, it, jest } from '@jest/globals';

import { sql as createSettings } from '../db/migrations/0001-create-settings';
import { sql as createMoneyTables } from '../db/migrations/0002-create-money-tables';
import { sql as createTogetherMoves } from '../db/migrations/0003-create-together-moves';
import { sql as addCurrencyGuessed } from '../db/migrations/0004-spend-currency-guessed';
import { sql as addBillPayments } from '../db/migrations/0008-bill-kind-and-payments';
import { sql as addSpendMemo } from '../db/migrations/0009-spend-memo';
import { sql as addSightingCapture } from '../db/migrations/0006-sighting-capture-id';
import { sql as addMoneyIn } from '../db/migrations/0010-money-in';
import { sql as addJars } from '../db/migrations/0011-jars';
import { sql as addImports } from '../db/migrations/0012-imports';
import { currencyOf, VND, type HomeChange, type SpendRow } from '@6pm/domain';

import { dayOf, createMoneyStore } from './money-store';
import { changeHomeCurrency } from './home-currency';
import { completeOnboarding, type OnboardingAnswers } from './onboarding';
import type { SqlDatabase, SqlValue } from './table';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// A phone whose region is the United States: the plan is set up in dollars.
const mockPhoneCurrency = 'USD';
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => mockPhoneCurrency }));

// A real SQLite database in memory, from Node's own module (see migrate.test.ts).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

function openStore(today: string) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(createSettings);
  sqlite.exec(createMoneyTables);
  sqlite.exec(createTogetherMoves);
  sqlite.exec(addCurrencyGuessed);
  sqlite.exec(addBillPayments);
  sqlite.exec(addSpendMemo);
  sqlite.exec(addSightingCapture);
  sqlite.exec(addMoneyIn);
  sqlite.exec(addJars);
  sqlite.exec(addImports);
  const db: SqlDatabase = {
    getAllAsync: <T>(source: string, params: SqlValue[]) =>
      Promise.resolve(sqlite.prepare(source).all(...params) as T[]),
    runAsync: (source, params) => Promise.resolve(sqlite.prepare(source).run(...params)),
    withTransactionAsync: async (task) => {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return createMoneyStore(db, today);
}

const USD = currencyOf('USD');
const toDong: HomeChange = { from: USD, to: VND, rate: '25400' };

/** A month set up in dollars: $1,200 in, $120 to Future you, $300 rent. */
const answers: OnboardingAnswers = {
  income: 120_000,
  payday: { kind: 'sameDay', day: 25 },
  futureYou: 12_000,
  bills: [{ name: 'Rent', icon: 'home', hue: 30, amount: 30_000 }],
  wallets: ['CASH'],
  closeAt: '18:00',
};

const at = '2026-10-10T05:00:00.000Z';

function spend(over: Partial<SpendRow> & Pick<SpendRow, 'id' | 'amount'>): SpendRow {
  return {
    day: '2026-10-10',
    at,
    categoryId: 'food',
    merchant: 'Phở',
    note: null,
    source: 'manual',
    status: 'kept',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: at,
    updatedAt: at,
    ...over,
  };
}

async function setUpInDollars() {
  const store = openStore('2026-10-10');
  await completeOnboarding(store, answers, { today: '2026-10-10', language: 'en' });
  const { db, tables } = store;
  // Typed in dollars by hand.
  await tables.spends.put(spend({ id: 'typed', amount: 350 }));
  // A bank receipt printed in đồng, priced in dollars when it was caught.
  await tables.spends.put(
    spend({
      id: 'caught',
      amount: 217,
      source: 'shared',
      foreignAmount: { currency: 'VND', amount: 55_000, rate: 0.0000394 },
    }),
  );
  await tables.pots.put({
    id: 'trip',
    kind: 'goal',
    name: 'Đà Lạt',
    icon: 'flight',
    hue: 200,
    goal: 40_000,
    neededBy: '2027-01',
    share: null,
    monthly: null,
    paused: false,
    createdAt: at,
    archivedAt: null,
  });
  await db.runAsync(
    'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
    ['move-in', 'trip', 5000, 'topUp', '2026-09-25', at],
  );
  await db.runAsync(
    'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
    ['move-out', 'trip', -1000, 'spent', '2026-09-25', at],
  );
  await tables.closedDays.put({
    day: '2026-10-09',
    closedAt: at,
    late: false,
    spent: 1200,
    line: 2500,
    tomorrow: 2600,
    note: null,
  });
  await store.load('2026-10-10');
  return store;
}

describe('changeHomeCurrency', () => {
  it('counts the whole plan in đồng, with printed đồng back to what was printed', async () => {
    const store = await setUpInDollars();
    expect(store.getSnapshot().plan?.currency).toBe('USD');

    expect(await changeHomeCurrency(store, toDong)).toBe(true);

    const snap = store.getSnapshot();
    expect(snap.plan).toMatchObject({ currency: 'VND', income: 30_480_000, futureYou: 3_048_000 });
    expect(snap.bills.map((b) => [b.name, b.amount])).toEqual([['Rent', 7_620_000]]);

    const spends = await store.tables.spends.all();
    const byId = new Map(spends.map((s) => [s.id, s]));
    expect(byId.get('typed')).toMatchObject({ amount: 88_900, foreignAmount: null });
    expect(byId.get('caught')).toMatchObject({ amount: 55_000, foreignAmount: null });

    expect((await store.tables.pots.all()).map((p) => [p.id, p.goal])).toContainEqual([
      'trip',
      10_160_000,
    ]);
    const moves = await store.db.getAllAsync<{ id: string; amount: number }>(
      "SELECT id, amount FROM pot_moves WHERE id IN ('move-in', 'move-out') ORDER BY id",
      [],
    );
    expect(moves).toEqual([
      { id: 'move-in', amount: 1_270_000 },
      { id: 'move-out', amount: -254_000 },
    ]);
    expect(await store.tables.closedDays.all()).toMatchObject([
      { day: '2026-10-09', spent: 304_800, line: 635_000, tomorrow: 660_400 },
    ]);
    // Today's line is counted in đồng now: a whole number of thousands.
    const line = dayOf(snap)?.line ?? 0;
    expect(line).toBeGreaterThan(100_000);
    expect(line % 1000).toBe(0);
  });

  it('does nothing the second time, or without a rate', async () => {
    const store = await setUpInDollars();
    expect(await changeHomeCurrency(store, { ...toDong, rate: '0' })).toBe(false);
    expect(store.getSnapshot().plan?.currency).toBe('USD');

    expect(await changeHomeCurrency(store, toDong)).toBe(true);
    expect(await changeHomeCurrency(store, toDong)).toBe(false);
    expect((await store.tables.spends.all()).find((s) => s.id === 'typed')?.amount).toBe(88_900);
  });

  it('writes nothing before there is a plan', async () => {
    const store = openStore('2026-10-10');
    expect(await changeHomeCurrency(store, toDong)).toBe(false);
    expect(store.getSnapshot().plan).toBeNull();
  });
});
