import { ceilToStep, VND, type Currency } from '../money/currency';
import type { ClosedDayRow } from '../contracts/local-rows';
import type { Vnd } from '../money/format';
import { addDays, daysInMonth, makeDate, parts, type LocalDate } from '../time/local-date';
import { billCountsIn, billsThisCycle, billThisCycle, type CycleBill } from './bills';
import { basePays, moneyNext, payEvents, type Income, type IncomePlan } from './incomes';
import { aheadOf, lineCap, LANDED_MIN_DAYS } from './landed';
import { isJoinedCycle } from './joined-cycle';
import { payCycleOn, type PayCycle, type Payday } from './pay-cycle';

/** A bill as the period reads it: what it takes and the day of the month it is due. */
export interface PeriodBill extends CycleBill {
  readonly dueDay: number;
}

export interface ReservedInput {
  /** Today. */
  readonly day: LocalDate;
  /** The budget month today sits in: the pay cycle of `anchor`. */
  readonly cycle: PayCycle;
  /** The plan's payday, the month's anchor. */
  readonly anchor: Payday;
  readonly incomes: readonly Income[];
  /** The bills that still come off in the budget month. */
  readonly bills: readonly PeriodBill[];
  /** What the budget month sets aside into jars: Future you as it counts it, and the others. */
  readonly jars: Vnd;
  /** Kept out whole, never sliced: what jars deleted this month still hold for their spends. */
  readonly held?: Vnd;
  /** The day the person started 6pm; inside this month, nothing was set aside before it. */
  readonly joinedOn?: LocalDate | null;
  /** The home currency: slices round up to its step. Đồng when not given. */
  readonly currency?: Currency;
  /**
   * Pays that have landed and been placed as an income's pay, by income. Given, a counted pay
   * counts from the day it landed, not its date: one whose date has come and that has not landed
   * keeps the month waiting. Left out, every counted pay counts on its date.
   */
  readonly placed?: readonly PlacedPay[];
}

/** Money in placed as an income's pay (`moneyIn` pay with its `incomeId`). */
export interface PlacedPay {
  readonly incomeId: string;
  readonly day: LocalDate;
  readonly amount: Vnd;
}

export interface Reserved {
  /** What the budget month has had to set aside by today for bills and jars. */
  readonly required: Vnd;
  /**
   * Slices that pays beyond the usual count set aside with no bill or jar to go to (a fifth
   * Friday): out of today's free money, so every pay frees the same, and into the buffer at the
   * month's end.
   */
  readonly kept: Vnd;
}

/** The furthest one income's next pay or a bill's next due date is from any day. */
const LOOK_AHEAD_DAYS = 62;
/** Far enough back to hold the window of every due date a pay in the month can reach. */
const LOOK_BACK_DAYS = 95;

/**
 * The income bills and jars are set aside from: the counted-on income that brings the most in a
 * usual month (the first of equals). Others only add to the money that came. Null when nothing is
 * counted on: money that only lands.
 */
export function leadIncome(incomes: readonly Income[]): Income | null {
  let lead: Income | null = null;
  let most = 0;
  for (const income of incomes) {
    const monthly = income.amount * basePays(income.rhythm);
    if (monthly > most) {
      lead = income;
      most = monthly;
    }
  }
  return lead;
}

/** One time something falls due: the day, the day the one before it fell due, and how much. */
interface Due {
  readonly opens: LocalDate;
  readonly on: LocalDate;
  readonly amount: Vnd;
  /**
   * What it was set aside against before it was paid: a bill paid a different amount was sliced
   * at its own amount until then.
   */
  readonly planned: Vnd;
  /** Paid already: the whole of it is set aside now. */
  readonly paid: boolean;
}

/** A bill's due dates by month, clamped to short months, from `from`'s month through `to`'s. */
function dueDates(dueDay: number, from: LocalDate, to: LocalDate): LocalDate[] {
  const out: LocalDate[] = [];
  const end = parts(to);
  let { year, month } = parts(from);
  while (year < end.year || (year === end.year && month <= end.month)) {
    out.push(makeDate(year, month, Math.min(Math.max(1, dueDay), daysInMonth(year, month))));
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

function pairs(days: readonly LocalDate[]): [LocalDate, LocalDate][] {
  const out: [LocalDate, LocalDate][] = [];
  for (let i = 1; i < days.length; i++) {
    const opens = days[i - 1];
    const on = days[i];
    if (opens !== undefined && on !== undefined) out.push([opens, on]);
  }
  return out;
}

/** Every due date of a bill around the month, each with what that month's bill takes. */
function billDues(bill: PeriodBill, input: ReservedInput, from: LocalDate, to: LocalDate): Due[] {
  return pairs(dueDates(bill.dueDay, from, to)).map(([opens, on]) => {
    // The budget month this due date is the bill's in: the one holding the day before it.
    const month = payCycleOn(addDays(on, -1), input.anchor);
    const paid = month.start === input.cycle.start && bill.paidCycle === input.cycle.start;
    const counts = billCountsIn(bill, month);
    return {
      opens,
      on,
      amount: billThisCycle(bill, month),
      planned: counts ? bill.amount : 0,
      paid,
    };
  });
}

/** The jars fall due at each budget month's end: what they take is set aside within the month. */
function jarDues(input: ReservedInput, from: LocalDate, to: LocalDate): Due[] {
  const ends: LocalDate[] = [];
  let cycle = payCycleOn(from, input.anchor);
  ends.push(cycle.start);
  while (cycle.start <= to) {
    ends.push(cycle.payday);
    const next = payCycleOn(cycle.payday, input.anchor);
    if (next.start <= cycle.start) break;
    cycle = next;
  }
  return pairs(ends).map(([opens, on]) => ({
    opens,
    on,
    amount: input.jars,
    planned: input.jars,
    paid: false,
  }));
}

/** The lead's pay days, in order, and the last one before a day. */
class Pays {
  constructor(readonly days: readonly LocalDate[]) {}

  lastBefore(day: LocalDate): LocalDate | null {
    let last: LocalDate | null = null;
    for (const pay of this.days) {
      if (pay >= day) break;
      last = pay;
    }
    return last;
  }

  /** Pays from `from` through `to`, both counted. */
  between(from: LocalDate, to: LocalDate): LocalDate[] {
    return this.days.filter((pay) => pay >= from && pay <= to);
  }
}

/**
 * What a due date has had set aside for it by the end of `day`. Each pay in its window (from the
 * due date before it, up to the day before it falls due) adds a slice, rounded up to a step
 * cumulatively and never past the amount. The last pay before it falls due completes it, since the
 * next pay comes too late (a window with no pay at all leans on the pay before it); one paid
 * already is complete.
 */
function setAsideBy(
  due: Due,
  day: LocalDate,
  pays: Pays,
  base: number,
  currency: Currency,
  paidCounts: boolean,
): Vnd {
  if (paidCounts && due.paid) return due.amount;
  const amount = paidCounts ? due.amount : due.planned;
  if (amount <= 0) return 0;
  const last = pays.lastBefore(due.on);
  if (last !== null && last <= day) return amount;
  const count = pays.between(due.opens, day < due.on ? day : addDays(due.on, -1)).length;
  return Math.min(amount, ceilToStep((amount * count) / base, currency));
}

/**
 * What the slices of pays beyond the usual count would have been: a pay is beyond it when its
 * window already had `base` pays before it.
 */
function keptBy(
  due: Due,
  counted: readonly LocalDate[],
  pays: Pays,
  base: number,
  currency: Currency,
): Vnd {
  if (due.amount <= 0) return 0;
  const inWindow = pays.between(due.opens, addDays(due.on, -1));
  const beyond = inWindow.slice(base).filter((pay) => counted.includes(pay)).length;
  return beyond * Math.min(due.amount, ceilToStep(due.amount / base, currency));
}

/**
 * What the budget month has set aside by the end of `day`, for someone whose lead income is not
 * monthly. A bill fills from its last due date to its next, a slice a pay (`basePays`: four a
 * week's pay, two a fortnight's or a twice-monthly one's); jars fill inside the month the same
 * way. The month counts the slices of its own pays: what earlier pays set aside was the months
 * before's. Someone who joined in this month had nothing set aside before, so everything still to
 * come due from the day they joined is set aside now, as far as the pays so far reach.
 */
function accrued(
  input: ReservedInput,
  lead: Income,
): Reserved & { readonly waiting: boolean; readonly due: LocalDate | null } {
  const { day, cycle, currency = VND } = input;
  const base = basePays(lead.rhythm);
  const from = addDays(cycle.start, -LOOK_BACK_DAYS);
  const to = addDays(day, LOOK_AHEAD_DAYS);
  const joinedOn = input.joinedOn ?? null;
  const fresh = isJoinedCycle(cycle, joinedOn);
  const countFrom = countingFrom(input, lead);
  const { pays, waiting, due } = countedPays(input, lead, from, to, countFrom);
  const counted = pays.between(countFrom, day);
  const before = addDays(cycle.start, -1);
  const dues = [
    ...input.bills.flatMap((bill) => billDues(bill, input, from, to)),
    ...jarDues(input, from, to),
  ];
  let required = Math.max(0, input.held ?? 0);
  let kept = 0;
  for (const due of dues) {
    const now = setAsideBy(due, day, pays, base, currency, true);
    if (fresh) {
      // Due before the day they joined: paid before 6pm counted.
      if (joinedOn !== null && due.on >= joinedOn) required += now;
    } else {
      required += now - setAsideBy(due, before, pays, base, currency, false);
    }
    kept += keptBy(due, counted, pays, base, currency);
  }
  return { required, kept, waiting, due };
}

/**
 * Where the month's counting starts: its first day, or for someone who joined in it, the pay the
 * joining day sits after (that pay's money is what they had in hand).
 */
function countingFrom(input: ReservedInput, lead: Income): LocalDate {
  const { cycle } = input;
  const joinedOn = input.joinedOn ?? null;
  if (joinedOn === null || !isJoinedCycle(cycle, joinedOn)) return cycle.start;
  const dates = payEvents([lead], addDays(cycle.start, -LOOK_BACK_DAYS), joinedOn, input.anchor);
  return periodStart(new Pays(dates.map((event) => event.day)), joinedOn);
}

/**
 * The lead's pays as they count: before `countFrom` on their dates (the months before took them as
 * they came), and from it in order, each on the day a placed pay landed for it. A pay whose date
 * has come with nothing placed for it is not in yet: it is counted as coming tomorrow, and the
 * month waits for it. Without `placed`, every pay is on its date.
 */
function countedPays(
  input: ReservedInput,
  lead: Income,
  from: LocalDate,
  to: LocalDate,
  countFrom: LocalDate,
): { readonly pays: Pays; readonly waiting: boolean; readonly due: LocalDate | null } {
  const dates = payEvents([lead], from, to, input.anchor).map((event) => event.day);
  if (input.placed === undefined) return { pays: new Pays(dates), waiting: false, due: null };
  const before = landedBefore(input);
  const landed = input.placed
    .filter((p) => p.incomeId === lead.id && p.day >= countFrom && p.day <= input.day)
    .filter((p) => p.day > before)
    .map((p) => p.day)
    .sort();
  let due: LocalDate | null = null;
  let k = 0;
  const days = dates.map((date) => {
    if (date < countFrom || date <= before) return date;
    const on = landed[k];
    k += 1;
    if (on !== undefined) return on;
    if (date > input.day) return date;
    due ??= date;
    return addDays(input.day, 1);
  });
  return { pays: new Pays(days.sort()), waiting: due !== null, due };
}

/**
 * The last day whose pays came before 6pm was counting: the joining day, in the month someone
 * joined (the pay that opened their stretch had landed already, with nothing to place it from);
 * else none.
 */
function landedBefore(input: ReservedInput): LocalDate {
  const joinedOn = input.joinedOn ?? null;
  return joinedOn !== null && isJoinedCycle(input.cycle, joinedOn) ? joinedOn : '';
}

/** The lead income's pays as the month counts them, and the day its counting starts. */
export interface LeadPays {
  readonly lead: Income;
  /** Each counted pay on the day it counts: the day it landed, or its date before counting. */
  readonly days: readonly LocalDate[];
  readonly countFrom: LocalDate;
  /** A pay whose date has come has not landed. */
  readonly waiting: boolean;
  /** The date of the first such pay: the pay the month waits for. */
  readonly due: LocalDate | null;
}

/**
 * The lead income's pays around `day`, as `reservedOn` counts them; null when the lead is a
 * monthly pay or nothing is counted on.
 */
export function leadPaysOf(input: ReservedInput): LeadPays | null {
  const lead = leadIncome(input.incomes);
  if (lead === null || lead.rhythm.kind === 'monthly') return null;
  const countFrom = countingFrom(input, lead);
  const { pays, waiting, due } = countedPays(
    input,
    lead,
    addDays(input.cycle.start, -LOOK_BACK_DAYS),
    addDays(input.day, LOOK_AHEAD_DAYS),
    countFrom,
  );
  return { lead, days: pays.days, countFrom, waiting, due };
}

/** The pay that opened the stretch `day` is in: the last on or before it, else the day itself. */
function periodStart(pays: Pays, day: LocalDate): LocalDate {
  return pays.lastBefore(addDays(day, 1)) ?? day;
}

/**
 * What the budget month has to keep out of free money by the end of `day`. With a monthly lead
 * income (or none counted on) it is today's month: every bill this month, and the jars, whole.
 * Otherwise bills and jars are set aside a slice a pay (`accrued`), and pays beyond the usual count
 * keep their slice aside as `kept`.
 */
export function reservedOn(input: ReservedInput): Reserved {
  const lead = leadIncome(input.incomes);
  if (lead === null || lead.rhythm.kind === 'monthly') {
    return {
      required:
        billsThisCycle(input.bills, input.cycle) + input.jars + Math.max(0, input.held ?? 0),
      kept: 0,
    };
  }
  const { required, kept } = accrued(input, lead);
  return { required, kept };
}

export interface PeriodInput extends ReservedInput {
  /** "Make it last until", when no pay is counted on. */
  readonly lastUntil: LocalDate | null;
  /**
   * What the buffer jar holds: what the months before left over and kept. Counted with this
   * month's money whenever the lead income is not monthly. Nothing when left out.
   */
  readonly inHand?: Vnd;
  /** Recent closed days, for the cap on a line from money that only lands (`lineCap`). */
  readonly closedDays?: readonly Pick<ClosedDayRow, 'day' | 'spent'>[];
  /**
   * The day's line on the day before the pay the month waits for was due (`due`): while it has
   * not landed the day stays there, never more than what is left. Null when no such day is known:
   * then what is left is spread through the pay after the late one.
   */
  readonly heldLine?: Vnd | null;
  /**
   * What work of one's own kept this month through its closed days, taken as it comes
   * (`workLanded`): money that only lands, counted with the month's money before bills and jars
   * are set aside from it. Nothing when left out, and for anyone who has not turned work on.
   */
  readonly workKept?: Vnd;
}

/** How a month is counted. */
export type PeriodKind = 'monthly' | 'counted' | 'landed';

export interface IncomePeriod {
  /**
   * `monthly`: the lead income is a monthly pay, counted as the plan always was. `counted`: bills
   * and jars are set aside a slice a pay. `landed`: nothing is counted on; the month spends what
   * has landed and what is in hand.
   */
  readonly kind: PeriodKind;
  /** Money the month has had in by today: pays that came, and what is in hand. */
  readonly credited: Vnd;
  /** What the month needs set aside by today: bills and jars. */
  readonly required: Vnd;
  /** Kept out of free money: what is set aside, and what pays beyond the usual count keep. */
  readonly reserved: Vnd;
  readonly kept: Vnd;
  /** What the month needs set aside and has not had the money for (money that only lands). */
  readonly stillNeeded: Vnd;
  /** When money next comes, and the days after today through it: the divisor's days. */
  readonly on: LocalDate;
  readonly daysLeft: number;
  /** The most a day's line can be (`lineCap`); null for no cap. */
  readonly cap: Vnd | null;
  /** The fewest days the money is spread over: six weeks while there is no cap to lean on. */
  readonly minDays: number;
  /**
   * A counted pay's date has come and it has not landed: the month waits for it. It is still the
   * next money (`on` is its date, `due`), nothing of it counts, and the day holds at `hold` (the
   * line of the day before it was due), with no days after today to divide by.
   */
  readonly waiting: boolean;
  readonly due: LocalDate | null;
  readonly hold: Vnd | null;
  /** The lead income is monthly: the joined month keeps its share of it (`joinedCycle`). */
  readonly monthly: boolean;
  /** Of what is reserved, the part for bills; the rest is jars and what extra pays keep. */
  readonly bills: Vnd;
  /** What the next money brings: the counted pays on the day it comes; nothing for landings. */
  readonly coming: Vnd;
  /**
   * For money that only lands: what the coming months' bills and jars take within the days the
   * line is spread over (`landedReach`), kept out before dividing. Nothing for any other month.
   */
  readonly ahead: Vnd;
  /**
   * What the month has actually set aside into jars by today: all of them for a monthly lead; the
   * slices of the pays so far for a counted one; what the landings reached after the bills for
   * money that only lands.
   */
  readonly jars: Vnd;
  /**
   * What work kept (`workKept`) that this month's money does not already hold, for the daily
   * number to add as money in: beside a counted pay it is free money; when nothing is counted on it
   * is in `credited` already, and this is nothing.
   */
  readonly workMoneyIn: Vnd;
}

/**
 * Whether a plan's months carry what is left into the buffer jar ("In hand"): when its incomes
 * are set and none of them is a monthly pay that leads (`leadIncome`). Monthly earners never
 * carry; each month starts whole.
 */
export function carriesOver(plan: Pick<IncomePlan, 'incomes'>): boolean {
  if (plan.incomes === undefined) return false;
  const lead = leadIncome(plan.incomes);
  return lead === null || lead.rhythm.kind !== 'monthly';
}

/** Placed pays of the given incomes, from `from` through `to`. */
function placedSum(
  placed: readonly PlacedPay[],
  ids: ReadonlySet<string>,
  from: LocalDate,
  to: LocalDate,
): Vnd {
  return placed
    .filter((p) => ids.has(p.incomeId) && p.day >= from && p.day <= to)
    .reduce((sum, p) => sum + p.amount, 0);
}

/**
 * The money the daily number divides, for a plan that holds its incomes: what came in this budget
 * month by today and what is in hand, less what it has had to set aside, over the days to the next
 * money.
 * - A monthly lead income counts as the plan always did: every pay on its date, bills and jars
 *   whole.
 * - Another counted lead sets bills and jars aside a slice a pay; with `placed`, a pay counts once
 *   it has landed. While one is late the month waits for it: it stays the next money, and the
 *   day holds at `heldLine`, never more than what is left (left from before and in hand).
 * - With nothing counted on, the month has what is in hand and what has landed; it sets the
 *   month's bills and jars aside from that as far as it reaches (`stillNeeded` is the rest), and
 *   the line is capped by the usual day (`lineCap`), or spread over six weeks or more before
 *   there is one.
 */
export function incomePeriod(input: PeriodInput): IncomePeriod {
  const { day, cycle, currency = VND } = input;
  const lead = leadIncome(input.incomes);
  const next = moneyNext(day, cycle, input.incomes, input.lastUntil);
  const inHand = Math.max(0, input.inHand ?? 0);
  const workKept = Math.max(0, input.workKept ?? 0);
  const counted = input.incomes.filter((income) => income.amount > 0);
  const comingOn = (on: LocalDate) =>
    payEvents(counted, on, on, input.anchor).reduce((s, e) => s + e.amount, 0);
  const quiet = {
    cap: null,
    minDays: 0,
    waiting: false,
    due: null,
    hold: null,
    stillNeeded: 0,
    coming: comingOn(next.on),
    ahead: 0,
    workMoneyIn: workKept,
  } as const;
  const jarsOnly = () => reservedOn({ ...input, bills: [], held: 0 }).required;
  const billsOf = (reserved: Vnd) =>
    Math.min(reserved, reservedOn({ ...input, jars: 0, held: 0 }).required);
  if (lead === null) {
    const landedIds = new Set(input.incomes.filter((i) => i.amount <= 0).map((i) => i.id));
    const credited = inHand + placedSum(input.placed ?? [], landedIds, cycle.start, day) + workKept;
    const required = reservedOn(input).required;
    const reserved = Math.min(required, credited);
    const cap = lineCap(input.closedDays ?? [], day, currency);
    const minDays = cap === null ? LANDED_MIN_DAYS : 0;
    return {
      ...quiet,
      workMoneyIn: 0,
      kind: 'landed',
      credited,
      required,
      reserved,
      kept: 0,
      stillNeeded: required - reserved,
      on: next.on,
      daysLeft: next.daysLeft,
      cap,
      minDays,
      monthly: false,
      bills: billsOf(reserved),
      ahead: aheadOf({ ...input, days: Math.max(next.daysLeft + 1, minDays) }),
      // Bills fill first; the jars have what the landings reach after them.
      jars: Math.max(0, Math.min(input.jars, reserved - billsOf(reserved))),
    };
  }
  if (lead.rhythm.kind === 'monthly') {
    const came = payEvents(counted, cycle.start, day, input.anchor).reduce(
      (s, e) => s + e.amount,
      0,
    );
    const { required } = reservedOn(input);
    return {
      ...quiet,
      kind: 'monthly',
      credited: came,
      required,
      reserved: required,
      kept: 0,
      on: next.on,
      daysLeft: next.daysLeft,
      monthly: true,
      bills: billsOf(required),
      jars: input.jars,
    };
  }
  const from = countingFrom(input, lead);
  const before = landedBefore(input);
  const scheduled = (to: LocalDate) =>
    payEvents(counted, from, to, input.anchor).reduce((s, e) => s + e.amount, 0);
  const came =
    input.placed === undefined
      ? scheduled(day)
      : // Pays from before joining had landed already: counted on their dates.
        (before >= from ? scheduled(before < day ? before : day) : 0) +
        placedSum(
          input.placed.filter((p) => p.day > before),
          new Set(counted.map((i) => i.id)),
          from,
          day,
        );
  const { required, kept, waiting, due } = accrued(input, lead);
  // A late pay is still the next money; the day holds where it was. With no day before it known,
  // what is left is spread through the pay after it, the most it could have to last.
  const hold = due !== null ? (input.heldLine ?? null) : null;
  return {
    ...quiet,
    kind: 'counted',
    credited: came + inHand,
    required,
    reserved: required + kept,
    kept,
    on: due ?? next.on,
    daysLeft: hold !== null ? 0 : next.daysLeft,
    waiting,
    due,
    hold,
    coming: comingOn(due ?? next.on),
    monthly: false,
    bills: billsOf(required),
    jars: jarsOnly(),
  };
}
