import { describe, expect, it, jest } from '@jest/globals';

import type { ImportRow } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { buildSnapshot, restoreSnapshot } from './backup-snapshot';
import { readFirstDay } from './diary-queries';
import {
  bringIn,
  importedIds,
  readImports,
  restoreImport,
  startDayOf,
  undoImport,
} from './import-actions';
import { createMoneyStore, dayOf, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, readPlan, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Payday the 25th; 6pm started on 1 November, part-way through the cycle that began on 25 October.
const TODAY = '2026-11-05';
const STARTED = '2026-11-01';

const row = (
  id: string,
  day: string,
  amount: number,
  label: string,
  direction: 'out' | 'in' = 'out',
): ImportRow => ({
  id,
  day,
  time: '12:30:00',
  amount,
  direction,
  label,
  merchant: label,
  note: null,
  payLater: false,
});

const ROWS: readonly ImportRow[] = [
  row('imp-a', '2025-03-02', 65_000, 'Ăn uống'),
  row('imp-b', '2026-09-30', 17_400_000, 'Lương', 'in'),
  row('imp-c', '2026-10-26', 120_000, 'Ăn uống'),
  row('imp-d', '2026-10-28', 612_000, 'Hoá đơn điện'),
  row('imp-e', '2026-10-30', 80_000, 'Ăn uống'),
];

async function open(): Promise<MoneyStore> {
  const db = openMemoryDb();
  const store = createMoneyStore(db, TODAY);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    payday: { kind: 'sameDay', day: 25 },
    startedOn: STARTED,
    spentSincePayday: 1_000_000,
  });
  await store.tables.categories.put({
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    hue: 45,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.load(TODAY);
  return store;
}

const picks = new Map([
  ['Ăn uống', { kind: 'category' as const, id: 'food' }],
  [
    'Hoá đơn điện',
    {
      kind: 'new' as const,
      id: 'bills',
      name: 'Bills',
      icon: 'receipt_long',
      hue: 80,
      countsDaily: false,
    },
  ],
]);

function bring(store: MoneyStore, rows: readonly ImportRow[] = ROWS) {
  return bringIn(store, {
    app: 'moneyLover',
    rows,
    picks,
    moneyInCategory: 'food',
    language: 'en',
  });
}

describe('bringIn', () => {
  it('writes history only: today’s number moves just as the joined cycle’s real spending says', async () => {
    const store = await open();
    const before = dayOf(store.getSnapshot());
    const record = await bring(store);
    expect(record).toMatchObject({ lines: 5, answered: true, answerBefore: 1_000_000 });
    // The joined cycle's daily lines before 1 November (the bill is not daily) replace the answer.
    expect((await readPlan(store.db))?.spentSincePayday).toBe(200_000);
    const snap = store.getSnapshot();
    expect(snap.cycleSpends).toEqual([]);
    expect(snap.categories.find((c) => c.id === 'bills')).toMatchObject({ countsDaily: false });
    // 800.000 more free money over the cycle: the number rises, and nothing else counts.
    expect(dayOf(snap)?.startFree).toBe((before?.startFree ?? 0) + 800_000);
    // The days 6pm covers start on the first day of its own, never on brought-in history.
    expect(await readFirstDay(store)).toBeNull();
    const spends = await store.tables.spends.select("WHERE source = 'import' ORDER BY day", []);
    expect(spends.map((s) => [s.id, s.status, s.direction ?? 'out', s.categoryId])).toEqual([
      ['imp-a', 'kept', 'out', 'food'],
      ['imp-b', 'kept', 'in', 'food'],
      ['imp-c', 'kept', 'out', 'food'],
      ['imp-d', 'kept', 'out', 'bills'],
      ['imp-e', 'kept', 'out', 'food'],
    ]);
    expect(spends[0]?.createdAt).toBe(spends[0]?.at);
  });

  it('adds nothing when the same file comes in twice', async () => {
    const store = await open();
    await bring(store);
    expect((await importedIds(store)).size).toBe(5);
    await bring(store);
    const [count] = await store.db.getAllAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM spends WHERE source = 'import'",
      [],
    );
    expect(count?.n).toBe(5);
  });

  it('starts from the plan’s start day', async () => {
    const store = await open();
    expect(await startDayOf(store)).toBe(STARTED);
  });
});

describe('undoImport', () => {
  it('removes only that bring-in’s lines, puts the answer back, and can bring them back', async () => {
    const store = await open();
    await store.tables.spends.put({
      id: 'mine',
      day: '2026-11-03',
      at: '2026-11-03T05:00:00.000Z',
      amount: 45_000,
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
      createdAt: '2026-11-03T05:00:00.000Z',
      updatedAt: '2026-11-03T05:00:00.000Z',
    });
    const record = await bring(store);
    const removed = await undoImport(store, record.id);
    expect(removed?.spends).toHaveLength(5);
    expect((await readPlan(store.db))?.spentSincePayday).toBe(1_000_000);
    expect(await readImports(store)).toEqual([]);
    const left = await store.tables.spends.all();
    expect(left.map((s) => s.id)).toEqual(['mine']);
    if (removed) await restoreImport(store, removed);
    expect((await importedIds(store)).size).toBe(5);
    expect((await readPlan(store.db))?.spentSincePayday).toBe(200_000);
  });
});

describe('backup', () => {
  it('carries the bring-ins and their lines, and restores them', async () => {
    const store = await open();
    await bring(store);
    const snapshot = await buildSnapshot(store.db, '2026-11-05T00:00:00.000Z');
    expect(snapshot.version).toBe(7);
    expect(snapshot.imports).toHaveLength(1);
    const other = createMoneyStore(openMemoryDb(), TODAY);
    await restoreSnapshot(other.db, snapshot);
    expect((await importedIds(other)).size).toBe(5);
    expect(await readImports(other)).toHaveLength(1);
  });

  it('restores a backup from before history could be brought in', async () => {
    const store = await open();
    const snapshot = await buildSnapshot(store.db, '2026-11-05T00:00:00.000Z');
    const { imports: _none, ...older } = snapshot;
    const other = createMoneyStore(openMemoryDb(), TODAY);
    await restoreSnapshot(other.db, { ...older, version: 6 });
    expect(await readImports(other)).toEqual([]);
  });
});
