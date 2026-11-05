import type { PotRow } from '../contracts/local-rows';
import { hoursOf, type ClockTime } from '../time/close-time';
import {
  addDays,
  diffDays,
  makeDate,
  parts,
  weekdayMondayFirst,
  type LocalDate,
} from '../time/local-date';
import { nextNewYearWindow, type LunarTradition } from '../time/lunar';
import { calendarCells, dayDot, type ClosedDayTotal, type MonthKey } from './calendar';

/**
 * The days the widgets draw: the evenings closed in a row (the streak's strata), the month as
 * suns (the large widget), the hours a day's timeline turns at, and how far off a jar's day is.
 */

/**
 * Evenings closed in a row, counted back from today when today is closed, else from yesterday: an
 * open today does not break the run yet. A day not closed ends it.
 */
export function closeStreak(closed: readonly Pick<ClosedDayTotal, 'day'>[], today: LocalDate) {
  return streakRun(closed, today).length;
}

/**
 * The run behind `closeStreak`, oldest first: the rows of the evenings closed in a row, so each
 * can be drawn as the sky it closed under.
 */
export function streakRun<T extends Pick<ClosedDayTotal, 'day'>>(
  closed: readonly T[],
  today: LocalDate,
): T[] {
  const byDay = new Map(closed.map((d) => [d.day, d]));
  const run: T[] = [];
  let day = byDay.has(today) ? today : addDays(today, -1);
  for (let row = byDay.get(day); row !== undefined; row = byDay.get(day)) {
    run.push(row);
    day = addDays(day, -1);
  }
  return run.reverse();
}

/**
 * A day of the month as the large widget draws it:
 * - `sun`: closed at or under its line, a whole sun,
 * - `half`: closed over its line, half a sun,
 * - `miss`: a past day never closed, an empty ring,
 * - `today`: still open, the ring in the accent,
 * - `ahead`: still to come, or before the person started, a faint ring,
 * - `blank`: outside the month.
 */
export type SunCell = 'sun' | 'half' | 'miss' | 'today' | 'ahead' | 'blank';

export interface MonthSuns {
  /** Monday-first weeks, five or six of them, as the Diary's calendar lays the month out. */
  readonly cells: readonly SunCell[];
  /** Evenings closed this month. */
  readonly closed: number;
  /** Of those, the ones at or under their line. */
  readonly under: number;
}

export function monthSuns(input: {
  readonly month: MonthKey;
  readonly today: LocalDate;
  readonly closed: readonly ClosedDayTotal[];
  readonly since: LocalDate | null;
}): MonthSuns {
  const cells = calendarCells(input).map((cell): SunCell => {
    switch (cell.kind) {
      case 'closed':
        return cell.dot === 'under' ? 'sun' : 'half';
      case 'today':
        return 'today';
      case 'missed':
        return 'miss';
      case 'blank':
        return 'blank';
      case 'idle':
      case 'brought':
        return 'ahead';
    }
  });
  return {
    cells,
    closed: cells.filter((c) => c === 'sun' || c === 'half').length,
    under: cells.filter((c) => c === 'sun').length,
  };
}

export interface WeekSuns {
  /** Monday to Sunday, as `SunCell`s (no blanks). */
  readonly cells: readonly SunCell[];
  /** Evenings closed this week so far. */
  readonly closed: number;
  /** The week's days so far that were the person's to close, today included. */
  readonly days: number;
  /** Today is closed: the week line counts it in. */
  readonly todayClosed: boolean;
}

/**
 * This week as suns (the small "This week" widget): Monday to Sunday, each closed day a whole
 * sun or half of one, today's ring while it is open, a missed day's ring, the days ahead faint.
 */
export function weekSuns(input: {
  readonly today: LocalDate;
  readonly closed: readonly ClosedDayTotal[];
  readonly since: LocalDate | null;
}): WeekSuns {
  const monday = addDays(input.today, -weekdayMondayFirst(input.today));
  const byDay = new Map(input.closed.map((d) => [d.day, d]));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const cells = days.map((day): SunCell => {
    const row = byDay.get(day);
    if (row) return dayDot(row.spent, row.line) === 'under' ? 'sun' : 'half';
    if (day === input.today) return 'today';
    if (day < input.today && input.since !== null && day >= input.since) return 'miss';
    return 'ahead';
  });
  const counted = days.filter(
    (day) => day <= input.today && (input.since === null || day >= input.since || byDay.has(day)),
  );
  return {
    cells,
    closed: cells.filter((c) => c === 'sun' || c === 'half').length,
    days: counted.length,
    todayClosed: byDay.has(input.today),
  };
}

/** One line of today's receipt: when, where, how much, and whether it is confirmed yet. */
export interface WidgetReceiptLine<T> {
  readonly spend: T;
  readonly confirmed: boolean;
}

/**
 * Today's receipt as the medium widget prints it: today's spends, oldest first, the newest
 * `most` of them (skipped and deleted ones left out), how many were left off above, and the
 * receipt's number (the close receipt's: one more than the evenings closed before today).
 */
export function todayReceipt<
  T extends { readonly day: LocalDate; readonly at: string; readonly status: string },
>(input: {
  readonly spends: readonly T[];
  readonly today: LocalDate;
  readonly closedBefore: number;
  readonly most: number;
}): { readonly lines: WidgetReceiptLine<T>[]; readonly earlier: number; readonly number: number } {
  const todays = input.spends
    .filter((s) => s.day === input.today && s.status !== 'skipped' && s.status !== 'deleted')
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const shown = todays.slice(-input.most);
  return {
    lines: shown.map((spend) => ({
      spend,
      confirmed: spend.status !== 'caught' && spend.status !== 'pending',
    })),
    earlier: todays.length - shown.length,
    number: input.closedBefore + 1,
  };
}

/** The hours of a day the widgets turn at, besides the close: morning, mid-morning, noon, late afternoon, night. */
const WIDGET_HOURS = [7, 10, 13, 16.5, 21] as const;

/**
 * When a day's widgets change, as decimal hours on the phone's clock: 07:00, 10:00, 13:00, 16:30,
 * the close (18:00 unless the person moved it) and 21:00. A close at or after 21:00 takes the
 * night's place; one before 16:30 sits among the day's hours.
 */
export function widgetHours(closeAt: ClockTime): number[] {
  const close = hoursOf(closeAt);
  const hours = WIDGET_HOURS.filter((h) => h !== close && !(h === 21 && close >= 21));
  return [...hours, close].sort((a, b) => a - b);
}

/**
 * The day a jar counts down to: mùng 1 for the season's jar (the next one, while this one has not
 * ended), else the first of the month it is needed by. Null for a jar with no date.
 */
export function jarDay(
  pot: Pick<PotRow, 'neededBy'> & Partial<Pick<PotRow, 'season'>>,
  today: LocalDate,
  tradition: LunarTradition | null,
): LocalDate | null {
  if (pot.season === 'newYear' && tradition !== null) {
    const window = nextNewYearWindow(today, tradition);
    if (window !== null) return window.newYear;
  }
  if (pot.neededBy === null) return null;
  const [year, month] = pot.neededBy.split('-').map(Number);
  if (year === undefined || month === undefined || Number.isNaN(year + month)) return null;
  return makeDate(year, month, 1);
}

/** Days from today to a jar's day, never below 0: "119 days" on the jar widget. */
export function daysUntil(today: LocalDate, day: LocalDate): number {
  return Math.max(0, diffDays(day, today));
}

/** Whether a jar's day is in the same calendar year as today, so its year can go unsaid. */
export function sameYear(today: LocalDate, day: LocalDate): boolean {
  return parts(today).year === parts(day).year;
}
