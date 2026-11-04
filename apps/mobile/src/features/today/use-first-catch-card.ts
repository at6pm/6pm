import { useEffect, useState } from 'react';

import { firstCatchCardDue, type SpendRow } from '@6pm/domain';

import { firstCaughtSince, readFirstCatch, writeFirstCatch } from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';

export interface FirstCatchCard {
  /** The morning after "I'll do it later", with nothing caught on its own since. */
  readonly due: boolean;
  /** The first real catch since "later", when it has landed. */
  readonly caught: SpendRow | null;
  /** Keeps that the first catch happened, so the card never comes back. */
  readonly settle: () => void;
}

/**
 * Today's first-catch card: due from the morning after "later" was chosen in onboarding, until a
 * real capture lands (a shared receipt, a Wallet tap, a bank alert, an email or a scanned code;
 * a spend typed or said never clears it). Read again each time the day's spends change.
 */
export function useFirstCatchCard(): FirstCatchCard {
  const store = useMoneyStore();
  const { today, cycleSpends } = useMoney();
  const [state, setState] = useState<{ due: boolean; caught: SpendRow | null }>({
    due: false,
    caught: null,
  });
  useEffect(() => {
    let live = true;
    void (async () => {
      const kept = await readFirstCatch(store.db);
      if (!firstCatchCardDue(kept, today) || kept?.state !== 'later') {
        if (live) setState({ due: false, caught: null });
        return;
      }
      const caught = await firstCaughtSince(store, kept.at);
      if (live) setState({ due: caught === null, caught });
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, today, cycleSpends]);
  return {
    ...state,
    settle: () =>
      void writeFirstCatch(store.db, { state: 'caught', at: new Date().toISOString() }).catch(
        () => undefined,
      ),
  };
}
