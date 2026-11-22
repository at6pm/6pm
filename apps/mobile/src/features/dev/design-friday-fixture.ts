import {
  addDays,
  currencyOf,
  cycleMonth,
  dailyNumber,
  diffDays,
  payCycleOn,
  potMonthlyNeed,
  toMinor,
  VND,
  type Currency,
  type LocalDate,
  type Money,
  type MonthPlan,
  type Payday,
  type SpendSource,
} from '@6pm/domain';
import { t, type Language } from '@6pm/i18n';

import {
  DESIGN_PRICES,
  FRIDAY_NAMES,
  FRIDAY_PRICES,
  type FridayCategoryId,
  type FridayPrices,
} from './design-friday-locales';

/** Money lands on the 31st, as in the prototype. */
export const FRIDAY_PAYDAY: Payday = { kind: 'sameDay', day: 31 };

/** The prototype's Friday has 22 days after it through payday: its free money covers 23. */
const DESIGN_DAYS = 23;

/** The dated jar is always three paydays away, so a third of its goal is set aside each cycle. */
const JAR_MONTHS = 3;

const CATEGORIES = [
  ['food', 'restaurant', 45],
  ['drinks', 'local_cafe', 25],
  ['transport', 'two_wheeler', 245],
  ['groceries', 'shopping_basket', 140],
  ['shopping', 'local_mall', 300],
  ['gifts', 'redeem', 350],
] as const;

export interface FridaySpend {
  readonly day: LocalDate;
  /** "HH:MM" on that day. */
  readonly time: string;
  readonly merchant: string;
  readonly amount: Money;
  readonly categoryId: FridayCategoryId;
  readonly status: 'kept' | 'caught' | 'pending';
  readonly source: SpendSource;
  readonly detail: string | null;
}

export interface FridayClosedDay {
  readonly day: LocalDate;
  readonly spent: Money;
  readonly line: Money;
  readonly tomorrow: Money;
}

/** Everything the designed Friday writes, in the home currency's minor unit. */
export interface FridayFixture {
  readonly currency: Currency;
  readonly income: Money;
  readonly futureYou: Money;
  readonly categories: readonly {
    readonly id: FridayCategoryId;
    readonly name: string;
    readonly icon: string;
    readonly hue: number;
  }[];
  readonly bills: readonly {
    readonly name: string;
    readonly icon: string;
    readonly amount: Money;
    readonly dueDay: number;
    readonly paid: boolean;
  }[];
  readonly jar: {
    readonly name: string;
    readonly goal: Money;
    /** 'YYYY-MM'. */
    readonly neededBy: string;
    /** What the jar takes from each of the cycles before its month. */
    readonly monthly: Money;
  };
  /** The cycle's earlier days first, then today's six. */
  readonly spends: readonly FridaySpend[];
  /** This week's earlier days, the missed Wednesday left out. */
  readonly closedDays: readonly FridayClosedDay[];
}

function priced(prices: FridayPrices, worth: (amount: number) => Money): FridayPrices {
  const { bills, today } = prices;
  return {
    income: worth(prices.income),
    futureYou: worth(prices.futureYou),
    bills: {
      rent: worth(bills.rent),
      phone: worth(bills.phone),
      internet: worth(bills.internet),
      power: worth(bills.power),
    },
    jarGoal: worth(prices.jarGoal),
    earlier: worth(prices.earlier),
    today: {
      breakfast: worth(today.breakfast),
      coffee: worth(today.coffee),
      lunch: worth(today.lunch),
      ride: worth(today.ride),
      treat: worth(today.treat),
      shop: worth(today.shop),
    },
  };
}

/** The Friday's amounts in `currency`'s minor unit: its own list, or the prototype's by rate. */
function pricesIn(currency: Currency): FridayPrices {
  const own = FRIDAY_PRICES[currency.code];
  if (own) return priced(own, (major) => toMinor(major, currency));
  return priced(DESIGN_PRICES, (dong) =>
    Math.round((dong / VND.perUsd) * currency.perUsd * currency.minorPerMajor),
  );
}

/** Mon = 0 … Sun = 6. */
function weekdayOf(day: LocalDate): number {
  return (new Date(`${day}T12:00:00`).getDay() + 6) % 7;
}

/**
 * The prototype's Friday (a month's pay, four bills, Future you, a dated jar three paydays away,
 * what was spent earlier in the cycle and the six spends of the day) placed on `today`, as pure
 * data.
 *
 * Names follow `language`: Vietnamese and English keep the prototype's Hồ Chí Minh City; every
 * other language has everyday descriptions and invented shops of its own, a season of its own for
 * the jar, and no bank's name (the coffee arrives as a bank alert, the shop as a shared photo of
 * its receipt). Amounts follow the
 * currency alone: one with a list in `FRIDAY_PRICES` uses its round local prices, any other the
 * prototype's đồng amounts by its rough rate. So German with đồng is German names at Vietnamese
 * prices, and English with euros the prototype's shops at euro prices.
 *
 * The earlier days spend what leaves today the prototype's line whatever the date (on the
 * prototype's own day, exactly its 2.365.000₫), one spend a day, each under that line. A closed
 * day carries the line and tomorrow the engine gives it from the days before.
 */
export function buildDesignFriday(
  today: LocalDate,
  code = 'VND',
  language: Language = 'en',
): FridayFixture {
  const currency = currencyOf(code);
  const names = FRIDAY_NAMES[language];
  const prices = pricesIn(currency);
  const cycle = payCycleOn(today, FRIDAY_PAYDAY);

  const billsTotal =
    prices.bills.rent + prices.bills.phone + prices.bills.internet + prices.bills.power;
  const jarMonthly = potMonthlyNeed(prices.jarGoal, 0, JAR_MONTHS, currency);
  const plan: MonthPlan = {
    income: prices.income,
    bills: billsTotal,
    futureYou: prices.futureYou,
    occasions: jarMonthly,
    topUps: 0,
  };
  const free = plan.income - plan.bills - plan.futureYou - plan.occasions;

  // What the earlier days spent: all but the free money today's line needs for the days left.
  const unit = currency.step;
  const floor = (amount: number) => Math.floor(amount / unit) * unit;
  const earlierDays = diffDays(today, cycle.start);
  const held = Math.round(((free - prices.earlier) * (cycle.daysLeft + 1)) / DESIGN_DAYS);
  const underLine = floor(((free - prices.earlier) / DESIGN_DAYS) * 0.97);
  const before = Math.max(0, Math.min(floor(free - held), underLine * earlierDays));
  const each = earlierDays > 0 ? floor(before / earlierDays) : 0;
  // What does not divide goes a step at a time to the latest days.
  const extra = earlierDays > 0 ? Math.round((before - each * earlierDays) / unit) : 0;
  const earlier: FridaySpend[] = [];
  for (let d = 0; d < earlierDays; d++) {
    const amount = each + (d >= earlierDays - extra ? unit : 0);
    if (amount <= 0) continue;
    earlier.push({
      day: addDays(cycle.start, d),
      time: '12:30',
      merchant: names.earlier.merchant,
      amount,
      categoryId: names.earlier.categoryId,
      status: 'kept',
      source: 'manual',
      detail: null,
    });
  }

  const day = { day: today } as const;
  const todays: FridaySpend[] = [
    {
      ...day,
      time: '07:42',
      merchant: names.breakfast,
      amount: prices.today.breakfast,
      categoryId: 'food',
      status: 'kept',
      source: 'manual',
      detail: null,
    },
    {
      ...day,
      time: '08:15',
      merchant: names.coffee,
      amount: prices.today.coffee,
      categoryId: 'drinks',
      status: 'caught',
      // A bank's shared receipt where one is named, else a bank alert, worded with no name.
      source: names.receipts ? 'shared' : 'alert',
      detail: names.receipts?.coffee ?? null,
    },
    {
      ...day,
      time: '12:10',
      merchant: names.lunch,
      amount: prices.today.lunch,
      categoryId: 'food',
      status: 'pending',
      source: 'qr',
      detail: names.unconfirmed ?? t(language, 'close.card.fromQr'),
    },
    {
      ...day,
      time: '13:30',
      merchant: names.ride,
      amount: prices.today.ride,
      categoryId: 'transport',
      status: 'caught',
      source: 'email',
      detail: 'k7m2qx@at6pm.app',
    },
    {
      ...day,
      time: '15:05',
      merchant: names.treat,
      amount: prices.today.treat,
      categoryId: 'drinks',
      status: 'kept',
      source: 'voice',
      detail: null,
    },
    {
      ...day,
      time: '16:40',
      merchant: names.shop,
      amount: prices.today.shop,
      categoryId: 'shopping',
      status: 'caught',
      source: 'shared',
      detail: names.receipts?.shop ?? null,
    },
  ];

  // This week's earlier days are closed, except the third (the design's missed Wednesday).
  const closedDays: FridayClosedDay[] = [];
  for (let d = weekdayOf(today) === 0 ? 0 : 1; ; d++) {
    const closing = addDays(today, -d);
    if (closing < cycle.start || d > 6) break;
    const weekday = weekdayOf(closing);
    if (weekday === 2 || closing >= today) continue;
    const number = dailyNumber({
      plan,
      spentBefore: earlier.reduce((sum, s) => (s.day < closing ? sum + s.amount : sum), 0),
      today: earlier
        .filter((s) => s.day === closing)
        .map((s) => ({ amount: s.amount, category: s.categoryId, status: s.status })),
      notDaily: new Set(),
      daysLeft: payCycleOn(closing, FRIDAY_PAYDAY).daysLeft,
      currency,
    });
    closedDays.push({
      day: closing,
      spent: number.spent,
      line: number.line,
      tomorrow: number.tomorrow,
    });
    if (weekday === 0) break;
  }

  const [year = 0, month = 1] = cycleMonth(cycle).split('-').map(Number);
  const neededBy = new Date(Date.UTC(year, month - 1 + JAR_MONTHS, 1)).toISOString().slice(0, 7);

  return {
    currency,
    income: prices.income,
    futureYou: prices.futureYou,
    categories: CATEGORIES.map(([id, icon, hue]) => ({
      id,
      name: t(language, `onboarding.category.${id}`),
      icon,
      hue,
    })),
    bills: [
      { name: names.bills.rent, icon: 'home', amount: prices.bills.rent, dueDay: 1, paid: true },
      {
        name: names.bills.phone,
        icon: 'smartphone',
        amount: prices.bills.phone,
        dueDay: 3,
        paid: true,
      },
      {
        name: names.bills.internet,
        icon: 'wifi',
        amount: prices.bills.internet,
        dueDay: 12,
        paid: false,
      },
      {
        name: names.bills.power,
        icon: 'bolt',
        amount: prices.bills.power,
        dueDay: 15,
        paid: false,
      },
    ],
    jar: { name: names.jar, goal: prices.jarGoal, neededBy, monthly: jarMonthly },
    spends: [...earlier, ...todays],
    closedDays,
  };
}
