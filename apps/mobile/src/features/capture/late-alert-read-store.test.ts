import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { currencyOf, heardAlertId, type HeardWords, type InboxSpend } from '@6pm/domain';

import { createAlertReadsWaiting, memoryAlertReadWaitingFile } from '../../data/alert-read-waiting';
import { renameSightingPayee, storedSightings } from '../../data/capture-sightings';
import { importInbox } from '../../data/inbox-import';
import { moneyActions } from '../../data/money-actions';
import { createMoneyStore, type MoneyStore } from '../../data/money-store';
import { namedBefore } from '../../data/named-before';
import { DEFAULT_PLAN, writePlan } from '../../data/plan-settings';
import { openMemoryDb } from '../backup/test/memory-db';
import { aiModeSettings } from '../privacy/ai-mode-stand-in';
import { createLateAlertReads } from './late-alert-read';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name, account and amount here is made up.

const TODAY = '2026-11-20';
const NOW = new Date(2026, 10, 20, 12, 0);
const BODY = 'So du TK VCB -10,000 VND luc 20-11-2026 11:11:18. So du 17,972 VND. Ref Ecom.CashIn';
const words: HeardWords = { app: 'com.VCB', title: 'Thông báo VCB', subtitle: '', body: BODY };

const alert = (): InboxSpend => ({
  v: 1,
  id: heardAlertId(words, crypto.randomUUID()),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: new Date(2026, 10, 20, 11, 11, 19).toISOString(),
  amount: 10_000,
  merchant: 'CTY TNHH HOA',
  categoryId: 'food',
  receipt: { bank: 'Vietcombank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  alertWords: words,
});

describe('a late reading on a saved row', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['setTimeout', 'setImmediate', 'nextTick'] });
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-11-01' });
    for (const [i, id] of ['food', 'bills'].entries()) {
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('names the row the import saved unanswered, as the bank’s word and not the person’s', async () => {
    const item = alert();
    const waiting = createAlertReadsWaiting(memoryAlertReadWaitingFile());
    await importInbox({
      store,
      actions,
      inbox: {
        readInbox: () => Promise.resolve([{ id: 'f0', json: JSON.stringify(item) }]),
        removeInbox: () => Promise.resolve(),
      },
      report: () => undefined,
      enrich: (spend) => Promise.resolve(spend),
      readAlerts: () =>
        Promise.resolve({ answers: new Map(), outcomes: new Map([[item.id, 'failed:timeout']]) }),
      keepForLateRead: (entry) => waiting.keep(entry),
    });
    expect((await store.tables.spends.get(item.id))?.merchant).toBe('CTY TNHH HOA');
    expect(await waiting.list()).toHaveLength(1);

    const late = createLateAlertReads({
      request: (() =>
        Promise.resolve({
          moved: 'out',
          amount: 1,
          merchant: 'Tiệm Hoa',
          category: 'bills',
        })) as never,
      settings: aiModeSettings('server'),
      ruleCategory: (merchant) => actions.ruleCategory(merchant),
      categories: () => store.getSnapshot().categories,
      home: () => currencyOf('VND'),
      waiting,
      row: (spendId) => store.tables.spends.get(spendId),
      namedBefore: (payee) => namedBefore(store.db, payee, TODAY),
      renameSighting: (spendId, captureId, payee) =>
        renameSightingPayee(store.db, spendId, captureId, payee),
      update: (spendId, patch) => actions.update(spendId, patch),
    });
    expect(await late()).toBe(0);

    const row = await store.tables.spends.get(item.id);
    expect(row?.merchant).toBe('Tiệm Hoa');
    expect(row?.categoryId).toBe('bills');
    expect(row?.amount).toBe(10_000);
    expect(row?.status).toBe('caught');
    // The screens hold the same row.
    expect(store.getSnapshot().cycleSpends.find((s) => s.id === item.id)?.merchant).toBe(
      'Tiệm Hoa',
    );
    const [sighting] = await storedSightings(store.db, [item.id]);
    expect(sighting?.payee).toBe('Tiệm Hoa');
    // No rule was learnt, and once kept the name is not taken for one the person gave the payee.
    expect(await actions.ruleCategory('Tiệm Hoa')).toBeNull();
    await actions.update(item.id, { status: 'kept' });
    expect(await namedBefore(store.db, 'CTY TNHH HOA', TODAY)).toBeNull();
    expect(await namedBefore(store.db, 'Tiệm Hoa', TODAY)).toBeNull();
    expect(await waiting.list()).toEqual([]);
  });
});
