import { useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { coversHome } from '../home/home-visible';

/**
 * How Home was last reached: `opened` when the app came to the front onto it (or started there),
 * or the wait for a first catch was left just after catching one; `returned` when it was come back
 * to from anything over it (onboarding, a close, a sheet, Max, a flow left half-way).
 */
export type TodayArrival = 'opened' | 'returned';

// The app starting is an opening; a start into onboarding or a link's screen covers Home at once.
let arrival: TodayArrival = 'opened';
const watchers = new Set<() => void>();

function arrive(next: TodayArrival): void {
  if (arrival === next) return;
  arrival = next;
  for (const tell of watchers) tell();
}

export function readTodayArrival(): TodayArrival {
  return arrival;
}

export function watchTodayArrival(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => {
    watchers.delete(onChange);
  };
}

/** Something went over Home: whatever shows when it leaves is come back to, not opened onto. */
export function noteHomeCovered(): void {
  arrive('returned');
}

/**
 * The app came back to the front. Home, if nothing is over it, is opened onto; under a screen or a
 * sheet left open it stays come back to, so closing that never reads as an opening.
 */
export function noteAppForward(covered: boolean): void {
  arrive(covered ? 'returned' : 'opened');
}

/**
 * The wait for a first catch is being left just after a way that runs by itself caught one: the
 * Today it closes onto shows that catch, just seen.
 */
export function noteFirstCatchSeen(): void {
  arrive('opened');
}

/**
 * Keeps how Home was reached, from the root: every route over it, and every return of the app
 * from the background (a passing system alert or Control Centre leaves it as it was).
 */
export function useTodayArrival(): void {
  const covered = coversHome(useSegments());
  const coveredNow = useRef(covered);
  coveredNow.current = covered;
  useEffect(() => {
    if (covered) noteHomeCovered();
  }, [covered]);
  useEffect(() => {
    let away = AppState.currentState === 'background';
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') away = true;
      else if (next === 'active' && away) {
        away = false;
        noteAppForward(coveredNow.current);
      }
    });
    return () => subscription.remove();
  }, []);
}
