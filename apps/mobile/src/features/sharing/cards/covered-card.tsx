import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { coveredCard, cycleMonth, type CoveredCard, type CoveredLanding } from '@6pm/domain';
import type { ShareInks } from '@6pm/theme';

import type { MoneySnapshot } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { body } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { incomePlanOf } from '../../plan/income-plan-view';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardCompanion, CardGround, CardMark, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';
import {
  ArtInTurn,
  CardRow,
  CardRows,
  companionLine,
  entrancesMs,
  RISE_MS,
  RowAmount,
  useEntranceClock,
  type Entrance,
} from './income-parts';

export interface CoveredCardData {
  readonly card: CoveredCard;
  readonly today: string;
  readonly monthName: string;
  readonly inHand: string;
  readonly line: string | null;
}

/**
 * This month's landings as the plan places them: money in kept as the pay of an income with
 * nothing counted on, each with whether it was stamped work.
 */
function landingsOf(snap: MoneySnapshot): CoveredLanding[] {
  const landed = new Set(
    (snap.plan?.incomes ?? []).filter((i) => i.amount <= 0).map((income) => income.id),
  );
  return snap.cycleSpends
    .filter(
      (s) =>
        s.direction === 'in' &&
        s.status === 'kept' &&
        s.moneyIn === 'pay' &&
        s.incomeId != null &&
        landed.has(s.incomeId),
    )
    .map((s) => ({ day: s.day, work: s.forWork === true }));
}

/** Days covered, as Today's ruler counts them now: the card is today's whatever `of` says. */
function useCoveredCard(): CoveredCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  return useMemo(() => {
    const plan = incomePlanOf(snap);
    if (plan?.kind !== 'landed') return null;
    const { view } = plan;
    const card = coveredCard({
      today: snap.today,
      landings: landingsOf(snap),
      covered: view.covered,
      stretchDays: view.stretchDays,
      inHand: view.beyond,
    });
    if (card === null) return null;
    const say = t as unknown as (key: string, params: Record<string, string | number>) => string;
    const line =
      card.quietDays >= 2
        ? companionLine(say, snap.plan, 'coveredCard', { count: card.quietDays })
        : companionLine(say, snap.plan, 'coveredCardNew', { count: card.covered });
    return {
      card,
      today: snap.today,
      monthName: dates.month(cycleMonth(snap.cycle)),
      inHand: money.short(card.inHand),
      line,
    };
  }, [snap, t, money, dates]);
}

/** The ticks draw left to right, 20 ms apart, as the preview opens. */
const TICK_STAGGER = 20;
/** The gap between the stretch's last tick and the first day in hand. */
const SPLIT = 6;

/** The most ticks drawn: past it each tick stands for a few days, the split kept where it falls. */
const MOST_TICKS = 120;

/** How many ticks the ruler draws, and how many of them are the stretch's. */
function tickCounts(card: CoveredCard): { readonly ticks: number; readonly stretch: number } {
  const ticks = Math.min(card.covered, MOST_TICKS);
  return { ticks, stretch: Math.round((card.stretch * ticks) / card.covered) };
}

/** Today's ruler drawn large: a tick a day, the stretch's at full height, the days in hand lower. */
function rulerArt(card: CoveredCard, inks: ShareInks, width: number, height: number) {
  const { ticks, stretch } = tickCounts(card);
  const split = ticks > stretch && stretch > 0 ? SPLIT : 0;
  const slot = (width - split) / ticks;
  const w = Math.max(1, Math.min(3.5, slot * 0.55));
  const low = Math.round(height * (104 / 150));
  const boxes: ArtBox[] = [];
  const entrances: Entrance[] = [];
  for (let k = 0; k < ticks; k += 1) {
    const inHand = k >= stretch;
    const h = inHand ? low : height;
    const l = k * slot + (inHand ? split : 0) + (slot - w) / 2;
    boxes.push({
      l,
      t: height - h,
      w,
      h,
      r: '2px',
      bg: inHand ? inks.work.inHand : inks.work.covered,
    });
    entrances.push({ kind: 'rise', at: k * TICK_STAGGER });
  }
  return { boxes, entrances };
}

function CoveredLayout({
  data,
  format,
  amounts,
  inks,
  serious,
  still = false,
}: CardLayoutProps<CoveredCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const { card } = data;
  const rulerW = CARD_WIDTH - 48;
  const rulerH = story ? 150 : 84;
  const art = useMemo(() => rulerArt(card, inks, rulerW, rulerH), [card, inks, rulerW, rulerH]);
  const clock = useEntranceClock(entrancesMs(art.entrances), still);
  const n = card.landings;
  const landed = card.jobs
    ? n === 1
      ? t('shareCards.covered.oneJob')
      : t('shareCards.covered.jobs', { count: n })
    : n === 1
      ? t('shareCards.covered.once')
      : t('shareCards.covered.times', { count: n });
  const label = { ...body(11, 600), color: inks.soft };
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.covered.kicker', { month: data.monthName }).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {t('shareCards.covered.title', {
            landed,
            covered: t('shareCards.covered.days', { count: card.covered }),
          })}
        </Text>
        <View style={{ gap: 8, paddingTop: 8, paddingBottom: 2 }}>
          <ArtInTurn
            boxes={art.boxes}
            entrances={art.entrances}
            width={rulerW}
            height={rulerH}
            clock={clock}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text {...ON_CARD} style={label}>
              {card.stretch > 0 ? t('shareCards.covered.toEnd') : ''}
            </Text>
            {card.inHandDays > 0 ? (
              <Text {...ON_CARD} style={{ ...label, color: inks.work.inHand }}>
                {t('shareCards.covered.inHandLabel')}
              </Text>
            ) : null}
          </View>
        </View>
        <CardRows inks={inks}>
          <CardRow inks={inks} label={t('shareCards.covered.landings')} value={`×${n}`} />
          <CardRow
            inks={inks}
            label={t('shareCards.covered.quiet')}
            value={String(card.quietDays)}
          />
          <CardRow
            inks={inks}
            strong
            label={t('shareCards.covered.inHand')}
            value={<RowAmount inks={inks} text={data.inHand} shown={amounts} />}
          />
        </CardRows>
        {story && data.line && !serious ? (
          <CardCompanion line={data.line} inks={inks} mood="calm" />
        ) : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="covered" />
      </View>
    </CardGround>
  );
}

export const coveredShareCard = defineCard<CoveredCardData>({
  path: 'covered',
  useData: useCoveredCard,
  hasAmounts: () => true,
  settleMs: (d) => (tickCounts(d.card).ticks - 1) * TICK_STAGGER + RISE_MS,
  fileKey: (d) => d.today,
  Layout: CoveredLayout,
});
