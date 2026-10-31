import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';

import { closedInsideNumber, shouldAskForRating, type DailyNumber } from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';
import { readRatingAsked, recordRatingAsked } from './rating-store';

/**
 * How long a decided ask waits for the screen under the Close to finish appearing. The fade out
 * takes a fraction of this; past it the moment has gone (the Close was left over a screen that
 * never reappeared), so the ask is dropped rather than shown later, out of context.
 */
const FRESH_MS = 3000;

type Ask = () => Promise<void>;

/** The ask a finished close decided on, waiting for the Close to finish leaving. One at a time. */
let pending: { readonly ask: Promise<Ask | null>; readonly at: number } | null = null;

export interface FinishedClose {
  readonly db: SqlDatabase;
  /** The day just closed, as the close filed it. */
  readonly number: Pick<DailyNumber, 'spent' | 'line' | 'overspent'>;
  /** Days ever closed, the one just closed included. */
  readonly closedDays: () => Promise<number>;
}

function failed(error: unknown): null {
  // A rating prompt never surfaces an error: a failed ask is only a missed ask.
  if (__DEV__) console.warn('Asking for a rating failed', error);
  return null;
}

async function decide({ db, number, closedDays }: FinishedClose): Promise<Ask | null> {
  const dayWithinNumber = closedInsideNumber(number);
  // A day that went over never asks, so nothing more is read for it.
  if (!dayWithinNumber) return null;
  const version = Application.nativeApplicationVersion;
  const [asked, closed] = await Promise.all([readRatingAsked(db), closedDays()]);
  const due = shouldAskForRating({
    closedDays: closed,
    dayWithinNumber,
    lastAskedAt: asked.at,
    lastAskedVersion: asked.version,
    version,
    now: new Date(),
  });
  // TestFlight and builds without the store have no prompt: nothing is asked, nothing recorded.
  if (!due || version === null || !(await StoreReview.isAvailableAsync())) return null;
  return async () => {
    // Recorded first: whatever the system does with the request, this version has asked.
    await recordRatingAsked(db, new Date().toISOString(), version);
    await StoreReview.requestReview();
  };
}

/**
 * Called as a finished close leaves: decides now whether to ask for a store rating, and holds
 * the ask until `ratingAskSettled` says the screen beneath has finished appearing.
 */
export function askForRatingAfterClose(close: FinishedClose): void {
  pending = { ask: decide(close).catch(failed), at: Date.now() };
}

/**
 * A screen finished appearing: a close that just left asks now, with no transition under way.
 * The system prompt then comes up over a still screen.
 */
export function ratingAskSettled(): void {
  const waiting = pending;
  pending = null;
  if (waiting === null || Date.now() - waiting.at > FRESH_MS) return;
  void waiting.ask.then((ask) => ask?.()).catch(failed);
}
