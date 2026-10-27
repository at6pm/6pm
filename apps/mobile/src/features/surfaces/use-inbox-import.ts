import * as Sentry from '@sentry/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { surfaces } from '../../../modules/surfaces';
import { importInbox } from '../../data/inbox-import';
import { useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { useHomeCurrency } from '../../money/use-money-format';
import { useApi } from '../api/native-api';
import { createEnrichShared } from '../capture/enrich-shared';
import { priceWaitingNow } from '../travel/price-waiting';

/**
 * Brings in what the share extension, the shortcuts and the Live Activity left in the App Group:
 * once the money store has loaded, and every time the app comes back to the foreground. Then
 * prices any captured foreign amount still waiting for a rate, in the home currency, at the rate
 * of the day it was paid. One run at a time; a return to the foreground during one waits for it.
 */
export function useInboxImport() {
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const api = useApi();
  const db = useSQLiteContext();
  const home = useHomeCurrency();
  const running = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    const native = surfaces;
    if (!native) return;
    const enrich = createEnrichShared({
      request: (request) => api.request(request),
      settings: db,
      ruleCategory: (merchant) => actions.ruleCategory(merchant),
      categories: () => store.getSnapshot().categories,
    });
    const price = () => priceWaitingNow({ store, actions, api, home });
    const run = () => {
      running.current = running.current
        .then(() =>
          importInbox({
            store,
            actions,
            inbox: native,
            enrich,
            home: home.code,
            report: (message) => Sentry.captureMessage(message),
          }),
        )
        .catch((error: unknown) => Sentry.captureException(error))
        .then(price)
        .catch((error: unknown) => Sentry.captureException(error));
    };
    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, [store, actions, api, db, home]);
}
