import { ceilToStep, VND, type Currency } from '../money/currency';
import type { Vnd } from '../money/format';
import { dayPartOf, type CountedSpend } from '../spend/spend';
import {
  addDays,
  daysInMonth,
  diffDays,
  makeDate,
  parts,
  type LocalDate,
} from '../time/local-date';
import {
  incomePeriod,
  leadIncome,
  leadPaysOf,
  reservedOn,
  type PeriodInput,
  type Reserved,
  type ReservedInput,
} from './income-period';
import { billThisCycle } from './bills';
import { basePays, payEvents, type Income } from './incomes';
import { isJoinedCycle } from './joined-cycle';
import { payCycleOn } from './pay-cycle';
import type { CycleDay } from './plan-split';

/**
 * One of a bill's slices as the Bills panel draws it: set aside by an earlier pay (`earlier`), by
 * this pay (`this`), owed by an earlier pay and covered by this one (`gap`), or still to come from
 * a later pay (`coming`).
 */
export type SliceState = 'earlier' | 'this' | 'gap' | 'coming';

/** A bill as this pay sees it. */
export interface StretchBill {
  /** Its place in the bills given. */
  readonly index: number;
  /** The due date this pay sets aside for: the bill's next after the pay. */
  readonly due: LocalDate;
  /** What that due date takes. */
  readonly amount: Vnd;
  /** What this pay set aside for it. */
  readonly slice: Vnd;
  /** Of the slice, what is beyond a usual slice: what earlier pays did not set aside. */
  readonly gap: Vnd;
  /** A usual pay's slice of it. */
  readonly usual: Vnd;
  /** It has everything set aside once this pay has. */
  readonly whole: boolean;
  /** Which of its slices this pay is, from 1; beyond the usual count for a pay with no slice. */
  readonly count: number;
  /** One per usual pay in its window. */
  readonly slices: readonly SliceState[];
  /** Earlier pays set nothing aside because the person had only just joined. */
  readonly joined: boolean;
}

/** The pay that opened today's stretch, for a plan paid by the week, the fortnight or twice a month. */
export interface PayStretch {
  /** The day it counted: the day it landed, or its date. */
  readonly payOn: LocalDate;
  /** What came that day from incomes with a counted-on amount. */
  readonly pay: Vnd;
  /** When money next comes, and the days after today through it. */
  readonly next: LocalDate;
  readonly daysLeft: number;
  /**
   * The next pay's date has come and it has not landed: `next` is its date, and the day holds
   * where it was while the month waits (`incomePeriod`).
   */
  readonly waiting: boolean;
  /** A pay beyond the usual count in its budget month: a fifth Friday. */
  readonly extra: boolean;
  /** Its place among the lead income's pays in its budget month, from 1: 5 on a fifth Friday. */
  readonly ofMonth: number;
  /** Usual pays in a month: 4 for a weekly pay, 2 for the others. */
  readonly base: number;
  readonly bills: readonly StretchBill[];
  /** What it set aside for bills, gaps included. */
  readonly billSlice: Vnd;
  /** What it set aside for jars, and how many usual slices that is. */
  readonly jarSlice: Vnd;
  readonly jarSlices: number;
  /** What it keeps aside with no bill or jar to go to, until the month ends. */
  readonly kept: Vnd;
  /** What it frees: the pay less every slice. */
  readonly free: Vnd;
  /** What a bill paid since the pay took on top of its slices (set aside the day it was paid). */
  readonly paidSince: Vnd;
  /** Every pay so far in the month already set its bills and jars aside: this one adds nothing. */
  readonly whole: boolean;
  /** A bill had nothing set aside before this pay because the person had just joined. */
  readonly joinedGap: boolean;
}

function dueDay(year: number, month: number, day: number): LocalDate {
  return makeDate(year, month, Math.min(Math.max(1, day), daysInMonth(year, month)));
}

/** A bill's due date after `day` and the one before it, clamped to short months. */
function dueAround(day: LocalDate, due: number): { opens: LocalDate; on: LocalDate } {
  const { year, month } = parts(day);
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const here = dueDay(year, month, due);
  return here > day
    ? { opens: dueDay(prev.year, prev.month, due), on: here }
    : { opens: here, on: dueDay(next.year, next.month, due) };
}

/** What the pay set aside of one kind: the month's total the day it counted less the day before. */
function sliceOf(
  input: ReservedInput,
  payOn: LocalDate,
  fresh: boolean,
  over: Partial<ReservedInput>,
  pick: (reserved: Reserved) => Vnd,
): Vnd {
  const at = (day: LocalDate) =>
    pick(reservedOn({ ...input, ...over, day, cycle: payCycleOn(day, input.anchor) }));
  const before = addDays(payOn, -1);
  const sameMonth =
    payCycleOn(before, input.anchor).start === payCycleOn(payOn, input.anchor).start;
  return at(payOn) - (sameMonth && !fresh ? at(before) : 0);
}

/**
 * The pay that opened today's stretch and what it did: what it brought, the slice of each bill
 * and of the jars it set aside (a gap included when earlier pays left a bill short before its due
 * date), what an extra pay keeps, and what it frees. Every amount comes from `reservedOn`, so the
 * slices add up to what the daily number keeps out. Null for a monthly lead income, for money
 * that only lands, and before any pay has counted.
 */
export function payStretch(input: PeriodInput): PayStretch | null {
  const lead = leadPaysOf(input);
  if (lead === null) return null;
  const payOn = [...lead.days].reverse().find((day) => day <= input.day);
  if (payOn === undefined) return null;
  const currency = input.currency ?? VND;
  const base = basePays(lead.lead.rhythm);
  const joinedOn = input.joinedOn ?? null;
  const payCycle = payCycleOn(payOn, input.anchor);
  // The pay that was in hand on the day they joined: it sets aside all that earlier pays did not.
  const joiningPay =
    joinedOn !== null && isJoinedCycle(payCycle, joinedOn)
      ? ([...lead.days].reverse().find((day) => day <= joinedOn) ?? null)
      : null;
  const fresh = joiningPay !== null && payOn <= joiningPay;
  const slice = (over: Partial<ReservedInput>, pick: (r: Reserved) => Vnd) =>
    sliceOf(input, payOn, fresh, over, pick);

  const bills = input.bills.map((bill, index): StretchBill => {
    const { opens, on } = dueAround(payOn, bill.dueDay);
    const window = lead.days.filter((day) => day >= opens && day < on);
    const at = window.indexOf(payOn);
    const completes = window[window.length - 1] === payOn;
    // The budget month the due date is the bill's in: the one holding the day before it.
    const month = payCycleOn(addDays(on, -1), input.anchor);
    const amount = billThisCycle(bill, month);
    const own = slice({ bills: [bill], jars: 0, held: 0 }, (r) => r.required);
    const whole = completes || at >= base || amount === 0 || bill.paidCycle === month.start;
    const usual = Math.min(amount, ceilToStep(amount / base, currency));
    const pre = (day: LocalDate) => fresh && joiningPay === payOn && day < payOn;
    const slices = Array.from({ length: base }, (_, i): SliceState => {
      const day = window[i];
      if (at >= base) return 'earlier';
      if (day === undefined) return completes ? 'gap' : 'coming';
      if (day < payOn) return pre(day) ? 'gap' : 'earlier';
      return day === payOn ? 'this' : 'coming';
    });
    return {
      index,
      due: on,
      amount,
      slice: own,
      gap: Math.max(0, own - usual),
      usual,
      whole,
      count: at + 1,
      slices,
      joined: slices.includes('gap') && window.some(pre),
    };
  });
  const billSlice = bills.reduce((sum, b) => sum + b.slice, 0);
  const jarSlice = slice({ bills: [], held: 0 }, (r) => r.required);
  const kept = slice({ held: 0 }, (r) => r.kept);
  const counted = input.incomes.filter((income) => income.amount > 0);
  const ids = new Set(counted.map((income) => income.id));
  const placedToday = (input.placed ?? []).filter((p) => ids.has(p.incomeId) && p.day === payOn);
  const placedOn = placedToday.reduce((sum, p) => sum + p.amount, 0);
  const scheduled = payEvents(counted, payOn, payOn, input.anchor).reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  // What was placed is what came, even short (a wage the shop could not pay in full).
  const pay = placedToday.length > 0 ? placedOn : scheduled;
  const event = payEvents([lead.lead], addDays(payOn, -6), payOn, input.anchor).at(-1);
  const next = incomePeriod(input);
  const sameMonth = payCycle.start === input.cycle.start;
  const reservedNow = (r: Reserved) => r.required;
  const paidSince =
    sameMonth && payOn < input.day
      ? Math.max(
          0,
          reservedNow(reservedOn({ ...input, held: 0 })) -
            reservedNow(reservedOn({ ...input, held: 0, day: payOn })),
        )
      : 0;
  const jarUsual = ceilToStep(input.jars / Math.max(1, base), currency);
  return {
    payOn,
    pay,
    next: next.on,
    daysLeft: next.daysLeft,
    waiting: next.waiting,
    extra: event?.extra === true,
    ofMonth: lead.days.filter((day) => day >= payCycle.start && day <= payOn).length,
    base,
    bills,
    billSlice,
    jarSlice,
    jarSlices: jarUsual > 0 ? Math.round(jarSlice / jarUsual) : 0,
    kept,
    free: pay - billSlice - jarSlice - kept,
    paidSince,
    whole: billSlice + jarSlice === 0 && kept > 0,
    joinedGap: bills.some((b) => b.joined),
  };
}

/** A line of a pay's maths, top to bottom. */
export type StretchRowKind =
  /** What the pay brought. */
  | 'pay'
  /** A bill's slice: `index` names the bill, `count` which slice, `whole` once it is complete. */
  | 'bill'
  /** The jars' slice: `count` slices of `base`. */
  | 'jars'
  /** What an extra pay keeps in hand. */
  | 'kept'
  /** What the pay frees. */
  | 'freePay'
  /** What was left of the stretch before it (signed). */
  | 'leftBefore'
  /** What the months before left, counted with this one. */
  | 'inHand'
  /** A bill paid since took the rest of its amount. */
  | 'paidSince'
  /** Spent since the pay, before today. */
  | 'spentSince'
  /** Free money at the start of today, over `count` days through the next pay. */
  | 'divide'
  /** The day's line. */
  | 'each'
  /** While the next pay is late: free money at the start of today, what the wait has. */
  | 'wait'
  /** While the next pay is late: the day's line, held where it was. */
  | 'held';

export interface StretchRow {
  readonly kind: StretchRowKind;
  /** Signed: what a row takes away is below zero. */
  readonly amount: Vnd;
  readonly total: boolean;
  readonly result: boolean;
  readonly index?: number;
  readonly count?: number;
  readonly base?: number;
  readonly whole?: boolean;
}

/**
 * Today's maths for a pay: the pay, each slice it set aside, what it frees, what was left before
 * it and spent since, then today's free money over the days to the next pay and the day it gives.
 * The rows add up: `freePay` + `leftBefore` + `inHand` − `paidSince` − `spentSince` is `divide`
 * (`wait` while the next pay is late, when the day is `held` where it was, never above it).
 */
export function stretchMaths(
  stretch: PayStretch,
  day: {
    /** Free money at the start of today (`dailyNumber`'s `startFree`), and the line. */
    readonly startFree: Vnd;
    readonly line: Vnd;
    /** What the months before left in hand, counted with this month's money. */
    readonly inHand: Vnd;
    /** Spent from the pay's day up to today, today left out. */
    readonly spentSince: Vnd;
    /** The fewest days the money is spread over. */
    readonly minDays?: number;
  },
): StretchRow[] {
  const row = (
    kind: StretchRowKind,
    amount: Vnd,
    extra: Partial<Omit<StretchRow, 'kind' | 'amount'>> = {},
  ): StretchRow => ({ kind, amount, total: false, result: false, ...extra });
  const rows: StretchRow[] = [row('pay', stretch.pay)];
  for (const bill of stretch.bills) {
    if (bill.slice <= 0) continue;
    rows.push(
      row('bill', -bill.slice, { index: bill.index, count: bill.count, whole: bill.whole }),
    );
  }
  if (stretch.jarSlice > 0) {
    rows.push(row('jars', -stretch.jarSlice, { count: stretch.jarSlices, base: stretch.base }));
  }
  if (stretch.kept > 0) rows.push(row('kept', -stretch.kept));
  rows.push(row('freePay', stretch.free, { total: true }));
  const inHand = Math.max(0, day.inHand);
  const leftBefore = day.startFree + day.spentSince + stretch.paidSince - stretch.free - inHand;
  if (leftBefore !== 0) rows.push(row('leftBefore', leftBefore));
  if (inHand > 0) rows.push(row('inHand', inHand));
  if (stretch.paidSince > 0) rows.push(row('paidSince', -stretch.paidSince));
  if (day.spentSince > 0) rows.push(row('spentSince', -day.spentSince));
  if (stretch.waiting) {
    rows.push(row('wait', day.startFree));
    rows.push(row('held', day.line, { total: true, result: true }));
    return rows;
  }
  const count = Math.max(stretch.daysLeft + 1, day.minDays ?? 0);
  rows.push(row('divide', day.startFree, { count }));
  rows.push(row('each', day.line, { total: true, result: true }));
  return rows;
}

/**
 * The stretch's days as Free draws them: one dot a day from the pay through the next, today ringed,
 * past days by what they spent against the line.
 */
export function stretchDays(input: {
  readonly payOn: LocalDate;
  readonly next: LocalDate;
  readonly today: LocalDate;
  readonly line: Vnd;
  readonly free: Vnd;
  readonly spends: readonly (CountedSpend & { readonly day: LocalDate })[];
  readonly notDaily: ReadonlySet<string>;
}): CycleDay[] {
  const { payOn, next, today } = input;
  const count = Math.max(1, diffDays(next, payOn) + 1);
  const byDay = new Map<LocalDate, Vnd>();
  for (const spend of input.spends) {
    const part = dayPartOf(spend, input.notDaily);
    if (part !== 0) byDay.set(spend.day, (byDay.get(spend.day) ?? 0) + part);
  }
  const even = Math.max(input.line, 1);
  let running = 0;
  return Array.from({ length: count }, (_, k) => {
    const day = addDays(payOn, k);
    const spent = day <= today ? (byDay.get(day) ?? 0) : 0;
    running += spent;
    const kind =
      day === today ? 'today' : day > today ? 'future' : running > input.free ? 'over' : 'past';
    return { day, kind, spent, level: Math.max(0, Math.min(1, spent / even)) };
  });
}

/**
 * What one usual pay sets aside of a month's amount, as "{amount} each payday" says it: all of it
 * for a monthly pay (or a plan never asked about its incomes), a slice (a quarter for a weekly
 * pay, a half for the others, rounded up to a step) for a plan whose lead pay comes more often.
 */
export function perPayOf(
  monthly: Vnd,
  incomes: readonly Income[] | undefined,
  currency: Currency = VND,
): Vnd {
  if (incomes === undefined) return monthly;
  const lead = leadIncome(incomes);
  if (lead === null || lead.rhythm.kind === 'monthly') return monthly;
  return Math.min(monthly, ceilToStep(monthly / basePays(lead.rhythm), currency));
}
