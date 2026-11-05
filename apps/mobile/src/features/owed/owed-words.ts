import { localeOf, type Language } from '@6pm/i18n';

import type { OwedLine } from '@6pm/domain';

/** What a strip says it was: the shop's first word and the day, "LẨU · SAT 3". */
export function slipWhat(
  line: Pick<OwedLine, 'day'>,
  merchant: string | undefined,
  language: Language,
): string {
  const date = new Date(`${line.day}T12:00:00`);
  const locale = localeOf(language);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' })
    .format(date)
    .replace(',', '');
  // "SAT 3" where the weekday is short; "3/11" where it is a word or two ("Thứ Ba 3").
  const day =
    weekday.length <= 6
      ? weekday
      : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric' }).format(date);
  const shop = (merchant ?? '').trim().split(/\s+/)[0] ?? '';
  return [shop, day].filter(Boolean).join(' · ').toLocaleUpperCase(localeOf(language));
}

/**
 * What settling from the person sheet just did, so the owed list can stamp the strips PAID (or
 * slide them away, covered) as they leave, rather than have them vanish.
 */
let lastSettled: { readonly ids: ReadonlySet<string>; readonly paid: boolean } | null = null;

export function noteSettled(ids: readonly string[], paid: boolean): void {
  lastSettled = { ids: new Set(ids), paid };
}

/** Whether a strip that just left was paid (stamped) or covered; null when it left otherwise. */
export function wasPaid(id: string): boolean | null {
  if (!lastSettled?.ids.has(id)) return null;
  return lastSettled.paid;
}
