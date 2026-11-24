import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  firstCatchEnded,
  firstCatchReminder,
  type FirstCatchReminder,
  type SpendRow,
} from '@6pm/domain';

import {
  firstCaughtSince,
  firstSelfRunningCatch,
  keepFirstCatch,
  putAwayFirstCatch,
  readFirstCatch,
  readFirstCatchAway,
} from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useAlertAccess } from '../capture-guide/alert-access';
import { useLastAlert } from '../capture-guide/last-alert';
import { nativeReach } from '../surfaces/native-reach';
import { reminderWaysOf, selfRunningSetUp, type ReminderWay } from './first-catch-ways';

/** Every spend ever made counts: nothing caught yet means nothing on this phone. */
const EVER = '1970-01-01T00:00:00.000Z';

/** Put away on the card: the companion's line on the same screen reads it again. */
let putAwayTimes = 0;
const watchers = new Set<() => void>();
const watch = (onChange: () => void) => {
  watchers.add(onChange);
  return () => {
    watchers.delete(onChange);
  };
};

export interface FirstCatchCard {
  /** What the card says today; null when it is not due, put away or over. */
  readonly reminder: FirstCatchReminder | null;
  /** The ways it is about on this phone, as its icons show them. */
  readonly ways: readonly ReminderWay[];
  /** Nothing has been caught on its own yet, by any way: the companion may say so. */
  readonly nothingYet: boolean;
  /** The first catch from a way that runs by itself, once it has landed. */
  readonly caught: SpendRow | null;
  /** "Not now": away for a week, and for good the third time. */
  readonly putAway: () => void;
}

const WAYS = reminderWaysOf(nativeReach);

/**
 * Today's reminder to let spending log itself: due from the morning after the catching step
 * ended, until a bank alert, a Wallet tap or a forwarded email catches something (a shared
 * receipt, a scanned code and a spend typed or said never end it). The first such catch is kept
 * the moment it is seen among the spends, so the reminder never comes back. Read again each time
 * the day's spends change, the app returns, or the card is put away.
 */
export function useFirstCatchCard(): FirstCatchCard {
  const store = useMoneyStore();
  const { today, plan, cycleSpends } = useMoney();
  const alertAccess = useAlertAccess();
  const alertRead = useLastAlert() !== null;
  const away = useSyncExternalStore(watch, () => putAwayTimes);
  const started = plan?.startedOn ?? null;
  const set = plan !== null;
  const [state, setState] = useState<Pick<FirstCatchCard, 'reminder' | 'nothingYet' | 'caught'>>({
    reminder: null,
    nothingYet: false,
    caught: null,
  });
  useEffect(() => {
    let live = true;
    const show = (next: typeof state) => {
      if (live) setState(next);
    };
    void (async () => {
      const kept = await readFirstCatch(store.db);
      if (!set || WAYS.length === 0 || firstCatchEnded(kept)) {
        // A catch this screen saw land stays on show while its slip prints and the card folds.
        if (live) setState((was) => ({ reminder: null, nothingYet: false, caught: was.caught }));
        return;
      }
      const caught = await firstSelfRunningCatch(store);
      if (caught !== null) {
        await keepFirstCatch(store.db, {
          source: caught.source,
          at: caught.createdAt,
          day: caught.day,
        });
        show({ reminder: null, nothingYet: false, caught });
        return;
      }
      const reminder = firstCatchReminder({
        state: kept,
        today,
        started,
        setUp: selfRunningSetUp({ walked: kept?.ways ?? [], alertAccess, alertRead }),
        away: await readFirstCatchAway(store.db),
      });
      const nothingYet = reminder !== null && (await firstCaughtSince(store, EVER)) === null;
      show({ reminder, nothingYet, caught: null });
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, today, cycleSpends, set, started, alertAccess, alertRead, away]);
  return {
    ...state,
    ways: WAYS,
    putAway: () =>
      void putAwayFirstCatch(store.db, today)
        .then(() => {
          putAwayTimes += 1;
          for (const tell of watchers) tell();
        })
        .catch(() => undefined),
  };
}
