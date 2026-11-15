import {
  addDays,
  billCountsIn,
  BUFFER_POT_ID,
  carriesOver,
  billsThisCycle,
  currencyOf,
  dailyNumber,
  futureYouPotRow,
  futureYouIn,
  futureYouStartsOn,
  incomePeriod,
  incomesInEffect,
  type IncomePeriod,
  monthlyIncomeOf,
  joinedCycle,
  leadPaysOf,
  occasionsOf,
  payCycleOn,
  setAsideSoFar,
  shelfOrder,
  sumDayPart,
  type PeriodInput,
  type PlacedPay,
  type PotMove,
  type BillRow,
  type CategoryRow,
  type ClosedDayRow,
  type DailyNumber,
  type DailyNumberInput,
  type LocalDate,
  type PayCycle,
  type PotRow,
  type OwedRow,
  needsReview,
  type SpendRow,
  startOfWeek,
  sumMoneyIn,
} from '@6pm/domain';

import { recordDueCarries } from './carry-moves';
import { countedOf, jarTotalsOf, notDailyOf } from './snapshot-jars';
import { createQueue } from './store-queue';
import { openMoneyTables, type MoneyTables } from './money-tables';
import { joinedAnswersOf, planCurrencyCode, readPlan, type PlanSettings } from './plan-settings';
import { readPotMoves, recordDueSetAsides } from './pot-moves';
import type { SqlDatabase } from './table';
import { togetherTopUps } from './together-moves';
import { moneyInRowsOf, wagesOf, workKeptOf } from './work-money';

/** Everything the screens read, as one immutable snapshot of the phone's money database. */
export interface MoneySnapshot {
  readonly today: LocalDate;
  /** Null until onboarding has set the month up. */
  readonly plan: PlanSettings | null;
  readonly cycle: PayCycle;
  readonly categories: readonly CategoryRow[];
  /** This pay cycle's spends up to today, newest first, deleted ones left out. */
  readonly cycleSpends: readonly SpendRow[];
  /**
   * Spends from before this pay cycle began that were caught or pending when it was read, newest
   * first. They already counted in the cycle they were caught in, so they are not in
   * `cycleSpends` and never lower this cycle's number (counting them again would take the same
   * money out twice); they only wait for a yes in the close and the Inbox. One answered since
   * stays here, with its new status, until the next read; `waitingOf` lists only those still waiting.
   */
  readonly waitingBefore: readonly SpendRow[];
  /** The bills that still come off in this pay cycle: one past its last month has stopped. */
  readonly bills: readonly BillRow[];
  /** The jars, Future you first, then as they were made. */
  readonly pots: readonly PotRow[];
  /** Jars deleted while spends taken from them still stand (M13). */
  readonly deletedPots: readonly PotRow[];
  /** Every stored jar move, this cycle's set-asides included; spends from jars are not here. */
  readonly potMoves: readonly PotMove[];
  /** Spends from before this cycle that came out of a jar: they still lower what it holds. */
  readonly earlierJarSpends: readonly SpendRow[];
  /** What the person put into shared jars this cycle (it counts like a top-up). */
  readonly togetherThisCycle: number;
  /** Held per jar, from its moves and the spends taken from it; never below zero. */
  readonly potSaved: Readonly<Record<string, number>>;
  /** Top-ups this cycle: the person's own jars, and what they put into shared ones. */
  readonly topUpsThisCycle: number;
  /** What each jar sets aside this pay cycle, recorded when the cycle began. */
  readonly setAsideThisCycle: Readonly<Record<string, number>>;
  /** Taken from each jar by this cycle's spends. */
  readonly potSpentThisCycle: Readonly<Record<string, number>>;
  /** What jars deleted this cycle still take out of free money (`deletedJarsKeep`). */
  readonly deletedJarsKept: number;
  readonly closedDays: readonly ClosedDayRow[];
  /**
   * Who owes the user what: every open owed line whose spend still stands, newest first, read on
   * every load and kept current by the owed actions (`openOwedOf` leaves out a line whose spend
   * was skipped or deleted since).
   */
  readonly owed: readonly OwedRow[];
  /**
   * The last 28 closed days before today, latest first: the usual day that caps a line from money
   * that only lands, and the line held while a pay is late. Left out of snapshots built by hand.
   */
  readonly recentClosedDays?: readonly ClosedDayRow[];
}

/**
 * A snapshot's jar fields with no jars, moves or spends from jars, and nobody owing anything: for
 * snapshots built by hand.
 */
export const NO_JAR_FIELDS = {
  owed: [],
  deletedPots: [],
  potMoves: [],
  earlierJarSpends: [],
  togetherThisCycle: 0,
  potSpentThisCycle: {},
  deletedJarsKept: 0,
} as const satisfies Partial<MoneySnapshot>;

export { countedOf, jarTotalsOf, notDailyOf };

export interface MoneyStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): MoneySnapshot;
  /** Re-reads the database for `today` (on launch, at midnight, after the app returns). */
  load(today: LocalDate): Promise<void>;
  /** Runs `task` after every earlier load and write has finished, and before any later one. */
  readonly exclusive: <T>(task: () => Promise<T>) => Promise<T>;
  /** `load` for code already running inside `exclusive` (which would otherwise wait for itself). */
  loadInTurn(today: LocalDate): Promise<void>;
  readonly db: SqlDatabase;
  readonly tables: MoneyTables;
  /** Replaces the snapshot after a write and tells every reader. */
  publish(next: MoneySnapshot): void;
}

/** What the daily number is worked out from, for the snapshot's today. */
export function dailyInputOf(snapshot: MoneySnapshot): DailyNumberInput | null {
  const { plan, today } = snapshot;
  if (plan === null) return null;
  const notDaily = notDailyOf(snapshot);
  const counted = countedOf;
  // Spending's day parts: what a jar covered stays out of the number (M13).
  const spentBefore = sumDayPart(
    snapshot.cycleSpends.filter((s) => s.day < today).map(counted),
    notDaily,
  );
  const bills = billsThisCycle(snapshot.bills, snapshot.cycle);
  const occasions =
    occasionsOf(snapshot.pots, snapshot.setAsideThisCycle) + snapshot.deletedJarsKept;
  const joined = joinedCycle(snapshot.cycle, joinedAnswersOf(plan));
  const currency = currencyOf(planCurrencyCode(plan));
  const input: DailyNumberInput = {
    plan: {
      income: plan.income,
      bills,
      futureYou: plan.futureYou,
      occasions,
      topUps: snapshot.topUpsThisCycle,
    },
    spentBefore,
    moneyIn: sumMoneyIn(snapshot.cycleSpends),
    today: snapshot.cycleSpends.filter((s) => s.day === today).map(counted),
    notDaily,
    daysLeft: snapshot.cycle.daysLeft,
    share: joined.share,
    beforeJoining: joined.beforeJoining,
    futureYouSkipped: joined.futureYouSkipped,
    currency,
  };
  // A plan never asked about its incomes is counted exactly as it always was.
  if (plan.incomes === undefined) return input;
  const period = periodOf(snapshot);
  if (period === null) return input;
  const landed = new Set(plan.incomes.filter((i) => i.amount <= 0).map((i) => i.id));
  // Takings reach the number only as what the work kept (`workMoneyIn`, or in `credited`).
  const rows = moneyInRowsOf(snapshot);
  return {
    ...input,
    // The month's income as the views measure against it (the what-if's range, a slice's share).
    plan: { ...input.plan, income: incomeOfPeriod(plan, period) },
    // Money that only lands is the month's own money (`credited`) when nothing is counted on;
    // beside a counted pay it is money in that adds to free money.
    moneyIn:
      (period.kind === 'landed' ? sumMoneyIn(rows) : sumMoneyIn(rows, landed)) + period.workMoneyIn,
    daysLeft: period.daysLeft,
    period: {
      credited: period.credited,
      reserved: period.reserved,
      cap: period.cap,
      minDays: period.minDays,
      hold: period.hold,
      bills: period.bills,
      coming: period.coming,
      ahead: period.ahead,
    },
    // Paid by the week or the fortnight, joining is counted from the pay it came in, not estimated.
    ...(period.monthly ? {} : { share: 1, beforeJoining: null }),
  };
}

/** The month's income for a plan that holds its incomes: what is counted on, or the pool. */
function incomeOfPeriod(plan: PlanSettings, period: IncomePeriod): number {
  return period.kind === 'landed' ? period.credited : monthlyIncomeOf(plan);
}

/**
 * The month's income the views measure against (the what-if slider's range, Future you's share
 * of a pay, whether a jar fits): the plan's own until it holds its incomes; then what they bring
 * in a usual month, or, with nothing counted on, what the month has.
 */
export function viewIncomeOf(snapshot: MoneySnapshot): number {
  const { plan } = snapshot;
  if (plan === null) return 0;
  const period = periodOf(snapshot);
  return period === null ? plan.income : incomeOfPeriod(plan, period);
}

/**
 * How the month the person joined in is counted (`joinedCycle`): with the estimate of what went
 * before joining for a monthly plan, from the pay it came in for one paid by the week or as money
 * lands.
 */
export function joinedOf(snapshot: MoneySnapshot): ReturnType<typeof joinedCycle> {
  const { plan } = snapshot;
  const estimate = plan?.incomes === undefined || periodOf(snapshot)?.monthly !== false;
  return joinedCycle(snapshot.cycle, joinedAnswersOf(plan), estimate);
}

/**
 * Money in placed as one of the plan's incomes' pay this month, and the wages of someone who pays
 * themselves from their work, on their days.
 */
function placedOf(snapshot: MoneySnapshot): PlacedPay[] {
  return [
    ...snapshot.cycleSpends.flatMap((s) =>
      s.direction === 'in' && s.status === 'kept' && s.moneyIn === 'pay' && s.incomeId != null
        ? [{ incomeId: s.incomeId, day: s.day, amount: s.amount }]
        : [],
    ),
    ...wagesOf(snapshot),
  ];
}

/**
 * The month as a plan that holds its incomes counts it (`incomePeriod`); null for a plan never
 * asked about them, or before the month is set up.
 */
export function periodOf(snapshot: MoneySnapshot): IncomePeriod | null {
  const input = periodInputOf(snapshot);
  return input === null ? null : incomePeriod(input);
}

/** What `periodOf` counts the month from: the plan's incomes, bills, jars and placed pays. */
export function periodInputOf(snapshot: MoneySnapshot): PeriodInput | null {
  const { plan, today } = snapshot;
  if (plan === null || plan.incomes === undefined) return null;
  const joined = joinedCycle(snapshot.cycle, joinedAnswersOf(plan));
  const closed = snapshot.recentClosedDays ?? snapshot.closedDays;
  const input: PeriodInput = {
    day: today,
    cycle: snapshot.cycle,
    anchor: plan.payday,
    // A wage someone starts paying themselves counts once its first day comes; until then the
    // month is counted as it was.
    incomes: incomesInEffect(plan.incomes, today),
    lastUntil: plan.lastUntil ?? null,
    bills: snapshot.bills,
    jars:
      futureYouIn(plan.futureYou, joined) + occasionsOf(snapshot.pots, snapshot.setAsideThisCycle),
    held: snapshot.deletedJarsKept,
    joinedOn: plan.startedOn ?? null,
    currency: currencyOf(planCurrencyCode(plan)),
    placed: placedOf(snapshot),
    inHand: carriesOver(plan) ? (snapshot.potSaved[BUFFER_POT_ID] ?? 0) : 0,
    closedDays: closed,
    workKept: workKeptOf(snapshot),
  };
  return { ...input, heldLine: heldLineOf(snapshot, input, closed) };
}

/**
 * Where the day stays while the month waits for a late pay: the line of the day before the pay
 * was due, as that day closed, or as the snapshot counts it when it did not; else the last closed
 * day's line. Null while no pay is late, or when no such day is known.
 */
function heldLineOf(
  snapshot: MoneySnapshot,
  input: PeriodInput,
  closed: readonly ClosedDayRow[],
): number | null {
  const due = leadPaysOf(input)?.due ?? null;
  if (due === null) return null;
  const eve = addDays(due, -1);
  const closedEve = closed.find((d) => d.day === eve);
  if (closedEve) return closedEve.line;
  // The day before was in this month: counted from what the snapshot holds, as it stood then.
  // Nothing was late that day, so this asks for no held line of its own.
  if (eve >= snapshot.cycle.start && eve < snapshot.today) {
    const line = dayOf({
      ...snapshot,
      today: eve,
      cycleSpends: snapshot.cycleSpends.filter((s) => s.day <= eve),
      recentClosedDays: closed.filter((d) => d.day < eve),
    })?.line;
    if (line !== undefined) return line;
  }
  const last = closed
    .filter((d) => d.day < snapshot.today)
    .reduce<ClosedDayRow | null>((a, d) => (a === null || d.day > a.day ? d : a), null);
  return last?.line ?? null;
}

/**
 * What the jars hold, for a plan whose month sets them aside a pay or a landing at a time: this
 * month's set-aside only as far as it has been made (`setAsideSoFar`), so a jar, Plan's Pots part
 * and the pay's slip say the same. A monthly salary's jars hold the month's set-aside from payday.
 */
function setAsideHeld(snapshot: MoneySnapshot): MoneySnapshot {
  const input = periodInputOf(snapshot);
  if (input === null) return snapshot;
  const period = incomePeriod(input);
  if (period.kind === 'monthly') return snapshot;
  const sofar = setAsideSoFar(snapshot.setAsideThisCycle, period.jars, input.jars);
  const potSaved: Record<string, number> = { ...snapshot.potSaved };
  for (const [id, whole] of Object.entries(snapshot.setAsideThisCycle)) {
    const held = potSaved[id];
    if (held === undefined) continue;
    potSaved[id] = Math.max(0, held - whole + (sofar[id] ?? whole));
  }
  return { ...snapshot, potSaved };
}

/**
 * The days after today through the day money next comes, as the daily number divides by them:
 * what every other divisor of today's free money uses.
 */
export function daysLeftOf(snapshot: MoneySnapshot): number {
  return dailyInputOf(snapshot)?.daysLeft ?? snapshot.cycle.daysLeft;
}

/** Everything waiting for a yes, newest first: this cycle's, and what is left from before it. */
export function waitingOf(snapshot: MoneySnapshot): SpendRow[] {
  return [...snapshot.cycleSpends, ...snapshot.waitingBefore]
    .filter(needsReview)
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

/** A spend the screens hold, from this cycle or waiting from before it. */
export function findSpend(snapshot: MoneySnapshot, id: string): SpendRow | undefined {
  return (
    snapshot.cycleSpends.find((s) => s.id === id) ?? snapshot.waitingBefore.find((s) => s.id === id)
  );
}

/** The one number for the snapshot's today. */
export function dayOf(snapshot: MoneySnapshot): DailyNumber | null {
  const input = dailyInputOf(snapshot);
  return input === null ? null : dailyNumber(input);
}

/**
 * How far back closed days are loaded: the pay cycle, and also this week and this calendar month,
 * which the week strip, the month dots and "closed X of Y days" read even when payday sits in the
 * middle of them.
 */
function closedSince(day: LocalDate, cycleStart: LocalDate): LocalDate {
  const monthStart = `${day.slice(0, 8)}01`;
  return [cycleStart, monthStart, startOfWeek(day)].reduce((a, b) => (a < b ? a : b));
}

export function createMoneyStore(db: SqlDatabase, today: LocalDate): MoneyStore {
  const tables = openMoneyTables(db);
  const listeners = new Set<() => void>();
  let snapshot: MoneySnapshot = {
    today,
    plan: null,
    cycle: payCycleOn(today, { kind: 'lastDay' }),
    categories: [],
    cycleSpends: [],
    waitingBefore: [],
    bills: [],
    pots: [],
    deletedPots: [],
    potMoves: [],
    earlierJarSpends: [],
    togetherThisCycle: 0,
    potSaved: {},
    topUpsThisCycle: 0,
    setAsideThisCycle: {},
    potSpentThisCycle: {},
    deletedJarsKept: 0,
    closedDays: [],
    owed: [],
  };

  const publish = (next: MoneySnapshot) => {
    snapshot = setAsideHeld({ ...next, ...jarTotalsOf(next) });
    for (const listener of listeners) listener();
  };

  const exclusive = createQueue();

  /**
   * How a month that has ended stood at the end of its last day, from its own spends, read here
   * since the store holds only the month it is in. Bills are today's rows: a month's paid marks
   * and paid amounts are kept only until the bill is paid again.
   */
  const endingOf = async (month: {
    readonly plan: PlanSettings;
    readonly month: PayCycle;
    readonly moves: readonly PotMove[];
    readonly pots: readonly PotRow[];
    readonly categories: readonly CategoryRow[];
    readonly bills: readonly BillRow[];
  }) => {
    const last = addDays(month.month.payday, -1);
    const cycle = payCycleOn(last, month.plan.payday);
    const [spends, earlier, together, closed] = await Promise.all([
      tables.spends.select(
        "WHERE day >= ? AND day <= ? AND status != 'deleted' AND source != 'import' ORDER BY at DESC",
        [cycle.start, last],
      ),
      tables.spends.select(
        "WHERE day < ? AND from_pot IS NOT NULL AND status NOT IN ('skipped', 'deleted')",
        [cycle.start],
      ),
      togetherTopUps(db, cycle.start),
      // What work kept lands on its closed days: the month's own, for someone with work on.
      month.plan.work === undefined
        ? Promise.resolve([])
        : tables.closedDays.select('WHERE day >= ? AND day <= ? ORDER BY day', [cycle.start, last]),
    ]);
    const base = {
      today: last,
      plan: month.plan,
      cycle,
      categories: month.categories,
      cycleSpends: spends,
      waitingBefore: [],
      bills: month.bills.filter((b) => billCountsIn(b, cycle)),
      pots: shelfOrder(month.pots),
      deletedPots: [],
      potMoves: month.moves.filter((m) => m.cycle <= cycle.start),
      earlierJarSpends: earlier,
      togetherThisCycle: together,
      closedDays: closed,
      owed: [],
    };
    const ended: MoneySnapshot = { ...base, ...jarTotalsOf(base) };
    const number = dayOf(ended);
    const period = periodOf(ended);
    if (number === null || period === null) return null;
    return { free: number.free, kept: period.kept, held: ended.potSaved[BUFFER_POT_ID] ?? 0 };
  };

  const loadNow = async (day: LocalDate) => {
    const plan = await readPlan(db);
    const cycle = payCycleOn(day, plan?.payday ?? { kind: 'lastDay' });
    // Future you's jar is on every phone with a plan: made once, the first time it is missing (an
    // update from 2.1, a restored older backup, a fresh start). It holds nothing from before.
    if (plan) await tables.pots.insertMissing(futureYouPotRow(new Date().toISOString()));
    const [
      categories,
      cycleSpends,
      waitingBefore,
      bills,
      pots,
      recorded,
      closedDays,
      together,
      deletedPots,
      earlierJarSpends,
      owed,
      recentClosedDays,
    ] = await Promise.all([
      tables.categories.select('WHERE archived_at IS NULL ORDER BY sort', []),
      // History brought in from another app is never counted: the joined cycle's part of it
      // stands in for "spent since payday" instead (M2a).
      tables.spends.select(
        "WHERE day >= ? AND day <= ? AND status != 'deleted' AND source != 'import' ORDER BY at DESC",
        [cycle.start, day],
      ),
      tables.spends.select("WHERE day < ? AND status IN ('caught', 'pending') ORDER BY at DESC", [
        cycle.start,
      ]),
      tables.bills.select('WHERE archived_at IS NULL ORDER BY sort', []),
      tables.pots.select('WHERE archived_at IS NULL ORDER BY created_at', []),
      readPotMoves(db),
      tables.closedDays.select('WHERE day >= ? ORDER BY day', [closedSince(day, cycle.start)]),
      togetherTopUps(db, cycle.start),
      tables.pots.select(
        `WHERE archived_at IS NOT NULL AND id IN (SELECT from_pot FROM spends
             WHERE day >= ? AND from_pot IS NOT NULL)`,
        [cycle.start],
      ),
      tables.spends.select(
        "WHERE day < ? AND from_pot IS NOT NULL AND status NOT IN ('skipped', 'deleted')",
        [cycle.start],
      ),
      tables.owed.select(
        // Open, or settled by something since taken away (a deleted cash payback or cover).
        `WHERE (settled_at IS NULL OR settled_spend_id IN (SELECT id FROM spends
             WHERE status IN ('skipped', 'deleted')))
           AND (code IS NOT NULL
             OR spend_id IN (SELECT id FROM spends WHERE status NOT IN ('skipped', 'deleted')))
           ORDER BY day DESC, sort`,
        [],
      ),
      tables.closedDays.select('WHERE day < ? ORDER BY day DESC LIMIT 28', [day]),
    ]);
    // Each pay cycle puts the month's set-aside into every pot, once; a launch after missed
    // days or cycles catches up here before anything is counted.
    const caughtUp = plan
      ? await recordDueSetAsides(db, {
          pots,
          moves: recorded,
          futureYou: plan.futureYou,
          futureYouFrom: futureYouStartsOn(plan.payday, joinedAnswersOf(plan)),
          payday: plan.payday,
          today: day,
          currency: currencyOf(planCurrencyCode(plan)),
        })
      : [];
    // What each month that has ended left over goes into the buffer jar, once, before anything
    // this month is counted (a plan whose months carry over; see `recordDueCarries`).
    const carried = plan
      ? await recordDueCarries(db, tables, {
          plan,
          cycle,
          pots,
          moves: [...recorded, ...caughtUp],
          endingOf: (month, moves, monthPots) =>
            endingOf({ plan, month, moves, pots: monthPots, categories, bills }),
        })
      : { moves: [], buffer: null };
    publish({
      ...snapshot,
      today: day,
      plan,
      cycle,
      categories,
      cycleSpends,
      waitingBefore,
      bills: bills.filter((b) => billCountsIn(b, cycle)),
      pots: shelfOrder(carried.buffer ? [...pots, carried.buffer] : pots),
      deletedPots,
      potMoves: [...recorded, ...caughtUp, ...carried.moves],
      earlierJarSpends,
      togetherThisCycle: together,
      closedDays,
      owed,
      recentClosedDays,
    });
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    load: (day) => exclusive(() => loadNow(day)),
    exclusive,
    loadInTurn: loadNow,
    db,
    tables,
    publish,
  };
}
