import { readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, jest } from '@jest/globals';

import { BUFFER_POT_ID, backupSnapshotSchema, type SpendRow } from '@6pm/domain';

import { type Migration, type MigrationDatabase, runMigrations } from '../db/migrate';
import { openMemoryDb } from '../features/backup/test/memory-db';
import { seedMoney } from '../features/backup/test/seed-money';
import { buildSnapshot, restoreSnapshot } from './backup-snapshot';
import { createMoneyStore, dailyInputOf, dayOf, daysLeftOf, periodOf } from './money-store';
import { openMoneyTables } from './money-tables';
import { DEFAULT_PLAN, readPlan, writePlan, type PlanSettings } from './plan-settings';
import type { SqlDatabase, SqlValue } from './table';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// A real SQLite database in memory, from Node's own module (see migrate.test.ts).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

const TAKEN = '2026-11-15T12:00:00.000Z';

/** Every migration file the app ships, as the app lists them. */
function shippedMigrations(): Migration[] {
  const folder = path.join(__dirname, '../db/migrations');
  return readdirSync(folder)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => ({
      name: file.replace(/\.ts$/, ''),
      sql: jest.requireActual<{ sql: string }>(path.join(folder, file)).sql,
    }));
}

function openSqlite() {
  const sqlite = new DatabaseSync(':memory:');
  const withTransactionAsync = async (task: () => Promise<void>) => {
    sqlite.exec('BEGIN');
    try {
      await task();
      sqlite.exec('COMMIT');
    } catch (error) {
      sqlite.exec('ROLLBACK');
      throw error;
    }
  };
  const migrations: MigrationDatabase = {
    execAsync: (source) => Promise.resolve(sqlite.exec(source)),
    getAllAsync: <T>(source: string) => Promise.resolve(sqlite.prepare(source).all() as T[]),
    runAsync: (source, params) => Promise.resolve(sqlite.prepare(source).run(...params)),
    withTransactionAsync,
  };
  const db: SqlDatabase = {
    getAllAsync: <T>(source: string, params: SqlValue[]) =>
      Promise.resolve(sqlite.prepare(source).all(...params) as T[]),
    runAsync: (source, params) => Promise.resolve(sqlite.prepare(source).run(...params)),
    withTransactionAsync,
  };
  return { migrations, db };
}

const food = {
  id: 'food',
  name: 'Ăn uống',
  icon: 'restaurant',
  hue: 45,
  countsDaily: true,
  sort: 0,
  archivedAt: null,
};

function spend(over: Partial<SpendRow> & Pick<SpendRow, 'id' | 'day' | 'amount'>): SpendRow {
  return {
    at: `${over.day}T05:00:00.000Z`,
    categoryId: 'food',
    merchant: 'Bún chả Hương Liên',
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

describe('the incomes migration', () => {
  it('adds its columns on a phone that already holds spends and rules, which read as unanswered', async () => {
    const { migrations, db } = openSqlite();
    const shipped = shippedMigrations();
    expect(shipped.map((m) => m.name)).toContain('0016-incomes');
    await runMigrations(
      migrations,
      shipped.filter((m) => m.name < '0016'),
    );
    const tables = openMoneyTables(db);
    await tables.categories.put(food);
    await db.runAsync(
      `INSERT INTO spends (id, day, at, amount, category_id, merchant, source, status, created_at, updated_at)
       VALUES ('old', '2026-11-02', '2026-11-02T05:00:00.000Z', 45000, 'food', 'Phở', 'manual', 'kept',
               '2026-11-02T05:00:00.000Z', '2026-11-02T05:00:00.000Z')`,
      [],
    );
    await db.runAsync(
      `INSERT INTO merchant_rules (merchant_key, merchant, category_id, learned_times, set_by_user)
       VALUES ('pho', 'Phở', 'food', 2, 0)`,
      [],
    );

    expect(await runMigrations(migrations, shipped)).toEqual(['0016-incomes', '0018-requests']);
    expect(await tables.spends.get('old')).toMatchObject({
      incomeId: null,
      heldBack: null,
      certificate: null,
    });
    expect(await tables.rules.get('pho')).toMatchObject({
      work: null,
      moneyIn: null,
      savedTo: null,
      incomeId: null,
    });
  });

  it('keeps what is answered, and leaves an unanswered flag empty', async () => {
    const tables = openMoneyTables(openMemoryDb());
    await tables.categories.put(food);
    await tables.spends.put(
      spend({
        id: 'pay',
        day: '2026-11-13',
        amount: 4_000_000,
        direction: 'in',
        moneyIn: 'pay',
        incomeId: 'shifts',
        heldBack: 400_000,
        certificate: true,
      }),
    );
    await tables.spends.put(spend({ id: 'lunch', day: '2026-11-13', amount: 60_000 }));
    await tables.rules.put({
      merchantKey: 'cong ty',
      merchant: 'Công ty',
      categoryId: 'food',
      learnedTimes: 1,
      setByUser: true,
      work: false,
      moneyIn: 'saved',
      savedTo: 'buffer',
      incomeId: 'shifts',
    });
    expect(await tables.spends.get('pay')).toMatchObject({
      incomeId: 'shifts',
      heldBack: 400_000,
      certificate: true,
    });
    expect((await tables.spends.get('lunch'))?.certificate).toBeNull();
    expect(await tables.rules.get('cong ty')).toMatchObject({
      work: false,
      moneyIn: 'saved',
      savedTo: 'buffer',
    });
    await expect(
      tables.spends.put(spend({ id: 'bad', day: '2026-11-13', amount: 1, heldBack: -5 })),
    ).rejects.toThrow();
  });
});

/** A month with incomes: example A's weekly pay, rent on the 18th, 800.000 for Future you. */
const weeklyPlan: PlanSettings = {
  ...DEFAULT_PLAN,
  income: 0,
  payday: { kind: 'sameDay', day: 1 },
  futureYou: 800_000,
  startedOn: '2026-09-01',
  incomes: [
    { id: 'shifts', name: null, rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 },
  ],
  lastUntil: null,
  work: { mode: 'asItComes', banks: { MB: 'always', CASH: 'sometimes', 'name:Chase': 'never' } },
};

/** Money in placed as the weekly pay, on the day it landed. */
function payOn(day: string, amount = 4_000_000): SpendRow {
  return spend({
    id: `pay-${day}`,
    day,
    amount,
    merchant: 'Quán Gió',
    direction: 'in',
    moneyIn: 'pay',
    incomeId: 'shifts',
  });
}

async function weeklyMonth(
  db: SqlDatabase,
  today: string,
  landed: readonly string[] = ['2026-11-06', '2026-11-13'],
) {
  const tables = openMoneyTables(db);
  await writePlan(db, weeklyPlan);
  await tables.categories.put(food);
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
  // 130.000 left of the week before Friday's pay.
  await tables.spends.put(spend({ id: 'week', day: '2026-11-10', amount: 2_920_000 }));
  for (const day of landed) await tables.spends.put(payOn(day));
  const store = createMoneyStore(db, today);
  await store.load(today);
  return store;
}

describe('a plan with incomes', () => {
  it('counts the week to the next pay: example A on Friday 13 Nov', async () => {
    const store = await weeklyMonth(openMemoryDb(), '2026-11-13');
    const snap = store.getSnapshot();
    expect(dailyInputOf(snap)?.period).toMatchObject({ credited: 8_000_000, reserved: 1_900_000 });
    expect(daysLeftOf(snap)).toBe(7);
    expect(dayOf(snap)).toMatchObject({ startFree: 3_180_000, line: 397_000 });
  });

  it('waits for Friday’s pay to land, holding the line to what is left', async () => {
    const db = openMemoryDb();
    await openMoneyTables(db).closedDays.put({
      day: '2026-11-12',
      closedAt: '2026-11-12T12:00:00.000Z',
      late: false,
      spent: 100_000,
      line: 380_000,
      tomorrow: 380_000,
      note: null,
    });
    const store = await weeklyMonth(db, '2026-11-13', ['2026-11-06']);
    const snap = store.getSnapshot();
    expect(dailyInputOf(snap)?.period).toMatchObject({
      credited: 4_000_000,
      reserved: 950_000,
      hold: 380_000,
    });
    // The pay is still the next money, due today; the day stays at 380.000 as far as the 130.000
    // left of last week goes.
    expect(periodOf(snap)).toMatchObject({ waiting: true, on: '2026-11-13', daysLeft: 0 });
    expect(dayOf(snap)?.line).toBe(130_000);
  });

  it('comes back from a backup with its incomes and every bank’s answer', async () => {
    const source = openMemoryDb();
    await weeklyMonth(source, '2026-11-13');
    const snapshot = backupSnapshotSchema.parse(await buildSnapshot(source, TAKEN));
    const phone = openMemoryDb();
    await restoreSnapshot(phone, snapshot);
    expect(await readPlan(phone)).toEqual(weeklyPlan);
    const restored = createMoneyStore(phone, '2026-11-13');
    await restored.load('2026-11-13');
    expect(dayOf(restored.getSnapshot())?.line).toBe(397_000);
  });
});

describe('a format 10 snapshot', () => {
  it('restores to the same numbers it left with, counted as they always were', async () => {
    const today = '2026-10-11';
    const source = openMemoryDb();
    await seedMoney(source);
    const before = createMoneyStore(source, today);
    await before.load(today);
    const taken = await buildSnapshot(source, TAKEN);
    // As a phone from before wrote it: none of the fields format 11 brought.
    const v10 = backupSnapshotSchema.parse({
      ...taken,
      version: 10,
      spends: taken.spends.map(({ incomeId: _i, heldBack: _h, certificate: _c, ...row }) => row),
      merchantRules: taken.merchantRules.map(
        ({ work: _w, moneyIn: _m, savedTo: _s, incomeId: _i, ...row }) => row,
      ),
    });
    expect(v10.spends[0]).not.toHaveProperty('incomeId');

    const phone = openMemoryDb();
    await restoreSnapshot(phone, v10);
    const after = createMoneyStore(phone, today);
    await after.load(today);

    expect(dailyInputOf(after.getSnapshot())).not.toHaveProperty('period');
    expect(dayOf(after.getSnapshot())).toEqual(dayOf(before.getSnapshot()));
    expect(daysLeftOf(after.getSnapshot())).toBe(before.getSnapshot().cycle.daysLeft);
    expect((await readPlan(phone))?.incomes).toBeUndefined();
  });

  it('is refused past this phone’s format', () => {
    const newer = { ...emptySnapshot(), version: 12 };
    expect(backupSnapshotSchema.safeParse(newer).success).toBe(false);
  });
});

function emptySnapshot() {
  return {
    version: 11,
    takenAt: TAKEN,
    settings: {},
    categories: [],
    spends: [],
    spendSightings: [],
    merchantRules: [],
    bills: [],
    pots: [],
    potMoves: [],
    closedDays: [],
  };
}

const jobs = { id: 'jobs', name: null, rhythm: { kind: 'none' as const }, amount: 0 };

/** Example B through the store: work that only lands, rent on the 5th, 500.000 for Future you. */
async function landedMonth(db: SqlDatabase) {
  const tables = openMoneyTables(db);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 0,
    payday: { kind: 'sameDay', day: 1 },
    futureYou: 500_000,
    startedOn: '2026-09-01',
    incomes: [jobs],
    incomesFrom: '2026-10-01',
  });
  await tables.categories.put(food);
  await tables.bills.put({
    id: 'rent',
    name: 'Tiền nhà',
    icon: 'home',
    hue: 30,
    amount: 3_000_000,
    dueDay: 5,
    paidCycle: null,
    sort: 0,
    archivedAt: null,
    kind: 'other',
    lastMonth: null,
    paidAmount: null,
    askedCycle: null,
  });
  return tables;
}

function landing(id: string, day: string, amount: number): SpendRow {
  return spend({
    id,
    day,
    amount,
    merchant: 'Studio Mây',
    direction: 'in',
    moneyIn: 'pay',
    incomeId: 'jobs',
    heldBack: 2_000_000,
  });
}

async function carryRows(db: SqlDatabase) {
  return db.getAllAsync<{ id: string; amount: number; cycle: string }>(
    "SELECT id, amount, cycle FROM pot_moves WHERE id LIKE 'carry:%'",
    [],
  );
}

describe('money that only lands, through the store', () => {
  it('sets the month aside from what landed and spreads the rest over six weeks at first', async () => {
    const db = openMemoryDb();
    const tables = await landedMonth(db);
    await tables.spends.put(landing('nov', '2026-11-08', 18_000_000));
    const store = createMoneyStore(db, '2026-11-08');
    await store.load('2026-11-08');
    const snap = store.getSnapshot();
    expect(periodOf(snap)).toMatchObject({
      kind: 'landed',
      credited: 18_000_000,
      reserved: 3_500_000,
      cap: null,
      minDays: 42,
    });
    // The landing is the month's own money, not money in on top of it.
    expect(dailyInputOf(snap)?.moneyIn).toBe(0);
    // Six weeks from 8 Nov reach 19 Dec: December's jars and rent are kept out before dividing.
    expect(periodOf(snap)?.ahead).toBe(3_500_000);
    expect(dayOf(snap)).toMatchObject({ startFree: 14_500_000, line: 261_000 });
    expect(snap.pots.some((p) => p.id === BUFFER_POT_ID)).toBe(false);
  });

  it('carries what October left into the buffer jar once, and November counts it', async () => {
    const db = openMemoryDb();
    const tables = await landedMonth(db);
    await tables.spends.put(landing('oct', '2026-10-03', 10_000_000));
    await tables.spends.put(spend({ id: 'oct-spend', day: '2026-10-20', amount: 4_000_000 }));

    // Loading in October writes no carry: the month has not ended.
    await createMoneyStore(db, '2026-10-25').load('2026-10-25');
    expect(await carryRows(db)).toEqual([]);

    const store = createMoneyStore(db, '2026-11-02');
    await store.load('2026-11-02');
    // 10.000.000 less 3.500.000 set aside and 4.000.000 spent.
    expect(await carryRows(db)).toEqual([
      { id: 'carry:2026-10-01', amount: 2_500_000, cycle: '2026-11-01' },
    ]);
    const snap = store.getSnapshot();
    expect(snap.pots.some((p) => p.id === BUFFER_POT_ID)).toBe(true);
    expect(snap.potSaved[BUFFER_POT_ID]).toBe(2_500_000);
    expect(periodOf(snap)).toMatchObject({
      credited: 2_500_000,
      reserved: 2_500_000,
      stillNeeded: 1_000_000,
    });

    // Another load, and October changing after, write nothing more.
    await tables.spends.put(spend({ id: 'late', day: '2026-10-28', amount: 500_000 }));
    await store.load('2026-11-03');
    expect(await carryRows(db)).toHaveLength(1);
    expect(store.getSnapshot().potSaved[BUFFER_POT_ID]).toBe(2_500_000);
  });

  it('brings the jar to what the month left, so what it held is not counted twice', async () => {
    const db = openMemoryDb();
    const tables = await landedMonth(db);
    await tables.spends.put(landing('oct', '2026-10-03', 10_000_000));
    await tables.spends.put(spend({ id: 'oct-spend', day: '2026-10-20', amount: 4_000_000 }));
    // November: nothing lands; 2.500.000 in hand, 2.500.000 set aside, so it ends at nothing.
    await tables.spends.put(landing('nov', '2026-11-20', 6_000_000));
    await tables.spends.put(spend({ id: 'nov-spend', day: '2026-11-25', amount: 1_000_000 }));
    const store = createMoneyStore(db, '2026-12-02');
    await store.load('2026-12-02');
    // November: 2.500.000 in hand + 6.000.000 landed − 3.500.000 set aside − 1.000.000 spent.
    expect(store.getSnapshot().potSaved[BUFFER_POT_ID]).toBe(4_000_000);
    expect(await carryRows(db)).toEqual([
      { id: 'carry:2026-10-01', amount: 2_500_000, cycle: '2026-11-01' },
      { id: 'carry:2026-11-01', amount: 1_500_000, cycle: '2026-12-01' },
    ]);
  });

  it('makes no buffer jar for a month that leaves nothing, and none for a monthly plan', async () => {
    const db = openMemoryDb();
    const tables = await landedMonth(db);
    await tables.spends.put(landing('oct', '2026-10-03', 3_000_000));
    await createMoneyStore(db, '2026-11-02').load('2026-11-02');
    expect(await carryRows(db)).toEqual([]);
    expect(await tables.pots.get(BUFFER_POT_ID)).toBeNull();

    const monthly = openMemoryDb();
    await seedMoney(monthly);
    await createMoneyStore(monthly, '2026-11-26').load('2026-11-26');
    expect(await carryRows(monthly)).toEqual([]);
  });
});
