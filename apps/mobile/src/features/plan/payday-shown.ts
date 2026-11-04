import type { LocalDate } from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';

/**
 * The settings key holding the payday whose jars Plan last filled in front of the person: the
 * Pots part pulses and the jars fill once per payday. Kept on the phone only.
 */
const PAYDAY_SHOWN_KEY = 'planPaydayShown';

export async function paydayShown(db: SqlDatabase, payday: LocalDate): Promise<boolean> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    PAYDAY_SHOWN_KEY,
  ]);
  return rows[0]?.value === payday;
}

export async function markPaydayShown(db: SqlDatabase, payday: LocalDate): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    PAYDAY_SHOWN_KEY,
    payday,
  ]);
}
