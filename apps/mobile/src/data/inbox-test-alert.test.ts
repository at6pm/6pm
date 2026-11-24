import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  firstCatchEnded,
  firstCatchReminder,
  type InboxItem,
  type InboxSpend,
  type InboxTest,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile } from './capture-log';
import {
  catchesSince,
  firstCaughtSince,
  firstSelfRunningCatch,
  keepFirstCatchLeft,
  readFirstCatch,
} from './first-catch';
import { importInbox, type InboxImportDeps } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name and amount here is made up.

const TODAY = '2026-11-22';
const EVER = '1970-01-01T00:00:00.000Z';

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

const testAlert = (token = 'token-1'): InboxTest => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'test',
  at: new Date(2026, 10, 22, 9, 30).toISOString(),
  token,
});

const bankAlert = (): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: new Date(2026, 10, 22, 9, 31).toISOString(),
  amount: 45_000,
  merchant: 'Phở Hòa',
  categoryId: 'food',
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  alertWords: { app: 'com.mbmobile', title: 'MB Bank', subtitle: '', body: 'GD -45,000VND' },
});

describe('a test alert in the inbox', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;
  let logFile: ReturnType<typeof memoryCaptureLogFile>;
  let logged: () => Promise<readonly unknown[]>;
  let arrived: jest.Mock<(item: InboxTest) => void>;
  let readAlerts: jest.Mock<NonNullable<InboxImportDeps['readAlerts']>>;

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
    logFile = memoryCaptureLogFile();
    // The capture log is on: anything heard would be written to it.
    const log = createCaptureLog(logFile);
    await log.turnOn();
    logged = async () => (await log.read())?.events ?? [];
    actions = moneyActions(store, undefined, log);
    arrived = jest.fn<(item: InboxTest) => void>();
    readAlerts = jest.fn<NonNullable<InboxImportDeps['readAlerts']>>(() =>
      Promise.resolve({ answers: new Map(), outcomes: new Map() }),
    );
  });

  const run = (inbox: ReturnType<typeof memoryInbox>) =>
    importInbox({
      store,
      actions,
      inbox,
      report: () => undefined,
      enrich: (item) => Promise.resolve(item),
      readAlerts,
      testArrived: arrived,
    });

  it('tells the screen that sent it, saves nothing, and its file is removed', async () => {
    const item = testAlert();
    const inbox = memoryInbox([item]);
    expect(await run(inbox)).toEqual({ saved: 0, removed: 1 });
    expect(arrived).toHaveBeenCalledTimes(1);
    expect(arrived).toHaveBeenCalledWith(item);
    expect(inbox.files.size).toBe(0);
    expect(await store.tables.spends.all()).toEqual([]);
  });

  it('is in no list and no total: Today, the cycle and the Inbox stay empty', async () => {
    await run(memoryInbox([testAlert()]));
    await store.load(TODAY);
    const snap = store.getSnapshot();
    expect(snap.cycleSpends).toEqual([]);
    expect(snap.waitingBefore).toEqual([]);
  });

  it('is never sent for a second reading', async () => {
    await run(memoryInbox([testAlert()]));
    expect(readAlerts).not.toHaveBeenCalled();
  });

  it('goes to the second reader with no real alert it arrives beside', async () => {
    const real = bankAlert();
    await run(memoryInbox([testAlert(), real]));
    expect(readAlerts).toHaveBeenCalledTimes(1);
    expect(readAlerts.mock.calls[0]?.[0].map((asked) => asked.id)).toEqual([real.id]);
  });

  it('is not a catch: capture health counts none, and the capture log hears nothing', async () => {
    await run(memoryInbox([testAlert()]));
    expect(await catchesSince(store.db, EVER)).toEqual([]);
    expect(await firstCaughtSince(store, EVER)).toBeNull();
    expect(await store.db.getAllAsync('SELECT * FROM spend_sightings', [])).toEqual([]);
    expect(await logged()).toEqual([]);
  });

  it('does not end the first-catch reminder, which a real alert then does', async () => {
    await keepFirstCatchLeft(store.db, { day: '2026-11-20', at: '2026-11-20T10:00:00.000Z' });
    await run(memoryInbox([testAlert()]));
    expect(await firstSelfRunningCatch(store)).toBeNull();
    const kept = await readFirstCatch(store.db);
    expect(firstCatchEnded(kept)).toBe(false);
    // With Notification access on, Today's card is waiting for a first one, not asking to set up.
    expect(firstCatchReminder({ state: kept, today: TODAY, setUp: true })).toBe('waiting');

    await run(memoryInbox([bankAlert()]));
    expect((await firstSelfRunningCatch(store))?.source).toBe('alert');
  });

  it('leaves a real alert in the same import saved as ever', async () => {
    const real = bankAlert();
    expect(await run(memoryInbox([testAlert(), real]))).toEqual({ saved: 1, removed: 2 });
    const rows = await store.tables.spends.all();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: real.id, amount: 45_000, source: 'alert' });
    expect(arrived).toHaveBeenCalledTimes(1);
  });

  it('is dropped quietly by an import nobody is listening to', async () => {
    const inbox = memoryInbox([testAlert()]);
    const result = await importInbox({
      store,
      actions,
      inbox,
      report: () => undefined,
      enrich: (item) => Promise.resolve(item),
    });
    expect(result).toEqual({ saved: 0, removed: 1 });
    expect(await store.tables.spends.all()).toEqual([]);
  });
});
