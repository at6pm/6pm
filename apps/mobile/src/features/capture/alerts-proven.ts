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

/**
 * What the phone keeps, once read since the app opened: every screen that asks after that starts
 * from it, so none shows "not set up" for a frame before turning to "set up".
 */
let known: boolean | null = null;

function tellAll(): void {
  for (const tell of [...watchers]) tell();
}

/** Reads the kept sign into memory, once, as early as the app can: the inbox import calls it. */
export function primeAlertsProven(db: SqlDatabase): Promise<boolean> {
  if (known !== null) return Promise.resolve(known);
  return readAlertsProven(db).then((at) => {
    const proven = at !== null;
    if (known !== proven) {
      known = proven;
      tellAll();
    }
    return proven;
  });
}

/** A test alert came in through the Shortcut: kept, and every reader told. */
export async function noteAlertsProven(db: SqlDatabase, at: string): Promise<void> {
  await keepAlertsProven(db, at);
  known = true;
  tellAll();
}

export function useAlertsProven(): boolean {
  const store = useMoneyStore();
  const [proven, setProven] = useState(known ?? false);
  useEffect(() => {
    let live = true;
    const load = () => {
      if (live && known !== null) setProven(known);
    };
    watchers.add(load);
    load();
    primeAlertsProven(store.db).catch(() => undefined);
    return () => {
      live = false;
      watchers.delete(load);
    };
  }, [store]);
  return proven;
}
