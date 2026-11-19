import { useEffect, useRef } from 'react';

import { useFold } from '../../ui/layout/fold';

/**
 * Calls `onShut` when a folding phone is folded shut from open or part way open, while `enabled`.
 * Read through a ref, so the latest `onShut` runs. A phone found shut on the way back from the
 * background was shut while 6pm was away, with nobody looking at it: that is not this.
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
    const shutNow = snapshot.hinge === 'closed' && snapshot.returning !== true;
    if (enabled && shutNow && (before === 'partial' || before === 'open')) latest.current();
  }, [snapshot.hinge, snapshot.returning, enabled]);
}
