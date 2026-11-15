import { foldWords } from '../capture/fold-words';
import type { Money } from '../money/currency';
import type { LocalDate } from '../time/local-date';
import { HELD_BACK_SHARE } from './requests';

/**
 * Tax a client held back from a payment. The money in is what landed, and that is all the plan
 * ever counts; what was held back rides on it (`heldBack`), so the year counts what was billed:
 * landed plus held back. Whether the client's certificate for it has come is a mark on the money
 * in, inked with the day it came.
 */

/** How held back is said on a money in: nothing, a tenth of the bill, or an amount typed. */
export type HeldBackChoice =
  | { readonly kind: 'nothing' }
  | { readonly kind: 'tenth' }
  | { readonly kind: 'typed'; readonly amount: Money };

/**
 * What a tenth held back was, worked backwards from what landed: the bill less a tenth is what
 * landed, so a tenth of the bill is a ninth of what landed (18.000.000 landed: 2.000.000 held,
 * 20.000.000 billed). Whole đồng.
 */
export function tenthHeldBack(landed: Money): Money {
  if (landed <= 0) return 0;
  return Math.round((landed * HELD_BACK_SHARE) / (1 - HELD_BACK_SHARE));
}

/** The amount held back a choice says, for money in that landed as `landed`. */
export function heldBackFor(landed: Money, choice: HeldBackChoice): Money {
  if (choice.kind === 'nothing') return 0;
  if (choice.kind === 'tenth') return tenthHeldBack(landed);
  return Number.isSafeInteger(choice.amount) && choice.amount > 0 ? choice.amount : 0;
}

/** The choice an amount held back reads as, for the switch: a tenth when it is exactly that. */
export function heldBackChoiceOf(
  landed: Money,
  heldBack: Money | null | undefined,
): HeldBackChoice {
  if (heldBack == null || heldBack <= 0) return { kind: 'nothing' };
  if (heldBack === tenthHeldBack(landed)) return { kind: 'tenth' };
  return { kind: 'typed', amount: heldBack };
}

/** The three lines a money in with tax held back shows: billed, held back, landed. */
export interface HeldBackLines {
  readonly billed: Money;
  readonly heldBack: Money;
  readonly landed: Money;
}

export function heldBackLines(landed: Money, heldBack: Money | null | undefined): HeldBackLines {
  const held = Math.max(0, heldBack ?? 0);
  return { billed: landed + held, heldBack: held, landed };
}

/**
 * Whether a transfer's words say tax was taken (TNCN, thuế): the close offers "Tax held back?
 * Add 10%" the first time such a sender is seen.
 */
export function namesHeldBack(words: readonly (string | null | undefined)[]): boolean {
  const text = foldWords(words.filter(Boolean).join(' '));
  return / tncn /.test(text) || / thue /.test(text);
}

/** Where a certificate stands on money in: nothing held, still to come, or come on a day. */
export type CertificateMark =
  | { readonly kind: 'none' }
  | { readonly kind: 'waiting' }
  | { readonly kind: 'arrived'; readonly on: LocalDate | null };

export function certificateOf(row: {
  readonly heldBack?: Money | null | undefined;
  readonly certificate?: boolean | null | undefined;
  readonly certificateOn?: LocalDate | null | undefined;
}): CertificateMark {
  if ((row.heldBack ?? 0) <= 0) return { kind: 'none' };
  if (row.certificate === true) return { kind: 'arrived', on: row.certificateOn ?? null };
  return { kind: 'waiting' };
}

/** One tap on the certificate stamp: inked with today's date, or lifted again. */
export function toggleCertificate(
  row: { readonly certificate?: boolean | null | undefined },
  today: LocalDate,
): { readonly certificate: boolean; readonly certificateOn: LocalDate | null } {
  return row.certificate === true
    ? { certificate: false, certificateOn: null }
    : { certificate: true, certificateOn: today };
}

/**
 * The share a sender is remembered holding back, as whole percent (10), from the amount held back
 * on money that landed: a tenth is remembered, anything else forgets it (null), so the next payment
 * arrives with "10%" set only when that is what this client does.
 */
export function heldBackShareOf(landed: Money, heldBack: Money | null | undefined): number | null {
  if (heldBack == null || heldBack <= 0) return null;
  return heldBack === tenthHeldBack(landed) ? Math.round(HELD_BACK_SHARE * 100) : null;
}

/** What a sender remembered holding back keeps from money that landed: their share, worked back. */
export function heldBackRemembered(landed: Money, share: number | null | undefined): Money {
  if (share == null || share <= 0 || share >= 100) return 0;
  return Math.round((landed * share) / (100 - share));
}
