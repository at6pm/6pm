import { useLocalSearchParams, useRouter } from 'expo-router';

import { useMoney } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';
import { SpendDetails } from '../../features/details/spend-details';
import { useI18n } from '../../i18n/i18n';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { UndoHost, useOfferUndo } from '../../ui/undo/undo-host';

/** Just above the home indicator: a sheet has no tab bar to clear. */
const UNDO_LIFT = 50;

/**
 * The spend sheet: one spend's details, closed when the spend is deleted. A removed photo's undo
 * shows in the sheet; a deleted spend's, on the app's own bar, since the sheet closes with it.
 */
export default function SpendSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const offerAppUndo = useOfferUndo();
  const found = findSpend(useMoney(), id) !== undefined;
  return (
    <UndoHost lift={UNDO_LIFT}>
      <SheetScreen title={t('details.title')}>
        {found ? (
          <SpendDetails id={id} onDeleted={() => router.back()} offerDeleteUndo={offerAppUndo} />
        ) : null}
      </SheetScreen>
    </UndoHost>
  );
}
