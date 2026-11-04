import { oklchSrgbHex, paperInk, planInk, zineInk, type Palette } from '@6pm/theme';

import { alpha } from '../pots/jar-colours';

const potsBg = oklchSrgbHex(0.42, 0.06, 70);
const potsHatch = oklchSrgbHex(0.36, 0.05, 70);
const billsPaper = '#f4efe4';

/**
 * Plan's split, as the Plan canvas paints it: Bills on ruled paper, Pots in a deep jar amber, Free
 * in the accent, Before and Over hatched, and the receipt for Today's maths. The parts keep their
 * colours in every look, as paper does; the ink around them follows the look.
 */
export function splitColours(palette: Palette) {
  const accent = palette.accent;
  const warn = palette.dark ? planInk.warn.dark : planInk.warn.light;
  return {
    bills: {
      bg: billsPaper,
      fg: paperInk.ink,
      /** The paper's ruling: a hairline every 8 pt. */
      rule8: alpha(paperInk.ink, 0.08),
      rule: alpha(paperInk.ink, 0.18),
      paidTile: alpha(paperInk.ink, 0.14),
      paidGlyph: alpha(paperInk.ink, 0.6),
    },
    pots: {
      bg: potsBg,
      fg: zineInk.light,
      /** Hatched while the jars wait for tomorrow's pay. */
      scheduled: { a: potsBg, b: potsHatch, width: 6 },
      glow: 'rgba(255,211,110,.8)',
      pulse: 'rgba(255,211,110,.7)',
    },
    before: {
      hatch: { a: alpha(accent, 0.55), b: alpha(accent, 0.3), width: 5 },
      fg: zineInk.light,
    },
    free: {
      bg: accent,
      fg: zineInk.ink,
      dotPast: alpha(zineInk.ink, 0.55),
      dotFuture: alpha(zineInk.ink, 0.16),
      dotToday: zineInk.light,
      dotTodayRing: alpha(zineInk.light, 0.45),
      dotOver: { a: zineInk.ink, b: 'transparent', width: 2 },
    },
    over: {
      hatch: { a: planInk.warn.dark, b: '#c9875a', width: 5 },
      fg: zineInk.ink,
    },
    /** The day line once Free is used up: warm, never red. */
    warn,
    /** The selected part's ring and the shadow it lifts on. */
    ring: palette.ink,
    lift: 'rgba(4,0,10,.35)',
    /** A bill's tile once paid, and its due line while it is not. */
    paidTile: palette.dark ? 'rgba(255,255,255,.12)' : 'rgba(27,30,46,.08)',
    due: warn,
    tick: palette.ink,
    tickInk: palette.dark ? '#26182f' : '#ffffff',
    receipt: {
      bg: paperInk.sheet,
      ink: paperInk.ink,
      rule: paperInk.rule,
      result: planInk.recapWord.light,
    },
    chip: { bg: '#ffd36e', fg: '#2a1424' },
  };
}

export type SplitColours = ReturnType<typeof splitColours>;

/** A bill's tile in the Bills list and on the paper: a mid tint of its hue. */
export function billTile(hue: number): string {
  return oklchSrgbHex(0.66, 0.13, hue);
}
