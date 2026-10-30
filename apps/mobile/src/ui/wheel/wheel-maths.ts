/**
 * The iOS-style wheel's maths, as the prototype's Wheel computes it. Positions are fractional row
 * indexes (2.5 sits halfway between rows 2 and 3); every function runs on the UI thread.
 */

/** A row is 1.4× the type size. */
const ROW_RATIO = 1.4;
/** Past either end the column follows the finger at 0.3×. */
const RUBBER_BAND = 0.3;
/** A fling travels as far as its release velocity would carry it in 220 ms. */
const MOMENTUM_MS = 220;
/** Rows fade, shrink and tilt with distance from the centre, up to three rows away. */
const MAX_DISTANCE = 3;
const FADE_PER_ROW = 0.36;
const SHRINK_PER_ROW = 0.07;
const TILT_PER_ROW_DEG = 22;
const MIN_OPACITY = 0.1;
/** The top and bottom fade: clear at the edges, solid from 34% to 66% of the height. */
const MASK_SOLID_FROM = 0.34;

export function wheelRowHeight(size: number): number {
  'worklet';
  return Math.round(size * ROW_RATIO);
}

export function clampPosition(position: number, count: number): number {
  'worklet';
  return Math.max(0, Math.min(count - 1, position));
}

/** Where the column sits while dragged: free between the ends, held back past them. */
export function rubberBand(raw: number, count: number): number {
  'worklet';
  const last = count - 1;
  if (raw < 0) return raw * RUBBER_BAND;
  if (raw > last) return last + (raw - last) * RUBBER_BAND;
  return raw;
}

/**
 * The row a released drag settles on. `velocity` is the finger's speed in points per millisecond,
 * positive downward; a downward fling moves toward the first row.
 */
export function momentumIndex(
  position: number,
  velocity: number,
  rowHeight: number,
  count: number,
): number {
  'worklet';
  return Math.round(clampPosition(position - (velocity * MOMENTUM_MS) / rowHeight, count));
}

/** The row under a tap at `y` points from the wheel's top. */
export function rowAt(
  y: number,
  position: number,
  rowHeight: number,
  rows: number,
  count: number,
): number {
  'worklet';
  const pad = ((rows - 1) / 2) * rowHeight;
  return Math.round(clampPosition(position + (y - pad - rowHeight / 2) / rowHeight, count));
}

/** The column's offset: the row at `position` sits in the middle. */
export function columnOffset(position: number, rowHeight: number, rows: number): number {
  'worklet';
  return ((rows - 1) / 2) * rowHeight - position * rowHeight;
}

export interface RowLook {
  readonly opacity: number;
  readonly scale: number;
  /** Degrees about the horizontal axis; rows above the centre lean back, rows below lean forward. */
  readonly rotateX: number;
}

/** How a row looks `distance` rows from the centre (negative: above it). */
export function rowLook(distance: number): RowLook {
  'worklet';
  const away = Math.min(Math.abs(distance), MAX_DISTANCE);
  const lean = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, distance));
  return {
    opacity: Math.max(MIN_OPACITY, 1 - away * FADE_PER_ROW),
    scale: 1 - away * SHRINK_PER_ROW,
    rotateX: lean === 0 ? 0 : -lean * TILT_PER_ROW_DEG,
  };
}

/** The top and bottom fade at `fraction` of the wheel's height (0 top, 1 bottom). */
export function edgeFade(fraction: number): number {
  'worklet';
  const fromEdge = Math.min(fraction, 1 - fraction);
  return Math.max(0, Math.min(1, fromEdge / MASK_SOLID_FROM));
}

/** A money wheel's touch strip is at least this wide where the wheels beside it leave room. */
export const TOUCH_MIN_WIDTH = 56;
/** A press held this long starts rolling; the steps then come faster, down to the fastest. */
const HOLD_FIRST_MS = 350;
const HOLD_FASTEST_MS = 70;
const HOLD_SPEED_UP = 0.8;

/**
 * Which part of a money wheel a touch `y` points below the drawn wheel's top falls in: above the
 * centre row (−1, a step back), the centre row (0, type the amount), or below it (+1, a step on).
 * A touch above or below the drawn wheel counts with the part it is nearest.
 */
export function touchZone(y: number, rowHeight: number, rows: number): -1 | 0 | 1 {
  'worklet';
  const centreTop = ((rows - 1) / 2) * rowHeight;
  if (y < centreTop) return -1;
  if (y >= centreTop + rowHeight) return 1;
  return 0;
}

/** How long a held wheel waits before its `step`th step (0: the first, counted from the press). */
export function holdDelay(step: number): number {
  'worklet';
  return Math.max(HOLD_FASTEST_MS, Math.round(HOLD_FIRST_MS * HOLD_SPEED_UP ** step));
}

/** Where a wheel's digits sit along its row, in points. */
export interface Span {
  readonly x: number;
  readonly width: number;
}

/** How far a wheel's touch strip reaches past its digits on each side, in points. */
export interface SideReach {
  readonly left: number;
  readonly right: number;
}

/**
 * Each wheel's touch strip, for wheels side by side (`spans` from left to right): wheels next to
 * each other share the gap between them, split at its midpoint, so no two strips overlap. A strip
 * still narrower than `min` grows on its free sides, those with no wheel beside them (evenly when
 * both are free); between two wheels it keeps its share of the gaps.
 */
export function touchReach(spans: readonly Span[], min = TOUCH_MIN_WIDTH): SideReach[] {
  return spans.map((span, i) => {
    const before = spans[i - 1];
    const after = spans[i + 1];
    let left = before ? Math.max(0, span.x - (before.x + before.width)) / 2 : 0;
    let right = after ? Math.max(0, after.x - (span.x + span.width)) / 2 : 0;
    const need = Math.max(0, min - (span.width + left + right));
    if (!before && !after) {
      left += need / 2;
      right += need / 2;
    } else if (!before) left += need;
    else if (!after) right += need;
    return { left, right };
  });
}

/** Each cell's centre along a strip of cells `widths` wide, from the strip's start. */
export function cellCentres(widths: readonly number[]): number[] {
  let at = 0;
  return widths.map((w) => {
    const centre = at + w / 2;
    at += w;
    return centre;
  });
}

/**
 * Where a fractional `position` (a cell index) sits along a strip: between two cells' centres in
 * proportion, and past either end at that end cell's width per cell.
 */
export function stripOffset(
  position: number,
  centres: readonly number[],
  widths: readonly number[],
): number {
  'worklet';
  const last = centres.length - 1;
  if (last < 0) return 0;
  if (position <= 0) return (centres[0] ?? 0) + position * (widths[0] ?? 0);
  if (position >= last) return (centres[last] ?? 0) + (position - last) * (widths[last] ?? 0);
  const i = Math.floor(position);
  const from = centres[i] ?? 0;
  return from + (position - i) * ((centres[i + 1] ?? from) - from);
}

/** The fractional cell index at `offset` along a strip: the inverse of `stripOffset`. */
export function stripPosition(
  offset: number,
  centres: readonly number[],
  widths: readonly number[],
): number {
  'worklet';
  const last = centres.length - 1;
  if (last < 0) return 0;
  const first = centres[0] ?? 0;
  const end = centres[last] ?? 0;
  if (offset <= first) return (offset - first) / Math.max(1, widths[0] ?? 1);
  if (offset >= end) return last + (offset - end) / Math.max(1, widths[last] ?? 1);
  let i = 0;
  while (i < last - 1 && offset > (centres[i + 1] ?? end)) i++;
  const from = centres[i] ?? 0;
  const to = centres[i + 1] ?? from;
  return i + (to > from ? (offset - from) / (to - from) : 0);
}

/** A cell's width at a fractional `position`, between its neighbours' widths. */
export function cellWidthAt(position: number, widths: readonly number[]): number {
  'worklet';
  const last = widths.length - 1;
  if (last < 0) return 0;
  const p = Math.max(0, Math.min(last, position));
  const i = Math.floor(p);
  const from = widths[i] ?? 0;
  return from + (p - i) * ((widths[Math.min(last, i + 1)] ?? from) - from);
}

/**
 * The cell a released strip settles on: where 220 ms of its velocity (points per millisecond,
 * positive rightward, toward the first cell) would carry it.
 */
export function momentumCell(
  position: number,
  velocity: number,
  centres: readonly number[],
  widths: readonly number[],
): number {
  'worklet';
  const to = stripOffset(position, centres, widths) - velocity * MOMENTUM_MS;
  return Math.round(clampPosition(stripPosition(to, centres, widths), centres.length));
}

/** The strip's chosen cell is set at 28 pt; the others at 22. */
const CELL_SMALL = 22 / 28;
const CELL_FADE = 0.22;
const CELL_MIN_OPACITY = 0.3;
/** The strip's sides fade: clear at the edges, solid from 22% to 78% of its width. */
const STRIP_SOLID_FROM = 0.22;

/** How a strip cell looks `distance` cells from the centre: fainter and smaller the farther. */
export function cellLook(distance: number): { readonly opacity: number; readonly scale: number } {
  'worklet';
  const away = Math.abs(distance);
  return {
    opacity: Math.max(CELL_MIN_OPACITY, 1 - away * CELL_FADE),
    scale: 1 - Math.min(1, away) * (1 - CELL_SMALL),
  };
}

/** The side fade at `fraction` of the strip's width (0 left, 1 right). */
export function stripFade(fraction: number): number {
  'worklet';
  const fromEdge = Math.min(fraction, 1 - fraction);
  return Math.max(0, Math.min(1, fromEdge / STRIP_SOLID_FROM));
}
