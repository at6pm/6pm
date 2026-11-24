import { useEffect, useState } from 'react';

import { keepAlertAccessSeen, readAlertAccessSeen } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import { useAlertAccess } from '../capture-guide/alert-access';
import { useLastAlert } from '../capture-guide/last-alert';

export interface PausedSigns {
  /** Android's Notification access for 6pm; null where alerts do not come through a listener. */
  readonly access: boolean | null;
  /** Access was seen switched on once, on this phone or the one restored from. */
  readonly seenOn: boolean;
  /** The listener has read a bank alert, caught or skipped. */
  readonly alertRead: boolean;
  /** Today's first-catch reminder is up: it already asks for the set-up. */
  readonly reminderUp: boolean;
}

/**
 * Whether Today says bank alerts are paused: Notification access is off on an Android that had
 * bank alerts set up (access was on once, or an alert was read). Never to someone who never set
 * them up, and not while the first-catch reminder is asking for the set-up anyway.
 */
export function alertsPaused(signs: PausedSigns): boolean {
  return signs.access === false && (signs.seenOn || signs.alertRead) && !signs.reminderUp;
}

/**
 * The signs for `alertsPaused` as the phone has them, read when Today opens and each time the app
 * comes back (access is switched in Android's settings). Access seen on is kept the first time.
 */
export function useAlertsPausedSigns(): Omit<PausedSigns, 'reminderUp'> {
  const store = useMoneyStore();
  const access = useAlertAccess();
  const alertRead = useLastAlert() !== null;
  const [seenOn, setSeenOn] = useState(false);
  useEffect(() => {
    let live = true;
    if (access === true) {
      setSeenOn(true);
      keepAlertAccessSeen(store.db, new Date().toISOString()).catch(() => undefined);
    } else if (access === false) {
      readAlertAccessSeen(store.db)
        .then((at) => {
          if (live) setSeenOn(at !== null);
        })
        .catch(() => undefined);
    }
    return () => {
      live = false;
    };
  }, [store, access]);
  return { access, seenOn, alertRead };
}
