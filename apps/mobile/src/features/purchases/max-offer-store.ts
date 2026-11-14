import { z } from 'zod';

import type { MaxOfferKind } from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';

/** The settings key holding when 6pm showed Max, and the backup, after a close. */
export const MAX_OFFERED_KEY = 'max.offered';

/** When each offer was made, as an ISO instant; null when it never was. */
export type MaxOffered = Readonly<Record<MaxOfferKind, string | null>>;

const NEVER: MaxOffered = { max: null, backup: null };

const offeredSchema = z.object({
  max: z.string().min(1).nullable(),
  backup: z.string().min(1).nullable(),
});

/**
 * The offers made on this phone, kept on this phone only (not in the backup: whoever restores one
 * is a member). A setting that is there but cannot be read counts as both made: a missed offer
 * costs nothing, a repeat does.
 */
export async function readMaxOffered(db: SqlDatabase): Promise<MaxOffered> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    MAX_OFFERED_KEY,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return NEVER;
  const unread = new Date(0).toISOString();
  try {
    const parsed = offeredSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { max: unread, backup: unread };
  } catch {
    return { max: unread, backup: unread };
  }
}

/** Remembers that 6pm made `kind` of offer at `at`. */
export async function recordMaxOffered(
  db: SqlDatabase,
  kind: MaxOfferKind,
  at: string,
): Promise<void> {
  const offered = { ...(await readMaxOffered(db)), [kind]: at };
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    MAX_OFFERED_KEY,
    JSON.stringify(offered),
  ]);
}
