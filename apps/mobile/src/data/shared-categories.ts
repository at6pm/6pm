import { foldWords, type CategoryRow } from '@6pm/domain';
import { languages, t, type Language } from '@6pm/i18n';

/**
 * The two categories 6pm files into when nothing the person made fits: "Other", which counts in
 * the day, and "Other · not daily", which never does. Each is one category, found by its id or by
 * its name in any language 6pm speaks, and made once, the first time something needs it: a
 * bring-in's Not daily lines, or the spends of a deleted category.
 */

export const OTHER_ID = 'other';
export const OTHER_NOT_DAILY_ID = 'other-not-daily';

const folded = (name: string) => foldWords(name).trim();

const namesOf = (key: 'categories.other' | 'import.cat.notDailyShared'): ReadonlySet<string> =>
  new Set(languages.map((language) => folded(t(language, key))));

const OTHER_NAMES = namesOf('categories.other');
const NOT_DAILY_NAMES = namesOf('import.cat.notDailyShared');

const live = (categories: readonly CategoryRow[]) =>
  categories.filter((c) => c.archivedAt === null);

/** The person's "Other · not daily": its own id, or a not-daily category named as it is. */
export function otherNotDailyOf(categories: readonly CategoryRow[]): CategoryRow | undefined {
  const mine = live(categories);
  return (
    mine.find((c) => c.id === OTHER_NOT_DAILY_ID) ??
    mine.find((c) => !c.countsDaily && NOT_DAILY_NAMES.has(folded(c.name)))
  );
}

/** The person's "Other" ("Khác"): its own id, or a category that counts daily named as it is. */
export function otherOf(categories: readonly CategoryRow[]): CategoryRow | undefined {
  const mine = live(categories);
  return (
    mine.find((c) => c.id === OTHER_ID) ??
    mine.find((c) => c.countsDaily && OTHER_NAMES.has(folded(c.name)))
  );
}

/** The row "Other · not daily" is made with, last in the person's order. */
export function otherNotDailyRow(language: Language, sort: number): CategoryRow {
  return {
    id: OTHER_NOT_DAILY_ID,
    name: t(language, 'import.cat.notDailyShared'),
    icon: 'block',
    hue: 245,
    countsDaily: false,
    sort,
    archivedAt: null,
  };
}

/** The row "Other" is made with, last in the person's order. */
export function otherRow(language: Language, sort: number): CategoryRow {
  return {
    id: OTHER_ID,
    name: t(language, 'categories.other'),
    icon: 'more_horiz',
    hue: 200,
    countsDaily: true,
    sort,
    archivedAt: null,
  };
}

/** Whether a shared category is still as 6pm made it: never renamed, recoloured or switched. */
export function untouchedShared(row: CategoryRow): boolean {
  if (row.id === OTHER_NOT_DAILY_ID) {
    return (
      !row.countsDaily &&
      row.icon === 'block' &&
      row.hue === 245 &&
      NOT_DAILY_NAMES.has(folded(row.name))
    );
  }
  if (row.id === OTHER_ID) {
    return (
      row.countsDaily &&
      row.icon === 'more_horiz' &&
      row.hue === 200 &&
      OTHER_NAMES.has(folded(row.name))
    );
  }
  return false;
}

/** The next sort after every category, archived ones included. */
export function nextSort(categories: readonly CategoryRow[]): number {
  return categories.reduce((max, c) => Math.max(max, c.sort + 1), 0);
}
