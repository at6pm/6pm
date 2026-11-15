import { describe, expect, it, jest } from '@jest/globals';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { firstDayOfIncomes } from '../features/onboarding/first-day-incomes';
import { planOfAnswers, startingWays } from '../features/onboarding/money-ways';
import { firstDay } from '../features/onboarding/onboarding-maths';
import { createMoneyStore, dayOf, periodOf } from './money-store';
import { completeOnboarding, type OnboardingAnswers } from './onboarding';
import { readPlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => 'VND' }));

const TODAY = '2026-11-13';
const base: Omit<OnboardingAnswers, 'income' | 'payday'> = {
  futureYou: 800_000,
  bills: [{ name: 'Tiền nhà', icon: 'home', hue: 30, amount: 3_000_000, dueDay: 18 }],
  wallets: ['MB'],
  closeAt: '19:30',
};

async function setUp(answers: OnboardingAnswers) {
  const store = createMoneyStore(openMemoryDb(), TODAY);
  await completeOnboarding(store, answers, { today: TODAY, language: 'en' });
  return store;
}

describe('the money step’s answers, saved', () => {
  it('saves a salary alone as it always was, and Home reads the number the reveal showed', async () => {
    const ways = { ...startingWays(17_400_000, 4_000_000), ways: ['salary' as const] };
    const plan = planOfAnswers({ ...ways, payday: { kind: 'sameDay', day: 25 } }, TODAY);
    expect(plan.incomes).toBeNull();
    const store = await setUp({ ...base, income: plan.income, payday: plan.payday });
    const saved = await readPlan(store.db);
    expect(saved).not.toHaveProperty('incomes');
    expect(saved).not.toHaveProperty('incomesFrom');
    expect(saved).not.toHaveProperty('lastUntil');
    expect(saved).toMatchObject({ income: 17_400_000, payday: { kind: 'sameDay', day: 25 } });
    const reveal = firstDay(
      { income: 17_400_000, payday: plan.payday, bills: 3_000_000, futureYou: 800_000 },
      TODAY,
    );
    expect(dayOf(store.getSnapshot())?.line).toBe(reveal.line);
  });

  it('saves a weekly pay with its incomes from today, and Home reads the reveal’s number', async () => {
    const ways = { ...startingWays(17_400_000, 4_000_000), ways: ['weekly' as const] };
    const plan = planOfAnswers(ways, TODAY);
    const store = await setUp({
      ...base,
      income: plan.income,
      payday: plan.payday,
      ...(plan.incomes ? { incomes: plan.incomes } : {}),
    });
    expect(await readPlan(store.db)).toMatchObject({
      income: 16_000_000,
      payday: { kind: 'sameDay', day: 1 },
      incomes: [{ id: 'pay', rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 }],
      incomesFrom: TODAY,
      lastUntil: null,
    });
    // Joining on a Friday: the reveal's number is the one Home counts once that pay is in.
    const reveal = firstDayOfIncomes(
      {
        incomes: plan.incomes?.incomes ?? [],
        anchor: plan.payday,
        lastUntil: null,
        bills: [{ amount: 3_000_000, dueDay: 18 }],
        futureYou: 800_000,
      },
      TODAY,
    );
    // Rent before the next Friday and two of the month's four slices of Future you: 600.000 over 8.
    expect(reveal.line).toBe(75_000);
    // The pay that opened the stretch landed before 6pm counted: Home has the same number.
    expect(periodOf(store.getSnapshot())).toMatchObject({ kind: 'counted', waiting: false });
    expect(dayOf(store.getSnapshot())?.line).toBe(reveal.line);
  });

  it('saves money that lands with what it has to last until, and work of one’s own', async () => {
    const ways = {
      ...startingWays(17_400_000, 4_000_000),
      ways: ['landed' as const, 'sell' as const],
      lastFor: { kind: 'date' as const, date: '2026-12-20' },
    };
    const plan = planOfAnswers(ways, TODAY);
    const store = await setUp({
      ...base,
      income: plan.income,
      payday: plan.payday,
      ...(plan.incomes ? { incomes: plan.incomes } : {}),
    });
    expect(await readPlan(store.db)).toMatchObject({
      income: 0,
      lastUntil: '2026-12-20',
      work: { mode: 'asItComes' },
      incomesFrom: TODAY,
    });
    const reveal = firstDayOfIncomes(
      {
        incomes: plan.incomes?.incomes ?? [],
        anchor: plan.payday,
        lastUntil: '2026-12-20',
        bills: [{ amount: 3_000_000, dueDay: 18 }],
        futureYou: 800_000,
      },
      TODAY,
    );
    expect(reveal).toMatchObject({ landed: true, line: 0, needs: 3_800_000 });
    expect(dayOf(store.getSnapshot())?.line).toBe(0);
  });
});
