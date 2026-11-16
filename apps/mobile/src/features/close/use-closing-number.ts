import * as Sentry from '@sentry/react-native';
import { useEffect, useMemo, useState } from 'react';

import type { DailyNumber, LocalDate } from '@6pm/domain';

import { readDayNumber } from '../../data/diary-queries';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { dayOf } from '../../data/money-store';
import { closingNumberOf, withDayClosed } from '../../data/takings-preview';

/**
 * The daily number of the day being closed, counted as closed (`withDayClosed`): what its work kept
 * has landed, so the receipt and the reveal say what Today's takings just promised, and the day
 * keeps the line the close found it at, whatever reaches the days during the close (that is
 * tomorrow's). Normally that is today's number. A close that ran past 04:00 is still closing the
 * day before, whose number is worked out from that day alone, so its receipt and the reveal show
 * what that day was and not the new day's fresh line.
 */
export function useClosingNumber(closing: LocalDate): DailyNumber | null {
  const store = useMoneyStore();
  const snap = useMoney();
  const crossed = snap.today !== closing;
  // The line the close found the day at, read once as it opens.
  const [found] = useState(() => (snap.today === closing ? dayOf(snap)?.line : undefined));
  const [foundPast, setFoundPast] = useState<number | undefined>(undefined);
  const line = found ?? foundPast;
  const today = useMemo(() => closingNumberOf(snap, closing, line), [snap, closing, line]);
  const [past, setPast] = useState<DailyNumber | null>(null);

  useEffect(() => {
    if (!crossed) return;
    let live = true;
    const read = async () => {
      // A close opened after 04:00 finds the day before as that day stood, still open.
      const opening = line ?? (await readDayNumber(store, snap, closing))?.line;
      if (!live) return;
      if (line === undefined && opening !== undefined) setFoundPast(opening);
      const number = await readDayNumber(store, withDayClosed(snap, closing, opening), closing);
      if (live) setPast(number);
    };
    read().catch((error: unknown) => Sentry.captureException(error));
    return () => {
      live = false;
    };
  }, [store, snap, closing, crossed, line]);

  return crossed ? past : today;
}
