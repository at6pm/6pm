import type { LookId } from '@6pm/theme';

import type { Box } from './scenes/boxes/box-model';

/**
 * Where a piece of a look's art goes on a page with a header (Plan, Diary), where Today's design
 * leaves open sky:
 * - `keep`: stays where the look draws it;
 * - `lift`: rises until it ends above the header (things that hang from the top);
 * - `sink`: drops until it starts below the header (things on a horizon or a rule);
 * - `stow`: is drawn up on its thread until it is out of sight above the screen;
 * - `fade`: fades out, as nothing beside a header has room for it;
 * - `corner`: moves into the room beside the title, scaled down to fit (Neon Alley's sign).
 */
export type ArtMove = 'keep' | 'lift' | 'sink' | 'stow' | 'fade' | 'corner';

export type ArtBlend = Box['blend'];

export interface ArtClass {
  readonly move: ArtMove;
  /** A texture under the header fades out under its text instead of moving. */
  readonly masked: boolean;
}

/** A run of boxes, in paint order, that move together and share a mask. */
export interface ArtRun {
  readonly move: ArtMove;
  readonly masked: boolean;
  /** The layer's blend when masked: every box in a masked run shares it. */
  readonly blend: ArtBlend;
  readonly boxes: readonly Box[];
  /** The top and bottom of every box of this move in the layer, so they move as one. */
  readonly top: number;
  readonly bottom: number;
}

const KEEP: ArtClass = { move: 'keep', masked: false };

/** Sơn Mài's strip of gold leaf, falling 14 pt across the screen with a slow wave. */
function leafLine(x: number, width: number): number {
  const at = (x / width) * 402;
  return 178 - (at / 402) * 14 + Math.sin(at / 58) * 2.5;
}

/** Long Exposure's star trails all turn about one point: 332 pt across, 66 down. */
const STAR_CENTRE = [332, 66] as const;

function centredOn(box: Box, [cx, cy]: readonly [number, number]): boolean {
  return Math.abs(box.x + box.w / 2 - cx) < 2 && Math.abs(box.y + box.h / 2 - cy) < 2;
}

/** How each of a look's boxes (`atm.back` or `atm.front`) keeps clear of a header. */
export function classifyBox(
  look: LookId,
  layer: 'back' | 'front',
  box: Box,
  width: number,
): ArtClass {
  switch (look) {
    case 'lacquer':
      // The strip of gold leaf becomes a rule under the header; the flakes lifting off it fade.
      if (layer === 'back') return KEEP;
      return { move: box.y < leafLine(box.x, width) - 3 ? 'fade' : 'sink', masked: false };
    case 'glaze':
      // The cobalt border band becomes a rule under the header.
      return layer === 'front' ? { move: 'sink', masked: false } : KEEP;
    case 'riso':
      // The halftone stays, cleared from under the text; the registration marks go to the
      // header's corners (top right, bottom left).
      if (layer === 'back') return { move: 'keep', masked: true };
      return { move: box.x + box.w / 2 > width / 2 ? 'lift' : 'sink', masked: false };
    case 'monsoon':
      return layer === 'back' ? { move: 'keep', masked: true } : KEEP;
    case 'neon':
      if (layer === 'back') return KEEP;
      // The tube under the sign travels with it; the ring and its wire switch off.
      return { move: box.x >= width * 0.7 ? 'fade' : 'corner', masked: false };
    case 'expo':
      if (layer === 'front') return KEEP;
      // The star trails stay in the sky, cleared from under the text; the skyline and traffic
      // sink below the header and rise from behind the first card.
      return centredOn(box, STAR_CENTRE)
        ? { move: 'keep', masked: true }
        : { move: 'sink', masked: false };
    case 'paper':
      if (layer === 'front') return KEEP;
      // Clouds and stars hang on threads from the top, so they are drawn up out of sight (above
      // the header there is only the status bar), and on Today a thread or star crossing the date
      // clears from under it; the moon's thread goes, as the moon moves beside the title.
      return box.w <= 1.5 && box.y < 0 && box.y + box.h > 100 && box.x > width * 0.75
        ? { move: 'fade', masked: false }
        : { move: 'stow', masked: true };
    // Lantern River's strings and lanterns are its own scene (`lantern-scene`), not boxes.
    case 'basic':
    case 'golden':
    case 'cafe':
    case 'lantern':
      return KEEP;
  }
}

/**
 * A layer's boxes split into runs, in paint order, of the same move, mask and (for masked runs)
 * blend, each run carrying the extent of every box that shares its move.
 */
export function artRuns(
  look: LookId,
  layer: 'back' | 'front',
  boxes: readonly Box[],
  width: number,
): ArtRun[] {
  const classes = boxes.map((box) => classifyBox(look, layer, box, width));
  const extent = new Map<ArtMove, { top: number; bottom: number }>();
  boxes.forEach((box, i) => {
    const move = classes[i]?.move ?? 'keep';
    const was = extent.get(move);
    extent.set(move, {
      top: Math.min(was?.top ?? Infinity, box.y),
      bottom: Math.max(was?.bottom ?? -Infinity, box.y + box.h),
    });
  });
  const runs: { move: ArtMove; masked: boolean; blend: ArtBlend; boxes: Box[] }[] = [];
  boxes.forEach((box, i) => {
    const { move, masked } = classes[i] ?? KEEP;
    const blend: ArtBlend = masked ? box.blend : 'srcOver';
    const last = runs.at(-1);
    if (last && last.move === move && last.masked === masked && last.blend === blend) {
      last.boxes.push(box);
    } else {
      runs.push({ move, masked, blend, boxes: [box] });
    }
  });
  return runs.map((run) => {
    const { top, bottom } = extent.get(run.move) ?? { top: 0, bottom: 0 };
    return { ...run, top, bottom };
  });
}
