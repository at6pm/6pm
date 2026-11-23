import { toMinor, VND, type Currency, type Money, type SpendSource } from '@6pm/domain';

import { fridayLine, fridayPricesIn } from './design-friday-fixture';
import type { FridayCategoryId, FridayNames } from './design-friday-locales';

/**
 * What the seeds that build on the Friday cost in one currency, in whole units of it: the jars of
 * the Pots shelf, the dinner that was split, money that came in, the year-end bonus, and what the
 * year's days are priced from.
 */
export interface SeedPrices {
  /** The smallest amount an everyday price is told in (25 cents, 1.000₫). */
  readonly coin: number;
  /** A supermarket shop, on the year's days. */
  readonly groceries: number;
  readonly jars: {
    /** What Future you takes each payday. */
    readonly futureYou: number;
    readonly futureYouHeld: number;
    /** A first month: what went before 6pm was set up. */
    readonly spentBefore: number;
    /** The season's jar, and what it holds three paydays before its month. */
    readonly season: { readonly goal: number; readonly held: number };
    /** The trip, due this month. */
    readonly trip: { readonly goal: number; readonly held: number };
    readonly rainyDay: { readonly goal: number; readonly held: number; readonly monthly: number };
    readonly phone: { readonly goal: number; readonly held: number };
    readonly bike: { readonly goal: number; readonly held: number };
    /** The jar shared with a partner, and what each has put in. */
    readonly home: { readonly goal: number; readonly mine: number; readonly theirs: number };
    readonly bus: number;
    readonly hotel: number;
    readonly flight: number;
    readonly bigBuy: number;
  };
  /** The dinner split four ways, in all. */
  readonly owedDinner: number;
  readonly moneyIn: {
    readonly cushionGoal: number;
    readonly order: number;
    /** This month's pay as it arrived: a little above the plan's. */
    readonly pay: number;
    readonly gift: number;
  };
  readonly bonus: {
    /** The plan's income in the bonus's acceptance case; null keeps the Friday's pay. */
    readonly income: number | null;
    readonly jarGoal: number;
    readonly jarHeld: number;
    readonly amount: number;
  };
}

/** The Pots, Plan, Who Owes Me, Money In and Tết Season canvases' own amounts, in đồng. */
const DESIGN_SEED_PRICES: SeedPrices = {
  coin: 1_000,
  groceries: 120_000,
  jars: {
    futureYou: 2_100_000,
    futureYouHeld: 16_800_000,
    spentBefore: 2_400_000,
    season: { goal: 7_000_000, held: 2_100_000 },
    trip: { goal: 6_000_000, held: 3_500_000 },
    rainyDay: { goal: 12_600_000, held: 5_000_000, monthly: 400_000 },
    phone: { goal: 9_000_000, held: 1_500_000 },
    bike: { goal: 1_500_000, held: 400_000 },
    home: { goal: 5_000_000, mine: 1_400_000, theirs: 1_200_000 },
    bus: 350_000,
    hotel: 1_200_000,
    flight: 7_000_000,
    bigBuy: 9_000_000,
  },
  owedDinner: 1_200_000,
  moneyIn: { cushionGoal: 30_000_000, order: 349_000, pay: 19_000_000, gift: 2_000_000 },
  bonus: { income: 15_000_000, jarGoal: 5_000_000, jarHeld: 3_000_000, amount: 9_000_000 },
};

/**
 * Hand-set amounts where each home currency is spent, in step with its Friday: the same Future
 * you, a season's jar that takes what the Friday's dated jar takes each cycle, and a trip and a
 * rainy-day jar small enough to leave the day's line standing. A currency with no list takes the
 * canvases' amounts by its rough rate.
 */
export const SEED_PRICES: Readonly<Record<string, SeedPrices>> = {
  VND: DESIGN_SEED_PRICES,
  USD: {
    coin: 0.25,
    groceries: 24,
    jars: {
      futureYou: 400,
      futureYouHeld: 3_200,
      spentBefore: 480,
      season: { goal: 900, held: 300 },
      trip: { goal: 700, held: 620 },
      rainyDay: { goal: 3_000, held: 1_200, monthly: 60 },
      phone: { goal: 900, held: 150 },
      bike: { goal: 400, held: 100 },
      home: { goal: 1_000, mine: 280, theirs: 240 },
      bus: 28,
      hotel: 140,
      flight: 820,
      bigBuy: 1_900,
    },
    owedDinner: 120,
    moneyIn: { cushionGoal: 8_000, order: 34.99, pay: 4_600, gift: 200 },
    bonus: { income: null, jarGoal: 600, jarHeld: 350, amount: 2_500 },
  },
  EUR: {
    coin: 0.1,
    groceries: 16,
    jars: {
      futureYou: 250,
      futureYouHeld: 2_000,
      spentBefore: 290,
      season: { goal: 700, held: 250 },
      trip: { goal: 500, held: 440 },
      rainyDay: { goal: 2_000, held: 800, monthly: 40 },
      phone: { goal: 800, held: 130 },
      bike: { goal: 350, held: 90 },
      home: { goal: 800, mine: 220, theirs: 190 },
      bus: 24,
      hotel: 95,
      flight: 560,
      bigBuy: 1_200,
    },
    owedDinner: 96,
    moneyIn: { cushionGoal: 5_000, order: 29.9, pay: 2_850, gift: 150 },
    bonus: { income: null, jarGoal: 450, jarHeld: 250, amount: 1_500 },
  },
  IDR: {
    coin: 500,
    groceries: 55_000,
    jars: {
      futureYou: 1_000_000,
      futureYouHeld: 8_000_000,
      spentBefore: 1_050_000,
      season: { goal: 2_500_000, held: 1_000_000 },
      trip: { goal: 3_000_000, held: 2_800_000 },
      rainyDay: { goal: 6_000_000, held: 2_400_000, monthly: 150_000 },
      phone: { goal: 4_000_000, held: 700_000 },
      bike: { goal: 1_500_000, held: 400_000 },
      home: { goal: 3_000_000, mine: 840_000, theirs: 720_000 },
      bus: 150_000,
      hotel: 600_000,
      flight: 3_400_000,
      bigBuy: 4_000_000,
    },
    owedDinner: 400_000,
    moneyIn: { cushionGoal: 18_000_000, order: 189_000, pay: 9_800_000, gift: 500_000 },
    bonus: { income: null, jarGoal: 1_500_000, jarHeld: 900_000, amount: 5_000_000 },
  },
  JPY: {
    coin: 10,
    groceries: 1_800,
    jars: {
      futureYou: 30_000,
      futureYouHeld: 240_000,
      spentBefore: 33_000,
      season: { goal: 70_000, held: 25_000 },
      trip: { goal: 60_000, held: 54_000 },
      rainyDay: { goal: 200_000, held: 80_000, monthly: 5_000 },
      phone: { goal: 120_000, held: 20_000 },
      bike: { goal: 30_000, held: 8_000 },
      home: { goal: 100_000, mine: 28_000, theirs: 24_000 },
      bus: 2_800,
      hotel: 12_000,
      flight: 68_000,
      bigBuy: 130_000,
    },
    owedDinner: 12_000,
    moneyIn: { cushionGoal: 500_000, order: 3_980, pay: 305_000, gift: 10_000 },
    bonus: { income: null, jarGoal: 45_000, jarHeld: 27_000, amount: 160_000 },
  },
  KRW: {
    coin: 100,
    groceries: 22_000,
    jars: {
      futureYou: 400_000,
      futureYouHeld: 3_200_000,
      spentBefore: 420_000,
      season: { goal: 900_000, held: 300_000 },
      trip: { goal: 600_000, held: 530_000 },
      rainyDay: { goal: 2_000_000, held: 800_000, monthly: 60_000 },
      phone: { goal: 1_200_000, held: 200_000 },
      bike: { goal: 300_000, held: 80_000 },
      home: { goal: 1_000_000, mine: 280_000, theirs: 240_000 },
      bus: 24_000,
      hotel: 110_000,
      flight: 680_000,
      bigBuy: 1_600_000,
    },
    owedDinner: 120_000,
    moneyIn: { cushionGoal: 6_000_000, order: 39_000, pay: 3_500_000, gift: 100_000 },
    bonus: { income: null, jarGoal: 600_000, jarHeld: 350_000, amount: 2_000_000 },
  },
  THB: {
    coin: 1,
    groceries: 210,
    jars: {
      futureYou: 3_000,
      futureYouHeld: 24_000,
      spentBefore: 3_900,
      season: { goal: 7_000, held: 2_500 },
      trip: { goal: 6_000, held: 5_300 },
      rainyDay: { goal: 20_000, held: 8_000, monthly: 500 },
      phone: { goal: 15_000, held: 2_500 },
      bike: { goal: 4_000, held: 1_000 },
      home: { goal: 10_000, mine: 2_800, theirs: 2_400 },
      bus: 320,
      hotel: 1_400,
      flight: 6_800,
      bigBuy: 15_000,
    },
    owedDinner: 1_600,
    moneyIn: { cushionGoal: 60_000, order: 590, pay: 35_000, gift: 1_000 },
    bonus: { income: null, jarGoal: 4_500, jarHeld: 2_700, amount: 18_000 },
  },
  CNY: {
    coin: 0.5,
    groceries: 70,
    jars: {
      futureYou: 1_500,
      futureYouHeld: 12_000,
      spentBefore: 1_350,
      season: { goal: 2_800, held: 1_000 },
      trip: { goal: 2_500, held: 2_250 },
      rainyDay: { goal: 8_000, held: 3_200, monthly: 200 },
      phone: { goal: 5_000, held: 800 },
      bike: { goal: 1_200, held: 300 },
      home: { goal: 4_000, mine: 1_100, theirs: 950 },
      bus: 120,
      hotel: 480,
      flight: 2_800,
      bigBuy: 5_200,
    },
    owedDinner: 480,
    moneyIn: { cushionGoal: 25_000, order: 129, pay: 13_000, gift: 500 },
    bonus: { income: null, jarGoal: 1_800, jarHeld: 1_000, amount: 7_000 },
  },
};

/** Every amount of a list through `worth`, its shape kept. */
function priced<T>(list: T, worth: (amount: number) => Money): T {
  if (typeof list === 'number') return worth(list) as T;
  if (list === null || typeof list !== 'object') return list;
  return Object.fromEntries(
    Object.entries(list).map(([key, value]) => [key, priced(value, worth)]),
  ) as T;
}

/** The seeds' amounts in `currency`'s minor unit: its own list, or the canvases' by rate. */
export function seedPricesIn(currency: Currency): SeedPrices {
  const own = SEED_PRICES[currency.code];
  if (own) return priced(own, (major) => toMinor(major, currency));
  return priced(DESIGN_SEED_PRICES, (dong) =>
    Math.max(1, Math.round((dong / VND.perUsd) * currency.perUsd * currency.minorPerMajor)),
  );
}

/**
 * What the season's jar holds `months` paydays before its month, so that each cycle sets aside
 * what it does three paydays out: more is in the nearer the season is, never less than the list's.
 */
export function seasonHeld(season: SeedPrices['jars']['season'], months: number): Money {
  if (months >= 3) return season.held;
  return season.goal - Math.round(((season.goal - season.held) * months) / 3);
}

export interface YearSpend {
  readonly merchant: string;
  readonly categoryId: FridayCategoryId;
  readonly source: SpendSource;
  readonly amount: Money;
}

/** The places the year's days go to: what the Friday calls them, and how each is caught. */
const YEAR_PLACES = [
  ['lunch', 'food', 'qr'],
  ['coffee', 'drinks', 'alert'],
  ['shop', 'shopping', 'shared'],
  ['ride', 'transport', 'alert'],
  ['supermarket', 'groceries', 'alert'],
  ['breakfast', 'food', 'manual'],
] as const;

/**
 * The spends of the year's `n`th day: two or three of the Friday's places, each at its local
 * price or up to about twice it, told to the currency's coin. Most days end under the Friday's
 * line; where prices run high against it, a supermarket day now and then goes over.
 */
export function yearDay(
  n: number,
  names: FridayNames,
  currency: Currency,
  scale = 1,
): readonly YearSpend[] {
  const prices = fridayPricesIn(currency);
  const seed = seedPricesIn(currency);
  const coin = Math.max(1, seed.coin);
  return Array.from({ length: 2 + (n % 2) }, (_, k): YearSpend => {
    const [what, categoryId, source] = YEAR_PLACES[(n * 3 + k) % YEAR_PLACES.length] ?? [
      'lunch',
      'food',
      'qr',
    ];
    const base = what === 'supermarket' ? seed.groceries : prices.today[what];
    const more = 1 + ((n * 7 + k * 13) % 9) * 0.12;
    return {
      merchant: what === 'supermarket' ? names.earlier.supermarket : names[what],
      categoryId,
      source,
      amount: Math.max(coin, Math.round((base * more * scale) / coin) * coin),
    };
  });
}

/** The line a closed day of the year carries: the Friday's own. */
export function yearLine(currency: Currency, scale = 1): Money {
  return Math.round(fridayLine(currency) * scale);
}
