import { randomUUID } from 'expo-crypto';

import {
  addDays,
  currencyOf,
  FUTURE_YOU_POT_ID,
  futureYouPotRow,
  parts,
  payCycleOn,
  type LocalDate,
} from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { fridayPricesIn } from './design-friday-fixture';
import { seedDesignFriday } from './design-friday-seed';
import { FRIDAY_HOME_CURRENCY, FRIDAY_NAMES } from './design-friday-locales';
import { SEED_NAMES } from './design-seed-names';
import { yearDay, yearLine } from './design-seed-prices';

/**
 * Developer tool: the prototype's Friday, plus every earlier day back to 1 January last year
 * closed (one in nine missed), with two or three spends each, so the shelf has full years and the
 * year book has months to bind. Replaces everything in the money tables. The days go to the
 * Friday's own places in `language`, at the currency's local prices (`yearDay`), each caught the
 * way such a spend is; `scale` multiplies every earlier day's spends (long amounts for checking
 * that they fit), and `code` sets the currency, the language's own when not given.
 */
export async function seedDesignYear(
  store: MoneyStore,
  today: LocalDate,
  {
    code,
    scale = 1,
    language = 'en',
  }: { readonly code?: string; readonly scale?: number; readonly language?: Language } = {},
): Promise<void> {
  await seedDesignFriday(store, today, code, language);
  const currency = currencyOf(code ?? FRIDAY_HOME_CURRENCY[language]);
  const names = FRIDAY_NAMES[language];
  const notes = SEED_NAMES[language].notes;
  const line = yearLine(currency, scale);
  const { db, tables } = store;
  const iso = new Date().toISOString();
  const cycle = payCycleOn(today, { kind: 'sameDay', day: 31 });
  const first = `${parts(today).year - 1}-01-01`;
  const payday = { kind: 'sameDay', day: 31 } as const;
  const futureYou = fridayPricesIn(currency).futureYou;
  await db.withTransactionAsync(async () => {
    // Future you was paid first on every payday of those years too, so an earlier month's Money
    // diary and the jar itself show what the plan has been setting aside all along.
    await tables.pots.put(futureYouPotRow(new Date(`${first}T03:00:00.000Z`).toISOString()));
    for (
      let past = payCycleOn(first, payday);
      past.start < cycle.start;
      past = payCycleOn(past.payday, payday)
    ) {
      await db.runAsync(
        `INSERT OR IGNORE INTO pot_moves (id, pot_id, amount, kind, cycle, at)
         VALUES (?, ?, ?, 'setAside', ?, ?)`,
        [
          `set-aside:${FUTURE_YOU_POT_ID}:${past.start}`,
          FUTURE_YOU_POT_ID,
          futureYou,
          past.start,
          iso,
        ],
      );
    }
    for (let day = first, n = 0; day < cycle.start; day = addDays(day, 1), n++) {
      if (n % 9 === 4) continue;
      const { year, month, day: dd } = parts(day);
      let spent = 0;
      for (const [k, spend] of yearDay(n, names, currency, scale).entries()) {
        spent += spend.amount;
        const at = new Date(year, month - 1, dd, 9 + k * 4, 15).toISOString();
        await tables.spends.put({
          id: randomUUID(),
          day,
          at,
          amount: spend.amount,
          categoryId: spend.categoryId,
          merchant: spend.merchant,
          note: null,
          source: spend.source,
          status: 'kept',
          previousStatus: null,
          wallet: null,
          forWork: false,
          detail: null,
          foreignAmount: null,
          createdAt: iso,
          updatedAt: iso,
        });
      }
      await tables.closedDays.put({
        day,
        closedAt: new Date(year, month - 1, dd, 18, 20).toISOString(),
        late: false,
        spent,
        line,
        tomorrow: line,
        note: n % 11 === 0 ? (notes[n % notes.length] ?? null) : null,
      });
    }
  });
  await store.loadInTurn(today);
}
