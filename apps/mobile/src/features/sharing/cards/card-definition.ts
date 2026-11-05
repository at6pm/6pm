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
  /** The shared file's key (`6pm-card-<path>-<key>.png`). */
  readonly fileKey: (data: D) => string;
  readonly Layout: ComponentType<CardLayoutProps<D>>;
}

/** Keeps a card's data type tied to its own layout while the registry holds them side by side. */
export function defineCard<D>(card: ShareCardDefinition<D>): ShareCardDefinition<unknown> {
  return card as unknown as ShareCardDefinition<unknown>;
}
