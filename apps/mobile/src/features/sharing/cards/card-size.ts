/** The two images a card is shared as: a 9:16 story and the 4:5 feed crop. */
export type CardFormat = 'story' | 'feed';

/** The card is laid out at a third of its image: 360 pt wide, 1080 px shared. */
export const CARD_WIDTH = 360;
export const CARD_PIXELS = 1080;

const HEIGHT: Readonly<Record<CardFormat, number>> = { story: 640, feed: 450 };

/** The card's height in points (1920 px for a story, 1350 for the feed). */
export function cardHeight(format: CardFormat): number {
  return HEIGHT[format];
}

/** The shared image's size in pixels. */
export function cardPixels(format: CardFormat): {
  readonly width: number;
  readonly height: number;
} {
  return { width: CARD_PIXELS, height: (cardHeight(format) * CARD_PIXELS) / CARD_WIDTH };
}

/** A raw box of the card's art, written in the canvas's CSS (see `card-art`). */
export interface ArtBox {
  /** Left, top, width and height in points on the card. */
  readonly l: number;
  readonly t: number;
  readonly w: number;
  readonly h: number;
  /** CSS background, border-radius, `<n>px solid <colour>` border and box-shadow. */
  readonly bg?: string;
  readonly r?: string;
  readonly bd?: string;
  readonly sh?: string;
  /** A CSS gradient the box is masked by (a jar's fill below its line). */
  readonly mk?: string;
  readonly op?: number;
  /** CSS transform: only `rotate(<n>deg)`. */
  readonly tf?: string;
}
