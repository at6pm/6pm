import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Whole yuan: 18 is ¥18, with a thousands comma from ¥1,000. */
export const duoMoneyZhHans: DuoMoney = {
  format: (amount) => `¥${amount.toLocaleString('zh-CN')}`,
  keypad: { before: '¥', after: '', per: 1, digits: 4 },
};

/** The Chinese page's October, in yuan: a ¥155 day with ¥91 left at six. */
export const duoAmountsZhHans: DuoAmounts = {
  rows: [
    ['ride', 18],
    ['food', 22],
    ['coffee', 15],
    ['shop', 9],
  ],
  today: { left: 91, start: 155, spent: 64, daily: 155, kept: 150 },
  spent: { 1: 116, 2: 222, 3: 96, 4: 63, 5: 75, 6: 126, 8: 111 },
  diary: {
    1: [
      ['food', 12],
      ['ride', 26],
      ['shop', 78],
    ],
    2: [
      ['food', 120],
      ['fun', 70],
      ['ride', 32],
    ],
    3: [
      ['food', 22],
      ['fun', 58],
      ['coffee', 16],
    ],
    4: [
      ['shop', 46],
      ['coffee', 14],
      ['ride', 3],
    ],
    5: [
      ['food', 22],
      ['ride', 18],
      ['shop', 35],
    ],
    6: [
      ['food', 48],
      ['coffee', 18],
      ['fun', 60],
    ],
    8: [
      ['food', 10],
      ['coffee', 16],
      ['shop', 85],
    ],
  },
  pots: [3400, 990, 600],
  standRecent: [15, 5],
};
