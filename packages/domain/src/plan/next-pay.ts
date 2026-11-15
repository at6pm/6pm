import { floorToStep, VND, type Currency } from '../money/currency';
import type { Vnd } from '../money/format';
import { addDays, diffDays, type LocalDate } from '../time/local-date';
import { leadIncome, reservedOn, type PeriodBill } from './income-period';
import { payEvents, type Income, type IncomePlan } from './incomes';
import { payCycleOn, type Payday } from './pay-cycle';

export interface NextPayInput {
  readonly today: LocalDate;
  /** The plan's payday, the month's anchor. */
  readonly anchor: Payday;
  readonly incomes: readonly Income[];
  readonly bills: readonly PeriodBill[];
  /** What each month sets aside into jars. */
  readonly jars: Vnd;
  readonly currency?: Currency;
  /**
   * The pay the month is waiting for (`IncomePeriod.due`): its date has come and it has not
   * landed, so it is still the next pay, whatever today is.
   */
  readonly waitingFor?: LocalDate | null;
}

/** The next counted pay as the plan will count it, with nothing spent yet. */
export interface NextPay {
  /** The day it is due. */
  readonly on: LocalDate;
  /** The pay after it: the day its line runs to. */
  readonly until: LocalDate;
  /** What it sets aside into jars. */
  readonly jars: Vnd;
  /** The line it brings: what it frees, over its days through `until`. */
  readonly daily: Vnd;
}

/** What the budget month has set aside by the end of `day`, everything together. */
function setAsideBy(input: NextPayInput, day: LocalDate, bills: readonly PeriodBill[], jars: Vnd) {
  const { required, kept } = reservedOn({
    day,
    cycle: payCycleOn(day, input.anchor),
    anchor: input.anchor,
    incomes: input.incomes,
    bills,
    jars,
    joinedOn: null,
    ...(input.currency ? { currency: input.currency } : {}),
  });
  return required + kept;
}

/** What the pay on `on` sets aside: the month's total that day less the day before's. */
function sliceOf(input: NextPayInput, on: LocalDate, bills: readonly PeriodBill[], jars: Vnd) {
  const before = addDays(on, -1);
  const sameMonth = payCycleOn(before, input.anchor).start === payCycleOn(on, input.anchor).start;
  return (
    setAsideBy(input, on, bills, jars) - (sameMonth ? setAsideBy(input, before, bills, jars) : 0)
  );
}

/**
 * The next counted pay after today (or the late one the month waits for), for a plan whose lead
 * income is paid by the week, the fortnight or twice a month: the pays on its day, less the slices it sets aside, spread over its
 * days through the pay after it. What is left from before it is not counted, as a new month
 * starts whole on payday. Null when the lead is monthly (the plan's own payday counts it) or when
 * nothing is counted on.
 */
export function nextPay(input: NextPayInput): NextPay | null {
  const lead = leadIncome(input.incomes);
  if (lead === null || lead.rhythm.kind === 'monthly') return null;
  const from = input.waitingFor ?? addDays(input.today, 1);
  const pays = payEvents([lead], from, addDays(from, 62), input.anchor);
  const on = pays[0]?.day;
  const until = pays[1]?.day;
  if (on === undefined || until === undefined) return null;
  return {
    on,
    until,
    jars: sliceOf(input, on, [], input.jars),
    daily: lineFrom(input, on, until, input.jars),
  };
}

function lineFrom(input: NextPayInput, on: LocalDate, until: LocalDate, jars: Vnd): Vnd {
  const counted = input.incomes.filter((income) => income.amount > 0);
  const came = payEvents(counted, on, on, input.anchor).reduce((sum, e) => sum + e.amount, 0);
  const free = came - sliceOf(input, on, input.bills, jars);
  return Math.max(0, floorToStep(free / (diffDays(until, on) + 1), input.currency ?? VND));
}

/**
 * "From payday, each day 351k → 382k" for a plan paid by the week or the fortnight: the next
 * pay's line while a jar still takes its part of the jars (`took` a month) and once it stops.
 */
export function nextPayJarLine(
  input: NextPayInput & { readonly took: Vnd },
): { readonly before: Vnd; readonly after: Vnd } | null {
  const pay = nextPay(input);
  if (pay === null) return null;
  const took = Math.max(0, Math.min(input.took, input.jars));
  return {
    before: pay.daily,
    after: lineFrom(input, pay.on, pay.until, input.jars - took),
  };
}

/**
 * Whether the plan has a payday the jars fill on: a plan never asked about its incomes (as it
 * always was), or one with a pay it counts on. Money that only lands has none: its jars fill each
 * month, from what lands.
 */
export function hasPayday(plan: Pick<IncomePlan, 'incomes'>): boolean {
  return plan.incomes === undefined || leadIncome(plan.incomes) !== null;
}
