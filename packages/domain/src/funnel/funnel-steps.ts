import {
  FUNNEL_AUTOMATIC_WAYS,
  FUNNEL_LAST_DAY,
  FUNNEL_WAYS,
  FUNNEL_WEEK_COUNTS,
  type FunnelEvent,
  type FunnelWay,
} from '../contracts/funnel';
import type { SpendSource } from '../spend/spend';
import { diffDays, type LocalDate } from '../time/local-date';

/** What the phone knows about its own first weeks, all read from its own records. */
export interface FunnelFacts {
  /** The day this copy of the app first opened. */
  readonly since: LocalDate;
  readonly today: LocalDate;
  /** The days, counted from `since`, the app was opened on. */
  readonly opens: readonly number[];
  /** Each catch: the way it came and the day it arrived. */
  readonly catches: readonly { readonly source: SpendSource; readonly day: LocalDate }[];
  /** The day each close was made on. */
  readonly closes: readonly LocalDate[];
}

const WEEK = 7;
const ways: ReadonlySet<string> = new Set(FUNNEL_WAYS);
const automatic: ReadonlySet<string> = new Set(FUNNEL_AUTOMATIC_WAYS);

function isWay(source: SpendSource): source is FunnelWay {
  return ways.has(source);
}

/** Days since the first open, or null outside the counted window. */
function windowDay(since: LocalDate, day: LocalDate): number | null {
  const n = diffDays(day, since);
  return n >= 0 && n <= FUNNEL_LAST_DAY ? n : null;
}

function weekCount(n: number): (typeof FUNNEL_WEEK_COUNTS)[number] {
  return FUNNEL_WEEK_COUNTS[Math.min(WEEK, Math.max(0, n))] ?? '0';
}

/**
 * Every step the phone's own records show it reached in its first 30 days: each day it opened;
 * each way that caught something on each day, whether anything was caught that day, and whether
 * anything came in on its own; each day closed; the first catch and close; and, once the first
 * week is over, how many of its days caught something and how many were closed.
 * The same records always give the same steps, so the phone sends each once by its key. Brought-in
 * history (`import`) is not a catch.
 */
export function funnelStepsFrom(facts: FunnelFacts): FunnelEvent[] {
  const { since, today } = facts;
  const events: FunnelEvent[] = [];

  for (const n of new Set(facts.opens)) {
    if (n >= 1 && n <= FUNNEL_LAST_DAY) events.push({ step: 'open', day: n });
  }

  const caught = facts.catches
    .filter((c) => isWay(c.source) && windowDay(since, c.day) !== null)
    .sort((a, b) => a.day.localeCompare(b.day));
  const first = caught[0];
  if (first && isWay(first.source)) {
    events.push({
      step: 'first_capture',
      detail: first.source,
      day: diffDays(first.day, since),
    });
  }
  const seen = new Set<string>();
  const caughtDays = new Set<number>();
  const autoDays = new Set<number>();
  for (const c of caught) {
    if (!isWay(c.source)) continue;
    const n = diffDays(c.day, since);
    caughtDays.add(n);
    if (automatic.has(c.source)) autoDays.add(n);
    const key = `${c.source}:${n}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({ step: 'capture', detail: c.source, day: n });
  }
  for (const n of caughtDays) events.push({ step: 'capture_day', day: n });
  for (const n of autoDays) events.push({ step: 'auto_capture_day', day: n });

  const closeDays = [
    ...new Set(facts.closes.map((d) => windowDay(since, d)).filter((n): n is number => n !== null)),
  ].sort((a, b) => a - b);
  const firstClose = closeDays[0];
  if (firstClose !== undefined) events.push({ step: 'first_close', day: firstClose });
  for (const n of closeDays) events.push({ step: 'close', day: n });

  if (diffDays(today, since) >= WEEK) {
    events.push({
      step: 'week_capture_days',
      detail: weekCount([...caughtDays].filter((n) => n < WEEK).length),
    });
    events.push({
      step: 'week_closes',
      detail: weekCount(closeDays.filter((n) => n < WEEK).length),
    });
  }
  return events;
}
