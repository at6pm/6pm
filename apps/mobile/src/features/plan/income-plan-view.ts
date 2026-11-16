import {
  futureYouIn,
  landedMaths,
  landedView,
  occasionsOf,
  payStretch,
  stretchDays,
  stretchMaths,
  sumDayPart,
  type CycleDay,
  type DailyNumber,
  type LandedRow,
  type LandedView,
  type LocalDate,
  type PayStretch,
  type StretchRow,
  type Vnd,
} from '@6pm/domain';

import {
  countedOf,
  dayOf,
  joinedOf,
  notDailyOf,
  periodInputOf,
  periodOf,
  type MoneySnapshot,
} from '../../data/money-store';
import { wagesOf, workKeptOf } from '../../data/work-money';

/** One landing of the month, as the maths lists it. */
export interface Landing {
  readonly name: string;
  readonly amount: Vnd;
  readonly day: LocalDate;
  /** What work of one's own kept this month, landing as it comes: one line for the month. */
  readonly work?: true;
}

/** Plan for a plan paid by the week, the fortnight or twice a month: today's pay and its maths. */
export interface PayPlanView {
  readonly kind: 'pay';
  readonly stretch: PayStretch;
  readonly day: DailyNumber;
  readonly rows: readonly StretchRow[];
  /** Free's dots: the days from the pay through the next. */
  readonly days: readonly CycleDay[];
  /** What extra pays kept this month, waiting in hand until it ends, and the days that is. */
  readonly inHand: Vnd;
  readonly inHandDays: number;
  /** Of `inHand`, what this pay added. */
  readonly inHandNew: Vnd;
}

/** Plan for money that only lands. */
export interface LandedPlanView {
  readonly kind: 'landed';
  readonly view: LandedView;
  readonly day: DailyNumber;
  readonly rows: readonly LandedRow[];
  readonly landings: readonly Landing[];
  /** Free's dots: today through the day the money lasts to. */
  readonly days: readonly CycleDay[];
}

export type IncomePlanView = PayPlanView | LandedPlanView;

/**
 * This month's landings: money in placed as the pay of an income with nothing counted on, and
 * what work brought: what it kept through its closed days for someone who takes it as it comes,
 * and, in the month someone began paying themselves, the wages paid since (they land then).
 */
export function landingsOf(snap: MoneySnapshot): Landing[] {
  const landedIds = new Set(
    (periodInputOf(snap)?.incomes ?? []).filter((i) => i.amount <= 0).map((i) => i.id),
  );
  const wages = wagesOf(snap)
    .filter((pay) => landedIds.has(pay.incomeId))
    .reduce((sum, pay) => sum + pay.amount, 0);
  const work = workKeptOf(snap) + wages;
  const placed = placedLandingsOf(snap);
  return work > 0 ? [...placed, { name: '', amount: work, day: snap.today, work: true }] : placed;
}

function placedLandingsOf(snap: MoneySnapshot): Landing[] {
  const landed = new Set(
    (snap.plan?.incomes ?? []).filter((i) => i.amount <= 0).map((income) => income.id),
  );
  return (
    snap.cycleSpends
      .filter(
        (s) =>
          s.direction === 'in' &&
          s.status === 'kept' &&
          s.moneyIn === 'pay' &&
          s.incomeId != null &&
          landed.has(s.incomeId),
      )
      // Oldest first, by day and then by time, so the last is the newest even on one day.
      .sort((a, b) =>
        a.day !== b.day ? (a.day < b.day ? -1 : 1) : a.at < b.at ? -1 : a.at > b.at ? 1 : 0,
      )
      .map((s) => ({ name: s.merchant.trim(), amount: s.amount, day: s.day }))
  );
}

/**
 * Plan as a plan that holds its incomes draws it: by the pay for a plan paid by the week or the
 * fortnight, by what landed for money that only lands; null for a monthly salary, which keeps the
 * month's split as it always was.
 */
export function incomePlanOf(snap: MoneySnapshot): IncomePlanView | null {
  const input = periodInputOf(snap);
  const period = periodOf(snap);
  const day = dayOf(snap);
  if (input === null || period === null || day === null || period.kind === 'monthly') return null;
  const notDaily = notDailyOf(snap);
  const spends = snap.cycleSpends.map(countedOf);
  if (period.kind === 'counted') {
    const stretch = payStretch(input);
    if (stretch === null) return null;
    const spentSince = sumDayPart(
      spends.filter((s) => s.day >= stretch.payOn && s.day < snap.today),
      notDaily,
    );
    const inHand = Math.max(0, input.inHand ?? 0);
    return {
      kind: 'pay',
      stretch,
      day,
      rows: stretchMaths(stretch, {
        startFree: day.startFree,
        line: day.line,
        inHand,
        spentSince,
        minDays: period.minDays,
      }),
      days: stretchDays({
        payOn: stretch.payOn,
        // A late pay's days run on to today while the month waits for it.
        next: stretch.next < snap.today ? snap.today : stretch.next,
        today: snap.today,
        line: day.line,
        free: day.startFree,
        spends,
        notDaily,
      }),
      inHand: period.kept,
      inHandDays: day.line > 0 ? Math.floor(period.kept / day.line) : 0,
      inHandNew: stretch.kept,
    };
  }
  const plan = snap.plan;
  if (plan === null) return null;
  const landings = landingsOf(snap);
  const view = landedView({
    today: snap.today,
    cycle: snap.cycle,
    anchor: plan.payday,
    period,
    startFree: day.startFree,
    landings: landings.map((l) => l.amount),
    inHand: Math.max(0, input.inHand ?? 0),
    bills: snap.bills,
    futureYou: futureYouIn(plan.futureYou, joinedOf(snap)),
    otherJars: occasionsOf(snap.pots, snap.setAsideThisCycle),
    ...(input.currency ? { currency: input.currency } : {}),
  });
  return {
    kind: 'landed',
    view,
    day,
    rows: landedMaths(
      view,
      landings.map((l) => l.amount),
    ),
    landings,
    days: stretchDays({
      payOn: snap.today,
      next: view.on,
      today: snap.today,
      line: day.line,
      free: day.startFree,
      spends,
      notDaily,
    }),
  };
}

/** The ruler under Today's meter: a tick a day covered, those to the stretch's end, then in hand. */
export interface CoverRuler {
  readonly covered: number;
  readonly to: LocalDate;
  /** Ticks through the day the money lasts to (cream), and beyond it (in hand). */
  readonly stretch: number;
  readonly inHand: number;
}

/** Today's ruler for money that only lands; null on a day with no line or before anything landed. */
export function coverRulerOf(view: LandedView): CoverRuler | null {
  if (view.covered === null || view.covered <= 0 || view.coveredTo === null) return null;
  const stretch = Math.min(view.covered, view.stretchDays);
  return {
    covered: view.covered,
    to: view.coveredTo,
    stretch,
    inHand: view.covered - stretch,
  };
}

/** The next pay's day, for Today's "Paid today · next pay Fri 20" on a payday. */
export function paidTodayOf(
  snap: MoneySnapshot,
  plan: IncomePlanView | null,
): { readonly next: LocalDate } | null {
  if (plan?.kind !== 'pay' || plan.stretch.payOn !== snap.today) return null;
  return { next: plan.stretch.next };
}

/** What Plan's hero asks for first before money that only lands has made a number. */
export interface LandedNeed {
  /** The bills, else Future you or the jars, else nothing to set aside at all. */
  readonly kind: 'bills' | 'futureYou' | 'jars' | 'none';
  readonly amount: Vnd;
  /** Future you still waits after the bills. */
  readonly thenFutureYou: boolean;
}

/**
 * What is still to set aside before the days get money, in the order money fills it: the bills
 * first, then Future you and the jars. `none` when there is nothing to set aside, so Plan never
 * says "Bills need 0k".
 */
export function landedNeedOf(view: Pick<LandedView, 'items' | 'billsStillNeed'>): LandedNeed {
  const need = (kind: 'futureYou' | 'jars') =>
    view.items.filter((i) => i.kind === kind).reduce((sum, i) => sum + i.amount - i.covered, 0);
  const futureYou = need('futureYou');
  const jars = need('jars');
  const thenFutureYou = futureYou > 0;
  if (view.billsStillNeed > 0) {
    return { kind: 'bills', amount: view.billsStillNeed, thenFutureYou };
  }
  if (futureYou + jars > 0) {
    return { kind: jars > 0 ? 'jars' : 'futureYou', amount: futureYou + jars, thenFutureYou };
  }
  return { kind: 'none', amount: 0, thenFutureYou: false };
}
