import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { heardAlertId, sightingOfEmail, type EmailCapture, type InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile, type CaptureLog } from './capture-log';
import { readApart } from './capture-sightings';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name, account and code here is made up.

const TODAY = '2026-10-11';
const T0 = new Date(2026, 9, 11, 10, 30, 0).getTime();
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const words = { app: 'MB Bank', title: 'Biến động số dư', body: 'TK 99xx456|GD: -50,000VND' };
const ALERT_ID = heardAlertId(words, '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d');

const alert = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: ALERT_ID,
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(1),
  amount: 50_000,
  merchant: 'CA PHE MOC',
  categoryId: null,
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  accountTail: '456',
  ...over,
});

const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-31d0',
  amount: 50_000,
  merchant: 'Cà phê Mộc',
  at: at(2),
  from: 'hoadon@caphemoc.example',
  bank: null,
  code: 'CPM-118',
  ...over,
});

describe('answers about how a payment was caught', () => {
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
        at: new Date(capture.at),
      },
    });

  const typeIt = () =>
    actions.addSpend({
      amount: 50_000,
      categoryId: 'food',
      merchant: 'Coffee',
      source: 'manual',
      status: 'kept',
      at: new Date(at(0)),
    });

  const rows = async () =>
    (await store.tables.spends.select("WHERE status != 'deleted' ORDER BY at", [])).map((r) => ({
      id: r.id,
      amount: r.amount,
      merchant: r.merchant,
      status: r.status,
    }));
  const steps = async () => (await log.read())?.events.map((e) => e.step) ?? [];

  describe('a spend the person typed', () => {
    it('is never merged with the alert of it, and is offered instead', async () => {
      const typed = await typeIt();
      await save(alert());
      expect(await rows()).toHaveLength(2);
      expect((await actions.typedTwin(ALERT_ID))?.id).toBe(typed.id);
      // The typed row itself is never offered as anything.
      expect(await actions.typedTwin(typed.id)).toBeNull();
    });

    it('takes the alert on Yes, keeping what the person typed', async () => {
      const typed = await typeIt();
      await save(alert());
      const joined = await actions.sameAsTyped(ALERT_ID, typed.id);
      expect(await rows()).toEqual([
        { id: typed.id, amount: 50_000, merchant: 'Coffee', status: 'kept' },
      ]);
      expect(await actions.sightings(typed.id)).toHaveLength(2);
      // The alert told again is a message already saved, and the offer is gone.
      await save(alert());
      expect((await steps()).at(-1)).toBe('sameMessage');
      expect(await actions.typedTwin(typed.id)).toBeNull();

      if (!joined) throw new Error('not joined');
      await actions.undoSameAsTyped(joined);
      expect(await rows()).toHaveLength(2);
      expect(await actions.sightings(typed.id)).toHaveLength(0);
      expect((await actions.typedTwin(ALERT_ID))?.id).toBe(typed.id);
    });

    it('is never offered again once the person says No', async () => {
      const typed = await typeIt();
      await save(alert());
      await actions.notSameAsTyped(ALERT_ID, typed.id);
      expect(await actions.typedTwin(ALERT_ID)).toBeNull();
      expect(await rows()).toHaveLength(2);
    });
  });

  describe('These are two', () => {
    const merged = async () => {
      await save(alert());
      await send(mail());
      expect(await rows()).toHaveLength(1);
    };

    it('shows a merged row’s witnesses, its own first', async () => {
      await merged();
      expect(await actions.witnesses(ALERT_ID)).toMatchObject([
        { source: 'alert', channel: 'alert', name: 'MB Bank', own: true },
        { source: 'email', channel: 'email', witness: 'shop', own: false },
      ]);
    });

    it('splits the last sighting into a row of its own, and never merges the two again', async () => {
      await merged();
      const done = await actions.splitApart(ALERT_ID);
      expect(done?.made.id).toBe('em-31d0');
      expect(await rows()).toEqual([
        { id: ALERT_ID, amount: 50_000, merchant: 'CA PHE MOC', status: 'caught' },
        { id: 'em-31d0', amount: 50_000, merchant: 'Cà phê Mộc', status: 'caught' },
      ]);
      expect(await readApart(store.db)).toHaveLength(1);

      // Told again, every sighting stays where the person put it.
      await save(alert());
      await send(mail());
      expect((await rows()).map((r) => r.id)).toEqual([ALERT_ID, 'em-31d0']);
      expect(await actions.sightings(ALERT_ID)).toHaveLength(0);
      expect((await steps()).slice(-2)).toEqual(['sameMessage', 'sameMessage']);
    });

    it('puts the row back as it was on undo', async () => {
      await merged();
      const before = await store.tables.spends.get(ALERT_ID);
      const done = await actions.splitApart(ALERT_ID);
      if (!done) throw new Error('not split');
      await actions.undoSplitApart(done);
      expect(await rows()).toHaveLength(1);
      expect(await store.tables.spends.get(ALERT_ID)).toMatchObject({
        amount: before?.amount,
        merchant: before?.merchant,
      });
      expect(await actions.sightings(ALERT_ID)).toHaveLength(2);
      expect(await readApart(store.db)).toEqual([]);
    });

    it('gives a typed spend its caught twin back as a row of its own', async () => {
      const typed = await typeIt();
      await save(alert());
      await actions.sameAsTyped(ALERT_ID, typed.id);
      await actions.splitApart(typed.id);
      expect((await rows()).map((r) => r.id)).toEqual([typed.id, ALERT_ID]);
      expect(await actions.typedTwin(ALERT_ID)).toBeNull();
    });

    it('leaves a row seen once alone', async () => {
      await save(alert());
      expect(await actions.splitApart(ALERT_ID)).toBeNull();
    });
  });

  it('gathers a row, its sightings and every capture it holds for This is wrong', async () => {
    await save(alert());
    await send(mail());
    const report = await actions.captureReport(ALERT_ID);
    expect(report?.sightings).toHaveLength(2);
    expect(report?.ids).toEqual([ALERT_ID, ALERT_ID, 'em-31d0']);
  });
});
