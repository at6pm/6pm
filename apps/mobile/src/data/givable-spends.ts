import { useEffect, useState } from 'react';

import { addDays, CLAIM_DAYS, type GivableSpend, type LocalDate } from '@6pm/domain';

import { useMoneyStore } from './money-provider';
import type { MoneyStore } from './money-store';

/**
 * The spending money that came in may give back: everything kept or still caught from as far back
 * as a work claim reaches, each marked when a refund or payback already answers it. The pay cycle
 * the screens hold is too short for a refund of last month's order, so this reads the database.
 */
export async function readGivableSpends(
  store: MoneyStore,
  today: LocalDate,
): Promise<GivableSpend[]> {
  const rows = await store.tables.spends.select(
    "WHERE day >= ? AND status IN ('kept', 'caught') ORDER BY at DESC",
    [addDays(today, -CLAIM_DAYS)],
  );
  const answered = new Set(rows.flatMap((r) => (r.givesBack ? [r.givesBack] : [])));
  return rows
    .filter((r) => r.direction !== 'in')
    .map((r) => ({
      id: r.id,
      day: r.day,
      amount: r.amount,
      merchant: r.merchant,
      status: r.status,
      direction: r.direction,
      note: r.note,
      forWork: r.forWork,
      givenBack: answered.has(r.id),
    }));
}

/** The givable spends for `today`, read once; null until they are. */
export function useGivableSpends(today: LocalDate): readonly GivableSpend[] | null {
  const store = useMoneyStore();
  const [spends, setSpends] = useState<readonly GivableSpend[] | null>(null);
  useEffect(() => {
    let live = true;
    void readGivableSpends(store, today)
      .then((read) => {
        if (live) setSpends(read);
      })
      .catch(() => {
        // Nothing to match against is a close with no money questions, never a close that stalls.
        if (live) setSpends([]);
      });
    return () => {
      live = false;
    };
  }, [store, today]);
  return spends;
}
