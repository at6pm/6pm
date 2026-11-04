import { useMemo } from 'react';

import { isTripJar, monthsBetween, parts, type LocalDate, type MoneyFormat } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useI18n, type I18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import type { OwnJar, ShelfJar } from './use-jars';

function monthDate(month: string): Date {
  const [y = 2000, m = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

function dayDate(day: LocalDate): Date {
  const { year, month, day: d } = parts(day);
  return new Date(Date.UTC(year, month - 1, d));
}

/** How the jar screens write months, days and money, in the interface language. */
export function useJarFormat() {
  const { language } = useI18n();
  const money = useMoneyFormat();
  return useMemo(() => {
    const locale = localeOf(language);
    const f = (o: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o });
    // Vietnamese writes a month as "tháng 3", where the short form would read "thg 3".
    const month = f({ month: language === 'vi' ? 'long' : 'short' });
    const monthYear = f({ month: language === 'vi' ? 'long' : 'short', year: 'numeric' });
    const chip = f({ month: 'short' });
    // Inside a line Vietnamese months are lower case: "từ tháng 3", "Đã qua tháng 11".
    const lower = (s: string) => (language === 'vi' ? s.toLocaleLowerCase('vi') : s);
    const day = f({ weekday: 'short', day: 'numeric', month: 'short' });
    return {
      money,
      /** "Feb", "Oct 2027": a jar's month, with its year once it is a year or more away. */
      month: (m: string, now: string) =>
        lower((monthsBetween(now, m) >= 12 ? monthYear : month).format(monthDate(m))),
      /** "Nov", for New jar's chips. */
      chip: (m: string) => chip.format(monthDate(m)),
      /** "Wed 30 Sep". */
      day: (d: LocalDate) => day.format(dayDate(d)),
    };
  }, [language, money]);
}

export type JarFormat = ReturnType<typeof useJarFormat>;

/** The line under a jar's name in the Pots list (and its edge state, drawn on the jar). */
export function listLine(
  jar: ShelfJar,
  t: I18n['t'],
  format: JarFormat,
  now: string,
): { readonly text: string; readonly tone: 'soft' | 'warm' | 'full' } {
  const short = (n: number) => format.money.short(n);
  if (jar.kind === 'shared') {
    return {
      text: t('pots.list.shared', { name: jar.partnerName ?? jar.partnerInitial }),
      tone: 'soft',
    };
  }
  const state = stateLine(jar, t, format, now);
  if (state) return state;
  const date = jar.pot.neededBy === null ? null : format.month(jar.pot.neededBy, now);
  if (jar.fill === 'byHand') {
    return {
      text: date ? t('pots.list.byHandDate', { date }) : t('pots.list.byHand'),
      tone: 'soft',
    };
  }
  if (jar.each <= 0) return { text: t('pots.list.eachAlone'), tone: 'soft' };
  return {
    text: date
      ? t('pots.list.eachDate', { amount: short(jar.each), date })
      : t('pots.list.each', { amount: short(jar.each) }),
    tone: 'soft',
  };
}

/** An edge state in words: "Not this month", "Nov passed · 4,8tr of 6tr", "12,6tr · full". */
export function stateLine(
  jar: OwnJar,
  t: I18n['t'],
  format: JarFormat,
  now: string,
): { readonly text: string; readonly tone: 'soft' | 'warm' | 'full' } | null {
  const short = (n: number) => format.money.short(n);
  switch (jar.state) {
    case 'paused':
      return { text: t('pots.state.paused'), tone: 'soft' };
    case 'full':
      return { text: t('pots.state.full', { amount: short(jar.saved) }), tone: 'full' };
    case 'empty':
      return {
        text: isTripJar(jar.pot) ? t('pots.state.emptyTrip') : t('pots.state.empty'),
        tone: 'soft',
      };
    case 'pastDate':
      return {
        text: t('pots.state.pastDate', {
          date: format.month(jar.pot.neededBy ?? '', now),
          saved: short(jar.saved),
          target: short(jar.target),
        }),
        tone: 'warm',
      };
    case 'normal':
      return null;
  }
}

/** The saved amount and "of {target}" a list row or page writes, in the jar's own money. */
export function savedWords(
  jar: ShelfJar,
  money: MoneyFormat,
  t: I18n['t'],
): { readonly saved: string; readonly of: string } {
  const m = jar.kind === 'shared' ? jar.money : money;
  return {
    saved: m.short(jar.saved),
    of: jar.target > 0 ? t('pots.list.of', { amount: m.short(jar.target) }) : '',
  };
}
