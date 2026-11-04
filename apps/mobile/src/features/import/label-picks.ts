import {
  foldWords,
  importTargetOf,
  suggestCategoryIcon,
  type CategoryRow,
  type ImportTarget,
} from '@6pm/domain';
import { t as translate, type Language } from '@6pm/i18n';

import type { LabelPick } from '../../data/import-actions';
import { DEFAULT_CATEGORIES } from '../../data/onboarding';
import { ICON_PACKS } from '../categories/icon-packs';

/**
 * Where each of their categories goes, as "Label the boxes" holds it: one of the person's own
 * categories (`cat:<id>`), a starter category or Bills the person does not have yet (`new:<target>`,
 * made when the lines are brought in), or Not daily (its own category, named as theirs is, that
 * never counts in a day).
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
const FREE_ICONS = ICON_PACKS.filter((p) => p.free).flatMap((p) => p.icons);

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

/** Where a target goes for this person. */
export function choiceOf(target: ImportTarget, categories: readonly CategoryRow[]): Choice {
  if (target === 'notDaily') return 'notDaily';
  const mine = categoryFor(target, categories);
  return mine ? `cat:${mine.id}` : `new:${target}`;
}

/** The choice 6pm's own words make for a label of theirs, or null when the person picks. */
export function defaultChoice(label: string, categories: readonly CategoryRow[]): Choice | null {
  const target = importTargetOf(label);
  return target === null ? null : choiceOf(target, categories);
}

/** Every tile: the person's categories in their order, then the starters and Bills they lack, then Not daily. */
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
 * each; every Not daily label becomes a category of its own, named as theirs is.
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
    if (choice === 'notDaily') {
      picks.set(label, {
        kind: 'new',
        id: freeId(`imported-${folded(label).replace(/\s+/g, '-') || 'other'}`, taken),
        name: label.slice(0, 40),
        icon: suggestCategoryIcon(label, FREE_ICONS) ?? 'category',
        hue: 0,
        countsDaily: false,
      });
      continue;
    }
    const existing = made.get(choice);
    if (existing) {
      picks.set(label, existing);
      continue;
    }
    const tile = tileOf(choice, categories, language);
    const target = choice.slice(4);
    const pick: LabelPick = {
      kind: 'new',
      id: freeId(target, taken),
      name: tile.name,
      icon: tile.icon,
      hue: tile.hue ?? 80,
      countsDaily: target !== 'bills',
    };
    made.set(choice, pick);
    picks.set(label, pick);
  }
  return picks;
}
