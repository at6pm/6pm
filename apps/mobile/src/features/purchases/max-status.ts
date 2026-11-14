import type { MaxState } from './purchases-port';

/**
 * The one thing worth telling a Max customer about their plan: a date and what it is the date of,
 * or that Max was bought once and has none.
 */
export type MaxStatus =
  | {
      readonly kind: 'trialEnds' | 'renews' | 'ends';
      /** Epoch milliseconds, from the store. */
      readonly at: number;
    }
  | { readonly kind: 'forGood' };

/**
 * Max bought once is the customer's for good. Otherwise: while a trial runs, when it ends (that
 * is when the first charge is made); then when the plan renews; or, once cancelled, when Max runs
 * out. Null when Max is off or the store gave no date.
 */
export function maxStatus(max: MaxState): MaxStatus | null {
  if (!max.active) return null;
  if (max.plan === 'lifetime') return { kind: 'forGood' };
  if (max.inTrial && max.trialEndsAt !== null) return { kind: 'trialEnds', at: max.trialEndsAt };
  if (max.renewsAt !== null) return { kind: 'renews', at: max.renewsAt };
  if (max.endsAt !== null) return { kind: 'ends', at: max.endsAt };
  return null;
}
