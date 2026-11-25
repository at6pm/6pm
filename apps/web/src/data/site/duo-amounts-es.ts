import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Ten-cent steps: 19 is 1,90 €. Cents under 20 €, whole euros from there. */
export const duoMoneyEs: DuoMoney = {
  format: (amount) => {
    const euros = amount / 10;
    return amount < 200
      ? `${euros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      : `${Math.round(euros).toLocaleString('es-ES')} €`;
  },
  keypad: { before: '', after: ' €', per: 10, digits: 4 },
};

/** The Spanish page's October, in euros: a 34 € day with 22 € left at six. */
export const duoAmountsEs: DuoAmounts = {
  rows: [
    ['ride', 15],
    ['food', 65],
    ['coffee', 19],
    ['shop', 21],
  ],
  today: { left: 220, start: 340, spent: 120, daily: 340, kept: 330 },
  spent: { 1: 290, 2: 465, 3: 257, 4: 210, 5: 260, 6: 318, 8: 260 },
  diary: {
    1: [
      ['food', 25],
      ['ride', 90],
      ['shop', 175],
    ],
    2: [
      ['food', 260],
      ['fun', 95],
      ['ride', 110],
    ],
    3: [
      ['food', 115],
      ['fun', 120],
      ['coffee', 22],
    ],
    4: [
      ['shop', 160],
      ['coffee', 35],
      ['ride', 15],
    ],
    5: [
      ['food', 125],
      ['ride', 15],
      ['shop', 120],
    ],
    6: [
      ['food', 120],
      ['coffee', 18],
      ['fun', 180],
    ],
    8: [
      ['food', 35],
      ['coffee', 25],
      ['shop', 200],
    ],
  },
  pots: [9600, 2420, 800],
  standRecent: [25, 18],
};
