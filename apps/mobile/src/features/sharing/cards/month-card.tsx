import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { monthCard, monthOf, type MonthCard, type MonthSun } from '@6pm/domain';
import type { ShareInks } from '@6pm/theme';

import {
  notDailyOf,
  readMonthDiary,
  toDiarySpend,
  useStoreQuery,
} from '../../../data/diary-queries';
import type { MoneyStore } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { body } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { CardArt } from './card-art';
import { defineCard, type CardLayoutProps } from './card-definition';
import {
  CardCompanion,
  CardGround,
  CardMark,
  InkedAmount,
  kicker,
  ON_CARD,
  Rule,
  title,
} from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';

const MONTH = /^\d{4}-\d{2}$/;

export interface MonthCardData {
  readonly card: MonthCard;
  readonly monthName: string;
  readonly spent: string;
  /** The companion's line, from the companion's catalogue; null in serious mode. */
  readonly line: string | null;
}

function useMonthCard(of: string | undefined): MonthCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const month = of && MONTH.test(of) ? of : monthOf(snap.today);
  const payday = snap.plan?.payday;
  const read = useCallback(
    (store: MoneyStore) => readMonthDiary(store, month, payday ?? { kind: 'lastDay' }),
    [month, payday],
  );
  const data = useStoreQuery(read, `${month}:${snap.closedDays.length}`);
  const notDaily = useMemo(() => notDailyOf(snap), [snap]);
  return useMemo(() => {
    if (!data) return null;
    const card = monthCard({
      month,
      today: snap.today,
      closed: data.closed,
      spends: data.spends.map(toDiarySpend),
      notDaily,
    });
    const persona = snap.plan?.persona ?? 'cheeky';
    const top = card.places[0];
    // Companion keys are composed from the event and persona; each takes the same placeholders.
    const lineFor = t as unknown as (
      key: string,
      params: Record<string, string | number>,
    ) => string;
    const line = snap.plan?.serious
      ? null
      : top && top.visits > 1
        ? lineFor(`companion.monthCard.${persona}`, { place: top.merchant, count: top.visits })
        : lineFor(`companion.monthCardQuiet.${persona}`, { closed: card.closed });
    return { card, monthName: dates.month(month), spent: money.short(card.spent), line };
  }, [data, month, snap, notDaily, t, money, dates]);
}

/** The suns' grid: seven a row, as wide as the card's column (feed: smaller, beside the key). */
function sunBoxes(suns: readonly (MonthSun | null)[], inks: ShareInks, cell: number, gap: number) {
  const boxes: ArtBox[] = [];
  suns.forEach((sun, i) => {
    if (sun === null) return;
    const l = (i % 7) * (cell + gap);
    const t = Math.floor(i / 7) * (cell + gap);
    const r = inks.sun.radius;
    const s = inks.sun;
    if (sun === 'under') boxes.push({ l, t, w: cell, h: cell, r, bg: s.full, sh: s.lit });
    else if (sun === 'over')
      boxes.push({ l, t, w: cell, h: cell, r, bg: s.half, sh: s.halfLit ?? s.lit });
    else boxes.push({ l, t, w: cell, h: cell, r, sh: s.miss, op: sun === 'ahead' ? 0.45 : 1 });
  });
  return boxes;
}

function Legend({ inks, column }: { readonly inks: ShareInks; readonly column: boolean }) {
  const { t } = useI18n();
  const s = inks.sun;
  const items: [string, ArtBox][] = [
    [t('shareCards.month.inside'), { l: 0, t: 0, w: 9, h: 9, r: s.radius, bg: s.full, sh: s.lit }],
    [
      t('shareCards.month.over'),
      { l: 0, t: 0, w: 9, h: 9, r: s.radius, bg: s.half, sh: s.halfLit ?? s.lit },
    ],
    [t('shareCards.month.missed'), { l: 0, t: 0, w: 9, h: 9, r: s.radius, sh: s.miss }],
  ];
  return (
    <View style={{ flexDirection: column ? 'column' : 'row', gap: column ? 8 : 12 }}>
      {items.map(([label, box]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <CardArt boxes={[box]} width={9} height={9} />
          <Text {...ON_CARD} style={{ ...body(11, 600), color: inks.soft }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MonthLayout({ data, format, amounts, inks, serious }: CardLayoutProps<MonthCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const height = cardHeight(format);
  const { card } = data;
  const rows = Math.ceil(card.suns.length / 7);
  // Story: the suns fill the column (24 pt padding each side, 2 inside); feed: 22 pt suns.
  const gap = story ? 7 : 6;
  const cell = story ? (CARD_WIDTH - 48 - 4 - gap * 6) / 7 : 22;
  const grid = useMemo(() => sunBoxes(card.suns, inks, cell, gap), [card.suns, inks, cell, gap]);
  const gridW = cell * 7 + gap * 6;
  const gridH = cell * rows + gap * (rows - 1);
  const mono = { ...kicker(inks, 11.5, 0), color: inks.ink };
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={height}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.month.kicker', { month: data.monthName }).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {t('shareCards.month.title', { count: card.closed, under: card.under })}
        </Text>
        <View
          style={{
            flexDirection: story ? 'column' : 'row',
            alignItems: story ? 'stretch' : 'center',
            gap: story ? 14 : 22,
            paddingHorizontal: 2,
            paddingVertical: story ? 6 : 0,
          }}
        >
          <CardArt boxes={grid} width={gridW} height={gridH} />
          <Legend inks={inks} column={!story} />
        </View>
        <View style={{ gap: 5, paddingTop: 10 }}>
          <Rule rule={inks.rule} style={{ position: 'absolute', left: 0, right: 0, top: 0 }} />
          {card.places.map((p) => (
            <View
              key={p.merchant}
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text {...ON_CARD} numberOfLines={1} style={{ ...mono, flexShrink: 1 }}>
                {p.merchant.toLocaleUpperCase()}
              </Text>
              <Text {...ON_CARD} style={mono}>{`×${p.visits}`}</Text>
            </View>
          ))}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text {...ON_CARD} style={{ ...kicker(inks, 11.5, 0, 600), color: inks.ink }}>
              {t('shareCards.month.spent').toLocaleUpperCase()}
            </Text>
            <InkedAmount
              text={data.spent}
              shown={amounts}
              ink={inks.ink}
              style={{ ...kicker(inks, 11.5, 0, 600), color: inks.ink }}
            />
          </View>
        </View>
        {story && data.line && !serious ? <CardCompanion line={data.line} inks={inks} /> : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="month" />
      </View>
    </CardGround>
  );
}

export const monthShareCard = defineCard<MonthCardData>({
  path: 'month',
  useData: useMonthCard,
  hasAmounts: () => true,
  fileKey: (d) => d.card.month,
  Layout: MonthLayout,
});
