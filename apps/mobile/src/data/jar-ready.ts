import type { SqlDatabase } from './table';

/**
 * The settings key holding the jars' ready moments already shown, as `{jar}:{reason}` keys: each
 * is celebrated once per jar and reason. Kept on the phone only, never in the backup.
 */
export const JARS_READY_SHOWN_KEY = 'jarsReadyShown';

export async function readReadyShown(db: SqlDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    JARS_READY_SHOWN_KEY,
  ]);
  try {
    const parsed: unknown = JSON.parse(rows[0]?.value ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Remembers a ready moment as shown, so no later close shows it again. */
export async function markReadyShown(db: SqlDatabase, key: string): Promise<void> {
  const shown = await readReadyShown(db);
  if (shown.has(key)) return;
  shown.add(key);
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    JARS_READY_SHOWN_KEY,
    JSON.stringify([...shown]),
  ]);
}
