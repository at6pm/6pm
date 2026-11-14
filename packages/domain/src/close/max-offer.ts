/** Closed days, the one just closed included, before 6pm first shows Max without being asked. */
export const MAX_OFFER_FROM_CLOSED_DAYS = 3;

/** Closed days before 6pm offers the backup: a week of days that live on this phone only. */
export const BACKUP_OFFER_FROM_CLOSED_DAYS = 7;

/** Days the backup offer waits after the Max one, however many days are already closed. */
export const MAX_OFFER_GAP_DAYS = 3;

const GAP_MS = MAX_OFFER_GAP_DAYS * 24 * 60 * 60 * 1000;

/** What a finished close may show: Max as a whole, or Max for the backup. */
export type MaxOfferKind = 'max' | 'backup';

export interface MaxOfferInput {
  /** Days ever closed, the one just closed included. */
  readonly closedDays: number;
  /** The day just closed ended inside its number (see `closedInsideNumber`). */
  readonly dayWithinNumber: boolean;
  /** Max is on. A member is never offered it. */
  readonly member: boolean;
  /** Serious mode is on: nothing is sold in it. */
  readonly serious: boolean;
  /** When 6pm showed Max after a close, as an ISO instant; null when it never has. */
  readonly maxOfferedAt: string | null;
  /** When 6pm offered the backup after a close, as an ISO instant; null when it never has. */
  readonly backupOfferedAt: string | null;
  readonly now: Date;
}

/**
 * What the close just finished may offer, each once in the life of the phone: Max from the third
 * closed day on, then the backup from the seventh, three days or more after the first. Only after
 * a day that ended inside its number, never to a member and never in serious mode. A first offer
 * that cannot be read, or sits in the future (the clock moved back), holds the second one back: a
 * missed offer costs nothing, a repeat does.
 */
export function maxOfferAfterClose(input: MaxOfferInput): MaxOfferKind | null {
  if (input.member || input.serious || !input.dayWithinNumber) return null;
  if (input.maxOfferedAt === null) {
    return input.closedDays >= MAX_OFFER_FROM_CLOSED_DAYS ? 'max' : null;
  }
  if (input.backupOfferedAt !== null) return null;
  if (input.closedDays < BACKUP_OFFER_FROM_CLOSED_DAYS) return null;
  const first = Date.parse(input.maxOfferedAt);
  if (!Number.isFinite(first)) return null;
  const since = input.now.getTime() - first;
  return since >= GAP_MS ? 'backup' : null;
}
