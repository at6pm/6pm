import { useSegments } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import type { TodayView } from '@6pm/domain';

import { firstSelfRunningCatch } from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useHomePageShown } from '../home/home-page';
import { coversHome } from '../home/home-visible';
import { askAtFirstCatch } from './rating-ask';
import { readTodayArrival, watchTodayArrival } from './today-arrival';

/**
 * How long Today is left still before the prompt: past the first-catch card printing its slip and
 * folding away, and past the app's own first frames after it opens.
 */
const STILL_MS = 2000;

/** The first catch's ask is behind: nothing more is read for the life of the app. */
let done = false;

/**
 * Asks for a store rating once Today shows the first spend a way that runs by itself caught,
 * when Today is settled: opened onto, nothing over it, the app in front and Today the page on
 * show, left so for a couple of seconds. Read again each time the spends change, so a catch
 * landing while Today is looked at asks too.
 */
export function useFirstCatchRating(): void {
  const store = useMoneyStore();
  const { cycleSpends } = useMoney();
  const arrival = useSyncExternalStore(watchTodayArrival, readTodayArrival);
  const covered = coversHome(useSegments());
  const shown = useHomePageShown();
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setActive(next === 'active');
    });
    return () => subscription.remove();
  }, []);
  const today: TodayView =
    covered || !shown || !active ? 'covered' : arrival === 'opened' ? 'settled' : 'interrupted';
  const now = useRef(today);
  now.current = today;

  useEffect(() => {
    if (done || today !== 'settled') return undefined;
    let live = true;
    const still = () => live && now.current === 'settled';
    const timer = setTimeout(() => {
      void (async () => {
        const row = await firstSelfRunningCatch(store);
        if (!still()) return;
        const firstCatch =
          row === null
            ? null
            : { source: row.source, at: row.createdAt, deleted: row.status === 'deleted' };
        if (await askAtFirstCatch(store.db, { firstCatch, today: 'settled' }, still)) done = true;
      })().catch(() => undefined);
    }, STILL_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [today, store, cycleSpends]);
}
