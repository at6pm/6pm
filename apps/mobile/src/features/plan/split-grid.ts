/** The room the art has in its part: under the top inset, over the label and amount. */
export interface ArtRoom {
  readonly width: number;
  readonly height: number;
}

/** The art's side insets: 10 on the left, as the canvas draws it, and 10 on the right. */
export const ART_SIDE = 10;
const SIDE = ART_SIDE;
export const MINI_W = 19;
export const MINI_H = 26;
export const MINI_ROW_GAP = 6;
export const MINI_COL_GAP = 5;
export const DOT_GAP = 5;

/**
 * The mini jars' grid in the room there is: two columns where two fit, rows as many as fit, and
 * the jars drawn smaller (never under half) when not even one row of full-size ones does.
 */
export function miniGrid(room: ArtRoom): { cols: number; rows: number; scale: number } {
  const across = room.width - 2 * SIDE;
  const cols = across >= MINI_W * 2 + MINI_COL_GAP ? 2 : 1;
  const scale = Math.max(
    0.5,
    Math.min(1, room.height / MINI_H, across / (MINI_W * cols + MINI_COL_GAP * (cols - 1))),
  );
  const h = MINI_H * scale;
  const rows = room.height < h ? 0 : Math.floor((room.height + MINI_ROW_GAP) / (h + MINI_ROW_GAP));
  return { cols, rows, scale };
}

/**
 * The dot grid that fits `count` dots into the room: every column count is tried and the one that
 * gives the biggest dots wins (fewer columns on a tie, so a short cycle reads as rows), with equal
 * gaps and nothing past the room's edges. Sizes are whole half points.
 */
export function dotGrid(room: ArtRoom, count: number): { cols: number; size: number } {
  const across = room.width - 2 * SIDE;
  let best = { cols: 1, size: 0 };
  if (count <= 0 || across <= 0 || room.height <= 0) return best;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const byWidth = (across - DOT_GAP * (cols - 1)) / cols;
    const byHeight = (room.height - DOT_GAP * (rows - 1)) / rows;
    const size = Math.floor(Math.min(byWidth, byHeight) * 2) / 2;
    if (size > best.size) best = { cols, size };
  }
  return best;
}
