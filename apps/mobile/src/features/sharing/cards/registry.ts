import type { ShareCardDefinition } from './card-definition';
import { jarShareCard } from './jar-card';
import { monthShareCard } from './month-card';
import { splitShareCard } from './split-card';
import { streakShareCard } from './streak-card';
import { yearShareCard } from './year-card';

/**
 * Every card that can be shared, by the id the share sheet is opened with
 * (`/share-card?card=<id>&of=<param>`).
 *
 * Adding a card is two steps:
 * 1. One layout file in this folder exporting `defineCard({ path, useData, hasAmounts, fileKey,
 *    Layout })`: `useData` reads what the card prints for its `of` parameter, `Layout` draws it on
 *    the 360 pt card from `CardGround`, `CardArt` boxes in the look's `ShareInks` and `CardMark`
 *    (which prints at6pm.app/c and the QR to `at6pm.app/c/<path>`), for both formats.
 * 2. Its entry here, and its path in the website's card list (`apps/web/src/data/cards.ts`) so the
 *    QR's link lands on the store.
 * Its words go in `@6pm/i18n` under `shareCards.<id>.*` (and companion lines under `companion.*`).
 * A Share chip anywhere then opens it with `openShareCard(router, '<id>', param)`.
 */
export const cardRegistry = {
  month: monthShareCard,
  streak: streakShareCard,
  split: splitShareCard,
  year: yearShareCard,
  jar: jarShareCard,
} as const satisfies Readonly<Record<string, ShareCardDefinition<unknown>>>;

export type CardId = keyof typeof cardRegistry;

export function isCardId(value: unknown): value is CardId {
  return typeof value === 'string' && Object.hasOwn(cardRegistry, value);
}
