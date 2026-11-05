import { describe, expect, it, jest } from '@jest/globals';

import { armedJars, dailyNumber, FUTURE_YOU_POT_ID, payCycleOn } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { markDeclined, markHandTake, readJarAsks } from './jar-asks';
import { moneyActions } from './money-actions';
import { createMoneyStore, dayOf } from './money-store';
import { planActions } from './plan-actions';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import type { SqlDatabase } from './table';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('./money-provider', () => ({ useMoneyStore: () => null }));

const TODAY = '2026-10-11';
const lastDay = { kind: 'lastDay' } as const;
const cycle = payCycleOn(TODAY, lastDay);

async function seedCategories(db: SqlDatabase) {
  await db.runAsync(
    "INSERT INTO categories (id, name, icon, hue, counts_daily, sort) VALUES ('food', 'Food', 'restaurant', 40, 1, 0)",
    [],
  );
}

/** A 2.1 pot row, as 2.1 wrote it (no `monthly` column then). */
async function seedPot(
  db: SqlDatabase,
  row: {
    id: string;
    kind: 'goal' | 'occasion';
    goal: number;
    neededBy: string | null;
    share: number | null;
  },
) {
  await db.runAsync(
    `INSERT INTO pots (id, kind, name, icon, hue, goal, needed_by, share, paused, created_at)
     VALUES (?, ?, ?, 'savings', 40, ?, ?, ?, 0, '2026-03-02T03:00:00.000Z')`,
    [row.id, row.kind, row.id, row.goal, row.neededBy, row.share],
  );
}

async function seedMove(db: SqlDatabase, potId: string, amount: number, at = cycle.start) {
  await db.runAsync(
    "INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, 'setAside', ?, ?)",
    [`set-aside:${potId}:${at}`, potId, amount, at, `${at}T20:00:00.000Z`],
  );
}

async function seedSpend(db: SqlDatabase, id: string, day: string, amount: number) {
  await db.runAsync(
    `INSERT INTO spends (id, day, at, amount, category_id, merchant, source, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'food', 'Phở', 'manual', 'kept', ?, ?)`,
    [id, day, `${day}T05:00:00.000Z`, amount, `${day}T05:00:00.000Z`, `${day}T05:00:00.000Z`],
  );
}

/** The number exactly as 2.1 worked it out: Future you, then the occasions' set-asides, then spending. */
function number21(input: {
  futureYou: number;
  occasions: number;
  spentBefore: number;
  spentToday: number;
}) {
  return dailyNumber({
    plan: {
      income: 20_000_000,
      bills: 0,
      futureYou: input.futureYou,
      occasions: input.occasions,
      topUps: 0,
    },
    spentBefore: input.spentBefore,
    today: [{ amount: input.spentToday, category: 'food', status: 'kept' }],
    notDaily: new Set(),
    daysLeft: cycle.daysLeft,
  });
}

describe('updating from 2.1 keeps the daily number to the đồng', () => {
  it('Future you 3tr split across two goals and one dated jar', async () => {
    const db = openMemoryDb();
    await seedCategories(db);
    await writePlan(db, {
      ...DEFAULT_PLAN,
      income: 20_000_000,
      futureYou: 3_000_000,
      startedOn: '2026-03-01',
      payday: lastDay,
    });
    await seedPot(db, {
      id: 'emergency',
      kind: 'goal',
      goal: 30_000_000,
      neededBy: null,
      share: 0.6,
    });
    await seedPot(db, { id: 'laptop', kind: 'goal', goal: 25_000_000, neededBy: null, share: 0.4 });
    await seedPot(db, {
      id: 'tet',
      kind: 'occasion',
      goal: 7_000_000,
      neededBy: '2027-02',
      share: null,
    });
    await seedMove(db, 'emergency', 9_000_000, '2026-04-30');
    await seedMove(db, 'emergency', 1_800_000);
    await seedMove(db, 'laptop', 1_200_000);
    await seedMove(db, 'tet', 1_000_000);
    await seedSpend(db, 'earlier', '2026-10-03', 420_000);
    await seedSpend(db, 'lunch', TODAY, 65_000);
    const expected = number21({
      futureYou: 3_000_000,
      occasions: 1_000_000,
      spentBefore: 420_000,
      spentToday: 65_000,
    });

    const store = createMoneyStore(db, TODAY);
    await store.load(TODAY);
    const after = dayOf(store.getSnapshot());
    expect(after).toEqual(expected);

    // Future you's jar is made once, holds only this cycle's part of the slice: none, as the goals
    // take all of it; it never back-fills the months since March.
    await store.load(TODAY);
    const snap = store.getSnapshot();
    expect(snap.pots.filter((p) => p.id === FUTURE_YOU_POT_ID)).toHaveLength(1);
    expect(snap.pots[0]?.id).toBe(FUTURE_YOU_POT_ID);
    expect(snap.potSaved[FUTURE_YOU_POT_ID] ?? 0).toBe(0);
    expect(snap.potSaved.emergency).toBe(10_800_000);
    const rows = await db.getAllAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM pot_moves WHERE pot_id = 'futureYou'",
      [],
    );
    expect(rows[0]?.n).toBe(1);
  });

  it('a person with no goals: the same number, Future you holding this cycle’s slice only', async () => {
    const db = openMemoryDb();
    await seedCategories(db);
    await writePlan(db, {
      ...DEFAULT_PLAN,
      income: 20_000_000,
      futureYou: 3_000_000,
      startedOn: '2026-03-01',
      payday: lastDay,
    });
    await seedSpend(db, 'lunch', TODAY, 65_000);
    const expected = number21({
      futureYou: 3_000_000,
      occasions: 0,
      spentBefore: 0,
      spentToday: 65_000,
    });
    const store = createMoneyStore(db, TODAY);
    await store.load(TODAY);
    expect(dayOf(store.getSnapshot())).toEqual(expected);
    expect(store.getSnapshot().potSaved[FUTURE_YOU_POT_ID]).toBe(3_000_000);
  });

  it('renaming a 2.1 goal or changing its target never moves the number; choosing how it fills does', async () => {
    const db = openMemoryDb();
    await seedCategories(db);
    await writePlan(db, {
      ...DEFAULT_PLAN,
      income: 20_000_000,
      futureYou: 3_000_000,
      startedOn: '2026-03-01',
      payday: lastDay,
    });
    await seedPot(db, {
      id: 'emergency',
      kind: 'goal',
      goal: 30_000_000,
      neededBy: null,
      share: 1,
    });
    await seedMove(db, 'emergency', 3_000_000);
    const store = createMoneyStore(db, TODAY);
    await store.load(TODAY);
    const plan = planActions(store);
    const before = dayOf(store.getSnapshot())?.line;
    await plan.updatePot('emergency', { name: 'Quỹ khẩn cấp', icon: 'umbrella', hue: 145 });
    await plan.updatePot('emergency', { goal: 50_000_000 });
    expect(dayOf(store.getSnapshot())?.line).toBe(before);
    expect(store.getSnapshot().pots.find((p) => p.id === 'emergency')?.kind).toBe('goal');
    await plan.updatePot('emergency', { fill: { by: 'steady', monthly: 1_000_000 } });
    const converted = store.getSnapshot().pots.find((p) => p.id === 'emergency');
    expect(converted?.kind).toBe('occasion');
    expect(converted?.monthly).toBe(1_000_000);
    expect(dayOf(store.getSnapshot())?.startFree).toBeLessThan(
      dayOf({ ...store.getSnapshot(), setAsideThisCycle: {} })?.startFree ?? 0,
    );
  });
});

describe('spending from a jar', () => {
  async function open() {
    const db = openMemoryDb();
    await seedCategories(db);
    await writePlan(db, {
      ...DEFAULT_PLAN,
      income: 20_000_000,
      futureYou: 2_000_000,
      startedOn: '2026-03-01',
      payday: lastDay,
    });
    const store = createMoneyStore(db, TODAY);
    await store.load(TODAY);
    const plan = planActions(store);
    const money = moneyActions(store);
    const jar = await plan.createPot({
      name: 'Đà Lạt',
      icon: 'landscape',
      hue: 200,
      goal: 6_000_000,
      fill: { by: 'steady', monthly: 1_000_000 },
    });
    await plan.topUp(jar.id, 500_000);
    return { store, plan, money, jar };
  }

  it('leaves today’s number alone and the jar holds less; undo gives it back', async () => {
    const { store, money, jar } = await open();
    const before = dayOf(store.getSnapshot());
    const row = await money.addSpend({
      amount: 1_200_000,
      categoryId: 'food',
      merchant: 'KS Đồi Thông',
      source: 'manual',
      status: 'kept',
    });
    await money.takeFromJar(row.id, jar.id);
    expect(dayOf(store.getSnapshot())?.safe).toBe(before?.safe);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(300_000);
    expect(store.getSnapshot().potSpentThisCycle[jar.id]).toBe(1_200_000);
    await money.setStatus(row.id, 'deleted');
    expect(store.getSnapshot().potSaved[jar.id]).toBe(1_500_000);
    await money.undo(row.id);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(300_000);
    expect(store.getSnapshot().cycleSpends.find((s) => s.id === row.id)?.fromPot).toBe(jar.id);
    await money.takeFromJar(row.id, null);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(1_500_000);
    expect(dayOf(store.getSnapshot())?.spent).toBe(1_200_000);
  });

  it('a spend taken off its jar on the jar’s page counts today, and undo puts it back exactly', async () => {
    const { store, money, jar } = await open();
    const before = dayOf(store.getSnapshot());
    const row = await money.addSpend({
      amount: 7_000_000,
      categoryId: 'food',
      merchant: 'Vietjet',
      source: 'manual',
      status: 'kept',
      fromPot: jar.id,
    });
    const taken = { fromPot: jar.id, fromPotAmount: row.fromPotAmount };
    await money.takeFromJar(row.id, null);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(1_500_000);
    expect(dayOf(store.getSnapshot())?.spent).toBe((before?.spent ?? 0) + 7_000_000);
    // Meanwhile the jar grew: the undo still covers what it covered, not more.
    await money.restoreJarTake(row.id, taken);
    expect(store.getSnapshot().cycleSpends.find((s) => s.id === row.id)?.fromPotAmount).toBe(
      1_500_000,
    );
    expect(store.getSnapshot().potSaved[jar.id]).toBe(0);
    expect(dayOf(store.getSnapshot())?.spent).toBe((before?.spent ?? 0) + 5_500_000);
  });

  it('a spend bigger than the jar takes what it holds; the rest counts today', async () => {
    const { store, money, jar } = await open();
    const row = await money.addSpend({
      amount: 7_000_000,
      categoryId: 'food',
      merchant: 'Vietjet',
      source: 'manual',
      status: 'kept',
      fromPot: jar.id,
    });
    expect(row.fromPotAmount).toBe(1_500_000);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(0);
    expect(dayOf(store.getSnapshot())?.spent).toBe(5_500_000);
    // A smaller amount typed later is covered in full by what the jar gave back.
    const edited = await money.update(row.id, { amount: 1_000_000 });
    expect(edited?.fromPotAmount).toBe(1_000_000);
    expect(store.getSnapshot().potSaved[jar.id]).toBe(500_000);
  });

  it('deleting the jar returns its set-aside less what was already spent from it', async () => {
    const { store, plan, money, jar } = await open();
    const noJar = dayOf(store.getSnapshot())!.startFree + 1_000_000 + 500_000;
    const row = await money.addSpend({
      amount: 600_000,
      categoryId: 'food',
      merchant: 'Bus',
      source: 'manual',
      status: 'kept',
      fromPot: jar.id,
    });
    expect(row.fromPotAmount).toBe(600_000);
    await plan.archivePot(jar.id);
    const day = dayOf(store.getSnapshot())!;
    // 1,5tr went back to free money, 600k of it already spent: free is 900k higher, never 1,5tr.
    expect(day.startFree).toBe(noJar - 600_000);
    expect(day.spent).toBe(0);
  });
});

describe('what arms the close’s question', () => {
  async function open() {
    const db = openMemoryDb();
    await seedCategories(db);
    await writePlan(db, {
      ...DEFAULT_PLAN,
      income: 20_000_000,
      futureYou: 2_000_000,
      startedOn: '2026-03-01',
      payday: lastDay,
    });
    const store = createMoneyStore(db, TODAY);
    await store.load(TODAY);
    const money = moneyActions(store);
    const jar = await planActions(store).createPot({
      name: 'Đà Lạt',
      icon: 'landscape',
      hue: 200,
      goal: 6_000_000,
      fill: { by: 'date', neededBy: '2026-10' },
    });
    const armedNow = async () => {
      const asks = await readJarAsks(db);
      const snap = store.getSnapshot();
      return armedJars({
        taken: asks.taken,
        spends: [...snap.cycleSpends, ...snap.earlierJarSpends],
        declined: asks.declined,
      });
    };
    return { db, store, money, jar, armedNow };
  }
  const spend = { categoryId: 'food', source: 'manual' as const, status: 'kept' as const };

  it('a spend taken from the jar by hand in Details arms it; the close’s own yes does not', async () => {
    const { money, jar, armedNow } = await open();
    const hotel = await money.addSpend({ ...spend, amount: 1_200_000, merchant: 'KS' });
    await money.takeFromJar(hotel.id, jar.id, 'close');
    expect(await armedNow()).toEqual(new Set());
    const bus = await money.addSpend({ ...spend, amount: 350_000, merchant: 'Bus' });
    await money.takeFromJar(bus.id, jar.id);
    expect(await armedNow()).toEqual(new Set([jar.id]));
  });

  it('Quick add from a jar arms it; deleting that spend disarms it, undo arms it again', async () => {
    const { money, jar, armedNow } = await open();
    const bus = await money.addSpend({
      ...spend,
      amount: 350_000,
      merchant: 'Bus',
      fromPot: jar.id,
    });
    expect(await armedNow()).toEqual(new Set([jar.id]));
    await money.setStatus(bus.id, 'deleted');
    expect(await armedNow()).toEqual(new Set());
    await money.undo(bus.id);
    expect(await armedNow()).toEqual(new Set([jar.id]));
    await money.takeFromJar(bus.id, null);
    expect(await armedNow()).toEqual(new Set());
  });

  it('a spend taken off its jar on the jar’s page disarms it; undo arms it again', async () => {
    const { money, jar, armedNow } = await open();
    const bus = await money.addSpend({
      ...spend,
      amount: 350_000,
      merchant: 'Bus',
      fromPot: jar.id,
    });
    const taken = { fromPot: jar.id, fromPotAmount: bus.fromPotAmount };
    await money.takeFromJar(bus.id, null);
    expect(await armedNow()).toEqual(new Set());
    await money.restoreJarTake(bus.id, taken);
    expect(await armedNow()).toEqual(new Set([jar.id]));
  });

  it('a No disarms it until the next spend taken from it by hand', async () => {
    const { db, money, jar, armedNow } = await open();
    const bus = await money.addSpend({
      ...spend,
      amount: 350_000,
      merchant: 'Bus',
      fromPot: jar.id,
    });
    await markDeclined(db, jar.id, new Date(Date.now() + 1000).toISOString());
    expect(await armedNow()).toEqual(new Set());
    await markHandTake(db, bus.id, jar.id, new Date(Date.now() + 2000).toISOString());
    expect(await armedNow()).toEqual(new Set([jar.id]));
  });
});
