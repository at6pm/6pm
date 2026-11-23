import { describe, expect, it } from '@jest/globals';

import {
  addDays,
  BANKS,
  dailyNumber,
  diffDays,
  payCycleOn,
  toMinor,
  VND,
  type LocalDate,
} from '@6pm/domain';
import { languages, t, type Language } from '@6pm/i18n';

import { buildDesignFriday, FRIDAY_PAYDAY, type FridayFixture } from './design-friday-fixture';
import { FRIDAY_NAMES, FRIDAY_PRICES } from './design-friday-locales';

/** The prototype's Friday: payday 31 Oct, 22 days after it. */
const FRIDAY = '2026-10-09';

/** The home currencies with a price list, and the smallest amount a day's price is a multiple of. */
const ROUND: Readonly<Record<string, number>> = {
  VND: 1_000,
  USD: 50,
  EUR: 10,
  IDR: 1_000,
  JPY: 10,
  KRW: 500,
  THB: 500,
  CNY: 100,
};
const LISTED = Object.keys(ROUND);

/** The currency each language's screenshots are seeded in: where it is mostly spoken. */
const HOME: Readonly<Record<Language, string>> = {
  en: 'USD',
  vi: 'VND',
  de: 'EUR',
  es: 'EUR',
  fr: 'EUR',
  id: 'IDR',
  ja: 'JPY',
  ko: 'KRW',
  th: 'THB',
  'zh-Hans': 'CNY',
};

/**
 * What a coffee and a month's take-home pay cost where each currency is spent, lowest and highest,
 * in whole units: a list outside them is a price by rate, not a local one.
 */
const LOCAL_RANGE: Readonly<Record<string, { coffee: [number, number]; pay: [number, number] }>> = {
  VND: { coffee: [20_000, 65_000], pay: [9_000_000, 30_000_000] },
  USD: { coffee: [3, 7], pay: [2_800, 6_500] },
  EUR: { coffee: [2.5, 5], pay: [1_700, 3_800] },
  IDR: { coffee: [15_000, 45_000], pay: [5_000_000, 15_000_000] },
  JPY: { coffee: [300, 700], pay: [200_000, 400_000] },
  KRW: { coffee: [3_000, 7_000], pay: [2_300_000, 4_500_000] },
  THB: { coffee: [45, 130], pay: [18_000, 50_000] },
  CNY: { coffee: [10, 35], pay: [6_000, 20_000] },
};

/**
 * Real names that must never be in sample data, with every bank the app knows: banks and wallets,
 * ride and delivery apps, shop and phone brands.
 */
const BANNED = [
  ...BANKS.flatMap((bank) => [bank.shortName, bank.name]),
  ...['MB Bank', 'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'TPBank', 'VPBank'],
  ...['MoMo', 'ZaloPay', 'VNPay', 'ShopeePay', 'Viettel', 'FPT', 'EVN', 'Grab', 'Gojek'],
  ...['Circle K', '7-Eleven', 'Starbucks', 'Uber', 'PayPal', 'Venmo', 'Revolut', 'Chase'],
  ...['Sparkasse', 'GoPay', 'OVO', 'DANA', 'PromptPay', 'PayPay', 'LINE Pay', 'Alipay'],
  ...['WeChat', '카카오', '토스', '支付宝', '微信', 'セブン', 'เซเว่น'],
].filter((name) => name.length > 2);

/** Every word of the fixture a person reads, the catalogue's own aside. */
function wordsOf(fixture: FridayFixture, language: Language): string[] {
  const catalogue = new Set([t(language, 'close.card.fromQr'), 'k7m2qx@at6pm.app']);
  return [
    fixture.jar.name,
    ...fixture.bills.map((bill) => bill.name),
    ...fixture.spends.flatMap((s) => [s.merchant, s.detail ?? '']),
  ].filter((word) => word !== '' && !catalogue.has(word));
}

/** Letters only Vietnamese writes. */
const VIETNAMESE = /[ăđơưảãạằẳẵắặầẩẫấậẻẽẹềểễếệỉĩịỏõọồổỗốộờởỡớợủũụừửữứựỳỷỹỵ]/i;

/** The script a language is written in, where it is not Latin. */
const SCRIPT: Partial<Record<Language, RegExp>> = {
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
  th: /[\u0e00-\u0e7f]/,
  'zh-Hans': /[\u4e00-\u9fff]/,
};

const sum = (amounts: readonly number[]) => amounts.reduce((total, amount) => total + amount, 0);

const billsOf = (fixture: FridayFixture) => sum(fixture.bills.map((bill) => bill.amount));

/** The day's number as the app works it out from what the fixture wrote. */
function numberOn(fixture: FridayFixture, day: LocalDate) {
  return dailyNumber({
    plan: {
      income: fixture.income,
      bills: billsOf(fixture),
      futureYou: fixture.futureYou,
      occasions: fixture.jar.monthly,
      topUps: 0,
    },
    spentBefore: sum(fixture.spends.filter((s) => s.day < day).map((s) => s.amount)),
    today: fixture.spends
      .filter((s) => s.day === day)
      .map((s) => ({ amount: s.amount, category: s.categoryId, status: s.status })),
    notDaily: new Set(),
    daysLeft: payCycleOn(day, FRIDAY_PAYDAY).daysLeft,
    currency: fixture.currency,
  });
}

const todays = (fixture: FridayFixture, day: LocalDate) =>
  fixture.spends.filter((s) => s.day === day);

describe('buildDesignFriday', () => {
  it('keeps the prototype’s amounts in đồng, in English and Vietnamese', () => {
    for (const language of ['en', 'vi'] as const) {
      const fixture = buildDesignFriday(FRIDAY, 'VND', language);
      const names = FRIDAY_NAMES[language];
      expect(fixture.income).toBe(17_400_000);
      expect(fixture.futureYou).toBe(2_000_000);
      expect(fixture.bills.map((bill) => [bill.name, bill.amount])).toEqual([
        [names.bills.rent, 3_500_000],
        [names.bills.phone, 100_000],
        [names.bills.internet, 220_000],
        [names.bills.power, 380_000],
      ]);
      expect(fixture.jar).toEqual({
        name: names.jar,
        goal: 2_250_000,
        neededBy: '2027-01',
        monthly: 750_000,
      });
      expect(todays(fixture, FRIDAY).map((s) => [s.time, s.merchant, s.amount])).toEqual([
        ['07:42', names.breakfast, 25_000],
        ['08:15', names.coffee, 29_000],
        ['12:10', names.lunch, 45_000],
        ['13:30', names.ride, 38_000],
        ['15:05', names.treat, 45_000],
        ['16:40', names.shop, 120_000],
      ]);
      const earlier = fixture.spends.filter((s) => s.day < FRIDAY);
      expect(earlier).toHaveLength(9);
      expect(sum(earlier.map((s) => s.amount))).toBe(2_365_000);
      const number = numberOn(fixture, FRIDAY);
      expect(number.line).toBe(351_000);
      expect(number.safe).toBe(49_000);
      expect(number.tomorrow).toBe(353_000);
    }
  });

  it('names the Friday in English for English and in Vietnamese for Vietnamese', () => {
    const english = buildDesignFriday(FRIDAY, 'USD', 'en');
    expect(todays(english, FRIDAY).map((s) => s.merchant)).toEqual([
      'Bakery',
      'Coffee shop',
      'Noodle bar',
      'Ride home',
      'Iced tea',
      'Corner store',
    ]);
    expect(english.bills.map((bill) => bill.name)).toEqual([
      'Rent',
      'Phone',
      'Internet',
      'Electricity',
    ]);
    expect(wordsOf(english, 'en').filter((word) => !/^[A-Za-z ]+$/.test(word))).toEqual([]);

    // Every Vietnamese name is written with Vietnamese letters, but for the word it borrowed.
    const vietnamese = buildDesignFriday(FRIDAY, 'VND', 'vi');
    const plain = wordsOf(vietnamese, 'vi').filter((word) => !VIETNAMESE.test(word));
    expect([...new Set(plain)]).toEqual(['Internet']);
  });

  it('catches every spend the way such a spend arrives', () => {
    for (const language of languages) {
      const fixture = buildDesignFriday(FRIDAY, HOME[language], language);
      expect(todays(fixture, FRIDAY).map((s) => [s.source, s.status, s.detail])).toEqual([
        // Cash at breakfast, typed.
        ['manual', 'kept', null],
        // The coffee by card: a bank alert, worded with no bank's name.
        ['alert', 'caught', null],
        // Lunch by QR, never confirmed.
        ['qr', 'pending', t(language, 'close.card.fromQr')],
        // The ride's emailed receipt.
        ['email', 'caught', 'k7m2qx@at6pm.app'],
        // The afternoon drink, said aloud.
        ['voice', 'kept', null],
        // One photo of the shop's receipt, and the day's only one.
        ['shared', 'caught', null],
      ]);
      // The earlier days: card payments from alerts and cash typed or said, all kept.
      const earlier = fixture.spends.filter((s) => s.day < FRIDAY);
      expect(new Set(earlier.map((s) => s.source))).toEqual(new Set(['alert', 'manual', 'voice']));
      expect(earlier.every((s) => s.status === 'kept' && s.detail === null)).toBe(true);
      const names = FRIDAY_NAMES[language].earlier;
      for (const spend of earlier) {
        const card = spend.merchant === names.supermarket || spend.merchant === names.pharmacy;
        expect(spend.source === 'alert').toBe(card);
      }
      // No two days in a row read alike.
      for (const [index, spend] of earlier.entries()) {
        const next = earlier[index + 1];
        if (!next) continue;
        expect(next.merchant).not.toBe(spend.merchant);
        expect(next.amount).not.toBe(spend.amount);
      }
    }
  });

  it('builds for every language in every home currency', () => {
    for (const language of languages) {
      for (const code of [...LISTED, 'GBP', 'AUD']) {
        const fixture = buildDesignFriday(FRIDAY, code, language);
        const amounts = [
          fixture.income,
          fixture.futureYou,
          fixture.jar.goal,
          fixture.jar.monthly,
          ...fixture.bills.map((bill) => bill.amount),
          ...fixture.spends.map((s) => s.amount),
          ...fixture.closedDays.flatMap((d) => [d.spent, d.line, d.tomorrow]),
        ];
        expect(amounts.every((amount) => Number.isInteger(amount) && amount > 0)).toBe(true);
        expect(fixture.currency.code).toBe(code);
        expect(fixture.bills).toHaveLength(4);
        expect(todays(fixture, FRIDAY)).toHaveLength(6);
        const ids = new Set<string>(fixture.categories.map((category) => category.id));
        expect(fixture.spends.every((s) => ids.has(s.categoryId))).toBe(true);
        expect(fixture.categories.map((category) => category.name)).toEqual(
          fixture.categories.map((category) => t(language, `onboarding.category.${category.id}`)),
        );
      }
    }
  });

  it('names no real bank, wallet or brand in any language', () => {
    for (const language of languages) {
      const fixture = buildDesignFriday(FRIDAY, HOME[language], language);
      const words = [
        ...wordsOf(fixture, language),
        ...Object.values(FRIDAY_NAMES[language].earlier),
      ];
      const named = words.filter((word) =>
        BANNED.some((name) => word.toLowerCase().includes(name.toLowerCase())),
      );
      expect(named).toEqual([]);
    }
  });

  it('gives every language names of its own, in its own writing', () => {
    // A word two languages share is one both write the same way.
    const shared = new Set(['Internet']);
    const all = (language: Language) => {
      const names = FRIDAY_NAMES[language];
      const { earlier, bills, ...day } = names;
      return [...Object.values(day), ...Object.values(earlier), ...Object.values(bills)];
    };
    for (const language of languages) {
      const own = all(language);
      expect(own.every((word) => word.trim() === word && word.length > 0)).toBe(true);
      expect(new Set(own).size).toBe(own.length);
      for (const other of languages) {
        if (other === language) continue;
        const theirs = new Set(all(other));
        expect(own.filter((word) => theirs.has(word) && !shared.has(word))).toEqual([]);
      }
      // Vietnamese letters only in Vietnamese, and each other script in every name of its own.
      if (language !== 'vi') expect(own.filter((word) => VIETNAMESE.test(word))).toEqual([]);
      const script = SCRIPT[language];
      if (script) expect(own.filter((word) => !script.test(word))).toEqual([]);
      else expect(own.filter((word) => /[^ -\u024f\u1e00-\u1eff’]/.test(word))).toEqual([]);
    }
  });

  it('prices by the currency alone: round local prices, whatever the language', () => {
    const coffee: Readonly<Record<string, number>> = {
      VND: 29_000,
      USD: 450,
      EUR: 380,
      IDR: 28_000,
      JPY: 480,
      KRW: 5_500,
      THB: 8_500,
      CNY: 1_800,
    };
    for (const code of LISTED) {
      const amountsIn = (language: Language) =>
        buildDesignFriday(FRIDAY, code, language).spends.map((s) => s.amount);
      expect(amountsIn('de')).toEqual(amountsIn('vi'));
      const fixture = buildDesignFriday(FRIDAY, code, 'en');
      const day = todays(fixture, FRIDAY);
      expect(day[1]?.amount).toBe(coffee[code]);
      const unit = ROUND[code] ?? 1;
      expect(day.filter((s) => s.amount % unit !== 0)).toEqual([]);
      // The jar is three paydays away and its goal divides into them.
      expect(fixture.jar.monthly * 3).toBe(fixture.jar.goal);
    }
  });

  it('prices every language’s home currency by hand, as real life there costs', () => {
    for (const language of languages) {
      const code = HOME[language];
      const list = FRIDAY_PRICES[code];
      const range = LOCAL_RANGE[code];
      if (!list || !range) throw new Error(`${code} has no price list`);
      expect(list.today.coffee).toBeGreaterThanOrEqual(range.coffee[0]);
      expect(list.today.coffee).toBeLessThanOrEqual(range.coffee[1]);
      expect(list.income).toBeGreaterThanOrEqual(range.pay[0]);
      expect(list.income).toBeLessThanOrEqual(range.pay[1]);

      const fixture = buildDesignFriday(FRIDAY, code, language);
      const { income } = fixture;
      const [rent = 0, ...utilities] = fixture.bills.map((bill) => bill.amount);
      // Rent is the big bill, a fifth to two fifths of pay; each of the others is small change.
      expect(rent / income).toBeGreaterThanOrEqual(0.18);
      expect(rent / income).toBeLessThanOrEqual(0.4);
      expect(utilities.every((amount) => amount < income * 0.05)).toBe(true);
      expect(fixture.futureYou / income).toBeGreaterThanOrEqual(0.08);
      expect(fixture.futureYou / income).toBeLessThanOrEqual(0.15);
      expect(fixture.jar.monthly / income).toBeGreaterThanOrEqual(0.03);
      expect(fixture.jar.monthly / income).toBeLessThanOrEqual(0.08);

      // The day: a line a person could live on, six small spends, a little left at six.
      const number = numberOn(fixture, FRIDAY);
      const coffee = toMinor(list.today.coffee, fixture.currency);
      expect(number.line / coffee).toBeGreaterThanOrEqual(5);
      expect(number.line / coffee).toBeLessThanOrEqual(15);
      expect(number.safe / number.line).toBeGreaterThanOrEqual(0.05);
      expect(number.safe / number.line).toBeLessThanOrEqual(0.25);
      const day = todays(fixture, FRIDAY).map((s) => s.amount);
      expect(Math.max(...day)).toBeLessThan(number.line / 2);
      expect(Math.min(...day)).toBeGreaterThanOrEqual(coffee * 0.4);
      // No earlier day spent more than its line, nor next to nothing.
      for (const spend of fixture.spends.filter((s) => s.day < FRIDAY)) {
        expect(spend.amount).toBeLessThan(number.line);
        expect(spend.amount).toBeGreaterThan(number.line / 2);
      }
    }
  });

  it('takes the prototype’s amounts by rate in a currency with no list', () => {
    expect(FRIDAY_PRICES['GBP']).toBeUndefined();
    const fixture = buildDesignFriday(FRIDAY, 'GBP', 'en');
    const pence = (dong: number) => Math.round((dong / VND.perUsd) * 0.78 * 100);
    expect(fixture.income).toBe(pence(17_400_000));
    expect(todays(fixture, FRIDAY).map((s) => s.amount)).toEqual(
      [25_000, 29_000, 45_000, 38_000, 45_000, 120_000].map(pence),
    );
  });

  it('adds up on every day of a year, in every listed currency', () => {
    for (const [index, code] of LISTED.entries()) {
      const language = languages[index % languages.length] ?? 'en';
      for (let d = 0; d < 400; d++) {
        const today = addDays('2026-09-28', d);
        const cycle = payCycleOn(today, FRIDAY_PAYDAY);
        const fixture = buildDesignFriday(today, code, language);
        const free = fixture.income - billsOf(fixture) - fixture.futureYou - fixture.jar.monthly;
        expect(free).toBeGreaterThan(0);

        // One spend at most on each earlier day of the cycle, none before it or after today.
        const earlier = fixture.spends.filter((s) => s.day !== today);
        expect(earlier.every((s) => s.day >= cycle.start && s.day < today)).toBe(true);
        expect(new Set(earlier.map((s) => s.day)).size).toBe(earlier.length);

        // Today: spending sits under the line, the cycle is not overspent, tomorrow is no lower.
        const number = numberOn(fixture, today);
        expect(number.safe).toBeGreaterThan(0);
        expect(number.overspent).toBe(false);
        expect(number.replan).toBe(false);

        // A closed day is one of this week's, never the Wednesday, and holds what the engine
        // gives it from the days before: what it spent, its line and the tomorrow it promised.
        for (const closed of fixture.closedDays) {
          expect(closed.day < today && closed.day >= cycle.start).toBe(true);
          expect(diffDays(today, closed.day)).toBeLessThanOrEqual(6);
          expect(new Date(`${closed.day}T12:00:00`).getDay()).not.toBe(3);
          const then = numberOn(fixture, closed.day);
          expect(closed.spent).toBe(sum(todays(fixture, closed.day).map((s) => s.amount)));
          expect([closed.line, closed.tomorrow]).toEqual([then.line, then.tomorrow]);
          expect(closed.spent).toBeLessThanOrEqual(closed.line);
        }
      }
    }
  });

  it('holds the prototype’s line through the cycle, so any capture day reads like its Friday', () => {
    for (const code of LISTED) {
      const designed = numberOn(buildDesignFriday(FRIDAY, code, 'en'), FRIDAY).line;
      for (let d = 5; d <= 30; d++) {
        const today = `2026-10-${String(d).padStart(2, '0')}`;
        const line = numberOn(buildDesignFriday(today, code, 'en'), today).line;
        expect(Math.abs(line - designed)).toBeLessThanOrEqual(designed * 0.01);
      }
    }
  });
});
