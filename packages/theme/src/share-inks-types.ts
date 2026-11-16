/**
 * The share cards in each look, as the postcards canvases draw them ("Share Cards v2" for Golden
 * Hour, "Postcards in Looks" for the rest): the same month of suns, streak of evenings and pay as
 * jars, with each look's sun, bands and jars redrawn in its own material. Backgrounds, borders
 * and shadows are CSS strings the card's art layer draws with Skia; sizes are points on the
 * 360 pt card (the canvas's 1080 px image at a third).
 */

import type { CardWorkInks } from './share-inks-work';

/** A line across the card: the rule above the places and the mark, the horizon on the streak. */
export interface CardRule {
  readonly width: number;
  readonly dashed: boolean;
  readonly color: string;
}

/** A text shadow, as React Native draws one. */
export interface CardGlow {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly color: string;
}

/**
 * The streak sun's loop, as the canvases animate it: `sink` drifts 6 pt up and 4 pt down over
 * 4 s (ease-in-out, alternate), `flick` drops out now and then over 5 s, `sway` rocks ±3° over 6 s.
 */
export type SunMotion = 'sink' | 'flick' | 'sway' | 'none';

/** One evening's band on the streak card. */
export interface CardBand {
  readonly bg: string;
  readonly sh: string;
  /** The day and closing time printed on it. */
  readonly txt: string;
}

/** One jar on the split card, in the look's material. */
export interface CardJar {
  readonly lid: string;
  readonly body: string;
  /** `<n>px solid <colour>`, or 'none'. */
  readonly edge: string;
  readonly fill: string;
  /** The fill's top edge, `<n>px solid <colour>`, or 'none'. */
  readonly top: string;
  readonly glow: string;
  /** The jar's icon colour, or null when the look draws no icon on its jars. */
  readonly glyph: string | null;
}

export interface ShareInks {
  /** The card's ground and the texture laid over it (CSS backgrounds). */
  readonly bg: string;
  readonly tex: string;
  /** Inset shadows framing the whole card (Paper Diorama's shoebox stage); 'none' for most. */
  readonly frame: string;
  /** The streak card's ground under its bands and its panel. */
  readonly base: string;
  readonly ink: string;
  readonly soft: string;
  /** "EVENINGS IN A ROW" and other small highlights. */
  readonly accent: string;
  /** Kickers in the mono face, or in the interface face (Basic, SF Pro throughout). */
  readonly kickers: 'mono' | 'ui';
  /** The month card's title size, and the display weights the look sets its titles in. */
  readonly titleSize: number;
  readonly titleWeight: number;
  readonly lineWeight: number;
  /** Letter spacing of the titles, in em. */
  readonly tracking: number;
  readonly glow: CardGlow | null;
  readonly rule: CardRule;
  /** The QR's tile, its modules and the ring around the tile (a CSS box-shadow). */
  readonly qr: { readonly tile: string; readonly ink: string; readonly ring: string };
  /** The month's suns: a full one, a half-set one, the ring of a missed one, the lit glow. */
  readonly sun: {
    readonly full: string;
    readonly half: string;
    readonly miss: string;
    readonly lit: string;
    /** The glow of a half-set sun when it differs from a full one's. */
    readonly halfLit?: string;
    /** CSS border-radius of a sun (a raindrop, a bean, a lantern). */
    readonly radius: string;
  };
  readonly band: (index: number, seed: number) => CardBand;
  /** The band labels' shadow. */
  readonly bandGlow: CardGlow | null;
  /** The seven-band streak's gap, padding (top, sides) and corner radius. */
  readonly bands: {
    readonly gap: number;
    readonly pad: number;
    readonly side: number;
    readonly r: number;
  };
  /**
   * The sun setting into the streak's panel: its background, glow and border; how far it sits
   * below the horizon (half its 92 pt, or less where the look lifts it); and how it moves while
   * the card is on screen: Golden Hour's sun sinks a little and rises again, Neon Alley's tube
   * flickers, Lantern River's lantern sways.
   */
  readonly bigSun: {
    readonly bg: string;
    readonly sh: string;
    readonly border: string;
    readonly sink: number;
    readonly motion: SunMotion;
  };
  readonly horizon: CardRule;
  readonly jar: (index: number, hue: number) => CardJar;
  readonly jarShape: { readonly lid: string; readonly body: string; readonly lidGlow: string };
  /** The shelf the jars stand on (Golden Hour's plank), or null for a plain rule. */
  readonly shelf: { readonly bg: string; readonly sh: string } | null;
  /** The year card's receipt: paper, ink, its rules and the best month's highlight. */
  readonly receipt: {
    readonly paper: string;
    readonly ink: string;
    readonly soft: string;
    readonly rule: string;
    readonly best: string;
  };
  /** The cards for money that is not one salary: the ruler, pays, work's bars, the receipt. */
  readonly work: CardWorkInks;
}

export const PAPER = {
  paper: '#fbf7ef',
  ink: '#2b2530',
  soft: 'rgba(43,37,48,.75)',
  rule: 'rgba(43,37,48,.35)',
} as const;

export const glow = (x: number, y: number, blur: number, color: string): CardGlow => ({
  x,
  y,
  blur,
  color,
});
export const rule = (width: number, color: string, dashed = false): CardRule => ({
  width,
  dashed,
  color,
});
export const byIndex = <T>(list: readonly T[], i: number): T => list[i % list.length] as T;

/** A small seeded sequence, as the canvas draws its skies (`(s × 9301 + 49297) % 233280`). */
export function seeded(seed: number): () => number {
  let s = Math.abs(Math.floor(seed)) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/** Golden Hour's skies at six: each band is one evening's sky, top, middle and bottom colour. */
