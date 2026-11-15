import {
  billDueIn,
  dailyNumber,
  incomePeriod,
  joinedCycle,
  landedView,
  payCycleOn,
  payStretch,
  VND,
  type Currency,
  type Income,
  type LocalDate,
  type Payday,
  type PeriodInput,
} from '@6pm/domain';

import type { FirstDay } from './onboarding-maths';

/** The first number for a plan that holds its incomes, and what it says beside it. */
export interface FirstDayOfIncomes extends FirstDay {
  /** Nothing is counted on: the number waits for money to land. */
  readonly landed: boolean;
  /** What the month's bills and Future you need before any day gets money. */
  readonly needs: number;
  /**
   * The pay that opens the first stretch, split as Plan and Today will draw it: its slices of
   * the bills and of the jars, and what it frees. Null for money that only lands.
   */
  readonly pay: {
    readonly amount: number;
    readonly bills: number;
    readonly jars: number;
    readonly free: number;
  } | null;
  /** Money that only lands: what the bills still need, and the first that falls due. */
  readonly billsStillNeed: number;
  readonly firstDue: { readonly index: number; readonly due: LocalDate } | null;
}

/**
 * The first day's number for someone whose money is not only a monthly salary, from the same
 * period Today will count once onboarding ends: joining today, nothing set aside before, bills
 * already due this month taken as paid, and no closed days yet (so money that only lands spreads
 * over six weeks or more).
 */
export function firstDayOfIncomes(
  input: {
    readonly incomes: readonly Income[];
    readonly anchor: Payday;
    readonly lastUntil: LocalDate | null;
    readonly bills: readonly { readonly amount: number; readonly dueDay: number }[];
    readonly futureYou: number;
  },
  today: LocalDate,
  currency: Currency = VND,
): FirstDayOfIncomes {
  const cycle = payCycleOn(today, input.anchor);
  const bills = input.bills.map((bill) => ({
    amount: bill.amount,
    dueDay: bill.dueDay,
    paidCycle: billDueIn(cycle, bill.dueDay) < today ? cycle.start : null,
  }));
  const periodInput: PeriodInput = {
    day: today,
    cycle,
    anchor: input.anchor,
    incomes: input.incomes,
    bills,
    jars: input.futureYou,
    joinedOn: today,
    lastUntil: input.lastUntil,
    closedDays: [],
    currency,
  };
  const period = incomePeriod(periodInput);
  const joined = joinedCycle(
    cycle,
    { on: today, spentSincePayday: null, futureYouAtPayday: false },
    period.monthly,
  );
  const day = dailyNumber({
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    period: {
      credited: period.credited,
      reserved: period.reserved,
      cap: period.cap,
      minDays: period.minDays,
      hold: period.hold,
      ahead: period.ahead,
    },
    spentBefore: 0,
    today: [],
    notDaily: new Set(),
    daysLeft: period.daysLeft,
    share: joined.share,
    currency,
  });
  const stretch = period.kind === 'counted' ? payStretch(periodInput) : null;
  const landed =
    period.kind === 'landed'
      ? landedView({
          today,
          cycle,
          anchor: input.anchor,
          period,
          startFree: day.startFree,
          landings: [],
          inHand: 0,
          bills,
          futureYou: input.futureYou,
          otherJars: 0,
          currency,
        })
      : null;
  const firstDue = landed?.nextNeed ?? null;
  return {
    line: Math.max(0, day.line),
    free: day.startFree,
    days: Math.max(period.daysLeft + 1, period.minDays),
    since: cycle.start,
    payday: period.on,
    joined: false,
    spentSincePayday: 0,
    presets: [],
    overspent: day.overspent,
    offerFutureYouAtPayday: false,
    futureYouSkipped: false,
    landed: period.kind === 'landed',
    needs: period.required,
    pay:
      stretch === null
        ? null
        : {
            amount: stretch.pay,
            bills: stretch.billSlice,
            jars: stretch.jarSlice + stretch.kept,
            free: stretch.free,
          },
    billsStillNeed: landed?.billsStillNeed ?? 0,
    firstDue:
      firstDue?.index != null && firstDue.due !== null
        ? { index: firstDue.index, due: firstDue.due }
        : null,
  };
}
