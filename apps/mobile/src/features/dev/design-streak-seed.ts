import { addDays, type LocalDate } from '@6pm/domain';

import type { MoneyStore } from '../../data/money-store';

/**
 * Developer tool: exactly `days` evenings closed back to back, ending yesterday, for the close
 * streak's card (7, 30, 100). Days already closed keep their totals; the ones missing are closed
 * at a few minutes past six. The evening before the run and today are left open, so the run is
 * neither longer nor already tonight's.
 */
export async function seedDesignStreak(
  store: MoneyStore,
  today: LocalDate,
  days: number,
): Promise<void> {
  const { tables, db } = store;
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
      spent: 240_000 + ((i * 37_000) % 160_000),
      line: 340_000,
      tomorrow: 340_000,
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
