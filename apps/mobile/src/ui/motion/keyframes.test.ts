import { describe, expect, it } from '@jest/globals';

import { keyframe, type Track } from './keyframes';

const linear = (x: number) => x;

describe('keyframe tracks', () => {
  const roll: Track = [
    [0, 0],
    [0.12, 0],
    [0.34, 1],
    [0.88, 1],
    [0.96, 0],
  ];

  it('holds before the first stop, between equal stops and after the last', () => {
    expect(keyframe(0, roll, linear)).toBe(0);
    expect(keyframe(0.1, roll, linear)).toBe(0);
    expect(keyframe(0.5, roll, linear)).toBe(1);
    expect(keyframe(1, roll, linear)).toBe(0);
  });

  it('moves between stops in proportion, through the easing', () => {
    expect(keyframe(0.23, roll, linear)).toBeCloseTo(0.5);
    expect(keyframe(0.92, roll, linear)).toBeCloseTo(0.5);
    const square = (x: number) => x * x;
    expect(keyframe(0.23, roll, square)).toBeCloseTo(0.25);
  });

  it('reads an empty track as zero and a single stop as that value', () => {
    expect(keyframe(0.5, [], linear)).toBe(0);
    expect(keyframe(0.5, [[0.2, 0.6]], linear)).toBe(0.6);
  });
});
