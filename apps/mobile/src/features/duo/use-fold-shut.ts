import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useFold } from '../../ui/layout/fold';

/**
 * Whether folding the phone shut is followed. On the iPhone Duo the app stays in front on the
 * outer screen. A folding Android phone usually goes to sleep as it shuts, the app is put away
 * in the same moment, and the hinge reads shut again whenever the app comes back to a cover
 * screen: there the fold is never taken as a decision.
 */
export const FOLD_SHUT_FOLLOWED = Platform.OS === 'ios';

/**
 * Calls `onShut` when the iPhone Duo is folded shut from open or part way open, while `enabled`.
 * Read through a ref, so the latest `onShut` runs.
 */
export function useFoldShut(onShut: () => void, enabled: boolean) {
  const { snapshot } = useFold();
  const latest = useRef(onShut);
  useEffect(() => {
    latest.current = onShut;
  });
  const was = useRef(snapshot.hinge);
  useEffect(() => {
    const before = was.current;
    was.current = snapshot.hinge;
    if (!FOLD_SHUT_FOLLOWED || !enabled) return;
    if (snapshot.hinge === 'closed' && (before === 'partial' || before === 'open')) {
      latest.current();
    }
  }, [snapshot.hinge, enabled]);
}
