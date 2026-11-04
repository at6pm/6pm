import { useCallback, useMemo } from 'react';

import { localeOf } from '@6pm/i18n';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { dateOf } from '../onboarding/since-payday';

/** A count of lines written as the money is: "4.812" in đồng, "4,812" on an English dollar phone. */
export function useCount(): (n: number) => string {
  const money = useMoneyFormat();
  return useCallback(
    (n: number) => money.number(Math.round(n) * money.currency.minorPerMajor),
    [money],
  );
}

/** A day's month in the app's language: short ("Mar 2019") for the box, long for "Back to…". */
export function useMonthLabel(): { short: (day: string) => string; long: (day: string) => string } {
  const { language } = useI18n();
  return useMemo(() => {
    const locale = localeOf(language);
    const short = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });
    const long = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    return {
      short: (day: string) => short.format(dateOf(day)),
      long: (day: string) => long.format(dateOf(day)),
    };
  }, [language]);
}
