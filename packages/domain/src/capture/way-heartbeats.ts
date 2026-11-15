import type { SpendSource } from '../spend/spend';
import { moneyDayOf } from '../time/close-time';
import { addDays, type LocalDate } from '../time/local-date';
import { heartbeat, HEARTBEAT_DAYS } from './capture-health';

/** A catch as Settings counts it: the way it came in and the instant it arrived. */
export interface CatchArrival {
  readonly source: SpendSource;
  /** When it arrived (ISO). */
  readonly at: string;
}

/** Each way's last 14 days, side by side, and how many catches they hold together. */
export interface WayHeartbeats {
  /** Catches a day for each way asked for, oldest first, today last. */
  readonly beats: ReadonlyMap<SpendSource, readonly number[]>;
  /** Every catch the strips show, all ways together: "55 caught · 14 days". */
  readonly total: number;
  /** The first day the strips show, for the axis over them. */
  readonly from: LocalDate;
}

/**
 * Catches per way per day over the last 14 days ending on `today`, each counted on the money day
 * it arrived (a catch at 00:40 belongs to the day before, as Today and the close have it), so a
 * catch after midnight lights today's bar instead of falling off the strip. Ways not asked for
 * are left out of the total; days after `today` and before the first are not counted.
 */
export function wayHeartbeats(
  catches: readonly CatchArrival[],
  sources: readonly SpendSource[],
  today: LocalDate,
): WayHeartbeats {
  const days = new Map<SpendSource, LocalDate[]>(sources.map((source) => [source, []]));
  for (const c of catches) days.get(c.source)?.push(moneyDayOf(new Date(c.at)));
  let total = 0;
  const beats = new Map<SpendSource, readonly number[]>();
  for (const [source, own] of days) {
    const strip = heartbeat(own, today);
    total += strip.reduce((sum, n) => sum + n, 0);
    beats.set(source, strip);
  }
  return { beats, total, from: addDays(today, -(HEARTBEAT_DAYS - 1)) };
}
