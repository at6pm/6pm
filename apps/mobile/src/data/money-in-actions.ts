import { randomUUID } from 'expo-crypto';

import { FUTURE_YOU, futureYouSavedSplit, type MoneyIn, type SpendRow } from '@6pm/domain';

import type { MoneyStore } from './money-store';
import { settleByMoneyIn } from './owed-actions';

/** Where the close puts money that came in. */
export interface MoneyInPlace {
  readonly moneyIn: MoneyIn;
  /** For `saved`: a jar's id, or `FUTURE_YOU` for Future you (`futureYouSavedSplit`). */
  readonly savedTo?: string | null;
  /** For `refund` and `payback`: the spend it answers. */
  readonly givesBack?: string | null;
  /** For `payback`: the owed lines it pays (`owedPaybackFor`), settled with it. */
  readonly owed?: readonly string[];
  /**
   * The Tết bonus: this much goes into this jar first (a top-up), and only the rest is spread or
   * saved as `moneyIn` says.
   */
  readonly jarFirst?: { readonly potId: string; readonly amount: number } | null;
}

interface Helpers {
  readonly inTurn: <T>(task: () => Promise<T>) => Promise<T>;
  readonly current: (id: string) => Promise<SpendRow | null>;
  readonly patchNow: (row: SpendRow, patch: Partial<SpendRow>) => Promise<SpendRow>;
  readonly replaceSpend: (row: SpendRow) => void;
}

/** Pot moves made by saving money in carry its id first, so taking it back finds them. */
const moveIdOf = (spendId: string, potId: string) => `${spendId}:${potId}`;

/**
 * What the close does with money that came in. Saving it is a top-up of the pot (or of Future
 * you's goals), written with the row in one transaction: the money adds to free money and the
 * top-up takes it out again, so today's number holds and the pot's monthly need falls.
 */
export function moneyInActions(store: MoneyStore, helpers: Helpers) {
  const { inTurn, current, patchNow, replaceSpend } = helpers;

  const savedSplit = (amount: number, savedTo: string): Readonly<Record<string, number>> => {
    const live = store.getSnapshot().pots.filter((p) => p.archivedAt === null);
    if (savedTo === FUTURE_YOU) return futureYouSavedSplit(amount, live);
    return live.some((p) => p.id === savedTo) ? { [savedTo]: amount } : {};
  };

  return {
    /** Places money in: kept, with what it was. Saying where again replaces the old answer. */
    placeMoneyIn: (id: string, place: MoneyInPlace): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction !== 'in') return null;
        const snap = store.getSnapshot();
        const first = place.jarFirst;
        const jarPart =
          first && snap.pots.some((p) => p.id === first.potId && p.archivedAt === null)
            ? Math.min(row.amount, Math.max(0, Math.round(first.amount)))
            : 0;
        const rest = row.amount - jarPart;
        const split: Record<string, number> = {
          ...(place.moneyIn === 'saved' && place.savedTo && rest > 0
            ? savedSplit(rest, place.savedTo)
            : {}),
        };
        if (first && jarPart > 0) split[first.potId] = (split[first.potId] ?? 0) + jarPart;
        const at = new Date().toISOString();
        const next: SpendRow = {
          ...row,
          status: 'kept',
          previousStatus: row.status === 'kept' ? row.previousStatus : row.status,
          moneyIn: place.moneyIn,
          savedTo: place.moneyIn === 'saved' ? (place.savedTo ?? null) : null,
          givesBack:
            place.moneyIn === 'refund' || place.moneyIn === 'payback'
              ? (place.givesBack ?? null)
              : null,
          updatedAt: at,
        };
        await store.db.withTransactionAsync(async () => {
          await store.db.runAsync('DELETE FROM pot_moves WHERE id LIKE ?', [`${id}:%`]);
          for (const [potId, amount] of Object.entries(split)) {
            await store.db.runAsync(
              'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
              [moveIdOf(id, potId), potId, amount, 'topUp', snap.cycle.start, at],
            );
          }
          await store.tables.spends.put(next);
          await settleByMoneyIn(store, id, place.moneyIn === 'payback' ? (place.owed ?? []) : []);
        });
        // Pot totals and this cycle's top-ups come from every move: read them again.
        await store.loadInTurn(snap.today);
        replaceSpend(next);
        return next;
      }),

    /** Takes a placing back: waiting again, nothing saved, as the close found it. */
    unplaceMoneyIn: (id: string): Promise<SpendRow | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction !== 'in') return null;
        const next: SpendRow = {
          ...row,
          status: row.previousStatus ?? 'caught',
          previousStatus: null,
          moneyIn: null,
          savedTo: null,
          givesBack: null,
          updatedAt: new Date().toISOString(),
        };
        await store.db.withTransactionAsync(async () => {
          await store.db.runAsync('DELETE FROM pot_moves WHERE id LIKE ?', [`${id}:%`]);
          await store.tables.spends.put(next);
          await settleByMoneyIn(store, id, []);
        });
        await store.loadInTurn(store.getSnapshot().today);
        replaceSpend(next);
        return next;
      }),

    /**
     * "Yes, that's my pay": the pay the plan counts is kept as pay, and anything beyond it becomes
     * money in of its own, waiting to be placed. Returns the extra's id, or null with none.
     */
    keepPay: (id: string, income: number): Promise<string | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction !== 'in') return null;
        const extra = income > 0 ? Math.max(0, row.amount - income) : 0;
        const pay = await patchNow(row, {
          status: 'kept',
          previousStatus: row.status,
          moneyIn: 'pay',
          amount: row.amount - extra,
        });
        if (extra === 0) return null;
        const now = new Date().toISOString();
        const piece: SpendRow = {
          ...pay,
          id: randomUUID(),
          amount: extra,
          status: 'caught',
          previousStatus: null,
          moneyIn: null,
          givesBack: null,
          savedTo: null,
          createdAt: now,
          updatedAt: now,
        };
        await store.tables.spends.put(piece);
        replaceSpend(piece);
        return piece.id;
      }),
  };
}
