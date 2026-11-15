import { useMemo } from 'react';

import { parts, type LocalDate } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useI18n } from '../../i18n/i18n';

function dateOf(day: LocalDate): Date {
  const { year, month, day: d } = parts(day);
  return new Date(Date.UTC(year, month - 1, d));
}

function monthDate(month: string): Date {
  const [y = 0, m = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

/** Dates and months as the Plan tab writes them, in the interface language. */
export function usePlanFormat(today: LocalDate) {
  const { language } = useI18n();
  return useMemo(() => {
    const locale = localeOf(language);
    const f = (o: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o });
    const longMonth = f({ month: 'long' });
    const longMonthYear = f({ month: 'long', year: 'numeric' });
    const shortMonth = f({ month: 'short' });
    const shortMonthYear = f({ month: 'short', year: 'numeric' });
    const dayShortMonth = f({ day: 'numeric', month: 'short' });
    const dayLongMonth = f({ day: 'numeric', month: 'long' });
    const weekday = f({ weekday: 'short' });
    const weekdayLong = f({ weekday: 'long' });
    const vi = language === 'vi';
    const thisYear = today.slice(0, 4);
    const sameYear = (month: string) => month.slice(0, 4) === thisYear;
    return {
      /** "October" */
      month: (day: LocalDate) => longMonth.format(dateOf(day)),
      /** "November", "January 2027" */
      monthLong: (month: string) =>
        (sameYear(month) ? longMonth : longMonthYear).format(monthDate(month)),
      /** "Dec", "Nov 2027" */
      monthShort: (month: string) =>
        (sameYear(month) ? shortMonth : shortMonthYear).format(monthDate(month)),
      /** "1 Oct" */
      dayMonth: (day: LocalDate) => dayShortMonth.format(dateOf(day)),
      /** "9 October" */
      dayLongMonth: (day: LocalDate) => dayLongMonth.format(dateOf(day)),
      /** "1", or "30 Sept" when the cycle began last month */
      dayFrom: (day: LocalDate, to: LocalDate) =>
        day.slice(0, 7) === to.slice(0, 7)
          ? String(parts(day).day)
          : dayShortMonth.format(dateOf(day)),
      /** "Fri 9" */
      weekdayDay: (day: LocalDate) => `${weekday.format(dateOf(day))} ${parts(day).day}`,
      /** "Fri 20", "thứ Sáu 20": a day ahead inside a sentence. */
      dayAhead: (day: LocalDate) => {
        if (!vi) return `${weekday.format(dateOf(day))} ${parts(day).day}`;
        const name = weekdayLong.format(dateOf(day));
        return `${name.charAt(0).toLowerCase()}${name.slice(1)} ${parts(day).day}`;
      },
      /** "Fri 20 Nov", "thứ Sáu 20/11". */
      dayAheadMonth: (day: LocalDate) => {
        const { day: d, month } = parts(day);
        if (!vi) return `${weekday.format(dateOf(day))} ${dayShortMonth.format(dateOf(day))}`;
        const name = weekdayLong.format(dateOf(day));
        return `${name.charAt(0).toLowerCase()}${name.slice(1)} ${d}/${month}`;
      },
      /** "30 Nov", "30/11". */
      dayMonthShort: (day: LocalDate) =>
        vi ? `${parts(day).day}/${parts(day).month}` : dayShortMonth.format(dateOf(day)),
      /** "Friday", "thứ Sáu". */
      weekdayName: (day: LocalDate) => {
        const name = weekdayLong.format(dateOf(day));
        return vi ? `${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;
      },
      dayNumber: (day: LocalDate) => String(parts(day).day),
      /** "Oct", for a month wheel: `index` 0 is January */
      monthOfYear: (index: number) => shortMonth.format(new Date(Date.UTC(2000, index, 1))),
    };
  }, [language, today]);
}

export type PlanFormat = ReturnType<typeof usePlanFormat>;
