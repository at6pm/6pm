import * as StoreReview from 'expo-store-review';

import {
  closedInsideNumber,
  ratingAfterClose,
  ratingAtFirstCatch,
  type FirstCatchRatingInput,
} from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';
import type { FinishedClose, FollowUp } from '../close/close-follow-up';
import { readRatingHistory, recordRatingAsked } from './rating-store';

function failed(error: unknown): null {
  // A rating prompt never surfaces an error: a failed ask is only a missed ask.
  if (__DEV__) console.warn('Asking for a rating failed', error);
  return null;
}

/**
 * The system's own prompt (StoreKit on iPhone, Play's in-app review on Android), with nothing of
 * ours before it and nothing offered for it. Recorded first: whatever the system does with the
 * request, the ask has been made.
 */
async function ask(db: SqlDatabase, firstCatch: boolean): Promise<void> {
  await recordRatingAsked(db, new Date().toISOString(), firstCatch);
  await StoreReview.requestReview();
}

async function decideAfterClose({
  db,
  number,
  closedDays,
}: FinishedClose): Promise<FollowUp | null> {
  const dayWithinNumber = closedInsideNumber(number);
  // A day that went over never asks, so nothing more is read for it.
  if (!dayWithinNumber) return null;
  const [history, closed] = await Promise.all([readRatingHistory(db), closedDays()]);
  const due = ratingAfterClose({ closedDays: closed, dayWithinNumber, history, now: new Date() });
  // TestFlight and builds without the store have no prompt: nothing is asked, nothing recorded.
  if (!due || !(await StoreReview.isAvailableAsync())) return null;
  return () => ask(db, false);
}

/**
 * Decides, as a finished close leaves, whether to ask for a store rating. The ask it resolves to
 * is held by the close's follow-up until the screen beneath has finished appearing, so the
 * system prompt comes up over a still screen. A close that brings up Max never gets here.
 */
export function ratingAskFor(close: FinishedClose): Promise<FollowUp | null> {
  return decideAfterClose(close).catch(failed);
}

/**
 * Asks for a store rating at the first catch from a way that runs by itself, if it is due (see
 * `ratingAtFirstCatch`) and Today is still settled once the history and the store have been read.
 * Resolves to true once the first catch's ask is behind: made now, or made before.
 */
export async function askAtFirstCatch(
  db: SqlDatabase,
  seen: Omit<FirstCatchRatingInput, 'history' | 'now'>,
  stillSettled: () => boolean,
): Promise<boolean> {
  try {
    const history = await readRatingHistory(db);
    if (history.firstCatchAsked) return true;
    if (!ratingAtFirstCatch({ ...seen, history, now: new Date() })) return false;
    if (!(await StoreReview.isAvailableAsync()) || !stillSettled()) return false;
    await ask(db, true);
    return true;
  } catch (error) {
    failed(error);
    return false;
  }
}
