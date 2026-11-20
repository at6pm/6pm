import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  heardAlertId,
  type AlertReadWaiting,
  type HeardWords,
  type InboxItem,
  type InboxSpend,
  type InboxUnread,
  type SecondReadOutcome,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile, type CaptureLog } from './capture-log';
import {
  importInbox,
  UNREAD_ALERT_WAIT_MS,
  type AlertSecondRead,
  type InboxImportDeps,
} from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name, account and amount here is made up.

const TODAY = '2026-11-18';
const NOW = new Date(2026, 10, 18, 12, 0);
const at = (minutes: number) => new Date(2026, 10, 18, 9, minutes).toISOString();

function memoryInbox(items: readonly InboxItem[]) {
  const files = new Map(items.map((item, i) => [`f${i}`, JSON.stringify(item)]));
  return {
    files,
    readInbox: () => Promise.resolve([...files].map(([id, json]) => ({ id, json }))),
    removeInbox: (ids: readonly string[]) => {
      for (const id of ids) files.delete(id);
      return Promise.resolve();
    },
  };
}

const words = (body: string): HeardWords => ({
  app: 'MB Bank',
  title: 'Thông báo biến động số dư',
  subtitle: '',
  body,
});

const caught = (body: string, over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: heardAlertId(words(body), crypto.randomUUID()),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(41),
  amount: 1_250_000,
  merchant: '',
  categoryId: 'food',
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  alertWords: words(body),
  ...over,
});

const unread = (body: string, over: Partial<InboxUnread> = {}): InboxUnread => ({
  v: 1,
  id: heardAlertId(words(body), crypto.randomUUID()),
  kind: 'unread',
  at: at(42),
  date: at(41),
  bank: 'MB Bank',
  alertWords: words(body),
  ...over,
});

describe('bank alerts read a second time at import', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;
  let log: CaptureLog;

  beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['setTimeout', 'setImmediate', 'nextTick'] });
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
    log = createCaptureLog(memoryCaptureLogFile());
    actions = moneyActions(store, undefined, log);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const run = (inbox: ReturnType<typeof memoryInbox>, readAlerts?: InboxImportDeps['readAlerts']) =>
    importInbox({
      store,
      actions,
      inbox,
      report: () => undefined,
      enrich: (item) => Promise.resolve(item),
      ...(readAlerts ? { readAlerts } : {}),
    });

  const answering =
    (
      answers: (items: readonly (InboxSpend | InboxUnread)[]) => [string, AlertSecondRead][],
      outcomes: readonly [string, SecondReadOutcome][] = [],
    ) =>
    (items: readonly (InboxSpend | InboxUnread)[]) =>
      Promise.resolve({ answers: new Map(answers(items)), outcomes: new Map(outcomes) });

  const spends = () => store.tables.spends.all();

  it('saves a caught alert as the second reader read it, and never its words', async () => {
    const item = caught('GD: -50,000VND|SD: 1,250,000VND|ND: Thanh toan QR-PHO HOA');
    const inbox = memoryInbox([item]);
    const asked: unknown[] = [];
    const result = await run(
      inbox,
      answering((items) => {
        asked.push(...items);
        return [
          [
            item.id,
            {
              kind: 'spend',
              item: { ...item, amount: 50_000, merchant: 'Phở Hòa', categoryId: 'drinks' },
            },
          ],
        ];
      }),
    );
    expect(result).toEqual({ saved: 1, removed: 1 });
    expect(asked).toEqual([item]);
    const rows = await spends();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ amount: 50_000, merchant: 'Phở Hòa', categoryId: 'drinks' });
    // Nothing the app keeps, in any table, holds the alert's words.
    const tables = await store.db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
      [],
    );
    for (const { name } of tables) {
      const rows = await store.db.getAllAsync(`SELECT * FROM "${name}"`, []);
      expect(JSON.stringify(rows)).not.toContain('Thanh toan QR');
    }
    expect(inbox.files.size).toBe(0);
  });

  it('saves a caught alert as the phone read it when there is no answer', async () => {
    const readers = [answering(() => []), () => Promise.reject(new Error('offline')), undefined];
    for (const [i, readAlerts] of readers.entries()) {
      const amount = 50_000 + i * 7_000;
      const item = caught(`GD: -${amount}VND tai CIRCLE K`, {
        amount,
        merchant: 'CIRCLE K',
        at: at(i * 10),
      });
      const inbox = memoryInbox([item]);
      expect(await run(inbox, readAlerts)).toEqual({ saved: 1, removed: 1 });
      expect(await spends()).toContainEqual(
        expect.objectContaining({ amount, merchant: 'CIRCLE K' }),
      );
    }
    expect(await spends()).toHaveLength(readers.length);
  });

  it('saves the payment the second reader finds in an alert the phone could not read', async () => {
    const missed = unread('Quý khách vừa quẹt 85.000đ ở The Coffee House');
    const inbox = memoryInbox([missed]);
    const result = await run(
      inbox,
      answering(() => [
        [
          missed.id,
          {
            kind: 'spend',
            item: {
              v: 1,
              id: missed.id,
              kind: 'spend',
              source: 'alert',
              status: 'caught',
              at: at(41),
              amount: 85_000,
              merchant: 'The Coffee House',
              categoryId: 'drinks',
              receipt: { bank: 'MB Bank', namingLines: [] },
              direction: 'out',
              atKind: 'delivered',
            },
          },
        ],
      ]),
    );
    expect(result).toEqual({ saved: 1, removed: 1 });
    expect(await spends()).toEqual([
      expect.objectContaining({ amount: 85_000, merchant: 'The Coffee House', status: 'caught' }),
    ]);
  });

  it('lets go of an unread alert the reader finds no money in', async () => {
    const missed = unread('Hạn mức mới của quý khách là 85.000.000đ');
    const inbox = memoryInbox([missed]);
    const result = await run(
      inbox,
      answering(() => [[missed.id, { kind: 'none' }]]),
    );
    expect(result).toEqual({ saved: 0, removed: 1 });
    expect(await spends()).toHaveLength(0);
  });

  it('keeps an unanswered unread alert for the next import, two days at most', async () => {
    const fresh = unread('Quý khách vừa quẹt 85.000đ ở The Coffee House');
    const old = unread('Quý khách vừa quẹt 20.000đ ở Circle K', {
      at: new Date(NOW.getTime() - UNREAD_ALERT_WAIT_MS - 60_000).toISOString(),
    });
    const inbox = memoryInbox([fresh, old]);
    const result = await run(
      inbox,
      answering(() => []),
    );
    expect(result).toEqual({ saved: 0, removed: 1 });
    expect([...inbox.files.values()].map((json) => (JSON.parse(json) as InboxUnread).id)).toEqual([
      fresh.id,
    ]);
    expect(await spends()).toHaveLength(0);
  });

  it('lets go of an unread alert when nothing reads alerts a second time', async () => {
    const inbox = memoryInbox([unread('Quý khách vừa quẹt 85.000đ ở The Coffee House')]);
    expect(await run(inbox)).toEqual({ saved: 0, removed: 1 });
  });

  it('tells the capture log what became of each second reading, and nothing when none was asked', async () => {
    await log.turnOn();
    const named = caught('GD: -50,000VND|ND: Thanh toan QR-PHO HOA', { amount: 50_000 });
    const offline = caught('GD: -64,000VND tai CIRCLE K', { amount: 64_000, at: at(10) });
    const promo = unread('Hạn mức mới của quý khách là 85.000.000đ');
    const { alertWords: _none, ...bare } = caught('GD: -71,000VND tai GS25', {
      amount: 71_000,
      at: at(20),
    });
    await run(
      memoryInbox([named, offline, promo, bare]),
      answering(
        () => [
          [named.id, { kind: 'spend', item: { ...named, merchant: 'Phở Hòa' } }],
          [promo.id, { kind: 'none' }],
        ],
        [
          [named.id, 'changed'],
          [offline.id, 'failed:network'],
          [promo.id, 'none'],
        ],
      ),
    );
    const events = (await log.read())?.events ?? [];
    const said = (amount: number) =>
      events.find((e) => (e.handed as { amount?: number }).amount === amount)?.secondRead;
    expect(said(50_000)).toBe('changed');
    expect(said(64_000)).toBe('failed:network');
    expect(events.find((e) => e.step === 'notAPayment')?.secondRead).toBe('none');
    const untouched = events.find((e) => (e.handed as { amount?: number }).amount === 71_000);
    expect(untouched).toBeDefined();
    expect(untouched).not.toHaveProperty('secondRead');
  });
  it('keeps a caught alert for a late reading only when its second reading got no answer', async () => {
    const amounts = [41_000, 42_000, 43_000, 44_000, 45_000, 46_000, 47_000, 48_000];
    const [late, stopped, failed, same, changed, none, device, bare] = amounts.map((amount, i) =>
      caught(`GD: -${amount}VND tai CUA HANG ${i}`, {
        amount,
        at: at(i),
        merchant: `CUA HANG ${i}`,
      }),
    ) as [
      InboxSpend,
      InboxSpend,
      InboxSpend,
      InboxSpend,
      InboxSpend,
      InboxSpend,
      InboxSpend,
      InboxSpend,
    ];
    const kept: AlertReadWaiting[] = [];
    await importInbox({
      store,
      actions,
      inbox: memoryInbox([late, stopped, failed, same, changed, none, device, bare]),
      report: () => undefined,
      enrich: (item) => Promise.resolve(item),
      readAlerts: answering(
        () => [
          [same.id, { kind: 'spend', item: same }],
          [changed.id, { kind: 'spend', item: { ...changed, merchant: 'Cửa Hàng' } }],
        ],
        [
          [late.id, 'late'],
          [stopped.id, 'stopped'],
          [failed.id, 'failed:timeout'],
          [same.id, 'same'],
          [changed.id, 'changed'],
          [none.id, 'none'],
          [device.id, 'device'],
        ],
      ),
      keepForLateRead: (entry) => {
        kept.push(entry);
        return Promise.resolve();
      },
    });
    expect((await spends()).length).toBe(8);
    expect(kept.map((entry) => entry.captureId).sort()).toEqual(
      [late.id, stopped.id, failed.id].sort(),
    );
    const one = kept.find((entry) => entry.captureId === late.id);
    expect(one).toEqual({
      spendId: late.id,
      captureId: late.id,
      at: late.at,
      words: late.alertWords,
      read: { direction: 'out', amount: 41_000, merchant: 'CUA HANG 0' },
      saved: { merchant: 'CUA HANG 0', categoryId: 'food' },
    });
    // The words are kept there and nowhere on the row.
    expect(JSON.stringify(await spends())).not.toContain('GD: -41000VND');
  });
});
