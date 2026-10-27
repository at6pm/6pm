import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { lastAlertSchema, type LastAlert } from '@6pm/domain';

import { surfaces } from '../../../modules/surfaces';
import type { I18n } from '../../i18n/i18n';

/** The last alert's line, read from what the shortcut left: "Last: MB Bank · 50.000₫ · 12:30". */
export function lastAlertLine(
  last: LastAlert,
  t: I18n['t'],
  time: (iso: string) => string,
): string {
  const what = last.skipped
    ? t(`capture.alerts.skip.${last.skipped}`)
    : last.direction === 'in'
      ? t('capture.alerts.cameIn', { amount: last.amountText })
      : last.amountText;
  const name = [last.bank, what].filter((part) => part !== null && part !== '').join(' · ');
  return t('capture.last', { name, time: time(last.at) });
}

/** The status file's text as a last alert, or null when there is none or it is not one. */
export function readLastAlert(json: string | null | undefined): LastAlert | null {
  if (!json) return null;
  try {
    const parsed = lastAlertSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * The last bank or wallet alert the shortcut read, caught or skipped: read when the screen
 * opens and each time the app comes back, since alerts arrive while 6pm is closed.
 */
export function useLastAlert(): LastAlert | null {
  const [last, setLast] = useState<LastAlert | null>(null);
  useEffect(() => {
    const native = surfaces;
    if (!native?.readStatus) return;
    let live = true;
    const load = () => {
      native
        .readStatus?.('last-alert')
        .then((json) => {
          if (live) setLast(readLastAlert(json));
        })
        .catch(() => undefined);
    };
    load();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return last;
}
