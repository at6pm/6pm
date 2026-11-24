import { randomUUID } from 'expo-crypto';

import { addDays, currencyOf, parts, type LocalDate, type SpendRow } from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import { noteReceiptEdit } from '../../data/first-catch';
import type { MoneyStore } from '../../data/money-store';
import { fridayPricesIn } from './design-friday-fixture';
import { seedDesignFriday } from './design-friday-seed';
import { FRIDAY_HOME_CURRENCY, FRIDAY_NAMES } from './design-friday-locales';

/** Catches a day for the last 14 days, as the design's heartbeats draw them (today last). */
const BEATS: Readonly<Record<'qr' | 'shared' | 'alert' | 'email' | 'voice', readonly number[]>> = {
  qr: [1, 2, 1, 0, 2, 1, 1, 2, 1, 0, 1, 2, 1, 1],
  shared: [1, 0, 1, 1, 0, 2, 1, 0, 1, 1, 2, 0, 1, 2],
  alert: [2, 1, 3, 2, 1, 2, 2, 1, 3, 2, 1, 0, 0, 0],
  email: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  voice: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
};
/** Where each way's catches come from, of the Friday's own places. */
const PLACE = {
  qr: 'lunch',
  shared: 'shop',
  alert: 'coffee',
  email: 'treat',
  voice: 'breakfast',
} as const;
/** A catch says only what the app would word itself: no bank's name, the person's own address. */
const DETAIL = {
  qr: null,
  shared: null,
  alert: null,
  email: 'k7m2qx@at6pm.app',
  voice: null,
} as const;

/**
 * The designed Friday with two weeks of catches behind it: a heartbeat for each way (bank alerts
 * gone quiet three days ago after a busy fortnight, Apple Pay never set up), and fifty receipts
 * shared this month, three of them fixed by hand, for Settings' "Read on this phone". The catches
 * are the Friday's own places at its prices, in `language` and the currency. The earlier days'
 * catches are taken back (deleted), so the plan's numbers stay the Friday's.
 */
export async function seedCaptureHealth(
  store: MoneyStore,
  today: LocalDate,
  code?: string,
  language: Language = 'en',
): Promise<void> {
  await seedDesignFriday(store, today, code, language);
  const names = FRIDAY_NAMES[language];
  const prices = fridayPricesIn(currencyOf(code ?? FRIDAY_HOME_CURRENCY[language])).today;
  const { tables } = store;
  const stamp = (day: LocalDate, hour: number) => {
    const { year, month, day: d } = parts(day);
    return new Date(year, month - 1, d, hour, 12).toISOString();
  };
  const row = (source: keyof typeof BEATS, day: LocalDate, hour: number): SpendRow => ({
    id: randomUUID(),
    day,
    at: stamp(day, hour),
    amount: prices[PLACE[source]],
    categoryId: 'food',
    merchant: names[PLACE[source]],
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
      for (let n = 0; n < count; n += 1) rows.push(row(source, day, 9 + n * 3));
    });
  }
  // This month's receipts read on the phone: fifty in all.
  const month = `${today.slice(0, 7)}-01`;
  const already = rows.filter((r) => r.source === 'shared' && r.day >= month).length;
  for (let n = already; n < 50; n += 1) rows.push(row('shared', month, 8));
  await store.db.withTransactionAsync(async () => {
    for (const r of rows) await tables.spends.put(r);
  });
  const receipts = rows.filter((r) => r.source === 'shared' && r.day >= month);
  // Three were fixed by hand: an amount read ten times too big, a shop read as another, and an
  // amount read as the line above it.
  const fixes: [number, Partial<SpendRow>, Partial<SpendRow>][] = [
    [11, { amount: prices.shop * 10 }, { amount: prices.shop }],
    [29, {}, { merchant: names.earlier.supermarket }],
    [41, { amount: prices.lunch }, { amount: prices.lunch + prices.breakfast }],
  ];
  for (const [at, read, patch] of fixes) {
    const receipt = receipts[at];
    if (!receipt) continue;
    await noteReceiptEdit(store.db, { ...receipt, ...read }, patch);
  }
  await store.loadInTurn(today);
}
