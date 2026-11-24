import type { ComponentType } from 'react';

import type { ShareInks } from '@6pm/theme';

import type { CardFormat } from './card-size';

/** What every card layout is drawn with. */
export interface CardLayoutProps<D> {
  readonly data: D;
  readonly format: CardFormat;
  /** The Show amounts switch: off, every amount is under ink. */
  readonly amounts: boolean;
  readonly inks: ShareInks;
  /** Serious mode: no companion line (the inks already carry no colour). */
  readonly serious: boolean;
  /** Drawn at rest, with no entrance: the copy fading out as the format changes. */
  readonly still?: boolean;
  /** Turns Show amounts on or off from the card itself (a tap on the amount that is shown). */
  readonly onAmounts?: (shown: boolean) => void;
  /** The headline names its other choice (the habit card's shop or category). */
  readonly alternate?: boolean;
  /** A tap on the headline switches to the other choice; absent where there is none. */
  readonly onAlternate?: () => void;
}

/**
 * One card that can be shared. A card is one layout file exporting one of these, plus its entry
 * in `cardRegistry` (`registry.ts`); the share sheet, the capture, the file name and the website
 * path all come from here.
 */
export interface ShareCardDefinition<D> {
  /** The card's path on the website: the QR opens `at6pm.app/c/<path>`, counted per card. */
  readonly path: string;
  /**
   * The card's data for the sheet's `of` parameter (a month, a year, a jar), null while it is read
   * or when there is nothing to draw. A hook: it may read the store.
   */
  readonly useData: (of: string | undefined) => D | null;
  /** Whether the card prints an amount, so the sheet offers Show amounts. */
  readonly hasAmounts: (data: D) => boolean;
  /**
   * Show amounts starts on: a card both people already know the amount of (the thank-you to a
   * client). Every other card starts with its amounts under ink.
   */
  readonly amountsShown?: boolean;
  /**
   * How long the card takes to draw itself in once it appears (the streak's bands), so the image
   * is never taken half drawn; none when it is there on its first frame.
   */
  readonly settleMs?: (data: D) => number;
  /** Whether a tap on the headline names something else (the habit's shop or its category). */
  readonly canAlternate?: (data: D) => boolean;
  /** The shared file's key (`6pm-card-<path>-<key>.png`). */
  readonly fileKey: (data: D) => string;
  readonly Layout: ComponentType<CardLayoutProps<D>>;
}

/** Keeps a card's data type tied to its own layout while the registry holds them side by side. */
export function defineCard<D>(card: ShareCardDefinition<D>): ShareCardDefinition<unknown> {
  return card as unknown as ShareCardDefinition<unknown>;
}
