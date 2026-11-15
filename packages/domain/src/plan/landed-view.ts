import type { Currency } from '../money/currency';
import type { Vnd } from '../money/format';
import { addDays, daysInMonth, makeDate, parts, type LocalDate } from '../time/local-date';
import { billThisCycle } from './bills';
import type { IncomePeriod, PeriodBill } from './income-period';
import { landedReach, type ComingDuesInput } from './landed';
import { payCycleOn, type PayCycle, type Payday } from './pay-cycle';
import { billDueIn } from './plan-river';

/** Something the month sets aside before any day gets money: a bill, Future you, other jars. */
export interface SetAsideItem {
  readonly kind: 'bill' | 'futureYou' | 'jars';
  /** For a bill: its place in the bills given. */
  readonly index: number | null;
  /** For a bill: the day it falls due this month. */
  readonly due: LocalDate | null;
  readonly amount: Vnd;
  /** What is set aside for it so far: bills first, earliest due first, then the jars. */
  readonly covered: Vnd;
  /** Paid already. */
  readonly paid: boolean;
}

/** How the month stands for money that only lands. */
export type LandedState =
  /** Nothing landed and nothing in hand: no number is made. */
  | 'empty'
  /** Something came, but the bills and jars still need more before any day gets money. */
  | 'short'
  /** The bills and jars are set aside; the rest is the number. */
  | 'landed';

export interface LandedView {
  readonly state: LandedState;
  /** What landed this month, and how many times. */
  readonly landed: Vnd;
  readonly landings: number;
  /** What the months before left in hand, counted with this one. */
  readonly inHand: Vnd;
  /** The month's bills and jars, what is set aside of them, and what they still need. */
  readonly required: Vnd;
  readonly reserved: Vnd;
  readonly stillNeeded: Vnd;
  /** Of `reserved`, the part for bills; the rest is jars. */
  readonly bills: Vnd;
  readonly jars: Vnd;
  readonly items: readonly SetAsideItem[];
  /** What the bills still need beyond what is set aside for them. */
  readonly billsStillNeed: Vnd;
  /** The first bill with less set aside than it takes, if any. */
  readonly nextNeed: SetAsideItem | null;
  /** The day the money lasts through, and the days after today up to it. */
  readonly on: LocalDate;
  readonly daysLeft: number;
  /** What there is to share before today: landed and in hand, less what is set aside. */
  readonly toShare: Vnd;
  /** Free money at the start of today. */
  readonly pool: Vnd;
  /**
   * What the coming months' bills and jars take within the days the line is spread over, kept
   * out before dividing (`landedReach`), and the last of those days.
   */
  readonly ahead: Vnd;
  readonly through: LocalDate;
  /** The pool, less `ahead`, over the days through `on`, today included, before any cap. */
  readonly evenly: Vnd;
  /** The usual day's cap, when it is what holds the line. */
  readonly capped: Vnd | null;
  /**
   * With no usual day yet, the six weeks the money is spread over instead, when they are more
   * than the stretch's days.
   */
  readonly spreadDays: number | null;
  readonly line: Vnd;
  /** The days through `on` at the line, and what that takes. */
  readonly stretchDays: number;
  readonly atLine: Vnd;
  /**
   * What is beyond the stretch's lines and pays at least one more day at the line: it waits in
   * hand. Nothing when no whole day is in hand.
   */
  readonly beyond: Vnd;
  /**
   * What is beyond the stretch's lines but pays no whole day in hand (the line's rounding, or what
   * next month's bills take on the way): it stays with the free money. Nothing when `beyond` is not.
   */
  readonly leftOver: Vnd;
  /** How many days the money lasts at the line, paying the months after as they come; null with no line. */
  readonly covered: number | null;
  /** The last day it covers. */
  readonly coveredTo: LocalDate | null;
  /** Of the days covered, those beyond `on`: the days in hand. */
  readonly inHandDays: number;
}

export interface LandedViewInput {
  readonly today: LocalDate;
  readonly cycle: PayCycle;
  readonly anchor: Payday;
  readonly period: IncomePeriod;
  /** Free money at the start of today (`dailyNumber`). */
  readonly startFree: Vnd;
  /** What landed this month, each landing. */
  readonly landings: readonly Vnd[];
  readonly inHand: Vnd;
  readonly bills: readonly PeriodBill[];
  /** What the month sets aside into Future you and into the other jars. */
  readonly futureYou: Vnd;
  readonly otherJars: Vnd;
  readonly currency?: Currency;
}

/**
 * The month as Today and Plan draw it for money that only lands: what the bills and jars still
 * need (and which come first), what landed and is in hand, how the pool becomes the day's line
 * (evenly, then capped by the usual day or spread over six weeks), what is beyond the stretch in
 * hand, and how many days the money covers.
 */
export function landedView(input: LandedViewInput): LandedView {
  const { period, cycle, today } = input;
  const items = setAsideItems(input);
  const pool = input.startFree;
  const reach = landedReach({
    day: today,
    pool,
    on: period.on,
    cap: period.cap,
    minDays: period.minDays,
    cycle,
    anchor: input.anchor,
    bills: input.bills,
    jars: input.futureYou + input.otherJars,
    ...(input.currency ? { currency: input.currency } : {}),
  });
  const landed = input.landings.reduce((sum, amount) => sum + amount, 0);
  const state: LandedState =
    pool > 0 || period.stillNeeded === 0
      ? landed + input.inHand > 0
        ? 'landed'
        : 'empty'
      : landed + input.inHand > 0
        ? 'short'
        : 'empty';
  return {
    state,
    landed,
    landings: input.landings.length,
    inHand: input.inHand,
    required: period.required,
    reserved: period.reserved,
    stillNeeded: period.stillNeeded,
    bills: period.bills,
    jars: period.reserved - period.bills,
    items,
    billsStillNeed: items
      .filter((item) => item.kind === 'bill')
      .reduce((sum, item) => sum + item.amount - item.covered, 0),
    nextNeed: items.find((item) => item.kind === 'bill' && item.covered < item.amount) ?? null,
    on: period.on,
    daysLeft: period.daysLeft,
    toShare: period.credited - period.reserved,
    pool,
    ahead: reach.ahead,
    through: reach.through,
    evenly: reach.evenly,
    capped: reach.capped,
    spreadDays: reach.spreadDays > reach.days ? reach.spreadDays : null,
    line: reach.line,
    stretchDays: reach.days,
    atLine: reach.atLine,
    beyond: reach.inHandDays > 0 ? reach.beyond : 0,
    leftOver: reach.inHandDays > 0 ? 0 : reach.beyond,
    covered: reach.covered,
    coveredTo: reach.coveredTo,
    inHandDays: reach.inHandDays,
  };
}

/** What a landing set aside, as the companion names it: only what is set aside in full. */
export type SetAsideNamed = 'both' | 'bills' | 'futureYou' | 'none';

/**
 * What the month has set aside in full, for the companion to name: the bills when there are any
 * and none still needs money, Future you when it has its whole amount. Other jars are not named.
 */
export function setAsideNamed(view: Pick<LandedView, 'items'>): SetAsideNamed {
  const whole = (kind: SetAsideItem['kind']) => {
    const items = view.items.filter((item) => item.kind === kind);
    return items.length > 0 && items.every((item) => item.covered >= item.amount);
  };
  const bills = whole('bill');
  const futureYou = whole('futureYou');
  return bills && futureYou ? 'both' : bills ? 'bills' : futureYou ? 'futureYou' : 'none';
}

/** The month's bills by due date, then Future you, then the other jars, each with what is set aside. */
function setAsideItems(input: LandedViewInput): SetAsideItem[] {
  const { cycle } = input;
  const bills = input.bills
    .map((bill, index) => ({
      kind: 'bill' as const,
      index,
      due: billDueIn(cycle, bill.dueDay),
      amount: billThisCycle(bill, cycle),
      paid: bill.paidCycle === cycle.start,
    }))
    .filter((bill) => bill.amount > 0)
    .sort((a, b) => (a.paid !== b.paid ? (a.paid ? -1 : 1) : a.due < b.due ? -1 : 1));
  const jars = [
    { kind: 'futureYou' as const, index: null, due: null, amount: input.futureYou, paid: false },
    { kind: 'jars' as const, index: null, due: null, amount: input.otherJars, paid: false },
  ].filter((jar) => jar.amount > 0);
  // The jars take what the month keeps out beyond its bills; bills fill first.
  let forBills = input.period.bills;
  let forJars = Math.max(0, input.period.reserved - input.period.bills);
  return [...bills, ...jars].map((item) => {
    const from = item.kind === 'bill' ? forBills : forJars;
    const covered = Math.min(item.amount, from);
    if (item.kind === 'bill') forBills -= covered;
    else forJars -= covered;
    return { ...item, covered };
  });
}

/** What "Make it last until" would give for a day: the line, the days, and the days in hand. */
export interface LastUntilPreview {
  readonly until: LocalDate;
  /** Today through `until`, at the line. */
  readonly days: number;
  readonly line: Vnd;
  /** What waits in hand beyond them, the coming bills paid. */
  readonly beyond: Vnd;
  /** Days at the line beyond `until`, walking the coming bills and jars: Plan's days in hand. */
  readonly inHandDays: number;
  /** The last day the money covers at the line. */
  readonly coveredTo: LocalDate | null;
}

/**
 * The day's line if the pool had to last through `until`, as the plan would count it once saved
 * (`landedReach`): so the sheet's days at the line and days in hand are Plan's and Today's.
 */
export function lastUntilPreview(
  input: ComingDuesInput & {
    readonly today: LocalDate;
    readonly until: LocalDate;
    readonly pool: Vnd;
    readonly cap: Vnd | null;
    readonly minDays: number;
    readonly currency?: Currency;
  },
): LastUntilPreview {
  const { today, until, ...rest } = input;
  const reach = landedReach({ ...rest, day: today, on: until < today ? today : until });
  return {
    until,
    days: reach.days,
    line: reach.line,
    beyond: reach.beyond,
    inHandDays: reach.inHandDays,
    coveredTo: reach.coveredTo,
  };
}

/**
 * The days "Make it last until" offers: the month's last day, then the 15th and the last day of
 * each of the next months, `months` of them.
 */
export function lastUntilChoices(today: LocalDate, anchor: Payday, months = 3): LocalDate[] {
  const end = addDays(payCycleOn(today, anchor).payday, -1);
  const out: LocalDate[] = [end < today ? today : end];
  let { year, month } = parts(end);
  for (let k = 0; k < months; k++) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    out.push(makeDate(year, month, 15), makeDate(year, month, daysInMonth(year, month)));
  }
  return out.filter((day, i) => out.indexOf(day) === i && day >= today);
}

/** A line of the maths for money that only lands, top to bottom. */
export type LandedRowKind =
  /** A landing (`index` among this month's), or all of them (`count`) when there are many. */
  | 'landed'
  /** What the months before left in hand. */
  | 'inHand'
  /** Set aside for the bills, and for the jars. */
  | 'bills'
  | 'jars'
  /** What there was to share. */
  | 'toShare'
  /** Spent before today. */
  | 'spentBefore'
  /** The coming months' bills and jars that fall due within the days spread over (`on`). */
  | 'ahead'
  /** The pool evenly over the days through the day it lasts to (`count`). */
  | 'evenly'
  /** The usual day's cap, when it holds the line. */
  | 'cap'
  /** Six weeks of days, when there is no usual day yet (`count`). */
  | 'spread'
  /** The days through the day it lasts to at the line (`count`). */
  | 'atLine'
  /** What waits in hand beyond them, and the days it covers (`count`). */
  | 'beyond'
  /** What is beyond them but pays no whole day: it stays free. */
  | 'leftOver';

export interface LandedRow {
  readonly kind: LandedRowKind;
  readonly amount: Vnd;
  readonly total: boolean;
  readonly result: boolean;
  readonly index?: number;
  readonly count?: number;
  /** For `ahead`: the last day it reaches. */
  readonly on?: LocalDate;
}

/** The most landings the maths lists one by one; more are one line. */
const LANDING_ROWS = 3;

/**
 * Today's maths for money that only lands: each landing, what is set aside, what there was to
 * share, then how the line was made (evenly, capped or spread) and what waits in hand, or, with no
 * whole day in hand, what is left over and stays free. The rows add up: `toShare` less
 * `spentBefore` is the pool; less `ahead`, `atLine` and `beyond` or `leftOver` make it again.
 */
export function landedMaths(view: LandedView, landings: readonly Vnd[]): LandedRow[] {
  const row = (
    kind: LandedRowKind,
    amount: Vnd,
    extra: Partial<Omit<LandedRow, 'kind' | 'amount'>> = {},
  ): LandedRow => ({ kind, amount, total: false, result: false, ...extra });
  const rows: LandedRow[] =
    landings.length > LANDING_ROWS
      ? [row('landed', view.landed, { count: landings.length })]
      : landings.map((amount, index) => row('landed', amount, { index }));
  if (view.inHand > 0) rows.push(row('inHand', view.inHand));
  if (view.bills > 0) rows.push(row('bills', -view.bills));
  if (view.jars > 0) rows.push(row('jars', -view.jars));
  rows.push(row('toShare', view.toShare, { total: true }));
  if (view.toShare !== view.pool) rows.push(row('spentBefore', view.pool - view.toShare));
  if (view.ahead > 0) rows.push(row('ahead', -view.ahead, { on: view.through }));
  rows.push(row('evenly', view.evenly, { count: view.stretchDays }));
  if (view.capped !== null) rows.push(row('cap', view.capped));
  if (view.spreadDays !== null) rows.push(row('spread', view.line, { count: view.spreadDays }));
  rows.push(row('atLine', view.atLine, { total: true, count: view.stretchDays }));
  if (view.beyond > 0) {
    rows.push(row('beyond', view.beyond, { result: true, count: view.inHandDays }));
  } else if (view.leftOver > 0) {
    rows.push(row('leftOver', view.leftOver, { result: true }));
  }
  return rows;
}
