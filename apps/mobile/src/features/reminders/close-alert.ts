import { useSyncExternalStore } from 'react';

import type { LocalDate } from '@6pm/domain';

import { surfaces } from '../../../modules/surfaces';

/** The close reminder planned for one money day, as it will be worded. */
export interface CloseAlert {
  readonly id: string;
  readonly day: LocalDate;
  readonly body: string;
}

let current: CloseAlert | null = null;
const listeners = new Set<() => void>();

/**
 * The close reminder that will ring for the money day, or null when none will (switched off, not
 * allowed, or already closed). Where iOS starts the close's Live Activity by itself, the activity
 * rings with these words instead, so six never rings twice.
 */
export function setCloseAlert(next: CloseAlert | null): void {
  if (JSON.stringify(next) === JSON.stringify(current)) return;
  current = next;
  for (const listener of listeners) listener();
}

export function useCloseAlert(): CloseAlert | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
}

/** Whether the close's Live Activity for this money day is asked for or on the Lock Screen. */
export async function activityRingsFor(day: LocalDate): Promise<boolean> {
  if (!surfaces) return false;
  const running = await surfaces.listActivities().catch(() => []);
  return running.some((activity) => activity.kind === 'close' && activity.key === day);
}
