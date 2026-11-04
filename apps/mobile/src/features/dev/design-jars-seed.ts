import { randomUUID } from 'expo-crypto';

import {
  addDays,
  addMonthsTo,
  FUTURE_YOU_POT_ID,
  monthOf,
  parts,
  payCycleOn,
  type LocalDate,
  type PotRow,
  togetherStateSchema,
  type TogetherState,
} from '@6pm/domain';

import { JAR_ASKS_KEY, markHandTake } from '../../data/jar-asks';
import type { MoneyStore } from '../../data/money-store';
import { readPlan, writePlan } from '../../data/plan-settings';
import { TOGETHER_CACHE_KEY } from '../together/together-state';

/**
 * Developer tool, run after the Friday seed: puts the Pots and Plan canvases' jars and states on
 * the phone so each screen can be compared with its design.
 * - `shelf`: Future you 18,9tr, Tết (dated), Đà Lạt (due this month), Rainy day (each payday),
 *   a 2.1 goal still on the slice, a jar filled by hand, and a jar shared with B.
 * - `due`: the shelf, with two spends waiting for tonight's close in Đà Lạt's month (the 1,2tr
 *   hotel, and a 7tr flight bigger than the jar), Đà Lạt armed by a bus taken from it by hand
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
): Promise<void> {
  const { db, tables } = store;
  const plan = await readPlan(db);
  if (!plan) return;
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
      futureYou: 2_100_000,
      ...(state === 'first'
        ? { startedOn: addDays(cycle.start, 8), spentSincePayday: 2_400_000 }
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
      name: 'Future you',
      icon: 'wb_twilight',
      hue: 70,
      goal: 0,
      neededBy: null,
      share: null,
      monthly: null,
      createdAt: made(7),
    };
    await pot(fy, state === 'first' ? 0 : 16_800_000);
    if (state === 'first') return;

    await pot(
      {
        id: 'dev-tet',
        kind: 'occasion',
        name: 'Tết',
        icon: 'local_florist',
        hue: 20,
        goal: 7_000_000,
        neededBy: addMonthsTo(thisMonth, 3),
        share: null,
        monthly: null,
        createdAt: made(2),
      },
      2_100_000,
    );
    await pot(
      {
        id: 'dev-dalat',
        kind: 'occasion',
        name: 'Đà Lạt',
        icon: 'landscape',
        hue: 195,
        goal: 6_000_000,
        neededBy: thisMonth,
        share: null,
        monthly: null,
        createdAt: made(5),
      },
      state === 'due' ? 6_000_000 : 3_500_000,
    );
    await pot(
      {
        id: 'dev-rainy',
        kind: 'occasion',
        name: 'Rainy day',
        icon: 'beach_access',
        hue: 145,
        goal: 12_600_000,
        neededBy: null,
        share: null,
        monthly: 400_000,
        createdAt: made(6),
      },
      state === 'due' ? 12_600_000 : 5_000_000,
    );
    // A goal from 2.1, still filling from Future you's slice by its share.
    await pot(
      {
        id: 'dev-phone',
        kind: 'goal',
        name: 'New phone',
        icon: 'smartphone',
        hue: 250,
        goal: 9_000_000,
        neededBy: null,
        share: 0.15,
        monthly: null,
        createdAt: made(4),
      },
      1_500_000,
    );
    await pot(
      {
        id: 'dev-bike',
        kind: 'occasion',
        name: 'Bike',
        icon: 'pedal_bike',
        hue: 230,
        goal: 1_500_000,
        neededBy: null,
        share: null,
        monthly: null,
        createdAt: made(1),
      },
      400_000,
    );
  });

  // A jar shared with B, as Budget together last heard from the server.
  const shared: TogetherState = {
    me: { id: ME_ID, name: 'Linh' },
    pair: {
      id: 'dev-pair',
      members: [
        { id: ME_ID, name: 'Linh' },
        { id: B_ID, name: 'Bảo' },
      ],
      pots: [
        {
          id: '0d0e0f10-0000-4000-8000-00000000a001',
          name: 'Home',
          icon: 'home',
          hue: 25,
          goal: 5_000_000,
          neededBy: null,
          currency: 'VND',
          createdBy: B_ID,
          createdAt: made(3),
          contributions: [
            {
              id: '0d0e0f10-0000-4000-8000-00000000c001',
              memberId: ME_ID,
              amount: 1_400_000,
              addedAt: made(2),
            },
            {
              id: '0d0e0f10-0000-4000-8000-00000000c002',
              memberId: B_ID,
              amount: 1_200_000,
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

  // Tonight's close in Đà Lạt's month: the hotel the jar covers, and a flight bigger than it.
  // Đà Lạt is armed for the question: the bus there was taken from it by hand yesterday.
  if (state === 'due') {
    const bus = randomUUID();
    const yesterday = addDays(today, -1);
    await tables.spends.put({
      id: bus,
      day: yesterday,
      at: new Date(`${yesterday}T09:20:00`).toISOString(),
      amount: 350_000,
      categoryId: 'transport',
      merchant: 'Phương Trang bus',
      note: null,
      source: 'manual',
      status: 'kept',
      previousStatus: null,
      wallet: 'MoMo',
      forWork: false,
      detail: null,
      foreignAmount: null,
      fromPot: 'dev-dalat',
      fromPotAmount: 350_000,
      createdAt: iso,
      updatedAt: iso,
    });
    await db.runAsync('DELETE FROM settings WHERE key = ?', [JAR_ASKS_KEY]);
    await markHandTake(db, bus, 'dev-dalat', iso);
    for (const [time, merchant, amount] of [
      ['16:40', 'KS Đồi Thông', 1_200_000],
      ['11:05', 'Vietjet · Đà Lạt', 7_000_000],
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
      amount: 9_000_000,
      categoryId: 'shopping',
      merchant: 'Điện Máy Xanh',
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
  await store.load(today);
}
