import { useCallback, useMemo } from 'react';

import { addDays, closeRunTo, type ClosedRun, type LocalDate } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { readClosedBetween, useStoreQuery } from '../../../data/diary-queries';
import type { MoneyStore } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { defineCard, type CardLayoutProps } from './card-definition';
import { companionLine } from './companion-line';
import { HeroCard, SunBand } from './hero-card';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** How far back a streak is read: past the longest milestone. */
const LOOK_BACK = 400;

export interface StreakCardData {
  readonly run: ClosedRun;
  /** "3 OCT → 1 NOV" */
  readonly range: string;
  /** The companion's line, from its catalogue. */
  readonly line: string;
}

function useStreakCard(of: string | undefined): StreakCardData | null {
  const snap = useMoney();
  const { t, language } = useI18n();
  const today = snap.today;
  const read = useCallback(
    (store: MoneyStore) => readClosedBetween(store, addDays(today, -LOOK_BACK), today),
    [today],
  );
  const rows = useStoreQuery(read, `${today}:${snap.closedDays.length}`);
  const persona = snap.plan?.persona;
  return useMemo(() => {
    if (!rows) return null;
    const asked = of && DAY.test(of) ? of : null;
    // The evening asked for is closed: the close's reveal offers it before Done files it.
    const days = [...rows.map((r) => r.day), ...(asked ? [asked] : [])];
    // The run ending on the day asked for; else tonight's, or last night's while today is open.
    const end = asked ?? (days.includes(today) ? today : addDays(today, -1));
    const run = closeRunTo(days, end);
    if (!run) return null;
    const short = new Intl.DateTimeFormat(localeOf(language), { day: 'numeric', month: 'short' });
    const at = (d: LocalDate) => short.format(new Date(`${d}T12:00:00`));
    return {
      run,
      range: run.days > 1 ? `${at(run.from)} → ${at(run.to)}` : at(run.to),
      line: companionLine(t, 'streakCard', persona),
    };
  }, [rows, of, today, language, t, persona]);
}

function StreakLayout({
  data,
  format,
  inks,
  serious,
  still = false,
}: CardLayoutProps<StreakCardData>) {
  const { t } = useI18n();
  return (
    <HeroCard
      inks={inks}
      format={format}
      serious={serious}
      still={still}
      kicker={data.range}
      // Only what 6pm knows: the evenings were closed. Never that every spend was caught.
      headline={t('shareCards.streak.title', { count: data.run.days })}
      band={<SunBand inks={inks} count={data.run.days} format={format} />}
      line={serious ? null : data.line}
      mood="happy"
    />
  );
}

export const streakShareCard = defineCard<StreakCardData>({
  path: 'streak',
  useData: useStreakCard,
  hasAmounts: () => false,
  fileKey: (d) => `${d.run.days}-${d.run.to}`,
  Layout: StreakLayout,
});
