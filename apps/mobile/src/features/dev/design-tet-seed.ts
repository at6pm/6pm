import { randomUUID } from 'expo-crypto';

import {
  currencyOf,
  newYearJarRow,
  newYearTradition,
  nextNewYearWindow,
  parts,
  payCycleOn,
  type LocalDate,
} from '@6pm/domain';
import { t, type Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { readPlan, writePlan } from '../../data/plan-settings';
import { writeOpening } from '../../data/pot-moves';
import { seedDesignFriday } from './design-friday-seed';
import { FRIDAY_HOME_CURRENCY } from './design-friday-locales';
import { SEED_NAMES } from './design-seed-names';
import { seedPricesIn } from './design-seed-prices';

/** The Tết Season canvas's states, on the designed Friday moved to the season's dates. */
export type TetSeed = 'offer' | 'bonus' | 'window';

/**
 * Developer tool for the Lunar New Year season, run with the clock pinned to a day of it (the
 * command's `on`): the designed Friday, then
 * - `offer`: no season's jar yet, so Today shows the offer from 1 December;
 * - `bonus`: the acceptance case: plan income 15tr, a 5tr jar holding 3tr, and a 9tr bonus
 *   ("THUONG TET") waiting for tonight's close;
 * - `window`: a 7tr jar, full, for the countdown, lì xì in Quick add and the close's question.
 * The season is the one the language and currency keep (Tết, Seollal, the Spring Festival; Tết
 * where there is none), its jar named as the app names it. Amounts follow the currency
 * (`SEED_PRICES`): those are the canvas's own in đồng, and elsewhere the Friday's pay stays.
 */
export async function seedDesignTet(
  store: MoneyStore,
  today: LocalDate,
  state: TetSeed,
  code?: string,
  language: Language = 'en',
): Promise<void> {
  await seedDesignFriday(store, today, code, language);
  const currency = currencyOf(code ?? FRIDAY_HOME_CURRENCY[language]);
  const prices = seedPricesIn(currency);
  const names = SEED_NAMES[language].moneyIn;
  const { db, tables } = store;
  const plan = await readPlan(db);
  if (plan && prices.bonus.income !== null) {
    await writePlan(db, { ...plan, income: prices.bonus.income });
  }
  const tradition = newYearTradition({ currency: currency.code, region: null, language }) ?? 'tet';
  const window = nextNewYearWindow(today, tradition);
  const iso = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    // The Friday's dated jar would answer the close's question first: the season's jar only.
    await db.runAsync('DELETE FROM pots WHERE id != ?', ['futureYou']);
    await db.runAsync('DELETE FROM pot_moves WHERE pot_id != ?', ['futureYou']);
    // The season's Today is a calm one: none of the Friday's earlier spending in this cycle.
    if (state === 'window') await db.runAsync('DELETE FROM spends WHERE day < ?', [today]);
    if (state === 'offer' || window === null) return;
    const goal = state === 'bonus' ? prices.bonus.jarGoal : prices.jars.season.goal;
    const jar = newYearJarRow({
      id: 'dev-tet',
      name: t(language, `season.festival.${tradition}`),
      goal,
      window,
      createdAt: iso,
    });
    await tables.pots.put(jar);
    const cycle = payCycleOn(today, { kind: 'sameDay', day: 31 });
    await writeOpening(db, jar.id, state === 'bonus' ? prices.bonus.jarHeld : goal, cycle.start);
    // This payday's set-aside is already written (nothing this cycle), so the jar holds what
    // the canvas says rather than catching up from the day the seed ran.
    await db.runAsync(
      'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      [`${jar.id}:setAside:${cycle.start}`, jar.id, 0, 'setAside', cycle.start, iso],
    );
    if (state !== 'bonus') return;
    // Tonight's close holds only the bonus: it opens on the cash step, then asks.
    await db.runAsync("DELETE FROM spends WHERE day = ? AND status != 'kept'", [today]);
    const { year, month, day } = parts(today);
    await tables.spends.put({
      id: randomUUID(),
      day: today,
      at: new Date(year, month - 1, day, 10, 2).toISOString(),
      amount: prices.bonus.amount,
      categoryId: 'shopping',
      merchant: names.employer,
      note: null,
      // A photo of the transfer's receipt, shared: no bank is named.
      source: 'shared',
      status: 'caught',
      previousStatus: null,
      wallet: null,
      forWork: false,
      detail: null,
      foreignAmount: null,
      memo: names.bonusMemo,
      direction: 'in',
      createdAt: iso,
      updatedAt: iso,
    });
  });
  await store.loadInTurn(today);
}
