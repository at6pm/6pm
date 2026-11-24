import type { LocalDate } from '@6pm/domain';

const noon = (day: LocalDate) => new Date(`${day}T12:00:00`);

/**
 * Whether a locale writes the month before the day ("10月26日", "10월 26일") or after it
 * ("26 Oct", "26. Okt."), read from how it writes the 25th of December in numbers.
 */
export function monthComesFirst(locale: string): boolean {
  const text = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(2026, 11, 25, 12));
  const month = text.indexOf('12');
  const day = text.indexOf('25');
  return month >= 0 && day >= 0 && month < day;
}

/**
 * The Diary's labels that join a day to its month, in the order the locale writes them: a day's
 * stamp and a run of days.
 */
export function diaryDateLabels(locale: string) {
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options);
  const weekdayShort = format({ weekday: 'short' });
  const twoDigit = format({ day: '2-digit' });
  const numeric = format({ day: 'numeric' });
  const monthShort = format({ month: 'short' });
  const dayMonth = format({ day: 'numeric', month: 'short' });
  const weekdayDayMonth = format({ weekday: 'short', day: 'numeric', month: 'short' });
  const monthFirst = monthComesFirst(locale);

  /** The day as the locale writes it beside a month: "26", German "26.", Japanese "26日". */
  const dayOf = (day: LocalDate): string => {
    if (monthFirst) return numeric.format(noon(day));
    const parts = dayMonth.formatToParts(noon(day));
    const at = parts.findIndex((part) => part.type === 'day');
    const after = parts[at + 1];
    const mark = after?.type === 'literal' ? after.value.trimEnd() : '';
    return `${parts[at]?.value ?? numeric.format(noon(day))}${mark}`;
  };

  return {
    /** "WED 07 OCT"; with the month first, the locale's own "10月7日(水)". */
    stamp: (day: LocalDate): string =>
      monthFirst
        ? weekdayDayMonth.format(noon(day))
        : `${weekdayShort.format(noon(day))} ${twoDigit.format(noon(day))} ${monthShort.format(noon(day))}`.toLocaleUpperCase(),
    /**
     * "5–9 OCT", or "28 SEP – 2 OCT" across a month end ("5–9 Oct" when not shouted). With the
     * month first it leads and is said once: "10月26日–31日".
     */
    range: (from: LocalDate, to: LocalDate, shout = true): string => {
      const text =
        from.slice(0, 7) !== to.slice(0, 7)
          ? `${dayMonth.format(noon(from))} – ${dayMonth.format(noon(to))}`
          : monthFirst
            ? from === to
              ? dayMonth.format(noon(to))
              : `${dayMonth.format(noon(from))}–${dayOf(to)}`
            : from === to
              ? `${dayOf(to)} ${monthShort.format(noon(to))}`
              : `${dayOf(from)}–${dayOf(to)} ${monthShort.format(noon(to))}`;
      return shout ? text.toLocaleUpperCase() : text;
    },
  };
}
