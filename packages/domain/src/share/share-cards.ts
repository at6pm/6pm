import { daysOfMonth, type ClosedDayTotal, type MonthKey } from '../diary/calendar';
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

/**
 * The streak card offered after the close reveal: the milestone the evening being closed reaches
 * (it counts as closed, since Done files it after the reveal), when it is one of 7, 30 and 100
 * not offered before. Each milestone is offered once, ever.
 */
export function streakCardOffer(input: {
  readonly closedDays: readonly LocalDate[];
  readonly day: LocalDate;
  readonly offered: readonly number[];
}): StreakMilestone | null {
  const run = closeRunTo([...input.closedDays, input.day], input.day);
  const reached = run ? streakMilestoneOf(run.days) : null;
  return reached !== null && !input.offered.includes(reached) ? reached : null;
}

/** The visits a shop must reach in a month before the habit card names it. */
export const HABIT_SHOP_VISITS = 5;

/** One side of the habit card: a shop or a category, how often, and what it came to. */
export interface HabitCount {
  /** The shop's name as first written, or the category's id. */
  readonly key: string;
  readonly count: number;
  readonly spent: Vnd;
}

export interface MonthHabit {
  /** The shop visited most, when it leads alone and was visited more than once. */
  readonly shop: HabitCount | null;
  /** The category spent in most often. */
  readonly category: HabitCount;
  /** What the headline names first: the shop once it clearly leads the month, else the category. */
  readonly lead: 'shop' | 'category';
}

function mostOften(
  spends: readonly DiarySpend[],
  keyOf: (s: DiarySpend) => string,
): { first: HabitCount | null; second: number } {
  const groups = new Map<string, { key: string; count: number; spent: Vnd }>();
  for (const s of spends) {
    const name = keyOf(s).trim();
    if (name === '') continue;
    const id = name.toLocaleLowerCase();
    const group = groups.get(id) ?? { key: name, count: 0, spent: 0 };
    group.count += 1;
    group.spent += s.amount;
    groups.set(id, group);
  }
  // By visits, never by spend; a tie goes to the name first in the alphabet, so it never flickers.
  const ranked = [...groups.values()].sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key),
  );
  return { first: ranked[0] ?? null, second: ranked[1]?.count ?? 0 };
}

/**
 * The habit card's month: the shop and the category visited most among the spends that counted.
 * A shop leads the headline when it was visited at least `HABIT_SHOP_VISITS` times and more often
 * than any other shop; otherwise the category does. Null when nothing counted.
 */
export function monthHabit(
  spends: readonly DiarySpend[],
  notDaily: ReadonlySet<string>,
): MonthHabit | null {
  const counted = spends.filter((s) => countsTowardDay(s, notDaily));
  const category = mostOften(counted, (s) => s.category).first;
  if (category === null) return null;
  const shops = mostOften(counted, (s) => s.merchant);
  const shop =
    shops.first !== null && shops.first.count > 1 && shops.first.count > shops.second
      ? shops.first
      : null;
  return {
    shop,
    category,
    lead: shop !== null && shop.count >= HABIT_SHOP_VISITS ? 'shop' : 'category',
  };
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
