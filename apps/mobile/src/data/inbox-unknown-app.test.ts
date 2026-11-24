import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { InboxHeard, InboxItem, InboxSpend, InboxUnread } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile } from './capture-log';
import { catchesSince } from './first-catch';
import { importInbox, type InboxImportDeps } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name, account and amount here is made up.

const TODAY = '2026-11-23';
const EVER = '1970-01-01T00:00:00.000Z';
const AT = new Date(2026, 10, 23, 9, 31).toISOString();
const PAID = 'MB Bank: TK 0123xxx456|GD: -45,000VND|ND: PHO HOA';

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

const words = (app: string) => ({ app, title: 'Mai', subtitle: '', body: PAID });

const caught = (app: string): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: AT,
  amount: 45_000,
  merchant: 'Phở Hòa',
  categoryId: 'food',
  direction: 'out',
  atKind: 'delivered',
  alertWords: words(app),
});

const unread = (app: string): InboxUnread => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'unread',
  at: AT,
  date: null,
  bank: null,
  alertWords: words(app),
});

const heard = (app: string): InboxHeard => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'heard',
  at: AT,
  bank: null,
  skipped: 'code',
  words: words(app),
});

describe('an alert in the inbox from an app that is not a bank or wallet', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;
  let logged: () => Promise<readonly unknown[]>;
  let readAlerts: jest.Mock<NonNullable<InboxImportDeps['readAlerts']>>;
  let reports: string[];

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-11-01' });
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
    // The capture log is on: anything heard would be written to it.
    const log = createCaptureLog(memoryCaptureLogFile());
    await log.turnOn();
    logged = async () => (await log.read())?.events ?? [];
    actions = moneyActions(store, undefined, log);
    reports = [];
    readAlerts = jest.fn<NonNullable<InboxImportDeps['readAlerts']>>(() =>
      Promise.resolve({ answers: new Map(), outcomes: new Map() }),
    );
  });

  const run = (inbox: ReturnType<typeof memoryInbox>) =>
    importInbox({
      store,
      actions,
      inbox,
      report: (message) => reports.push(message),
      enrich: (item) => Promise.resolve(item),
      readAlerts,
    });

  it('is not saved, though the phone read a payment from it, and its file is removed', async () => {
    const inbox = memoryInbox([caught('Zalo')]);
    expect(await run(inbox)).toEqual({ saved: 0, removed: 1 });
    expect(inbox.files.size).toBe(0);
    expect(await store.tables.spends.all()).toEqual([]);
    expect(await catchesSince(store.db, EVER)).toEqual([]);
  });

  it('is never sent for a second reading, caught or unread', async () => {
    await run(memoryInbox([caught('Zalo'), unread('Messenger')]));
    expect(readAlerts).not.toHaveBeenCalled();
    expect(await store.tables.spends.all()).toEqual([]);
  });

  it('is not written to the capture log, and what is reported never names it', async () => {
    await run(memoryInbox([caught('Zalo'), unread('Messenger'), heard('Telegram')]));
    expect(await logged()).toEqual([]);
    expect(reports).toHaveLength(3);
    expect(reports.join(' ')).not.toMatch(/Zalo|Messenger|Telegram|Mai|PHO|45/);
  });

  it('leaves a bank’s alert beside it read, asked about and saved as ever', async () => {
    const real = caught('MB Bank');
    expect(await run(memoryInbox([caught('Zalo'), real, unread('Shopee')]))).toEqual({
      saved: 1,
      removed: 3,
    });
    expect(readAlerts.mock.calls[0]?.[0].map((asked) => asked.id)).toEqual([real.id]);
    const rows = await store.tables.spends.all();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: real.id, amount: 45_000, source: 'alert' });
  });

  it('never meets an alert whose automation named no app: that one is read as before', async () => {
    const unnamed = caught('');
    expect(await run(memoryInbox([unnamed]))).toEqual({ saved: 1, removed: 1 });
    expect(readAlerts.mock.calls[0]?.[0].map((asked) => asked.id)).toEqual([unnamed.id]);
  });

  it('never meets an alert Android’s listener read, which names the app by its package', async () => {
    // The domain's own tests hold every package the listener reads to be a known app.
    const items = ['com.mbmobile', 'com.mservice.momotransfer'].map((pkg) => caught(pkg));
    expect(await run(memoryInbox(items))).toMatchObject({ removed: items.length });
    expect(reports).toEqual([]);
    expect(readAlerts.mock.calls[0]?.[0]).toHaveLength(items.length);
  });
});
