import type { LocalDate } from '@6pm/domain';

import type { SqlDatabase } from './table';

/**
 * The settings key holding the Tết jar offer's state on this phone: the day "Later" put Today's
 * card away until, and the season (mùng 1's year) whose offer onboarding already opened. Kept on
 * the phone only, never in the backup: a restored phone may be offered the jar again.
 */
export const SEASON_OFFER_KEY = 'seasonOffer';

export interface SeasonOfferState {
  readonly laterUntil: LocalDate | null;
  readonly onboardingShown: number | null;
}

const NONE: SeasonOfferState = { laterUntil: null, onboardingShown: null };

export async function readSeasonOffer(db: SqlDatabase): Promise<SeasonOfferState> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    SEASON_OFFER_KEY,
  ]);
  try {
    const parsed = JSON.parse(rows[0]?.value ?? 'null') as Partial<
      Record<keyof SeasonOfferState, unknown>
    > | null;
    return {
      laterUntil:
        typeof parsed?.laterUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.laterUntil)
          ? parsed.laterUntil
          : null,
      onboardingShown: typeof parsed?.onboardingShown === 'number' ? parsed.onboardingShown : null,
    };
  } catch {
    return NONE;
  }
}

export async function writeSeasonOffer(
  db: SqlDatabase,
  patch: Partial<SeasonOfferState>,
): Promise<SeasonOfferState> {
  const next = { ...(await readSeasonOffer(db)), ...patch };
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    SEASON_OFFER_KEY,
    JSON.stringify(next),
  ]);
  return next;
}
