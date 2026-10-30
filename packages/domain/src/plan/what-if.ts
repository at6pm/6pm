import { designAmount, VND, type Currency, type Money as Vnd } from '../money/currency';
import type { DailyNumberInput } from './daily-number';
import { whatIfDaily, whatIfOver } from './plan-river';

/** The most of the cycle's income the what-if slider reaches. */
export const WHAT_IF_SHARE = 0.8;

/** The most notches the slider has: about 6 pt of track each on a phone. */
const MOST_NOTCHES = 48;

/** The design's notch (250k), and the multiples of it a longer range moves up to. */
const STEP_LADDER = [1, 2, 4, 10, 20, 40, 100, 200, 400] as const;
const LAST_RUNG = 1000;

export interface WhatIfRange {
  /** The slider's right end, a whole number of steps. */
  readonly max: Vnd;
  /** One notch. */
  readonly step: Vnd;
}

/**
 * The what-if slider's range: Future you from 0 to 80% of the cycle's income, floored to a notch,
 * and never short of `current` (the amount already set, in onboarding or since), ceiled to one.
 * With no income known it runs to the design's 4tr. The notch is the design's 250k until that
 * would make more than 48 of them, then 500k, 1tr, 2,5tr and so on. Both scale to the home
 * currency by value ($10 notches in the US).
 */
export function whatIfRange(income: Vnd, current: Vnd, currency: Currency = VND): WhatIfRange {
  const base = designAmount(250_000, currency);
  const set = Number.isFinite(current) ? Math.max(0, current) : 0;
  const cap = Number.isFinite(income) && income > 0 ? income * WHAT_IF_SHARE : 0;
  const reach = Math.max(cap > 0 ? cap : designAmount(4_000_000, currency), set);
  const step =
    STEP_LADDER.map((n) => n * base).find((s) => reach / s <= MOST_NOTCHES) ?? LAST_RUNG * base;
  const end = cap > 0 ? Math.floor(cap / step) * step : designAmount(4_000_000, currency);
  return { max: Math.max(step, end, Math.ceil(set / step) * step), step };
}

/**
 * What the slider's note says about moving Future you from `baseline` to `candidate`:
 * - `same`: nothing moved;
 * - `atPayday`: this cycle sets nothing aside for Future you, so no day changes until payday;
 * - `moreOver` / `lessOver`: the cycle would be `over` past its plan, where every day is already
 *   nothing and the daily change would read "0 a day";
 * - `more` / `less`: what each day until payday loses or gains (`daily`).
 * `amount` is how far Future you moved.
 */
export type WhatIfNote =
  | { readonly kind: 'same' }
  | { readonly kind: 'atPayday'; readonly amount: Vnd }
  | { readonly kind: 'moreOver' | 'lessOver'; readonly amount: Vnd; readonly over: Vnd }
  | { readonly kind: 'more' | 'less'; readonly amount: Vnd; readonly daily: Vnd };

export function whatIfNote(input: DailyNumberInput, baseline: Vnd, candidate: Vnd): WhatIfNote {
  const amount = Math.abs(candidate - baseline);
  if (amount === 0) return { kind: 'same' };
  if (input.futureYouSkipped === true) return { kind: 'atPayday', amount };
  const more = candidate > baseline;
  const over = whatIfOver(input, candidate);
  if (over > 0) return { kind: more ? 'moreOver' : 'lessOver', amount, over };
  const daily = Math.abs(whatIfDaily(input, candidate) - whatIfDaily(input, baseline));
  return { kind: more ? 'more' : 'less', amount, daily };
}
