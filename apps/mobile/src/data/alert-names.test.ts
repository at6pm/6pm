import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { ALERT_NAMES_MAX, alertNameKey, alertNames } from './alert-names';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name and amount here is made up.

const TODAY = '2026-11-18';
const at = (day: number) => new Date(2026, 10, day, 11, 46).toISOString();
const lines = ['Thanh toán HIGHLANDS COFFEE thành công'];

const alert = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID().replace(/^(.{14})./, '$18'),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(18),
  amount: 119_000,
  merchant: '',
  categoryId: 'food',
  receipt: { bank: 'MoMo', namingLines: lines, payeeSure: false },
  direction: 'out',
  atKind: 'delivered',
  ...over,
});

describe('the names kept for alert wordings', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-11-01' });
    for (const [i, id] of ['food', 'drinks'].entries()) {
      await store.tables.categories.put({
        id,
        name: id,
        icon: 'restaurant',
        hue: 40,
        countsDaily: true,
        sort: i,
        archivedAt: null,
      });
    }
    await store.load(TODAY);
    actions = moneyActions(store);
  });

  it('tells wordings apart by bank and words, not by case or accents', () => {
    expect(alertNameKey('MoMo', lines)).toBe(
      alertNameKey('MoMo', ['thanh toan highlands coffee thanh cong']),
    );
    expect(alertNameKey('MoMo', lines)).not.toBe(alertNameKey('ZaloPay', lines));
    expect(alertNameKey('MoMo', lines)).not.toBe(
      alertNameKey('MoMo', ['Thanh toán CIRCLE K thành công']),
    );
  });

  it('remembers a name, replaces it, and lets the oldest go', async () => {
    const names = alertNames(store.db);
    expect(await names.get('a')).toBeNull();
    await names.put('a', { merchant: 'Highlands Coffee', category: 'drinks' });
    await names.put('a', { merchant: 'Highlands', category: null });
    expect(await names.get('a')).toEqual({ merchant: 'Highlands', category: null });
    for (let i = 0; i < ALERT_NAMES_MAX; i += 1) {
      await names.put(`k${i}`, { merchant: `Shop ${i}`, category: null });
    }
    expect(await names.get('a')).toBeNull();
    expect(await names.get(`k${ALERT_NAMES_MAX - 1}`)).toEqual({
      merchant: `Shop ${ALERT_NAMES_MAX - 1}`,
      category: null,
    });
  });

  it('saves an alert the phone read no payee from under the name it is given', async () => {
    const id = await saveInboxSpend(
      {
        store,
        actions,
        enrich: (i) => Promise.resolve(i),
        nameAlert: (i) =>
          Promise.resolve({ ...i, merchant: 'Highlands Coffee', categoryId: 'drinks' }),
      },
      alert(),
    );
    expect(await store.tables.spends.get(id ?? '')).toMatchObject({
      merchant: 'Highlands Coffee',
      categoryId: 'drinks',
      amount: 119_000,
    });
  });

  it('calls a named alert what the person called that payee before', async () => {
    const deps = {
      store,
      actions,
      enrich: (i: InboxSpend) => Promise.resolve(i),
      nameAlert: (i: InboxSpend) => Promise.resolve({ ...i, merchant: 'Highlands Coffee' }),
    };
    // An earlier alert named the shop itself; the person renamed and filed that row.
    const first = await saveInboxSpend(
      deps,
      alert({
        at: at(10),
        merchant: 'HIGHLANDS COFFEE',
        receipt: { bank: 'MoMo', namingLines: [] },
      }),
    );
    await actions.update(first ?? '', { merchant: 'Cà phê sáng', categoryId: 'drinks' });
    await actions.setStatus(first ?? '', 'kept');
    const next = await saveInboxSpend(deps, alert());
    expect(await store.tables.spends.get(next ?? '')).toMatchObject({
      merchant: 'Cà phê sáng',
      categoryId: 'drinks',
    });
  });
});
