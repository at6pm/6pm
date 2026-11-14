import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';

import { closedInsideNumber, shouldAskForRating } from '@6pm/domain';

import type { FinishedClose, FollowUp } from '../close/close-follow-up';
import { readRatingAsked, recordRatingAsked } from './rating-store';

function failed(error: unknown): null {
  // A rating prompt never surfaces an error: a failed ask is only a missed ask.
  if (__DEV__) console.warn('Asking for a rating failed', error);
  return null;
}

async function decide({ db, number, closedDays }: FinishedClose): Promise<FollowUp | null> {
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
 * Decides, as a finished close leaves, whether to ask for a store rating. The ask it resolves to
 * is held by the close's follow-up until the screen beneath has finished appearing, so the
 * system prompt comes up over a still screen.
 */
export function ratingAskFor(close: FinishedClose): Promise<FollowUp | null> {
  return decide(close).catch(failed);
}
