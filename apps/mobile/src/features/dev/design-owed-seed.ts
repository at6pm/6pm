import { randomUUID } from 'expo-crypto';

import { addDays, parts, splitEqually, VND, type LocalDate, type SpendRow } from '@6pm/domain';

import type { MoneyStore } from '../../data/money-store';
import { RECEIVING_ACCOUNT_KEY } from '../../data/receiving-account';

/**
 * Who owes me, for the acceptance story: `dinner` adds a 1,2tr Lẩu Manwah two days ago split four
 * ways with Linh, Nam and Huy, and an MB Bank receiving account; `payback` adds, today, Linh's
 * 300k by bank alert, waiting for the close; `both` does the two. Run after the friday seed.
 */
export async function seedDesignOwed(
  store: MoneyStore,
  today: LocalDate,
  what: 'dinner' | 'payback' | 'both',
): Promise<void> {
  const { db, tables } = store;
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
      const split = splitEqually(1_200_000, 4, VND);
      const id = randomUUID();
      await tables.spends.put({
        ...base,
        id,
        day,
        at: at(day, '19:40'),
        amount: split.mine,
        merchant: 'Lẩu Manwah',
        note: 'Split 4 ways · 1.200.000₫ in all',
        source: 'manual',
        status: 'kept',
      });
      const names = ['Linh', 'Nam', 'Huy'];
      for (const [i, amount] of split.others.entries()) {
        await tables.owed.put({
          id: randomUUID(),
          spendId: id,
          name: names[i] ?? null,
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
    if (what !== 'dinner') {
      await tables.spends.put({
        ...base,
        id: randomUUID(),
        day: today,
        at: at(today, '17:12'),
        amount: 300_000,
        categoryId: 'gifts',
        merchant: 'NGUYEN THU LINH',
        source: 'alert',
        status: 'caught',
        detail: 'MB Bank',
        memo: 'NGUYEN THU LINH chuyen tien',
        direction: 'in',
      });
    }
  });
  await store.loadInTurn(today);
}
