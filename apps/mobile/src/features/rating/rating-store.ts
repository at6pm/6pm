import { z } from 'zod';

import type { RatingHistory } from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';

/** The settings key holding every rating ask 6pm made on this phone. */
export const RATING_ASKED_KEY = 'rating.asked';

/** Asks kept at most: years of them, more than the spacing ever reads. */
const KEEP = 12;

const NEVER: RatingHistory = { asks: [], firstCatchAsked: false };

const historySchema = z.object({
  asks: z.array(z.string().min(1)),
  firstCatchAsked: z.boolean(),
});
/** Kept before asks were counted: the last ask and its app version. */
const lastAskSchema = z.object({ at: z.string().min(1), version: z.string().min(1) });

/**
 * The rating asks so far, kept on this phone only (not in the backup: Apple counts asks per
 * device). One kept as a single last ask reads as that one ask. A damaged setting reads as never
 * asked; the system's own yearly cap still holds.
 */
export async function readRatingHistory(db: SqlDatabase): Promise<RatingHistory> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    RATING_ASKED_KEY,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return NEVER;
  try {
    const value: unknown = JSON.parse(raw);
    const history = historySchema.safeParse(value);
    if (history.success) return history.data;
    const last = lastAskSchema.safeParse(value);
    return last.success ? { asks: [last.data.at], firstCatchAsked: false } : NEVER;
  } catch {
    return NEVER;
  }
}

/** Remembers that 6pm asked for a rating at `at`, and whether it was the first catch's ask. */
export async function recordRatingAsked(
  db: SqlDatabase,
  at: string,
  firstCatch: boolean,
): Promise<void> {
  const kept = await readRatingHistory(db);
  const next: RatingHistory = {
    asks: [...kept.asks, at].slice(-KEEP),
    firstCatchAsked: kept.firstCatchAsked || firstCatch,
  };
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    RATING_ASKED_KEY,
    JSON.stringify(next),
  ]);
}
