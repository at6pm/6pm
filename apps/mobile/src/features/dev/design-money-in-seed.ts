import { randomUUID } from 'expo-crypto';

import { addDays, parts, type LocalDate, type SpendRow } from '@6pm/domain';

import type { MoneyStore } from '../../data/money-store';
import { seedDesignFriday } from './design-friday-seed';

/**
 * The designed Friday with money coming in: a gift to spread or save, the pay (above the plan, so
 * its extra peels off), a refund of an order from last week, and a Future you goal to save in.
 * Opens the close's money cards and its pay and refund questions.
 */
export async function seedDesignMoneyIn(store: MoneyStore, today: LocalDate): Promise<void> {
  await seedDesignFriday(store, today);
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
      name: 'Cushion',
      icon: 'savings',
      hue: 150,
      goal: 30_000_000,
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
        amount: 349_000,
        categoryId: 'shopping',
        merchant: 'Shopee',
        note: null,
        source: 'email',
        status: 'kept',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: 'no-reply@shopee.vn',
        foreignAmount: null,
      },
      {
        day: today,
        at: at(today, '10:05'),
        amount: 19_000_000,
        categoryId: 'shopping',
        merchant: 'Mây Xanh JSC',
        note: null,
        source: 'shared',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: 'VPBank · FT26300LUONG',
        foreignAmount: null,
        memo: 'LUONG THANG 10',
        direction: 'in',
      },
      {
        day: today,
        at: at(today, '14:22'),
        amount: 2_000_000,
        categoryId: 'gifts',
        merchant: 'Lan Nguyễn',
        note: null,
        source: 'email',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: 'alert@techcombank.com.vn',
        foreignAmount: null,
        memo: 'Chuc mung sinh nhat em',
        direction: 'in',
      },
      {
        day: today,
        at: at(today, '17:40'),
        amount: 349_000,
        categoryId: 'shopping',
        merchant: 'Shopee',
        note: null,
        source: 'email',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: 'no-reply@shopee.vn',
        foreignAmount: null,
        direction: 'in',
        moneyIn: 'refund',
      },
    ];
    for (const row of rows) {
      await tables.spends.put({ ...row, id: randomUUID(), createdAt: iso, updatedAt: iso });
    }
  });
  await store.load(today);
}
