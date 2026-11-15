import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { heardAlertId, sightingOfEmail, type EmailCapture, type InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile, type CaptureLog } from './capture-log';
import { readDayReceipt } from './diary-queries';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

// What a message is decides what it does, before any matching. Every name, account and code here
// is made up.

const TODAY = '2026-10-11';
const T0 = new Date(2026, 9, 9, 10, 30, 0).getTime();
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();
const HOUR = 60;

const words = (body: string) => ({ app: 'MB Bank', title: 'Biến động số dư', body });

const alert = (
  over: Partial<InboxSpend> = {},
  body = 'TK 99xx456|GD: -250,000VND|SD: 1,000,000VND',
): InboxSpend => ({
  v: 1,
  id: heardAlertId(words(body), crypto.randomUUID()),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(0),
  amount: 250_000,
  merchant: 'CUA HANG MAU',
  categoryId: null,
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  accountTail: '456',
  ...over,
});

let mailNo = 0;
const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: `em-what-${(mailNo += 1)}`,
  amount: 250_000,
  merchant: 'Cua Hang Mau',
  at: at(2),
  from: 'thongbao@mbbank.com.vn',
  bank: 'MB Bank',
  code: null,
  ...over,
});

describe('what a message is, first', () => {
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

  /** A mail as the email import hands it on. */
  const send = (capture: EmailCapture) => {
    const comesIn =
      capture.kind === 'incoming' || capture.kind === 'refund' || capture.kind === 'reversal';
    return actions.ingest({
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
        wallet: comesIn ? null : capture.bank,
        at: new Date(capture.at),
        ...(comesIn
          ? { direction: 'in' as const, moneyIn: capture.kind === 'refund' ? 'refund' : null }
          : {}),
      },
    });
  };

  const live = async () =>
    store.tables.spends.select("WHERE status NOT IN ('deleted') ORDER BY at", []);
  const lastStep = async () => (await log.read())?.events.at(-1)?.step;

  describe('failed', () => {
    it('voids the bank’s notice of the payment, which leaves Today and stays in the Diary', async () => {
      const paid = alert();
      await save(paid);
      await send(mail({ kind: 'failed' }));
      expect((await store.tables.spends.get(paid.id))?.status).toBe('deleted');
      expect(store.getSnapshot().cycleSpends.map((s) => s.id)).not.toContain(paid.id);
      expect(await lastStep()).toBe('failed');
      const receipt = await readDayReceipt(store, '2026-10-09', new Set());
      expect(receipt.voided).toEqual([
        expect.objectContaining({ why: 'failed', spend: expect.objectContaining({ id: paid.id }) }),
      ]);
    });

    it('lets the shop’s “payment unsuccessful” void the bank’s notice of the same charge', async () => {
      const paid = alert();
      await save(paid);
      await send(
        mail({ kind: 'failed', from: 'no-reply@cuahangmau.example', bank: null, at: at(3) }),
      );
      expect((await store.tables.spends.get(paid.id))?.status).toBe('deleted');
    });

    it('voids it when the same bank’s own alert says it failed', async () => {
      const paid = alert();
      await save(paid);
      await save(
        alert(
          { what: 'failed', at: at(1), atKind: 'now' },
          'Giao dịch 250.000đ tại Cửa Hàng Mẫu không thành công',
        ),
      );
      expect((await store.tables.spends.get(paid.id))?.status).toBe('deleted');
      expect(await live()).toEqual([]);
    });

    it('makes nothing when there is no payment to void', async () => {
      await send(mail({ kind: 'failed' }));
      expect(await live()).toEqual([]);
      expect((await log.read())?.events.at(-1)).toMatchObject({ step: 'failed', row: null });
    });
  });

  describe('reversal', () => {
    it('voids the original found by its bank code, days later', async () => {
      const paid = alert({ reference: 'FT26282AB77C' });
      await save(paid);
      await send(mail({ kind: 'reversal', code: 'FT26282AB77C', at: at(48 * HOUR) }));
      expect((await store.tables.spends.get(paid.id))?.status).toBe('deleted');
      expect(await live()).toEqual([]);
      expect(await lastStep()).toBe('reversal');
    });

    it('voids the nearest earlier payment of that amount from that account, without a code', async () => {
      const older = alert({ at: at(-3 * HOUR) });
      const paid = alert({ at: at(0) }, 'TK 99xx456|GD: -250,000VND|SD: 750,000VND');
      await save(older);
      await save(paid);
      await send(mail({ kind: 'reversal', at: at(5 * HOUR) }));
      expect((await store.tables.spends.get(paid.id))?.status).toBe('deleted');
      expect((await store.tables.spends.get(older.id))?.status).toBe('caught');
    });

    it('reads a spend and the same amount back into that account within a minute as one, whatever the words', async () => {
      const paid = alert();
      await save(paid);
      await save(
        alert(
          { direction: 'in', at: at(0.5), merchant: 'CUA HANG MAU' },
          'TK 99xx456|GD: +250,000VND|SD: 1,250,000VND',
        ),
      );
      expect(await live()).toEqual([]);
      expect(await lastStep()).toBe('reversal');
    });

    it('leaves a payment and money in a minute and a second apart as two', async () => {
      await save(alert());
      await save(
        alert({ direction: 'in', at: at(61 / 60) }, 'TK 99xx456|GD: +250,000VND|SD: 1,250,000VND'),
      );
      expect(await live()).toHaveLength(2);
    });
  });

  describe('refund', () => {
    it('links to the payment it gives back and becomes money in placed as its refund', async () => {
      const paid = alert({ reference: 'FT26282RF01X' });
      await save(paid);
      const refund = mail({ kind: 'refund', code: 'FT26282RF01X', at: at(30 * HOUR) });
      await send(refund);
      expect(await store.tables.spends.get(refund.id)).toMatchObject({
        direction: 'in',
        moneyIn: 'refund',
        givesBack: paid.id,
      });
    });

    it('still links when its mail arrives before the payment’s own notice', async () => {
      const refund = mail({ kind: 'refund', at: at(30 * HOUR) });
      await send(refund);
      expect((await store.tables.spends.get(refund.id))?.givesBack ?? null).toBeNull();
      const paid = alert();
      await save(paid);
      expect((await store.tables.spends.get(refund.id))?.givesBack).toBe(paid.id);
    });
  });

  describe('own transfer', () => {
    const transfer = (bank: string, direction: 'in' | 'out', minutes: number, body: string) =>
      alert(
        {
          amount: 5_000_000,
          merchant: 'LE THI MAU chuyen tien',
          receipt: { bank, namingLines: [] },
          direction,
          at: at(minutes),
          accountTail: undefined,
        },
        body,
      );

    it('keeps the mail and both alerts on one row that counts as nothing, in any order', async () => {
      await send(
        mail({
          kind: 'ownTransfer',
          amount: 5_000_000,
          at: at(1),
          from: 'vcbdigibank@vcbmau.example',
          bank: 'Vietcombank',
        }),
      );
      await save(transfer('MB Bank', 'out', 0, 'TK 12xx001|GD: -5,000,000VND'));
      await save(transfer('Techcombank', 'in', 0.5, 'TK 34xx002|GD: +5,000,000VND'));
      const rows = await store.tables.spends.select("WHERE status != 'deleted'", []);
      expect(rows.map((r) => r.status)).toEqual(['skipped']);
      expect(await actions.sightings(rows[0]?.id ?? '')).toHaveLength(3);
    });

    it('sets aside an alert caught before the mail that says it was an own transfer', async () => {
      const out = transfer('MB Bank', 'out', 0, 'TK 12xx001|GD: -5,000,000VND');
      await save(out);
      await send(mail({ kind: 'ownTransfer', amount: 5_000_000, at: at(4) }));
      expect((await store.tables.spends.get(out.id))?.status).toBe('skipped');
      expect(await store.tables.spends.select("WHERE status != 'deleted'", [])).toHaveLength(1);
    });
  });

  describe('a mail dated when it was sent', () => {
    it('joins the bank’s alert hours later when the bank agrees', async () => {
      const paid = alert();
      await save(paid);
      await send(mail({ atKind: 'sent', at: at(4 * HOUR) }));
      expect(await live()).toHaveLength(1);
      expect(await actions.sightings(paid.id)).toHaveLength(2);
    });

    it('stays a row of its own from a server that does not say what its time is', async () => {
      await save(alert());
      await send(mail({ at: at(4 * HOUR) }));
      expect(await live()).toHaveLength(2);
    });
  });
});
