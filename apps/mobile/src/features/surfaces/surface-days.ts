import {
  hourOf,
  monthOf,
  monthSuns,
  streakRun,
  type ClosedDayRow,
  type LocalDate,
  type SurfaceSnapshot,
} from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';
import { BASIC_STRATA, paletteFor } from '@6pm/theme';

import type { I18n } from '../../i18n/i18n';
import type { WidgetLook } from './surface-palette';

/** The streak widget draws a band for each of the last evenings, today's open one among them. */
const BANDS = 7;

/** The sky an evening closed under, as three stops left to right: one band of the strata. */
function bandOf(look: WidgetLook, closedAt: string): [string, string, string] {
  if (look.look === 'basic') return [...BASIC_STRATA];
  const [top, middle, bottom] = paletteFor({
    look: look.look,
    hour: hourOf(new Date(closedAt)),
    serious: look.serious,
    ...(look.config ? { config: look.config } : {}),
  }).st;
  return [top, middle, bottom];
}

/**
 * The evenings closed in a row: how many, and the last of them as their skies, oldest first. While
 * today is open it takes the last band, hatched, so the strata always end on tonight.
 */
export function streakOf(
  closed: readonly ClosedDayRow[],
  today: LocalDate,
  look: WidgetLook,
): NonNullable<SurfaceSnapshot['streak']> {
  const run = streakRun(closed, today);
  const open = !closed.some((d) => d.day === today);
  const shown = run.slice(-(open ? BANDS - 1 : BANDS));
  return {
    count: run.length,
    bands: shown.map((row) => bandOf(look, row.closedAt)),
    open,
  };
}

/** The month as suns, with "OCTOBER · CLOSED AT SIX" and "8 sunsets, 6 inside the line.". */
export function monthCardOf(input: {
  readonly today: LocalDate;
  readonly closed: readonly ClosedDayRow[];
  readonly since: LocalDate | null;
  readonly t: I18n['t'];
  readonly language: Language;
}): NonNullable<SurfaceSnapshot['month']> {
  const { today, t, language } = input;
  const month = monthOf(today);
  const suns = monthSuns({ month, today, closed: input.closed, since: input.since });
  const locale = localeOf(language);
  const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    new Date(`${month}-15T12:00:00`),
  );
  return {
    title: t('widgets.month.title', { month: name }).toLocaleUpperCase(locale),
    headline:
      suns.closed === 0
        ? t('widgets.month.none')
        : t('widgets.month.headline', { count: suns.closed, under: suns.under }),
    cells: [...suns.cells],
  };
}
