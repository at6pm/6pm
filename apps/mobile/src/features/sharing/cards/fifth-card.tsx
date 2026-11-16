import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { cycleMonth, fifthPayCard, payCycleOn, type FifthPayCard } from '@6pm/domain';
import type { ShareInks } from '@6pm/theme';

import { dayOf, periodInputOf } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { mono } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardCompanion, CardGround, CardMark, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';
import {
  ArtInTurn,
  CardRow,
  CardRows,
  companionLine,
  entrancesMs,
  POP_MS,
  RowAmount,
  useEntranceClock,
  type Entrance,
} from './income-parts';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export interface FifthCardData {
  readonly card: FifthPayCard;
  readonly monthName: string;
  /** The pay's weekday, as the phone's language names it. */
  readonly weekday: string;
  readonly kept: string;
  readonly line: string | null;
}

/** The pay beyond the count that landed on `of` (today's stretch when left out). */
function useFifthCard(of: string | undefined): FifthCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  return useMemo(() => {
    const input = periodInputOf(snap);
    const day = dayOf(snap);
    if (input === null || day === null) return null;
    const on = of && DAY.test(of) && of >= snap.cycle.start && of <= snap.today ? of : snap.today;
    const card = fifthPayCard({ ...input, day: on }, day.line);
    if (card === null) return null;
    const say = t as unknown as (key: string, params: Record<string, string | number>) => string;
    const weekday = dates.weekday(card.payOn);
    const anchor = snap.plan?.payday;
    return {
      card,
      monthName: dates.month(cycleMonth(anchor ? payCycleOn(card.payOn, anchor) : snap.cycle)),
      weekday,
      kept: money.short(card.kept),
      line: companionLine(say, snap.plan, 'fifthCard', { weekday }),
    };
  }, [of, snap, t, money, dates]);
}

/** The usual pays rise one after another; the kept one rises last on the pop spring. */
const PAY_STAGGER = 90;
const DOT = 9;
const DOT_GAP = 4;
/** Its days pop one by one once it stands. */
const DOT_STAGGER = 120;
const DOTS_AFTER = 420;

/** The pays as bars of paper, the kept one in the in-hand ink with its days as dots. */
function payArt(card: FifthPayCard, inks: ShareInks, width: number, height: number) {
  const gap = 10;
  const n = card.pays.length;
  const w = (width - gap * (n - 1)) / n;
  const boxes: ArtBox[] = [];
  const entrances: Entrance[] = [];
  const usual = card.pays.filter((p) => !p.kept).length;
  let keptAt = usual * PAY_STAGGER;
  card.pays.forEach((pay, i) => {
    const l = i * (w + gap);
    const r = '8px 8px 3px 3px';
    if (!pay.kept) {
      boxes.push({ l, t: 0, w, h: height, r, bg: inks.work.pay, sh: inks.work.payEdge });
      entrances.push({ kind: 'rise', at: i * PAY_STAGGER });
      return;
    }
    boxes.push({ l, t: 0, w, h: height, r, bg: inks.work.kept, sh: inks.work.keptEdge });
    entrances.push({ kind: 'springRise', at: keptAt });
    // Its days in hand, a row of dots under its top edge, as many as fit.
    const perRow = Math.max(1, Math.floor((w - 8 + DOT_GAP) / (DOT + DOT_GAP)));
    const rows = Math.max(1, Math.floor((height - 18 + DOT_GAP) / (DOT + DOT_GAP)));
    const dots = Math.min(card.daysInHand, perRow * rows);
    for (let k = 0; k < dots; k += 1) {
      const inRow = Math.min(perRow, dots - Math.floor(k / perRow) * perRow);
      const rowW = inRow * DOT + (inRow - 1) * DOT_GAP;
      boxes.push({
        l: l + (w - rowW) / 2 + (k % perRow) * (DOT + DOT_GAP),
        t: 9 + Math.floor(k / perRow) * (DOT + DOT_GAP),
        w: DOT,
        h: DOT,
        r: '50%',
        bg: inks.work.keptDot,
      });
      entrances.push({ kind: 'pop', at: keptAt + DOTS_AFTER + k * DOT_STAGGER });
    }
    keptAt += PAY_STAGGER;
  });
  return { boxes, entrances };
}

function FifthLayout({
  data,
  format,
  amounts,
  inks,
  serious,
  still = false,
}: CardLayoutProps<FifthCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const { card } = data;
  const artW = CARD_WIDTH - 48 - 4;
  const artH = story ? 186 : 92;
  const art = useMemo(() => payArt(card, inks, artW, artH), [card, inks, artW, artH]);
  const clock = useEntranceClock(entrancesMs(art.entrances), still);
  const weekly = card.weekly;
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {(weekly
            ? t('shareCards.fifth.kickerWeekly', { month: data.monthName, weekday: data.weekday })
            : t('shareCards.fifth.kickerFortnight', { month: data.monthName })
          ).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {weekly
            ? t('shareCards.fifth.titleWeekly', { weekday: data.weekday })
            : t('shareCards.fifth.titleFortnight')}
        </Text>
        <View style={{ paddingTop: 8, paddingHorizontal: 2, paddingBottom: 2, gap: 6 }}>
          <ArtInTurn
            boxes={art.boxes}
            entrances={art.entrances}
            width={artW}
            height={artH}
            clock={clock}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {card.pays.map((pay) => (
              <Text
                key={pay.day}
                {...ON_CARD}
                style={{
                  ...mono(10, pay.kept ? 600 : 400),
                  flex: 1,
                  textAlign: 'center',
                  color: pay.kept ? inks.ink : inks.soft,
                }}
              >
                {String(Number(pay.day.slice(8)))}
              </Text>
            ))}
          </View>
        </View>
        <CardRows inks={inks}>
          <CardRow
            inks={inks}
            label={t(
              card.base === 4 ? 'shareCards.fifth.billsWhole4' : 'shareCards.fifth.billsWhole2',
            )}
            value={card.billsWhole ? '✓' : '–'}
          />
          <CardRow
            inks={inks}
            label={t('shareCards.fifth.daysInHand')}
            value={`+${card.daysInHand}`}
          />
          <CardRow
            inks={inks}
            strong
            label={t(weekly ? 'shareCards.fifth.keptWeekly' : 'shareCards.fifth.keptFortnight')}
            value={<RowAmount inks={inks} text={data.kept} shown={amounts} />}
          />
        </CardRows>
        {story && data.line && !serious ? <CardCompanion line={data.line} inks={inks} /> : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="fifth" />
      </View>
    </CardGround>
  );
}

export const fifthShareCard = defineCard<FifthCardData>({
  path: 'fifth',
  useData: useFifthCard,
  hasAmounts: () => true,
  settleMs: (d) => {
    const usual = d.card.pays.filter((p) => !p.kept).length;
    // Never more dots than the bar holds; a few more milliseconds than they take is harmless.
    const dots = Math.min(d.card.daysInHand, 12);
    return usual * PAY_STAGGER + DOTS_AFTER + Math.max(0, dots - 1) * DOT_STAGGER + POP_MS;
  },
  fileKey: (d) => d.card.payOn,
  Layout: FifthLayout,
});
