import { describe, expect, it, jest } from '@jest/globals';

import { suggestCategoryIcon, type CategoryRow, type ImportRow, type SpendRow } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { ICON_PACKS } from '../features/categories/icon-packs';
import { choiceOf, picksOf, type Choice } from '../features/import/label-picks';
import { bringIn, restoreImport, undoImport } from './import-actions';
import { madeForLabel, repairImportedCategories } from './import-repair';
import { createMoneyStore, dayOf, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-11-05';
const STARTED = '2026-11-01';

const row = (id: string, day: string, amount: number, label: string): ImportRow => ({
  id,
  day,
  time: '12:30:00',
  amount,
  direction: 'out',
  label,
  merchant: label,
  note: null,
  payLater: false,
});

const category = (id: string, name: string, extra: Partial<CategoryRow> = {}): CategoryRow => ({
  id,
  name,
  icon: 'restaurant',
  hue: 45,
  countsDaily: true,
  sort: 0,
  archivedAt: null,
  ...extra,
});

async function open(): Promise<MoneyStore> {
  const db = openMemoryDb();
  const store = createMoneyStore(db, TODAY);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    payday: { kind: 'sameDay', day: 25 },
    startedOn: STARTED,
  });
  await store.tables.categories.put(category('food', 'Food'));
  await store.load(TODAY);
  return store;
}

/** A category as the earlier bring-in made one for a label: its name, no colour, never daily. */
const FREE = ICON_PACKS.filter((p) => p.free).flatMap((p) => p.icons);
const madeFor = (label: string, slug: string, sort: number): CategoryRow =>
  category(`imported-${slug}`, label, {
    icon: suggestCategoryIcon(label, FREE) ?? 'category',
    hue: 0,
    countsDaily: false,
    sort,
  });

async function spend(
  store: MoneyStore,
  id: string,
  day: string,
  amount: number,
  categoryId: string,
  source: SpendRow['source'] = 'import',
) {
  await store.tables.spends.put({
    id,
    day,
    at: `${day}T05:30:00.000Z`,
    amount,
    categoryId,
    merchant: id,
    note: null,
    source,
    status: 'kept',
    previousStatus: null,
    wallet: source === 'import' ? 'MOMO' : null,
    forWork: false,
    currencyGuessed: false,
    detail: null,
    foreignAmount: null,
    direction: null,
    moneyIn: null,
    importId: source === 'import' ? 'imp-old' : null,
    createdAt: `${day}T05:30:00.000Z`,
    updatedAt: `${day}T05:30:00.000Z`,
  });
}

/** Every spend's day and amount, and what the days add up to: what Diary and Ask read. */
async function totals(store: MoneyStore) {
  const rows = await store.db.getAllAsync<{ day: string; total: number; daily: number }>(
    `SELECT s.day, SUM(s.amount) AS total, SUM(CASE WHEN c.counts_daily = 1 THEN s.amount ELSE 0 END) AS daily
     FROM spends s JOIN categories c ON c.id = s.category_id GROUP BY s.day ORDER BY s.day`,
    [],
  );
  return rows;
}

describe('a bring-in’s Not daily labels', () => {
  it('all go in one Other · not daily, made once and reused next time', async () => {
    const store = await open();
    const categories = store.getSnapshot().categories;
    const choices = new Map<string, Choice>([
      ['SHOP ONE', 'notDaily'],
      ['SHOP TWO', 'notDaily'],
      ['PHO HOA', choiceOf('food', categories)],
    ]);
    const picks = picksOf(choices, categories, 'vi');
    await bringIn(store, {
      app: 'momo',
      rows: [
        row('imp-1', '2026-10-02', 50_000, 'SHOP ONE'),
        row('imp-2', '2026-10-03', 70_000, 'SHOP TWO'),
        row('imp-3', '2026-10-04', 45_000, 'PHO HOA'),
      ],
      picks,
      moneyInCategory: 'food',
      language: 'vi',
    });
    const made = store.getSnapshot().categories.filter((c) => c.id !== 'food');
    expect(made).toEqual([
      expect.objectContaining({
        id: 'other-not-daily',
        name: 'Khác · không tính ngày',
        countsDaily: false,
      }),
    ]);
    // Once it is theirs, Not daily is that category.
    expect(choiceOf('notDaily', store.getSnapshot().categories)).toBe('cat:other-not-daily');
  });

  it('are put away with Undo when nothing else is in Other · not daily, and come back with it', async () => {
    const store = await open();
    const categories = store.getSnapshot().categories;
    const record = await bringIn(store, {
      app: 'momo',
      rows: [row('imp-1', '2026-10-02', 50_000, 'SHOP ONE')],
      picks: picksOf(new Map([['SHOP ONE', 'notDaily']]), categories, 'en'),
      moneyInCategory: 'food',
      language: 'en',
    });
    const removed = await undoImport(store, record.id);
    expect(removed?.archived?.map((c) => c.id)).toEqual(['other-not-daily']);
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual(['food']);
    if (!removed) throw new Error('not removed');
    await restoreImport(store, removed);
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual(['food', 'other-not-daily']);

    // Bringing it in again after an undo brings the same category back, never a second one.
    const again = await undoImport(store, record.id);
    if (!again) throw new Error('not removed');
    await bringIn(store, {
      app: 'momo',
      rows: [row('imp-1', '2026-10-02', 50_000, 'SHOP ONE')],
      picks: picksOf(new Map([['SHOP ONE', 'notDaily']]), store.getSnapshot().categories, 'en'),
      moneyInCategory: 'food',
      language: 'en',
    });
    const all = await store.tables.categories.all();
    expect(all.filter((c) => c.id.startsWith('other-not-daily'))).toHaveLength(1);
    expect(store.getSnapshot().categories.map((c) => c.id)).toEqual(['food', 'other-not-daily']);
  });

  it('keep Other · not daily on Undo while another bring-in still has lines in it', async () => {
    const store = await open();
    const bring = async (id: string, label: string) =>
      bringIn(store, {
        app: 'momo',
        rows: [row(id, '2026-10-02', 50_000, label)],
        picks: picksOf(new Map([[label, 'notDaily']]), store.getSnapshot().categories, 'en'),
        moneyInCategory: 'food',
        language: 'en',
      });
    const first = await bring('imp-1', 'SHOP ONE');
    await bring('imp-2', 'SHOP TWO');
    const removed = await undoImport(store, first.id);
    expect(removed?.archived).toEqual([]);
    expect(store.getSnapshot().categories.map((c) => c.id)).toContain('other-not-daily');
  });
});

describe('repairImportedCategories', () => {
  async function broken() {
    const store = await open();
    await store.tables.categories.put(
      category('bills', 'Bills', { icon: 'receipt_long', hue: 80, countsDaily: false, sort: 1 }),
    );
    await store.tables.categories.put(madeFor('NGUYEN VAN AN', 'nguyen-van-an', 2));
    await store.tables.categories.put(madeFor('SHOP ONE', 'shop-one', 3));
    await store.tables.categories.put(madeFor('Điện lực Hồ Chí Minh', 'dien-luc-ho-chi-minh', 4));
    // Renamed by the person: theirs now.
    await store.tables.categories.put(madeFor('My savings', 'shop-two', 5));
    // Made for a label, then used for a spend of their own: theirs too.
    await store.tables.categories.put(madeFor('SHOP THREE', 'shop-three', 6));
    await spend(store, 'a', '2026-09-02', 300_000, 'imported-nguyen-van-an');
    await spend(store, 'b', '2026-09-02', 120_000, 'imported-shop-one');
    await spend(store, 'c', '2026-10-01', 80_000, 'imported-shop-one');
    await spend(store, 'd', '2026-10-03', 612_000, 'imported-dien-luc-ho-chi-minh');
    await spend(store, 'e', '2026-10-04', 50_000, 'imported-shop-two');
    await spend(store, 'f', '2026-10-05', 40_000, 'imported-shop-three');
    await spend(store, 'g', '2026-11-02', 25_000, 'imported-shop-three', 'manual');
    await store.tables.closedDays.put({
      day: '2026-11-02',
      closedAt: '2026-11-02T11:00:00.000Z',
      late: false,
      spent: 25_000,
      line: 400_000,
      tomorrow: 410_000,
      note: null,
    });
    await store.load(TODAY);
    return store;
  }

  it('files every untouched per-label category’s lines in one place and archives it', async () => {
    const store = await broken();
    const before = { totals: await totals(store), closed: await store.tables.closedDays.all() };
    const number = dayOf(store.getSnapshot());

    expect(await repairImportedCategories(store, 'vi')).toBe(3);

    const live = store.getSnapshot().categories.map((c) => c.id);
    expect(live).toEqual([
      'food',
      'bills',
      'imported-shop-two',
      'imported-shop-three',
      'other-not-daily',
    ]);
    const filed = await store.tables.spends.select('ORDER BY id', []);
    expect(filed.map((s) => [s.id, s.categoryId])).toEqual([
      ['a', 'other-not-daily'],
      ['b', 'other-not-daily'],
      ['c', 'other-not-daily'],
      // A bill's payee goes to their own Bills, which stays out of the day as the line did.
      ['d', 'bills'],
      ['e', 'imported-shop-two'],
      ['f', 'imported-shop-three'],
      ['g', 'imported-shop-three'],
    ]);
    expect((await store.tables.categories.get('imported-shop-one'))?.archivedAt).not.toBeNull();
    // No amount, day total or closed day moves; nor does today's number.
    expect(await totals(store)).toEqual(before.totals);
    expect(await store.tables.closedDays.all()).toEqual(before.closed);
    expect(dayOf(store.getSnapshot())).toEqual(number);
  });

  it('does nothing the second time', async () => {
    const store = await broken();
    await repairImportedCategories(store, 'en');
    const after = await store.tables.categories.all();
    const spends = await store.tables.spends.all();
    expect(await repairImportedCategories(store, 'en')).toBe(0);
    expect(await store.tables.categories.all()).toEqual(after);
    expect(await store.tables.spends.all()).toEqual(spends);
  });

  it('tells a bring-in’s own category from one the person changed', () => {
    expect(madeForLabel(madeFor('SHOP ONE', 'shop-one', 0))).toBe(true);
    expect(madeForLabel(madeFor('SHOP ONE', 'shop-one-2', 0))).toBe(true);
    expect(madeForLabel(madeFor('Renamed', 'shop-one', 0))).toBe(false);
    expect(madeForLabel({ ...madeFor('SHOP ONE', 'shop-one', 0), hue: 120 })).toBe(false);
    expect(madeForLabel({ ...madeFor('SHOP ONE', 'shop-one', 0), countsDaily: true })).toBe(false);
    expect(madeForLabel({ ...madeFor('SHOP ONE', 'shop-one', 0), icon: 'savings' })).toBe(false);
    expect(madeForLabel(category('food', 'Food'))).toBe(false);
  });
});
