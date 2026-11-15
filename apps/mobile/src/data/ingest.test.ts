import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  heardAlertId,
  sightingOfEmail,
  type CaptureLogEvent,
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

const TODAY = '2026-10-11';
const at = (minutes: number, seconds = 0) =>
  new Date(2026, 9, 11, 12, 30 + minutes, seconds).toISOString();

const item = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'applePay',
  status: 'caught',
  at: at(0),
  amount: 64_000,
  merchant: 'Quan Chao Ga Mai',
  categoryId: null,
  ...over,
});

const words = (balance: string) => ({
  app: 'MB Bank',
  title: 'Biến động số dư',
  body: `TK 77xx09|GD: -64,000VND|SD: ${balance}VND|ND: QUAN CHAO GA MAI`,
});

const alert = (over: Partial<InboxSpend> = {}): InboxSpend =>
  item({
    source: 'alert',
    merchant: 'QUAN CHAO GA MAI',
    receipt: { bank: 'MB Bank', namingLines: [] },
    ...over,
  });

const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-7f3a',
  amount: 64_000,
  merchant: 'Quan Chao Ga Mai',
  at: at(1),
  from: 'hoadon@chaogamai.example',
  bank: null,
  code: 'HD-55102',
  ...over,
});

describe('ingest', () => {
  let store: MoneyStore;
  let log: CaptureLog;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-10-01' });
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

  const save = (incoming: InboxSpend) =>
    saveInboxSpend({ store, actions, enrich: (i) => Promise.resolve(i) }, incoming);

  /** The steps the log saw, oldest first. */
  const steps = async () => (await log.read())?.events.map((e) => e.step) ?? [];
  const last = async (): Promise<CaptureLogEvent | undefined> => (await log.read())?.events.at(-1);

  it('makes a new row of a payment nothing holds, and logs what decided it', async () => {
    const tap = item();
    const id = await save(tap);
    expect(id).toBe(tap.id);
    const event = await last();
    expect(event).toMatchObject({
      channel: 'wallet',
      handed: tap,
      step: 'newRow',
      row: { id: tap.id, merchant: 'Quan Chao Ga Mai' },
      sighting: { witness: { kind: 'wallet', name: 'Apple Pay' }, amount: 64_000 },
    });
  });

  it('a typed spend goes through it too, the person its witness', async () => {
    const row = await actions.addSpend({
      amount: 25_000,
      categoryId: 'food',
      merchant: 'Banh Mi Co Tu',
      source: 'manual',
      status: 'kept',
    });
    expect(await last()).toMatchObject({
      channel: 'typed',
      step: 'newRow',
      row: { id: row.id },
      sighting: { witness: { kind: 'person' }, atKind: 'now', payee: 'Banh Mi Co Tu' },
    });
  });

  it('skips a message already saved before any other check, never building its spend', async () => {
    const tap = item();
    await save(tap);
    const build = jest.fn(() => Promise.reject(new Error('built')));
    const result = await actions.ingest({
      sighting: {
        witness: { kind: 'wallet' },
        channel: 'wallet',
        what: 'payment',
        direction: 'out',
        at: tap.at,
      },
      handed: tap,
      message: tap,
      inbox: { item: tap },
      spend: build,
    });
    expect(result).toEqual({ step: 'sameMessage', capture: null });
    expect(build).not.toHaveBeenCalled();
    expect(await last()).toMatchObject({ step: 'sameMessage', row: null });
  });

  it('skips Wallet’s second report of one tap', async () => {
    await save(item());
    expect(await save(item({ at: at(1) }))).toBeNull();
    expect(await steps()).toEqual(['newRow', 'repeatTap']);
  });

  it('skips a bank receipt shared again', async () => {
    const receipt = { bank: 'Vietcombank', code: 'FT26284QZ1', namingLines: [] };
    await save(item({ source: 'shared', receipt }));
    expect(await save(item({ source: 'shared', receipt, at: at(40) }))).toBeNull();
    expect(await steps()).toEqual(['newRow', 'sameReceipt']);
  });

  it('skips one bank notification caught twice', async () => {
    const first = alert({ id: heardAlertId(words('1,200,000'), crypto.randomUUID()) });
    const again = alert({ id: heardAlertId(words('1,200,000'), crypto.randomUUID()), at: at(1) });
    await save(first);
    expect(await save(again)).toBeNull();
    expect(await steps()).toEqual(['newRow', 'repeatAlert']);
  });

  it('joins a second witness of a payment to its row, keeping what that witness said', async () => {
    const first = alert({ id: heardAlertId(words('1,200,000'), crypto.randomUUID()) });
    await save(first);
    const capture = mail();
    const result = await actions.ingest({
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
    expect(result.step).toBe('samePayment');
    expect(result.capture?.row.id).toBe(first.id);
    const kept = await store.db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM spend_sightings WHERE capture_id = ?',
      [capture.id],
    );
    expect(kept[0]).toMatchObject({
      channel: 'email',
      witness_kind: 'shop',
      witness_name: 'chaogamai.example',
      what: 'payment',
      amount: 64_000,
      currency: 'VND',
      direction: 'out',
      reference: 'HD-55102',
      payee: 'Quan Chao Ga Mai',
    });
    expect(await last()).toMatchObject({ step: 'samePayment', row: { id: first.id } });
  });

  it('keeps both sides of money moved between the person’s own accounts as one row set aside', async () => {
    const out = alert({ amount: 3_000_000, at: at(0, 5) });
    const into = alert({
      amount: 3_000_000,
      at: at(0, 40),
      direction: 'in',
      merchant: 'NGUYEN VAN MAU',
      receipt: { bank: 'Vietcombank', namingLines: [] },
    });
    await save(out);
    await save(into);
    expect((await store.tables.spends.get(out.id))?.status).toBe('skipped');
    expect(await store.tables.spends.get(into.id)).toBeNull();
    expect(await last()).toMatchObject({ step: 'ownTransfer', row: { id: out.id } });
  });

  it('logs an alert’s own words when the extension kept them for the log', async () => {
    const heard = words('1,200,000');
    const caught = alert({
      id: heardAlertId(heard, crypto.randomUUID()),
      words: { ...heard, subtitle: '' },
    });
    await save(caught);
    expect((await last())?.handed).toMatchObject({ words: { body: heard.body } });
    // The words go to the log alone: the row keeps what it always kept.
    expect(JSON.stringify(await store.tables.spends.get(caught.id))).not.toContain('SD: 1,200,000');
  });

  it('logs an alert that moved no money as not a payment, and saves nothing', async () => {
    actions.hear({
      v: 1,
      id: crypto.randomUUID(),
      kind: 'heard',
      at: at(0),
      bank: 'MB Bank',
      skipped: 'code',
      words: { app: 'MB Bank', title: '', subtitle: '', body: 'Ma OTP cua ban la 123456' },
    });
    expect(await last()).toMatchObject({
      channel: 'alert',
      step: 'notAPayment',
      skipped: 'code',
      sighting: null,
      row: null,
    });
    expect(await store.tables.spends.select('', [])).toEqual([]);
  });

  it('writes nothing while the log is off', async () => {
    await log.turnOff();
    await save(item());
    expect(await log.read()).toBeNull();
  });
});
