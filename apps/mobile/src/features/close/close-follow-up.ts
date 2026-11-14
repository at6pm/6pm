import type { DailyNumber } from '@6pm/domain';

import type { SqlDatabase } from '../../data/table';

/**
 * How long a decided follow-up waits for the screen under the Close to finish appearing. The fade
 * out takes a fraction of this; past it the moment has gone (the Close was left over a screen that
 * never reappeared), so the follow-up is dropped rather than shown later, out of context.
 */
const FRESH_MS = 3000;

/** The one thing a finished close brings up once it has left: a rating prompt, or Max. */
export type FollowUp = () => Promise<void>;

/** What a follow-up is decided from: the close that just finished. */
export interface FinishedClose {
  readonly db: SqlDatabase;
  /** The day just closed, as the close filed it. */
  readonly number: Pick<DailyNumber, 'spent' | 'line' | 'overspent'>;
  /** Days ever closed, the one just closed included. */
  readonly closedDays: () => Promise<number>;
}

/** The follow-up a finished close decided on, waiting for the Close to finish leaving. */
let pending: { readonly decided: Promise<FollowUp | null>; readonly at: number } | null = null;

function failed(error: unknown): void {
  // A follow-up never surfaces an error: one that fails is only one that was missed.
  if (__DEV__) console.warn('The follow-up to a close failed', error);
}

/**
 * Called as a finished close leaves, with the decision already under way: holds what it decides
 * until `closeFollowUpSettled` says the screen beneath has finished appearing. One at a time.
 */
export function followUpAfterClose(decided: Promise<FollowUp | null>): void {
  pending = { decided, at: Date.now() };
}

/**
 * A screen finished appearing: a close that just left brings its follow-up now, with no
 * transition under way, so it comes up over a still screen.
 */
export function closeFollowUpSettled(): void {
  const waiting = pending;
  pending = null;
  if (waiting === null || Date.now() - waiting.at > FRESH_MS) return;
  void waiting.decided.then((followUp) => followUp?.()).catch(failed);
}
