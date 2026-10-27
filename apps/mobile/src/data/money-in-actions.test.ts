import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { FUTURE_YOU } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { moneyActions } from './money-actions';
import { createMoneyStore, dayOf, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-10-11';
const INSTANT = '2026-10-01T00:00:00.000Z';

async function open() {
  const db = openMemoryDb();
  const store: MoneyStore = createMoneyStore(db, TODAY);
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
  const pot = {
    icon: 'savings',
    hue: 150,
    goal: 10_000_000,
    neededBy: null,
    paused: false,
    createdAt: INSTANT,
    archivedAt: null,
  };
  await store.tables.pots.put({
    ...pot,
    id: 'cushion',
    kind: 'goal',
    name: 'Cushion',
    share: 0.75,
  });
  await store.tables.pots.put({ ...pot, id: 'laptop', kind: 'goal', name: 'Laptop', share: 0.25 });
  await store.tables.pots.put({
    ...pot,
    id: 'dalat',
    kind: 'occasion',
    name: 'Đà Lạt',
    share: null,
    neededBy: '2027-02',
  });
  await store.load(TODAY);
  return { store, actions: moneyActions(store) };
}

const gift = {
  amount: 2_000_000,
  categoryId: 'food',
  merchant: 'Lan Nguyễn',
  source: 'email' as const,
  status: 'caught' as const,
  direction: 'in' as const,
};

describe('money that came in', () => {
  let ctx: Awaited<ReturnType<typeof open>>;
  beforeEach(async () => {
    ctx = await open();
  });

  const free = () => dayOf(ctx.store.getSnapshot())!.startFree;

  it('changes nothing while it waits', async () => {
    const before = free();
    await ctx.actions.addSpend(gift);
    expect(free()).toBe(before);
  });

  it('adds to free money once spread', async () => {
    const before = free();
    const row = await ctx.actions.addSpend(gift);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'spread' });
    expect(free()).toBe(before + 2_000_000);
  });

  it('never merges with a spend of the same amount', async () => {
    const at = new Date(2026, 9, 11, 12, 0);
    const out = await ctx.actions.captureSpend({ ...gift, direction: 'out', at });
    const back = await ctx.actions.captureSpend({ ...gift, source: 'shared', at });
    expect(back.merged).toBe(false);
    expect(back.row.id).not.toBe(out.row.id);
  });

  it('saved for Future you, tops its goals up by share and holds today', async () => {
    const before = dayOf(ctx.store.getSnapshot())!.line;
    const row = await ctx.actions.addSpend(gift);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'saved', savedTo: FUTURE_YOU });
    const snap = ctx.store.getSnapshot();
    expect(snap.potSaved['cushion']).toBe(1_500_000);
    expect(snap.potSaved['laptop']).toBe(500_000);
    expect(dayOf(snap)!.line).toBe(before);
  });

  // A pot also holds its own set-aside for the month; saving adds on top of it.
  const inDalat = () => ctx.store.getSnapshot().potSaved['dalat'] ?? 0;

  it('saved in a pot, then placed again, moves the money rather than adding it twice', async () => {
    const before = inDalat();
    const row = await ctx.actions.addSpend(gift);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'saved', savedTo: 'dalat' });
    expect(inDalat()).toBe(before + 2_000_000);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'saved', savedTo: 'dalat' });
    expect(inDalat()).toBe(before + 2_000_000);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'spread' });
    expect(inDalat()).toBe(before);
  });

  it('taken back, waits again with nothing saved', async () => {
    const before = free();
    const held = inDalat();
    const row = await ctx.actions.addSpend(gift);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'saved', savedTo: 'dalat' });
    const back = await ctx.actions.unplaceMoneyIn(row.id);
    expect(back?.status).toBe('caught');
    expect(back?.moneyIn).toBeNull();
    expect(inDalat()).toBe(held);
    expect(free()).toBe(before);
  });

  it('kept as the pay, peels what came beyond the plan off as money of its own', async () => {
    const before = free();
    const row = await ctx.actions.addSpend({ ...gift, amount: 21_500_000 });
    const extra = await ctx.actions.keepPay(row.id, 20_000_000);
    expect(extra).not.toBeNull();
    const pay = await ctx.store.tables.spends.get(row.id);
    expect(pay?.amount).toBe(20_000_000);
    expect(pay?.moneyIn).toBe('pay');
    const piece = await ctx.store.tables.spends.get(extra!);
    expect(piece?.amount).toBe(1_500_000);
    expect(piece?.status).toBe('caught');
    expect(piece?.direction).toBe('in');
    // The pay was in the plan already; the extra waits for the close.
    expect(free()).toBe(before);
  });

  it('kept as a refund, gives the spend’s money back', async () => {
    const earbuds = await ctx.actions.addSpend({ ...gift, direction: 'out', merchant: 'Shopee' });
    const before = free();
    const back = await ctx.actions.addSpend({ ...gift, merchant: 'Shopee', moneyIn: 'refund' });
    await ctx.actions.placeMoneyIn(back.id, { moneyIn: 'refund', givesBack: earbuds.id });
    expect(free()).toBe(before + 2_000_000);
    expect((await ctx.store.tables.spends.get(back.id))?.givesBack).toBe(earbuds.id);
  });

  it('kept as a payback, leaves the number alone', async () => {
    const before = free();
    const row = await ctx.actions.addSpend(gift);
    await ctx.actions.placeMoneyIn(row.id, { moneyIn: 'payback', givesBack: 'pizza' });
    expect(free()).toBe(before);
  });
});
