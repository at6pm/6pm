import { oklchSrgbHex } from '@6pm/theme';

/** Appends an alpha to a `#rrggbb` colour. */
export function alpha(hex: string, a: number): string {
  if (!/^#[0-9a-f]{6}/i.test(hex)) return hex;
  const byte = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${byte}`;
}

/** A jar's colours, from its hue (the Pots canvases' `tok`). */
export interface JarColours {
  /** The glass. */
  readonly glass: string;
  /** What it holds. */
  readonly fill: string;
  /** The bright line on top of what it holds. */
  readonly fillTop: string;
  readonly lid: string;
  /** The icon over a low fill, and over a high one. */
  readonly iconLow: string;
  readonly iconHigh: string;
  /** A shared jar's partner part, stacked under one's own. */
  readonly partner: string;
  /** The glow of a full jar. */
  readonly glow: string;
  /** A strong tint for text in the jar's colour (a full jar's "· full"). */
  readonly text: string;
}

const cache = new Map<number, JarColours>();

export function jarColours(hue: number): JarColours {
  const h = Math.round(((hue % 360) + 360) % 360);
  const kept = cache.get(h);
  if (kept) return kept;
  const colours: JarColours = {
    glass: alpha(oklchSrgbHex(0.86, 0.06, h), 0.16),
    fill: oklchSrgbHex(0.8, 0.12, h),
    fillTop: oklchSrgbHex(0.9, 0.08, h),
    lid: oklchSrgbHex(0.55, 0.08, h),
    iconLow: oklchSrgbHex(0.88, 0.08, h),
    iconHigh: oklchSrgbHex(0.32, 0.09, h),
    partner: oklchSrgbHex(0.72, 0.13, h),
    glow: alpha(oklchSrgbHex(0.8, 0.12, h), 0.4),
    text: oklchSrgbHex(0.86, 0.12, h),
  };
  cache.set(h, colours);
  return colours;
}

/** The partner's avatar on a shared jar (B). */
export const PARTNER_BADGE = { bg: oklchSrgbHex(0.8, 0.1, 30), fg: oklchSrgbHex(0.25, 0.05, 40) };

/** A dated jar whose date passed before it filled: its target line and words turn warm. */
export const PAST_DATE_WARM = oklchSrgbHex(0.85, 0.09, 55);

/** The dashed target line on the glass. */
export const TARGET_LINE = 'rgba(251,244,236,0.45)';

/** Money in and out on a jar's page: a green dot in; a warm dot and amount out. */
export const MOVE_IN = oklchSrgbHex(0.8, 0.12, 150);
export const MOVE_OUT_TEXT = PAST_DATE_WARM;

/** A full jar's words ("12,6tr · full"). */
export const FULL_TEXT = oklchSrgbHex(0.86, 0.12, 150);

/** The what-if card on Future you's page: a deep wash over the sky. */
export const WHAT_IF_CARD = 'rgba(20,10,30,0.3)';
export const WHAT_IF_TRACK = 'rgba(255,255,255,0.12)';
