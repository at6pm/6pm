import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { BANKS, currencyOf, namesPerson, toMinor } from '@6pm/domain';
import { languages, type Language } from '@6pm/i18n';

import { fridayLine, fridayPricesIn } from './design-friday-fixture';
import { FRIDAY_HOME_CURRENCY as HOME, FRIDAY_NAMES, FRIDAY_PRICES } from './design-friday-locales';
import { bannedIn, SCRIPT, VIETNAMESE } from './design-seed-checks';
import { SEED_NAMES } from './design-seed-names';
import { SEED_PRICES, seasonHeld, seedPricesIn, yearDay, yearLine } from './design-seed-prices';

/** Every string of a list of names, however deep. */
function wordsIn(names: unknown): string[] {
  if (typeof names === 'string') return [names];
  if (names === null || typeof names !== 'object') return [];
  return Object.values(names).flatMap(wordsIn);
}

/** Every amount of a list of prices, however deep. */
function amountsIn(prices: unknown): number[] {
  if (typeof prices === 'number') return [prices];
  if (prices === null || typeof prices !== 'object') return [];
  return Object.values(prices).flatMap(amountsIn);
}

/** What the jars, owed, year, money-in and season seeds call things in a language. */
const wordsOf = (language: Language) => [
  ...wordsIn(SEED_NAMES[language]),
  FRIDAY_NAMES[language].trip,
];

const between = (value: number, low: number, high: number) => {
  expect(value).toBeGreaterThanOrEqual(low);
  expect(value).toBeLessThanOrEqual(high);
};

describe('the seeds that build on the Friday', () => {
  it('names everything in each language, in its own writing, and nothing twice', () => {
    for (const language of languages) {
      const own = wordsOf(language);
      expect(own.every((word) => word.trim() === word && word.length > 0)).toBe(true);
      // Nothing twice, but the friend a bank prints just as the person wrote them.
      const { friends, payer } = SEED_NAMES[language].owed;
      const twice = own.filter((word, index) => own.indexOf(word) !== index);
      expect(twice.filter((word) => !(word === payer && word === friends[0]))).toEqual([]);
      // Nothing the Friday already calls something else.
      const friday = new Set(wordsIn(FRIDAY_NAMES[language]));
      expect(
        own.filter((word) => word !== FRIDAY_NAMES[language].trip && friday.has(word)),
      ).toEqual([]);
      for (const other of languages) {
        if (other === language) continue;
        const theirs = new Set([...wordsOf(other), ...wordsIn(FRIDAY_NAMES[other])]);
        expect(own.filter((word) => theirs.has(word))).toEqual([]);
      }
      if (language !== 'vi') expect(own.filter((word) => VIETNAMESE.test(word))).toEqual([]);
      const script = SCRIPT[language];
      if (script) expect(own.filter((word) => !script.test(word))).toEqual([]);
      else expect(own.filter((word) => /[^ -ɏḀ-ỿ’]/.test(word))).toEqual([]);
    }
    // English is plain English, and Vietnamese is not English: what a person writes carries
    // Vietnamese letters, and what a bank prints is unaccented capitals.
    expect(wordsOf('en').filter((word) => !/^[A-Za-z ,]+$/.test(word))).toEqual([]);
    const { owed, moneyIn } = SEED_NAMES.vi;
    const printed = new Set([owed.payer, owed.memo, ...wordsIn(moneyIn)]);
    const written = wordsOf('vi').filter((word) => !printed.has(word));
    expect(written.filter((word) => !VIETNAMESE.test(word) && word.length > 4)).toEqual([]);
  });

  it('names no real bank, wallet or brand', () => {
    for (const language of languages) {
      expect(wordsOf(language).filter((word) => bannedIn(word).length > 0)).toEqual([]);
    }
    // Nor does any seed's own file, outside what a list holds: a brand, or a bank by its name.
    const brands = [
      ...['Vietcombank', 'Techcombank', 'techcombank', 'VPBank', 'MB Bank', 'MoMo', 'ZaloPay'],
      ...['Shopee', 'shopee', 'Grab', 'Circle K', 'Highlands', 'Vietjet', 'Manwah', 'Viettel'],
      ...['Phương Trang', 'Điện Máy Xanh', 'Bách hoá Xanh', 'Phở Hòa', 'Phở Hoà', 'Cô Ba'],
      ...BANKS.map((bank) => bank.shortName).filter((name) => name.length > 5),
    ];
    const files = [
      ...['design-friday-fixture.ts', 'design-friday-locales.ts', 'design-friday-seed.ts'],
      ...['design-seed-names.ts', 'design-seed-prices.ts', 'design-jars-seed.ts'],
      ...['design-owed-seed.ts', 'design-tet-seed.ts', 'design-year-seed.ts'],
      ...['design-capture-health-seed.ts', 'design-money-in-seed.ts', 'design-streak-seed.ts'],
    ];
    for (const file of files) {
      const source = readFileSync(join(__dirname, file), 'utf8');
      expect([file, brands.filter((brand) => source.includes(brand))]).toEqual([file, []]);
      // No transfer code, and no receipt worded as a bank's.
      expect([file, /FT\d{5}/.test(source), /detail: '[^']* · /.test(source)]).toEqual([
        file,
        false,
        false,
      ]);
    }
  });

  it('prints the friend who pays back as the bank would, so the payback is theirs', () => {
    for (const language of languages) {
      const { friends, payer } = SEED_NAMES[language].owed;
      // Names are matched in Latin letters only: where they are, the payback is the first
      // friend's and nobody else's. In another script the sender still carries that friend's name.
      const theirs = (friend: string) =>
        SCRIPT[language] ? payer.includes(friend) : namesPerson(payer, friend);
      expect(friends.map(theirs)).toEqual([true, false, false]);
    }
  });

  it('prices every home currency by hand, in step with its Friday', () => {
    for (const language of languages) {
      const code = HOME[language];
      const currency = currencyOf(code);
      const list = SEED_PRICES[code];
      const friday = FRIDAY_PRICES[code];
      if (!list || !friday) throw new Error(`${code} has no price list`);
      const prices = seedPricesIn(currency);
      expect(amountsIn(prices).every((amount) => Number.isInteger(amount) && amount > 0)).toBe(
        true,
      );
      const line = fridayLine(currency);
      const income = toMinor(friday.income, currency);
      const { jars, moneyIn, bonus } = prices;

      // The jars: each holds less than its goal, the trip covers its hotel and not its flight.
      expect(jars.futureYouHeld).toBe(jars.futureYou * 8);
      for (const jar of [jars.season, jars.trip, jars.rainyDay, jars.phone, jars.bike]) {
        between(jar.held / jar.goal, 0.1, 0.95);
      }
      expect(jars.home.mine + jars.home.theirs).toBeLessThan(jars.home.goal);
      expect(jars.bus).toBeLessThan(jars.hotel);
      expect(jars.hotel).toBeLessThan(jars.trip.goal);
      expect(jars.flight).toBeGreaterThan(jars.trip.goal);
      between(jars.trip.goal / line, 5, 20);
      between(jars.bigBuy / income, 0.3, 0.6);
      between(jars.spentBefore / line, 5, 10);
      if (code !== 'VND') {
        // The same Future you and the same set-aside each cycle as the Friday's dated jar, and
        // the trip and the rainy day take little enough to leave the day's line standing.
        expect(jars.futureYou).toBe(toMinor(friday.futureYou, currency));
        expect(jars.season.goal - jars.season.held).toBe(toMinor(friday.jarGoal, currency));
        expect(jars.trip.goal - jars.trip.held + jars.rainyDay.monthly).toBeLessThanOrEqual(
          line * 3,
        );
        expect(bonus.income).toBeNull();
        expect(bonus.jarGoal).toBe(toMinor(friday.jarGoal, currency));
      }
      // Nearer its month the season's jar holds more, so each cycle sets aside the same.
      expect(seasonHeld(jars.season, 3)).toBe(jars.season.held);
      expect(seasonHeld(jars.season, 12)).toBe(jars.season.held);
      expect((jars.season.goal - seasonHeld(jars.season, 1)) * 3).toBeCloseTo(
        jars.season.goal - jars.season.held,
        -1,
      );

      // A dinner share, a gift and an order are everyday sums; the pay is a little over the
      // plan's and the bonus over half a month's.
      between(prices.owedDinner / 4 / line, 0.3, 1.2);
      between(prices.groceries / line, 0.2, 0.7);
      between(moneyIn.pay / income, 1.02, 1.2);
      between(moneyIn.gift / line, 1, 8);
      between(moneyIn.order / line, 0.3, 1.5);
      between(moneyIn.cushionGoal / income, 1.5, 3);
      between(bonus.amount / (bonus.income ?? income), 0.5, 1);
      expect(bonus.jarHeld).toBeLessThan(bonus.jarGoal);
      expect(bonus.amount).toBeGreaterThan(bonus.jarGoal - bonus.jarHeld);
    }
  });

  it('takes the canvases’ amounts by rate only in a currency with no list', () => {
    expect(SEED_PRICES['GBP']).toBeUndefined();
    const pounds = seedPricesIn(currencyOf('GBP'));
    expect(pounds.owedDinner).toBe(Math.round((1_200_000 / 26_000) * 0.78 * 100));
    expect(seedPricesIn(currencyOf('VND')).jars.season).toEqual({
      goal: 7_000_000,
      held: 2_100_000,
    });
    expect(seedPricesIn(currencyOf('USD')).moneyIn.order).toBe(3_499);
  });

  it('fills the year with the Friday’s own places at local prices', () => {
    for (const language of languages) {
      const currency = currencyOf(HOME[language]);
      const names = FRIDAY_NAMES[language];
      const prices = fridayPricesIn(currency).today;
      const seed = seedPricesIn(currency);
      const line = yearLine(currency);
      expect(line).toBe(fridayLine(currency));
      const places = new Set<string>([
        names.breakfast,
        names.coffee,
        names.lunch,
        names.ride,
        names.shop,
        names.earlier.supermarket,
      ]);
      let under = 0;
      const days = 300;
      for (let n = 0; n < days; n++) {
        const day = yearDay(n, names, currency);
        expect([2, 3]).toContain(day.length);
        expect(new Set(day.map((s) => s.merchant)).size).toBe(day.length);
        for (const spend of day) {
          expect(places.has(spend.merchant)).toBe(true);
          expect(spend.amount % seed.coin).toBe(0);
          const base =
            spend.merchant === names.earlier.supermarket
              ? seed.groceries
              : spend.merchant === names.coffee
                ? prices.coffee
                : null;
          if (base !== null) between(spend.amount / base, 0.98, 2);
          // A card payment comes from the bank's alert, lunch by QR, the shop from its receipt.
          expect(['alert', 'qr', 'shared', 'manual']).toContain(spend.source);
          expect(spend.source === 'manual').toBe(spend.merchant === names.breakfast);
        }
        const spent = day.reduce((sum, s) => sum + s.amount, 0);
        expect(spent).toBeLessThan(line * 2);
        if (spent <= line) under++;
      }
      // Most days end under the line.
      between(under / days, 0.6, 1);
    }
    // Long amounts on request.
    const dollars = currencyOf('USD');
    const [first] = yearDay(1, FRIDAY_NAMES.en, dollars);
    const [long] = yearDay(1, FRIDAY_NAMES.en, dollars, 100);
    expect((long?.amount ?? 0) / (first?.amount ?? 1)).toBeCloseTo(100, 0);
    expect(yearLine(dollars, 100)).toBe(650_000);
  });
});
