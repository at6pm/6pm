import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Whole yen: `¥900`, and `¥1.3万` from ten thousand, as the app shortens it. */
export const duoMoneyJa: DuoMoney = {
  format: (amount) =>
    amount < 10_000
      ? `¥${amount.toLocaleString('ja-JP')}`
      : `¥${(amount / 10_000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万`,
  keypad: { before: '¥', after: '', per: 1, digits: 6 },
};

/** The Japanese page's October, in yen: a ¥4,500 day with ¥900 left at six. */
export const duoAmountsJa: DuoAmounts = {
  rows: [
    ['ride', 230],
    ['food', 1_280],
    ['coffee', 580],
    ['shop', 1_510],
  ],
  today: { left: 900, start: 4_500, spent: 3_600, daily: 4_500, kept: 8_460 },
  spent: { 1: 3_420, 2: 5_460, 3: 3_180, 4: 2_410, 5: 2_320, 6: 4_210, 8: 3_000 },
  diary: {
    1: [
      ['food', 380],
      ['ride', 1_240],
      ['shop', 1_800],
    ],
    2: [
      ['food', 3_200],
      ['fun', 2_000],
      ['ride', 260],
    ],
    3: [
      ['food', 680],
      ['fun', 1_980],
      ['coffee', 520],
    ],
    4: [
      ['shop', 1_650],
      ['coffee', 550],
      ['ride', 210],
    ],
    5: [
      ['food', 1_100],
      ['ride', 230],
      ['shop', 990],
    ],
    6: [
      ['food', 1_280],
      ['coffee', 450],
      ['fun', 2_480],
    ],
    8: [
      ['food', 480],
      ['coffee', 620],
      ['shop', 1_900],
    ],
  },
  pots: [128_000, 33_000, 12_000],
  standRecent: [300, 150],
};
