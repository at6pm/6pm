import { isSelfRunningSource } from '../capture/capture-health';
import type { DailyNumber } from '../plan/daily-number';
import type { SpendSource } from '../spend/spend';

/** A first catch still counts as just seen when Today shows it within this many days. */
export const RATING_FIRST_CATCH_FRESH_DAYS = 3;

/** Closed days in the person's history, the one just closed included, before a close asks. */
export const RATING_ASK_FROM_CLOSED_DAYS = 7;

/** Days after the first ask before the second: room for the first closed week to ask once. */
export const RATING_SECOND_ASK_GAP_DAYS = 7;

/** Days between asks from the second on. */
export const RATING_ASK_GAP_DAYS = 120;

/** Asks in any 365 days, at most: the system's own yearly cap, held on our side too. */
export const RATING_ASKS_PER_YEAR = 3;

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;

/**
 * The day just closed ended inside its number: no more counted than its line, in a cycle that
 * still has free money. A day in an overspent cycle never counts as a good one.
 */
export function closedInsideNumber(
  day: Pick<DailyNumber, 'spent' | 'line' | 'overspent'>,
): boolean {
  return !day.overspent && day.spent <= day.line;
}

/** Every store rating ask made on this phone. */
export interface RatingHistory {
  /** When 6pm asked, as ISO instants, oldest first; empty when it never has. */
  readonly asks: readonly string[];
  /** One of those asks was the first catch's. */
  readonly firstCatchAsked: boolean;
}

/**
 * Today as the person sees it while a first catch could ask: `settled` when nothing is over it,
 * the app is in front, Today is the page on show, and it was reached by opening 6pm (or by leaving
 * the wait for a first catch that just caught one); `covered` when a sheet, a screen, a system
 * window or another page is up, or the app is away; `interrupted` when it was come back to from
 * anything else (onboarding, a close, a paywall, a flow left half-way, an error).
 */
export type TodayView = 'settled' | 'covered' | 'interrupted';

/**
 * Whether the asks so far leave room for one more now: at most three in any 365 days, a week
 * after the first and 120 days after any later one. An ask that cannot be read, or one in the
 * future (the clock moved back), holds every ask back: a missed ask costs nothing, a repeat does.
 */
export function ratingSpacingAllows(history: RatingHistory, now: Date): boolean {
  const times = history.asks.map((at) => Date.parse(at));
  if (times.some((t) => !Number.isFinite(t) || t > now.getTime())) return false;
  const inYear = times.filter((t) => now.getTime() - t < YEAR_MS).length;
  if (inYear >= RATING_ASKS_PER_YEAR) return false;
  if (times.length === 0) return true;
  const last = Math.max(...times);
  const gap = times.length === 1 ? RATING_SECOND_ASK_GAP_DAYS : RATING_ASK_GAP_DAYS;
  return now.getTime() - last >= gap * DAY_MS;
}

export interface FirstCatchRatingInput {
  /**
   * The first spend a way that runs by itself caught, or null while none has: what made it, when
   * it arrived, and whether it was taken back since.
   */
  readonly firstCatch: {
    readonly source: SpendSource;
    readonly at: string;
    readonly deleted: boolean;
  } | null;
  readonly today: TodayView;
  readonly history: RatingHistory;
  readonly now: Date;
}

/**
 * Whether Today, showing the first spend a way that runs by itself caught (a bank or wallet
 * alert, a Wallet tap, a forwarded email), asks for a store rating: once in the life of the
 * phone, only while Today is settled, and only while that catch is fresh (three days), so a catch
 * from long ago is never mistaken for a first one. A typed, spoken, shared or scanned spend never
 * asks, nor a catch taken back (it may have been read wrong).
 */
export function ratingAtFirstCatch(input: FirstCatchRatingInput): boolean {
  const { firstCatch, today, history, now } = input;
  if (firstCatch === null || firstCatch.deleted || !isSelfRunningSource(firstCatch.source)) {
    return false;
  }
  if (today !== 'settled' || history.firstCatchAsked) return false;
  const at = Date.parse(firstCatch.at);
  if (!Number.isFinite(at)) return false;
  const age = now.getTime() - at;
  if (age < 0 || age > RATING_FIRST_CATCH_FRESH_DAYS * DAY_MS) return false;
  return ratingSpacingAllows(history, now);
}

export interface CloseRatingInput {
  /** Days ever closed, the one just closed included. */
  readonly closedDays: number;
  /** The day just closed ended inside its number (see `closedInsideNumber`). */
  readonly dayWithinNumber: boolean;
  readonly history: RatingHistory;
  readonly now: Date;
}

/**
 * Whether the close just finished asks for a store rating: only after a day that ended inside its
 * number, from the seventh closed day on (a closed week), as the asks so far allow. A close that
 * brings up Max asks nothing: the caller offers Max first.
 */
export function ratingAfterClose(input: CloseRatingInput): boolean {
  if (!input.dayWithinNumber) return false;
  if (input.closedDays < RATING_ASK_FROM_CLOSED_DAYS) return false;
  return ratingSpacingAllows(input.history, input.now);
}
