import * as Sentry from '@sentry/react-native';
import { useEffect, useMemo, useState } from 'react';

import type { DailyNumber, LocalDate } from '@6pm/domain';

import { readDayNumber } from '../../data/diary-queries';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { closingNumberOf, withDayClosed } from '../../data/takings-preview';

/**
 * The daily number of the day being closed, counted as closed (`withDayClosed`): what its work kept
 * has landed, so the receipt and the reveal say what Today's takings just promised. Normally that
 * is today's number. A close that ran past 04:00 is still closing the day before, whose number is
 * worked out from that day alone, so its receipt and the reveal show what that day was and not the
 * new day's fresh line.
 */
export function useClosingNumber(closing: LocalDate): DailyNumber | null {
  const store = useMoneyStore();
  const snap = useMoney();
  const today = useMemo(() => closingNumberOf(snap, closing), [snap, closing]);
  const [past, setPast] = useState<DailyNumber | null>(null);
  const crossed = snap.today !== closing;

  useEffect(() => {
    if (!crossed) return;
    let live = true;
    readDayNumber(store, withDayClosed(snap, closing), closing).then(
      (number) => {
        if (live) setPast(number);
      },
      (error: unknown) => Sentry.captureException(error),
    );
    return () => {
      live = false;
    };
  }, [store, snap, closing, crossed]);

  return crossed ? past : today;
}
