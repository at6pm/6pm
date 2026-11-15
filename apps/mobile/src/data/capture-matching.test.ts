import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  addDays,
  heardAlertId,
  sightingOfEmail,
  type EmailCapture,
  type InboxSpend,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile, type CaptureLog } from './capture-log';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// One payment told three ways, with the lags they really have: the bank's alert as it moves, its
// mail an hour and a half later, the shop's receipt shared that evening. Every name, account and
// code here is made up.

const TODAY = '2026-10-11';
const T0 = new Date(2026, 9, 11, 9, 41, 7).getTime();
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();
const CODE = 'FT26284QZ7A1';

const alertWords = (balance: string) => ({
  app: 'MB Bank',
  title: 'Biến động số dư',
  body: `TK 99xx456|GD: -85,000VND|SD: ${balance}VND|ND: ${CODE} TIEM BANH GIO`,
});

const alert = (over: Partial<InboxSpend> = {}, balance = '1,200,000'): InboxSpend => ({
  v: 1,
  id: heardAlertId(alertWords(balance), crypto.randomUUID()),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(0),
  amount: 85_000,
  merchant: 'TIEM BANH GIO',
  categoryId: null,
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  reference: CODE,
  accountTail: '456',
  ...over,
});

const receipt = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'shared',
  status: 'caught',
  at: at(0),
  amount: 85_000,
  merchant: 'Tiem Banh Gio',
  categoryId: null,
  receipt: { bank: 'MB Bank', code: CODE, namingLines: [] },
  ...over,
});

const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-5b21',
  amount: 85_000,
  merchant: 'Tiem Banh Gio',
  at: at(95),
  from: 'thongbao@mbmau.example',
  bank: 'MB Bank',
  code: CODE,
  ...over,
});

describe('one way in: matching', () => {
  let store: MoneyStore;
  let log: CaptureLog;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-09-01' });
    await store.tables.categories.put({
      id: 'food',
      name: 'food',
      icon: 'restaurant',
      hue: 40,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    await store.load(TODAY);
    log = createCaptureLog(memoryCaptureLogFile());
    await log.turnOn();
    actions = moneyActions(store, undefined, log);
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
        categoryId: 'food',
        merchant: capture.merchant,
        source: 'email',
        status: 'caught',
        detail: capture.from,
        wallet: capture.bank,
        at: new Date(capture.at),
      },
    });

  /** Every row that is not deleted, by amount. */
  const rows = async () =>
    (await store.tables.spends.select("WHERE status != 'deleted' ORDER BY at", [])).map((r) => ({
      id: r.id,
      status: r.status,
    }));
  const steps = async () => (await log.read())?.events.map((e) => e.step) ?? [];

  type Way = 'alert' | 'mail' | 'receipt';
  const tell = (way: Way) => {
    if (way === 'alert') return save(alert({ id: ALERT_ID }));
    if (way === 'mail') return send(mail());
    return save(receipt({ id: RECEIPT_ID }));
  };
  const ALERT_ID = heardAlertId(alertWords('1,200,000'), '0f1e2d3c-4b5a-4968-a7b6-c5d4e3f2a1b0');
  const RECEIPT_ID = '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f';

  const orders: Way[][] = [
    ['alert', 'mail', 'receipt'],
    ['alert', 'receipt', 'mail'],
    ['mail', 'alert', 'receipt'],
    ['mail', 'receipt', 'alert'],
    ['receipt', 'alert', 'mail'],
    ['receipt', 'mail', 'alert'],
  ];

  it.each(orders)('ends as one row with three sightings told %s, %s, %s', async (...order) => {
    for (const way of order) await tell(way);
    const left = await rows();
    expect(left).toHaveLength(1);
    expect(await actions.sightings(left[0]?.id ?? '')).toHaveLength(3);
  });

  it('changes nothing when every message is told again', async () => {
    for (const way of orders[0] ?? []) await tell(way);
    const before = await rows();
    const sightings = await store.db.getAllAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM spend_sightings',
      [],
    );
    for (const way of orders[3] ?? []) await tell(way);
    expect(await rows()).toEqual(before);
    expect(
      await store.db.getAllAsync<{ n: number }>('SELECT COUNT(*) AS n FROM spend_sightings', []),
    ).toEqual(sightings);
    expect((await steps()).slice(-3)).toEqual(['sameMessage', 'sameMessage', 'sameMessage']);
  });

  it('keeps two real payments of one amount from one bank as two', async () => {
    const first = alert({ reference: 'FT26284QZ7A1' }, '1,200,000');
    const second = alert(
      {
        at: at(1),
        reference: 'FT26284QZ9B4',
        id: heardAlertId(alertWords('1,115,000'), crypto.randomUUID()),
      },
      '1,115,000',
    );
    await save(first);
    await save(second);
    // Its mail names the second one's code, two hours on: it joins that one, not the nearer.
    await send(mail({ at: at(120), code: 'FT26284QZ9B4' }));
    expect(await rows()).toHaveLength(2);
    expect(await actions.sightings(second.id)).toHaveLength(2);
    expect(await actions.sightings(first.id)).toHaveLength(0);
  });

  it('keeps two alerts of one amount a minute apart as two when they print no code', async () => {
    await save(alert({ reference: undefined }, '1,200,000'));
    await save(
      alert(
        {
          at: at(1),
          reference: undefined,
          id: heardAlertId(alertWords('1,115,000'), crypto.randomUUID()),
        },
        '1,115,000',
      ),
    );
    expect(await rows()).toHaveLength(2);
  });

  it('never brings back a payment the person said was not theirs', async () => {
    await tell('alert');
    await actions.setStatus(ALERT_ID, 'skipped');
    await tell('mail');
    await tell('receipt');
    expect(await rows()).toEqual([{ id: ALERT_ID, status: 'skipped' }]);
    expect((await steps()).slice(-2)).toEqual(['tombstone', 'tombstone']);
    expect(await actions.sightings(ALERT_ID)).toHaveLength(3);
  });

  it('keeps a deleted payment’s later mail by amount and time, and makes nothing', async () => {
    await save(alert({ reference: undefined }));
    await actions.setStatus((await rows())[0]?.id ?? '', 'deleted');
    await send(mail({ code: null, at: at(6) }));
    expect(await rows()).toEqual([]);
    expect((await steps()).at(-1)).toBe('tombstone');
  });

  it('lets a spend typed after a deleted one stand: the person is acting now', async () => {
    await save(alert({ reference: undefined }));
    await actions.setStatus((await rows())[0]?.id ?? '', 'deleted');
    await actions.addSpend({
      amount: 85_000,
      categoryId: 'food',
      merchant: 'Tiem Banh Gio',
      source: 'manual',
      status: 'kept',
      at: new Date(at(1)),
    });
    expect(await rows()).toHaveLength(1);
  });

  it('matches across payday: a payment the evening before and its mail after midnight', async () => {
    const start = store.getSnapshot().cycle.start;
    const evening = new Date(`${addDays(start, -1)}T23:58:00`).getTime();
    const late = alert({ reference: undefined, at: new Date(evening).toISOString() });
    await save(late);
    await send(mail({ code: null, at: new Date(evening + 9 * 60_000).toISOString() }));
    expect(await rows()).toHaveLength(1);
    expect((await steps()).at(-1)).toBe('samePayment');
  });
});
