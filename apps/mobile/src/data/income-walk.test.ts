import { describe, expect, it, jest } from '@jest/globals';

import { landedMaths, lastUntilPreview, setAsideNamed, typedMoneyIn } from '@6pm/domain';
import { t } from '@6pm/i18n';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { answersOfPlan, planOfAnswers, startingWays } from '../features/onboarding/money-ways';
import { coverRulerOf, incomePlanOf } from '../features/plan/income-plan-view';
import { landingLine } from '../features/today/landing-line';
import { paydayNoticeOf, waitingMoneyOf } from '../features/reminders/notification-inputs';
import { answerReach, setLastUntil } from './income-plan-actions';
import { moneyActions } from './money-actions';
import {
  createMoneyStore,
  dayOf,
  periodInputOf,
  periodOf,
  type MoneySnapshot,
} from './money-store';
import { completeOnboarding, type OnboardingAnswers } from './onboarding';
import { readPlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => 'VND' }));

const JOINED = '2026-11-15';
const start = startingWays(17_400_000, 4_000_000);

async function joined(
  ways: Partial<Parameters<typeof planOfAnswers>[0]>,
  rest: Pick<OnboardingAnswers, 'futureYou' | 'bills'>,
) {
  const plan = planOfAnswers({ ...start, ...ways }, JOINED);
  const store = createMoneyStore(openMemoryDb(), JOINED);
  await completeOnboarding(
    store,
    {
      ...rest,
      income: plan.income,
      payday: plan.payday,
      wallets: ['MB'],
      closeAt: '18:00',
      ...(plan.incomes ? { incomes: plan.incomes } : {}),
    },
    { today: JOINED, language: 'en' },
  );
  const actions = moneyActions(store);
  const moneyIn = (amount: number, merchant: string, source: 'manual' | 'alert' = 'manual') =>
    actions.addSpend({
      amount,
      categoryId: store.getSnapshot().categories[0]?.id ?? '',
      merchant,
      source,
      status: 'caught',
      direction: 'in',
    });
  return { store, actions, moneyIn };
}

/** Today's maths, Plan and Today's ruler for a plan that holds its incomes. */
function viewOf(snap: MoneySnapshot) {
  const plan = incomePlanOf(snap);
  if (plan === null) throw new Error('no income plan');
  return plan;
}

describe('4.000.000 every Friday, rent 3.000.000 due the 18th, Future you 12%', () => {
  const setUp = () =>
    joined(
      { ways: ['weekly'], payAmount: 4_000_000, weekday: 4 },
      {
        futureYou: 1_900_000,
        bills: [{ name: 'Rent', icon: 'home', hue: 30, amount: 3_000_000, dueDay: 18 }],
      },
    );

  it('joined on Sunday 15: the jar holds the two slices the pay in hand set aside', async () => {
    const { store } = await setUp();
    const snap = store.getSnapshot();
    const plan = viewOf(snap);
    if (plan.kind !== 'pay') throw new Error('not a pay');
    expect(plan.stretch).toMatchObject({ jarSlice: 950_000, jarSlices: 2, free: 50_000 });
    expect(plan.rows.find((r) => r.kind === 'jars')).toMatchObject({ amount: -950_000, count: 2 });
    expect(snap.potSaved.futureYou).toBe(950_000);
    expect(dayOf(snap)).toMatchObject({ line: 8_000, tomorrow: 10_000 });
  });

  it('on Friday 20 before the pay is placed, waits for it: due today, the day where it was', async () => {
    const { store } = await setUp();
    await store.load('2026-11-20');
    const snap = store.getSnapshot();
    // Thursday's day was 50.000 over Thursday and Friday: 25.000. It holds while the pay is late.
    expect(periodOf(snap)).toMatchObject({
      waiting: true,
      due: '2026-11-20',
      on: '2026-11-20',
      daysLeft: 0,
      hold: 25_000,
      credited: 4_000_000,
    });
    expect(dayOf(snap)).toMatchObject({ startFree: 50_000, line: 25_000, tomorrow: 25_000 });
    const plan = viewOf(snap);
    if (plan.kind !== 'pay') throw new Error('not a pay');
    // Plan's "next pay" and the reminder name Friday 20, not the 27th.
    expect(plan.stretch).toMatchObject({ next: '2026-11-20', waiting: true });
    expect(plan.rows.slice(-2).map((r) => [r.kind, r.amount])).toEqual([
      ['wait', 50_000],
      ['held', 25_000],
    ]);
    expect(paydayNoticeOf(snap)?.on).toBe('2026-11-20');
  });

  it('on Friday 20 once the pay is placed, counts it: a quarter of rent and of the jar', async () => {
    const { store, actions, moneyIn } = await setUp();
    await store.load('2026-11-20');
    const pay = await moneyIn(4_000_000, 'Xưởng Gió');
    await actions.keepPay(pay.id, { amount: 4_000_000, incomeId: 'pay' });
    const snap = store.getSnapshot();
    expect(periodOf(snap)).toMatchObject({ waiting: false, on: '2026-11-27', daysLeft: 7 });
    expect(dayOf(snap)).toMatchObject({ startFree: 2_825_000, line: 353_000 });
    const plan = viewOf(snap);
    if (plan.kind !== 'pay') throw new Error('not a pay');
    expect(plan.stretch).toMatchObject({
      next: '2026-11-27',
      billSlice: 750_000,
      jarSlice: 475_000,
      free: 2_775_000,
    });
    expect(snap.potSaved.futureYou).toBe(1_425_000);
    expect(paydayNoticeOf(snap)?.on).toBe('2026-11-27');
  });
});

describe('money that only lands, rent 3.000.000 due the 19th', () => {
  const setUp = () =>
    joined(
      { ways: ['landed'] },
      {
        futureYou: 0,
        bills: [{ name: 'Rent', icon: 'home', hue: 30, amount: 3_000_000, dueDay: 19 }],
      },
    );

  /** 18.000.000 and then 2.000.000 typed into Quick add, placed as Quick add places it. */
  async function landed() {
    const { store, actions, moneyIn } = await setUp();
    for (const amount of [18_000_000, 2_000_000]) {
      const plan = store.getSnapshot().plan;
      const place = typedMoneyIn(
        { day: JOINED, amount },
        { remembered: null, incomes: plan?.incomes, anchor: plan?.payday ?? start.payday },
      );
      expect(place).toEqual({ moneyIn: 'pay', incomeId: 'landed', asLastTime: false });
      const row = await moneyIn(amount, 'Studio May');
      await actions.keepPay(row.id, { amount: 0, incomeId: 'landed' });
    }
    return store;
  }

  const preview = (snap: MoneySnapshot, until: string) => {
    const period = periodOf(snap);
    const input = periodInputOf(snap);
    return lastUntilPreview({
      today: snap.today,
      until,
      pool: dayOf(snap)?.startFree ?? 0,
      cap: period?.cap ?? null,
      minDays: period?.minDays ?? 0,
      cycle: snap.cycle,
      anchor: snap.plan?.payday ?? start.payday,
      bills: snap.bills,
      jars: input?.jars ?? 0,
    });
  };

  it('counts typed money as landed, so Today has a number', async () => {
    const store = await landed();
    expect(periodOf(store.getSnapshot())).toMatchObject({ kind: 'landed', credited: 20_000_000 });
    const plan = viewOf(store.getSnapshot());
    expect(plan.kind === 'landed' && plan.view.state).toBe('landed');
  });

  it('asks about money from a bank alert as what landed, as typing it would place it', async () => {
    const { store, moneyIn } = await setUp();
    await moneyIn(18_000_000, 'Studio May', 'alert');
    expect(waitingMoneyOf(store.getSnapshot(), null)).toEqual([{ kind: 'pay', name: null }]);
  });

  it('to the end of November: one count of days for Plan, the ruler and the sheet', async () => {
    const snap = (await landed()).getSnapshot();
    const plan = viewOf(snap);
    if (plan.kind !== 'landed') throw new Error('not landed');
    // Six weeks from 15 Nov reach 26 Dec, past December's rent: 14.000.000 over 42 days.
    expect(plan.view).toMatchObject({
      on: '2026-11-30',
      line: 333_000,
      stretchDays: 16,
      ahead: 3_000_000,
      covered: 42,
      coveredTo: '2026-12-26',
      inHandDays: 26,
    });
    expect(dayOf(snap)?.line).toBe(plan.view.line);
    expect(coverRulerOf(plan.view)).toEqual({
      covered: 42,
      to: '2026-12-26',
      stretch: 16,
      inHand: 26,
    });
    expect(preview(snap, '2026-11-30')).toMatchObject({
      days: 16,
      line: 333_000,
      inHandDays: 26,
      coveredTo: '2026-12-26',
    });
  });

  it('to 31 December: the day keeps December’s rent, and every count says 47 days', async () => {
    const store = await landed();
    const before = preview(store.getSnapshot(), '2026-12-31');
    await setLastUntil(store, '2026-12-31');
    const snap = store.getSnapshot();
    const plan = viewOf(snap);
    if (plan.kind !== 'landed') throw new Error('not landed');
    expect(plan.view).toMatchObject({
      on: '2026-12-31',
      line: 297_000,
      stretchDays: 47,
      covered: 47,
      coveredTo: '2026-12-31',
      inHandDays: 0,
      // Less than a day over: it stays with the free money, not in hand.
      beyond: 0,
      leftOver: 41_000,
    });
    expect(dayOf(snap)?.line).toBe(297_000);
    expect(coverRulerOf(plan.view)).toMatchObject({ covered: 47, to: '2026-12-31', inHand: 0 });
    expect(before).toMatchObject({ days: 47, line: 297_000, inHandDays: 0 });
  });
});

describe('money that only lands with Future you 500.000 a month, rent 3.000.000 due the 19th', () => {
  const en: Parameters<typeof landingLine>[0] = (key, ...params) => t('en', key, ...params);

  async function landed(amounts: readonly number[]) {
    const { store, actions, moneyIn } = await joined(
      { ways: ['landed'] },
      {
        futureYou: 500_000,
        bills: [{ name: 'Rent', icon: 'home', hue: 30, amount: 3_000_000, dueDay: 19 }],
      },
    );
    for (const amount of amounts) {
      const row = await moneyIn(amount, 'Studio May');
      await actions.keepPay(row.id, { amount: 0, incomeId: 'landed' });
    }
    return store;
  }

  it('before anything lands, Future you waits for money: its jar holds nothing yet', async () => {
    const snap = (await landed([])).getSnapshot();
    expect(periodOf(snap)).toMatchObject({ required: 3_500_000, reserved: 0, jars: 0 });
    expect(snap.potSaved.futureYou ?? 0).toBe(0);
  });

  it('18.000.000 sets the rent and Future you aside, and the line names both', async () => {
    const snap = (await landed([18_000_000])).getSnapshot();
    expect(periodOf(snap)).toMatchObject({ reserved: 3_500_000, bills: 3_000_000, jars: 500_000 });
    // The jar, Plan's Pots part and the slip all hold the same 500.000.
    expect(snap.potSaved.futureYou).toBe(500_000);
    const plan = viewOf(snap);
    if (plan.kind !== 'landed') throw new Error('not landed');
    expect(plan.view).toMatchObject({
      jars: 500_000,
      toShare: 14_500_000,
      ahead: 3_500_000,
      line: 261_000,
      covered: 42,
      inHandDays: 26,
      beyond: 6_824_000,
      leftOver: 0,
    });
    expect(plan.rows.find((r) => r.kind === 'jars')?.amount).toBe(-500_000);
    expect(dayOf(snap)?.line).toBe(261_000);
    expect(setAsideNamed(plan.view)).toBe('both');
    expect(
      landingLine(en, {
        name: 'Studio May',
        amount: '18M',
        line: '261k',
        inHand: coverRulerOf(plan.view)?.inHand ?? 0,
        named: setAsideNamed(plan.view),
      }),
    ).toBe(
      'Studio May’s 18M is in. The bills and Future you are set aside; your day is 261k, and 26 more days are in hand.',
    );
  });

  it('then 2.000.000 to last to 31 December: no whole day in hand, so none is said or drawn', async () => {
    const store = await landed([18_000_000, 2_000_000]);
    await setLastUntil(store, '2026-12-31');
    const snap = store.getSnapshot();
    const plan = viewOf(snap);
    if (plan.kind !== 'landed') throw new Error('not landed');
    expect(plan.view).toMatchObject({
      line: 276_000,
      stretchDays: 47,
      atLine: 12_972_000,
      covered: 47,
      inHandDays: 0,
      beyond: 0,
      leftOver: 28_000,
    });
    expect(landedMaths(plan.view, [18_000_000, 2_000_000]).at(-1)).toMatchObject({
      kind: 'leftOver',
      amount: 28_000,
    });
    expect(coverRulerOf(plan.view)?.inHand).toBe(0);
    expect(
      landingLine(en, {
        name: 'Studio May',
        amount: '2M',
        line: '276k',
        inHand: 0,
        named: setAsideNamed(plan.view),
      }),
    ).toBe('Studio May’s 2M is in. The bills and Future you are set aside; your day is 276k.');
    // Vietnamese says it without the clause too.
    expect(
      landingLine((key, ...params) => t('vi', key, ...params), {
        name: 'Studio May',
        amount: '2tr',
        line: '276k',
        inHand: 0,
        named: 'bills',
      }),
    ).toBe('2tr của Studio May đã về. Hoá đơn đã để riêng; mỗi ngày của bạn là 276k.');
  });
});

describe('answering the question again', () => {
  it('ends the month on the 30th from "It varies", as a fresh answer does', async () => {
    const store = createMoneyStore(openMemoryDb(), JOINED);
    await completeOnboarding(
      store,
      {
        income: 12_000_000,
        payday: { kind: 'varies' },
        futureYou: 0,
        bills: [],
        wallets: ['MB'],
        closeAt: '18:00',
      },
      { today: JOINED, language: 'en' },
    );
    const made = planOfAnswers({ ...start, ways: ['landed'] }, JOINED);
    await answerReach(store, made);
    expect(periodOf(store.getSnapshot())).toMatchObject({ on: '2026-11-30', daysLeft: 15 });
    expect((await readPlan(store.db))?.payday).toEqual({ kind: 'sameDay', day: 1 });
  });

  it('saves Plan’s own answers back unchanged, and a switch back to a salary drops the incomes', async () => {
    const store = createMoneyStore(openMemoryDb(), JOINED);
    const made = planOfAnswers({ ...start, ways: ['weekly'] }, JOINED);
    await completeOnboarding(
      store,
      {
        income: made.income,
        payday: made.payday,
        futureYou: 0,
        bills: [],
        wallets: ['MB'],
        closeAt: '18:00',
        ...(made.incomes ? { incomes: made.incomes } : {}),
      },
      { today: JOINED, language: 'en' },
    );
    const saved = await readPlan(store.db);
    if (saved === null) throw new Error('no plan');
    const again = planOfAnswers(answersOfPlan(saved, JOINED, start), JOINED);
    await answerReach(store, again);
    expect(await readPlan(store.db)).toEqual(saved);

    const salary = planOfAnswers(
      { ...start, ways: ['salary'], payday: { kind: 'sameDay', day: 25 } },
      JOINED,
    );
    await answerReach(store, salary);
    const monthly = await readPlan(store.db);
    expect(monthly).toMatchObject({ income: 17_400_000, payday: { kind: 'sameDay', day: 25 } });
    expect(monthly).not.toHaveProperty('incomes');
    expect(periodOf(store.getSnapshot())).toBeNull();
  });
});
