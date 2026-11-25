import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Thousands of đồng: `k`, and `tr` from a million. */
export const duoMoneyVi: DuoMoney = {
  format: (amount) =>
    amount < 1000
      ? `${amount}k`
      : `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`,
  keypad: { before: '', after: 'k', per: 1, digits: 4 },
};

/** The Vietnamese page's October, in đồng: a 312k day with 183k left at six. */
export const duoAmountsVi: DuoAmounts = {
  rows: [
    ['ride', 22],
    ['food', 60],
    ['coffee', 35],
    ['shop', 12],
  ],
  today: { left: 183, start: 312, spent: 129, daily: 312, kept: 305 },
  spent: { 1: 236, 2: 380, 3: 225, 4: 166, 5: 275, 6: 290, 8: 210 },
  diary: {
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
  pots: [2400, 1100, 640],
  standRecent: [40, 15],
};
