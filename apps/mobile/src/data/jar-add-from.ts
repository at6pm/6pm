import type { JarAddFrom } from '@6pm/domain';

import type { SqlDatabase } from './table';

/** The settings key that remembers, on this phone, where a jar's Add last took its money from. */
function keyOf(potId: string): string {
  return `jarAddFrom:${potId}`;
}

/** Where the jar's Add sheet starts: the last choice made for it, this month's money otherwise. */
export async function readJarAddFrom(db: SqlDatabase, potId: string): Promise<JarAddFrom> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    keyOf(potId),
  ]);
  return rows[0]?.value === 'saved' ? 'saved' : 'cycle';
}

export async function writeJarAddFrom(
  db: SqlDatabase,
  potId: string,
  from: JarAddFrom,
): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    keyOf(potId),
    from,
  ]);
}
