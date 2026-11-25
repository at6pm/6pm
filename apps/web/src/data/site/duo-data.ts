import type { DuoKind } from './duo-copy';
import { duoAmountsDe } from './duo-amounts-de';
import { duoAmountsEn } from './duo-amounts-en';
import { duoAmountsEs } from './duo-amounts-es';
import { duoAmountsFr } from './duo-amounts-fr';
import { duoAmountsId } from './duo-amounts-id';
import { duoAmountsJa } from './duo-amounts-ja';
import { duoAmountsKo } from './duo-amounts-ko';
import { duoAmountsTh } from './duo-amounts-th';
import { duoAmountsVi } from './duo-amounts-vi';
import { duoAmountsZhHans } from './duo-amounts-zh-hans';
import { siteLangs, type SiteLang } from './langs';

/**
 * The made-up October behind the iPhone Duo screens. Each market has its own month so Friday 9
 * October matches the rest of the page: a $54 day in English and a 312k day in Vietnamese, with as
 * much left at six as the Lock Screen shows. Amounts are whole steps of that market's money (ten
 * cents in English, a thousand đồng in Vietnamese), which its `duoMoney` writes out.
 */

export type DuoSpends = readonly (readonly [kind: DuoKind, amount: number])[];

/** One market's October, in `duo-amounts-<lang>.ts`. */
export interface DuoAmounts {
  /** Today's spends, Friday 9 October, before the close. */
  readonly rows: DuoSpends;
  /** Today: what is left, today's number, what went; each day's number; what Future you has kept. */
  readonly today: {
    readonly left: number;
    readonly start: number;
    readonly spent: number;
    readonly daily: number;
    readonly kept: number;
  };
  /** What each closed day spent. 7 October slipped by; 9 October is today. */
  readonly spent: Readonly<Record<number, number>>;
  /** Each closed day's three spends: kind and amount, in the order of the diary's names. */
  readonly diary: Readonly<Record<number, DuoSpends>>;
  /** Bills, Future you and Fun this month. */
  readonly pots: readonly [number, number, number];
  /** The two spends already added on the propped-up keypad. */
  readonly standRecent: readonly [number, number];
}

const amounts: Readonly<Record<SiteLang, DuoAmounts>> = {
  en: duoAmountsEn,
  vi: duoAmountsVi,
  'zh-Hans': duoAmountsZhHans,
  ja: duoAmountsJa,
  ko: duoAmountsKo,
  th: duoAmountsTh,
  id: duoAmountsId,
  es: duoAmountsEs,
  fr: duoAmountsFr,
  de: duoAmountsDe,
};

/** The colours of Bills, Future you and Fun. */
const potColors = ['#7a8bd8', '#5fb08a', '#ff8552'] as const;

const byLang = <T>(pick: (a: DuoAmounts) => T): Readonly<Record<SiteLang, T>> =>
  Object.fromEntries(siteLangs.map((lang) => [lang, pick(amounts[lang])])) as Record<SiteLang, T>;

export const duoRows = byLang((a) => a.rows);
export const duoToday = byLang((a) => a.today);
export const duoSpent = byLang((a) => a.spent);
export const duoDiary = byLang((a) => a.diary);
/** Bills, Future you and Fun this month, with their colours. */
export const duoPots = byLang((a) =>
  a.pots.map((amount, i) => [amount, potColors[i] ?? ''] as const),
);
export const duoStandRecent = byLang((a) => a.standRecent);

/** Tile background, glyph colour and icon for each kind of spend. */
export const duoKinds: Readonly<
  Record<DuoKind, readonly [tile: string, glyph: string, icon: string]>
> = {
  food: ['#ffd9b8', '#a4481f', 'restaurant'],
  ride: ['#cfe3ff', '#2d5ea8', 'local_taxi'],
  coffee: ['#f1dccb', '#7a4a2a', 'local_cafe'],
  shop: ['#dff0d4', '#3f7a3a', 'shopping_basket'],
  fun: ['#ecdcff', '#6a3fb0', 'confirmation_number'],
};

/** When each closed day was closed. */
export const duoClosedAt: Readonly<Record<number, string>> = {
  1: '18:04',
  2: '18:21',
  3: '19:02',
  4: '18:00',
  5: '18:10',
  6: '18:33',
  8: '18:04',
};

/** The stand's quick-add categories' icons. */
export const duoStandIcons = [
  'shopping_basket',
  'restaurant',
  'two_wheeler',
  'confirmation_number',
] as const;
