import { foldWords, type CategoryRow, type ImportTarget } from '@6pm/domain';
import { t as translate, type Language } from '@6pm/i18n';

import type { LabelPick } from '../../data/import-actions';
import { DEFAULT_CATEGORIES } from '../../data/onboarding';
import { otherNotDailyOf, otherNotDailyRow } from '../../data/shared-categories';

/**
 * Where each of their categories goes, as "Label the boxes" holds it: one of the person's own
 * categories (`cat:<id>`), a starter category or Bills the person does not have yet (`new:<target>`,
 * made when the lines are brought in), or Not daily: the one "Other · not daily" category every
 * Not daily label shares, made the first time one needs it. A bring-in never makes a category
 * per label.
 */
export type Choice = `cat:${string}` | `new:${ImportTarget}` | 'notDaily';

/** One tile of the "goes in…" grid. */
export interface ChoiceTile {
  readonly choice: Choice;
  readonly name: string;
  readonly icon: string;
  /** Null for Not daily, which has no colour of its own. */
  readonly hue: number | null;
}

const BILLS = { icon: 'receipt_long', hue: 80 } as const;
const STARTERS = new Map<string, { icon: string; hue: number }>(
  DEFAULT_CATEGORIES.map(([id, icon, hue]) => [id, { icon, hue }]),
);

const folded = (name: string) => foldWords(name).trim();

/** The names a starter (or Bills) goes by, in English and Vietnamese, folded. */
function namesOf(target: ImportTarget): ReadonlySet<string> {
  if (target === 'notDaily') return new Set();
  const key = target === 'bills' ? 'import.cat.bills' : (`onboarding.category.${target}` as const);
  return new Set((['en', 'vi'] as const).map((language) => folded(translate(language, key))));
}

/** The person's own category for a target: the starter itself, or one named as it is. */
export function categoryFor(
  target: ImportTarget,
  categories: readonly CategoryRow[],
): CategoryRow | undefined {
  const live = categories.filter((c) => c.archivedAt === null);
  const names = namesOf(target);
  return live.find((c) => c.id === target) ?? live.find((c) => names.has(folded(c.name)));
}

/** Where a target goes for this person: Not daily is their "Other · not daily" once they have it. */
export function choiceOf(target: ImportTarget, categories: readonly CategoryRow[]): Choice {
  if (target === 'notDaily') {
    const shared = otherNotDailyOf(categories);
    return shared ? `cat:${shared.id}` : 'notDaily';
  }
  const mine = categoryFor(target, categories);
  return mine ? `cat:${mine.id}` : `new:${target}`;
}

/**
 * Every tile: the person's categories in their order, then Bills if they lack it, then Not daily
 * (unless their "Other · not daily" is already among their own).
 */
export function choiceTiles(categories: readonly CategoryRow[], language: Language): ChoiceTile[] {
  const live = categories.filter((c) => c.archivedAt === null).sort((a, b) => a.sort - b.sort);
  const tiles: ChoiceTile[] = live.map((c) => ({
    choice: `cat:${c.id}`,
    name: c.name,
    icon: c.icon,
    hue: c.hue,
  }));
  for (const target of ['bills'] as const) {
    if (categoryFor(target, categories)) continue;
    tiles.push({
      choice: `new:${target}`,
      name: translate(language, 'import.cat.bills'),
      ...BILLS,
    });
  }
  if (otherNotDailyOf(categories)) return tiles;
  tiles.push({
    choice: 'notDaily',
    name: translate(language, 'import.cat.notDaily'),
    icon: 'block',
    hue: null,
  });
  return tiles;
}

/** A tile for any choice, including a starter the grid does not list because it is still to be made. */
export function tileOf(
  choice: Choice,
  categories: readonly CategoryRow[],
  language: Language,
): ChoiceTile {
  if (choice === 'notDaily') {
    return { choice, name: translate(language, 'import.cat.notDaily'), icon: 'block', hue: null };
  }
  if (choice.startsWith('cat:')) {
    const mine = categories.find((c) => `cat:${c.id}` === choice);
    if (mine) return { choice, name: mine.name, icon: mine.icon, hue: mine.hue };
  }
  const target = choice.slice(4) as ImportTarget;
  if (target === 'bills')
    return { choice, name: translate(language, 'import.cat.bills'), ...BILLS };
  const starter = STARTERS.get(target) ?? { icon: 'category', hue: 80 };
  return {
    choice,
    name: translate(language, `onboarding.category.${target as 'food'}`),
    ...starter,
  };
}

/** A free id for a category to make: the starter's own when nothing has it. */
function freeId(base: string, taken: Set<string>): string {
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

/**
 * The choices as the bring-in writes them. Starters and Bills the person lacks are made once
 * each, and every Not daily label goes in one "Other · not daily", made once.
 */
export function picksOf(
  choices: ReadonlyMap<string, Choice>,
  categories: readonly CategoryRow[],
  language: Language,
): Map<string, LabelPick> {
  const taken = new Set(categories.map((c) => c.id));
  const made = new Map<Choice, LabelPick>();
  const picks = new Map<string, LabelPick>();
  for (const [label, choice] of choices) {
    if (choice.startsWith('cat:')) {
      picks.set(label, { kind: 'category', id: choice.slice(4) });
      continue;
    }
    const existing = made.get(choice);
    if (existing) {
      picks.set(label, existing);
      continue;
    }
    let pick: LabelPick;
    if (choice === 'notDaily') {
      const row = otherNotDailyRow(language, 0);
      pick = {
        kind: 'new',
        id: row.id,
        name: row.name,
        icon: row.icon,
        hue: row.hue,
        countsDaily: false,
      };
    } else {
      const tile = tileOf(choice, categories, language);
      const target = choice.slice(4);
      pick = {
        kind: 'new',
        id: freeId(target, taken),
        name: tile.name,
        icon: tile.icon,
        hue: tile.hue ?? 80,
        countsDaily: target !== 'bills',
      };
    }
    made.set(choice, pick);
    picks.set(label, pick);
  }
  return picks;
}
