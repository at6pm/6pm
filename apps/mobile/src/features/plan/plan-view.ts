import {
  addMonthsTo,
  billDueIn,
  billsThisCycle,
  cycleFutureYou,
  cyclePosition,
  diffDays,
  futureYouIn,
  intoJarsEachPayday,
  jarsEachPayday,
  jarShelfState,
  joinedCycle,
  moneyRiver,
  newJarLocked,
  occasionsOf,
  planSplit,
  sumMoneyIn,
  type BillRow,
  type DailyNumber,
  type JarShelfState,
  type LocalDate,
  type PlanSplit,
  type PotRow,
  type RiverSegment,
  type Vnd,
} from '@6pm/domain';

import type { CycleTopUps } from '../../data/pot-moves';
import { dailyInputOf, type MoneySnapshot } from '../../data/money-store';
import { joinedAnswersOf } from '../../data/plan-settings';

/** Σ what the occasion pots set aside this pay cycle, as the daily number counts them. */
export function occasionsMonthly(snap: MoneySnapshot): Vnd {
  return occasionsOf(snap.pots, snap.setAsideThisCycle);
}

/**
 * Whether New jar is behind the Max sheet: the jars of one's own allowed without Max are used and
 * Max is not held (Future you and shared jars never count).
 */
export function newPotLocked(pots: readonly PotRow[], max: boolean): boolean {
  return newJarLocked(pots, max);
}

/** The month's money in: the plan's income and what came in on top this cycle and was kept. */
export function monthIncomeOf(snap: MoneySnapshot): Vnd {
  return (snap.plan?.income ?? 0) + sumMoneyIn(snap.cycleSpends);
}

export function riverOf(
  snap: MoneySnapshot,
  day: DailyNumber,
  topUps: CycleTopUps | null,
): Readonly<Record<RiverSegment, Vnd>> {
  // Until the split is read, every top-up shows under Occasions; the total is right either way.
  const goalTopUps = topUps?.goal ?? 0;
  const joined = joinedCycle(snap.cycle, joinedAnswersOf(snap.plan));
  return moneyRiver({
    income: monthIncomeOf(snap),
    bills: billsThisCycle(snap.bills, snap.cycle),
    futureYou: futureYouIn(snap.plan?.futureYou ?? 0, joined),
    occasions: occasionsMonthly(snap),
    goalTopUps,
    occasionTopUps: snap.topUpsThisCycle - goalTopUps,
    free: day.free,
    share: joined.share,
    beforeJoining: joined.beforeJoining,
  });
}

/** Whether "Before 6pm" can be changed: only while the cycle the user joined lasts. */
export function beforeEditable(snap: MoneySnapshot): boolean {
  return joinedCycle(snap.cycle, joinedAnswersOf(snap.plan)).joined;
}

export interface BillView {
  readonly bill: BillRow;
  readonly due: LocalDate;
  readonly paid: boolean;
  /** Days from today to the due date; negative once it has passed. */
  readonly inDays: number;
  /** 0–1 along the cycle line. */
  readonly position: number;
}

export function billViews(snap: MoneySnapshot): BillView[] {
  return snap.bills.map((bill) => {
    const due = billDueIn(snap.cycle, bill.dueDay);
    return {
      bill,
      due,
      paid: bill.paidCycle === snap.cycle.start,
      inDays: diffDays(due, snap.today),
      position: cyclePosition(snap.cycle, due),
    };
  });
}

/** The month 'YYYY-MM' that is `ahead` months after `from`; null for "No date" (0). */
export function potMonthAt(from: string, ahead: number): string | null {
  return ahead > 0 ? addMonthsTo(from, ahead) : null;
}

/** Plan's split of the pay for the snapshot: the same input as Today's number, so the same line. */
export function planSplitOf(snap: MoneySnapshot): PlanSplit | null {
  const input = dailyInputOf(snap);
  if (input === null) return null;
  const joined = joinedAnswersOf(snap.plan);
  return planSplit({
    input,
    cycle: snap.cycle,
    today: snap.today,
    spends: snap.cycleSpends.map((s) => ({
      amount: s.amount,
      category: s.categoryId,
      status: s.status,
      forWork: s.forWork,
      paysBill: s.paysBill,
      direction: s.direction,
      fromPot: s.fromPot,
      fromPotAmount: s.fromPotAmount,
      day: s.day,
    })),
    joinedOn: joined.on,
  });
}

/** One of the person's own jars as Plan draws it. */
export interface PlanJarView {
  readonly pot: PotRow;
  readonly saved: Vnd;
  /** What it takes each payday; 0 for a jar filled by hand. */
  readonly each: Vnd;
  /** What it took this payday. */
  readonly setAside: Vnd;
  readonly state: JarShelfState;
}

/** The jars in shelf order, with what each takes each payday, and the line they add up to. */
export function planJarsOf(snap: MoneySnapshot): {
  readonly jars: readonly PlanJarView[];
  readonly eachPayday: Vnd;
} {
  const input = dailyInputOf(snap);
  const slice = input ? cycleFutureYou(input) : 0;
  const each = jarsEachPayday({ pots: snap.pots, setAside: snap.setAsideThisCycle, slice });
  const jars = snap.pots.map((pot) => {
    const saved = snap.potSaved[pot.id] ?? 0;
    return {
      pot,
      saved,
      each: each[pot.id] ?? 0,
      setAside: snap.setAsideThisCycle[pot.id] ?? 0,
      state: jarShelfState({
        pot,
        saved,
        futureYou: snap.plan?.futureYou ?? 0,
        cycle: snap.cycle,
        spentFrom: (snap.potSpentThisCycle[pot.id] ?? 0) > 0,
      }),
    };
  });
  return { jars, eachPayday: intoJarsEachPayday(slice, snap.pots, snap.setAsideThisCycle) };
}
