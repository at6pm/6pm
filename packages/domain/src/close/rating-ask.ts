import type { DailyNumber } from '../plan/daily-number';

/** Closed days in the person's history, the one just closed included, before 6pm ever asks. */
export const RATING_ASK_FROM_CLOSED_DAYS = 3;

/** Days between two asks, whatever the version. */
export const RATING_ASK_GAP_DAYS = 120;

const GAP_MS = RATING_ASK_GAP_DAYS * 24 * 60 * 60 * 1000;

/**
 * The day just closed ended inside its number: no more counted than its line, in a cycle that
 * still has free money. A day in an overspent cycle never counts as a good one.
 */
export function closedInsideNumber(
  day: Pick<DailyNumber, 'spent' | 'line' | 'overspent'>,
): boolean {
  return !day.overspent && day.spent <= day.line;
}

export interface RatingAskInput {
  /** Days ever closed, the one just closed included. */
  readonly closedDays: number;
  /** The day just closed ended inside its number (see `closedInsideNumber`). */
  readonly dayWithinNumber: boolean;
  /** When 6pm last asked, as an ISO instant; null when it never has. */
  readonly lastAskedAt: string | null;
  /** The app version 6pm last asked in; null when it never has. */
  readonly lastAskedVersion: string | null;
  /** The running app's version (`CFBundleShortVersionString`); null when it cannot be read. */
  readonly version: string | null;
  readonly now: Date;
}

/**
 * Whether the close just finished may ask for a store rating: only after a day that ended inside
 * its number, from the third closed day on, at most once per app version and never within 120
 * days of the last ask. A version that cannot be read, or a last ask that cannot be read or sits
 * in the future (the clock moved back), never asks: a missed ask costs nothing, a repeat does.
 */
export function shouldAskForRating(input: RatingAskInput): boolean {
  if (!input.dayWithinNumber) return false;
  if (input.closedDays < RATING_ASK_FROM_CLOSED_DAYS) return false;
  if (input.version === null || input.version === '') return false;
  if (input.lastAskedVersion === input.version) return false;
  if (input.lastAskedAt === null) return true;
  const last = Date.parse(input.lastAskedAt);
  if (!Number.isFinite(last)) return false;
  const since = input.now.getTime() - last;
  return since >= GAP_MS;
}
