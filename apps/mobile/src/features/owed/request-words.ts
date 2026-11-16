import { localDateOf, type LocalDate, type OwedPerson, type OwedRow } from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';

/** The rows of a person's strips that are requests to be paid, oldest first. */
export function requestsOf(
  person: Pick<OwedPerson, 'lines'>,
  rows: ReadonlyMap<string, OwedRow>,
): OwedRow[] {
  return person.lines
    .flatMap((line) => {
      const row = rows.get(line.id);
      return row && row.code != null ? [row] : [];
    })
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}

/** Whether a person is a shop or a company: any of their requests says so. */
export function isCompany(person: Pick<OwedPerson, 'lines'>, rows: ReadonlyMap<string, OwedRow>) {
  return requestsOf(person, rows).some((row) => row.company === true);
}

/** The day a request was asked, as the phone's calendar has it. */
export function askedOn(row: Pick<OwedRow, 'askedAt' | 'day'>): LocalDate {
  return row.askedAt ? localDateOf(new Date(row.askedAt)) : row.day;
}

const noon = (day: LocalDate) => new Date(`${day}T12:00:00`);

/** "Mon 16" where the weekday is short, else "16/11": the line under a strip. */
export function shortDay(day: LocalDate, language: Language): string {
  const locale = localeOf(language);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' })
    .format(noon(day))
    .replace(',', '');
  return weekday.length <= 6
    ? weekday
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }).format(noon(day));
}

/** "27 Oct", as a request's age is said: in the strip's line, the reminder and the close. */
export function dayMonthOf(day: LocalDate, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), { day: 'numeric', month: 'short' }).format(
    noon(day),
  );
}

/** What a request's strip says it was: its job, upper case. */
export function requestWhat(row: Pick<OwedRow, 'job'>, language: Language): string {
  return (row.job ?? '').toLocaleUpperCase(localeOf(language));
}
