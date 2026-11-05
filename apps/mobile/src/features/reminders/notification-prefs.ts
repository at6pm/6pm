import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { useMoneyStore } from '../../data/money-provider';
import {
  readNotificationSettings,
  writeNotificationSettings,
  type NotificationSettings,
} from '../../data/notification-settings';

// The switches as last read, shared so Settings and the scheduler move together the moment one
// changes. Null until the first read.
let known: NotificationSettings | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const publish = (next: NotificationSettings) => {
  known = next;
  for (const listener of listeners) listener();
};

/**
 * Settings › Your day › Notifications: each kind's switch and amounts on the lock screen, read
 * once per launch and kept on this phone. `settings` is null until read.
 */
export function useNotificationSettings(): {
  readonly settings: NotificationSettings | null;
  readonly update: (patch: Partial<NotificationSettings>) => void;
} {
  const store = useMoneyStore();
  const settings = useSyncExternalStore(subscribe, () => known);
  useEffect(() => {
    if (known !== null) return;
    void readNotificationSettings(store.db)
      .then(publish)
      .catch(() => undefined);
  }, [store]);
  const update = useCallback(
    (patch: Partial<NotificationSettings>) => {
      if (known === null) return;
      const next = { ...known, ...patch, on: { ...known.on, ...patch.on } };
      publish(next);
      void writeNotificationSettings(store, next).catch(() => undefined);
    },
    [store],
  );
  return { settings, update };
}

/** Reads the switches again: after Delete all data, which takes them with everything else. */
export async function reloadNotificationSettings(
  db: Parameters<typeof readNotificationSettings>[0],
): Promise<void> {
  publish(await readNotificationSettings(db));
}
