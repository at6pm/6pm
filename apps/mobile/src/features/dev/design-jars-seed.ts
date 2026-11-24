import { randomUUID } from 'expo-crypto';

import {
  addDays,
  addMonthsTo,
  currencyOf,
  cycleMonth,
  FUTURE_YOU_POT_ID,
  monthOf,
  monthsBetween,
  parts,
  payCycleOn,
  type LocalDate,
  type PotRow,
  togetherStateSchema,
  type TogetherState,
} from '@6pm/domain';
import { t, type Language } from '@6pm/i18n';

import { JAR_ASKS_KEY, markHandTake } from '../../data/jar-asks';
import type { MoneyStore } from '../../data/money-store';
import { readPlan, writePlan } from '../../data/plan-settings';
import { TOGETHER_CACHE_KEY } from '../together/together-state';
import { seasonMonthAfter } from './design-friday-fixture';
import { FRIDAY_NAMES } from './design-friday-locales';
import { SEED_NAMES } from './design-seed-names';
import { seasonHeld, seedPricesIn } from './design-seed-prices';

/**
 * Developer tool, run after the Friday seed: puts the Pots and Plan canvases' jars and states on
 * the phone so each screen can be compared with its design. Names follow `language` and amounts
 * the plan's currency (`SEED_NAMES`, `SEED_PRICES`): in đồng they are the canvases' own.
 * - `shelf`: Future you (18,9tr), the season's jar (Tết, dated by the month it really falls in),
 *   the trip (Đà Lạt, due this month), Rainy day (each payday), a 2.1 goal still on the slice, a
 *   jar filled by hand, and a jar shared with a partner.
 * - `due`: the shelf, with two spends waiting for tonight's close in the trip's month (the 1,2tr
 *   hotel, and a 7tr flight bigger than the jar), the trip armed by a bus taken from it by hand
 *   yesterday, and Rainy day full for the ready moment.
 * - `payday`: the day after payday. `tomorrow`: payday tomorrow. `over`: past the plan.
 * - `first`: a first month with Future you, two bills and what went before 6pm.
 */
export type JarsSeed = 'shelf' | 'due' | 'payday' | 'tomorrow' | 'over' | 'first';

const B_ID = 'dev-partner-b';
const ME_ID = 'dev-me';

export async function seedDesignJars(
  store: MoneyStore,
  today: LocalDate,
  state: JarsSeed,
  language: Language = 'en',
): Promise<void> {
  const { db, tables } = store;
  const plan = await readPlan(db);
  if (!plan) return;
  const currency = currencyOf(plan.currency ?? 'VND');
  const prices = seedPricesIn(currency);
  const jars = prices.jars;
  const friday = FRIDAY_NAMES[language];
  const names = SEED_NAMES[language].jars;
  const { day: dom } = parts(today);
  // The payday that puts today where the state wants it.
  const payday =
    state === 'payday'
      ? { kind: 'sameDay' as const, day: parts(addDays(today, -1)).day }
      : state === 'tomorrow'
        ? { kind: 'sameDay' as const, day: parts(addDays(today, 1)).day }
        : plan.payday;
  const cycle = payCycleOn(today, payday);
  const iso = new Date().toISOString();
  const thisMonth = monthOf(today);
  // The season's jar is dated by the month the season really falls in next, and holds more the
  // nearer that is; a season past what is known is three months out, as the canvas draws it.
  const seasonMonth = seasonMonthAfter(friday.season.falls, thisMonth) ?? addMonthsTo(thisMonth, 3);
  const seasonMonths = monthsBetween(cycleMonth(cycle), seasonMonth);
  const lunar = ['tet', 'seollal', 'chunjie'].includes(friday.season.falls);
  const made = (months: number) => {
    const d = new Date(`${cycle.start}T03:00:00.000Z`);
    d.setUTCMonth(d.getUTCMonth() - months);
    return d.toISOString();
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM pot_moves', []);
    await db.runAsync('DELETE FROM pots', []);
    await writePlan(db, {
      ...plan,
      payday,
      futureYou: jars.futureYou,
      ...(state === 'first'
        ? { startedOn: addDays(cycle.start, 8), spentSincePayday: jars.spentBefore }
        : { startedOn: addDays(cycle.start, -200) }),
    });
    const pot = async (row: Omit<PotRow, 'paused' | 'archivedAt'>, opening: number) => {
      await tables.pots.put({ ...row, paused: false, archivedAt: null });
      if (opening > 0) {
        await db.runAsync(
          "INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, 'opening', ?, ?)",
          [`opening:${row.id}`, row.id, opening, cycle.start, iso],
        );
      }
    };
    const fy: Omit<PotRow, 'paused' | 'archivedAt'> = {
      id: FUTURE_YOU_POT_ID,
      kind: 'goal',
      name: t(language, 'pots.futureYou'),
      icon: 'wb_twilight',
      hue: 70,
      goal: 0,
      neededBy: null,
      share: null,
      monthly: null,
      createdAt: made(7),
    };
    await pot(fy, state === 'first' ? 0 : jars.futureYouHeld);
    if (state === 'first') return;

    await pot(
      {
        id: 'dev-tet',
        kind: 'occasion',
        name: friday.season.name,
        icon: lunar ? 'local_florist' : 'celebration',
        hue: 20,
        goal: jars.season.goal,
        neededBy: seasonMonth,
        share: null,
        monthly: null,
        createdAt: made(2),
      },
      seasonHeld(jars.season, seasonMonths),
    );
    await pot(
      {
        id: 'dev-dalat',
        kind: 'occasion',
        name: friday.trip,
        icon: language === 'vi' ? 'landscape' : 'luggage',
        hue: 195,
        goal: jars.trip.goal,
        neededBy: thisMonth,
        share: null,
        monthly: null,
        createdAt: made(5),
      },
      state === 'due' ? jars.trip.goal : jars.trip.held,
    );
    await pot(
      {
        id: 'dev-rainy',
        kind: 'occasion',
        name: names.rainyDay,
        icon: 'beach_access',
        hue: 145,
        goal: jars.rainyDay.goal,
        neededBy: null,
        share: null,
        monthly: jars.rainyDay.monthly,
        createdAt: made(6),
      },
      state === 'due' ? jars.rainyDay.goal : jars.rainyDay.held,
    );
    // A goal from 2.1, still filling from Future you's slice by its share.
    await pot(
      {
        id: 'dev-phone',
        kind: 'goal',
        name: names.phone,
        icon: 'smartphone',
        hue: 250,
        goal: jars.phone.goal,
        neededBy: null,
        share: 0.15,
        monthly: null,
        createdAt: made(4),
      },
      jars.phone.held,
    );
    await pot(
      {
        id: 'dev-bike',
        kind: 'occasion',
        name: names.bike,
        icon: 'pedal_bike',
        hue: 230,
        goal: jars.bike.goal,
        neededBy: null,
        share: null,
        monthly: null,
        createdAt: made(1),
      },
      jars.bike.held,
    );
  });

  // A jar shared with a partner, as Budget together last heard from the server.
  const shared: TogetherState = {
    me: { id: ME_ID, name: names.me },
    pair: {
      id: 'dev-pair',
      members: [
        { id: ME_ID, name: names.me },
        { id: B_ID, name: names.partner },
      ],
      pots: [
        {
          id: '0d0e0f10-0000-4000-8000-00000000a001',
          name: names.home,
          icon: 'home',
          hue: 25,
          goal: jars.home.goal,
          neededBy: null,
          currency: currency.code,
          createdBy: B_ID,
          createdAt: made(3),
          contributions: [
            {
              id: '0d0e0f10-0000-4000-8000-00000000c001',
              memberId: ME_ID,
              amount: jars.home.mine,
              addedAt: made(2),
            },
            {
              id: '0d0e0f10-0000-4000-8000-00000000c002',
              memberId: B_ID,
              amount: jars.home.theirs,
              addedAt: made(2),
            },
          ],
        },
      ],
    },
  };
  if (state !== 'first' && togetherStateSchema.safeParse(shared).success) {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      TOGETHER_CACHE_KEY,
      JSON.stringify(shared),
    ]);
  }

  // Tonight's close in the trip's month: the hotel the jar covers, and a flight bigger than it.
  // The trip is armed for the question: the bus there was taken from it by hand yesterday.
  if (state === 'due') {
    const bus = randomUUID();
    const yesterday = addDays(today, -1);
    await tables.spends.put({
      id: bus,
      day: yesterday,
      at: new Date(`${yesterday}T09:20:00`).toISOString(),
      amount: jars.bus,
      categoryId: 'transport',
      merchant: names.bus,
      note: null,
      source: 'manual',
      status: 'kept',
      previousStatus: null,
      wallet: null,
      forWork: false,
      detail: null,
      foreignAmount: null,
      fromPot: 'dev-dalat',
      fromPotAmount: jars.bus,
      createdAt: iso,
      updatedAt: iso,
    });
    await db.runAsync('DELETE FROM settings WHERE key = ?', [JAR_ASKS_KEY]);
    await markHandTake(db, bus, 'dev-dalat', iso);
    for (const [time, merchant, amount] of [
      ['16:40', names.hotel, jars.hotel],
      ['11:05', names.flight, jars.flight],
    ] as const) {
      const [h = 0, m = 0] = time.split(':').map(Number);
      const { year, month } = parts(today);
      await tables.spends.put({
        id: randomUUID(),
        day: today,
        at: new Date(year, month - 1, dom, h, m).toISOString(),
        amount,
        categoryId: 'shopping',
        merchant,
        note: null,
        source: 'shared',
        status: 'caught',
        previousStatus: null,
        wallet: null,
        forWork: false,
        detail: null,
        foreignAmount: null,
        createdAt: iso,
        updatedAt: iso,
      });
    }
  }
  // Past the plan: earlier days went well over what the cycle had free.
  if (state === 'over') {
    await tables.spends.put({
      id: randomUUID(),
      day: addDays(today, -1),
      at: new Date(`${addDays(today, -1)}T12:00:00`).toISOString(),
      amount: jars.bigBuy,
      categoryId: 'shopping',
      merchant: names.bigBuy,
      note: null,
      source: 'manual',
      status: 'kept',
      previousStatus: null,
      wallet: null,
      forWork: false,
      detail: null,
      foreignAmount: null,
      createdAt: iso,
      updatedAt: iso,
    });
  }
  if (state === 'first') {
    // Two bills only.
    const bills = await tables.bills.all();
    for (const bill of bills.slice(2)) await tables.bills.remove(bill.id);
  }
  await store.loadInTurn(today);
}
