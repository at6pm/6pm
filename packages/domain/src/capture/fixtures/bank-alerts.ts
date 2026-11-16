import { currencyOf } from '../../money/currency';
import { readBankAlert, type BankAlert, type BankAlertInput } from '../bank-alert';

/**
 * What the bank alert tests share. Alerts are written for the tests as each bank and wallet
 * prints its balance changes: every account number, name and code is made up.
 */

/** Alerts print the phone's local time; the expected instant is built the same way. */
export const local = (d: number, h: number, m: number, s = 0) =>
  new Date(2026, 9, d, h, m, s).toISOString();

/** Money that moved, with only what the alert says beyond its way and amount. */
export const moved = (
  direction: 'in' | 'out',
  amount: number,
  more: Partial<Extract<BankAlert, { kind: 'moved' }>> = {},
): BankAlert => ({
  kind: 'moved',
  direction,
  amount,
  currency: 'VND',
  counterparty: null,
  memo: null,
  at: null,
  bank: null,
  ...more,
});

/** An alert read on a phone counting in `home`. */
export const read = (input: BankAlertInput | string, home = 'VND') =>
  readBankAlert(typeof input === 'string' ? { body: input } : input, currencyOf(home));
