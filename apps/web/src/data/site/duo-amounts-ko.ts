import type { DuoAmounts } from './duo-data';
import type { DuoMoney } from './duo-money';

/** Whole won: `₩6,000`, and `₩1.5만` from ten thousand, as the app shortens it. */
export const duoMoneyKo: DuoMoney = {
  format: (amount) =>
    amount < 10_000
      ? `₩${amount.toLocaleString('ko-KR')}`
      : `₩${(amount / 10_000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만`,
  keypad: { before: '₩', after: '', per: 1, digits: 7 },
};

/** The Korean page's October, in won: a ₩45,000 day with ₩15,000 left at six. */
export const duoAmountsKo: DuoAmounts = {
  rows: [
    ['ride', 1_550],
    ['food', 11_000],
    ['coffee', 5_500],
    ['shop', 11_950],
  ],
  today: { left: 15_000, start: 45_000, spent: 30_000, daily: 45_000, kept: 96_150 },
  spent: { 1: 35_200, 2: 56_800, 3: 30_800, 4: 23_500, 5: 16_550, 6: 36_800, 8: 31_000 },
  diary: {
    1: [
      ['food', 4_800],
      ['ride', 12_400],
      ['shop', 18_000],
    ],
    2: [
      ['food', 32_000],
      ['fun', 15_000],
      ['ride', 9_800],
    ],
    3: [
      ['food', 9_500],
      ['fun', 16_800],
      ['coffee', 4_500],
    ],
    4: [
      ['shop', 16_500],
      ['coffee', 5_500],
      ['ride', 1_500],
    ],
    5: [
      ['food', 9_000],
      ['ride', 1_550],
      ['shop', 6_000],
    ],
    6: [
      ['food', 12_000],
      ['coffee', 4_800],
      ['fun', 20_000],
    ],
    8: [
      ['food', 4_500],
      ['coffee', 5_200],
      ['shop', 21_300],
    ],
  },
  pots: [1_380_000, 330_000, 120_000],
  standRecent: [3_000, 2_000],
};
