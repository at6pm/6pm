import * as Sentry from '@sentry/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { surfaces } from '../../../modules/surfaces';
import { billPayments } from '../../data/bill-payments';
import { renameSightingPayee } from '../../data/capture-sightings';
import { deviceAlertReadsWaiting } from '../../data/device-alert-read-waiting';
import { keepPhotoAt } from '../../data/device-photo-files';
import { startReadingCount } from '../../data/first-catch';
import { importInbox } from '../../data/inbox-import';
import { useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { namedBefore } from '../../data/named-before';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { useApi } from '../api/native-api';
import { createEnrichShared } from '../capture/enrich-shared';
import { createLateAlertReads } from '../capture/late-alert-read';
import { createReadAlerts } from '../capture/read-alert';
import { noteAlertsProven } from '../capture/alerts-proven';
import { noteTestAlertArrived } from '../capture/test-alert';
import { priceWaitingNow } from '../travel/price-waiting';
import { setInboxRunner } from './inbox-runner';
import { nativeReach } from './native-reach';

/** A run that left an alert waiting for its second reading asks once more, this long after. */
const LATE_READ_FOLLOW_UP_MS = 15_000;

/**
 * Brings in what the share extension, the shortcuts and the Live Activity left in the App Group:
 * once the money store has loaded, and every time the app comes back to the foreground. Then
 * prices any captured foreign amount still waiting for a rate, in the home currency, at the rate
 * of the day it was paid, and marks a bill's payment among them as paying it. One run at a time;
 * a return to the foreground during one waits for it, and so does a screen asking for one
 * (`requestInboxImport`), a second ask joining the one queued.
 *
 * A caught bank alert whose second reading got no answer is asked about again as each run starts
 * (the run does not wait for it), and once more a little after a run that left one waiting, while
 * the app stays open.
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
    const readAlerts = createReadAlerts({
      request: (request) => api.request(request),
      settings: db,
      ruleCategory: (merchant) => actions.ruleCategory(merchant),
      categories: () => store.getSnapshot().categories,
      home: () => home,
    });
    const waiting = deviceAlertReadsWaiting;
    const lateReads = createLateAlertReads({
      request: (request) => api.request(request),
      settings: db,
      ruleCategory: (merchant) => actions.ruleCategory(merchant),
      categories: () => store.getSnapshot().categories,
      home: () => home,
      waiting,
      row: (spendId) => store.tables.spends.get(spendId),
      namedBefore: (payee) => namedBefore(store.db, payee, store.getSnapshot().today),
      renameSighting: (spendId, captureId, payee) =>
        renameSightingPayee(store.db, spendId, captureId, payee),
      update: (spendId, patch) => actions.update(spendId, patch),
    });
    const readLate = () => {
      void lateReads().catch((error: unknown) => Sentry.captureException(error));
    };
    let followUp: ReturnType<typeof setTimeout> | undefined;
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
          clearTimeout(followUp);
          readLate();
          const result = await importInbox({
            store,
            actions,
            inbox: native,
            enrich,
            readAlerts,
            keepForLateRead: (entry) => waiting.keep(entry),
            testArrived: (item) => {
              noteTestAlertArrived(item.token, item.at);
              // Through a Shortcut, which 6pm cannot see: its arrival is what says it is set up.
              if (!nativeReach.alertListener) {
                void noteAlertsProven(store.db, item.at).catch(() => undefined);
              }
            },
            home: home.code,
            language,
            keepPhoto: keepPhotoAt,
            report: (message) => Sentry.captureMessage(message),
          }).catch((error: unknown) => {
            Sentry.captureException(error);
            return { saved: 0, removed: 0 };
          });
          if ((await waiting.list().catch(() => [])).length > 0) {
            followUp = setTimeout(readLate, LATE_READ_FOLLOW_UP_MS);
          }
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
      clearTimeout(followUp);
    };
  }, [store, actions, api, db, home, language]);
}
