import { useLocalSearchParams } from 'expo-router';

import { JarPage } from '../../features/pots/jar-page';
import { UndoHost, useOfferUndo } from '../../ui/undo/undo-host';

/** Over the page's foot: the jar page has no tab bar. */
const UNDO_LIFT = 30;

/**
 * A jar's page: a full page over the sky, the jar grown out of the one tapped. A move removed on
 * it offers its undo on the page; a jar put away offers it on the screen the page leaves to.
 */
export default function Pot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offerAfterLeaving = useOfferUndo();
  return (
    <UndoHost lift={UNDO_LIFT}>
      <JarPage id={id ?? ''} offerAfterLeaving={offerAfterLeaving} />
    </UndoHost>
  );
}
