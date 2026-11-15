import type { ClosedDayRow } from '../contracts/local-rows';
import { designAmount, floorToStep, VND, type Currency } from '../money/currency';
import type { Vnd } from '../money/format';
import { addDays, diffDays, type LocalDate } from '../time/local-date';
import { billThisCycle } from './bills';
import type { PeriodBill } from './income-period';
import { payCycleOn, type PayCycle, type Payday } from './pay-cycle';
import { billDueIn } from './plan-river';

/**
 * Money that only lands has no next pay to divide up to, so a day's line leans on the usual day:
 * at most this many times what the recent closed days spent on average. A real raise passes
 * within a few weeks; a spike is kept back. Read from spending, not from the lines, so a capped
 * line never lifts its own cap.
 */
export const LINE_CAP_TIMES = 1.5;
/** The closed days the usual day is read from, the latest first. */
export const LINE_CAP_DAYS = 28;
/** Fewer closed days than this and there is no usual day yet. */
export const LINE_CAP_FIRST_DAYS = 7;
/** With no usual day yet, money that lands is spread over at least six weeks of days. */
export const LANDED_MIN_DAYS = 42;

/**
 * Future you for money that only lands, in đồng a month. A share of a pay means nothing when no
 * pay is counted on, so Future you is a fixed amount a month, set aside from what lands once the
 * bills are; onboarding's step starts it here and can take it to nothing.
 */
export const LANDED_FUTURE_YOU = 500_000;

/** `LANDED_FUTURE_YOU` in the home currency, at a round amount. */
export function landedFutureYouStart(currency: Currency = VND): Vnd {
  return designAmount(LANDED_FUTURE_YOU, currency);
}

/**
 * The most a day's line can be for money that only lands: 1.5 times what the last 28 closed days
 * before today spent on average, floored to a step. Days that closed with nothing spent are left
 * out: a cap read from them would hold the line at nothing once money lands. Null with fewer than
 * seven to go on: there is no cap, and the money is spread over at least `LANDED_MIN_DAYS`
 * instead.
 */
export function lineCap(
  closedDays: readonly Pick<ClosedDayRow, 'day' | 'spent'>[],
  today: LocalDate,
  currency: Currency = VND,
): Vnd | null {
  const spent = closedDays
    .filter((d) => d.day < today && d.spent > 0)
    .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0))
    .slice(0, LINE_CAP_DAYS)
    .map((d) => d.spent);
  if (spent.length < LINE_CAP_FIRST_DAYS) return null;
  const mean = spent.reduce((sum, amount) => sum + amount, 0) / spent.length;
  return floorToStep(mean * LINE_CAP_TIMES, currency);
}

/**
 * What is beyond the month's lines: the free money at the start of today less a line for every
 * day through the next money. It stays in hand for after.
 */
export function bufferOf(startFree: Vnd, line: Vnd, daysLeft: number): Vnd {
  return Math.max(0, startFree - line * (Math.max(0, daysLeft) + 1));
}

/** The longest walk `coverDays` takes: ten years of days. */
const COVER_MOST_DAYS = 3650;

/** What the months after this one take, and when: the part of the plan a walk forward needs. */
export interface ComingDuesInput {
  /** The budget month today sits in. */
  readonly cycle: PayCycle;
  readonly anchor: Payday;
  readonly bills: readonly PeriodBill[];
  /** What each month sets aside into jars. */
  readonly jars: Vnd;
}

/**
 * The bills and jars of the months after this one, by the day each falls due (a bill on its due
 * day, the jars on the month's first day), through `last`. This month's are already set aside.
 */
function comingDues(input: ComingDuesInput, last: LocalDate): Map<LocalDate, Vnd> {
  const dues = new Map<LocalDate, Vnd>();
  const add = (on: LocalDate, amount: Vnd) => dues.set(on, (dues.get(on) ?? 0) + amount);
  for (let month = payCycleOn(input.cycle.payday, input.anchor); month.start <= last;) {
    add(month.start, input.jars);
    for (const bill of input.bills) add(billDueIn(month, bill.dueDay), billThisCycle(bill, month));
    const next = payCycleOn(month.payday, input.anchor);
    if (next.start <= month.start) break;
    month = next;
  }
  return dues;
}

/** What falls due from `from` through `to`, both counted. */
function dueBetween(dues: ReadonlyMap<LocalDate, Vnd>, from: LocalDate, to: LocalDate): Vnd {
  let total = 0;
  for (const [day, amount] of dues) if (day >= from && day <= to) total += amount;
  return total;
}

/**
 * How many days, today included, the money lasts at today's line: walking forward a day at a
 * time, taking each coming month's bills on their due days and its jars on its first day, until
 * what is left cannot pay a day's line. This month's bills and jars are already out of `pool`;
 * what it still needs for them (`stillNeeded`) comes out first. Null with no line to walk at.
 */
export function coverDays(
  input: ComingDuesInput & {
    readonly day: LocalDate;
    /** Free money at the start of today. */
    readonly pool: Vnd;
    readonly line: Vnd;
    readonly stillNeeded?: Vnd;
  },
): number | null {
  const { line } = input;
  if (line <= 0) return null;
  const dues = comingDues(input, addDays(input.day, COVER_MOST_DAYS));
  let pool = input.pool - Math.max(0, input.stillNeeded ?? 0);
  let days = 0;
  for (let day = input.day; days < COVER_MOST_DAYS; day = addDays(day, 1)) {
    pool -= dues.get(day) ?? 0;
    if (pool < line) break;
    pool -= line;
    days += 1;
  }
  return days;
}

/**
 * What the coming months take within the days a line is spread over, from `day` for `days` days:
 * the line leaves room for them, so the money still lasts every one of those days.
 */
export function aheadOf(
  input: ComingDuesInput & { readonly day: LocalDate; readonly days: number },
): Vnd {
  const last = addDays(input.day, Math.max(1, input.days) - 1);
  return dueBetween(comingDues(input, last), input.day, last);
}

/** How far money that only lands reaches from today, at the line it gives. */
export interface Reach {
  /** Today through the day it lasts to (`on`): the days at the line. */
  readonly days: number;
  /** The days the line is spread over: `days`, or six weeks while there is no usual day yet. */
  readonly spreadDays: number;
  /** The last of them. */
  readonly through: LocalDate;
  /** What the coming months' bills and jars take within them, kept out before dividing. */
  readonly ahead: Vnd;
  /** What is left for the days, over the days to `on`, before any cap or spread. */
  readonly evenly: Vnd;
  /** The day's line: spread over `spreadDays`, never above the usual day's cap. */
  readonly line: Vnd;
  /** The cap, when it is what holds the line. */
  readonly capped: Vnd | null;
  /** The days to `on` at the line, and what waits in hand beyond them, the coming bills paid. */
  readonly atLine: Vnd;
  readonly beyond: Vnd;
  /** How many days the money lasts at the line, paying the months after as they come. */
  readonly covered: number | null;
  /** The last day it covers. */
  readonly coveredTo: LocalDate | null;
  /** Of the days covered, those beyond `on`: the days in hand. */
  readonly inHandDays: number;
}

/**
 * The one reckoning of how far money that only lands goes, for the daily number, Plan, Today's
 * ruler, the companion and "Make it last until": what is left is spread over the days through
 * `on` (or six weeks, `minDays`, while there is no usual day), with room kept for the coming
 * months' bills and jars that fall due within those days, never above the usual day's cap; then
 * a walk forward at that line says how many days it covers and how many of them are in hand.
 */
export function landedReach(
  input: ComingDuesInput & {
    readonly day: LocalDate;
    /** Free money at the start of today. */
    readonly pool: Vnd;
    /** The day the money lasts through. */
    readonly on: LocalDate;
    readonly cap: Vnd | null;
    readonly minDays: number;
    readonly currency?: Currency;
  },
): Reach {
  const currency = input.currency ?? VND;
  const days = Math.max(0, diffDays(input.on, input.day)) + 1;
  const spreadDays = Math.max(days, input.minDays);
  const ahead = aheadOf({ ...input, days: spreadDays });
  const left = input.pool - ahead;
  const evenly = Math.max(0, floorToStep(left / days, currency));
  const spread = Math.max(0, floorToStep(left / spreadDays, currency));
  const line = input.cap === null ? spread : Math.min(input.cap, spread);
  const covered = coverDays({ ...input, line });
  return {
    days,
    spreadDays,
    through: addDays(input.day, spreadDays - 1),
    ahead,
    evenly,
    line,
    capped: input.cap !== null && input.cap < spread ? input.cap : null,
    atLine: line * days,
    beyond: Math.max(0, left - line * days),
    covered,
    coveredTo: covered === null || covered === 0 ? null : addDays(input.day, covered - 1),
    inHandDays: covered === null ? 0 : Math.max(0, covered - days),
  };
}

/**
 * What a month leaves for the next, for someone whose months carry over: what was free at its end
 * (never below nothing) and what pays beyond the usual count kept. It becomes what the buffer jar
 * holds.
 */
export function cycleCarry(ending: { readonly free: Vnd; readonly kept: Vnd }): Vnd {
  return Math.max(0, ending.free) + Math.max(0, ending.kept);
}
