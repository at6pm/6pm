import type { CardId } from './cards/registry';
import { ShareChip } from './share-chip';
import { useShareOffer } from './share-offers';

/**
 * A card's quiet Share chip at a moment that is offered once: it rises into place the first time
 * the moment is seen (`useShareOffer`) and is not offered there again. No moments, no chip.
 */
export function OfferedChip({
  moments,
  card,
  of,
  label,
  size,
}: {
  readonly moments: readonly string[];
  readonly card: CardId;
  readonly of?: string;
  readonly label: string;
  readonly size?: 'regular' | 'small';
}) {
  const offered = useShareOffer(moments);
  if (!offered) return null;
  return (
    <ShareChip
      card={card}
      label={label}
      delay={0}
      {...(of === undefined ? {} : { of })}
      {...(size === undefined ? {} : { size })}
    />
  );
}
