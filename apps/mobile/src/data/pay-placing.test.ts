import { describe, expect, it, jest } from '@jest/globals';

import { merchantKeyOf } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { moneyActions } from './money-actions';
import { createMoneyStore, periodOf } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import { readRememberedMoney } from './remembered-money';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-11-13';
const SENDER = 'Quán Gió';

/** A weekly earner on Friday 13 Nov: last Friday's pay placed, today's caught and waiting. */
async function open() {
  const db = openMemoryDb();
  await writePlan(db, {
    ...DEFAULT_PLAN,
    payday: { kind: 'sameDay', day: 1 },
    futureYou: 800_000,
    startedOn: '2026-09-01',
    incomes: [
      { id: 'shifts', name: null, rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 },
    ],
  });
  const store = createMoneyStore(db, TODAY);
  await store.tables.categories.put({
    id: 'income',
    name: 'Income',
    icon: 'payments',
    hue: 140,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.tables.pots.put({
    id: 'dalat',
    kind: 'occasion',
    name: 'Đà Lạt',
    icon: 'landscape',
    hue: 150,
    goal: 6_000_000,
    neededBy: null,
    share: null,
    monthly: null,
    paused: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    archivedAt: null,
  });
  const actions = moneyActions(store);
  const row = (day: string, amount: number, merchant = SENDER) =>
    actions.addSpend({
      day,
      amount,
      categoryId: 'income',
      merchant,
      source: 'alert',
      status: 'caught',
      direction: 'in',
    });
  const last = await row('2026-11-06', 4_000_000);
  await actions.keepPay(last.id, { amount: 4_000_000, incomeId: 'shifts' });
  await store.load(TODAY);
  return { store, actions, row };
}

describe('placing a pay', () => {
  it('stops the weekly month waiting once today’s pay is placed as that income', async () => {
    const { store, actions, row } = await open();
    const today = await row(TODAY, 4_000_000);
    expect(periodOf(store.getSnapshot())).toMatchObject({ waiting: true, credited: 4_000_000 });

    await actions.keepPay(today.id, { amount: 4_000_000, incomeId: 'shifts' });
    expect(periodOf(store.getSnapshot())).toMatchObject({
      waiting: false,
      credited: 8_000_000,
      // Two of the four Fridays' slices of the 800.000 for Future you.
      reserved: 400_000,
    });
    expect((await store.tables.spends.get(today.id))?.incomeId).toBe('shifts');
  });

  it('splits what came beyond the pay off as money of its own', async () => {
    const { store, actions, row } = await open();
    const today = await row(TODAY, 4_600_000);
    const extra = await actions.keepPay(today.id, { amount: 4_000_000, incomeId: 'shifts' });
    expect(extra).not.toBeNull();
    const piece = await store.tables.spends.get(extra ?? '');
    expect(piece).toMatchObject({ amount: 600_000, status: 'caught', incomeId: null });
  });

  it('remembers the sender: its pay, and where other money from a sender was saved', async () => {
    const { store, actions, row } = await open();
    const remembered = await readRememberedMoney(store);
    expect(remembered.get(merchantKeyOf(SENDER))).toMatchObject({
      moneyIn: 'pay',
      incomeId: 'shifts',
      learnedTimes: 0,
      setByUser: false,
    });

    const gift = await row(TODAY, 500_000, 'Mẹ');
    await actions.placeMoneyIn(gift.id, { moneyIn: 'saved', savedTo: 'dalat' });
    expect((await readRememberedMoney(store)).get(merchantKeyOf('Mẹ'))).toMatchObject({
      moneyIn: 'saved',
      savedTo: 'dalat',
    });
  });

  it('keeps a category the sender already had, and what it remembers when it is re-filed', async () => {
    const { store, actions, row } = await open();
    await actions.rememberMerchant('Mẹ', 'income');
    const gift = await row(TODAY, 500_000, 'Mẹ');
    await actions.placeMoneyIn(gift.id, { moneyIn: 'spread' });
    await actions.rememberMerchant('Mẹ', 'income');
    expect(await store.tables.rules.get(merchantKeyOf('Mẹ'))).toMatchObject({
      learnedTimes: 2,
      setByUser: true,
      moneyIn: 'spread',
    });
  });
});
