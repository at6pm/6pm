import type { SpendDirection, SpendSource, SpendStatus } from '../spend/spend';
import { NOTICE_LATE_WINDOW_MS, isObserved } from './duplicate';

/**
 * A spend the person typed, said or counted as cash is never merged with anything by itself: it
 * was entered on purpose, and no witness can see cash. When a payment caught another way looks
 * like it (the same amount, the same way, minutes apart), 6pm asks "Same as your 50k at 10:30?".
 * Yes joins the two; No, and "These are two" on a merged row, are remembered as a pair of
 * sightings that are two payments, so the pair is never offered or merged again.
 */

/** A typed spend and a caught payment this far apart, either way round, are offered as one. */
export const TYPED_TWIN_WINDOW_MS = NOTICE_LATE_WINDOW_MS;

/** The most pairs kept: the newest, which are the ones whose sightings can still arrive. */
export const APART_PAIRS_MAX = 500;

/** A row as the offer reads it. */
export interface TwinRow {
  readonly id: string;
  readonly amount: number;
  readonly source: SpendSource;
  readonly status: SpendStatus;
  /** ISO 8601. */
  readonly at: string;
  readonly direction?: SpendDirection | null | undefined;
  /** Its sightings' keys (`sightingKey`); a typed row holding more than its own was joined. */
  readonly keys: readonly string[];
}

/** One pair of sightings the person said are two payments. */
export type ApartPair = readonly [string, string];

/** The pair, written the same whichever way round it is given. */
export function apartKey(a: string, b: string): string {
  return a < b ? `${a}\n${b}` : `${b}\n${a}`;
}

/** The pairs as a lookup. */
export function apartIndex(pairs: readonly ApartPair[]): ReadonlySet<string> {
  return new Set(pairs.map(([a, b]) => apartKey(a, b)));
}

/** Whether any sighting of one is remembered as another payment than any sighting of the other. */
export function areApart(
  a: readonly string[],
  b: readonly string[],
  apart: ReadonlySet<string>,
): boolean {
  return a.some((x) => b.some((y) => x !== y && apart.has(apartKey(x, y))));
}

/**
 * The pairs with every sighting of `a` remembered apart from every sighting of `b`, the newest
 * last, the oldest dropped past `APART_PAIRS_MAX`. A pair already held moves to the end.
 */
export function withApart(
  pairs: readonly ApartPair[],
  a: readonly string[],
  b: readonly string[],
): ApartPair[] {
  const added = a.flatMap((x) => b.filter((y) => y !== x).map((y): ApartPair => [x, y]));
  const fresh = apartIndex(added);
  const kept = pairs.filter(([x, y]) => !fresh.has(apartKey(x, y)));
  return [...kept, ...added].slice(-APART_PAIRS_MAX);
}

const TYPED: ReadonlySet<SpendSource> = new Set(['manual', 'voice', 'cash']);
const live = (row: TwinRow) => row.status !== 'skipped' && row.status !== 'deleted';
const wayOf = (row: TwinRow) => row.direction ?? 'out';
const gapOf = (a: TwinRow, b: TwinRow) => Math.abs(Date.parse(a.at) - Date.parse(b.at));

/** A caught payment and a typed spend that could be one payment, the pair not answered before. */
function looksSame(caught: TwinRow, typed: TwinRow, apart: ReadonlySet<string>): boolean {
  if (!TYPED.has(typed.source) || !live(typed) || typed.keys.length > 1) return false;
  if (typed.amount !== caught.amount || wayOf(typed) !== wayOf(caught)) return false;
  const gap = gapOf(caught, typed);
  if (Number.isNaN(gap) || gap > TYPED_TWIN_WINDOW_MS) return false;
  return !areApart(caught.keys, typed.keys, apart);
}

/**
 * The typed spend a caught payment is offered as ("Same as your 50k at 10:30?"): one the person
 * typed, said or counted as cash, still counted and never joined to anything, of the same amount
 * and way within `TYPED_TWIN_WINDOW_MS`, the pair not said to be two before. The nearest in time;
 * a typed spend is offered once, to the caught payment nearest it. Null when none is.
 */
export function typedTwinOf(
  caught: TwinRow,
  rows: readonly TwinRow[],
  apart: ReadonlySet<string>,
): TwinRow | null {
  if (!isObserved(caught.source) || !live(caught) || !(caught.amount > 0)) return null;
  const nearest = rows
    .filter((typed) => typed.id !== caught.id && looksSame(caught, typed, apart))
    .sort((a, b) => gapOf(caught, a) - gapOf(caught, b))[0];
  if (!nearest) return null;
  const rival = rows.some(
    (other) =>
      other.id !== caught.id &&
      isObserved(other.source) &&
      live(other) &&
      looksSame(other, nearest, apart) &&
      gapOf(other, nearest) < gapOf(caught, nearest),
  );
  return rival ? null : nearest;
}
