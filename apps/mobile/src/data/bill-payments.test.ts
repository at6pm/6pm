import { describe, expect, it, jest } from '@jest/globals';

import { REPAYMENT, type BillRow } from '@6pm/domain';

import { openMemoryStore } from '../features/backup/test/memory-db';
import { billPayments } from './bill-payments';
import { moneyActions } from './money-actions';
import { dayOf } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('./money-provider', () => ({ useMoneyStore: () => null }));
jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-10-10';

const bill = (over: Partial<BillRow> & Pick<BillRow, 'id' | 'amount'>): BillRow => ({
  name: over.id,
  icon: 'credit_card',
  hue: 30,
  dueDay: 10,
  paidCycle: null,
  sort: 0,
  archivedAt: null,
  kind: 'other',
  lastMonth: null,
  paidAmount: null,
  askedCycle: null,
  ...over,
});

/** A month on payday the 25th, with `bills` and one payment caught by email today. */
async function monthWith(bills: readonly BillRow[], paid: number) {
  const store = openMemoryStore(TODAY);
  await writePlan(store.db, {
    ...DEFAULT_PLAN,
    income: 30_000_000,
    payday: { kind: 'sameDay', day: 25 },
    futureYou: 0,
    startedOn: '2026-09-01',
  });
  await store.tables.categories.put({
    id: 'shopping',
    name: 'Shopping',
    icon: 'local_mall',
    hue: 300,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  for (const row of bills) await store.tables.bills.put(row);
  await store.load(TODAY);
  const before = dayOf(store.getSnapshot())?.free ?? 0;
  await store.tables.spends.put({
    id: 'statement',
    day: TODAY,
    at: `${TODAY}T03:00:00.000Z`,
    amount: paid,
    categoryId: 'shopping',
    merchant: 'THANH TOAN THE TIN DUNG',
    note: null,
    source: 'email',
    status: 'caught',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: `${TODAY}T03:00:00.000Z`,
    updatedAt: `${TODAY}T03:00:00.000Z`,
  });
  await store.load(TODAY);
  return { store, actions: billPayments(store), before };
}

const freeOf = (store: ReturnType<typeof openMemoryStore>) => dayOf(store.getSnapshot())?.free;

describe('a spend that paid a bill', () => {
  it('a 2tr card bill and an 8tr statement, "Yes, my card": paid, free money unmoved', async () => {
    const { store, actions, before } = await monthWith(
      [bill({ id: 'card', amount: 2_000_000, kind: 'card' })],
      8_000_000,
    );
    expect(freeOf(store)).toBe(before - 8_000_000);
    await actions.setPaysBill('statement', 'card');
    expect(freeOf(store)).toBe(before);
    const card = store.getSnapshot().bills[0];
    expect(card?.paidCycle).toBe(store.getSnapshot().cycle.start);
    expect(card?.askedCycle).toBe(store.getSnapshot().cycle.start);
  });

  it('a 5tr bill paid 6tr: free money drops by 1tr once, and comes back when taken back', async () => {
    const { store, actions, before } = await monthWith(
      [bill({ id: 'power', amount: 5_000_000 })],
      6_000_000,
    );
    await actions.setPaysBill('statement', 'power');
    expect(freeOf(store)).toBe(before - 1_000_000);
    expect(store.getSnapshot().bills[0]?.paidAmount).toBe(6_000_000);
    await actions.setPaysBill('statement', null);
    expect(freeOf(store)).toBe(before - 6_000_000);
    expect(store.getSnapshot().bills[0]).toMatchObject({ paidCycle: null, paidAmount: null });
  });

  it('a card or loan with no bill: only out of the daily number', async () => {
    const { store, actions, before } = await monthWith([], 12_000_000);
    await actions.setPaysBill('statement', REPAYMENT);
    expect(freeOf(store)).toBe(before);
    expect(store.getSnapshot().cycleSpends[0]?.paysBill).toBe(REPAYMENT);
  });

  it('remembers a "No" so the close does not ask about that bill again this cycle', async () => {
    const { store, actions } = await monthWith([bill({ id: 'rent', amount: 5_000_000 })], 1);
    await actions.billAsked('rent');
    expect(store.getSnapshot().bills[0]?.askedCycle).toBe(store.getSnapshot().cycle.start);
  });

  it('leaves out a bill past its last month', async () => {
    const { store, before } = await monthWith(
      [bill({ id: 'phone', amount: 1_000_000, lastMonth: '2026-09' })],
      0,
    );
    expect(store.getSnapshot().bills).toEqual([]);
    expect(before).toBe(30_000_000);
  });
});

/**
 * The founder's phone: "Điện nước" 600.000₫ in the plan, due on the 3rd, payday the 25th, and an
 * EVN payment of 727.428₫ caught from a wallet's alert on Tue 3 Nov at 07:01, waiting for the close.
 */
async function powerBillMonth(dueDay = 3) {
  const today = '2026-11-04';
  const store = openMemoryStore(today);
  await writePlan(store.db, {
    ...DEFAULT_PLAN,
    income: 30_000_000,
    payday: { kind: 'sameDay', day: 25 },
    futureYou: 0,
    startedOn: '2026-09-01',
  });
  await store.tables.categories.put({
    id: 'home',
    name: 'Nhà cửa',
    icon: 'home',
    hue: 210,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.tables.bills.put(bill({ id: 'power', name: 'Điện nước', amount: 600_000, dueDay }));
  await store.load(today);
  const planned = freeOf(store) ?? 0;
  await store.tables.spends.put({
    id: 'evn',
    day: '2026-11-03',
    at: '2026-11-03T00:01:00.000Z',
    amount: 727_428,
    categoryId: 'home',
    merchant: 'hóa đơn của dịch vụ Điện lực Hồ Chí Minh',
    note: null,
    source: 'alert',
    status: 'caught',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: 'MoMo',
    foreignAmount: null,
    createdAt: '2026-11-03T00:01:00.000Z',
    updatedAt: '2026-11-03T00:01:00.000Z',
  });
  await store.load(today);
  return { store, payments: billPayments(store), actions: moneyActions(store), planned };
}

const powerOf = (store: ReturnType<typeof openMemoryStore>) =>
  store.getSnapshot().bills.find((b) => b.id === 'power');
const evnOf = (store: ReturnType<typeof openMemoryStore>) =>
  store.getSnapshot().cycleSpends.find((s) => s.id === 'evn');

describe('a bill’s payment caught before the close', () => {
  it.each([3, 10, 20])(
    'is marked as paying "Điện nước" due on day %i, and counted once',
    async (dueDay) => {
      const { store, payments, planned } = await powerBillMonth(dueDay);
      // Before: the payment counts as spending and the bill still comes off the plan.
      expect(freeOf(store)).toBe(planned - 727_428);
      expect(dayOf(store.getSnapshot())?.spent).toBe(0);
      expect(await payments.markCaught()).toBe(1);
      // After: the bill is paid at what was paid, and the payment is not spending.
      expect(evnOf(store)?.paysBill).toBe('power');
      expect(powerOf(store)).toMatchObject({ paidCycle: '2026-10-25', paidAmount: 727_428 });
      expect(powerOf(store)?.askedCycle).toBeNull();
      expect(freeOf(store)).toBe(planned - 127_428);
      // Asked about once, so a second run marks nothing more.
      expect(await payments.markCaught()).toBe(0);
    },
  );

  it('"Yes" in the close confirms it; the bill is answered for the cycle', async () => {
    const { store, payments, planned } = await powerBillMonth();
    await payments.markCaught();
    await payments.setPaysBill('evn', 'power');
    expect(powerOf(store)).toMatchObject({ paidAmount: 727_428, askedCycle: '2026-10-25' });
    expect(freeOf(store)).toBe(planned - 127_428);
  });

  it('"No" in the close puts it back to spending and the bill back to due, for good', async () => {
    const { store, payments, planned } = await powerBillMonth();
    await payments.markCaught();
    await payments.setPaysBill('evn', null);
    expect(evnOf(store)?.paysBill).toBeNull();
    expect(powerOf(store)).toMatchObject({
      paidCycle: null,
      paidAmount: null,
      askedCycle: '2026-10-25',
    });
    expect(freeOf(store)).toBe(planned - 727_428);
    expect(await payments.markCaught()).toBe(0);
  });

  it('"Just this month" keeps the bill’s amount; "From now on" makes it the new one', async () => {
    const { store, payments, planned } = await powerBillMonth();
    await payments.markCaught();
    await payments.setPaysBill('evn', 'power');
    // Just this month: nothing more is written.
    expect(powerOf(store)).toMatchObject({ amount: 600_000, paidAmount: 727_428 });
    await payments.billFromNowOn('power', 727_428);
    expect(powerOf(store)).toMatchObject({ amount: 727_428, paidAmount: null });
    // Today's number is the same either way.
    expect(freeOf(store)).toBe(planned - 127_428);
  });

  it('follows the spend: skipped or deleted the bill is due again, undone it is paid again', async () => {
    const { store, payments, actions, planned } = await powerBillMonth();
    await payments.markCaught();
    await actions.setStatus('evn', 'skipped');
    expect(powerOf(store)).toMatchObject({ paidCycle: null, paidAmount: null });
    expect(freeOf(store)).toBe(planned);
    await actions.undo('evn');
    expect(powerOf(store)).toMatchObject({ paidCycle: '2026-10-25', paidAmount: 727_428 });
    expect(freeOf(store)).toBe(planned - 127_428);
    await actions.setStatus('evn', 'deleted');
    expect(powerOf(store)?.paidCycle).toBeNull();
  });

  it('an amount fixed on the spend becomes this cycle’s bill', async () => {
    const { store, payments, actions, planned } = await powerBillMonth();
    await payments.markCaught();
    await actions.update('evn', { amount: 650_000 });
    expect(powerOf(store)?.paidAmount).toBe(650_000);
    expect(freeOf(store)).toBe(planned - 50_000);
  });

  it('never marks a spend already answered', async () => {
    const { store, payments, actions } = await powerBillMonth();
    await actions.setStatus('evn', 'kept');
    expect(await payments.markCaught()).toBe(0);
    expect(evnOf(store)?.paysBill ?? null).toBeNull();
  });
});
