import type { BankAlertSkip } from '../bank-alert';

/**
 * Alerts of banks and wallets outside Vietnam, for the world alert tests. Each real one is the
 * wording a public source quotes, with the source's address above it; where a note says so, its
 * names, cards, accounts and amounts were changed and the wording kept. A pattern case is written
 * for the test in the shape a country's banks commonly use, because no real alert of that app or
 * country was found; pattern cases live apart (`world-alerts-patterns`) and are never passed off
 * as captured.
 */
export interface WorldAlertSample {
  /** ISO 3166-1 alpha-2: the phone counts in this country's currency. */
  readonly country: string;
  readonly app: string;
  readonly title?: string;
  readonly body: string;
  readonly reads: WorldReading;
}

/** Money that moved, in minor units of `currency`; or skipped, for a reason or any. */
export type WorldReading =
  | { readonly way: 'in' | 'out'; readonly amount: number; readonly currency: string }
  | { readonly skip: BankAlertSkip | 'any' };

export const spent = (amount: number, currency: string): WorldReading => ({
  way: 'out',
  amount,
  currency,
});

export const got = (amount: number, currency: string): WorldReading => ({
  way: 'in',
  amount,
  currency,
});

/** Not money that moved: for this reason, or for any reason when the alert is not a payment. */
export const skipped = (reason: BankAlertSkip | 'any' = 'any'): WorldReading => ({ skip: reason });
