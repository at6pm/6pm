import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Thousands of rupiah: `rb`, and `jt` from a million. */
export const duoMoneyId: DuoMoney = {
  format: (amount) =>
    amount < 1000
      ? `Rp${amount}rb`
      : `Rp${(amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`,
  keypad: { before: 'Rp', after: 'rb', per: 1, digits: 4 },
};

/** The Indonesian page's October, in rupiah: a Rp145rb day with Rp70rb left at six. */
export const duoAmountsId: DuoAmounts = {
  rows: [
    ['ride', 16],
    ['food', 25],
    ['coffee', 22],
    ['shop', 12],
  ],
  today: { left: 70, start: 145, spent: 75, daily: 145, kept: 140 },
  spent: { 1: 105, 2: 185, 3: 110, 4: 80, 5: 120, 6: 137, 8: 100 },
  diary: {
    1: [
      ['food', 15],
      ['ride', 18],
      ['shop', 72],
    ],
    2: [
      ['food', 110],
      ['fun', 50],
      ['ride', 25],
    ],
    3: [
      ['food', 25],
      ['fun', 65],
      ['coffee', 20],
    ],
    4: [
      ['shop', 55],
      ['coffee', 15],
      ['ride', 10],
    ],
    5: [
      ['food', 25],
      ['ride', 16],
      ['shop', 79],
    ],
    6: [
      ['food', 35],
      ['coffee', 22],
      ['fun', 80],
    ],
    8: [
      ['food', 15],
      ['coffee', 20],
      ['shop', 65],
    ],
  },
  pots: [3075, 935, 400],
  standRecent: [30, 12],
};
