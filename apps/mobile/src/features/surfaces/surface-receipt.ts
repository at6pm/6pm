import { todayReceipt, type MoneyFormat, type SurfaceSnapshot } from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';
import { paperInk } from '@6pm/theme';

import type { MoneySnapshot } from '../../data/money-store';
import type { I18n } from '../../i18n/i18n';

/** The medium receipt prints this many of today's lines; earlier ones fold into "+N more". */
export const RECEIPT_LINES = 4;

/**
 * Today's receipt, printing as the day's spends are caught: its head ("FRI 9 OCT · TODAY SO FAR"
 * and the close receipt's Nº), the newest lines oldest first with their times, the shop in
 * capitals and the amount, and what is left at its foot.
 */
export function receiptOf(input: {
  readonly money: MoneySnapshot;
  /** Evenings closed before today, for the receipt's number. */
  readonly closedBefore: number;
  readonly t: I18n['t'];
  readonly language: Language;
  readonly format: MoneyFormat;
}): NonNullable<SurfaceSnapshot['receipt']> {
  const { money, t, language, format } = input;
  const locale = localeOf(language);
  const receipt = todayReceipt({
    spends: money.cycleSpends,
    today: money.today,
    closedBefore: input.closedBefore,
    most: RECEIPT_LINES,
  });
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${money.today}T12:00:00`));
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return {
    day: money.today,
    title: t('widgets.receipt.title', { date }).toLocaleUpperCase(locale),
    number: t('widgets.receipt.no', { no: String(receipt.number).padStart(3, '0') }),
    lines: receipt.lines.map(({ spend, confirmed }) => ({
      time: time.format(new Date(spend.at)),
      name: spend.merchant.toLocaleUpperCase(locale),
      amount: format.number(spend.amount),
      confirmed,
    })),
    earlier: receipt.earlier > 0 ? t('surfaces.more', { count: receipt.earlier }) : '',
    empty: t('widgets.receipt.empty'),
    left: t('widgets.receipt.left').toLocaleUpperCase(locale),
    paper: {
      sheet: paperInk.sheet,
      ink: paperInk.ink,
      soft: paperInk.soft,
      rule: paperInk.rule,
      stamp: paperInk.stamp,
      edge: paperInk.edgeShadow,
    },
  };
}
