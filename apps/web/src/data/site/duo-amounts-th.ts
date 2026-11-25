// Translation pending: English text.
import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Ten-cent steps: 48 is $4.80. Cents under $20, whole dollars from there. */
export const duoMoneyTh: DuoMoney = {
  format: (amount) => {
    const dollars = amount / 10;
    return amount < 200
      ? `$${dollars.toFixed(2)}`
      : `$${Math.round(dollars).toLocaleString('en-US')}`;
  },
  keypad: { before: '$', after: '', per: 10 },
};

/** This page's October, for now the English one in US dollars. */
export const duoAmountsTh: DuoAmounts = {
  rows: [
    ['ride', 48],
    ['food', 95],
    ['coffee', 55],
    ['shop', 32],
  ],
  today: { left: 310, start: 540, spent: 230, daily: 540, kept: 530 },
  spent: { 1: 410, 2: 655, 3: 380, 4: 290, 5: 470, 6: 505, 8: 360 },
  diary: {
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
  pots: [2400, 1100, 640],
  standRecent: [40, 15],
};
