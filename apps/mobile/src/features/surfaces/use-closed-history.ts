import * as Sentry from '@sentry/react-native';
import { useEffect, useState } from 'react';

import { addDays, type ClosedDayRow, type LocalDate } from '@6pm/domain';

import { readClosedBetween, readFirstDay } from '../../data/diary-queries';
import { useMoney, useMoneyStore } from '../../data/money-provider';

/** How far back the streak is counted: more evenings than anyone closes in a row in a year. */
const STREAK_REACH_DAYS = 400;

export interface ClosedHistory {
  readonly closed: readonly ClosedDayRow[];
  /** The first day 6pm has anything for. */
  readonly since: LocalDate | null;
}

/**
 * The closed days the widgets' streak counts back through, further than the money snapshot holds
 * (it keeps this pay cycle, week and month), and the first day 6pm has anything for. Read again
 * whenever a day is closed or the money day turns; null until first read.
 */
export function useClosedHistory(): ClosedHistory | null {
  const money = useMoney();
  const store = useMoneyStore();
  const [history, setHistory] = useState<ClosedHistory | null>(null);
  const today = money.today;
  const closedKey = money.closedDays.map((d) => `${d.day}@${d.closedAt}`).join(',');
  useEffect(() => {
    let live = true;
    Promise.all([
      readClosedBetween(store, addDays(today, -STREAK_REACH_DAYS), today),
      readFirstDay(store),
    ])
      .then(([closed, since]) => {
        if (live) setHistory({ closed, since });
      })
      .catch((error: unknown) => Sentry.captureException(error));
    return () => {
      live = false;
    };
  }, [store, today, closedKey]);
  return history;
}
