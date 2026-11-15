import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

import type { DailyNumber } from '@6pm/domain';

import { readDayNumber } from '../../data/diary-queries';
import { useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { haptics } from '../../ui/haptics';
import { maxOfferFor } from '../purchases/max-offer';
import { usePurchases } from '../purchases/purchases-provider';
import { ratingAskFor } from '../rating/rating-ask';
import { followUpAfterClose, type FinishedClose } from './close-follow-up';
import type { useClose } from './use-close';

/**
 * Closes the day and leaves the Close: from the reveal's Done, or by folding the iPhone Duo shut.
 * Runs once; a failed save lets it be tried again. A good close may then bring up one thing, once
 * the Close has finished leaving: Max, the two times it is offered unasked, or else the store's
 * rating prompt.
 */
export function useFinishClose(close: ReturnType<typeof useClose>, day: DailyNumber | null) {
  const router = useRouter();
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const { customer, port } = usePurchases();
  const member = customer.max.active;
  const storeOpen = port.available;
  const finishing = useRef(false);
  const { run, settle } = close;
  const closing = close.day;

  return useCallback(async () => {
    if (finishing.current || !day) return;
    finishing.current = true;
    let filed: DailyNumber = day;
    const saved = await run(async () => {
      // Worked out for the closed day itself, with the cash just added, so a close that crossed
      // 04:00 still files that day's receipt.
      const number = (await readDayNumber(store, store.getSnapshot(), closing)) ?? day;
      filed = number;
      await actions.closeDay({
        day: closing,
        closedAt: new Date().toISOString(),
        late: false,
        spent: number.spent,
        line: number.line,
        tomorrow: number.tomorrow,
        note: null,
      });
    });
    if (!saved) {
      finishing.current = false;
      return;
    }
    settle();
    haptics.success();
    const finished: FinishedClose = {
      db: store.db,
      number: filed,
      closedDays: async () => (await actions.closedBefore(closing)) + 1,
    };
    const serious = store.getSnapshot().plan?.serious ?? false;
    followUpAfterClose(
      maxOfferFor({ ...finished, member, storeOpen, serious }).then(
        (offer) => offer ?? ratingAskFor(finished),
      ),
    );
    router.back();
  }, [day, run, settle, closing, store, actions, router, member, storeOpen]);
}
