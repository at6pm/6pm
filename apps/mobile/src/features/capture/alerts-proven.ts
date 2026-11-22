import { useEffect, useState } from 'react';

import { keepAlertsProven, readAlertsProven } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import type { SqlDatabase } from '../../data/table';

/**
 * Whether a test alert has shown the bank alert automation running. The iPhone's automation
 * lives in Shortcuts, where 6pm cannot look: until a real alert is passed on, a test alert that
 * came the whole way in is the one sign that it exists and is on. Kept on the phone, and read
 * again the moment one arrives. It is a sign of set-up only: never a catch, never money.
 */
const watchers = new Set<() => void>();

/** A test alert came in through the Shortcut: kept, and every reader told. */
export async function noteAlertsProven(db: SqlDatabase, at: string): Promise<void> {
  await keepAlertsProven(db, at);
  for (const tell of [...watchers]) tell();
}

export function useAlertsProven(): boolean {
  const store = useMoneyStore();
  const [proven, setProven] = useState(false);
  useEffect(() => {
    let live = true;
    const load = () => {
      readAlertsProven(store.db)
        .then((at) => {
          if (live) setProven(at !== null);
        })
        .catch(() => undefined);
    };
    load();
    watchers.add(load);
    return () => {
      live = false;
      watchers.delete(load);
    };
  }, [store]);
  return proven;
}
