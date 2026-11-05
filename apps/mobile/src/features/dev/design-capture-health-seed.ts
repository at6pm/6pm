import { randomUUID } from 'expo-crypto';

import { addDays, parts, type LocalDate, type SpendRow } from '@6pm/domain';

import { noteReceiptEdit } from '../../data/first-catch';
import type { MoneyStore } from '../../data/money-store';
import { seedDesignFriday } from './design-friday-seed';

/** Catches a day for the last 14 days, as the design's heartbeats draw them (today last). */
const BEATS: Readonly<Record<'qr' | 'shared' | 'alert' | 'email' | 'voice', readonly number[]>> = {
  qr: [1, 2, 1, 0, 2, 1, 1, 2, 1, 0, 1, 2, 1, 1],
  shared: [1, 0, 1, 1, 0, 2, 1, 0, 1, 1, 2, 0, 1, 2],
  alert: [2, 1, 3, 2, 1, 2, 2, 1, 3, 2, 1, 0, 0, 0],
  email: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  voice: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
};
const MERCHANT = {
  qr: 'Phở Hoà',
  shared: 'Highlands Coffee',
  alert: 'Bách hoá Xanh',
  email: 'Shopee',
  voice: 'Bánh mì',
} as const;
const DETAIL = {
  qr: null,
  shared: 'Techcombank',
  alert: 'MB Bank',
  email: 'no-reply@shopee.vn',
  voice: null,
} as const;

/**
 * The designed Friday with two weeks of catches behind it: a heartbeat for each way (bank alerts
 * from MB gone quiet three days ago after a busy fortnight, Apple Pay never set up), and fifty
 * receipts shared this month, three of them fixed by hand, for Settings' "Read on this phone".
 * The earlier days' catches are taken back (deleted), so the plan's numbers stay the Friday's.
 */
export async function seedCaptureHealth(store: MoneyStore, today: LocalDate): Promise<void> {
  await seedDesignFriday(store, today);
  const { tables } = store;
  const stamp = (day: LocalDate, hour: number) => {
    const { year, month, day: d } = parts(day);
    return new Date(year, month - 1, d, hour, 12).toISOString();
  };
  const row = (
    source: keyof typeof BEATS,
    day: LocalDate,
    hour: number,
    amount: number,
  ): SpendRow => ({
    id: randomUUID(),
    day,
    at: stamp(day, hour),
    amount,
    categoryId: 'food',
    merchant: MERCHANT[source],
    note: null,
    source,
    status: 'deleted',
    previousStatus: 'caught',
    wallet: null,
    forWork: false,
    detail: DETAIL[source],
    foreignAmount: null,
    currencyGuessed: false,
    memo: null,
    direction: null,
    moneyIn: null,
    givesBack: null,
    savedTo: null,
    paysBill: null,
    createdAt: stamp(day, hour),
    updatedAt: stamp(day, hour),
  });
  const rows: SpendRow[] = [];
  for (const [source, beats] of Object.entries(BEATS) as [keyof typeof BEATS, number[]][]) {
    beats.forEach((count, k) => {
      const day = addDays(today, k - 13);
      for (let n = 0; n < count; n += 1) rows.push(row(source, day, 9 + n * 3, 45_000));
    });
  }
  // This month's receipts read on the phone: fifty in all.
  const month = `${today.slice(0, 7)}-01`;
  const already = rows.filter((r) => r.source === 'shared' && r.day >= month).length;
  for (let n = already; n < 50; n += 1) rows.push(row('shared', month, 8, 65_000));
  await store.db.withTransactionAsync(async () => {
    for (const r of rows) await tables.spends.put(r);
  });
  const receipts = rows.filter((r) => r.source === 'shared' && r.day >= month);
  const fixes: [number, Partial<SpendRow>][] = [
    [11, { amount: 125_000 }],
    [29, { merchant: 'Bách hoá Xanh' }],
    [41, { amount: 98_000 }],
  ];
  for (const [at, patch] of fixes) {
    const receipt = receipts[at];
    if (!receipt) continue;
    const read = at === 11 ? { amount: 1_250_000 } : at === 41 ? { amount: 89_000 } : {};
    await noteReceiptEdit(store.db, { ...receipt, ...read }, patch);
  }
  await store.loadInTurn(today);
}
