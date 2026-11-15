import { daysOfMonth, monthGrid, type ClosedDayTotal, type MonthKey } from '../diary/calendar';
import type { ClosedRun } from '../diary/month-diary';
import type { DiarySpend } from '../diary/week-recap';
import { monthsOfYear, type YearKey } from '../diary/year-book';
import type { Vnd } from '../money/format';
import { countsTowardDay } from '../spend/spend';
import { addDays, diffDays, type LocalDate } from '../time/local-date';

/** The streak lengths the close offers a card for, each once. */
export const STREAK_CARD_MILESTONES = [7, 30, 100] as const;
export type StreakMilestone = (typeof STREAK_CARD_MILESTONES)[number];

/** The milestone a run of this many evenings is, or null. */
export function streakMilestoneOf(days: number): StreakMilestone | null {
  return (STREAK_CARD_MILESTONES as readonly number[]).includes(days)
    ? (days as StreakMilestone)
    : null;
}

/**
 * The evenings closed back to back up to and including `day`: null when `day` itself was not
 * closed. A day missed and filed later still counts as closed.
 */
export function closeRunTo(closedDays: readonly LocalDate[], day: LocalDate): ClosedRun | null {
  const closed = new Set(closedDays);
  if (!closed.has(day)) return null;
  let from = day;
  while (closed.has(addDays(from, -1))) from = addDays(from, -1);
  return { days: diffDays(day, from) + 1, from, to: day };
}

/** Every day of a run, oldest first. */
export function runDays(run: ClosedRun): LocalDate[] {
  return Array.from({ length: run.days }, (_, i) => addDays(run.from, i));
}

/** How a day of the month card draws: a full sun inside the number, half-set over it, a ring. */
export type MonthSun = 'under' | 'over' | 'missed' | 'ahead';

export interface MonthCard {
  readonly month: MonthKey;
  /** Monday first: null before the 1st, then one per day of the month, ending on its last. */
  readonly suns: readonly (MonthSun | null)[];
  readonly closed: number;
  /** Closed days at or under their line. */
  readonly under: number;
  readonly spent: Vnd;
  /** The three places visited most often on closed days (never ranked by spend). */
  readonly places: readonly { readonly merchant: string; readonly visits: number }[];
}

/**
 * My month: one sun per evening (inside the number, over it, missed, or still ahead in a month
 * under way), the days closed and inside, what was spent, and the places by visits.
 */
export function monthCard(input: {
  readonly month: MonthKey;
  readonly today: LocalDate;
  readonly closed: readonly ClosedDayTotal[];
  readonly spends: readonly DiarySpend[];
  readonly notDaily: ReadonlySet<string>;
}): MonthCard {
  const byDay = new Map(
    input.closed.filter((d) => d.day.startsWith(`${input.month}-`)).map((d) => [d.day, d]),
  );
  const grid = monthGrid(input.month);
  // The blanks after the last day are left off: the card's grid ends with the month.
  while (grid.length > 0 && grid[grid.length - 1] === null) grid.pop();
  const suns = grid.map((day): MonthSun | null => {
    if (day === null) return null;
    const row = byDay.get(day);
    if (row) return row.spent <= row.line ? 'under' : 'over';
    return day >= input.today ? 'ahead' : 'missed';
  });
  const rows = [...byDay.values()];
  return {
    month: input.month,
    suns,
    closed: rows.length,
    under: rows.filter((d) => d.spent <= d.line).length,
    spent: rows.reduce((sum, d) => sum + d.spent, 0),
    places: placesByVisits(
      input.spends.filter((s) => byDay.has(s.day)),
      input.notDaily,
    ),
  };
}

/** Merchants by how often they were visited, most first, counted spends only. */
export function placesByVisits(
  spends: readonly DiarySpend[],
  notDaily: ReadonlySet<string>,
  limit = 3,
): { merchant: string; visits: number }[] {
  const groups = new Map<string, { merchant: string; visits: number }>();
  for (const s of spends) {
    if (!countsTowardDay(s, notDaily)) continue;
    const name = s.merchant.trim();
    if (name === '') continue;
    const key = name.toLocaleLowerCase();
    const group = groups.get(key) ?? { merchant: name, visits: 0 };
    group.visits += 1;
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => b.visits - a.visits || a.merchant.localeCompare(b.merchant))
    .slice(0, limit);
}

/** One month on the year card's receipt: a dot per day, lit when closed. */
export interface YearCardMonth {
  readonly month: MonthKey;
  readonly closed: readonly boolean[];
  readonly count: number;
}

export interface YearCard {
  readonly year: YearKey;
  readonly months: readonly YearCardMonth[];
  /** Evenings closed across the year. */
  readonly closed: number;
  /** Closed evenings that counted nothing. */
  readonly noSpend: number;
  readonly under: number;
  /** The month with the most evenings inside the number (then the most closed, then the first). */
  readonly best: MonthKey | null;
}

/** My year: the year as a receipt of evenings, from the same closed days as the Year book. */
export function yearCard(year: YearKey, closed: readonly ClosedDayTotal[]): YearCard {
  const inYear = closed.filter((d) => d.day.startsWith(`${year}-`));
  const days = new Map(inYear.map((d) => [d.day, d]));
  let best: { month: MonthKey; under: number; count: number } | null = null;
  const months = monthsOfYear(year).map((month) => {
    const lit = daysOfMonth(month).map((d) => days.has(d));
    const rows = inYear.filter((d) => d.day.startsWith(`${month}-`));
    const under = rows.filter((d) => d.spent <= d.line).length;
    if (
      rows.length > 0 &&
      (best === null || under > best.under || (under === best.under && rows.length > best.count))
    ) {
      best = { month, under, count: rows.length };
    }
    return { month, closed: lit, count: rows.length };
  });
  const found = best as { month: MonthKey } | null;
  return {
    year,
    months,
    closed: days.size,
    noSpend: [...days.values()].filter((d) => d.spent <= 0).length,
    under: [...days.values()].filter((d) => d.spent <= d.line).length,
    best: found?.month ?? null,
  };
}

/** The first day the Year card sits on Today: 20 December. */
export const YEAR_CARD_FROM = '12-20';
/** The last: 5 January, for the year just gone. */
export const YEAR_CARD_UNTIL = '01-05';

/** The year Today's Year card is about on `today`, or null outside 20 December – 5 January. */
export function yearCardYear(today: LocalDate): YearKey | null {
  const year = today.slice(0, 4);
  const day = today.slice(5);
  if (day >= YEAR_CARD_FROM) return year;
  if (day <= YEAR_CARD_UNTIL) return String(Number(year) - 1);
  return null;
}

/** The jar with the biggest target that holds it, or null: "Biggest pot" on the year card. */
export function biggestFullJar(
  pots: readonly { readonly id: string; readonly goal: Vnd }[],
  saved: Readonly<Record<string, Vnd>>,
): string | null {
  let best: { id: string; goal: Vnd } | null = null;
  for (const pot of pots) {
    if (pot.goal > 0 && (saved[pot.id] ?? 0) >= pot.goal && (best === null || pot.goal > best.goal))
      best = pot;
  }
  return best?.id ?? null;
}

/**
 * What went into jars over a year: each payday's set-asides and the top-ups (less any taken back)
 * of the pay cycles that started in it. Openings were already saved before 6pm and spends are
 * money out, so neither counts.
 */
export function setAsideInYear(
  moves: readonly { readonly kind: string; readonly cycle: LocalDate; readonly amount: Vnd }[],
  year: YearKey,
): Vnd {
  return Math.max(
    0,
    moves
      .filter(
        (m) => (m.kind === 'setAside' || m.kind === 'topUp') && m.cycle.startsWith(`${year}-`),
      )
      .reduce((sum, m) => sum + m.amount, 0),
  );
}
