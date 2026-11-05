import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { useMoneyStore } from '../../data/money-provider';
import { readWidgetPrivacy, writeWidgetPrivacy } from '../../data/widget-settings';

/** Read once from the settings table, then kept here so every reader sees a change at once. */
let hidden: boolean | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
function set(next: boolean) {
  hidden = next;
  for (const listener of listeners) listener();
}

/**
 * "Hide amounts" on the widgets: whether they show ••• until the phone is unlocked, and the switch
 * that changes it. False until the setting has been read.
 */
export function useHideAmounts(): readonly [boolean, (hide: boolean) => void] {
  const store = useMoneyStore();
  const value = useSyncExternalStore(subscribe, () => hidden);
  useEffect(() => {
    if (hidden !== null) return;
    void readWidgetPrivacy(store.db).then((p) => set(p.hideAmounts));
  }, [store]);
  const change = useCallback(
    (hide: boolean) => {
      set(hide);
      void writeWidgetPrivacy(store.db, { hideAmounts: hide });
    },
    [store],
  );
  return [value ?? false, change] as const;
}
