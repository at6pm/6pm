import { describe, expect, it, jest } from '@jest/globals';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { planOfAnswers, startingWays } from '../features/onboarding/money-ways';
import { createMoneyStore } from './money-store';
import { completeOnboarding } from './onboarding';
import { readPlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => 'VND' }));

const TODAY = '2026-11-13';

describe('"Which of these is for work?", saved', () => {
  it('keeps each chosen bank’s and cash’s stamp with work taken as it comes', async () => {
    const ways = { ...startingWays(0, 0), ways: ['sell' as const] };
    const plan = planOfAnswers(ways, TODAY);
    expect(plan.incomes?.work).toBe(true);
    const store = createMoneyStore(openMemoryDb(), TODAY);
    await completeOnboarding(
      store,
      {
        income: plan.income,
        payday: plan.payday,
        futureYou: 0,
        bills: [],
        wallets: ['MB', 'TCB', 'MOMO'],
        closeAt: '18:00',
        ...(plan.incomes
          ? {
              incomes: {
                ...plan.incomes,
                workBanks: { MB: 'always', TCB: 'sometimes', MOMO: 'never', CASH: 'sometimes' },
              },
            }
          : {}),
      },
      { today: TODAY, language: 'vi' },
    );
    expect((await readPlan(store.db))?.work).toEqual({
      mode: 'asItComes',
      banks: { MB: 'always', TCB: 'sometimes', MOMO: 'never', CASH: 'sometimes' },
    });
  });
});
