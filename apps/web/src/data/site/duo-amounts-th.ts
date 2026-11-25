import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Whole baht: 45 is ฿45, with a thousands comma from ฿1,000. */
export const duoMoneyTh: DuoMoney = {
  format: (amount) => `฿${amount.toLocaleString('th-TH')}`,
  keypad: { before: '฿', after: '', per: 1, digits: 5 },
};

/** The Thai page's October, in baht: a ฿450 day with ฿241 left at six. */
export const duoAmountsTh: DuoAmounts = {
  rows: [
    ['ride', 45],
    ['food', 60],
    ['coffee', 65],
    ['shop', 39],
  ],
  today: { left: 241, start: 450, spent: 209, daily: 450, kept: 430 },
  spent: { 1: 380, 2: 750, 3: 360, 4: 250, 5: 334, 6: 280, 8: 360 },
  diary: {
    1: [
      ['food', 55],
      ['ride', 89],
      ['shop', 236],
    ],
    2: [
      ['food', 420],
      ['fun', 220],
      ['ride', 110],
    ],
    3: [
      ['food', 60],
      ['fun', 245],
      ['coffee', 55],
    ],
    4: [
      ['shop', 180],
      ['coffee', 40],
      ['ride', 30],
    ],
    5: [
      ['food', 50],
      ['ride', 85],
      ['shop', 199],
    ],
    6: [
      ['food', 70],
      ['coffee', 60],
      ['fun', 150],
    ],
    8: [
      ['food', 45],
      ['coffee', 55],
      ['shop', 260],
    ],
  },
  pots: [9350, 2750, 1500],
  standRecent: [40, 15],
};
