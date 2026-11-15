import { localeOf, type Language } from '@6pm/i18n';

/**
 * The time printed at the top right of Quick add's ticket: "Sat, 14 Nov · 18:07". Vietnamese
 * writes the date in numbers ("T7 14/11 · 18:07"), so the ticket's header fits on one line.
 */
export function ticketStamp(now: Date, language: Language): string {
  const locale = localeOf(language);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  const date =
    language === 'vi'
      ? `${viWeekday(now.getDay())} ${now.getDate()}/${now.getMonth() + 1}`
      : new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(now);
  return `${date} · ${time}`;
}

/**
 * Vietnamese numbers its weekdays, Monday "thứ hai" (T2) to Saturday "thứ bảy" (T7), and writes
 * Sunday "CN": the short form calendars print. Engines disagree ("T7", "Th 7", "Thứ 7"), so it
 * is written here.
 */
function viWeekday(day: number): string {
  return day === 0 ? 'CN' : `T${day + 1}`;
}

/** "THU 31 DEC", or in Vietnamese "THỨ NĂM 31/12": the last day money that landed now covers. */
export function coveredDate(day: string, language: Language): string {
  const locale = localeOf(language);
  const date = new Date(`${day}T12:00:00`);
  const text =
    language === 'vi'
      ? `${new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)} ${date.getDate()}/${date.getMonth() + 1}`
      : new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(date);
  return text.toLocaleUpperCase(locale);
}
