import type { FoldRect, FoldSnapshot } from '../../../modules/fold';

/**
 * The gap the design keeps between the two pages: where the screen lies flat and reports no fold,
 * and where the fold is reported as a line with no width (a folding Android phone).
 */
export const FLAT_GUTTER = 40;

/** Narrowest page the two-page layouts are drawn for: Today's hero and October's grid. */
const MIN_PAGE = 360;

/**
 * Narrowest screen that stands as a counter. A flip phone folds across too, and is often held a
 * little bent: it stays a phone.
 */
const MIN_STAND_WIDTH = 600;

export interface Page {
  readonly x: number;
  readonly width: number;
}

export interface Half {
  readonly y: number;
  readonly height: number;
}

/**
 * How 6pm lays itself out for the way the phone is held:
 * - `phone`: one column, as on every phone without a hinge, on a folding phone's cover screen, and
 *   on one opened flat that is taller than wide with the fold across.
 * - `rail`: the iPhone Duo's outer screen; the island runs down the right edge, so the bars live
 *   in a rail there and the content keeps the rest.
 * - `spread`: opened with the fold upright, or flat and wider than tall: two pages either side of
 *   the fold, the Duo's rail on the right. `book` when it is part way open, held like a book.
 * - `stand`: part way open with the fold across, standing on a table: the top half to read, the
 *   bottom half to touch. Not a flip phone, which is too narrow to be a counter.
 */
export type FoldForm =
  | { readonly kind: 'phone' }
  | { readonly kind: 'rail'; readonly rail: number }
  | {
      readonly kind: 'spread';
      readonly left: Page;
      readonly right: Page;
      readonly rail: number;
      readonly book: boolean;
    }
  | { readonly kind: 'stand'; readonly top: Half; readonly bottom: Half };

/** The width of anything covering the window's right edge (the island, the camera), else 0. */
function rightEdge(occlusions: readonly FoldRect[], width: number): number {
  let rail = 0;
  for (const o of occlusions) {
    if (o.x + o.width >= width - 1) rail = Math.max(rail, width - o.x);
  }
  return Math.round(rail);
}

/** The strip kept clear at a fold from `start`, `size` thick: never thinner than the gutter. */
function gutterAt(start: number, size: number): { readonly start: number; readonly end: number } {
  if (size >= FLAT_GUTTER) return { start, end: start + size };
  const middle = start + size / 2;
  return { start: middle - FLAT_GUTTER / 2, end: middle + FLAT_GUTTER / 2 };
}

/**
 * The fold, when it runs the whole way across this window. While the phone turns, the window's
 * new size can arrive a frame before the fold's new place: a fold left over from the last
 * orientation spans nothing and is passed over.
 */
function spanning(
  division: FoldRect | undefined,
  window: { readonly width: number; readonly height: number },
): FoldRect | undefined {
  if (division === undefined) return undefined;
  const across = division.width > division.height;
  const reach = across ? division.width - window.width : division.height - window.height;
  return Math.abs(reach) <= 2 ? division : undefined;
}

export function foldForm(
  snapshot: FoldSnapshot,
  window: { readonly width: number; readonly height: number },
): FoldForm {
  const { hinge, divisions, occlusions } = snapshot;
  const { width, height } = window;
  if (hinge === 'unknown') return { kind: 'phone' };

  if (hinge === 'closed') {
    const rail = rightEdge(occlusions, width);
    return rail > 0 ? { kind: 'rail', rail } : { kind: 'phone' };
  }

  const division = spanning(divisions[0], window);
  const across = division !== undefined && division.width > division.height;
  const upright = division !== undefined && !across;

  if (hinge === 'partial' && division && across && width >= MIN_STAND_WIDTH) {
    const gutter = gutterAt(division.y, division.height);
    return {
      kind: 'stand',
      top: { y: 0, height: gutter.start },
      bottom: { y: gutter.end, height: height - gutter.end },
    };
  }

  // Two pages where there is room for them: either side of an upright fold, or of the middle
  // when the screen is wider than tall and no fold runs down it.
  if (upright || width > height) {
    const gutter = upright
      ? gutterAt(division.x, division.width)
      : gutterAt((width - FLAT_GUTTER) / 2, FLAT_GUTTER);
    if (gutter.start >= MIN_PAGE && width - gutter.end >= MIN_PAGE) {
      return {
        kind: 'spread',
        left: { x: 0, width: gutter.start },
        right: { x: gutter.end, width: width - gutter.end },
        rail: rightEdge(occlusions, width),
        book: hinge === 'partial',
      };
    }
  }
  return { kind: 'phone' };
}
