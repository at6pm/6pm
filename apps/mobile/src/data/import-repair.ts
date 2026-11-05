import {
  foldWords,
  importTargetOf,
  payeeTargetOf,
  suggestCategoryIcon,
  type CategoryRow,
} from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import { ICON_PACKS } from '../features/categories/icon-packs';
import { categoryFor } from '../features/import/label-picks';
import type { MoneyStore } from './money-store';
import { nextSort, otherNotDailyOf, otherNotDailyRow } from './shared-categories';

/**
 * Putting right what an earlier bring-in did: every Not daily label became a category of its own,
 * named for the label (a shop, a person), that never counted in a day. Each such category still
 * exactly as the bring-in made it, and holding only brought-in lines, goes: its lines move to the
 * one "Other · not daily" (or to the person's own Bills, when the label reads as a bill), and it is
 * archived. Lines keep their day and amount and stay out of the day, so no total moves. A category
 * the person renamed, recoloured, switched or filed anything in is theirs, and stays.
 */

const IMPORTED = 'imported-';
const FREE_ICONS = ICON_PACKS.filter((p) => p.free).flatMap((p) => p.icons);
const NAME_LIMIT = 40;

const slug = (name: string) => foldWords(name).trim().replace(/\s+/g, '-') || 'other';

/** Whether a category is one a bring-in made for a label, untouched since. */
export function madeForLabel(row: CategoryRow): boolean {
  if (row.archivedAt !== null || !row.id.startsWith(IMPORTED)) return false;
  if (row.countsDaily || row.hue !== 0) return false;
  if (!row.id.startsWith(`${IMPORTED}${slug(row.name)}`)) return false;
  // Its icon was suggested from the whole label; a name cut at the limit may suggest another.
  const icon = suggestCategoryIcon(row.name, FREE_ICONS) ?? 'category';
  return row.icon === icon || row.name.length >= NAME_LIMIT;
}

/** Where a label's lines go now: the person's own not-daily category for its words, or null. */
function confidentHome(name: string, live: readonly CategoryRow[]): CategoryRow | null {
  const target = payeeTargetOf(name) ?? importTargetOf(name);
  if (target === null || target === 'notDaily') return null;
  const mine = categoryFor(target, live);
  // Only a home that stays out of the day, as the lines did: Diary and Ask read the same totals.
  return mine && !mine.countsDaily ? mine : null;
}

/**
 * Runs once on every launch and does nothing once nothing is left to put right. Returns how many
 * categories it archived.
 */
export function repairImportedCategories(store: MoneyStore, language: Language): Promise<number> {
  return store.exclusive(async () => {
    const { db, tables } = store;
    const all = await tables.categories.all();
    const made = all.filter(madeForLabel);
    if (made.length === 0) return 0;
    const theirs = await db.getAllAsync<{ id: string }>(
      `SELECT DISTINCT category_id AS id FROM spends WHERE category_id LIKE 'imported-%' AND source != 'import'
       UNION SELECT DISTINCT category_id AS id FROM merchant_rules WHERE category_id LIKE 'imported-%'`,
      [],
    );
    const used = new Set(theirs.map((r) => r.id));
    const gone = made.filter((c) => !used.has(c.id));
    if (gone.length === 0) return 0;

    const live = all.filter((c) => c.archivedAt === null && !gone.includes(c));
    const found = otherNotDailyOf(live);
    // Made (or brought back) only when a line needs it.
    const make: { row: CategoryRow | null } = { row: null };
    const sharedId = (): string => {
      if (found) return found.id;
      if (make.row === null) {
        const fresh = otherNotDailyRow(language, nextSort(all));
        const before = all.find((r) => r.id === fresh.id);
        make.row = before ? { ...before, sort: fresh.sort, archivedAt: null } : fresh;
      }
      return make.row.id;
    };
    const moves = gone.map((c) => ({ from: c, to: confidentHome(c.name, live)?.id ?? sharedId() }));

    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      if (make.row) await tables.categories.put(make.row);
      for (const { from, to } of moves) {
        await db.runAsync(
          'UPDATE spends SET category_id = ?, updated_at = ? WHERE category_id = ?',
          [to, now, from.id],
        );
        await tables.categories.put({ ...from, archivedAt: now });
      }
    });
    await store.loadInTurn(store.getSnapshot().today);
    return gone.length;
  });
}
