import { useSyncExternalStore } from 'react';

/**
 * Today's "For work" row asks the Diary to open filtered to work. The Diary is a page of the home
 * surface, not a route, so the ask is held here until it reads it: each ask has its own token.
 */
let current = 0;
const listeners = new Set<() => void>();

export function requestWorkDiary(): void {
  current += 1;
  for (const listener of listeners) listener();
}

/** The latest ask's token: 0 until the first. */
export function useWorkDiaryRequest(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}
