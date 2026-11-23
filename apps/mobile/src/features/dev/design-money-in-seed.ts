import { randomUUID } from 'expo-crypto';

import { addDays, currencyOf, parts, type LocalDate, type SpendRow } from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { seedDesignFriday } from './design-friday-seed';
import { FRIDAY_HOME_CURRENCY } from './design-friday-locales';
import { SEED_NAMES } from './design-seed-names';
import { seedPricesIn } from './design-seed-prices';

/** The person's own 6pm address: what an emailed receipt was forwarded to. */
const OWN_ADDRESS = 'k7m2qx@at6pm.app';

/**
 * The designed Friday with money coming in: a gift to spread or save, the pay (above the plan, so
 * its extra peels off), a refund of an order from last week, and a Future you goal to save in.
 * Opens the close's money cards and its pay and refund questions. Names follow `language` and
 * amounts the currency (`SEED_NAMES`, `SEED_PRICES`); no shop or bank is named.
 */
export async function seedDesignMoneyIn(
  store: MoneyStore,
  today: LocalDate,
  code?: string,
  language: Language = 'en',
): Promise<void> {
  await seedDesignFriday(store, today, code, language);
  const names = SEED_NAMES[language].moneyIn;
  const prices = seedPricesIn(currencyOf(code ?? FRIDAY_HOME_CURRENCY[language])).moneyIn;
  const { tables } = store;
  const iso = new Date().toISOString();
  const at = (day: LocalDate, time: string) => {
    const [h = 0, m = 0] = time.split(':').map(Number);
    const { year, month, day: d } = parts(day);
    return new Date(year, month - 1, d, h, m).toISOString();
  };
  await store.db.withTransactionAsync(async () => {
    await tables.pots.put({
      id: 'cushion',
      kind: 'goal',
      name: names.cushion,
      icon: 'savings',
      hue: 150,
      goal: prices.cushionGoal,
      neededBy: null,
      share: 1,
      paused: false,
      createdAt: iso,
      archivedAt: null,
    });
    const earbuds = addDays(today, -6);
    const rows: Omit<SpendRow, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        day: earbuds,
        at: at(earbuds, '20:12'),
        amount: prices.order,
        categoryId: 'shopping',
        merchant: names.order,
        note: null,
        source: 'email',
        status: 'kept',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: OWN_ADDRESS,
        foreignAmount: null,
      },
      {
        day: today,
        at: at(today, '10:05'),
        amount: prices.pay,
        categoryId: 'shopping',
        merchant: names.employer,
        note: null,
        source: 'shared',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: null,
        foreignAmount: null,
        memo: names.payMemo,
        direction: 'in',
      },
      {
        day: today,
        at: at(today, '14:22'),
        amount: prices.gift,
        categoryId: 'gifts',
        merchant: names.giver,
        note: null,
        source: 'email',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: OWN_ADDRESS,
        foreignAmount: null,
        memo: names.giftMemo,
        direction: 'in',
      },
      {
        day: today,
        at: at(today, '17:40'),
        amount: prices.order,
        categoryId: 'shopping',
        merchant: names.order,
        note: null,
        source: 'email',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: OWN_ADDRESS,
        foreignAmount: null,
        direction: 'in',
        moneyIn: 'refund',
      },
    ];
    for (const row of rows) {
      await tables.spends.put({ ...row, id: randomUUID(), createdAt: iso, updatedAt: iso });
    }
  });
  await store.loadInTurn(today);
}
