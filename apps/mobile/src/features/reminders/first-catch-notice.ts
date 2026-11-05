import { useEffect, useMemo, useState } from 'react';

import { firstCaughtSince } from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { firstCatchWords, toneOf } from './notification-words';
import { useNotificationSettings } from './notification-prefs';
import { useReminderPermission } from './reminder-permission';

/** Every spend ever made counts: the first catch is the first one on this phone. */
const EVER = '1970-01-01T00:00:00.000Z';

/**
 * The first catch's words while it is still to come, for the alert reader and the Wallet shortcut
 * to say once, at the catch, while 6pm is away: "Caught your first one: 1.000đ · MB. That's all it
 * takes." Null once anything was ever caught, with Capture switched off, or with notifications not
 * allowed, and then nothing is said. The native side says it once ever.
 */
export function useFirstCatchNotice(): { readonly named: string; readonly noName: string } | null {
  const store = useMoneyStore();
  const { plan, cycleSpends } = useMoney();
  const { t } = useI18n();
  const { settings } = useNotificationSettings();
  const permission = useReminderPermission();
  const [caught, setCaught] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    firstCaughtSince(store, EVER)
      .then((row) => live && setCaught(row !== null))
      .catch(() => live && setCaught(null));
    return () => {
      live = false;
    };
  }, [store, cycleSpends]);

  return useMemo(() => {
    if (caught !== false || settings === null || !settings.on.capture) return null;
    if (permission !== 'granted') return null;
    return firstCatchWords({ t, tone: toneOf(plan), amounts: settings.amounts });
  }, [caught, settings, permission, t, plan]);
}
