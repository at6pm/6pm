import type { Vnd } from '../money/format';
import {
  addDays,
  daysInMonth,
  diffDays,
  makeDate,
  parts,
  weekdayMondayFirst,
  type LocalDate,
} from '../time/local-date';
import { payCycleOn, type PayCycle, type Payday } from './pay-cycle';

/**
 * How often an income pays. A day of the month clamps to short months (the 31st is the 30th in
 * November); `weekday` is 0 = Monday … 6 = Sunday, as the design's weeks run; `everyTwoWeeks` pays
 * on its anchor and every fourteen days either side of it; `none` has no dates: it only lands.
 */
export type Rhythm =
  | { readonly kind: 'monthly'; readonly day: number | 'last' }
  | { readonly kind: 'weekly'; readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  | { readonly kind: 'everyTwoWeeks'; readonly anchor: LocalDate }
  | { readonly kind: 'twiceMonthly'; readonly days: readonly [number, number | 'last'] }
  | { readonly kind: 'none' };

export interface Income {
  readonly id: string;
  readonly name: string | null;
  readonly rhythm: Rhythm;
  /** What each pay brings. 0 is money that is counted only once it has landed. */
  readonly amount: Vnd;
  readonly fromWork?: boolean | undefined;
  /**
   * The first day it pays from: a wage someone starts paying themselves from their next close.
   * Its dates before this day are not pays at all. Left out, it has always paid.
   */
  readonly from?: LocalDate | undefined;
}

/** One pay on one day. */
export interface PayEvent {
  readonly day: LocalDate;
  readonly incomeId: string;
  readonly amount: Vnd;
  /**
   * A pay beyond the rhythm's usual count in its budget month: a fifth Friday, a third fortnight.
   * A monthly income is never extra: two of its pays in one budget month only happen when its day
   * clamps beside the month's anchor, and then the next month has none.
   */
  readonly extra: boolean;
}

/** The plan's own monthly pay, when no incomes have been set. */
export const PLAN_INCOME_ID = 'plan';

/** The part of the plan the incomes are read from. */
export interface IncomePlan {
  readonly income: Vnd;
  readonly payday: Payday;
  readonly incomes?: readonly Income[] | undefined;
}

/** A budget month that is the calendar month: the anchor of someone with no monthly pay. */
const CALENDAR_MONTH: Payday = { kind: 'sameDay', day: 1 };

/** The furthest any dated rhythm goes without paying is a month; two covers every clamp. */
const LOOK_AHEAD_DAYS = 62;

/**
 * The plan's incomes. A plan that has never been asked has one: its monthly pay on its payday
 * ("it varies" is the last day of the month, as the pay cycle counts it).
 */
export function incomesOf(plan: IncomePlan): readonly Income[] {
  if (plan.incomes !== undefined) return plan.incomes;
  const day = plan.payday.kind === 'sameDay' ? plan.payday.day : 'last';
  return [
    { id: PLAN_INCOME_ID, name: null, rhythm: { kind: 'monthly', day }, amount: plan.income },
  ];
}

/** How many times a rhythm pays in a usual budget month. */
export function basePays(rhythm: Rhythm): number {
  switch (rhythm.kind) {
    case 'weekly':
      return 4;
    case 'everyTwoWeeks':
    case 'twiceMonthly':
      return 2;
    case 'monthly':
      return 1;
    case 'none':
      return 0;
  }
}

function dayIn(year: number, month: number, day: number | 'last'): LocalDate {
  const last = daysInMonth(year, month);
  return makeDate(year, month, day === 'last' ? last : Math.min(Math.max(1, day), last));
}

/** The days a rhythm lists in each calendar month from `from` through `to`, in order. */
function monthDays(
  days: readonly (number | 'last')[],
  from: LocalDate,
  to: LocalDate,
): LocalDate[] {
  const out: LocalDate[] = [];
  const end = parts(to);
  let { year, month } = parts(from);
  while (year < end.year || (year === end.year && month <= end.month)) {
    // Two days that clamp onto each other (the 30th and the last, in February) are one pay.
    const inMonth = [...new Set(days.map((day) => dayIn(year, month, day)))].sort();
    for (const day of inMonth) if (day >= from && day <= to) out.push(day);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

function everyNDays(first: LocalDate, step: number, to: LocalDate): LocalDate[] {
  const out: LocalDate[] = [];
  for (let day = first; day <= to; day = addDays(day, step)) out.push(day);
  return out;
}

/** Every day a rhythm pays from `from` through `to`, both counted, in order. */
function payDays(rhythm: Rhythm, from: LocalDate, to: LocalDate): LocalDate[] {
  if (to < from) return [];
  switch (rhythm.kind) {
    case 'monthly':
      return monthDays([rhythm.day], from, to);
    case 'twiceMonthly':
      return monthDays(rhythm.days, from, to);
    case 'weekly': {
      const wait = (rhythm.weekday - weekdayMondayFirst(from) + 7) % 7;
      return everyNDays(addDays(from, wait), 7, to);
    }
    case 'everyTwoWeeks': {
      const since = ((diffDays(from, rhythm.anchor) % 14) + 14) % 14;
      return everyNDays(since === 0 ? from : addDays(from, 14 - since), 14, to);
    }
    case 'none':
      return [];
  }
}

/**
 * Every pay from `from` through `to` (both counted), by day and then in the incomes' order. A pay
 * is `extra` when its income has already paid its usual count in the budget month the day sits in;
 * the count starts at the month's first day, wherever `from` falls. The budget month is the pay
 * cycle of `anchor`, the calendar month when none is given.
 */
export function payEvents(
  incomes: readonly Income[],
  from: LocalDate,
  to: LocalDate,
  anchor: Payday = CALENDAR_MONTH,
): PayEvent[] {
  if (to < from) return [];
  const monthStart = payCycleOn(from, anchor).start;
  const events: PayEvent[] = [];
  for (const income of incomes) {
    const base = basePays(income.rhythm);
    let month = monthStart;
    let paid = 0;
    for (const day of payDays(income.rhythm, monthStart, to)) {
      if (income.from !== undefined && day < income.from) continue;
      const start = payCycleOn(day, anchor).start;
      if (start !== month) {
        month = start;
        paid = 0;
      }
      paid += 1;
      if (day < from) continue;
      const extra = income.rhythm.kind !== 'monthly' && paid > base;
      events.push({ day, incomeId: income.id, amount: income.amount, extra });
    }
  }
  // A stable sort: pays on the same day keep the incomes' order.
  return events.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}

/** Where an income's dates start from, looking from `day`: its own first day, if that is later. */
function startOf(income: Income, day: LocalDate): LocalDate {
  return income.from !== undefined && income.from > day ? income.from : day;
}

/** The first pay of an income with a first day (`from`), within the two months after it. */
function firstPayOf(income: Income & { readonly from: LocalDate }): LocalDate | null {
  return payDays(income.rhythm, income.from, addDays(income.from, LOOK_AHEAD_DAYS))[0] ?? null;
}

/**
 * The incomes that count on `day`: an income with a first day (`from`) counts once its first pay
 * on or after that day has come. Until then the plan is counted as it was without it, so a wage
 * someone starts paying themselves changes nothing before the wage does.
 */
export function incomesInEffect(incomes: readonly Income[], day: LocalDate): readonly Income[] {
  if (incomes.every((income) => income.from === undefined)) return incomes;
  return incomes.filter((income) => {
    if (income.from === undefined) return true;
    const first = firstPayOf({ ...income, from: income.from });
    return first !== null && first <= day;
  });
}

/** The first day after `today` that an income with a counted-on amount pays, if any does. */
function nextCountedPay(today: LocalDate, incomes: readonly Income[]): LocalDate | null {
  const from = addDays(today, 1);
  const to = addDays(today, LOOK_AHEAD_DAYS);
  let next: LocalDate | null = null;
  for (const income of incomes) {
    if (income.amount <= 0) continue;
    const day = payDays(income.rhythm, startOf(income, from), to)[0];
    if (day !== undefined && (next === null || day < next)) next = day;
  }
  return next;
}

/**
 * When money next comes: the next pay that is counted on, strictly after `today`. With none, the
 * money lasts to a day the user chose ("Make it last until"), while it has not passed; else to the
 * budget month's last day ("End of month"): the day before its payday. `daysLeft` counts the days
 * after `today` through that day, so the money is divided over the days up to and including it.
 */
export function moneyNext(
  today: LocalDate,
  cycle: PayCycle,
  incomes: readonly Income[],
  lastUntil: LocalDate | null,
): { on: LocalDate; daysLeft: number } {
  const monthEnd = addDays(cycle.payday, -1);
  const on =
    nextCountedPay(today, incomesInEffect(incomes, today)) ??
    (lastUntil !== null && lastUntil >= today ? lastUntil : monthEnd < today ? today : monthEnd);
  return { on, daysLeft: diffDays(on, today) };
}

/** The part of the plan the days to the next money are read from. */
export interface MoneyNextPlan extends IncomePlan {
  readonly lastUntil?: LocalDate | null | undefined;
}

/**
 * When money next comes for the plan, seen from `day`: the pay cycle's payday for a plan that has
 * never been asked about its incomes (exactly as before), else `moneyNext`. Every divisor that
 * spreads money over the days left goes through here or through the daily number's own input.
 */
export function moneyNextOf(
  day: LocalDate,
  plan: MoneyNextPlan,
): { on: LocalDate; daysLeft: number } {
  const cycle = payCycleOn(day, plan.payday);
  if (plan.incomes === undefined) return { on: cycle.payday, daysLeft: cycle.daysLeft };
  return moneyNext(day, cycle, plan.incomes, plan.lastUntil ?? null);
}
