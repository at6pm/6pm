import { addDays, currencyOf, type LocalDate } from '@6pm/domain';

import type { MoneyStore } from '../../data/money-store';
import { readPlan } from '../../data/plan-settings';
import { fridayLine } from './design-friday-fixture';

/**
 * Developer tool: exactly `days` evenings closed back to back, ending yesterday, for the close
 * streak's card (7, 30, 100). Days already closed keep their totals; the ones missing are closed
 * at a few minutes past six, on the Friday's line in the plan's currency, with between seven tenths
 * and a little over the whole of it spent. The evening before the run and today are left open, so
 * the run is neither longer nor already tonight's.
 */
export async function seedDesignStreak(
  store: MoneyStore,
  today: LocalDate,
  days: number,
): Promise<void> {
  const { tables, db } = store;
  const currency = currencyOf((await readPlan(db))?.currency ?? 'VND');
  const line = fridayLine(currency);
  const unit = currency.step;
  await db.runAsync('DELETE FROM closed_days WHERE day = ? OR day = ?', [
    today,
    addDays(today, -days - 1),
  ]);
  for (let i = 1; i <= days; i++) {
    const day = addDays(today, -i);
    const minute = String((i * 7) % 13).padStart(2, '0');
    await tables.closedDays.insertMissing({
      day,
      closedAt: new Date(`${day}T18:${minute}:00`).toISOString(),
      late: false,
      spent: Math.round((line * (0.7 + ((i * 37) % 160) / 340)) / unit) * unit,
      line,
      tomorrow: line,
      note: null,
    });
  }
  await store.loadInTurn(today);
}

/** While set, Today shows the Year card whatever the date (checking it before 20 December). */
let yearCardShown = false;

export function showYearCardAnyDay(on: boolean) {
  yearCardShown = on;
}

export function yearCardAnyDay(): boolean {
  return __DEV__ && yearCardShown;
}
