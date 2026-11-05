import {
  billCountsIn,
  billsThisCycle,
  currencyOf,
  dailyNumber,
  deletedJarsKeep,
  futureYouPotRow,
  futureYouStartsOn,
  jarPartOf,
  jarSpendMoves,
  joinedCycle,
  occasionsOf,
  payCycleOn,
  potTotals,
  shelfOrder,
  sumDayPart,
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

import { createQueue } from './store-queue';
import { openMoneyTables, type MoneyTables } from './money-tables';
import { joinedAnswersOf, planCurrencyCode, readPlan, type PlanSettings } from './plan-settings';
import { readPotMoves, recordDueSetAsides } from './pot-moves';
import type { SqlDatabase } from './table';
import { togetherTopUps } from './together-moves';

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

/** The fields a snapshot's jar totals are worked out from, on every publish. */
type JarTotals = Pick<
  MoneySnapshot,
  'potSaved' | 'topUpsThisCycle' | 'setAsideThisCycle' | 'potSpentThisCycle' | 'deletedJarsKept'
>;

function notDailyOf(snapshot: Pick<MoneySnapshot, 'categories'>): Set<string> {
  return new Set(snapshot.categories.filter((c) => !c.countsDaily).map((c) => c.id));
}

const countedOf = (s: SpendRow) => ({
  amount: s.amount,
  category: s.categoryId,
  status: s.status,
  forWork: s.forWork,
  paysBill: s.paysBill,
  direction: s.direction,
  fromPot: s.fromPot,
  fromPotAmount: s.fromPotAmount,
  day: s.day,
});

/**
 * What every jar holds, sets aside and gave this cycle, from the stored moves and the spends taken
 * from jars. Worked out again whenever a snapshot is published, so a spend marked "From a jar",
 * edited, skipped or undone moves its jar at once.
 */
export function jarTotalsOf(
  snapshot: Omit<MoneySnapshot, keyof JarTotals> & Partial<JarTotals>,
): JarTotals {
  const payday = snapshot.plan?.payday ?? { kind: 'lastDay' as const };
  const notDaily = notDailyOf(snapshot);
  const spends = [...snapshot.earlierJarSpends, ...snapshot.cycleSpends].map(countedOf);
  const spent = jarSpendMoves(spends, payday, notDaily);
  const totals = potTotals(
    [...snapshot.potMoves, ...spent],
    new Set(snapshot.pots.map((p) => p.id)),
    snapshot.cycle.start,
  );
  const covered = (potId: string) =>
    snapshot.cycleSpends
      .filter((s) => s.fromPot === potId)
      .reduce((sum, s) => sum + jarPartOf(countedOf(s), notDaily), 0);
  const deleted = snapshot.deletedPots.map((pot) => {
    const thisCycle = snapshot.potMoves.filter(
      (m) => m.potId === pot.id && m.cycle === snapshot.cycle.start,
    );
    const of = (kind: PotMove['kind']) =>
      thisCycle.filter((m) => m.kind === kind).reduce((sum, m) => sum + m.amount, 0);
    return {
      setAside: pot.kind === 'occasion' ? of('setAside') : 0,
      topUps: of('topUp'),
      covered: covered(pot.id),
    };
  });
  return {
    potSaved: totals.saved,
    topUpsThisCycle: totals.topUps + snapshot.togetherThisCycle,
    setAsideThisCycle: totals.setAside,
    potSpentThisCycle: totals.spent,
    deletedJarsKept: deletedJarsKeep(deleted),
  };
}

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
  return {
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
    currency: currencyOf(planCurrencyCode(plan)),
  };
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
    snapshot = { ...next, ...jarTotalsOf(next) };
    for (const listener of listeners) listener();
  };

  const exclusive = createQueue();

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
           AND spend_id IN (SELECT id FROM spends WHERE status NOT IN ('skipped', 'deleted'))
           ORDER BY day DESC, sort`,
        [],
      ),
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
    publish({
      ...snapshot,
      today: day,
      plan,
      cycle,
      categories,
      cycleSpends,
      waitingBefore,
      bills: bills.filter((b) => billCountsIn(b, cycle)),
      pots: shelfOrder(pots),
      deletedPots,
      potMoves: [...recorded, ...caughtUp],
      earlierJarSpends,
      togetherThisCycle: together,
      closedDays,
      owed,
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
