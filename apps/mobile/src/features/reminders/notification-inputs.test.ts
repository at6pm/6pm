import { describe, expect, it, jest } from '@jest/globals';

import { remindAtFor, splitEqually, VND } from '@6pm/domain';

import { openMemoryDb } from '../backup/test/memory-db';
import { moneyActions } from '../../data/money-actions';
import { createMoneyStore, type MoneyStore } from '../../data/money-store';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../data/notification-settings';
import { owedActions } from '../../data/owed-actions';
import { DEFAULT_PLAN, writePlan } from '../../data/plan-settings';
import { memoryAfter, plannedNotifications, quietWaysOf } from './notification-inputs';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-11-25';
const NOON = new Date(2026, 10, 25, 12, 0);

async function open() {
  const db = openMemoryDb();
  const store: MoneyStore = createMoneyStore(db, TODAY);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    payday: { kind: 'lastDay' },
    startedOn: '2026-10-01',
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
  await store.load(TODAY);
  const money = moneyActions(store);
  const owed = owedActions(store);
  const dinner = await money.addSpend({
    amount: 600_000,
    categoryId: 'food',
    merchant: 'Lẩu',
    source: 'manual',
    status: 'kept',
  });
  const split = splitEqually(600_000, 2, VND);
  await owed.splitSpend(
    dinner.id,
    { mine: split.mine, others: [{ name: 'Linh', amount: split.others[0] ?? 0 }] },
    null,
  );
  return { store, owed };
}

const planned = (store: MoneyStore) =>
  plannedNotifications({
    now: NOON,
    snapshot: store.getSnapshot(),
    settings: DEFAULT_NOTIFICATION_SETTINGS,
    readyShown: new Set(),
    tradition: null,
    quietWays: [],
  });

describe('remind me on an owed line', () => {
  it('fires once at 10:00 on the third day, and settling the line first cancels it', async () => {
    const { store, owed } = await open();
    const linh = store.getSnapshot().owed.find((l) => l.name === 'Linh')!;
    const at = remindAtFor('threeDays', TODAY, store.getSnapshot().cycle.payday);
    await owed.setRemindAt([linh.id], at.toISOString());

    const reminders = planned(store).filter((n) => n.kind === 'reminders');
    expect(reminders).toEqual([
      expect.objectContaining({
        id: 'owed-remind:2026-11-28',
        at: new Date(2026, 10, 28, 10, 0),
        people: [expect.objectContaining({ name: 'Linh', amount: 300_000 })],
      }),
    ]);

    await owed.paidInCash([linh.id], 'Linh');
    expect(planned(store).some((n) => n.kind === 'reminders')).toBe(false);
  });

  it('sends payday and the close reminders beside it, all from the one plan', async () => {
    const { store } = await open();
    const kinds = planned(store).map((n) => n.kind);
    expect(kinds).toContain('payday');
    expect(kinds.filter((k) => k === 'close').length).toBeGreaterThan(1);
  });
});

describe('a way gone quiet', () => {
  it('is watched only once it caught something, alerts named by their bank', () => {
    const ways = quietWaysOf({
      catches: [
        { source: 'alert', day: '2026-11-20', at: '2026-11-20T03:00:00.000Z', detail: null },
        { source: 'shared', day: '2026-11-24', at: '2026-11-24T03:00:00.000Z', detail: null },
      ],
      lastAlert: { day: '2026-11-22', bank: 'MB' },
      ways: { alert: true, applePay: true },
      memory: { quietTold: { alert: '2026-11-10T02:00:00.000Z' } },
    });
    // A skipped alert on the 22nd says the shortcut still runs.
    expect(ways).toEqual([
      { way: 'alert', lastCatch: '2026-11-22', bank: 'MB', told: '2026-11-10T02:00:00.000Z' },
    ]);
  });

  it('remembers when a way was asked about, and forgets one taken off before it went', () => {
    const at = new Date(2026, 10, 28, 9, 0);
    const after = memoryAfter(
      { quietTold: { alert: '2026-11-10T02:00:00.000Z', applePay: '2026-12-01T02:00:00.000Z' } },
      [
        {
          kind: 'capture',
          id: 'capture-quiet:alert',
          day: '2026-11-28',
          at,
          way: 'alert',
          bank: 'MB',
          days: 3,
        },
      ],
      NOON,
    );
    expect(after).toEqual({ quietTold: { alert: at.toISOString() } });
  });
});
