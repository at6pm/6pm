import { describe, expect, it } from '@jest/globals';

import { designBottom } from './design-insets';

describe('designBottom', () => {
  it("keeps the design's offsets on the design iPhone", () => {
    expect(designBottom(30, 34, false)).toBe(30);
    expect(designBottom(26, 34, false)).toBe(26);
  });

  it('shifts by the difference in safe area on another iPhone', () => {
    expect(designBottom(30, 21, false)).toBe(17);
  });

  it("keeps a gap above Android's three-button bar", () => {
    expect(designBottom(30, 48, true)).toBe(64);
    expect(designBottom(26, 48, true)).toBe(64);
  });

  it('keeps a gap above a thin gesture strip', () => {
    // Shifted alone would be 8 and 12: inside the 16 dp strip.
    expect(designBottom(26, 16, true)).toBe(26);
    expect(designBottom(30, 16, true)).toBe(26);
  });

  it('never goes below the screen where Android reports no inset', () => {
    expect(designBottom(26, 0, true)).toBe(10);
    expect(designBottom(8, 0, true)).toBe(10);
  });

  it('leaves an offset that is already clear of the bar', () => {
    expect(designBottom(124, 24, true)).toBe(114);
  });
});
