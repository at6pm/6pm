import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { BACKUP_SNAPSHOT_VERSION, backupSnapshotSchema, splitEqually, VND } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { buildSnapshot, restoreSnapshot } from './backup-snapshot';
import { moneyActions } from './money-actions';
import { createMoneyStore, dayOf, type MoneyStore } from './money-store';
import { openOwedOf, owedActions } from './owed-actions';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const DINNER = '2026-10-09';
const TODAY = '2026-10-11';

async function open(today = DINNER, db = openMemoryDb()) {
  const store: MoneyStore = createMoneyStore(db, today);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    futureYou: 0,
    payday: { kind: 'sameDay', day: 25 },
    startedOn: '2026-09-01',
  });
  await store.tables.categories.put({
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    hue: 40,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.load(today);
  return { store, db, money: moneyActions(store), owed: owedActions(store) };
}

type Ctx = Awaited<ReturnType<typeof open>>;

/** The acceptance story: a 1,2tr dinner split four ways with Linh, Nam and Huy. */
async function splitDinner(ctx: Ctx) {
  const dinner = await ctx.money.addSpend({
    amount: 1_200_000,
    categoryId: 'food',
    merchant: 'Lẩu Manwah',
    source: 'manual',
    status: 'kept',
  });
  const split = splitEqually(1_200_000, 4, VND);
  const names = ['Linh', 'Nam', 'Huy'];
  await ctx.owed.splitSpend(
    dinner.id,
    {
      mine: split.mine,
      others: split.others.map((amount, i) => ({ name: names[i] ?? null, amount })),
    },
    'Split 4 ways · 1.200.000₫',
  );
  return dinner.id;
}

const spentToday = (store: MoneyStore) => dayOf(store.getSnapshot())!.spent;
const lineOf = (store: MoneyStore, name: string) =>
  store.getSnapshot().owed.find((line) => line.name === name)!;

describe('who owes me', () => {
  let ctx: Ctx;
  beforeEach(async () => {
    ctx = await open();
  });

  it('counts only the user’s share of a split, and owes the rest by name', async () => {
    const id = await splitDinner(ctx);
    const snap = ctx.store.getSnapshot();
    expect(spentToday(ctx.store)).toBe(300_000);
    expect(snap.cycleSpends.find((s) => s.id === id)).toMatchObject({
      amount: 300_000,
      note: 'Split 4 ways · 1.200.000₫',
    });
    expect(openOwedOf(snap).map((l) => [l.name, l.amount, l.day])).toEqual([
      ['Linh', 300_000, DINNER],
      ['Nam', 300_000, DINNER],
      ['Huy', 300_000, DINNER],
    ]);
  });

  it('splits again from the whole bill, and back to one', async () => {
    const id = await splitDinner(ctx);
    await ctx.owed.splitSpend(
      id,
      { mine: 600_000, others: [{ name: 'Linh', amount: 600_000 }] },
      null,
    );
    expect(ctx.store.getSnapshot().owed.map((l) => [l.name, l.amount])).toEqual([
      ['Linh', 600_000],
    ]);
    expect(spentToday(ctx.store)).toBe(600_000);
    expect(await ctx.owed.splitSpend(id, { mine: 500_000, others: [] }, null)).toBeNull();
    await ctx.owed.splitSpend(id, { mine: 1_200_000, others: [] }, null);
    expect(ctx.store.getSnapshot().owed).toEqual([]);
    expect(spentToday(ctx.store)).toBe(1_200_000);
  });

  it('leaves a deleted spend owing nothing, and undo brings its lines back', async () => {
    const id = await splitDinner(ctx);
    await ctx.money.setStatus(id, 'deleted');
    expect(openOwedOf(ctx.store.getSnapshot())).toEqual([]);
    await ctx.money.undo(id);
    await ctx.store.load(DINNER);
    expect(openOwedOf(ctx.store.getSnapshot())).toHaveLength(3);
  });

  it('settles a payback that came in, and the number does not move', async () => {
    await splitDinner(ctx);
    const later = await open(TODAY, ctx.db);
    const before = dayOf(later.store.getSnapshot())!.startFree;
    const linh = lineOf(later.store, 'Linh');
    const back = await later.money.addSpend({
      amount: 300_000,
      categoryId: 'food',
      merchant: 'NGUYEN THU LINH',
      source: 'alert',
      status: 'caught',
      direction: 'in',
    });
    await later.money.placeMoneyIn(back.id, {
      moneyIn: 'payback',
      givesBack: linh.spendId,
      owed: [linh.id],
    });
    expect(later.store.getSnapshot().owed.map((l) => l.name)).toEqual(['Nam', 'Huy']);
    expect(dayOf(later.store.getSnapshot())!.startFree).toBe(before);
    await later.money.unplaceMoneyIn(back.id);
    expect(later.store.getSnapshot().owed.map((l) => l.name)).toEqual(['Linh', 'Nam', 'Huy']);
  });

  it('covers a share as today’s own spending, never the dinner’s day', async () => {
    await splitDinner(ctx);
    const closed = (await ctx.store.tables.spends.select('WHERE day = ?', [DINNER])).map(
      (s) => s.amount,
    );
    const later = await open(TODAY, ctx.db);
    const nam = lineOf(later.store, 'Nam');
    const done = await later.owed.cover([nam.id], 'Covered Nam');
    expect(spentToday(later.store)).toBe(300_000);
    expect(
      (await later.store.tables.spends.select('WHERE day = ?', [DINNER])).map((s) => s.amount),
    ).toEqual(closed);
    expect(later.store.getSnapshot().owed.map((l) => l.name)).toEqual(['Linh', 'Huy']);
    await later.owed.unsettle(done!);
    expect(spentToday(later.store)).toBe(0);
    expect(later.store.getSnapshot().owed.map((l) => l.name)).toEqual(['Linh', 'Nam', 'Huy']);
  });

  it('keeps a cash payback today, which moves nothing', async () => {
    await splitDinner(ctx);
    const later = await open(TODAY, ctx.db);
    const before = dayOf(later.store.getSnapshot())!;
    const huy = lineOf(later.store, 'Huy');
    const done = await later.owed.paidInCash([huy.id], 'Huy');
    const payback = later.store.getSnapshot().cycleSpends.find((s) => s.id === done!.spendId);
    expect(payback).toMatchObject({
      day: TODAY,
      amount: 300_000,
      direction: 'in',
      moneyIn: 'payback',
      status: 'kept',
      source: 'cash',
    });
    expect(dayOf(later.store.getSnapshot())).toEqual(before);
    // Deleting that payback anywhere opens the line again.
    await later.money.setStatus(done!.spendId, 'deleted');
    await later.store.load(TODAY);
    expect(later.store.getSnapshot().owed.map((l) => l.name)).toContain('Huy');
  });

  it('keeps a reminder time on the lines', async () => {
    await splitDinner(ctx);
    const linh = lineOf(ctx.store, 'Linh');
    await ctx.owed.setRemindAt([linh.id], '2026-10-12T11:00:00.000Z');
    expect(lineOf(ctx.store, 'Linh').remindAt).toBe('2026-10-12T11:00:00.000Z');
  });

  it('is carried by a backup', async () => {
    await splitDinner(ctx);
    const snapshot = await buildSnapshot(ctx.db, '2026-10-12T00:00:00.000Z');
    expect(snapshot.version).toBe(BACKUP_SNAPSHOT_VERSION);
    expect(snapshot.owed).toHaveLength(3);
    const phone = await open(DINNER);
    await restoreSnapshot(phone.db, snapshot);
    await phone.store.load(DINNER);
    expect(phone.store.getSnapshot().owed).toHaveLength(3);
  });

  /** The snapshot as a phone of an earlier format wrote it: no owed lines, and before format 8 no
   * season jars or envelopes either. */
  const olderSnapshot = async (version: 7 | 8) => {
    await splitDinner(ctx);
    const { owed, ...rest } = await buildSnapshot(ctx.db, '2026-10-12T00:00:00.000Z');
    expect(owed).toHaveLength(3);
    if (version === 8) return { ...rest, version };
    return {
      ...rest,
      version,
      pots: rest.pots.map(({ season: _season, ...pot }) => pot),
      spends: rest.spends.map(({ envelopes: _envelopes, ...spend }) => spend),
    };
  };

  it.each([7, 8] as const)('restores a format %i backup with nobody owing', async (version) => {
    const older = await olderSnapshot(version);
    expect(backupSnapshotSchema.safeParse(older).success).toBe(true);
    const phone = await open(DINNER);
    await restoreSnapshot(phone.db, older);
    await phone.store.load(DINNER);
    expect(phone.store.getSnapshot().owed).toEqual([]);
    expect(spentToday(phone.store)).toBe(300_000);
  });
});
