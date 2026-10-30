import { describe, expect, it } from '@jest/globals';

import { atmosphereFor, paletteFor, type LookId } from '@6pm/theme';

import { artRuns } from './header-art-plan';
import { parseBoxes } from './scenes/boxes/box-model';
import { fitCorner, headerGeom, liftFor, NO_HEADER, sinkFor } from './sky-header';

/** Plan's header in Vietnamese on a 402 pt phone: eyebrow, title, pencil and three lines. */
const plan = headerGeom({
  lines: [
    [22, 66, 233, 16],
    [22, 84, 153, 41],
    [22, 136, 358, 22],
    [22, 158, 340, 22],
    [22, 180, 210, 22],
  ],
  title: [22, 84, 153, 41],
  button: [345, 87, 36, 36],
  right: 380,
});

describe('a header the sky keeps clear', () => {
  it('spans its first line to its last, the button included', () => {
    expect(plan.ceiling).toBe(66);
    expect(plan.floor).toBe(202);
  });

  it('grows with its text: a fourth line lowers the floor', () => {
    const longer = headerGeom({
      lines: [
        [22, 66, 233, 16],
        [22, 84, 153, 41],
        [22, 136, 358, 88],
      ],
      title: [22, 84, 153, 41],
      button: null,
      right: 380,
    });
    expect(longer.floor).toBe(224);
  });

  it('lifts art to end above it and sinks art to start below it', () => {
    expect(liftFor(plan, 205)).toBe(66 - 6 - 205);
    expect(liftFor(plan, 40)).toBe(0);
    expect(sinkFor(plan, 124)).toBe(202 + 6 - 124);
    expect(sinkFor(plan, 260)).toBe(0);
  });

  it('moves nothing until it has been measured', () => {
    expect(liftFor(NO_HEADER, 205)).toBe(0);
    expect(sinkFor(NO_HEADER, 124)).toBe(0);
    expect(fitCorner(NO_HEADER, 26, 26).scale).toBe(0);
  });

  it('fits art beside the title, right-aligned before the button, never larger than drawn', () => {
    const [x, , w] = plan.corner;
    expect(x).toBe(22 + 153 + 16);
    expect(x + w).toBe(345 - 14);
    const moon = fitCorner(plan, 26, 26);
    expect(moon.scale).toBe(1);
    expect(moon.x + 26).toBe(345 - 14);
    const sign = fitCorner(plan, 184, 60);
    expect(sign.scale).toBeGreaterThan(0.5);
    expect(sign.scale).toBeLessThan(1);
    expect(sign.x + 184 * sign.scale).toBeCloseTo(345 - 14);
  });

  it('gives up on the corner when the title leaves no room', () => {
    const wide = headerGeom({
      lines: [[22, 84, 300, 41]],
      title: [22, 84, 300, 41],
      button: [345, 87, 36, 36],
      right: 380,
    });
    expect(fitCorner(wide, 184, 60).scale).toBe(0);
  });
});

describe("every look's art on a page with a header", () => {
  const boxesOf = (look: LookId, layer: 'back' | 'front') => {
    const input = { look, hour: 20.5, serious: false, tab: 'plan' } as const;
    const atm = atmosphereFor(input, paletteFor(input), 0);
    return parseBoxes(atm[layer], 402, 874);
  };

  it('keeps every box, in paint order', () => {
    for (const look of ['lacquer', 'glaze', 'riso', 'neon', 'expo', 'paper'] as const) {
      for (const layer of ['back', 'front'] as const) {
        const boxes = boxesOf(look, layer);
        expect(artRuns(look, layer, boxes, 402).flatMap((r) => r.boxes)).toEqual(boxes);
      }
    }
  });

  it("switches Neon Alley's ring off and moves its tube with the sign", () => {
    const runs = artRuns('neon', 'front', boxesOf('neon', 'front'), 402);
    const ring = runs.find((r) => r.boxes.some((b) => b.w === 72 && b.h === 72));
    expect(ring?.move).toBe('fade');
    const tube = runs.find((r) => r.boxes.some((b) => b.w === 170));
    expect(tube?.move).toBe('corner');
  });

  it('gives every masked run one blend', () => {
    for (const look of ['riso', 'monsoon', 'expo', 'lacquer'] as const) {
      for (const layer of ['back', 'front'] as const) {
        for (const run of artRuns(look, layer, boxesOf(look, layer), 402)) {
          if (run.masked) expect(new Set(run.boxes.map((b) => b.blend)).size).toBe(1);
        }
      }
    }
  });
});
