import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { AppState, Linking } from 'react-native';

import { surfaces } from '../../../modules/surfaces';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency, useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { askForReminders } from '../onboarding/close-reminder';
import { refreshReminderPermission } from '../reminders/reminder-permission';
import { requestInboxImport } from '../surfaces/inbox-runner';
import { nativeReach } from '../surfaces/native-reach';
import {
  TEST_ALERT_IDLE,
  TEST_ALERT_LOOK_MS,
  TEST_ALERT_WAIT_MS,
  testAlertArrivedAt,
  testAlertStep,
  watchTestAlerts,
  type TestAlertState,
} from './test-alert';

export interface TestAlert {
  /** This phone reads bank alerts through Android's listener, and this build can post a test. */
  readonly available: boolean;
  readonly state: TestAlertState;
  /** Sends one, asking the phone to let 6pm post notifications first when it does not yet. */
  readonly send: () => void;
  /** Once blocked: the phone's own question while it will still ask, then its settings. */
  readonly allow: () => void;
}

/** Whether a test alert can be sent here at all. Never on the iPhone. */
export const testAlertAvailable =
  nativeReach.alertListener && typeof surfaces?.postTestAlert === 'function';

/**
 * A test alert the person sends to themselves, and what became of it. Sending posts a real
 * notification, worded like a small payment and marked as a test, in the app's language; then the
 * app's one inbox importer is asked to run every 600 ms until the alert has come the whole way in
 * (the listener, the reader, the inbox, the import), or ten seconds have passed with nothing. The
 * permission to post is asked for as it is for reminders. Nothing is saved from a test alert.
 */
export function useTestAlert(): TestAlert {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const step = useHomeCurrency().step;
  const [state, dispatch] = useReducer(testAlertStep, TEST_ALERT_IDLE);
  const now = useRef(state);
  now.current = state;
  const sending = useRef(false);

  const send = useCallback(() => {
    const native = surfaces;
    if (!testAlertAvailable || !native?.postTestAlert) return;
    if (sending.current || now.current.kind === 'sent') return;
    sending.current = true;
    void (async () => {
      const granted = await askForReminders().catch(() => false);
      const permission = await refreshReminderPermission();
      if (!granted) {
        dispatch({ type: 'blocked', canAsk: permission === 'ask' });
        return;
      }
      const token = randomUUID();
      const posted = await native
        .postTestAlert?.(
          token,
          t('testAlert.notice.title'),
          t('testAlert.notice.body', { amount: money.full(step) }),
          t('testAlert.channel'),
        )
        .catch(() => 'off' as const);
      // Allowed by the phone and still not posted: this channel is off, which only settings change.
      if (posted === 'posted') dispatch({ type: 'sent', token });
      else dispatch({ type: 'blocked', canAsk: false });
    })().finally(() => {
      sending.current = false;
    });
  }, [t, money, step]);

  const allow = useCallback(() => {
    const blocked = now.current;
    if (blocked.kind === 'blocked' && blocked.canAsk) send();
    else void Linking.openSettings().catch(() => undefined);
  }, [send]);

  // On its way, or given up on: it is known the moment the import sees it arrive.
  const token = state.kind === 'sent' || state.kind === 'missing' ? state.token : null;
  const waiting = state.kind === 'sent';
  useEffect(() => {
    if (token === null) return undefined;
    const check = () => {
      const at = testAlertArrivedAt(token);
      if (at !== null) dispatch({ type: 'arrived', token, at });
    };
    const stop = watchTestAlerts(check);
    check();
    if (!waiting) return stop;
    const look = setInterval(() => {
      if (AppState.currentState === 'active') void requestInboxImport();
    }, TEST_ALERT_LOOK_MS);
    const out = setTimeout(() => {
      dispatch({ type: 'timedOut', token });
      // Posting may have been switched off since: then that is what stands in the way.
      void refreshReminderPermission().then((permission) => {
        if (permission !== null && permission !== 'granted') {
          dispatch({ type: 'blocked', canAsk: permission === 'ask' });
        }
      });
    }, TEST_ALERT_WAIT_MS);
    return () => {
      stop();
      clearInterval(look);
      clearTimeout(out);
    };
  }, [token, waiting]);

  // Back from the phone's settings with notifications on: nothing stands in the way any more.
  const blocked = state.kind === 'blocked';
  useEffect(() => {
    if (!blocked) return undefined;
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      void refreshReminderPermission().then((permission) => {
        if (permission === 'granted') dispatch({ type: 'allowed' });
      });
    });
    return () => sub.remove();
  }, [blocked]);

  const arrived = state.kind === 'arrived';
  useEffect(() => {
    if (arrived) haptics.success();
  }, [arrived]);

  return { available: testAlertAvailable, state, send, allow };
}
