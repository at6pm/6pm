import {
  addDays,
  DEFAULT_CLOSE_AT,
  lineUsed,
  payCycleOn,
  SURFACES_VERSION,
  type ClosedDayRow,
  type DailyNumber,
  type LocalDate,
  type LunarTradition,
  moneyFormat,
  moneyLocale,
  VND,
  type MoneyFormat,
  type SpendRow,
  type SurfaceSnapshot,
} from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';

import { dayOf, waitingOf, type MoneySnapshot } from '../../data/money-store';
import type { I18n } from '../../i18n/i18n';
import { companionMood } from '../../ui/companion/companion-mood';
import { isSymbolName } from '../../ui/icons/symbol';
import { merchantIcon } from '../today/merchant-icon';
import { dayStretches, HIDDEN, type CardContext, type CardDay } from './surface-cards';
import { monthCardOf, streakOf } from './surface-days';
import { glyphOf } from './surface-glyph';
import { surfaceJars } from './surface-jars';
import { surfaceLook } from './surface-look';
import { displayFamily, hourlyPalettes, tileColours, type WidgetLook } from './surface-palette';

export { glyphOf } from './surface-glyph';
export { moneyDayStart } from './surface-cards';

type Entry = SurfaceSnapshot['entries'][number];
type Row = Entry['list'][number];

/** The large widget lists this many of today's spends, then "+N more". */
export const LIST_ROWS = 3;

/**
 * The money as it will stand when the next money day begins, if nothing else happens: today's
 * spends become "spent before", and a payday in between starts a fresh cycle. The domain's own
 * daily number then works out tomorrow's line from it.
 */
export function nextMoneyDay(money: MoneySnapshot): MoneySnapshot {
  const today = addDays(money.today, 1);
  const cycle = payCycleOn(today, money.plan?.payday ?? { kind: 'lastDay' });
  const sameCycle = cycle.start === money.cycle.start;
  return {
    ...money,
    today,
    cycle,
    cycleSpends: sameCycle ? money.cycleSpends : [],
    topUpsThisCycle: sameCycle ? money.topUpsThisCycle : 0,
  };
}

interface TodayList {
  readonly rows: Row[];
  readonly hues: number[];
  readonly total: number;
  readonly restText: string;
}

const NO_LIST: TodayList = { rows: [], hues: [], total: 0, restText: '' };

function rowsOf(money: MoneySnapshot, format: MoneyFormat): TodayList {
  const categories = new Map(money.categories.map((c) => [c.id, c]));
  const todays = money.cycleSpends.filter(
    (s) => s.day === money.today && s.status !== 'skipped' && s.status !== 'deleted',
  );
  const rows = todays.slice(0, LIST_ROWS).map((s): Row => {
    const category = categories.get(s.categoryId);
    const categoryIcon = category && isSymbolName(category.icon) ? category.icon : 'payments';
    return {
      name: s.merchant,
      amountText: format.full(s.amount),
      icon: glyphOf(merchantIcon(s.merchant, categoryIcon)),
      hue: category?.hue ?? 80,
      pending: s.status === 'pending',
    };
  });
  const rest = todays.slice(LIST_ROWS).reduce((sum, s) => sum + s.amount, 0);
  return {
    rows,
    hues: rows.map((r) => r.hue),
    total: todays.length,
    restText: rest > 0 ? format.full(rest) : '',
  };
}

/** QR payments handed to a bank and not yet confirmed: the "2 pending" on the widgets. */
export function pendingCount(money: MoneySnapshot): number {
  return waitingOf(money).filter((s: SpendRow) => s.status === 'pending').length;
}

function entryOf(
  day: DailyNumber,
  from: Date,
  list: TodayList,
  pending: number,
  t: I18n['t'],
  format: MoneyFormat,
  card: Entry['card'],
): Entry {
  const safeShort = format.short(Math.max(0, day.safe));
  const more = list.total - list.rows.length;
  return {
    from: from.toISOString(),
    safeText: t('surfaces.amountLeft', { amount: safeShort }),
    safeShort,
    tomorrowText: t('today.tomorrowAbout', { amount: format.short(day.tomorrow) }),
    pendingText: pending > 0 ? t('surfaces.pending', { count: pending }) : '',
    ringFraction: day.safe < 0 ? 0 : 1 - lineUsed(day),
    list: list.rows,
    moreText: more > 0 ? t('surfaces.more', { count: more }) : '',
    spentText: t('surfaces.spent', { amount: format.short(day.spent) }),
    lineText: t('surfaces.ofLine', { amount: format.short(day.line) }),
    spentFraction: lineUsed(day),
    moreAmountText: more > 0 ? list.restText : '',
    ...(card ? { card } : {}),
  };
}

/** "18:04": when a day was closed, on the phone's clock. */
function closedTime(row: ClosedDayRow, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(row.closedAt));
}

export interface SnapshotInput {
  readonly money: MoneySnapshot;
  readonly look: WidgetLook;
  /** The look id when the user has Max (widgets in their look), else null. */
  readonly maxLook: string | null;
  readonly t: I18n['t'];
  /** Money in the home currency, the app's language and the phone's number style. */
  readonly format?: MoneyFormat;
  /** The app's language; English when not given. */
  readonly language?: Language;
  readonly writtenAt: Date;
  /**
   * Closed days further back than the money snapshot holds, for the streak (any order); the
   * snapshot's own are used when left out.
   */
  readonly closedHistory?: readonly ClosedDayRow[];
  /** The first day 6pm has anything for (`readFirstDay`): days before it were never missed. */
  readonly since?: LocalDate | null;
  /** Whose Lunar New Year the person keeps: the season's jar counts down to its mùng 1. */
  readonly tradition?: LunarTradition | null;
  /** Amounts stay hidden on the widgets until the phone is unlocked. */
  readonly hideAmounts?: boolean;
  /** Development builds: the clock the app is pinned to, which the widgets then follow. */
  readonly pinnedAt?: Date | null;
}

/**
 * What the widgets draw, worked out by the app: the postcard of each stretch of today and of
 * tomorrow (07:00, 10:00, 13:00, 16:30, the close and 21:00), so the widgets turn without the
 * app; the look's colours for every hour and its widget materials; the jars, the streak and the
 * month; and every word in the app's language. Before the month is set up there are no entries
 * and the widgets ask to open 6pm.
 */
export function surfaceSnapshot(input: SnapshotInput): SurfaceSnapshot {
  const { money, look, t } = input;
  const language = input.language ?? 'en';
  const format = input.format ?? moneyFormat(moneyLocale(VND, language));
  const today = dayOf(money);
  const pending = pendingCount(money);
  const list = rowsOf(money, format);
  const closeAt = money.plan?.closeAt ?? DEFAULT_CLOSE_AT;
  const context: CardContext = { t, language, format, closeAt, look: look.look };
  const closedRow = money.closedDays.find((d) => d.day === money.today) ?? null;
  const entries: Entry[] = [];
  if (today !== null) {
    const next = nextMoneyDay(money);
    const tomorrow = dayOf(next);
    const todayCard: CardDay = {
      date: money.today,
      number: today,
      caught: list.total,
      waiting: waitingOf(money).length,
    };
    const closed =
      closedRow && tomorrow ? { at: closedTime(closedRow, language), next: tomorrow } : null;
    for (const { from, card } of dayStretches(todayCard, context, closed)) {
      // After the close the widgets carry tomorrow's number, and its line is untouched.
      const shown = closed ? tomorrow : today;
      if (shown === null) continue;
      entries.push(entryOf(shown, from, closed ? NO_LIST : list, pending, t, format, card));
    }
    if (tomorrow !== null) {
      const nextCard: CardDay = { date: next.today, number: tomorrow, caught: 0, waiting: 0 };
      for (const { from, card } of dayStretches(nextCard, context, null)) {
        entries.push(entryOf(tomorrow, from, NO_LIST, pending, t, format, card));
      }
    }
  }
  const closedDays = input.closedHistory ?? money.closedDays;
  const withToday =
    closedRow && !closedDays.some((d) => d.day === closedRow.day)
      ? [...closedDays, closedRow]
      : closedDays;
  return {
    v: SURFACES_VERSION,
    writtenAt: input.writtenAt.toISOString(),
    maxLook: input.maxLook,
    serious: look.serious,
    entries,
    palettes: hourlyPalettes(look).map(({ hour, tokens }) => ({
      hour,
      tokens: {
        ...tokens,
        mood: companionMood({
          hour,
          serious: look.serious,
          safe: today?.safe ?? 0,
          toast: false,
          closed: closedRow !== null,
        }),
      },
    })),
    strings: {
      safeToSpend: t('today.safeToSpend'),
      safeTodayShort: t('surfaces.safeTodayShort'),
      brandSafe: t('surfaces.brandSafe'),
      left: t('surfaces.left'),
      today: t('surfaces.today'),
      scanQr: t('surfaces.scanQr'),
      quickAdd: t('home.quickAdd'),
      pendingTag: t('today.row.pending'),
      listEmpty: t('surfaces.listEmpty'),
      openApp: t('surfaces.openApp'),
      setUp: t('surfaces.setUp'),
      tonight: t('widgets.tonight').toLocaleUpperCase(localeOf(language)),
      streakLine1: t('widgets.streak.line1').toLocaleUpperCase(localeOf(language)),
      streakLine2: t('widgets.streak.line2').toLocaleUpperCase(localeOf(language)),
      stamp: t('widgets.stamp').toLocaleUpperCase(localeOf(language)),
      brand: '6pm',
      hidden: HIDDEN,
      'glyph.scan': glyphOf('qr_code_scanner'),
      'glyph.add': glyphOf('add'),
      'glyph.close': glyphOf('wb_twilight'),
      'font.display': displayFamily(look),
      ...tileColours(list.hues),
    },
    hideAmounts: input.hideAmounts ?? false,
    jars: surfaceJars({ money, t, language, format, tradition: input.tradition ?? null }),
    streak: streakOf(withToday, money.today, look),
    month: monthCardOf({
      today: money.today,
      closed: withToday,
      since: input.since ?? null,
      t,
      language,
    }),
    look: surfaceLook(look),
    links: { today: '/app?tab=today', month: '/app?tab=diary', streak: '/app?tab=diary' },
    ...(input.pinnedAt ? { pinnedAt: input.pinnedAt.toISOString() } : {}),
  };
}

/** The snapshot without its write time: two snapshots that draw the same compare equal. */
export function snapshotKey(snapshot: SurfaceSnapshot): string {
  return JSON.stringify({ ...snapshot, writtenAt: '' });
}
