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
import { sql as addNewYear } from '../db/migrations/0013-new-year';
import { sql as addOwed } from '../db/migrations/0014-owed';
import { categoryActions, tallyByCategory } from './category-actions';
import { moneyActions } from './money-actions';
import { createMoneyStore, dayOf } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import type { SqlDatabase, SqlValue } from './table';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// A real SQLite database in memory, from Node's own module (see migrate.test.ts).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

async function openStore() {
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
  sqlite.exec(addNewYear);
  sqlite.exec(addOwed);
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
  const store = createMoneyStore(db, '2026-10-10');
  await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000 });
  for (const [sort, [id, name]] of [
    ['food', 'Food'],
    ['drinks', 'Drinks'],
  ].entries()) {
    await store.tables.categories.put({
      id: id ?? '',
      name: name ?? '',
      icon: 'restaurant',
      hue: 45,
      countsDaily: true,
      sort,
      archivedAt: null,
    });
  }
  await store.load('2026-10-10');
  return store;
}

const at = new Date('2026-10-10T05:00:00Z');

describe('category actions', () => {
  it('adds a category at the end and edits it in place', async () => {
    const store = await openStore();
    const actions = categoryActions(store);
    const made = await actions.saveCategory({
      name: '  Pets ',
      icon: 'pets',
      hue: 200,
      countsDaily: true,
    });
    expect(made).toMatchObject({ name: 'Pets', sort: 2 });
    expect(
      await actions.saveCategory({ name: '  ', icon: 'pets', hue: 1, countsDaily: true }),
    ).toBeNull();

    await actions.saveCategory({ name: 'Work', icon: 'work', hue: 85, countsDaily: false }, 'food');
    const snap = store.getSnapshot();
    expect(snap.categories.map((c) => [c.id, c.name, c.countsDaily, c.sort])).toEqual([
      ['food', 'Work', false, 0],
      ['drinks', 'Drinks', true, 1],
      [made?.id, 'Pets', true, 2],
    ]);
    expect((await store.tables.categories.get('food'))?.name).toBe('Work');
  });

  it('keeps rules and spends on a renamed category', async () => {
    const store = await openStore();
    const money = moneyActions(store);
    await money.addSpend({
      amount: 45_000,
      categoryId: 'drinks',
      merchant: 'Highlands',
      source: 'manual',
      status: 'kept',
      at,
    });
    await money.rememberMerchant('Highlands', 'drinks');
    const actions = categoryActions(store);
    await actions.saveCategory(
      { name: 'Coffee', icon: 'local_cafe', hue: 25, countsDaily: true },
      'drinks',
    );
    expect(await actions.readRules()).toMatchObject([
      { merchant: 'Highlands', categoryId: 'drinks' },
    ]);
    expect(store.getSnapshot().cycleSpends[0]?.categoryId).toBe('drinks');
  });

  it('moves a daily category’s spends to one Other, drops its rules and refuses the last one', async () => {
    const store = await openStore();
    const money = moneyActions(store);
    const spend = await money.addSpend({
      amount: 45_000,
      categoryId: 'food',
      merchant: 'Phở Thìn',
      source: 'manual',
      status: 'kept',
      at,
    });
    await money.rememberMerchant('Phở Thìn', 'food');
    await money.rememberMerchant('Highlands', 'drinks');
    const actions = categoryActions(store);
    const before = dayOf(store.getSnapshot())?.safe;

    const deleted = await actions.deleteCategory('food', 'vi');
    expect(deleted).toMatchObject({ to: { id: 'other', name: 'Khác', countsDaily: true } });
    expect(deleted?.moved).toEqual([spend.id]);
    expect(deleted?.standing).toBe(1);
    const snap = store.getSnapshot();
    expect(snap.categories.map((c) => c.id)).toEqual(['drinks', 'other']);
    expect(snap.cycleSpends.find((s) => s.id === spend.id)?.categoryId).toBe('other');
    expect(dayOf(snap)?.safe).toBe(before);
    expect((await actions.readRules()).map((r) => r.merchant)).toEqual(['Highlands']);
    expect((await store.tables.categories.get('food'))?.archivedAt).not.toBeNull();
    // What the screen saw at once is what the database now holds.
    await store.load('2026-10-10');
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual(['drinks', 'other']);

    // A second delete files into the same Other.
    const again = await actions.deleteCategory('drinks', 'vi');
    expect(again?.to.id).toBe('other');
    expect(again?.made).toBeNull();
    expect(await actions.deleteCategory('other', 'vi')).toBeNull();
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual(['other']);

    await actions.removeRule('highlands');
    expect(await actions.readRules()).toEqual([]);
  });

  it('puts a deleted category back exactly with Undo, and Other away again', async () => {
    const store = await openStore();
    const money = moneyActions(store);
    const kept = await money.addSpend({
      amount: 45_000,
      categoryId: 'food',
      merchant: 'Phở Thìn',
      source: 'manual',
      status: 'kept',
      at,
    });
    const other = await money.addSpend({
      amount: 20_000,
      categoryId: 'drinks',
      merchant: 'Highlands',
      source: 'manual',
      status: 'kept',
      at,
    });
    await money.rememberMerchant('Phở Thìn', 'food');
    const actions = categoryActions(store);
    const rulesBefore = await store.tables.rules.all();
    const before = store.getSnapshot();

    const deleted = await actions.deleteCategory('food', 'en');
    if (!deleted) throw new Error('not deleted');
    await actions.restoreCategory(deleted);
    const after = store.getSnapshot();
    expect(after.categories).toEqual(before.categories);
    expect(after.cycleSpends.find((s) => s.id === kept.id)?.categoryId).toBe('food');
    expect(after.cycleSpends.find((s) => s.id === other.id)?.categoryId).toBe('drinks');
    expect(await store.tables.rules.all()).toEqual(rulesBefore);
    expect((await store.tables.categories.get('other'))?.archivedAt).not.toBeNull();
    expect(dayOf(after)?.safe).toBe(dayOf(before)?.safe);
  });

  it('moves a not-daily category’s spends to one Other · not daily, never into the day', async () => {
    const store = await openStore();
    const actions = categoryActions(store);
    const work = await actions.saveCategory({
      name: 'Work',
      icon: 'work',
      hue: 85,
      countsDaily: false,
    });
    if (!work) throw new Error('not made');
    const money = moneyActions(store);
    await money.addSpend({
      amount: 300_000,
      categoryId: work.id,
      merchant: 'Taxi',
      source: 'manual',
      status: 'kept',
      at,
    });
    const before = dayOf(store.getSnapshot())?.safe;
    const deleted = await actions.deleteCategory(work.id, 'en');
    expect(deleted?.to).toMatchObject({
      id: 'other-not-daily',
      name: 'Other · not daily',
      countsDaily: false,
    });
    expect(dayOf(store.getSnapshot())?.safe).toBe(before);
    // Nothing to move makes nothing.
    const empty = await actions.saveCategory({
      name: 'Spare',
      icon: 'pets',
      hue: 1,
      countsDaily: true,
    });
    const gone = await actions.deleteCategory(empty?.id ?? '', 'en');
    expect(gone).toMatchObject({ standing: 0, made: null });
    expect(store.getSnapshot().categories.some((c) => c.id === 'other')).toBe(false);
  });

  it('keeps a new order, in the snapshot at once and in the database', async () => {
    const store = await openStore();
    const actions = categoryActions(store);
    const pets = await actions.saveCategory({
      name: 'Pets',
      icon: 'pets',
      hue: 200,
      countsDaily: true,
    });
    const id = pets?.id ?? '';
    await actions.reorderCategories([id, 'food', 'drinks']);
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual([id, 'food', 'drinks']);
    await store.load('2026-10-10');
    expect(store.getSnapshot().categories.map((c) => [c.id, c.sort])).toEqual([
      [id, 0],
      ['food', 1],
      ['drinks', 2],
    ]);
  });
});

describe('tallyByCategory', () => {
  it('counts what still stands this cycle', () => {
    const tallies = tallyByCategory([
      { categoryId: 'food', amount: 45_000, status: 'kept' },
      { categoryId: 'food', amount: 30_000, status: 'caught' },
      { categoryId: 'food', amount: 99_000, status: 'skipped' },
      { categoryId: 'drinks', amount: 25_000, status: 'pending' },
    ]);
    expect(tallies.get('food')).toEqual({ count: 2, total: 75_000 });
    expect(tallies.get('drinks')).toEqual({ count: 1, total: 25_000 });
    expect(tallies.get('gifts')).toBeUndefined();
  });
});
