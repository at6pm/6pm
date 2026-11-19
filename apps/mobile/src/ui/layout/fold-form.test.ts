import { describe, expect, it } from '@jest/globals';

import type { FoldSnapshot } from '../../../modules/fold';
import { foldForm } from './fold-form';

// Readings from the iPhone Duo simulator (iOS 27.1) in each pose.
const outer = { width: 466, height: 678 };
const sideways = { width: 951, height: 669 };
const upright = { width: 669, height: 951 };
const island = { x: 382, y: 0, width: 84, height: 174 };
const camera = { x: 867, y: 0, width: 84, height: 124 };
const uprightCamera = { x: 585, y: 0, width: 84, height: 124 };
const uprightFold = { x: 455.5, y: 0, width: 40, height: 669 };
const acrossFold = { x: 0, y: 455.5, width: 669, height: 40 };

const snap = (s: Partial<FoldSnapshot>): FoldSnapshot => ({
  hinge: 'unknown',
  angle: null,
  divisions: [],
  occlusions: [],
  ...s,
});

describe('foldForm', () => {
  it('lays out as a phone on an iPhone without a hinge', () => {
    expect(foldForm(snap({}), { width: 402, height: 874 })).toEqual({ kind: 'phone' });
  });

  it('puts the bars in a rail beside the island on the outer screen', () => {
    const closed = snap({ hinge: 'closed', angle: 0, occlusions: [island] });
    expect(foldForm(closed, outer)).toEqual({ kind: 'rail', rail: 84 });
  });

  it('splits at the fold when held like a book', () => {
    const book = snap({
      hinge: 'partial',
      angle: 2.23,
      divisions: [uprightFold],
      occlusions: [camera],
    });
    expect(foldForm(book, sideways)).toEqual({
      kind: 'spread',
      left: { x: 0, width: 455.5 },
      right: { x: 495.5, width: 455.5 },
      rail: 84,
      book: true,
    });
  });

  it('keeps two pages when it lies flat and the fold is no longer reported', () => {
    const flat = snap({ hinge: 'open', angle: Math.PI, occlusions: [camera] });
    expect(foldForm(flat, sideways)).toEqual({
      kind: 'spread',
      left: { x: 0, width: 455.5 },
      right: { x: 495.5, width: 455.5 },
      rail: 84,
      book: false,
    });
  });

  it('stands with the top half to read and the bottom half to touch', () => {
    const stand = snap({
      hinge: 'partial',
      angle: 2.23,
      divisions: [acrossFold],
      occlusions: [uprightCamera],
    });
    expect(foldForm(stand, upright)).toEqual({
      kind: 'stand',
      top: { y: 0, height: 455.5 },
      bottom: { y: 495.5, height: 455.5 },
    });
  });

  it('lays out as a phone when opened upright and flat', () => {
    const flat = snap({ hinge: 'open', angle: Math.PI, occlusions: [uprightCamera] });
    expect(foldForm(flat, upright)).toEqual({ kind: 'phone' });
  });

  describe('a folding Android phone, whose fold is a line with no width', () => {
    // Galaxy Z Fold8: a 2448 × 1848 inner screen and a 1248 × 1972 cover screen at 420 dpi.
    const inner = { width: 932.5, height: 704 };
    const turned = { width: 704, height: 932.5 };
    const cover = { width: 475.5, height: 751 };
    const line = { x: 466.25, y: 0, width: 0, height: 704 };
    const lineAcross = { x: 0, y: 466.25, width: 704, height: 0 };

    it('lays out as a phone on the cover screen', () => {
      expect(foldForm(snap({ hinge: 'closed' }), cover)).toEqual({ kind: 'phone' });
    });

    it('keeps the gutter clear either side of the fold when opened flat', () => {
      expect(foldForm(snap({ hinge: 'open', divisions: [line] }), inner)).toEqual({
        kind: 'spread',
        left: { x: 0, width: 446.25 },
        right: { x: 486.25, width: 446.25 },
        rail: 0,
        book: false,
      });
    });

    it('is a book when part way open with the fold upright', () => {
      const form = foldForm(snap({ hinge: 'partial', divisions: [line] }), inner);
      expect(form).toMatchObject({ kind: 'spread', book: true });
    });

    it('stands on a table with the gutter clear of the fold', () => {
      expect(foldForm(snap({ hinge: 'partial', divisions: [lineAcross] }), turned)).toEqual({
        kind: 'stand',
        top: { y: 0, height: 446.25 },
        bottom: { y: 486.25, height: 446.25 },
      });
    });

    it('lays out as a phone when turned upright and flat', () => {
      expect(foldForm(snap({ hinge: 'open', divisions: [lineAcross] }), turned)).toEqual({
        kind: 'phone',
      });
    });

    it('keeps two pages on a taller inner screen, whose fold is upright', () => {
      // Galaxy Z Fold8 Ultra: 2256 × 2504 at 420 dpi.
      const tall = { width: 859.5, height: 954 };
      const fold = { x: 429.75, y: 0, width: 0, height: 954 };
      expect(foldForm(snap({ hinge: 'open', divisions: [fold] }), tall)).toEqual({
        kind: 'spread',
        left: { x: 0, width: 409.75 },
        right: { x: 449.75, width: 409.75 },
        rail: 0,
        book: false,
      });
    });

    it('passes over a fold left from the last orientation while the phone turns', () => {
      // Turned back to sideways: the window is wide again, the fold still reads as across.
      expect(foldForm(snap({ hinge: 'partial', divisions: [lineAcross] }), inner)).toEqual({
        kind: 'spread',
        left: { x: 0, width: 446.25 },
        right: { x: 486.25, width: 446.25 },
        rail: 0,
        book: true,
      });
      // Turned upright: the fold still reads as upright, and is no reason for two pages.
      expect(foldForm(snap({ hinge: 'open', divisions: [line] }), turned)).toEqual({
        kind: 'phone',
      });
    });

    it('is one column as it shuts, the fold still in the window', () => {
      expect(foldForm(snap({ hinge: 'closed', divisions: [line] }), inner)).toEqual({
        kind: 'phone',
      });
    });

    it('keeps two pages part way open in a window the fold does not cross', () => {
      expect(foldForm(snap({ hinge: 'partial' }), inner)).toMatchObject({
        kind: 'spread',
        book: true,
      });
    });

    it('takes a fold within two points of the window and no further', () => {
      // Off the middle, so the fold's own place and the middle of the window tell apart.
      const near = { x: 500, y: 0, width: 0, height: 702 };
      const far = { x: 500, y: 0, width: 0, height: 701 };
      const wide = { width: 932.5, height: 704 };
      expect(foldForm(snap({ hinge: 'open', divisions: [near] }), wide)).toMatchObject({
        left: { x: 0, width: 480 },
      });
      // Passed over, the pages split at the middle of the window instead.
      expect(foldForm(snap({ hinge: 'open', divisions: [far] }), wide)).toMatchObject({
        left: { x: 0, width: 446.25 },
      });
    });

    it('stays a phone on a flip phone held a little bent', () => {
      // Galaxy Z Flip: about 412 × 1006 dp, folding across its middle.
      const flip = { width: 412, height: 1006 };
      const bend = { x: 0, y: 503, width: 412, height: 0 };
      expect(foldForm(snap({ hinge: 'partial', divisions: [bend] }), flip)).toEqual({
        kind: 'phone',
      });
    });

    it('is one column in a split-screen window too narrow for two pages', () => {
      expect(foldForm(snap({ hinge: 'open' }), { width: 446, height: 704 })).toEqual({
        kind: 'phone',
      });
    });
  });

  it('falls back to one column when Split View leaves too little room for two pages', () => {
    const narrow = snap({ hinge: 'open', angle: Math.PI });
    expect(foldForm(narrow, { width: 600, height: 669 })).toEqual({ kind: 'phone' });
  });
});
