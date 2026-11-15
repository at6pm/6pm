import { randomUUID } from 'expo-crypto';

import {
  FUTURE_YOU,
  futureYouSavedSplit,
  merchantKeyOf,
  placeToRemember,
  rememberedRule,
  type MoneyIn,
  type SpendRow,
} from '@6pm/domain';

import type { MoneyStore } from './money-store';
import { settleByMoneyIn } from './owed-actions';
import { rememberedHeldBack } from './request-actions';

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

/** The pay "Yes, that's my pay" keeps: an amount per pay, and the income it is when there is one. */
export interface PayKept {
  readonly amount: number;
  readonly incomeId?: string | null;
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

  /**
   * The sender remembers where its money went, when it is a place a sender repeats (spread,
   * saved, an income's pay), so the next money from it is offered the same place.
   */
  const remember = async (row: SpendRow) => {
    const place = placeToRemember(row);
    if (place === null || row.merchant.trim() === '') return;
    const existing = await store.tables.rules.get(merchantKeyOf(row.merchant));
    const rule = rememberedRule(existing, row.merchant, row.categoryId, place);
    if (rule !== null) await store.tables.rules.put(rule);
  };

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
        // A sender remembered holding back tax arrives with it held back again (4c); money given
        // back (a refund, a payback) never had tax held from it.
        const givenBack = place.moneyIn === 'payback' || place.moneyIn === 'refund';
        const held = givenBack ? 0 : await rememberedHeldBack(store, row);
        const next: SpendRow = {
          ...row,
          ...(held > 0 ? { heldBack: held } : {}),
          ...(givenBack ? { heldBack: null, certificate: null, certificateOn: null } : {}),
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
          await remember(next);
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
          incomeId: null,
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
     * money in of its own, waiting to be placed. Returns the extra's id, or null with none. Given
     * one of the plan's incomes, the pay is that income's (its month counts it from now) and its
     * sender remembers it; an income with no counted-on amount keeps all of it as its pay.
     */
    keepPay: (id: string, kept: number | PayKept): Promise<string | null> =>
      inTurn(async () => {
        const row = await current(id);
        if (!row || row.direction !== 'in') return null;
        const { amount: income, incomeId = null } =
          typeof kept === 'number' ? { amount: kept } : kept;
        const extra = income > 0 ? Math.max(0, row.amount - income) : 0;
        const held = await rememberedHeldBack(store, { ...row, amount: row.amount - extra });
        const pay = await patchNow(row, {
          status: 'kept',
          previousStatus: row.status,
          moneyIn: 'pay',
          amount: row.amount - extra,
          ...(incomeId === null ? {} : { incomeId }),
          ...(held > 0 ? { heldBack: held } : {}),
        });
        await remember(pay);
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
          incomeId: null,
          createdAt: now,
          updatedAt: now,
        };
        await store.tables.spends.put(piece);
        replaceSpend(piece);
        return piece.id;
      }),
  };
}
