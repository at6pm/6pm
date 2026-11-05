import { randomUUID } from 'expo-crypto';

import {
  designAmount,
  currencyOf,
  newYearJarRow,
  nextNewYearWindow,
  parts,
  payCycleOn,
  type LocalDate,
} from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import type { MoneyStore } from '../../data/money-store';
import { readPlan, writePlan } from '../../data/plan-settings';
import { writeOpening } from '../../data/pot-moves';
import { seedDesignFriday } from './design-friday-seed';

/** The Tết Season canvas's states, on the designed Friday moved to the season's dates. */
export type TetSeed = 'offer' | 'bonus' | 'window';

/**
 * Developer tool for the Lunar New Year season, run with the clock pinned to a day of it (the
 * command's `on`): the designed Friday, then
 * - `offer`: no Tết jar yet, so Today shows the offer from 1 December;
 * - `bonus`: the acceptance case: plan income 15tr, a 5tr Tết jar holding 3tr, and a 9tr bonus
 *   ("THUONG TET 2027") waiting for tonight's close;
 * - `window`: a 7tr Tết jar, full, for the countdown, lì xì in Quick add and the close's question.
 * Amounts are worth the same in another currency.
 */
export async function seedDesignTet(
  store: MoneyStore,
  today: LocalDate,
  state: TetSeed,
  code = 'VND',
  language: Language = 'en',
): Promise<void> {
  await seedDesignFriday(store, today, code, language);
  const currency = currencyOf(code);
  const worth = (dong: number) => designAmount(dong, currency);
  const { db, tables } = store;
  const plan = await readPlan(db);
  if (plan) {
    await writePlan(db, { ...plan, income: worth(15_000_000) });
  }
  const window = nextNewYearWindow(today, 'tet');
  const iso = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    // The Friday's dated jar would answer the close's question first: the season's jar only.
    await db.runAsync('DELETE FROM pots WHERE id != ?', ['futureYou']);
    await db.runAsync('DELETE FROM pot_moves WHERE pot_id != ?', ['futureYou']);
    // The season's Today is a calm one: none of the Friday's earlier spending in this cycle.
    if (state === 'window') await db.runAsync('DELETE FROM spends WHERE day < ?', [today]);
    if (state === 'offer' || window === null) return;
    const goal = worth(state === 'bonus' ? 5_000_000 : 7_000_000);
    const jar = newYearJarRow({ id: 'dev-tet', name: 'Tết', goal, window, createdAt: iso });
    await tables.pots.put(jar);
    const cycle = payCycleOn(today, { kind: 'sameDay', day: 31 });
    await writeOpening(db, jar.id, state === 'bonus' ? worth(3_000_000) : goal, cycle.start);
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
      amount: worth(9_000_000),
      categoryId: 'shopping',
      merchant: 'Mây Xanh JSC',
      note: null,
      source: 'shared',
      status: 'caught',
      previousStatus: null,
      wallet: null,
      forWork: false,
      detail: 'VPBank · FT27025THUONG',
      foreignAmount: null,
      memo: 'THUONG TET 2027',
      direction: 'in',
      createdAt: iso,
      updatedAt: iso,
    });
  });
  await store.loadInTurn(today);
}
