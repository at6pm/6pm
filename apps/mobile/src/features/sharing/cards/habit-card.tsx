import { useCallback, useMemo } from 'react';

import { monthEnd, monthHabit, monthOf, type HabitCount, type MonthKey } from '@6pm/domain';

import {
  notDailyOf,
  readSpendsBetween,
  toDiarySpend,
  useStoreQuery,
} from '../../../data/diary-queries';
import type { MoneyStore } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { useDiaryDates } from '../../diary/diary-dates';
import { defineCard, type CardLayoutProps } from './card-definition';
import { companionLine } from './companion-line';
import { HeroCard, SunBand } from './hero-card';

const MONTH = /^\d{4}-\d{2}$/;

/** One side of the headline: a place or a category, how often, and what it came to. */
export interface HabitSide {
  readonly name: string;
  readonly count: number;
  readonly spent: string;
}

export interface HabitCardData {
  readonly month: MonthKey;
  readonly monthName: string;
  /** What the headline names first. */
  readonly lead: HabitSide;
  /** What a tap on the headline names instead; null when there is nothing else to name. */
  readonly other: HabitSide | null;
  /** The companion's line, from its catalogue. */
  readonly line: string;
}

function useHabitCard(of: string | undefined): HabitCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const month = of && MONTH.test(of) ? of : monthOf(snap.today);
  const read = useCallback(
    (store: MoneyStore) => readSpendsBetween(store, `${month}-01`, monthEnd(month)),
    [month],
  );
  const spends = useStoreQuery(read, `${month}:${snap.closedDays.length}`);
  return useMemo(() => {
    if (!spends) return null;
    const habit = monthHabit(spends.map(toDiarySpend), notDailyOf(snap));
    if (!habit) return null;
    const side = (c: HabitCount, name: string): HabitSide => ({
      name,
      count: c.count,
      spent: money.short(c.spent),
    });
    const categoryName = snap.categories.find((c) => c.id === habit.category.key)?.name;
    const category = categoryName ? side(habit.category, categoryName) : null;
    const shop = habit.shop ? side(habit.shop, habit.shop.key) : null;
    const lead = habit.lead === 'shop' ? (shop ?? category) : (category ?? shop);
    if (!lead) return null;
    return {
      month,
      monthName: dates.month(month),
      lead,
      other: lead === shop ? category : shop,
      line: companionLine(t, 'habitCard', snap.plan?.persona),
    };
  }, [spends, month, snap, t, money, dates]);
}

function HabitLayout({
  data,
  format,
  amounts,
  inks,
  serious,
  still = false,
  alternate = false,
  onAlternate,
}: CardLayoutProps<HabitCardData>) {
  const { t } = useI18n();
  const side = alternate && data.other ? data.other : data.lead;
  return (
    <HeroCard
      inks={inks}
      format={format}
      serious={serious}
      still={still}
      kicker={t('shareCards.habit.kicker', { month: data.monthName })}
      headline={t('shareCards.habit.title', { name: side.name, count: side.count })}
      // Both names hold the same two lines, so a tap moves nothing under them.
      headlineLines={2}
      {...(data.other && onAlternate
        ? { onHeadline: onAlternate, headlineHint: t('shareCards.habit.switchHint') }
        : {})}
      sub={{ text: t('shareCards.habit.spent', { amount: side.spent }), shown: amounts }}
      band={<SunBand inks={inks} count={side.count} format={format} />}
      line={serious ? null : data.line}
      mood="calm"
    />
  );
}

export const habitShareCard = defineCard<HabitCardData>({
  path: 'habit',
  useData: useHabitCard,
  hasAmounts: () => true,
  canAlternate: (d) => d.other !== null,
  fileKey: (d) => d.month,
  Layout: HabitLayout,
});
