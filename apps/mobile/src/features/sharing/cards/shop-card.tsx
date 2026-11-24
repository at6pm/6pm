import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  addDays,
  cycleMonth,
  payCycleOn,
  shopMonthCard,
  weekdayMondayFirst,
  workIncomeOf,
  type ClosedDayRow,
  type ShopMonthCard,
  type SpendRow,
} from '@6pm/domain';
import type { ShareInks } from '@6pm/theme';

import { readClosedBetween } from '../../../data/diary-queries';
import { useMoney, useMoneyStore } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { useDiaryDates } from '../../diary/diary-dates';
import { CardArt } from './card-art';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardCompanion, CardGround, CardMark, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';
import { CardRow, CardRows, companionLine, RowAmount } from './income-parts';
import { HEADING_BREAKS, headingWords } from '../../../ui/type/word-fit-text';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export interface ShopCardData {
  readonly card: ShopMonthCard;
  readonly monthName: string;
  readonly shop: string;
  /** "SAT 14": the best day. */
  readonly best: string | null;
  readonly kept: string;
  readonly line: string | null;
}

/**
 * My shop's month for the budget month starting `of` (this month when left out): its work rows
 * and its closed days' notes, read from the store so a month just ended still draws whole.
 */
function useShopCard(of: string | undefined): ShopCardData | null {
  const snap = useMoney();
  const store = useMoneyStore();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const anchor = snap.plan?.payday;
  const start = of && DAY.test(of) && of <= snap.today ? of : snap.cycle.start;
  const month = anchor ? payCycleOn(start, anchor) : snap.cycle;
  const from = month.start;
  const to = addDays(month.payday, -1);
  const [read, setRead] = useState<{
    rows: readonly SpendRow[];
    closed: readonly ClosedDayRow[];
  } | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all([
      store.tables.spends.select(
        "WHERE day >= ? AND day <= ? AND for_work = 1 AND status != 'deleted' ORDER BY day, at",
        [from, to],
      ),
      readClosedBetween(store, from, to),
    ])
      .then(([rows, closed]) => live && setRead({ rows, closed }))
      .catch(() => undefined);
    return () => {
      live = false;
    };
    // Read again whenever the money changes.
  }, [store, from, to, snap]);
  return useMemo(() => {
    if (read === null || snap.plan?.work === undefined) return null;
    const card = shopMonthCard({
      from,
      to,
      today: snap.today,
      rows: read.rows,
      notes: read.closed,
    });
    if (card.open === 0) return null;
    const say = t as unknown as (key: string, params: Record<string, string | number>) => string;
    // A day of the month on the best weekday, for its name.
    const onBest =
      card.bestWeekday === null
        ? null
        : (Array.from({ length: 7 }, (_, i) => addDays(from, i)).find(
            (d) => weekdayMondayFirst(d) === card.bestWeekday,
          ) ?? null);
    const name = workIncomeOf(snap.plan.incomes)?.name?.trim();
    return {
      card,
      monthName: dates.month(cycleMonth(month)),
      shop: name || t('shareCards.shop.myShop'),
      best: card.best ? `${dates.weekdayShort(card.best)} ${Number(card.best.slice(8))}` : null,
      kept: money.short(card.kept),
      line:
        onBest === null
          ? null
          : companionLine(say, snap.plan, 'shopCard', { weekday: dates.weekday(onBest) }),
    };
  }, [read, from, to, month, snap, t, money, dates]);
}

/** A bar a day: open days by what they took (no scale), the best in the sun, a shut day a dot. */
function barArt(card: ShopMonthCard, inks: ShareInks, width: number, height: number): ArtBox[] {
  const gap = 3;
  const n = card.days.length;
  const w = (width - gap * (n - 1)) / n;
  const most = Math.max(1, ...card.days.map((d) => (d.kind === 'open' ? d.takings : 0)));
  const boxes: ArtBox[] = [];
  card.days.forEach((day, i) => {
    const l = i * (w + gap);
    if (day.kind === 'ahead') return;
    if (day.kind === 'shut') {
      const h = Math.max(2, height * 0.03);
      boxes.push({ l, t: height - h, w, h, r: '1px', bg: inks.work.shut });
      return;
    }
    const h = Math.max(height * 0.12, (day.takings / most) * height);
    const best = card.best === addDays(card.from, i);
    boxes.push({
      l,
      t: height - h,
      w,
      h,
      r: '2px 2px 1px 1px',
      bg: best ? inks.work.best : inks.work.bar,
    });
  });
  return boxes;
}

function ShopLayout({ data, format, amounts, inks, serious }: CardLayoutProps<ShopCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const { card } = data;
  const barsW = CARD_WIDTH - 48;
  const barsH = story ? 176 : 84;
  const bars = useMemo(() => barArt(card, inks, barsW, barsH), [card, inks, barsW, barsH]);
  const open = t('shareCards.shop.daysOpen', { count: card.open });
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.shop.kicker', {
            month: data.monthName,
            shop: data.shop,
          }).toLocaleUpperCase()}
        </Text>
        <Text
          {...HEADING_BREAKS}
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {headingWords(
            card.soldOut > 0
              ? t('shareCards.shop.titleSoldOut', { open, count: card.soldOut })
              : t('shareCards.shop.titleSales', { open, count: card.transfers }),
          )}
        </Text>
        <View style={{ paddingTop: 8, paddingBottom: 2 }}>
          <CardArt boxes={bars} width={barsW} height={barsH} />
        </View>
        <CardRows inks={inks}>
          {data.best ? (
            <CardRow inks={inks} label={t('shareCards.shop.best')} value={data.best} />
          ) : null}
          <CardRow
            inks={inks}
            label={t('shareCards.shop.transfers')}
            value={`×${card.transfers}`}
          />
          <CardRow inks={inks} label={t('shareCards.shop.regulars')} value={`×${card.regulars}`} />
          <CardRow
            inks={inks}
            strong
            label={t('shareCards.shop.kept')}
            value={<RowAmount inks={inks} text={data.kept} shown={amounts} />}
          />
        </CardRows>
        {story && data.line && !serious ? <CardCompanion line={data.line} inks={inks} /> : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="shop" />
      </View>
    </CardGround>
  );
}

export const shopShareCard = defineCard<ShopCardData>({
  path: 'shop',
  useData: useShopCard,
  hasAmounts: () => true,
  fileKey: (d) => d.card.from,
  Layout: ShopLayout,
});
