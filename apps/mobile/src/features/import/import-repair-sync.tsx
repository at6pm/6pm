import * as Sentry from '@sentry/react-native';
import { useEffect, useRef } from 'react';

import { repairImportedCategories } from '../../data/import-repair';
import { useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';

/**
 * On launch, puts right the categories an earlier bring-in made one per label: their lines move
 * to "Other · not daily" and the categories are archived. Once nothing is left, it reads the
 * categories and stops.
 */
export function ImportRepairSync() {
  const store = useMoneyStore();
  const { language } = useI18n();
  // Once per launch, in the language the app opened in.
  const opened = useRef(language);
  useEffect(() => {
    repairImportedCategories(store, opened.current).catch((error: unknown) => {
      Sentry.captureException(error);
    });
  }, [store]);
  return null;
}
