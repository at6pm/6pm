import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { heardAlertId, sightingOfEmail, type EmailCapture, type InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// One payment told by the shop and by the bank, with a fee between them. Every name, account and
// code here is made up.

const TODAY = '2026-10-11';
const T0 = new Date(2026, 9, 11, 9, 41, 7).getTime();
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const alertWords = { app: 'MB Bank', title: 'Biến động số dư', body: 'TK 99xx456|GD: -504,000VND' };
const ALERT_ID = heardAlertId(alertWords, '0f1e2d3c-4b5a-4968-a7b6-c5d4e3f2a1b0');

const alert = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: ALERT_ID,
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(1),
  amount: 504_000,
  merchant: 'NHA SACH GIO NAM',
  categoryId: null,
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  accountTail: '456',
  ...over,
});

const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-9c41',
  amount: 500_000,
  merchant: 'Nhà sách Gió Nam',
  at: at(0),
  from: 'donhang@gionam.example',
  bank: null,
  code: 'GN-20417',
  ...over,
});

const tap = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: '5d6e7f80-91a2-4b3c-8d4e-5f6a7b8c9d0e',
  kind: 'spend',
  source: 'applePay',
  status: 'caught',
  at: at(0.5),
  amount: 0,
  merchant: 'Nha Sach Gio Nam',
  categoryId: null,
  ...over,
});

describe('a spend takes each field from the best sighting', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-09-01' });
    for (const [i, id] of ['food', 'books'].entries()) {
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

  const save = (item: InboxSpend) =>
    saveInboxSpend({ store, actions, enrich: (i) => Promise.resolve(i) }, item);

  const send = (capture: EmailCapture) =>
    actions.ingest({
      sighting: sightingOfEmail(capture),
      handed: capture,
      message: { id: capture.id, source: 'email', at: capture.at },
      spend: {
        id: capture.id,
        amount: capture.amount,
        categoryId: 'books',
        merchant: capture.merchant,
        source: 'email',
        status: 'caught',
        detail: capture.from,
        at: new Date(capture.at),
      },
    });

  const only = async () => {
    const rows = await store.tables.spends.select("WHERE status != 'deleted'", []);
    expect(rows).toHaveLength(1);
    const [row] = rows;
    if (!row) throw new Error('no row');
    return row;
  };

  it.each([
    ['the shop first', ['mail', 'alert']],
    ['the bank first', ['alert', 'mail']],
  ])('takes the bank’s charge and the shop’s name, %s', async (_, order) => {
    for (const way of order) {
      if (way === 'mail') await send(mail());
      else await save(alert());
    }
    expect(await only()).toMatchObject({
      amount: 504_000,
      merchant: 'Nhà sách Gió Nam',
      categoryId: 'books',
      // The bank's alert reached the phone a minute after the shop's mail went.
      at: at(1),
    });
  });

  it('keeps an amount the person typed on the row when the bank tells it later', async () => {
    await send(mail());
    const [row] = await store.tables.spends.select('', []);
    await actions.update(row?.id ?? '', { amount: 502_000 });
    await save(alert());
    expect(await only()).toMatchObject({ amount: 502_000, merchant: 'Nhà sách Gió Nam' });
  });

  it.each([
    ['the tap first', ['tap', 'alert']],
    ['the alert first', ['alert', 'tap']],
  ])('gives a Wallet tap at 0đ the alert’s amount, %s', async (_, order) => {
    for (const way of order) await save(way === 'tap' ? tap() : alert());
    expect(await only()).toMatchObject({ amount: 504_000, merchant: 'Nha Sach Gio Nam' });
  });

  it('leaves a 0đ tap alone beside an alert from another shop', async () => {
    await save(tap({ merchant: 'Circle K' }));
    await save(alert());
    const rows = await store.tables.spends.select("WHERE status != 'deleted' ORDER BY at", []);
    expect(rows.map((r) => r.amount)).toEqual([0, 504_000]);
  });
});
