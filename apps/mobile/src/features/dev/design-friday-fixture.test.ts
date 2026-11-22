import { describe, expect, it } from '@jest/globals';

import { addDays, dailyNumber, diffDays, payCycleOn, VND, type LocalDate } from '@6pm/domain';
import { languages, t, type Language } from '@6pm/i18n';

import { buildDesignFriday, FRIDAY_PAYDAY, type FridayFixture } from './design-friday-fixture';
import { FRIDAY_NAMES, FRIDAY_PRICES } from './design-friday-locales';

/** The prototype's Friday: payday 31 Oct, 22 days after it. */
const FRIDAY = '2026-10-09';

/** The home currencies with a price list, and the smallest amount a day's price is a multiple of. */
const ROUND: Readonly<Record<string, number>> = {
  VND: 1_000,
  EUR: 50,
  IDR: 1_000,
  JPY: 10,
  KRW: 500,
  THB: 500,
  CNY: 100,
};
const LISTED = Object.keys(ROUND);

const LOCAL = languages.filter((language) => language !== 'en' && language !== 'vi');

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
  it('is the prototype’s own Friday in đồng, in English and Vietnamese', () => {
    for (const language of ['en', 'vi'] as const) {
      const fixture = buildDesignFriday(FRIDAY, 'VND', language);
      expect(fixture.income).toBe(17_400_000);
      expect(fixture.futureYou).toBe(2_000_000);
      expect(fixture.bills.map((bill) => [bill.name, bill.amount])).toEqual([
        ['Rent', 3_500_000],
        ['Viettel phone', 100_000],
        ['FPT internet', 220_000],
        ['EVN electricity', 380_000],
      ]);
      expect(fixture.jar).toEqual({
        name: 'Tết',
        goal: 2_250_000,
        neededBy: '2027-01',
        monthly: 750_000,
      });
      expect(
        todays(fixture, FRIDAY).map((s) => [s.time, s.merchant, s.amount, s.source, s.detail]),
      ).toEqual([
        ['07:42', 'Bánh mì Cô Ba', 25_000, 'manual', null],
        ['08:15', 'Cà phê sữa đá', 29_000, 'shared', 'MB Bank · FT26285XYZ'],
        ['12:10', 'Phở Hòa', 45_000, 'qr', 'You didn’t say if it went through'],
        ['13:30', 'Grab ride home', 38_000, 'email', 'k7m2qx@at6pm.app'],
        ['15:05', 'Trà sữa', 45_000, 'voice', null],
        ['16:40', 'Circle K', 120_000, 'shared', 'Vietcombank · FT26285ABC'],
      ]);
      const earlier = fixture.spends.filter((s) => s.day < FRIDAY);
      expect(earlier).toHaveLength(9);
      expect(sum(earlier.map((s) => s.amount))).toBe(2_365_000);
      expect(earlier.every((s) => s.merchant === 'Lunch' && s.categoryId === 'food')).toBe(true);
      const number = numberOn(fixture, FRIDAY);
      expect(number.line).toBe(351_000);
      expect(number.safe).toBe(49_000);
      expect(number.tomorrow).toBe(353_000);
    }
  });

  it('builds for every language in every home currency', () => {
    for (const language of languages) {
      for (const code of [...LISTED, 'USD', 'GBP']) {
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

  it('names nothing Vietnamese, no brand and no bank outside Vietnamese and English', () => {
    const vietnamese =
      /[ăđơưảãạằẳẵắặầẩẫấậẻẽẹềểễếệỉĩịỏõọồổỗốộờởỡớợủũụừửữứựỳỷỹỵ]|MB Bank|Vietcombank|MoMo|Grab|Circle K|Viettel|FPT|EVN/i;
    for (const language of LOCAL) {
      const fixture = buildDesignFriday(FRIDAY, 'EUR', language);
      const words = [
        fixture.jar.name,
        ...fixture.bills.map((bill) => bill.name),
        ...fixture.spends.flatMap((s) => [s.merchant, s.detail ?? '']),
      ];
      expect(words.filter((word) => vietnamese.test(word))).toEqual([]);
      expect(fixture.jar.name).not.toBe(FRIDAY_NAMES.vi.jar);
      // The coffee arrives as a bank alert and the shop as a shared photo: neither names a bank.
      const [, coffee, lunch, , , shop] = todays(fixture, FRIDAY);
      expect([coffee?.source, coffee?.detail]).toEqual(['alert', null]);
      expect([shop?.source, shop?.detail]).toEqual(['shared', null]);
      expect(lunch?.detail).toBe(t(language, 'close.card.fromQr'));
    }
  });

  it('gives every language a set of its own', () => {
    const sets = LOCAL.map((language) => JSON.stringify(FRIDAY_NAMES[language]));
    expect(new Set(sets).size).toBe(LOCAL.length);
    expect(FRIDAY_NAMES.en).toBe(FRIDAY_NAMES.vi);
  });

  it('prices by the currency alone: round local prices, whatever the language', () => {
    const coffee: Readonly<Record<string, number>> = {
      VND: 29_000,
      EUR: 350,
      IDR: 25_000,
      JPY: 480,
      KRW: 4_500,
      THB: 6_500,
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
