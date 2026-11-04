import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { LastAlert, SpendRow } from '@6pm/domain';

import { surfaces } from '../../../modules/surfaces';
import { firstCaughtSince, writeFirstCatch } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import { haptics } from '../../ui/haptics';
import { readLastAlert } from '../capture-guide/last-alert';
import { requestInboxImport } from '../surfaces/inbox-runner';

/** How often the inbox is looked at while waiting: a catch shows within a couple of seconds. */
const LOOK_MS = 1500;
/** With nothing caught this long, the screen shows where it may have got stuck. */
export const STUCK_MS = 90_000;

export interface FirstCatchListen {
  /** The first spend caught on its own since waiting began. */
  readonly caught: SpendRow | null;
  /** Nothing has arrived for `STUCK_MS` since waiting began, or since "Try another way". */
  readonly stuck: boolean;
  /** A bank alert the shortcut read since waiting began and skipped (a code, a promotion). */
  readonly skipped: LastAlert | null;
  /** Starts the wait for the stuck hint again. */
  readonly again: () => void;
}

/**
 * Waits for the first catch, live, from `since` (an instant) while `active`: every 1.5 s while the
 * app is in front it asks the app's one inbox importer to run (the same queue as the foreground
 * import, merchant naming and all) and looks for a spend caught on its own. When one lands it
 * gives a success haptic and keeps that the first catch happened. It never blocks anything: it
 * only listens.
 */
export function useFirstCatch(active: boolean, since: string): FirstCatchListen {
  const store = useMoneyStore();
  const [caught, setCaught] = useState<SpendRow | null>(null);
  const [stuck, setStuck] = useState(false);
  const [skipped, setSkipped] = useState<LastAlert | null>(null);
  const [round, setRound] = useState(0);
  const found = useRef(false);

  useEffect(() => {
    if (!active || found.current) return undefined;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const look = async () => {
      if (AppState.currentState === 'active') {
        await requestInboxImport();
        const row = await firstCaughtSince(store, since).catch(() => null);
        if (!live) return;
        if (row) {
          found.current = true;
          setCaught(row);
          haptics.success();
          void writeFirstCatch(store.db, { state: 'caught', at: new Date().toISOString() }).catch(
            () => undefined,
          );
          return;
        }
        const status = await surfaces?.readStatus?.('last-alert').catch(() => null);
        const last = readLastAlert(status);
        if (live && last?.skipped && last.at >= since) setSkipped(last);
      }
      if (live) timer = setTimeout(() => void look(), LOOK_MS);
    };
    void look();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [active, since, store]);

  useEffect(() => {
    if (!active || caught) return undefined;
    setStuck(false);
    const timer = setTimeout(() => setStuck(true), STUCK_MS);
    return () => clearTimeout(timer);
  }, [active, caught, round]);

  return { caught, stuck: stuck && caught === null, skipped, again: () => setRound((n) => n + 1) };
}
