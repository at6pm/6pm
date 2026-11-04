import type { CustomerState } from '../purchases/purchases-port';

/**
 * Developer tool: Max held on a development build whatever the store says (a slimmed simulator
 * has no store, and its answer would take a kept Max away). Never read outside `__DEV__`.
 */
export const DEV_MAX_KEY = 'devMax';

export const DEV_MAX = {
  active: true,
  plan: 'yearly',
  inTrial: false,
  trialEndsAt: null,
  renewsAt: null,
  endsAt: null,
  willRenew: true,
} as const;

/** The customer as a development build shows it: with Max while the key is on. */
export function withDevMax(customer: CustomerState, on: boolean): CustomerState {
  return __DEV__ && on ? { ...customer, max: DEV_MAX } : customer;
}
