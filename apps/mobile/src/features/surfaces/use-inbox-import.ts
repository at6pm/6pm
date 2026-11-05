import * as Sentry from '@sentry/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { surfaces } from '../../../modules/surfaces';
import { billPayments } from '../../data/bill-payments';
import { keepPhotoAt } from '../../data/device-photo-files';
import { startReadingCount } from '../../data/first-catch';
import { importInbox } from '../../data/inbox-import';
import { useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { useApi } from '../api/native-api';
import { createEnrichShared } from '../capture/enrich-shared';
import { priceWaitingNow } from '../travel/price-waiting';
import { setInboxRunner } from './inbox-runner';

/**
 * Brings in what the share extension, the shortcuts and the Live Activity left in the App Group:
 * once the money store has loaded, and every time the app comes back to the foreground. Then
 * prices any captured foreign amount still waiting for a rate, in the home currency, at the rate
 * of the day it was paid, and marks a bill's payment among them as paying it. One run at a time;
 * a return to the foreground during one waits for it, and so does a screen asking for one
 * (`requestInboxImport`), a second ask joining the one queued.
 */
export function useInboxImport() {
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const api = useApi();
  const db = useSQLiteContext();
  const home = useHomeCurrency();
  const { language } = useI18n();
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
    let queued: Promise<void> | null = null;
    // Prices everything waiting after this run, not only what it brought in.
    let priceAll = false;
    // A run asked for while another waits to start is that one: the inbox is read when it starts.
    const run = (all = false): Promise<void> => {
      priceAll ||= all;
      if (queued) return queued;
      const next = running.current
        .then(async () => {
          queued = null;
          const everything = priceAll;
          priceAll = false;
          const result = await importInbox({
            store,
            actions,
            inbox: native,
            enrich,
            home: home.code,
            language,
            keepPhoto: keepPhotoAt,
            report: (message) => Sentry.captureMessage(message),
          }).catch((error: unknown) => {
            Sentry.captureException(error);
            return { saved: 0, removed: 0 };
          });
          // A charge abroad is priced after anything new came in, and on every return to the app.
          if (everything || result.saved > 0) await price();
          // A charge abroad priced just now may be a bill's payment: marked once it has an amount.
          await billPayments(store).markCaught();
        })
        .catch((error: unknown) => {
          Sentry.captureException(error);
        });
      queued = next;
      running.current = next;
      return next;
    };
    void startReadingCount(store.db).catch(() => undefined);
    void run(true);
    setInboxRunner(() => run());
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run(true);
    });
    return () => {
      setInboxRunner(null);
      sub.remove();
    };
  }, [store, actions, api, db, home, language]);
}
