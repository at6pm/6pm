import type { HomeTab } from './home-tabs';

const listeners = new Set<(tab: HomeTab) => void>();

/**
 * Asks Home, already open, to turn to a tab: a widget's link (`/app?tab=diary`) reaches the route
 * it is on as a new parameter, not as a new screen.
 */
export function requestHomeTab(tab: HomeTab): void {
  for (const listener of listeners) listener(tab);
}

/** Home listens for a tab being asked for; returns the way to stop. */
export function onHomeTabRequest(listener: (tab: HomeTab) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
