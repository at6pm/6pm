import type { SiteLang } from './copy';
import type { DuoKind } from './duo-copy';

/**
 * The made-up October behind the iPhone Duo screens. Amounts are in thousands of đồng; `duoMoney`
 * writes them in each market's money. Each market has its own month so Friday 9 October matches the
 * rest of the page: a $54 day in English and a 312k day in Vietnamese, with as much left at six as
 * the Lock Screen shows.
 */

type DuoSpends = readonly (readonly [kind: DuoKind, amount: number])[];

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

/** Today's spends, Friday 9 October, before the close. */
export const duoRows: Readonly<Record<SiteLang, DuoSpends>> = {
  en: [
    ['ride', 48],
    ['food', 95],
    ['coffee', 55],
    ['shop', 32],
  ],
  vi: [
    ['ride', 22],
    ['food', 60],
    ['coffee', 35],
    ['shop', 12],
  ],
};

/** Today: what is left, today's number, what went; each day's number; what Future you has kept. */
export const duoToday: Readonly<
  Record<SiteLang, { left: number; start: number; spent: number; daily: number; kept: number }>
> = {
  en: { left: 310, start: 540, spent: 230, daily: 540, kept: 530 },
  vi: { left: 183, start: 312, spent: 129, daily: 312, kept: 305 },
};

/** What each closed day spent, and when it was closed. 7 October slipped by; 9 October is today. */
export const duoSpent: Readonly<Record<SiteLang, Readonly<Record<number, number>>>> = {
  en: { 1: 410, 2: 655, 3: 380, 4: 290, 5: 470, 6: 505, 8: 360 },
  vi: { 1: 236, 2: 380, 3: 225, 4: 166, 5: 275, 6: 290, 8: 210 },
};
export const duoClosedAt: Readonly<Record<number, string>> = {
  1: '18:04',
  2: '18:21',
  3: '19:02',
  4: '18:00',
  5: '18:10',
  6: '18:33',
  8: '18:04',
};

/** Each closed day's three spends: kind and amount, in the order of the diary's names. */
export const duoDiary: Readonly<Record<SiteLang, Readonly<Record<number, DuoSpends>>>> = {
  en: {
    1: [
      ['food', 45],
      ['ride', 62],
      ['shop', 303],
    ],
    2: [
      ['food', 320],
      ['fun', 180],
      ['ride', 155],
    ],
    3: [
      ['food', 65],
      ['fun', 240],
      ['coffee', 75],
    ],
    4: [
      ['shop', 210],
      ['coffee', 35],
      ['ride', 45],
    ],
    5: [
      ['food', 55],
      ['ride', 96],
      ['shop', 319],
    ],
    6: [
      ['food', 60],
      ['coffee', 55],
      ['fun', 390],
    ],
    8: [
      ['food', 40],
      ['coffee', 65],
      ['shop', 255],
    ],
  },
  vi: {
    1: [
      ['food', 45],
      ['ride', 36],
      ['shop', 155],
    ],
    2: [
      ['food', 185],
      ['fun', 105],
      ['ride', 90],
    ],
    3: [
      ['food', 65],
      ['fun', 120],
      ['coffee', 40],
    ],
    4: [
      ['shop', 120],
      ['coffee', 25],
      ['ride', 21],
    ],
    5: [
      ['food', 45],
      ['ride', 50],
      ['shop', 180],
    ],
    6: [
      ['food', 45],
      ['coffee', 35],
      ['fun', 210],
    ],
    8: [
      ['food', 30],
      ['coffee', 45],
      ['shop', 135],
    ],
  },
};

/** Bills, Future you and Fun this month, with their colours. */
export const duoPots: readonly (readonly [amount: number, color: string])[] = [
  [2400, '#7a8bd8'],
  [1100, '#5fb08a'],
  [640, '#ff8552'],
];

/** The stand's quick-add categories' icons, and the two spends already added there. */
export const duoStandIcons = [
  'shopping_basket',
  'restaurant',
  'two_wheeler',
  'confirmation_number',
] as const;
export const duoStandRecent = [40, 15] as const;

/**
 * A screen amount in each market's money: thousands of đồng with `k` (and `tr` from a million) in
 * Vietnamese; in English a tenth of it in dollars, with cents under $20.
 */
export function duoMoney(lang: SiteLang, thousands: number): string {
  if (lang === 'vi') {
    if (thousands < 1000) return `${thousands}k`;
    return `${(thousands / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  }
  const dollars = thousands / 10;
  return thousands < 200
    ? `$${dollars.toFixed(2)}`
    : `$${Math.round(dollars).toLocaleString('en-US')}`;
}
