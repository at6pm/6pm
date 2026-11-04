import type { JarHandTake } from '@6pm/domain';

import type { SqlDatabase } from './table';

/**
 * The settings key holding what arms the close's "From your {jar}?" (M13): the spends the person
 * took from a jar by hand, and when they last answered No for each jar. Kept on the phone only,
 * never in the backup. Whether a jar is armed is worked out from this and the spends themselves
 * (`armedJars`), so undoing or deleting a hand spend disarms its jar by itself.
 */
export const JAR_ASKS_KEY = 'jarAsks';

/** The most hand takes kept: the newest ones are the ones that can still arm a jar. */
const MAX_TAKES = 200;

export interface JarAsks {
  readonly taken: readonly JarHandTake[];
  readonly declined: Readonly<Record<string, string>>;
}

const NONE: JarAsks = { taken: [], declined: {} };

export async function readJarAsks(db: SqlDatabase): Promise<JarAsks> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    JAR_ASKS_KEY,
  ]);
  try {
    const parsed = JSON.parse(rows[0]?.value ?? 'null') as {
      readonly taken?: unknown;
      readonly declined?: Readonly<Record<string, unknown>>;
    } | null;
    const isTake = (t: unknown): t is JarHandTake => {
      const r = t as Partial<Record<keyof JarHandTake, unknown>> | null;
      return (
        typeof r?.spendId === 'string' && typeof r.jarId === 'string' && typeof r.at === 'string'
      );
    };
    const taken = Array.isArray(parsed?.taken) ? parsed.taken.filter(isTake) : [];
    const declined: Record<string, string> = {};
    for (const [jar, at] of Object.entries(parsed?.declined ?? {})) {
      if (typeof at === 'string') declined[jar] = at;
    }
    return { taken, declined };
  } catch {
    return NONE;
  }
}

async function write(db: SqlDatabase, asks: JarAsks): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    JAR_ASKS_KEY,
    JSON.stringify(asks),
  ]);
}

/** A spend taken from a jar by hand: the jar is armed while that spend stands from it. */
export async function markHandTake(
  db: SqlDatabase,
  spendId: string,
  jarId: string,
  at = new Date().toISOString(),
): Promise<void> {
  const asks = await readJarAsks(db);
  const taken = [...asks.taken.filter((t) => t.spendId !== spendId), { spendId, jarId, at }];
  await write(db, { ...asks, taken: taken.slice(-MAX_TAKES) });
}

/** "No, count it today": the jar is not asked about again until a spend is taken from it by hand. */
export async function markDeclined(
  db: SqlDatabase,
  jarId: string,
  at = new Date().toISOString(),
): Promise<void> {
  const asks = await readJarAsks(db);
  await write(db, { ...asks, declined: { ...asks.declined, [jarId]: at } });
}
