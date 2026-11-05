import { jarPartOf, moneyDayOf, type LocalDate, type SpendStatus } from '@6pm/domain';

import { topUpOf } from './pot-moves';
import type { SqlDatabase } from './table';

/**
 * One line of a jar's page: a payday's set-aside, money added by hand (Add on its page), a spend
 * taken from it, or the jar starting (with what it held before 6pm, if anything).
 */
export type JarHistoryEntry =
  | { readonly kind: 'payday'; readonly day: LocalDate; readonly amount: number }
  | {
      readonly kind: 'topUp';
      readonly day: LocalDate;
      readonly amount: number;
      /** Its row, so it can be removed. */
      readonly moveId: string;
    }
  | {
      readonly kind: 'spent';
      readonly day: LocalDate;
      readonly amount: number;
      readonly spendId: string;
      readonly merchant: string | null;
      readonly categoryId: string;
    }
  | { readonly kind: 'started'; readonly day: LocalDate; readonly amount: number };

interface MoveColumns {
  readonly id: string;
  readonly kind: string;
  readonly amount: number;
  readonly cycle: string;
  readonly at: string;
}

interface SpendColumns {
  readonly id: string;
  readonly day: string;
  readonly at: string;
  readonly amount: number;
  readonly category_id: string;
  readonly merchant: string | null;
  readonly status: string;
  readonly for_work: number | null;
  readonly pays_bill: string | null;
  readonly direction: string | null;
  readonly from_pot: string | null;
  readonly from_pot_amount: number | null;
}

/** Lines of one day: the jar starting first, then the payday, then the rest as they happened. */
const RANK = { started: 0, payday: 1, topUp: 2, spent: 2 } as const;

/**
 * A jar's moves for its page, newest first: every payday's set-aside (filed on its payday, never
 * a payday that put nothing in), every top-up, the spends taken from it (only the part the jar
 * covered, and only while they still count) and the day it started. `notDaily` are the categories
 * that do not count, so a spend in one never took anything from the jar.
 */
export async function readJarHistory(
  db: SqlDatabase,
  pot: { readonly id: string; readonly createdAt: string },
  notDaily: ReadonlySet<string>,
): Promise<JarHistoryEntry[]> {
  const [moves, spends] = await Promise.all([
    db.getAllAsync<MoveColumns>(
      'SELECT id, kind, amount, cycle, at FROM pot_moves WHERE pot_id = ?',
      [pot.id],
    ),
    db.getAllAsync<SpendColumns>(
      `SELECT id, day, at, amount, category_id, merchant, status, for_work, pays_bill, direction,
              from_pot, from_pot_amount
       FROM spends WHERE from_pot = ?`,
      [pot.id],
    ),
  ]);
  const lines: { entry: JarHistoryEntry; at: string }[] = [];
  let opening = 0;
  // A top-up from an earlier cycle that was removed stays where it was, taken back this cycle:
  // neither line shows.
  const takenBack = new Set(
    moves.flatMap((m) => (m.kind === 'topUp' && m.amount < 0 ? [topUpOf(m.id)] : [])),
  );
  for (const m of moves) {
    if (m.kind === 'opening') opening += m.amount;
    else if (m.kind === 'setAside' && m.amount > 0) {
      lines.push({ entry: { kind: 'payday', day: m.cycle, amount: m.amount }, at: m.at });
    } else if (m.kind === 'topUp' && m.amount > 0 && !takenBack.has(m.id)) {
      lines.push({
        entry: { kind: 'topUp', day: moneyDayOf(new Date(m.at)), amount: m.amount, moveId: m.id },
        at: m.at,
      });
    }
  }
  for (const s of spends) {
    const amount = jarPartOf(
      {
        amount: s.amount,
        category: s.category_id,
        status: s.status as SpendStatus,
        forWork: s.for_work === 1,
        paysBill: s.pays_bill,
        direction: s.direction === 'in' ? 'in' : null,
        fromPot: s.from_pot,
        fromPotAmount: s.from_pot_amount,
      },
      notDaily,
    );
    if (amount <= 0) continue;
    lines.push({
      entry: {
        kind: 'spent',
        day: s.day,
        amount,
        spendId: s.id,
        merchant: s.merchant,
        categoryId: s.category_id,
      },
      at: s.at,
    });
  }
  lines.push({
    entry: { kind: 'started', day: moneyDayOf(new Date(pot.createdAt)), amount: opening },
    at: pot.createdAt,
  });
  return lines
    .sort((a, b) => {
      if (a.entry.day !== b.entry.day) return a.entry.day < b.entry.day ? 1 : -1;
      const rank = RANK[b.entry.kind] - RANK[a.entry.kind];
      if (rank !== 0) return rank;
      return a.at < b.at ? 1 : a.at > b.at ? -1 : 0;
    })
    .map((l) => l.entry);
}
