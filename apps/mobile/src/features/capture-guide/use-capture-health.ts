import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { addDays, localDateOf } from '@6pm/domain';

import { catchesSince, type CatchSeen } from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useHomeCurrency } from '../../money/use-money-format';
import { useAiMode } from '../privacy/use-ai-mode';
import { nativeReach } from '../surfaces/native-reach';
import { useAlertAccess } from './alert-access';
import { healthRows, HEALTH_WAYS, type HealthRow, type HealthWay } from './capture-health-rows';
import { useLastAlert } from './last-alert';

/** Catches are read this far back: the heartbeat's 14 days and the fortnight before a quiet way. */
const LOOK_BACK_DAYS = 30;

/**
 * Each way's 14-day heartbeat for Settings, counted on the phone from what it caught: read when
 * Settings opens, when a catch changes the day, and each time the app comes back.
 */
export function useCaptureHealth(): readonly HealthRow[] {
  const store = useMoneyStore();
  const { today, cycleSpends, waitingBefore } = useMoney();
  const home = useHomeCurrency();
  const aiMode = useAiMode();
  const alertAccess = useAlertAccess();
  const lastAlert = useLastAlert();
  const [catches, setCatches] = useState<readonly CatchSeen[]>([]);
  const [returned, setReturned] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setReturned((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let live = true;
    const [year = 0, month = 1, day = 1] = addDays(today, -LOOK_BACK_DAYS).split('-').map(Number);
    void catchesSince(store.db, new Date(year, month - 1, day).toISOString())
      .then((rows) => {
        if (live) setCatches(rows);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, today, cycleSpends, waitingBefore, returned]);

  return useMemo(() => {
    const has: Readonly<Record<HealthWay, boolean>> = {
      scan: nativeReach.scan && home.code === 'VND',
      share: nativeReach.share,
      alerts: nativeReach.bankAlerts,
      email: true,
      voice: true,
      wallet: nativeReach.wallet,
    };
    const off: HealthWay[] = [];
    if (aiMode === 'device') off.push('email');
    if (alertAccess === false) off.push('alerts');
    return healthRows({
      catches,
      today,
      ways: HEALTH_WAYS.filter((way) => has[way]),
      lastAlert: lastAlert
        ? { day: localDateOf(new Date(lastAlert.at)), at: lastAlert.at, bank: lastAlert.bank }
        : null,
      off,
    });
  }, [catches, today, home, aiMode, alertAccess, lastAlert]);
}
