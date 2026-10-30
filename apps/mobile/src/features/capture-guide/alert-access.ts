import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { surfaces } from '../../../modules/surfaces';

/**
 * Whether 6pm is turned on under Android's Notification access, read when the screen opens and
 * each time the app comes back, since it is switched in Android's settings. Null where bank
 * alerts are not read by a notification listener (the iPhone, tests).
 */
export function useAlertAccess(): boolean | null {
  const read = () => surfaces?.alertAccess?.() ?? null;
  const [allowed, setAllowed] = useState<boolean | null>(read);
  useEffect(() => {
    if (!surfaces?.alertAccess) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAllowed(read());
    });
    return () => sub.remove();
  }, []);
  return allowed;
}

/** Opens Android's Notification access at 6pm's switch. */
export function openAlertAccess(): void {
  void surfaces?.openAlertAccess?.().catch(() => undefined);
}
