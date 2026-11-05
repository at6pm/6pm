import { describe, expect, it, jest } from '@jest/globals';

import { sql as createSettings } from '../db/migrations/0001-create-settings';
import { sql as createMoneyTables } from '../db/migrations/0002-create-money-tables';
import { sql as createTogetherMoves } from '../db/migrations/0003-create-together-moves';
import { sql as addCurrencyGuessed } from '../db/migrations/0004-spend-currency-guessed';
import { sql as addPotMoveOpening } from '../db/migrations/0007-pot-move-opening';
import { sql as addBillPayments } from '../db/migrations/0008-bill-kind-and-payments';
import { sql as addSpendMemo } from '../db/migrations/0009-spend-memo';
import { sql as addSightingCapture } from '../db/migrations/0006-sighting-capture-id';
import { sql as addMoneyIn } from '../db/migrations/0010-money-in';
import { sql as addJars } from '../db/migrations/0011-jars';
import { sql as addImports } from '../db/migrations/0012-imports';
import { sql as addOwed } from '../db/migrations/0013-owed';
import { createMoneyStore, dayOf } from './money-store';
import { planActions } from './plan-actions';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import type { SqlDatabase, SqlValue } from './table';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('./money-provider', () => ({ useMoneyStore: () => null }));

// A real SQLite database in memory, from Node's own module (see migrate.test.ts).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

async function open(today: string, startedOn = '2026-09-01') {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(createSettings);
  sqlite.exec(createMoneyTables);
  sqlite.exec(createTogetherMoves);
  sqlite.exec(addCurrencyGuessed);
  sqlite.exec(addPotMoveOpening);
  sqlite.exec(addBillPayments);
  sqlite.exec(addSpendMemo);
  sqlite.exec(addSightingCapture);
  sqlite.exec(addMoneyIn);
  sqlite.exec(addJars);
  sqlite.exec(addImports);
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
  const store = createMoneyStore(db, today);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    payday: { kind: 'lastDay' },
    futureYou: 2_000_000,
    startedOn,
  });
  await store.load(today);
  return { store, actions: planActions(store), sqlite };
}

const byDate = (neededBy: string) => ({ by: 'date' as const, neededBy });
const pot = {
  name: 'Japan',
  icon: 'flight',
  hue: 200,
  goal: 3_000_000,
  fill: byDate('2026-12'),
};

/** Set-aside moves of the jars made here, Future you's own jar left out. */
const moveCount = (sqlite: InstanceType<typeof DatabaseSync>, kind: string) =>
  (
    sqlite
      .prepare("SELECT COUNT(*) AS n FROM pot_moves WHERE kind = ? AND pot_id != 'futureYou'")
      .get(kind) as { n: number }
  ).n;

const own = (ids: Readonly<Record<string, number>>) =>
  Object.fromEntries(Object.entries(ids).filter(([id]) => id !== 'futureYou'));

describe('pot set-aside', () => {
  it('records the month into the pot the moment it is made, and the daily number moves', async () => {
    const { store, actions } = await open('2026-10-11');
    const before = dayOf(store.getSnapshot())?.startFree ?? 0;
    const made = await actions.createPot(pot);
    const snap = store.getSnapshot();
    expect(snap.potSaved[made.id]).toBe(1_500_000);
    expect(snap.setAsideThisCycle[made.id]).toBe(1_500_000);
    expect(dayOf(snap)?.startFree).toBe(before - 1_500_000);
  });

  it('never records a cycle twice, however often the app loads', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    await actions.createPot(pot);
    await store.load('2026-10-11');
    await store.load('2026-10-20');
    expect(moveCount(sqlite, 'setAside')).toBe(1);
  });

  it('keeps the daily number fixed through the 1st of a month in the middle of a cycle', async () => {
    const { store, actions } = await open('2026-09-28');
    await actions.updateMonth({ payday: { kind: 'sameDay', day: 25 } });
    await actions.createPot(pot);
    const a = dayOf(store.getSnapshot())?.startFree;
    await store.load('2026-10-02');
    // A day later in the same cycle, nothing was spent: the pot still takes the same amount.
    expect(Object.values(own(store.getSnapshot().setAsideThisCycle))).toEqual([1_500_000]);
    expect(dayOf(store.getSnapshot())?.startFree).toBe(a);
  });

  it('puts the next month in on payday and stops when the pot is full', async () => {
    const { store, actions } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    await store.load('2026-10-31');
    expect(store.getSnapshot().potSaved[made.id]).toBe(3_000_000);
    await store.load('2026-11-30');
    expect(store.getSnapshot().potSaved[made.id]).toBe(3_000_000);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(0);
  });

  it('catches up the cycles a long absence skipped', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot({ ...pot, goal: 6_000_000, fill: byDate('2027-03') });
    await store.load('2027-01-15');
    // 1tr a month from the cycle of October: Oct, Nov, Dec and Jan cycles are all recorded.
    expect(moveCount(sqlite, 'setAside')).toBe(4);
    expect(store.getSnapshot().potSaved[made.id]).toBeGreaterThan(1_200_000);
  });

  it('counts a top-up in the pot and out of free money, but not in the cycle’s set-aside', async () => {
    const { store, actions } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    await actions.topUp(made.id, 100_000);
    await store.load('2026-10-12');
    const snap = store.getSnapshot();
    expect(snap.potSaved[made.id]).toBe(1_600_000);
    expect(snap.setAsideThisCycle[made.id]).toBe(1_500_000);
    expect(snap.topUpsThisCycle).toBe(100_000);
  });

  it('changes the cycle’s set-aside when the pot is edited, and pausing frees the money', async () => {
    const { store, actions } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    await actions.updatePot(made.id, { goal: 2_000_000 });
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(1_000_000);
    await actions.updatePot(made.id, { paused: true });
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(0);
    await actions.updatePot(made.id, { paused: false });
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(1_000_000);
  });

  it('gives the money back when a pot is deleted, and takes it again when restored', async () => {
    const { store, actions } = await open('2026-10-11');
    const before = dayOf(store.getSnapshot())?.startFree ?? 0;
    const made = await actions.createPot(pot);
    await actions.archivePot(made.id);
    expect(dayOf(store.getSnapshot())?.startFree).toBe(before);
    expect(store.getSnapshot().pots.map((p) => p.id)).toEqual(['futureYou']);
    await actions.restorePot(made.id);
    expect(dayOf(store.getSnapshot())?.startFree).toBe(before - 1_500_000);
  });
});

describe('updateMonth', () => {
  it('moves the running cycle with its records when payday changes', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    await actions.createPot(pot);
    await actions.updateMonth({ payday: { kind: 'sameDay', day: 25 } });
    expect(store.getSnapshot().cycle.start).toBe('2026-09-25');
    expect(moveCount(sqlite, 'setAside')).toBe(1);
    expect(Object.values(own(store.getSnapshot().setAsideThisCycle))).toEqual([1_500_000]);
  });
});

describe('already saved', () => {
  const wedding = { ...pot, name: 'Wedding', goal: 50_000_000, fill: byDate('2027-08') };
  const openings = (sqlite: InstanceType<typeof DatabaseSync>) =>
    sqlite.prepare("SELECT amount FROM pot_moves WHERE kind = 'opening'").all();

  it('counts toward the pot and its monthly, and never comes out of today', async () => {
    const { store, actions } = await open('2026-10-11');
    const before = dayOf(store.getSnapshot())?.startFree ?? 0;
    const made = await actions.createPot({ ...wedding, opening: 20_000_000 });
    const snap = store.getSnapshot();
    // 30tr left over 10 months: 3tr a month, not 5tr.
    expect(snap.setAsideThisCycle[made.id]).toBe(3_000_000);
    expect(snap.potSaved[made.id]).toBe(23_000_000);
    expect(snap.topUpsThisCycle).toBe(0);
    expect(dayOf(snap)?.startFree).toBe(before - 3_000_000);
  });

  it('replaces the one opening move when edited, and works the cycle out again', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot({ ...wedding, opening: 20_000_000 });
    await actions.updatePot(made.id, { opening: 25_000_000 });
    expect(openings(sqlite)).toEqual([{ amount: 25_000_000 }]);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(2_500_000);
    expect(store.getSnapshot().topUpsThisCycle).toBe(0);
    await actions.updatePot(made.id, { opening: 0 });
    expect(openings(sqlite)).toEqual([]);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(5_000_000);
  });

  it('writes nothing for a pot made without one', async () => {
    const { actions, sqlite } = await open('2026-10-11');
    await actions.createPot(wedding);
    expect(openings(sqlite)).toEqual([]);
  });
});

describe('removing a jar’s moves', () => {
  const free = (store: Awaited<ReturnType<typeof open>>['store']) =>
    dayOf(store.getSnapshot())?.startFree ?? 0;
  const topUpId = (sqlite: InstanceType<typeof DatabaseSync>, potId: string) =>
    (
      sqlite
        .prepare("SELECT id FROM pot_moves WHERE kind = 'topUp' AND pot_id = ? AND amount > 0")
        .get(potId) as { id: string }
    ).id;

  it('gives a top-up made this cycle back to free money, and undo takes it again', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    const before = free(store);
    await actions.topUp(made.id, 200_000);
    expect(free(store)).toBe(before - 200_000);
    const removed = await actions.removeTopUp(topUpId(sqlite, made.id));
    expect(removed?.removal).toBe('delete');
    expect(free(store)).toBe(before);
    expect(store.getSnapshot().potSaved[made.id]).toBe(1_500_000);
    expect(store.getSnapshot().topUpsThisCycle).toBe(0);
    if (removed) await actions.restoreTopUp(removed);
    expect(free(store)).toBe(before - 200_000);
    expect(store.getSnapshot().potSaved[made.id]).toBe(1_700_000);
    expect(moveCount(sqlite, 'topUp')).toBe(1);
  });

  it('takes an earlier cycle’s top-up back out this cycle, so this cycle has it free', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    sqlite
      .prepare(
        "INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES ('old', ?, 300000, 'topUp', '2026-08-31', '2026-09-10T05:00:00.000Z')",
      )
      .run(made.id);
    await store.load('2026-10-11');
    const before = free(store);
    const saved = store.getSnapshot().potSaved[made.id] ?? 0;
    const removed = await actions.removeTopUp('old');
    expect(removed?.removal).toBe('takeBack');
    expect(free(store)).toBe(before + 300_000);
    expect(store.getSnapshot().potSaved[made.id]).toBe(saved - 300_000);
    if (removed) await actions.restoreTopUp(removed);
    expect(free(store)).toBe(before);
    expect(store.getSnapshot().potSaved[made.id]).toBe(saved);
    expect(moveCount(sqlite, 'topUp')).toBe(1);
  });

  it('sets what a jar held before 6pm to 0, and undo puts it back', async () => {
    const { store, actions } = await open('2026-10-11');
    const wedding = { ...pot, name: 'Wedding', goal: 50_000_000, fill: byDate('2027-08') };
    const made = await actions.createPot({ ...wedding, opening: 20_000_000 });
    const before = store.getSnapshot();
    const held = await actions.removeOpening(made.id);
    expect(held).toBe(20_000_000);
    expect(store.getSnapshot().potSaved[made.id]).toBe(5_000_000);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(5_000_000);
    await actions.updatePot(made.id, { opening: held });
    expect(store.getSnapshot().potSaved[made.id]).toBe(before.potSaved[made.id]);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(before.setAsideThisCycle[made.id]);
    expect(dayOf(store.getSnapshot())?.startFree).toBe(dayOf(before)?.startFree);
  });

  it('has nothing to remove from a jar that started empty', async () => {
    const { actions } = await open('2026-10-11');
    const made = await actions.createPot(pot);
    expect(await actions.removeOpening(made.id)).toBe(0);
    expect(await actions.removeTopUp('missing')).toBeNull();
  });
});

describe('adding money already saved', () => {
  const wedding = { ...pot, name: 'Wedding', goal: 50_000_000, fill: byDate('2027-08') };
  const free = (store: Awaited<ReturnType<typeof open>>['store']) =>
    dayOf(store.getSnapshot())?.startFree ?? 0;
  const savedIds = (sqlite: InstanceType<typeof DatabaseSync>) =>
    (
      sqlite
        .prepare("SELECT id FROM pot_moves WHERE id LIKE 'already-saved:%' ORDER BY amount")
        .all() as { id: string }[]
    ).map((r) => r.id);

  it('counts in the jar and leaves today’s number and this cycle’s set-aside alone', async () => {
    const { store, actions } = await open('2026-10-11');
    const made = await actions.createPot(wedding);
    const before = store.getSnapshot();
    const line = dayOf(before)?.line;
    await actions.addAlreadySaved(made.id, 10_000_000);
    const snap = store.getSnapshot();
    expect(snap.potSaved[made.id]).toBe((before.potSaved[made.id] ?? 0) + 10_000_000);
    expect(snap.setAsideThisCycle[made.id]).toBe(5_000_000);
    expect(snap.topUpsThisCycle).toBe(0);
    expect(free(store)).toBe(dayOf(before)?.startFree);
    expect(dayOf(snap)?.line).toBe(line);
    // The same after a reload, as on the next launch.
    await store.load('2026-10-11');
    expect(free(store)).toBe(dayOf(before)?.startFree);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(5_000_000);
  });

  it('lowers what a dated jar takes from the next payday on', async () => {
    const { store, actions } = await open('2026-10-11');
    const made = await actions.createPot(wedding);
    await actions.addAlreadySaved(made.id, 10_000_000);
    await store.load('2026-11-02');
    // 15tr held by the new cycle: 35tr left over 9 months is 3.9tr, not 5tr.
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(3_900_000);
  });

  it('removes only the one add, and undo puts that row back exactly', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot({ ...wedding, opening: 20_000_000 });
    await actions.addAlreadySaved(made.id, 2_000_000);
    await actions.addAlreadySaved(made.id, 3_000_000);
    const before = store.getSnapshot();
    const rows = sqlite.prepare("SELECT * FROM pot_moves WHERE kind = 'opening' ORDER BY id").all();
    const [small] = savedIds(sqlite);
    const removed = await actions.removeAlreadySaved(small ?? '');
    expect(removed?.amount).toBe(2_000_000);
    expect(store.getSnapshot().potSaved[made.id]).toBe((before.potSaved[made.id] ?? 0) - 2_000_000);
    expect(store.getSnapshot().setAsideThisCycle[made.id]).toBe(before.setAsideThisCycle[made.id]);
    expect(free(store)).toBe(dayOf(before)?.startFree);
    expect(savedIds(sqlite)).toHaveLength(1);
    if (removed) await actions.restoreAlreadySaved(removed);
    expect(
      sqlite.prepare("SELECT * FROM pot_moves WHERE kind = 'opening' ORDER BY id").all(),
    ).toEqual(rows);
    expect(store.getSnapshot().potSaved[made.id]).toBe(before.potSaved[made.id]);
    expect(free(store)).toBe(dayOf(before)?.startFree);
  });

  it('keeps later adds when “Jar started” is removed', async () => {
    const { store, actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot({ ...wedding, opening: 20_000_000 });
    await actions.addAlreadySaved(made.id, 3_000_000);
    expect(await actions.removeOpening(made.id)).toBe(20_000_000);
    expect(savedIds(sqlite)).toHaveLength(1);
    expect(await actions.removeAlreadySaved(`opening:${made.id}`)).toBeNull();
    expect(store.getSnapshot().potSaved[made.id]).toBeGreaterThanOrEqual(3_000_000);
  });

  it('writes nothing for nothing', async () => {
    const { actions, sqlite } = await open('2026-10-11');
    const made = await actions.createPot(wedding);
    await actions.addAlreadySaved(made.id, 0);
    expect(savedIds(sqlite)).toEqual([]);
  });
});
