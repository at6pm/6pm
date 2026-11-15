import { describe, expect, it } from '@jest/globals';

import {
  cellCentres,
  cellLook,
  cellWidthAt,
  clampPosition,
  columnOffset,
  drumLook,
  edgeFade,
  holdDelay,
  momentumCell,
  momentumIndex,
  rowAt,
  rowLook,
  rubberBand,
  stripFade,
  stripOffset,
  stripPosition,
  touchReach,
  touchZone,
  wheelRowHeight,
} from './wheel-maths';

describe('wheel maths', () => {
  it('sizes rows at 1.4× the type, rounded like the prototype', () => {
    expect(wheelRowHeight(28)).toBe(39);
    expect(wheelRowHeight(38)).toBe(53);
    expect(wheelRowHeight(52)).toBe(73);
  });

  it('shows a money wheel at rest as its digit with a notch either side, and nothing further', () => {
    expect(drumLook(0, 0)).toMatchObject({ digit: 1, notch: 0, scale: 1 });
    expect(drumLook(-1, 0)).toMatchObject({ digit: 0, notch: 1, scale: 0.82 });
    expect(drumLook(1, 0)).toMatchObject({ digit: 0, notch: 1 });
    expect(drumLook(2, 0)).toMatchObject({ digit: 0, notch: 0 });
    // Halfway to the next row the digit is fading into its notch.
    expect(drumLook(0.5, 0).digit).toBeCloseTo(0.5);
    expect(drumLook(0.5, 0).notch).toBeCloseTo(0.5);
  });

  it('lights a turning money wheel to two digits each way, squashed round the drum', () => {
    expect(drumLook(1, 1)).toMatchObject({ digit: 0.5, notch: 0, scale: 0.86, scaleY: 0.85 });
    expect(drumLook(-2, 1)).toMatchObject({ digit: 0.22, scale: 0.62, scaleY: 0.7, pull: 0.38 });
    expect(drumLook(3, 1).digit).toBe(0);
    expect(drumLook(7, 1).digit).toBe(0);
    // Halfway lit, a neighbour is half notch and a quarter digit.
    expect(drumLook(1, 0.5).notch).toBeCloseTo(0.5);
    expect(drumLook(1, 0.5).digit).toBeCloseTo(0.25);
  });

  it('follows the finger freely between the ends and at 0.3× past them', () => {
    expect(rubberBand(4.5, 10)).toBe(4.5);
    expect(rubberBand(-2, 10)).toBeCloseTo(-0.6);
    expect(rubberBand(11, 10)).toBeCloseTo(9.6);
    expect(clampPosition(-0.6, 10)).toBe(0);
    expect(clampPosition(9.6, 10)).toBe(9);
  });

  it('settles a release where 220 ms of its velocity would carry it', () => {
    // Still finger: the nearest row.
    expect(momentumIndex(3.4, 0, 39, 31)).toBe(3);
    // An upward flick at 1 pt/ms over 39 pt rows travels 220/39 ≈ 5.6 rows forward.
    expect(momentumIndex(3, -1, 39, 31)).toBe(9);
    // A hard downward flick stops at the first row.
    expect(momentumIndex(3, 4, 39, 31)).toBe(0);
    expect(momentumIndex(28, -4, 39, 31)).toBe(30);
  });

  it('finds the tapped row and centres the chosen one', () => {
    // Three rows of 39 pt showing rows 4, 5, 6: the top row is 4, the bottom 6.
    expect(rowAt(10, 5, 39, 3, 31)).toBe(4);
    expect(rowAt(58, 5, 39, 3, 31)).toBe(5);
    expect(rowAt(110, 5, 39, 3, 31)).toBe(6);
    expect(rowAt(10, 0, 39, 3, 31)).toBe(0);
    expect(columnOffset(5, 39, 3)).toBe(39 - 5 * 39);
  });

  it('fades, shrinks and tilts rows with distance, up to three rows', () => {
    expect(rowLook(0)).toEqual({ opacity: 1, scale: 1, rotateX: 0 });
    const above = rowLook(-1);
    expect(above.opacity).toBeCloseTo(0.64);
    expect(above.scale).toBeCloseTo(0.93);
    expect(above.rotateX).toBe(22);
    expect(rowLook(1).rotateX).toBe(-22);
    expect(rowLook(5)).toEqual(rowLook(3));
    expect(rowLook(3).opacity).toBe(0.1);
  });

  it('fades the top and bottom third of the wheel', () => {
    expect(edgeFade(0)).toBe(0);
    expect(edgeFade(0.17)).toBeCloseTo(0.5);
    expect(edgeFade(0.5)).toBe(1);
    expect(edgeFade(1)).toBe(0);
  });

  it('reads a touch above the centre row as back, below it as on, and on it as type', () => {
    // Three 48 pt rows: 0–48 above, 48–96 the centre, 96–144 below.
    expect(touchZone(10, 48, 3)).toBe(-1);
    expect(touchZone(47.9, 48, 3)).toBe(-1);
    expect(touchZone(48, 48, 3)).toBe(0);
    expect(touchZone(95, 48, 3)).toBe(0);
    expect(touchZone(96, 48, 3)).toBe(1);
    // Past the drawn wheel, in the strip's reach above and below.
    expect(touchZone(-12, 48, 3)).toBe(-1);
    expect(touchZone(150, 48, 3)).toBe(1);
  });

  it('waits 350 ms before a held wheel rolls, then steps faster down to 70 ms', () => {
    expect(holdDelay(0)).toBe(350);
    expect(holdDelay(1)).toBe(280);
    expect(holdDelay(2)).toBe(224);
    const delays = Array.from({ length: 12 }, (_, i) => holdDelay(i));
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeLessThanOrEqual(delays[i - 1] ?? 0);
    }
    expect(holdDelay(8)).toBe(70);
    expect(holdDelay(40)).toBe(70);
  });

  it('splits the gap between two wheels and grows each strip to 56 pt on its free side', () => {
    // Millions 44 pt, a 10 pt mark, hundreds 22 pt.
    const [millions, hundreds] = touchReach([
      { x: 0, width: 44 },
      { x: 54, width: 22 },
    ]);
    expect(millions).toEqual({ left: 7, right: 5 });
    expect(hundreds).toEqual({ left: 5, right: 29 });
    // Strips meet at the gap's midpoint and never overlap.
    expect(44 + (millions?.right ?? 0)).toBe(54 - (hundreds?.left ?? 0));
  });

  it('keeps a wheel between two others to its share of the gaps', () => {
    const [lead, millions, hundreds] = touchReach([
      { x: 0, width: 52 },
      { x: 52, width: 44 },
      { x: 106, width: 22 },
    ]);
    expect(lead).toEqual({ left: 4, right: 0 });
    expect(millions).toEqual({ left: 0, right: 5 });
    expect(hundreds).toEqual({ left: 5, right: 29 });
    // A lone wheel grows evenly; a wide one keeps its own width.
    expect(touchReach([{ x: 0, width: 22 }])).toEqual([{ left: 17, right: 17 }]);
    expect(touchReach([{ x: 0, width: 80 }])).toEqual([{ left: 0, right: 0 }]);
  });

  it('maps strip positions to offsets and back, across cells of two widths', () => {
    const widths = [48, 48, 48, 120];
    const centres = cellCentres(widths);
    expect(centres).toEqual([24, 72, 120, 204]);
    expect(stripOffset(1, centres, widths)).toBe(72);
    expect(stripOffset(2.5, centres, widths)).toBe(162);
    expect(stripOffset(-1, centres, widths)).toBe(-24);
    expect(stripOffset(4, centres, widths)).toBe(324);
    for (const p of [-0.5, 0, 0.25, 1, 2.5, 3, 3.5]) {
      expect(stripPosition(stripOffset(p, centres, widths), centres, widths)).toBeCloseTo(p);
    }
    expect(cellWidthAt(2.5, widths)).toBe(84);
    expect(cellWidthAt(9, widths)).toBe(120);
  });

  it('settles a released strip where 220 ms of its velocity would carry it', () => {
    const widths = Array.from({ length: 31 }, () => 48);
    const centres = cellCentres(widths);
    expect(momentumCell(4.4, 0, centres, widths)).toBe(4);
    // A leftward flick at 1 pt/ms travels 220/48 ≈ 4.6 cells on.
    expect(momentumCell(4, -1, centres, widths)).toBe(9);
    expect(momentumCell(4, 5, centres, widths)).toBe(0);
    expect(momentumCell(28, -5, centres, widths)).toBe(30);
  });

  it('shrinks strip cells to 22 of 28 pt and fades them, and fades the strip sides', () => {
    expect(cellLook(0)).toEqual({ opacity: 1, scale: 1 });
    expect(cellLook(1).scale).toBeCloseTo(22 / 28);
    expect(cellLook(1).opacity).toBeCloseTo(0.78);
    expect(cellLook(-0.5).scale).toBeCloseTo(1 - 0.5 * (6 / 28));
    expect(cellLook(6).opacity).toBe(0.3);
    expect(stripFade(0)).toBe(0);
    expect(stripFade(0.11)).toBeCloseTo(0.5);
    expect(stripFade(0.5)).toBe(1);
    expect(stripFade(1)).toBe(0);
  });
});
