import { router } from 'expo-router';

import { closedInsideNumber, maxOfferAfterClose } from '@6pm/domain';

import type { FinishedClose, FollowUp } from '../close/close-follow-up';
import { readMaxOffered, recordMaxOffered } from './max-offer-store';

export interface CloseForOffer extends FinishedClose {
  /** Max is on for this customer. */
  readonly member: boolean;
  /** The store can be asked on this phone; where it cannot, there is nothing to offer. */
  readonly storeOpen: boolean;
  readonly serious: boolean;
}

function failed(error: unknown): null {
  // An offer never surfaces an error: one that fails is only one that was not made.
  if (__DEV__) console.warn('Offering Max after a close failed', error);
  return null;
}

async function decide(close: CloseForOffer): Promise<FollowUp | null> {
  const { db, number, member, storeOpen, serious } = close;
  const dayWithinNumber = closedInsideNumber(number);
  // Most closes offer nothing, so nothing more is read for them.
  if (member || serious || !storeOpen || !dayWithinNumber) return null;
  const [offered, closedDays] = await Promise.all([readMaxOffered(db), close.closedDays()]);
  const kind = maxOfferAfterClose({
    closedDays,
    dayWithinNumber,
    member,
    serious,
    maxOfferedAt: offered.max,
    backupOfferedAt: offered.backup,
    now: new Date(),
  });
  if (kind === null) return null;
  return async () => {
    // Recorded first: whatever becomes of the sheet, this offer has been made.
    await recordMaxOffered(db, kind, new Date().toISOString());
    router.push({
      pathname: '/max',
      params: kind === 'max' ? { from: 'looks', closed: String(closedDays) } : { from: 'backup' },
    });
  };
}

/**
 * Decides, as a finished close leaves, whether it opens the Max sheet without being asked: once
 * for Max as a whole, days later once for the backup, and then never again (see
 * `maxOfferAfterClose`). The sheet closes like any other.
 */
export function maxOfferFor(close: CloseForOffer): Promise<FollowUp | null> {
  return decide(close).catch(failed);
}
