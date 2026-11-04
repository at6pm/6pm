import { useMemo } from 'react';

import type { SpendRow } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { notDailyOf } from '../../data/diary-queries';
import type { MoneySnapshot } from '../../data/money-store';
import { useMoney, useMoneySelector } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { fromJarLabeller, jarLinesOf, type JarLineView } from '../diary/jar-lines';
import { spendTag, toRowViews, type Labels } from './today-view';

/** Every jar a spend can name, deleted ones too: their spends keep their label. */
const jarsOf = (snap: MoneySnapshot) => snap.pots;
const deletedJarsOf = (snap: MoneySnapshot) => snap.deletedPots;

/** "From {jar}" in the current language, for any jar a spend was taken from. */
export function useFromJarLabel(): (potId: string) => string {
  const { t } = useI18n();
  const pots = useMoneySelector(jarsOf);
  const deleted = useMoneySelector(deletedJarsOf);
  return useMemo(() => fromJarLabeller([...pots, ...deleted], t), [pots, deleted, t]);
}

/** The labels every spend list uses, in the current language. */
export function useSpendLabels(): Labels {
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const fromJar = useFromJarLabel();
  return useMemo(() => {
    const time = new Intl.DateTimeFormat(localeOf(language), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return {
      source: (source) => t(`source.${source}`),
      time: (iso) => time.format(new Date(iso)),
      tag: (row: SpendRow) =>
        spendTag(row, {
          pending: t('today.row.pending'),
          toReview: t('today.row.toReview'),
          claimBack: t('today.row.claimBack'),
          notMine: t('today.row.notMine'),
          bill: t('today.row.bill'),
          moneyIn: t('moneyIn.row.tag'),
          fromJar,
        }),
      money,
      moneyIn: t('moneyIn.name'),
    };
  }, [t, language, money, fromJar]);
}

const todayInputs = ({ today, cycleSpends, categories }: MoneySnapshot) => ({
  today,
  cycleSpends,
  categories,
});
const sameToday = (a: ReturnType<typeof todayInputs>, b: ReturnType<typeof todayInputs>) =>
  a.today === b.today && a.cycleSpends === b.cycleSpends && a.categories === b.categories;

/** Today's "From {jar}" lines: under the day's spends, what each jar covered of them. */
export function useTodayJarLines(): readonly JarLineView[] {
  const { today, cycleSpends, categories } = useMoneySelector(todayInputs, sameToday);
  const label = useFromJarLabel();
  return useMemo(
    () =>
      jarLinesOf(
        cycleSpends.filter((s) => s.day === today),
        notDailyOf({ categories }),
        label,
      ),
    [today, cycleSpends, categories, label],
  );
}

export function useSpendRows(
  spends: readonly SpendRow[],
  { category = true }: { readonly category?: boolean } = {},
) {
  const { categories } = useMoney();
  const labels = useSpendLabels();
  return useMemo(
    () => toRowViews(spends, categories, labels, category),
    [spends, categories, labels, category],
  );
}
