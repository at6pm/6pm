import {
  clockOf,
  hoursOf,
  lineUsed,
  widgetHours,
  type DailyNumber,
  type LocalDate,
  type MoneyFormat,
  type SurfaceSnapshot,
} from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';
import { widgetSunAt, widgetSunKind, type LookId } from '@6pm/theme';

import type { I18n } from '../../i18n/i18n';

type Card = NonNullable<SurfaceSnapshot['entries'][number]['card']>;

/** What the widgets show in place of an amount while the phone is locked. */
export const HIDDEN = '•••';

/** When a money day begins on the phone's clock: 04:00 (see `moneyDayOf`). */
export function moneyDayStart(day: LocalDate): Date {
  return new Date(`${day}T04:00:00`);
}

/** A money day's moment at a decimal hour of its calendar day: 16.5 is 16:30. */
export function momentOf(day: LocalDate, hour: number): Date {
  return new Date(`${day}T${clockOf(hour)}:00`);
}

export interface CardDay {
  readonly date: LocalDate;
  readonly number: DailyNumber;
  /** Spends counted today, for "3 caught". */
  readonly caught: number;
  /** Waiting for the close ("4 waiting for the close"). */
  readonly waiting: number;
}

export interface CardContext {
  readonly t: I18n['t'];
  readonly language: Language;
  readonly format: MoneyFormat;
  /** 'HH:MM': when the person closes. */
  readonly closeAt: string;
  /** The look the widgets wear: Golden Hour's sun moves through the day, the others' stay clear. */
  readonly look?: LookId;
}

/** Sentence-case words set in capitals, as the kickers are, in the app's language. */
function capitals(words: string, language: Language): string {
  return words.toLocaleUpperCase(localeOf(language));
}

/** "351.000" (or "$35.10"): the medium widget's number, its symbol left off when it trails. */
function bareNumber(format: MoneyFormat, amount: number): string {
  const { prefix, number } = format.parts(amount);
  return `${prefix}${number}`;
}

/**
 * The postcard of one stretch of a day: before the close, from the close until it is made, or
 * once it is made (then the numbers are tomorrow's, `next`).
 */
export function cardOf(
  phase: Card['phase'],
  hour: number,
  day: CardDay,
  context: CardContext,
  closed: { readonly at: string; readonly next: DailyNumber } | null,
): Card {
  const { t, language, format, closeAt } = context;
  const locale = localeOf(language);
  const when = new Date(`${day.date}T12:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(when);
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(when);
  const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(when);
  const shown = phase === 'closed' && closed ? closed.next : day.number;
  const safe = Math.max(0, shown.safe);
  const short = format.short(safe);
  const sun = widgetSunAt(hour, context.look);
  const sunKind = widgetSunKind(hour, hoursOf(closeAt));
  const base = {
    phase,
    hour,
    number: bareNumber(format, safe),
    amount: format.full(safe),
    sun,
    sunKind,
  };
  if (phase === 'closed' && closed) {
    const time = closed.at;
    return {
      ...base,
      kicker: capitals(t('widgets.kicker.closed'), language),
      kickerShort: capitals(t('widgets.kickerShort.closed'), language),
      sub: t('widgets.sub.closedAt', { time }),
      subShort: t('widgets.subShort.closed', { time }),
      inline: t('widgets.inline.closed', { amount: short }),
      inlineHidden: t('widgets.inline.closed', { amount: HIDDEN }),
      lockSub: t('widgets.lock.closed'),
      tonight: t('widgets.tonight.closed', { time }),
      used: 0,
      closedAt: time,
    };
  }
  const inline = {
    inline: t('widgets.inline.left', { date, amount: short }),
    inlineHidden: t('widgets.inline.left', { date, amount: HIDDEN }),
    used: lineUsed(day.number),
  };
  if (phase === 'due') {
    const waiting = day.waiting;
    return {
      ...base,
      ...inline,
      kicker: capitals(t('widgets.kicker.due'), language),
      kickerShort: capitals(t('widgets.kickerShort.due'), language),
      sub: waiting > 0 ? t('widgets.sub.waiting', { count: waiting }) : t('widgets.sub.ready'),
      subShort: t('widgets.subShort.due'),
      lockSub: waiting > 0 ? t('widgets.lock.due', { count: waiting }) : t('widgets.lock.dueReady'),
      tonight:
        waiting > 0 ? t('widgets.tonight.confirm', { count: waiting }) : t('widgets.tonight.ready'),
    };
  }
  const spent = day.number.spent;
  return {
    ...base,
    ...inline,
    kicker: capitals(t('widgets.kicker.day', { weekday }), language),
    kickerShort: capitals(t('widgets.kickerShort.day', { weekday: weekdayShort }), language),
    sub:
      spent > 0
        ? t('widgets.sub.used', { used: format.short(spent), count: day.caught })
        : t('widgets.sub.untouched'),
    subShort: spent > 0 ? t('widgets.subShort.left') : t('widgets.subShort.safe'),
    lockSub: t('widgets.lock.closeAt', { time: closeAt }),
    tonight: t('widgets.tonight.closeAt', { time: closeAt }),
  };
}

/**
 * The stretches of one money day the widgets turn at: from 04:00, then 07:00, 10:00, 13:00,
 * 16:30, the close and 21:00. A day already closed is closed from its first stretch.
 */
export function dayStretches(
  day: CardDay,
  context: CardContext,
  closed: { readonly at: string; readonly next: DailyNumber } | null,
): { readonly from: Date; readonly card: Card }[] {
  const close = hoursOf(context.closeAt);
  const hours = [4, ...widgetHours(context.closeAt)];
  return hours.map((hour) => {
    const phase: Card['phase'] = closed ? 'closed' : hour >= close ? 'due' : 'day';
    return {
      from: hour === 4 ? moneyDayStart(day.date) : momentOf(day.date, hour),
      card: cardOf(phase, hour, day, context, closed),
    };
  });
}
