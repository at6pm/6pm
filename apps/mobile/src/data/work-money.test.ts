import { describe, expect, it, jest } from '@jest/globals';

import { cashTakingsId, type SpendRow } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { moneyActions } from './money-actions';
import { todayView } from '../features/today/today-view';
import { createMoneyStore, dayOf, periodOf } from './money-store';
import { openMoneyTables } from './money-tables';
import { DEFAULT_PLAN, readPlan, writePlan, type PlanSettings } from './plan-settings';
import { closingNumberOf, takingsPerDay } from './takings-preview';
import { keepTakings, setWorkMode, stampOnArrival } from './work-actions';
import { wageLedgerOf, wagesOf, workKeptOf, workMonthOf } from './work-money';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-11-13';

function row(over: Partial<SpendRow> & Pick<SpendRow, 'id' | 'day' | 'amount'>): SpendRow {
  return {
    at: `${over.day}T05:00:00.000Z`,
    categoryId: 'food',
    merchant: 'Chợ Bà Chiểu',
    note: null,
    source: 'alert',
    status: 'kept',
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: `${over.day}T05:00:00.000Z`,
    updatedAt: `${over.day}T05:00:00.000Z`,
    ...over,
  };
}

const shop = {
  id: 'work',
  name: null,
  rhythm: { kind: 'none' as const },
  amount: 0,
  fromWork: true,
};

/** Ngân's plan: her shop's money as it comes, MB always work and Techcombank sometimes. */
const NGAN: PlanSettings = {
  ...DEFAULT_PLAN,
  payday: { kind: 'sameDay', day: 1 },
  startedOn: '2026-09-01',
  incomes: [shop],
  incomesFrom: '2026-09-01',
  work: { mode: 'asItComes', banks: { MB: 'always', TCB: 'sometimes', CASH: 'sometimes' } },
};

/**
 * Two closed days and today: Thursday kept 1.120.000 in takings less 695.000 in costs; Friday,
 * today, has 1.490.000 caught and 1.150.000 of costs, not closed yet; and a 45.000 lunch of hers.
 */
async function sellerOn(plan: PlanSettings) {
  const db = openMemoryDb();
  const tables = openMoneyTables(db);
  await writePlan(db, plan);
  await tables.categories.put({
    id: 'food',
    name: 'Ăn uống',
    icon: 'restaurant',
    hue: 45,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  const work = { forWork: true };
  const rows: SpendRow[] = [
    row({ id: 'thu-in', day: '2026-11-12', amount: 1_120_000, direction: 'in', ...work }),
    row({ id: 'thu-out', day: '2026-11-12', amount: 695_000, ...work }),
    row({
      id: 'fri-in',
      day: TODAY,
      amount: 1_490_000,
      direction: 'in',
      status: 'caught',
      ...work,
    }),
    row({ id: 'fri-out', day: TODAY, amount: 1_150_000, ...work }),
    row({ id: 'lunch', day: TODAY, amount: 45_000, merchant: 'Cơm trưa', source: 'cash' }),
  ];
  for (const r of rows) await tables.spends.put(r);
  await tables.closedDays.put({
    day: '2026-11-12',
    closedAt: '2026-11-12T11:40:00.000Z',
    late: false,
    spent: 0,
    line: 0,
    tomorrow: 0,
    note: null,
  });
  const store = createMoneyStore(db, TODAY);
  await store.load(TODAY);
  return { store, tables };
}

describe('a seller’s number', () => {
  it('counts what work kept on closed days, never a work cost or today’s takings', async () => {
    const { store } = await sellerOn(NGAN);
    const snap = store.getSnapshot();
    // Thursday kept 425.000; Friday is not closed, so its takings wait; the lunch is hers.
    expect(dayOf(snap)?.startFree).toBe(425_000);
    expect(dayOf(snap)?.spent).toBe(45_000);
    expect(workMonthOf(snap)).toEqual({
      in: 2_610_000,
      out: 1_845_000,
      kept: 765_000,
      landed: 425_000,
      waiting: 0,
    });
  });

  it('adds Friday’s kept money once the day closes, and says so a day at a time', async () => {
    const { store, tables } = await sellerOn(NGAN);
    const perDay = takingsPerDay(store.getSnapshot(), TODAY, 610_000);
    await keepTakings(store, moneyActions(store), TODAY, 610_000);
    await tables.closedDays.put({
      day: TODAY,
      closedAt: '2026-11-13T11:12:00.000Z',
      late: false,
      spent: 45_000,
      line: 0,
      tomorrow: 0,
      note: null,
    });
    await store.load(TODAY);
    const snap = store.getSnapshot();
    expect(snap.cycleSpends.find((s) => s.id === 'fri-in')?.status).toBe('kept');
    const cash = snap.cycleSpends.find((s) => s.id === cashTakingsId(TODAY));
    expect(cash).toMatchObject({ amount: 610_000, direction: 'in', forWork: true, status: 'kept' });
    // 425.000 + (1.490.000 + 610.000 − 1.150.000) = 1.375.000
    expect(dayOf(snap)?.startFree).toBe(1_375_000);
    expect(perDay).toBeGreaterThan(0);
  });

  it('replaces the day’s cash when it is typed again, and takes it away at nothing', async () => {
    const { store } = await sellerOn(NGAN);
    const actions = moneyActions(store);
    await keepTakings(store, actions, TODAY, 610_000);
    await keepTakings(store, actions, TODAY, 500_000);
    const id = cashTakingsId(TODAY);
    expect(store.getSnapshot().cycleSpends.find((s) => s.id === id)?.amount).toBe(500_000);
    await keepTakings(store, actions, TODAY, 0);
    expect(store.getSnapshot().cycleSpends.some((s) => s.id === id)).toBe(false);
  });

  it('paying herself: the wage counts on its day and the takings wait with the work', async () => {
    const wage = {
      ...shop,
      rhythm: { kind: 'weekly' as const, weekday: 0 as const },
      amount: 1_500_000,
    };
    const { store } = await sellerOn({
      ...NGAN,
      // Counted from this month, so no month before carries anything over.
      incomesFrom: '2026-11-01',
      incomes: [wage],
      work: { mode: 'payMyself', banks: { MB: 'always' } },
    });
    const snap = store.getSnapshot();
    // Mondays 2 and 9 Nov came before the shop had kept anything: nothing could be paid, and the
    // 3.000.000 is owed by the shop; what Thursday kept waits with it.
    expect(workMonthOf(snap)).toMatchObject({ landed: 0, waiting: 425_000 });
    expect(wageLedgerOf(snap)?.owed).toBe(3_000_000);
    expect(takingsPerDay(snap, TODAY, 610_000)).toBe(0);
    expect(dayOf(snap)?.startFree).toBe(0);
  });
});

describe('the stamp as money arrives', () => {
  it('inks what comes through an "always" bank, offers the rest', async () => {
    const { store, tables } = await sellerOn(NGAN);
    const actions = moneyActions(store);
    const mb = row({
      id: 'mb',
      day: TODAY,
      amount: 90_000,
      direction: 'in',
      status: 'caught',
      wallet: 'MB Bank',
      merchant: 'Khách',
    });
    const tcb = row({
      id: 'tcb',
      day: TODAY,
      amount: 850_000,
      direction: 'in',
      status: 'caught',
      wallet: 'Techcombank',
      merchant: 'Chị Thảo',
    });
    for (const r of [mb, tcb]) {
      await tables.spends.put(r);
    }
    await store.load(TODAY);
    await stampOnArrival(store, actions, mb);
    await stampOnArrival(store, actions, tcb);
    expect((await tables.spends.get('mb'))?.forWork).toBe(true);
    expect((await tables.spends.get('tcb'))?.forWork).toBe(false);
  });

  it('inks a sender remembered as work on a "sometimes" bank', async () => {
    const { store, tables } = await sellerOn(NGAN);
    await tables.rules.put({
      merchantKey: 'chị thảo',
      merchant: 'Chị Thảo',
      categoryId: 'food',
      learnedTimes: 0,
      setByUser: false,
      work: true,
    });
    const tcb = row({
      id: 'tcb',
      day: TODAY,
      amount: 850_000,
      direction: 'in',
      status: 'caught',
      wallet: 'Techcombank',
      merchant: 'Chị Thảo',
    });
    await tables.spends.put(tcb);
    await store.load(TODAY);
    await stampOnArrival(store, moneyActions(store), tcb);
    expect((await tables.spends.get('tcb'))?.forWork).toBe(true);
  });

  it('never stamps anything for someone who has not turned work on', async () => {
    const { work: _work, ...plain } = NGAN;
    const { store, tables } = await sellerOn(plain);
    const mb = row({
      id: 'mb',
      day: TODAY,
      amount: 90_000,
      direction: 'in',
      status: 'caught',
      wallet: 'MB Bank',
    });
    await tables.spends.put(mb);
    await store.load(TODAY);
    await stampOnArrival(store, moneyActions(store), mb);
    expect((await tables.spends.get('mb'))?.forWork).toBe(false);
  });
});

describe('the seller’s Sunday close (takings 2.250.000, costs 550.000, kept 1.700.000)', () => {
  const SUN = '2026-11-15';

  /** Two transfers caught on MB, 550.000 of work costs and a 20.000 xôi of hers; nothing closed. */
  async function sunday(plan: PlanSettings) {
    const db = openMemoryDb();
    const tables = openMoneyTables(db);
    await writePlan(db, plan);
    await tables.categories.put({
      id: 'food',
      name: 'Ăn uống',
      icon: 'restaurant',
      hue: 45,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    const work = { forWork: true, wallet: 'MB' };
    const rows: SpendRow[] = [
      row({ id: 'in-1', day: SUN, amount: 1_000_000, direction: 'in', status: 'caught', ...work }),
      row({ id: 'in-2', day: SUN, amount: 800_000, direction: 'in', status: 'caught', ...work }),
      row({ id: 'flour', day: SUN, amount: 300_000, ...work }),
      row({ id: 'gas', day: SUN, amount: 250_000, ...work }),
      row({ id: 'xoi', day: SUN, amount: 20_000, merchant: 'Xôi', source: 'cash' }),
    ];
    for (const r of rows) await tables.spends.put(r);
    const store = createMoneyStore(db, SUN);
    await store.load(SUN);
    return { store, tables };
  }
  const SELLER: PlanSettings = { ...NGAN, startedOn: '2026-11-01', incomesFrom: '2026-11-01' };

  it('the takings step, the receipt, the reveal and Today after the close say the same tomorrow', async () => {
    const { store, tables } = await sunday(SELLER);
    // Today's takings: 1.800.000 caught and 450.000 cash, less 550.000: 1.700.000 kept.
    const perDay = takingsPerDay(store.getSnapshot(), SUN, 450_000);
    expect(perDay).toBe(40_000);
    await keepTakings(store, moneyActions(store), SUN, 450_000);
    // The receipt and the reveal read the day as the close files it.
    const closing = closingNumberOf(store.getSnapshot(), SUN);
    expect(closing).toMatchObject({ tomorrow: 40_000, overspent: false, spent: 20_000 });
    expect(closing?.free).toBe(1_680_000);
    // Before this fix they read the day still open: nothing kept yet, and past the plan.
    expect(dayOf(store.getSnapshot())).toMatchObject({ tomorrow: 0, overspent: true });
    await tables.closedDays.put({
      day: SUN,
      closedAt: '2026-11-15T11:00:00.000Z',
      late: false,
      spent: closing?.spent ?? 0,
      line: closing?.line ?? 0,
      tomorrow: closing?.tomorrow ?? 0,
      note: null,
    });
    await store.load(SUN);
    expect(dayOf(store.getSnapshot())).toMatchObject({ tomorrow: 40_000, line: closing?.line });
  });

  it('leaves the stamped takings out of Today’s Inbox count: they are never close cards', async () => {
    const { store } = await sunday(SELLER);
    const labels = { source: () => '', tag: () => null, time: () => '', money: { full: String } };
    expect(todayView(store.getSnapshot(), 13, 0, labels).queue).toEqual([]);
    const { store: home } = await sunday({ ...SELLER, work: undefined });
    // Without work on, the same two transfers wait for a yes.
    const queue = todayView(home.getSnapshot(), 13, 0, labels).queue.map((s) => s.id);
    expect(queue.sort()).toEqual(['in-1', 'in-2']);
  });

  it('Pay myself chosen after the close starts at the next one: no wage “paid yesterday”', async () => {
    const { store, tables } = await sunday(SELLER);
    await keepTakings(store, moneyActions(store), SUN, 450_000);
    await tables.closedDays.put({
      day: SUN,
      closedAt: '2026-11-15T11:00:00.000Z',
      late: false,
      spent: 20_000,
      line: 40_000,
      tomorrow: 40_000,
      note: null,
    });
    await store.load(SUN);
    await setWorkMode(store, 'payMyself', { amount: 2_500_000, weekday: 5 });
    const plan = await readPlan(store.db);
    expect(plan?.incomes?.find((i) => i.fromWork)).toMatchObject({
      amount: 2_500_000,
      from: '2026-11-16',
    });
    const snap = store.getSnapshot();
    // Saturday 14 is no wage; Sunday's 1.700.000 landed as it came and the number is as it was.
    expect(wagesOf(snap)).toEqual([]);
    expect(workKeptOf(snap)).toBe(1_700_000);
    expect(periodOf(snap)).toMatchObject({ kind: 'landed', credited: 1_700_000 });
    expect(dayOf(snap)).toMatchObject({ tomorrow: 40_000 });
    // Saturday 21, with nothing kept since: the wage is paid as far as the shop reaches, 0, and
    // the 2.500.000 is owed by the shop; nothing goes below nothing.
    await store.load('2026-11-21');
    const sat = store.getSnapshot();
    expect(wageLedgerOf(sat)).toMatchObject({
      paid: [{ day: '2026-11-21', amount: 0 }],
      owed: 2_500_000,
      held: 0,
    });
    expect(periodOf(sat)).toMatchObject({ kind: 'counted', waiting: false });
  });
});
