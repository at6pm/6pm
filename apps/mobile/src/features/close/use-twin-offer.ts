import { useEffect, useState } from 'react';

import type { SpendRow } from '@6pm/domain';

import type { MoneyActions } from '../../data/money-actions';

/**
 * "Same as your 50k at 10:30?" for the card on top of the close: the spend the person typed that
 * this caught payment looks like, read again for each new top card. No remembers the pair and
 * the offer goes; Yes is the card's to answer.
 */
export function useTwinOffer(actions: MoneyActions, id: string | undefined) {
  const [twin, setTwin] = useState<{ readonly id: string; readonly typed: SpendRow } | null>(null);
  useEffect(() => {
    if (!id) return;
    let live = true;
    actions
      .typedTwin(id)
      .then((typed) => {
        if (live) setTwin(typed ? { id, typed } : null);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [actions, id]);
  const offer = twin !== null && twin.id === id ? twin.typed : null;
  return {
    offer,
    /** No: they are two. */
    decline: () => {
      if (!id || !offer) return;
      setTwin(null);
      void actions.notSameAsTyped(id, offer.id).catch(() => undefined);
    },
    /** Yes was answered: the offer goes with the card. */
    taken: () => setTwin(null),
  };
}
