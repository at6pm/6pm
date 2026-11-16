import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { sightingOfEmail, type EmailCapture } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { createCaptureLog, memoryCaptureLogFile, type CaptureLog } from './capture-log';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Mails as the server hands them over, with the lags they really have: a booking site's mails
// about one booking hours apart, a card charged abroad and the site's total a minute apart, a
// wallet and the shop it paid a day apart. Every site, code and amount here is made up.

const TODAY = '2026-11-13';
const T0 = new Date(2026, 10, 13, 10, 57, 0).getTime();
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const SITE = 'no-reply@datchomau.com';

const booking = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-booking-paid-0001',
  amount: 3_950_000,
  merchant: '',
  at: at(1),
  from: SITE,
  bank: null,
  code: '5510200001,5510200002',
  atKind: 'sent',
  ...over,
});

describe('one way in: pairs told far apart', () => {
  let store: MoneyStore;
  let log: CaptureLog;
  let actions: ReturnType<typeof moneyActions>;

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
    log = createCaptureLog(memoryCaptureLogFile());
    await log.turnOn();
    actions = moneyActions(store, undefined, log);
  });

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
        ...(capture.kind === 'refund'
          ? { direction: 'in' as const, moneyIn: 'refund' as const }
          : {}),
      },
    });

  const rows = async () =>
    (await store.tables.spends.select("WHERE status != 'deleted' ORDER BY at", [])).map((r) => ({
      id: r.id,
      amount: r.amount,
      direction: r.direction ?? 'out',
    }));
  const steps = async () => (await log.read())?.events.map((e) => e.step) ?? [];

  it('keeps a booking’s later mail, read as a payment, with the payment it restates', async () => {
    await send(booking());
    // Hours on, one flight of the two confirmed: the server read its part's total as paid.
    const update = booking({ id: 'em-booking-update-0002', amount: 2_100_000, at: at(142) });
    await send(update);
    expect(await rows()).toEqual([
      { id: 'em-booking-paid-0001', amount: 3_950_000, direction: 'out' },
    ]);
    expect((await steps()).at(-1)).toBe('reference');
    expect(await actions.sightings('em-booking-paid-0001')).toHaveLength(2);
    // Naming only the code of the part it is about, it is still that booking.
    await send(booking({ id: 'em-booking-update-0003', amount: 2_100_000, code: '5510200002' }));
    expect(await rows()).toHaveLength(1);
  });

  it('counts a new paid booking that follows an update, and the refund of the part', async () => {
    await send(booking());
    await send(booking({ id: 'em-booking-update-0002', amount: 2_100_000, at: at(142) }));
    // A new booking from the same site, of the very amount the update printed: its own code.
    await send(
      booking({ id: 'em-booking-paid-0004', amount: 2_100_000, at: at(300), code: '5510200003' }),
    );
    // The part that could not be confirmed, paid back: money in, never kept with the payment.
    await send(
      booking({ id: 'em-booking-refund-0005', amount: 1_850_000, at: at(900), kind: 'refund' }),
    );
    expect(await rows()).toEqual([
      { id: 'em-booking-paid-0001', amount: 3_950_000, direction: 'out' },
      { id: 'em-booking-paid-0004', amount: 2_100_000, direction: 'out' },
      { id: 'em-booking-refund-0005', amount: 1_850_000, direction: 'in' },
    ]);
  });

  it('never takes a larger amount, or another site’s code, as a restatement', async () => {
    await send(booking());
    await send(booking({ id: 'em-booking-more-0006', amount: 4_200_000, at: at(30) }));
    await send(
      booking({ id: 'em-other-site-0007', amount: 2_100_000, from: 'no-reply@othermau.com' }),
    );
    expect(await rows()).toHaveLength(3);
  });

  const charge = (over: Partial<EmailCapture> = {}): EmailCapture => ({
    id: 'em-card-0001',
    amount: 8_142_000,
    merchant: 'DATCHOMAU.COM 9X AAA-BBB',
    at: at(0),
    from: 'thongbao@mbbank.com.vn',
    bank: 'MB Bank',
    code: null,
    atKind: 'printed',
    ...over,
  });

  it('takes a card charged abroad and the site’s total, 1.7% apart, as one payment', async () => {
    await send(charge());
    await send(booking({ amount: 8_004_000 }));
    expect(await rows()).toEqual([{ id: 'em-card-0001', amount: 8_142_000, direction: 'out' }]);
    expect((await steps()).at(-1)).toBe('samePayment');
  });

  it('keeps a card charged at home and a shop’s receipt 1.7% apart as two', async () => {
    await send(charge({ merchant: 'DATCHOMAU.VN' }));
    await send(booking({ amount: 8_004_000 }));
    expect(await rows()).toHaveLength(2);
  });

  const wallet = (over: Partial<EmailCapture> = {}): EmailCapture => ({
    id: 'em-wallet-0001',
    amount: 165_000,
    merchant: 'Playmau',
    at: at(0),
    from: 'no-reply@momo.vn',
    bank: 'MoMo',
    code: '150000000001',
    atKind: 'printed',
    ...over,
  });
  const shopReceipt = (over: Partial<EmailCapture> = {}): EmailCapture => ({
    id: 'em-shop-0001',
    amount: 165_000,
    merchant: 'Gói Premium (Playmau)',
    at: at(24 * 60),
    from: 'receipts@playmau.com',
    bank: 'MoMo',
    code: null,
    atKind: 'sent',
    ...over,
  });

  it('takes a wallet’s payment and the shop’s receipt a day later as one', async () => {
    await send(wallet());
    await send(shopReceipt());
    expect(await rows()).toHaveLength(1);
    expect(await actions.sightings('em-wallet-0001')).toHaveLength(2);
  });

  it('keeps two real payments to one shop a day apart as two, each with its receipt', async () => {
    await send(wallet());
    await send(shopReceipt({ at: at(2) }));
    await send(wallet({ id: 'em-wallet-0002', code: '150000000002', at: at(24 * 60) }));
    await send(shopReceipt({ id: 'em-shop-0002', at: at(24 * 60 + 2) }));
    expect(await rows()).toHaveLength(2);
    expect(await actions.sightings('em-wallet-0001')).toHaveLength(2);
    expect(await actions.sightings('em-wallet-0002')).toHaveLength(2);
  });
});
