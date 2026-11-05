import { describe, expect, it } from '@jest/globals';

import { ART_SIDE, DOT_GAP, dotGrid, MINI_H, MINI_ROW_GAP, MINI_W, miniGrid } from './split-grid';

/** The grid's drawn size, which must stay inside the room. */
function drawn(room: { width: number; height: number }, count: number) {
  const { cols, size } = dotGrid(room, count);
  const rows = Math.ceil(count / cols);
  return {
    cols,
    size,
    width: cols * size + (cols - 1) * DOT_GAP,
    height: rows * size + (rows - 1) * DOT_GAP,
  };
}

describe('the Free part’s day dots', () => {
  const rooms = [
    { width: 68, height: 130 },
    { width: 90, height: 96 },
    { width: 120, height: 130 },
    { width: 160, height: 84 },
    { width: 220, height: 130 },
    { width: 54, height: 60 },
  ];
  it.each([28, 29, 30, 31, 12, 45])('%i days fit every room, with dots to see', (count) => {
    for (const room of rooms) {
      const grid = drawn(room, count);
      expect(grid.size).toBeGreaterThan(0);
      expect(grid.width).toBeLessThanOrEqual(room.width - 2 * ART_SIDE);
      expect(grid.height).toBeLessThanOrEqual(room.height);
    }
  });

  it('picks the columns that give the biggest dots', () => {
    const room = { width: 150, height: 130 };
    const best = dotGrid(room, 31);
    for (let cols = 1; cols <= 31; cols++) {
      const rows = Math.ceil(31 / cols);
      const size = Math.min(
        (room.width - 2 * ART_SIDE - DOT_GAP * (cols - 1)) / cols,
        (room.height - DOT_GAP * (rows - 1)) / rows,
      );
      expect(best.size).toBeGreaterThanOrEqual(Math.floor(size * 2) / 2);
    }
  });

  it('draws nothing in a room with no space', () => {
    expect(dotGrid({ width: 0, height: 100 }, 30).size).toBe(0);
    expect(dotGrid({ width: 100, height: -4 }, 30).size).toBe(0);
  });
});

describe('the Jars part’s mini jars', () => {
  it('sets two to a row where two fit, one where they do not', () => {
    expect(miniGrid({ width: 80, height: 130 }).cols).toBe(2);
    expect(miniGrid({ width: 50, height: 130 }).cols).toBe(1);
  });

  it('keeps every row inside the room', () => {
    for (const height of [20, 26, 40, 58, 90, 130]) {
      const { rows, scale } = miniGrid({ width: 80, height });
      const h = MINI_H * scale;
      expect(rows * h + Math.max(0, rows - 1) * MINI_ROW_GAP).toBeLessThanOrEqual(height);
    }
  });

  it('draws them smaller when a row of full-size jars would not fit', () => {
    const { rows, scale } = miniGrid({ width: 80, height: 20 });
    expect(rows).toBe(1);
    expect(MINI_H * scale).toBeLessThanOrEqual(20);
    expect(MINI_W * scale).toBeLessThan(MINI_W);
  });
});
