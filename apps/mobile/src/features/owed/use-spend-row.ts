import { useEffect, useState } from 'react';

import type { SpendRow } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';

/**
 * A spend or money in by id: this month's from the snapshot (so it follows every write), an older
 * one read from its table once. Undefined while it is read; null when there is none.
 */
export function useSpendRow(id: string | undefined): SpendRow | null | undefined {
  const snap = useMoney();
  const store = useMoneyStore();
  const live = id ? findSpend(snap, id) : undefined;
  const [read, setRead] = useState<SpendRow | null | undefined>(undefined);
  useEffect(() => {
    if (!id || live) return;
    let on = true;
    store.tables.spends
      .get(id)
      .then((row) => on && setRead(row))
      .catch(() => on && setRead(null));
    return () => {
      on = false;
    };
    // Read again after each write: the snapshot changes with it.
  }, [id, live, store, snap]);
  return live ?? read;
}
