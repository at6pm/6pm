import { randomUUID } from 'expo-crypto';

import {
  addDays,
  currencyOf,
  moneyFormat,
  moneyLocale,
  parts,
  splitEqually,
  vndLocale,
  type LocalDate,
  type SpendRow,
} from '@6pm/domain';
import { t, type Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { readPlan } from '../../data/plan-settings';
import { RECEIVING_ACCOUNT_KEY } from '../../data/receiving-account';
import { SEED_NAMES } from './design-seed-names';
import { seedPricesIn } from './design-seed-prices';

/**
 * Who owes me, for the acceptance story: `dinner` adds a dinner two days ago split four ways with
 * three friends (1,2tr, so 300k each, in đồng); `payback` adds, today, the first friend's share by
 * bank alert, waiting for the close; `both` does the two. Names follow `language` and amounts the
 * plan's currency. Run after the friday seed.
 *
 * In đồng the dinner also leaves a receiving account, so a share can be asked for by VietQR: a
 * code needs a real bank's number, so that one name is a real bank's.
 */
export async function seedDesignOwed(
  store: MoneyStore,
  today: LocalDate,
  what: 'dinner' | 'payback' | 'both',
  language: Language = 'en',
): Promise<void> {
  const { db, tables } = store;
  const plan = await readPlan(db);
  const currency = currencyOf(plan?.currency ?? 'VND');
  const names = SEED_NAMES[language].owed;
  const total = seedPricesIn(currency).owedDinner;
  const split = splitEqually(total, 4, currency);
  const money = moneyFormat(
    currency.code === 'VND' ? vndLocale(language) : moneyLocale(currency, language),
  );
  const iso = new Date().toISOString();
  const at = (day: LocalDate, time: string) => {
    const [h = 0, m = 0] = time.split(':').map(Number);
    const { year, month, day: d } = parts(day);
    return new Date(year, month - 1, d, h, m).toISOString();
  };
  const base: Omit<SpendRow, 'id' | 'day' | 'at' | 'amount' | 'merchant' | 'source' | 'status'> = {
    categoryId: 'food',
    note: null,
    previousStatus: null,
    wallet: null,
    forWork: false,
    detail: null,
    foreignAmount: null,
    createdAt: iso,
    updatedAt: iso,
  };
  await db.withTransactionAsync(async () => {
    if (what !== 'payback') {
      await db.runAsync('DELETE FROM owed', []);
      const day = addDays(today, -2);
      const id = randomUUID();
      await tables.spends.put({
        ...base,
        id,
        day,
        at: at(day, '19:40'),
        amount: split.mine,
        merchant: names.dinner,
        note: t(language, 'scan.receipt.splitNote', { count: 4, total: money.full(total) }),
        source: 'manual',
        status: 'kept',
      });
      for (const [i, amount] of split.others.entries()) {
        await tables.owed.put({
          id: randomUUID(),
          spendId: id,
          name: names.friends[i] ?? null,
          amount,
          day,
          sort: i + 1,
          createdAt: iso,
          settledAt: null,
          settledBy: null,
          settledSpendId: null,
          remindAt: null,
          updatedAt: iso,
        });
      }
      if (currency.code === 'VND') {
        await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
          RECEIVING_ACCOUNT_KEY,
          JSON.stringify({
            bankId: 'MB',
            bin: '970422',
            account: '0901234567',
            name: 'NGUYEN THU HA',
          }),
        ]);
      }
    }
    if (what !== 'dinner') {
      // The friend's share, caught from a bank alert the app words with no bank's name.
      await tables.spends.put({
        ...base,
        id: randomUUID(),
        day: today,
        at: at(today, '17:12'),
        amount: split.others[0] ?? 0,
        categoryId: 'gifts',
        merchant: names.payer,
        source: 'alert',
        status: 'caught',
        memo: names.memo,
        direction: 'in',
      });
    }
  });
  await store.loadInTurn(today);
}
