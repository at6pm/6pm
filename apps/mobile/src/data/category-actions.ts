import { randomUUID } from 'expo-crypto';
import { useMemo } from 'react';

import type { CategoryRow, MerchantRuleRow, SpendRow } from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import { useMoneyStore } from './money-provider';
import type { MoneySnapshot, MoneyStore } from './money-store';
import {
  nextSort,
  OTHER_ID,
  OTHER_NOT_DAILY_ID,
  otherNotDailyOf,
  otherNotDailyRow,
  otherOf,
  otherRow,
  untouchedShared,
} from './shared-categories';
import { inTurn } from './store-queue';

export interface CategoryInput {
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly countsDaily: boolean;
}

/** How much a category has carried this pay cycle: the spends still standing and their sum. */
export interface CategoryTally {
  readonly count: number;
  readonly total: number;
}

/** Each category's spends this cycle, skipped ones left out (deleted ones never reach the cycle). */
export function tallyByCategory(
  spends: readonly Pick<SpendRow, 'categoryId' | 'amount' | 'status'>[],
): ReadonlyMap<string, CategoryTally> {
  const tallies = new Map<string, CategoryTally>();
  for (const spend of spends) {
    if (spend.status === 'skipped' || spend.status === 'deleted') continue;
    const sofar = tallies.get(spend.categoryId) ?? { count: 0, total: 0 };
    tallies.set(spend.categoryId, { count: sofar.count + 1, total: sofar.total + spend.amount });
  }
  return tallies;
}

/** The category a deleted one's spends move to: the first other one in the user's order. */
export function fallbackFor(
  categories: readonly CategoryRow[],
  id: string,
): CategoryRow | undefined {
  return categories.find((c) => c.id !== id && c.archivedAt === null);
}

/**
 * Where a deleted category's spends go, so none of them changes whether it counts in the day: a
 * daily one's to "Other" ("Khác"), a not-daily one's to "Other · not daily", each made the first
 * time it is needed (`make`). Deleting Other itself (or Other · not daily) falls back to the first
 * other category of the same kind, then to the first other one in the person's order. Undefined
 * when it is the last category, which can never be deleted.
 */
export function homeFor(
  categories: readonly CategoryRow[],
  id: string,
  language: Language,
): { readonly to: CategoryRow; readonly make: boolean } | undefined {
  const gone = categories.find((c) => c.id === id);
  const rest = categories.filter((c) => c.id !== id && c.archivedAt === null);
  const first = rest[0];
  if (!gone || !first) return undefined;
  const daily = gone.countsDaily;
  const found = daily ? otherOf(rest) : otherNotDailyOf(rest);
  if (found) return { to: found, make: false };
  const sharedId = daily ? OTHER_ID : OTHER_NOT_DAILY_ID;
  if (gone.id !== sharedId && !rest.some((c) => c.id === sharedId)) {
    const sort = nextSort(categories);
    return { to: daily ? otherRow(language, sort) : otherNotDailyRow(language, sort), make: true };
  }
  return { to: rest.find((c) => c.countsDaily === daily) ?? first, make: false };
}

/** What deleting a category changed, kept by the screen so Undo can put it back exactly. */
export interface DeletedCategory {
  readonly category: CategoryRow;
  readonly to: CategoryRow;
  /** Every spend that moved, by id. */
  readonly moved: readonly string[];
  /** The spends that still stand among them: "Moved 12 to Other". */
  readonly standing: number;
  readonly rules: readonly MerchantRuleRow[];
  /** The Other (or Other · not daily) the delete made to hold them; put away again on Undo. */
  readonly made: CategoryRow | null;
}

/** The snapshot with one category gone and its spends re-filed, before the database has it. */
function withoutCategory(
  snap: MoneySnapshot,
  id: string,
  to: CategoryRow,
  made: boolean,
): MoneySnapshot {
  const refile = (rows: readonly SpendRow[]) =>
    rows.some((r) => r.categoryId === id)
      ? rows.map((r) => (r.categoryId === id ? { ...r, categoryId: to.id } : r))
      : rows;
  return {
    ...snap,
    categories: [...snap.categories.filter((c) => c.id !== id), ...(made ? [to] : [])],
    cycleSpends: refile(snap.cycleSpends),
    waitingBefore: refile(snap.waitingBefore),
    earlierJarSpends: refile(snap.earlierJarSpends),
  };
}

/** SQLite's bound-parameter limit, with room to spare. */
const CHUNK = 500;

/**
 * The Categories sheet's writes. Rules and spends point at a category by id, so a rename or a new
 * icon re-files nothing; deleting moves every spend to its home and forgets the rules that
 * pointed at it. A save commits to the database first, then publishes; a delete or a new order
 * publishes first, so the list answers at once, and reloads only if the write fails.
 */
export function categoryActions(store: MoneyStore) {
  const { tables, db } = store;

  const publishCategory = (row: CategoryRow) => {
    const snap = store.getSnapshot();
    const categories = snap.categories.some((c) => c.id === row.id)
      ? snap.categories.map((c) => (c.id === row.id ? row : c))
      : [...snap.categories, row];
    store.publish({ ...snap, categories });
  };

  return inTurn(store.exclusive, {
    /** Saves a new category (no id) or an edit of an existing one. Returns null for a blank name. */
    saveCategory: async (input: CategoryInput, id?: string): Promise<CategoryRow | null> => {
      const name = input.name.trim();
      if (name === '') return null;
      const current = id ? await tables.categories.get(id) : null;
      const all = current ? [] : await tables.categories.all();
      const row: CategoryRow = {
        id: current?.id ?? randomUUID(),
        name,
        icon: input.icon,
        hue: input.hue,
        countsDaily: input.countsDaily,
        sort: current?.sort ?? all.reduce((max, c) => Math.max(max, c.sort + 1), 0),
        archivedAt: current?.archivedAt ?? null,
      };
      await tables.categories.put(row);
      publishCategory(row);
      return row;
    },

    /**
     * Deletes a category: its spends, in every cycle, move to its home (`homeFor`), its rules go,
     * and the row is archived so old receipts still resolve. The screens see it at once; the
     * database follows in one transaction. The last category can never be deleted.
     */
    deleteCategory: async (id: string, language: Language): Promise<DeletedCategory | null> => {
      const all = await tables.categories.all();
      const active = all.filter((c) => c.archivedAt === null).sort((a, b) => a.sort - b.sort);
      const gone = active.find((c) => c.id === id);
      const home = homeFor([...active, ...all.filter((c) => c.archivedAt !== null)], id, language);
      if (!gone || !home) return null;
      const spends = await db.getAllAsync<{ id: string; status: string }>(
        'SELECT id, status FROM spends WHERE category_id = ?',
        [id],
      );
      // Other is made only to hold something.
      const make = home.make && spends.length > 0;
      const archivedBefore = all.find((c) => c.id === home.to.id);
      const to: CategoryRow =
        make && archivedBefore
          ? { ...home.to, ...archivedBefore, sort: home.to.sort, archivedAt: null }
          : home.to;
      const rules = await tables.rules.where('categoryId', id);
      const now = new Date().toISOString();
      store.publish(withoutCategory(store.getSnapshot(), id, to, make));
      try {
        await db.withTransactionAsync(async () => {
          if (make) await tables.categories.put(to);
          await db.runAsync(
            'UPDATE spends SET category_id = ?, updated_at = ? WHERE category_id = ?',
            [to.id, now, id],
          );
          await tables.rules.removeWhere('categoryId', id);
          await tables.categories.put({ ...gone, archivedAt: now });
        });
      } catch (error) {
        await store.loadInTurn(store.getSnapshot().today);
        throw error;
      }
      return {
        category: gone,
        to,
        moved: spends.map((s) => s.id),
        standing: spends.filter((s) => s.status !== 'deleted' && s.status !== 'skipped').length,
        rules,
        made: make ? to : null,
      };
    },

    /** Undo of a delete: the category back where it was, its spends and rules with it. */
    restoreCategory: async (deleted: DeletedCategory): Promise<void> => {
      const now = new Date().toISOString();
      await db.withTransactionAsync(async () => {
        await tables.categories.put({ ...deleted.category, archivedAt: null });
        for (let at = 0; at < deleted.moved.length; at += CHUNK) {
          const ids = deleted.moved.slice(at, at + CHUNK);
          await db.runAsync(
            `UPDATE spends SET category_id = ?, updated_at = ? WHERE id IN (${ids.map(() => '?').join(', ')})`,
            [deleted.category.id, now, ...ids],
          );
        }
        for (const rule of deleted.rules) await tables.rules.put(rule);
        if (deleted.made) {
          const left = await db.getAllAsync<{ n: number }>(
            'SELECT COUNT(*) AS n FROM spends WHERE category_id = ?',
            [deleted.made.id],
          );
          const made = await tables.categories.get(deleted.made.id);
          if ((left[0]?.n ?? 0) === 0 && made && untouchedShared(made)) {
            await tables.categories.put({ ...made, archivedAt: now });
          }
        }
      });
      await store.loadInTurn(store.getSnapshot().today);
    },

    /**
     * The person's order, as the list was dropped: every listed category's sort, in one
     * transaction. Every screen that lists categories reads this order.
     */
    reorderCategories: async (ids: readonly string[]): Promise<void> => {
      const snap = store.getSnapshot();
      const at = new Map(ids.map((id, i) => [id, i]));
      const changed = snap.categories.filter((c) => at.has(c.id) && at.get(c.id) !== c.sort);
      if (changed.length === 0) return;
      const categories = snap.categories
        .map((c) => (at.has(c.id) ? { ...c, sort: at.get(c.id) ?? c.sort } : c))
        .sort((a, b) => a.sort - b.sort);
      store.publish({ ...snap, categories });
      try {
        await db.withTransactionAsync(async () => {
          for (const c of changed) {
            await db.runAsync('UPDATE categories SET sort = ? WHERE id = ?', [
              at.get(c.id) ?? c.sort,
              c.id,
            ]);
          }
        });
      } catch (error) {
        await store.loadInTurn(store.getSnapshot().today);
        throw error;
      }
    },

    /** Every merchant rule that still points at a live category, by merchant name. */
    readRules: async (): Promise<MerchantRuleRow[]> =>
      tables.rules.select(
        'WHERE category_id IN (SELECT id FROM categories WHERE archived_at IS NULL) ORDER BY merchant COLLATE NOCASE',
        [],
      ),

    /** Forgets one merchant: the next catch from it goes back to being guessed. */
    removeRule: (merchantKey: string) => tables.rules.remove(merchantKey),
  });
}

export type CategoryActions = ReturnType<typeof categoryActions>;

export function useCategoryActions(): CategoryActions {
  const store = useMoneyStore();
  return useMemo(() => categoryActions(store), [store]);
}
