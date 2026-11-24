import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { addDays, localDateOf, type InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import {
  catchesSince,
  firstCaughtSince,
  firstSelfRunningCatch,
  keepFirstCatch,
  keepFirstCatchLeft,
  putAwayFirstCatch,
  readFirstCatch,
  readFirstCatchAway,
  readMonthReading,
  startReadingCount,
  writeFirstCatch,
} from './first-catch';
import { importInbox } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

/** Spends are stamped with the real clock, so the month counted is this one. */
const TODAY = localDateOf(new Date());
const NEXT_MONTH = addDays(`${TODAY.slice(0, 7)}-01`, 40);

const shared = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'shared',
  status: 'caught',
  at: new Date(Date.now() - 60_000).toISOString(),
  amount: 65_000,
  merchant: 'Highlands Coffee',
  categoryId: null,
  receipt: { bank: 'Techcombank', namingLines: [], payeeSure: true },
  ...over,
});

const inboxOf = (items: readonly InboxSpend[]) => {
  const files = new Map(items.map((item, i) => [`f${i}`, JSON.stringify(item)]));
  return {
    readInbox: () => Promise.resolve([...files].map(([id, json]) => ({ id, json }))),
    removeInbox: (ids: readonly string[]) => {
      for (const id of ids) files.delete(id);
      return Promise.resolve();
    },
  };
};

describe('first catch on the phone', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    store = createMoneyStore(openMemoryDb(), TODAY);
    await store.load(TODAY);
    actions = moneyActions(store);
  });

  const run = (items: readonly InboxSpend[], language: 'en' | 'vi' = 'vi') =>
    importInbox({
      store,
      actions,
      inbox: inboxOf(items),
      report: () => undefined,
      enrich: (item) => Promise.resolve(item),
      language,
    });

  it('keeps where the first catch stands', async () => {
    expect(await readFirstCatch(store.db)).toBeNull();
    await writeFirstCatch(store.db, { state: 'later', day: TODAY, at: new Date().toISOString() });
    expect(await readFirstCatch(store.db)).toMatchObject({ state: 'later', day: TODAY });
  });

  it('names the starter categories in the phone’s language when a catch lands during onboarding', async () => {
    // No plan and no categories yet: onboarding is still open.
    expect(store.getSnapshot().categories).toHaveLength(0);
    await run([shared()], 'vi');
    const names = store.getSnapshot().categories.map((c) => c.name);
    expect(names).toContain('Ăn uống');
    expect(names).not.toContain('Food');
    expect(await store.tables.spends.all()).toHaveLength(1);
  });

  it('finds the first catch since listening began, never a typed spend', async () => {
    await run([shared({ merchant: 'Before' })]);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const since = new Date().toISOString();
    await actions.addSpend({
      amount: 30_000,
      categoryId: 'food',
      merchant: 'Bánh mì',
      source: 'manual',
      status: 'kept',
    });
    expect(await firstCaughtSince(store, since)).toBeNull();
    await run([shared({ id: crypto.randomUUID(), amount: 32_000, merchant: 'Circle K' })]);
    expect((await firstCaughtSince(store, since))?.merchant).toBe('Circle K');
    expect(await firstCaughtSince(store, new Date(Date.now() + 60_000).toISOString())).toBeNull();
  });

  it('finds no catch from a way that runs by itself among shared, scanned and typed spends', async () => {
    await run([shared()]);
    for (const source of ['qr', 'manual', 'voice'] as const) {
      await actions.addSpend({
        amount: 30_000,
        categoryId: 'food',
        merchant: 'Bánh mì',
        source,
        status: 'kept',
      });
    }
    expect(await firstCaughtSince(store, '1970-01-01T00:00:00.000Z')).not.toBeNull();
    expect(await firstSelfRunningCatch(store)).toBeNull();
  });

  it('finds the first bank alert, Wallet tap or email, even one taken back since', async () => {
    await run([shared()]);
    await run([shared({ id: crypto.randomUUID(), source: 'alert', amount: 12_000 })]);
    const caught = await firstSelfRunningCatch(store);
    expect(caught).toMatchObject({ source: 'alert', amount: 12_000 });
    if (!caught) throw new Error('no catch');
    await actions.update(caught.id, { status: 'deleted' });
    expect((await firstSelfRunningCatch(store))?.id).toBe(caught.id);
  });

  it('counts a bank alert that joined a shared receipt as the way running', async () => {
    await run([shared()]);
    expect(await firstSelfRunningCatch(store)).toBeNull();
    // The bank's alert for the same payment, a moment later: one spend, seen two ways.
    await run([shared({ id: crypto.randomUUID(), source: 'alert', at: new Date().toISOString() })]);
    expect(await store.tables.spends.all()).toHaveLength(1);
    expect(await firstSelfRunningCatch(store)).toMatchObject({ source: 'shared' });
  });

  it('keeps a shared catch as onboarding’s own, and lets it change nothing afterwards', async () => {
    const at = new Date().toISOString();
    await keepFirstCatch(store.db, { source: 'shared', at, day: TODAY, ways: ['wallet'] });
    expect(await readFirstCatch(store.db)).toEqual({
      state: 'caught',
      at,
      source: 'shared',
      day: TODAY,
      ways: ['wallet'],
    });
    await keepFirstCatchLeft(store.db, { day: TODAY, at, ways: ['alerts'] });
    const left = await readFirstCatch(store.db);
    expect(left).toEqual({ state: 'later', day: TODAY, at, ways: ['wallet', 'alerts'] });
    await keepFirstCatch(store.db, { source: 'qr', at, day: NEXT_MONTH });
    expect(await readFirstCatch(store.db)).toEqual(left);
  });

  it('ends the reminder for good once a way that runs by itself catches something', async () => {
    const at = new Date().toISOString();
    await writeFirstCatch(store.db, { state: 'later', day: TODAY, at });
    await keepFirstCatch(store.db, { source: 'applePay', at, day: NEXT_MONTH });
    const ended = await readFirstCatch(store.db);
    expect(ended).toMatchObject({ state: 'caught', source: 'applePay', day: TODAY });
    await keepFirstCatchLeft(store.db, { day: NEXT_MONTH, at });
    await keepFirstCatch(store.db, { source: 'shared', at, day: NEXT_MONTH });
    expect(await readFirstCatch(store.db)).toEqual(ended);
  });

  it('counts each time Today’s reminder is put away, next to the first-catch state', async () => {
    expect(await readFirstCatchAway(store.db)).toBeNull();
    await putAwayFirstCatch(store.db, TODAY);
    expect(await readFirstCatchAway(store.db)).toEqual({ times: 1, day: TODAY });
    await putAwayFirstCatch(store.db, NEXT_MONTH);
    expect(await readFirstCatchAway(store.db)).toEqual({ times: 2, day: NEXT_MONTH });
    // The state itself is untouched by it.
    expect(await readFirstCatch(store.db)).toBeNull();
  });

  it('lists every catch by the day it arrived', async () => {
    await run([shared(), shared({ id: crypto.randomUUID(), source: 'alert', amount: 12_000 })]);
    const seen = await catchesSince(store.db, '2026-01-01T00:00:00.000Z');
    expect(seen.map((s) => s.source).sort()).toEqual(['alert', 'shared']);
  });

  it('counts this month’s receipts read right, with closer looks and fixes', async () => {
    await run([
      shared(),
      shared({ id: crypto.randomUUID(), receipt: { namingLines: [], looked: true } }),
      shared({
        id: crypto.randomUUID(),
        amount: 125_000,
        receipt: { namingLines: [], read: { amount: 1_250_000 } },
      }),
    ]);
    const month = await readMonthReading(store, TODAY);
    expect(month.accuracy).toMatchObject({ total: 3, right: 2, looked: 1 });
    expect(month.accuracy.fixes[0]?.amount).toEqual({ from: 1_250_000, to: 125_000 });
  });

  it('counts a receipt fixed by hand afterwards, but not a new category', async () => {
    await run([shared()]);
    const [spend] = await store.tables.spends.all();
    if (!spend) throw new Error('no spend');
    await actions.update(spend.id, { categoryId: 'drinks' });
    expect((await readMonthReading(store, TODAY)).accuracy.right).toBe(1);
    await actions.update(spend.id, { merchant: 'Highlands' });
    const month = await readMonthReading(store, TODAY);
    expect(month.accuracy.right).toBe(0);
    expect(month.accuracy.fixes[0]?.merchant).toEqual({
      from: 'Highlands Coffee',
      to: 'Highlands',
    });
  });

  it('counts this month by the day a receipt arrived, whatever its own day', async () => {
    // A receipt from last month shared today counts this month, and not next month.
    await run([shared({ at: new Date(Date.now() - 40 * 86_400_000).toISOString() })]);
    expect((await readMonthReading(store, TODAY)).accuracy.total).toBe(1);
    expect((await readMonthReading(store, NEXT_MONTH)).accuracy.total).toBe(0);
  });

  it('counts only receipts that arrived once the phone began counting', async () => {
    await run([shared()]);
    await new Promise((resolve) => setTimeout(resolve, 5));
    await startReadingCount(store.db);
    await run([shared({ id: crypto.randomUUID(), amount: 40_000, merchant: 'Circle K' })]);
    expect((await readMonthReading(store, TODAY)).accuracy.total).toBe(1);
  });
});
