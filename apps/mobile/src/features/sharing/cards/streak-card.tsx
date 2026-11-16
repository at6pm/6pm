import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { addDays, closeRunTo, runDays, type ClosedRun, type LocalDate } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import type { ShareInks } from '@6pm/theme';

import { readClosedBetween, useStoreQuery } from '../../../data/diary-queries';
import type { MoneyStore } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { display, leading } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardMark, glowStyle, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';
import { bandsSettleMs, GrowingBands, GrowingRow, StreakSun, useBandClock } from './streak-motion';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** How far back a streak is read: past the longest milestone. */
const LOOK_BACK = 400;
/** The ticket under the bands, as the canvas draws it. */
const PANEL = 232;
const SUN = 92;

export interface StreakCardData {
  readonly run: ClosedRun;
  /** Each evening of the run, oldest first: its stamp and the time it was closed. */
  readonly evenings: readonly {
    readonly day: LocalDate;
    readonly stamp: string;
    readonly at: string;
  }[];
  /** "SAT 3 → FRI 9 OCT" */
  readonly range: string;
}

function useStreakCard(of: string | undefined): StreakCardData | null {
  const snap = useMoney();
  const { language } = useI18n();
  const dates = useDiaryDates();
  const today = snap.today;
  const read = useCallback(
    (store: MoneyStore) => readClosedBetween(store, addDays(today, -LOOK_BACK), today),
    [today],
  );
  const rows = useStoreQuery(read, `${today}:${snap.closedDays.length}`);
  return useMemo(() => {
    if (!rows) return null;
    const asked = of && DAY.test(of) ? of : null;
    // The evening asked for is closed: the close's reveal offers it before Done files it.
    const days = [...rows.map((r) => r.day), ...(asked ? [asked] : [])];
    // The run ending on the day asked for; else tonight's, or last night's while today is open.
    const end = asked ?? (days.includes(today) ? today : addDays(today, -1));
    const run = closeRunTo(days, end);
    if (!run) return null;
    const at = new Map(rows.map((r) => [r.day, r.closedAt]));
    const locale = localeOf(language);
    const noon = (d: LocalDate) => new Date(`${d}T12:00:00`);
    const short = (d: LocalDate, weekday: boolean) =>
      new Intl.DateTimeFormat(locale, {
        ...(weekday ? { weekday: 'short' as const } : {}),
        day: 'numeric',
        ...(weekday && run.from.slice(0, 7) === run.to.slice(0, 7) && d === run.from
          ? {}
          : { month: 'short' as const }),
      })
        .format(noon(d))
        .toLocaleUpperCase();
    const week = run.days <= 7;
    return {
      run,
      evenings: runDays(run).map((day) => ({
        day,
        stamp: dates.stamp(day),
        at: dates.clock(at.get(day) ?? new Date().toISOString()),
      })),
      range: `${short(run.from, week)} → ${short(run.to, week)}`,
    };
  }, [rows, of, today, language, dates]);
}

/** The bands: one evening's sky each, thick and labelled at 7, hairlines by 100. */
function bandGeometry(inks: ShareInks, count: number) {
  const seven = inks.bands;
  if (count <= 10) return seven;
  if (count <= 40)
    return {
      gap: Math.min(seven.gap, 2),
      pad: Math.min(seven.pad, 6),
      side: Math.min(seven.side, 6),
      r: Math.min(seven.r, 4),
    };
  return { gap: 0, pad: 0, side: 0, r: 0 };
}

const seedOf = (day: LocalDate) => Number(day.replaceAll('-', '')) % 100_003;

function StreakLayout({ data, format, inks, still = false }: CardLayoutProps<StreakCardData>) {
  const { t } = useI18n();
  const height = cardHeight(format);
  const region = height - PANEL;
  const n = data.evenings.length;
  const g = bandGeometry(inks, n);
  const bandH = (region - g.pad - g.gap * (n - 1)) / n;
  const labelled = n <= 10;
  const clock = useBandClock(n, still);
  const boxes = useMemo(
    (): ArtBox[] =>
      data.evenings.map((e, i) => {
        const band = inks.band(i, seedOf(e.day));
        return {
          l: g.side,
          t: g.pad + i * (bandH + g.gap),
          w: CARD_WIDTH - g.side * 2,
          h: bandH,
          bg: band.bg,
          sh: band.sh,
          r: `${Math.min(g.r, bandH / 2)}px`,
        };
      }),
    [data.evenings, inks, g, bandH],
  );
  const n0 = data.run.days;
  const numberSize = n0 < 10 ? 132 : n0 < 100 ? 120 : 108;
  const line =
    n0 === 7
      ? t('shareCards.streak.line7')
      : n0 === 30
        ? t('shareCards.streak.line30')
        : n0 === 100
          ? t('shareCards.streak.line100')
          : t('shareCards.streak.lineOther', { count: n0 });
  const accent = { ...kicker(inks, 10), color: inks.accent };
  return (
    <View style={{ width: CARD_WIDTH, height, backgroundColor: inks.base, overflow: 'hidden' }}>
      <View style={{ height: region, overflow: 'hidden' }}>
        <GrowingBands boxes={boxes} width={CARD_WIDTH} height={region} clock={clock} />
        {labelled
          ? data.evenings.map((e, i) => {
              const band = inks.band(i, seedOf(e.day));
              const style = {
                ...kicker(inks, 9.5, 0.12),
                color: band.txt,
                ...glowStyle(inks.bandGlow),
              };
              return (
                <GrowingRow
                  key={e.day}
                  clock={clock}
                  index={i}
                  count={n}
                  style={{
                    position: 'absolute',
                    left: g.side,
                    right: g.side,
                    top: g.pad + i * (bandH + g.gap),
                    height: bandH,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text {...ON_CARD} style={style}>
                    {e.stamp}
                  </Text>
                  <Text {...ON_CARD} style={style}>
                    {e.at}
                  </Text>
                </GrowingRow>
              );
            })
          : null}
        <StreakSun
          inks={inks}
          size={SUN}
          left={CARD_WIDTH * 0.46}
          top={region + inks.bigSun.sink - SUN}
        />
      </View>
      <View
        style={{
          height: PANEL,
          paddingTop: 26,
          paddingHorizontal: 22,
          paddingBottom: 16,
          backgroundColor: inks.base,
          borderTopWidth: inks.horizon.width,
          borderTopColor: inks.horizon.color,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <Text
            {...ON_CARD}
            style={{
              ...leading(display(numberSize, inks.titleWeight, -0.05), numberSize * 0.8, true),
              color: inks.ink,
              ...glowStyle(inks.glow),
            }}
          >
            {String(n0)}
          </Text>
          <View style={{ gap: 2, paddingBottom: 6 }}>
            <Text {...ON_CARD} style={accent}>
              {t('shareCards.streak.evenings', { count: n0 }).toLocaleUpperCase()}
            </Text>
            <Text {...ON_CARD} style={accent}>
              {t('shareCards.streak.inARow', { count: n0 }).toLocaleUpperCase()}
            </Text>
          </View>
        </View>
        <View style={{ paddingTop: 20 }}>
          <Text {...ON_CARD} numberOfLines={2} style={title(inks, 20, 1.15, inks.lineWeight)}>
            {line}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="streak" label={data.range} rule={inks.rule} />
      </View>
    </View>
  );
}

export const streakShareCard = defineCard<StreakCardData>({
  path: 'streak',
  useData: useStreakCard,
  hasAmounts: () => false,
  settleMs: (d) => bandsSettleMs(d.evenings.length),
  fileKey: (d) => `${d.run.days}-${d.run.to}`,
  Layout: StreakLayout,
});
