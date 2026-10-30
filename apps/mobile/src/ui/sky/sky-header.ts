import type { SharedValue } from 'react-native-reanimated';

/** The most text lines (and buttons) a header reports for the sky to keep clear. */
export const HEADER_LINES = 10;

/**
 * Where a page's header text sits on screen when the page is at its top, in points: every line
 * of text (and each button) as a rectangle, flattened to `x, y, w, h` quads, `HEADER_LINES` long
 * and padded with zeros so two headers can be blended number by number.
 */
export interface HeaderGeom {
  readonly lines: readonly number[];
  /** The top of the first line: art lifted out of the way ends above it. */
  readonly ceiling: number;
  /** The bottom of the last line: art sunk out of the way starts below it. */
  readonly floor: number;
  /** The free room to the right of the title, between it and the button or the margin. */
  readonly corner: readonly [x: number, y: number, w: number, h: number];
}

export const NO_HEADER: HeaderGeom = {
  lines: new Array<number>(HEADER_LINES * 4).fill(0),
  ceiling: 0,
  floor: 0,
  corner: [0, 0, 0, 0],
};

/**
 * What the sky needs to keep a page's header clear: the screens other than Today have a header of
 * title and text where Today's design leaves sky, so the look's art moves out of its way there.
 */
export interface SkyHeader {
  /** 0 on Today (the art where the look draws it), 1 on a page with a header, tweened between. */
  readonly away: SharedValue<number>;
  /** The header of the page in view. */
  readonly geom: SharedValue<HeaderGeom>;
  /** The page in view's scroll offset. */
  readonly scroll: SharedValue<number>;
  /** Runs 0 → 1 each time a tab is shown, for the art's entrance (a sway, a flicker); 1 at rest. */
  readonly enter: SharedValue<number>;
  /** How the header's text has moved with the scroll (`dy`) and how much of it still shows. */
  readonly text: SharedValue<HeaderText>;
}

export interface HeaderText {
  readonly dy: number;
  readonly shown: number;
}

const clamp01 = (v: number) => {
  'worklet';
  return Math.max(0, Math.min(1, v));
};

/** Room left between art and text, in points. */
export const ART_GAP = 6;

/** How far up art whose lowest point is `bottom` moves to end above the header (≤ 0). */
export function liftFor(geom: HeaderGeom, bottom: number): number {
  'worklet';
  if (geom.floor <= geom.ceiling) return 0;
  return Math.min(0, geom.ceiling - ART_GAP - bottom);
}

/** How far down art whose highest point is `top` moves to start below the header (≥ 0). */
export function sinkFor(geom: HeaderGeom, top: number): number {
  'worklet';
  if (geom.floor <= geom.ceiling) return 0;
  return Math.max(0, geom.floor + ART_GAP - top);
}

/**
 * Fits a piece of art (`w` × `h`) into the free room beside the title, right-aligned and centred
 * on the title line, never larger than it is drawn. A scale of 0 means there is no room for it at
 * `min` scale or more, and it should fade away instead.
 */
export function fitCorner(
  geom: HeaderGeom,
  w: number,
  h: number,
  min = 0.5,
): { readonly x: number; readonly y: number; readonly scale: number } {
  'worklet';
  const [cx, cy, cw, ch] = geom.corner;
  const fit = Math.min(1, cw / Math.max(1, w), ch / Math.max(1, h));
  const scale = fit >= min ? fit : 0;
  return { x: cx + cw - w * scale, y: cy + (ch - h * scale) / 2, scale };
}

/** How far a header has scrolled away: 0 at the top, 1 once it is gone (as the page fades it). */
export function scrolledAway(scroll: number): number {
  'worklet';
  return clamp01(scroll / 70);
}

/**
 * The page header's own movement: it drifts down at a third of the scroll inside a list moving up
 * one to one, so on screen it rises at 0.7× until it has gone (80 pt).
 */
export function headerRise(scroll: number): number {
  'worklet';
  return -scroll + Math.min(Math.max(0, scroll), 80) * 0.3;
}

/** Linear blend of two headers, number by number. */
export function blendHeaders(a: HeaderGeom, b: HeaderGeom, t: number): HeaderGeom {
  'worklet';
  const k = clamp01(t);
  const mix = (p: number, q: number) => p + (q - p) * k;
  const lines: number[] = [];
  for (let i = 0; i < HEADER_LINES * 4; i++) lines.push(mix(a.lines[i] ?? 0, b.lines[i] ?? 0));
  return {
    lines,
    ceiling: mix(a.ceiling, b.ceiling),
    floor: mix(a.floor, b.floor),
    corner: [
      mix(a.corner[0], b.corner[0]),
      mix(a.corner[1], b.corner[1]),
      mix(a.corner[2], b.corner[2]),
      mix(a.corner[3], b.corner[3]),
    ],
  };
}

export interface HeaderParts {
  /** Lines of text, in screen points at the page's top. */
  readonly lines: readonly (readonly [number, number, number, number])[];
  /** The title's line, for the room beside it. */
  readonly title: readonly [number, number, number, number] | null;
  /** The button on the title's line, if any. */
  readonly button: readonly [number, number, number, number] | null;
  /** The page's right margin (the right edge text may reach). */
  readonly right: number;
}

/** The sky's view of a header from its measured parts. */
export function headerGeom(parts: HeaderParts): HeaderGeom {
  const rects = [...parts.lines, ...(parts.button ? [parts.button] : [])]
    .filter(([, , w, h]) => w > 0 && h > 0)
    .slice(0, HEADER_LINES);
  if (rects.length === 0) return NO_HEADER;
  const lines = new Array<number>(HEADER_LINES * 4).fill(0);
  rects.forEach((r, i) => r.forEach((v, k) => (lines[i * 4 + k] = v)));
  const ceiling = Math.min(...rects.map(([, y]) => y));
  const floor = Math.max(...rects.map(([, y, , h]) => y + h));
  const title = parts.title;
  const corner: HeaderGeom['corner'] = title
    ? (() => {
        const left = title[0] + title[2] + 16;
        const right = (parts.button ? parts.button[0] : parts.right) - 14;
        return [left, title[1], Math.max(0, right - left), title[3]];
      })()
    : [0, 0, 0, 0];
  return { lines, ceiling, floor, corner };
}
