import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

const cents = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const euros = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Ten-cent steps: 38 is 3,80 €. Cents under 20 €, whole euros from there. */
export const duoMoneyDe: DuoMoney = {
  format: (amount) => (amount < 200 ? cents.format(amount / 10) : euros.format(amount / 10)),
  keypad: { before: '', after: '\u00a0€', per: 10, digits: 4 },
};

/** The German page's October, in euros: a 40 € day with 21 € left at six. */
export const duoAmountsDe: DuoAmounts = {
  rows: [
    ['ride', 25],
    ['food', 95],
    ['coffee', 38],
    ['shop', 32],
  ],
  today: { left: 210, start: 400, spent: 190, daily: 400, kept: 390 },
  spent: { 1: 315, 2: 520, 3: 290, 4: 225, 5: 300, 6: 320, 8: 270 },
  diary: {
    1: [
      ['food', 45],
      ['ride', 25],
      ['shop', 245],
    ],
    2: [
      ['food', 290],
      ['fun', 120],
      ['ride', 110],
    ],
    3: [
      ['food', 135],
      ['fun', 120],
      ['coffee', 35],
    ],
    4: [
      ['shop', 170],
      ['coffee', 30],
      ['ride', 25],
    ],
    5: [
      ['food', 115],
      ['ride', 25],
      ['shop', 160],
    ],
    6: [
      ['food', 140],
      ['coffee', 30],
      ['fun', 150],
    ],
    8: [
      ['food', 60],
      ['coffee', 45],
      ['shop', 165],
    ],
  },
  pots: [2400, 1100, 640],
  standRecent: [40, 15],
};
