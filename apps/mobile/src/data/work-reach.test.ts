import { describe, expect, it, jest } from '@jest/globals';

import { FUTURE_YOU_POT_ID, landedMaths, yearWork, type SpendRow } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { planOfAnswers, startingWays, type MoneyWay } from '../features/onboarding/money-ways';
import { incomePlanOf, landingsOf } from '../features/plan/income-plan-view';
import { moneyActions } from './money-actions';
import {
  createMoneyStore,
  dayOf,
  findSpend,
  periodOf,
  readSpend,
  type MoneyStore,
} from './money-store';
import { completeOnboarding } from './onboarding';
import { readWorkYearRows, requestActions } from './request-actions';
import { closingNumberOf, withDayClosed } from './takings-preview';
import { keepTakings, setWorkMode, stampOnArrival } from './work-actions';
import { hasWorkMoney, wageLedgerOf, workMonthOf, workOf } from './work-money';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => 'VND' }));

const STARTED = '2026-11-01';
const SUN = '2026-11-15';
const MON = '2026-11-16';
const TUE = '2026-11-17';

/** Rent 3.000.000 due the 26th and Future you 500.000 a month, set up on 1 Nov. */
async function joined(ways: readonly MoneyWay[], today = STARTED) {
  const answers = { ...startingWays(18_000_000, 4_000_000), ways };
  const plan = planOfAnswers(answers, STARTED);
  const store = createMoneyStore(openMemoryDb(), STARTED);
  await completeOnboarding(
    store,
    {
      income: plan.income,
      payday: plan.payday,
      futureYou: 500_000,
      bills: [{ name: 'Rent', icon: 'home', hue: 30, amount: 3_000_000, dueDay: 26 }],
      wallets: ['MB'],
      closeAt: '18:00',
      ...(plan.incomes
        ? { incomes: { ...plan.incomes, workBanks: { MB: 'always' as const, CASH: 'sometimes' } } }
        : {}),
    },
    { today: STARTED, language: 'en' },
  );
  await store.load(today);
  return { store, actions: moneyActions(store), requests: requestActions(store) };
}

function caught(store: MoneyStore, actions: ReturnType<typeof moneyActions>) {
  return (amount: number, merchant: string, over: Record<string, unknown> = {}) =>
    actions.addSpend({
      amount,
      categoryId: store.getSnapshot().categories[0]?.id ?? '',
      merchant,
      source: 'alert',
      status: 'caught',
      direction: 'in',
      ...over,
    });
}

async function close(store: MoneyStore, actions: ReturnType<typeof moneyActions>, day: string) {
  const number = dayOf(withDayClosed(store.getSnapshot(), day));
  await actions.closeDay({
    day,
    closedAt: `${day}T11:00:00.000Z`,
    late: false,
    spent: number?.spent ?? 0,
    line: number?.line ?? 0,
    tomorrow: number?.tomorrow ?? 0,
    note: null,
  });
}

describe('work money for a freelancer (Vy: rent 3.000.000, Future you 500.000)', () => {
  it('is on from "It comes when it comes" alone; the shop’s bookkeeping is not', async () => {
    const { store } = await joined(['landed'], SUN);
    const snap = store.getSnapshot();
    expect(hasWorkMoney(snap)).toBe(true);
    expect(workOf(snap)).toBeNull();
    expect(workMonthOf(snap)).toMatchObject({ in: 0, out: 0, waiting: 0 });
  });

  it('a monthly salary with no work sees none of it', async () => {
    const { store } = await joined(['salary'], SUN);
    const snap = store.getSnapshot();
    expect(snap.plan?.incomes).toBeUndefined();
    expect(hasWorkMoney(snap)).toBe(false);
    expect(workMonthOf(snap)).toBeNull();
  });

  it('a request paid by its code lands in her days: 18.000.000 landed, 2.000.000 held back', async () => {
    const { store, actions, requests } = await joined(['landed'], SUN);
    const strip = await requests.ask({
      name: 'Studio Mây',
      job: 'Brand kit, part 2',
      amount: 20_000_000,
      work: true,
      company: true,
    });
    const money = await caught(store, actions)(18_000_000, 'STUDIO MAY', {
      memo: `${strip?.code ?? ''} BRAND KIT`,
    });
    await requests.match(money.id, strip?.id ?? '', 2_000_000);
    const row = await store.tables.spends.get(money.id);
    // Into her days as her money that comes when it comes, never a seller's takings.
    expect(row).toMatchObject({
      status: 'kept',
      forWork: true,
      moneyIn: 'pay',
      incomeId: 'landed',
      heldBack: 2_000_000,
    });
    const snap = store.getSnapshot();
    // Landed is what the plan counts; held back never reaches her days.
    expect(periodOf(snap)).toMatchObject({ kind: 'landed', credited: 18_000_000 });
    expect(periodOf(snap)?.reserved).toBe(3_500_000);
    expect(dayOf(snap)?.startFree).toBe(14_500_000);
    expect(landingsOf(snap).map((l) => l.amount)).toEqual([18_000_000]);
    // Billed is what the year counts; the Work card counts it once kept.
    const year = yearWork(await readWorkYearRows(store, 2026), 2026);
    expect(year).toMatchObject({ billed: 20_000_000, heldBack: 2_000_000, kept: 18_000_000 });
    expect(workMonthOf(snap)).toMatchObject({ in: 18_000_000, out: 0, kept: 18_000_000 });
  });
});

describe('a freelancer’s regular client', () => {
  it('arrives stamped as work, and lands in her days when placed', async () => {
    const { store, actions } = await joined(['landed'], SUN);
    await store.tables.rules.put({
      merchantKey: 'studio may',
      merchant: 'STUDIO MAY',
      categoryId: 'food',
      learnedTimes: 0,
      setByUser: false,
      work: true,
    });
    const money = await caught(store, actions)(9_000_000, 'STUDIO MAY');
    await stampOnArrival(store, actions, money);
    expect((await store.tables.spends.get(money.id))?.forWork).toBe(true);
    await actions.keepPay(money.id, { amount: 0, incomeId: 'landed' });
    expect(periodOf(store.getSnapshot())?.credited).toBe(9_000_000);
    expect(workMonthOf(store.getSnapshot())?.in).toBe(9_000_000);
  });
});

describe('the remembered tenth', () => {
  it('a mail or an alert from a sender holding back a tenth arrives with it held back', async () => {
    const { store, actions, requests } = await joined(['landed'], SUN);
    const add = caught(store, actions);
    const first = await add(18_000_000, 'STUDIO MAY');
    await actions.keepPay(first.id, { amount: 0, incomeId: 'landed' });
    await requests.setHeldBack(first.id, 2_000_000);
    const alert = await add(9_000_000, 'STUDIO MAY');
    expect(alert.heldBack).toBe(1_000_000);
    const mail = await add(4_500_000, 'STUDIO MAY', { source: 'email' });
    expect(mail.heldBack).toBe(500_000);
    // Taken as a payback, it never had tax held from it.
    await actions.placeMoneyIn(mail.id, { moneyIn: 'payback', givesBack: null });
    expect((await store.tables.spends.get(mail.id))?.heldBack).toBeNull();
  });

  it('a seller’s takings kept at the close from such a sender keep it held back', async () => {
    const { store, actions } = await joined(['sell'], SUN);
    await store.tables.rules.put({
      merchantKey: 'agency tre',
      merchant: 'AGENCY TRE',
      categoryId: 'food',
      learnedTimes: 0,
      setByUser: false,
      work: true,
      heldBackShare: 10,
    });
    // Caught before the sender was remembered: nothing held back yet.
    const row: SpendRow = {
      id: 'tre',
      day: SUN,
      at: `${SUN}T03:00:00.000Z`,
      amount: 2_700_000,
      categoryId: 'food',
      merchant: 'AGENCY TRE',
      note: null,
      source: 'alert',
      status: 'caught',
      previousStatus: null,
      wallet: 'MB',
      forWork: true,
      detail: null,
      foreignAmount: null,
      direction: 'in',
      createdAt: `${SUN}T03:00:00.000Z`,
      updatedAt: `${SUN}T03:00:00.000Z`,
    };
    await store.tables.spends.put(row);
    await store.load(SUN);
    await keepTakings(store, actions, SUN, 0);
    expect(await store.tables.spends.get('tre')).toMatchObject({
      status: 'kept',
      heldBack: 300_000,
    });
  });
});

describe('the seller’s week: paying herself from Tuesday', () => {
  /** Sunday: 8.500.000 of takings, 400.000 of costs, kept 8.100.000, closed as it came. */
  async function sunday() {
    const ctx = await joined(['sell'], SUN);
    const { store, actions } = ctx;
    const add = caught(store, actions);
    for (const [i, amount] of [5_000_000, 3_500_000].entries()) {
      const r = await add(amount, `Khách ${i}`, { wallet: 'MB' });
      await actions.markForWork(r.id, true);
    }
    const flour = await actions.addSpend({
      amount: 400_000,
      categoryId: store.getSnapshot().categories[0]?.id ?? '',
      merchant: 'Chợ Bà Chiểu',
      source: 'cash',
      status: 'kept',
    });
    await actions.markForWork(flour.id, true);
    await keepTakings(store, actions, SUN, 0);
    await close(store, actions, SUN);
    return ctx;
  }

  it('Sunday as it comes: 8.100.000 lands, bills and Future you whole, 26.000 a day', async () => {
    const { store } = await sunday();
    const snap = store.getSnapshot();
    expect(periodOf(snap)).toMatchObject({ kind: 'landed', credited: 8_100_000 });
    // Sunday closed on nothing; what it kept is the days' from Monday.
    expect(dayOf(snap)).toMatchObject({ line: 0, tomorrow: 26_000 });
    expect(snap.potSaved[FUTURE_YOU_POT_ID]).toBe(500_000);
  });

  it('Tuesday: only the wage paid reaches her days; jars hold what they held', async () => {
    const { store, actions } = await sunday();
    await setWorkMode(store, 'payMyself', { amount: 4_500_000, weekday: 1 });
    await store.load(MON);
    const monday = await caught(store, actions)(1_500_000, 'Khách 2', { wallet: 'MB' });
    await actions.markForWork(monday.id, true);
    await keepTakings(store, actions, MON, 0);
    await close(store, actions, MON);
    await store.load(TUE);
    const takings = await caught(store, actions)(1_000_000, 'Khách 3', { wallet: 'MB' });
    await actions.markForWork(takings.id, true);
    const snap = store.getSnapshot();
    // The wage is paid as far as Monday's 1.500.000 reaches; the shop owes her 3.000.000.
    expect(wageLedgerOf(snap)).toMatchObject({
      paid: [{ day: TUE, amount: 1_500_000 }],
      owed: 3_000_000,
      held: 0,
    });
    // The month stays one that lands: Sunday's 8.100.000 and the wage, less rent and Future you
    // whole, less December's 3.500.000 on the way, over six weeks.
    expect(periodOf(snap)).toMatchObject({
      kind: 'landed',
      credited: 9_600_000,
      reserved: 3_500_000,
      bills: 3_000_000,
      jars: 500_000,
    });
    expect(snap.potSaved[FUTURE_YOU_POT_ID]).toBe(500_000);
    expect(dayOf(snap)?.line).toBe(61_000);
    // Plan says the same: one line from work, and its parts make the day.
    expect(landingsOf(snap)).toEqual([expect.objectContaining({ amount: 9_600_000, work: true })]);
    const plan = incomePlanOf(snap);
    if (plan?.kind !== 'landed') throw new Error('not a landed plan');
    expect(plan.view).toMatchObject({ line: 61_000, bills: 3_000_000, jars: 500_000 });
    const rows = landedMaths(plan.view, [9_600_000]);
    expect(rows.find((r) => r.kind === 'ahead')?.amount).toBe(-3_000_000);
    expect(rows.find((r) => r.kind === 'aheadJars')?.amount).toBe(-500_000);
    // The Work card counts what is kept: Tuesday's 1.000.000 waits for the close.
    expect(workMonthOf(snap)).toMatchObject({ in: 10_000_000, out: 400_000, kept: 9_600_000 });
  });
});

describe('a closed day keeps the line it closed with', () => {
  it('Vy’s Sunday stays over when a payment lands in the close; tomorrow has it', async () => {
    const { store, actions, requests } = await joined(['landed'], SUN);
    const add = caught(store, actions);
    const first = await add(18_000_000, 'STUDIO MAY');
    await actions.keepPay(first.id, { amount: 0, incomeId: 'landed' });
    await actions.addSpend({
      amount: 300_000,
      categoryId: store.getSnapshot().categories[0]?.id ?? '',
      merchant: 'Phở',
      source: 'manual',
      status: 'kept',
    });
    const open = dayOf(store.getSnapshot());
    expect(open).toMatchObject({ line: 261_000, safe: -39_000 });
    // The close opens on 261.000; Cô Diệp's 1.800.000 is matched by its code inside it.
    const strip = await requests.ask({
      name: 'Cô Diệp',
      job: 'Menu',
      amount: 1_800_000,
      work: true,
      company: false,
    });
    const paid = await add(1_800_000, 'PHAM THI DIEP', { memo: strip?.code ?? '' });
    await requests.match(paid.id, strip?.id ?? '', 0);
    const closing = closingNumberOf(store.getSnapshot(), SUN, open?.line);
    expect(closing).toMatchObject({ line: 261_000, safe: -39_000, overspent: false });
    expect(closing?.tomorrow).toBeGreaterThan(open?.tomorrow ?? 0);
    await actions.closeDay({
      day: SUN,
      closedAt: `${SUN}T11:00:00.000Z`,
      late: false,
      spent: closing?.spent ?? 0,
      line: closing?.line ?? 0,
      tomorrow: closing?.tomorrow ?? 0,
      note: null,
    });
    await store.load(SUN);
    // Today afterwards and the Diary's row agree with the close: 39.000 over, not under.
    const after = dayOf(store.getSnapshot());
    expect(after).toMatchObject({ line: 261_000, safe: -39_000, tomorrow: closing?.tomorrow });
    expect(store.getSnapshot().closedDays.find((d) => d.day === SUN)?.line).toBe(261_000);
  });
});

describe('the way back to a kept work money in', () => {
  it('opens one kept in an earlier month, where its held back can be set after the close', async () => {
    const { store, actions } = await joined(['sell'], SUN);
    const october = await caught(store, actions)(6_000_000, 'NHA SACH GIO', { day: '2026-10-20' });
    await actions.markForWork(october.id, true);
    await actions.setStatus(october.id, 'kept');
    await store.load(SUN);
    // Not this month's, so not in the snapshot Today and the Diary read.
    expect(findSpend(store.getSnapshot(), october.id)).toBeUndefined();
    expect(await readSpend(store, october.id)).toMatchObject({
      id: october.id,
      direction: 'in',
      forWork: true,
      status: 'kept',
    });
    await actions.setStatus(october.id, 'deleted');
    expect(await readSpend(store, october.id)).toBeNull();
  });
});
