import { z } from 'zod';

import type { SqlDatabase } from '../../data/table';

/** The settings key holding when and in which version 6pm last asked for a rating. */
export const RATING_ASKED_KEY = 'rating.asked';

export interface RatingAsked {
  /** ISO instant of the last ask; null when 6pm never asked. */
  readonly at: string | null;
  /** The app version of the last ask; null when 6pm never asked. */
  readonly version: string | null;
}

const NEVER: RatingAsked = { at: null, version: null };

const askedSchema = z.object({ at: z.string().min(1), version: z.string().min(1) });

/**
 * The last rating ask, kept on this phone only (not in the backup: Apple counts asks per device).
 * A damaged setting reads as never asked; the system's own yearly cap still holds.
 */
export async function readRatingAsked(db: SqlDatabase): Promise<RatingAsked> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    RATING_ASKED_KEY,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return NEVER;
  try {
    const parsed = askedSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : NEVER;
  } catch {
    return NEVER;
  }
}

/** Remembers that 6pm asked for a rating at `at` in `version`. */
export async function recordRatingAsked(
  db: SqlDatabase,
  at: string,
  version: string,
): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    RATING_ASKED_KEY,
    JSON.stringify({ at, version }),
  ]);
}
