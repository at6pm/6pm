import {
  daysUntil,
  isFutureYouPot,
  isNewYearJar,
  jarDay,
  type LocalDate,
  type LunarTradition,
  type MoneyFormat,
  type SurfaceJar,
} from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';

import type { MoneySnapshot } from '../../data/money-store';
import type { I18n } from '../../i18n/i18n';
import { isSymbolName } from '../../ui/icons/symbol';
import { jarColours } from '../pots/jar-colours';
import { jarLevel } from '../pots/jar-geometry';
import { jarName } from '../pots/jar-name';
import { glyphOf } from './surface-glyph';

/** Days from which a jar's day is written with its year. */
const YEAR_SAID_FROM = 300;

/**
 * The person's own jars as the widgets draw them: Future you first, then the season's jar, then
 * the rest as they were made. Each carries how full it is, what it holds, the day it counts down
 * to and its own colours; the jar widget picks one, the medium widget shows the first four.
 */
export function surfaceJars(input: {
  readonly money: MoneySnapshot;
  readonly t: I18n['t'];
  readonly language: Language;
  readonly format: MoneyFormat;
  readonly tradition: LunarTradition | null;
}): SurfaceJar[] {
  const { money, t, language, format, tradition } = input;
  const locale = localeOf(language);
  const today: LocalDate = money.today;
  const jars = money.pots
    .filter((pot) => pot.archivedAt === null)
    .map((pot) => {
      const saved = money.potSaved[pot.id] ?? 0;
      return {
        pot,
        name: jarName(pot, t),
        saved,
        target: pot.goal,
        level: jarLevel(saved, pot.goal),
      };
    });
  const rank = (jar: (typeof jars)[number]) =>
    isFutureYouPot(jar.pot) ? 0 : isNewYearJar(jar.pot) ? 1 : 2;
  const ordered = jars
    .map((jar, index) => ({ jar, index }))
    .sort((a, b) => rank(a.jar) - rank(b.jar) || a.index - b.index)
    .map(({ jar }) => jar);
  return ordered.map((jar): SurfaceJar => {
    const { pot } = jar;
    const colours = jarColours(pot.hue);
    const day = jarDay(pot, today, tradition);
    const left = day === null ? null : daysUntil(today, day);
    const dayText =
      day === null
        ? ''
        : new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            // A day under a year off goes without its year ("Sat 6 Feb").
            ...(left !== null && left > YEAR_SAID_FROM ? { year: 'numeric' } : {}),
          }).format(new Date(`${day}T12:00:00`));
    const percent = Math.round(jar.level * 100);
    const count =
      left !== null
        ? { countText: String(left), countUnit: t('widgets.jar.days', { count: left }) }
        : jar.target > 0
          ? { countText: `${percent}%`, countUnit: t('widgets.jar.full') }
          : { countText: format.short(jar.saved), countUnit: t('widgets.jar.saved') };
    const icon = isSymbolName(pot.icon) ? pot.icon : 'savings';
    return {
      id: pot.id,
      name: jar.name,
      label: jar.name.toLocaleUpperCase(locale),
      icon: glyphOf(icon),
      level: jar.level,
      amountText: format.short(jar.saved),
      ofText:
        jar.target > 0
          ? t('widgets.jar.of', { amount: format.short(jar.saved), goal: format.short(jar.target) })
          : format.short(jar.saved),
      dayText,
      ...count,
      fill: colours.fill,
      fillTop: colours.fillTop,
      lid: colours.lid,
      glass: colours.glass,
      iconLow: colours.iconLow,
      iconHigh: colours.iconHigh,
      newYear: isNewYearJar(pot),
      path: `/app/pot/${encodeURIComponent(pot.id)}`,
    };
  });
}
