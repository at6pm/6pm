import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { workYearCard, type WorkYearCard } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useMoney, useMoneyStore } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { mono } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { useWorkYear } from '../../work-year/use-work-year';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardCompanion, CardGround, CardMark, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight } from './card-size';
import { CardRow, CardRows, companionLine, RowAmount } from './income-parts';

export interface WorkYearCardData {
  readonly card: WorkYearCard;
  /** A seller counts days open; anyone else jobs and clients. */
  readonly shop: boolean;
  /** J F M … as the phone's language shortens its months. */
  readonly letters: readonly string[];
  readonly busiest: string | null;
  readonly billed: string;
  readonly line: string | null;
}

/** The money in that paid a request by its code, by id: counted, never named. */
function useCodePaid(): ReadonlySet<string> | null {
  const store = useMoneyStore();
  const snap = useMoney();
  const [ids, setIds] = useState<ReadonlySet<string> | null>(null);
  useEffect(() => {
    let live = true;
    store.db
      .getAllAsync<{ id: string }>(
        `SELECT settled_spend_id AS id FROM owed
          WHERE code IS NOT NULL AND settled_by = 'payback' AND settled_spend_id IS NOT NULL`,
        [],
      )
      .then((rows) => live && setIds(new Set(rows.map((r) => r.id))))
      .catch(() => live && setIds(new Set()));
    return () => {
      live = false;
    };
  }, [store, snap]);
  return ids;
}

/** My work year: this calendar year's work money in, as the work year page reads it. */
function useWorkYearCard(): WorkYearCardData | null {
  const snap = useMoney();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const { year, rows, read } = useWorkYear();
  const codePaid = useCodePaid();
  return useMemo(() => {
    if (!read || codePaid === null) return null;
    const card = workYearCard({ year, today: snap.today, rows, codePaid });
    if (card.jobs === 0) return null;
    const narrow = new Intl.DateTimeFormat(localeOf(language), { month: 'narrow' });
    const say = t as unknown as (key: string, params: Record<string, string | number>) => string;
    const busiest =
      card.busiest === null
        ? null
        : dates.month(`${year}-${String(card.busiest + 1).padStart(2, '0')}`);
    return {
      card,
      shop: snap.plan?.work !== undefined,
      letters: Array.from({ length: 12 }, (_, i) => narrow.format(new Date(Date.UTC(year, i, 15)))),
      busiest,
      billed: money.short(card.billed),
      line:
        busiest === null ? null : companionLine(say, snap.plan, 'workYearCard', { month: busiest }),
    };
  }, [read, codePaid, year, rows, snap, t, language, money, dates]);
}

/** Twelve bars with no scale: the busiest in the sun, months to come dashed. */
function MonthBars({
  data,
  inks,
  height,
}: Pick<CardLayoutProps<WorkYearCardData>, 'data' | 'inks'> & { readonly height: number }) {
  const { card } = data;
  const most = Math.max(1, ...card.months);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height, paddingTop: 8 }}>
      {card.months.map((billed, i) => {
        const toCome = i >= card.toCome;
        const bar = height - 8 - 16;
        const h = toCome ? bar * 0.22 : billed > 0 ? Math.max(4, (billed / most) * bar) : 2;
        return (
          <View key={i} style={{ flex: 1, gap: 5, justifyContent: 'flex-end' }}>
            <View
              style={{
                height: h,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                ...(toCome
                  ? { borderWidth: 1.5, borderStyle: 'dashed', borderColor: inks.work.toCome }
                  : {
                      backgroundColor:
                        billed <= 0
                          ? inks.work.shut
                          : i === card.busiest
                            ? inks.work.best
                            : inks.work.bar,
                    }),
              }}
            />
            <Text
              {...ON_CARD}
              style={{ ...mono(9), height: 11, textAlign: 'center', color: inks.soft }}
            >
              {data.letters[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function WorkYearLayout({
  data,
  format,
  amounts,
  inks,
  serious,
}: CardLayoutProps<WorkYearCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const { card } = data;
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.workYear.kicker', { year: card.year }).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {data.shop
            ? t('shareCards.workYear.titleOpen', { count: card.daysOpen })
            : t('shareCards.workYear.title', {
                jobs: t('shareCards.workYear.jobs', { count: card.jobs }),
                clients: t('shareCards.workYear.clients', { count: card.clients }),
              })}
        </Text>
        <MonthBars data={data} inks={inks} height={story ? 190 : 104} />
        <CardRows inks={inks}>
          <CardRow
            inks={inks}
            label={t('shareCards.workYear.busiest')}
            value={data.busiest ?? t('shareCards.year.none')}
          />
          {data.shop ? null : (
            <CardRow
              inks={inks}
              label={t('shareCards.workYear.byCode')}
              value={t('shareCards.workYear.ofTotal', { count: card.paidByCode, total: card.jobs })}
            />
          )}
          <CardRow
            inks={inks}
            label={t('shareCards.workYear.quiet')}
            value={t('shareCards.workYear.quietDays', { count: card.longestQuiet })}
          />
          <CardRow
            inks={inks}
            strong
            label={t('shareCards.workYear.in')}
            value={<RowAmount inks={inks} text={data.billed} shown={amounts} />}
          />
        </CardRows>
        {story && data.line && !serious ? <CardCompanion line={data.line} inks={inks} /> : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="work-year" />
      </View>
    </CardGround>
  );
}

export const workYearShareCard = defineCard<WorkYearCardData>({
  path: 'work-year',
  useData: useWorkYearCard,
  hasAmounts: () => true,
  fileKey: (d) => String(d.card.year),
  Layout: WorkYearLayout,
});
