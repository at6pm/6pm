import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  Keyframe,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { monthOf, previousMonth, type ImportRow } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Companion } from '../../ui/companion/companion';
import { haptics } from '../../ui/haptics';
import { useTheme } from '../../ui/theme/theme';
import { body, display, mono } from '../../ui/type/fonts';
import { inkWash } from '../diary/diary-colours';
import { useCount, useMonthLabel } from './import-format';
import { ImportFoot, PillButton } from './import-parts';
import type { BringProgress } from './use-import-flow';

const enter = Easing.bezier(...curves.enter);

/** A month landing on the shelf: it drops 12 pt and grows into place, 420 ms. */
const monthIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -12 }, { scale: 0.9 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: enter },
}).duration(420);

interface MonthTile {
  readonly month: string;
  /** Each quarter of the month's spending against the month's busiest quarter, 0 to 1. */
  readonly bars: readonly [number, number, number, number];
}

/** Every month from this one back to the first brought in, newest first, with its four bars. */
function monthsOf(rows: readonly ImportRow[], today: string): MonthTile[] {
  const spent = new Map<string, [number, number, number, number]>();
  for (const row of rows) {
    if (row.direction !== 'out') continue;
    const key = monthOf(row.day);
    const bars = spent.get(key) ?? [0, 0, 0, 0];
    const q = Math.min(3, Math.floor((Number(row.day.slice(8)) - 1) / 8));
    bars[q] = (bars[q] ?? 0) + row.amount;
    spent.set(key, bars);
  }
  const first = rows[0] ? monthOf(rows[0].day) : monthOf(today);
  const tiles: MonthTile[] = [];
  for (let m = monthOf(today); m >= first && tiles.length < 600; m = previousMonth(m)) {
    const bars = spent.get(m) ?? [0, 0, 0, 0];
    const most = Math.max(1, ...bars);
    const bar = (b: number) => (b === 0 ? 0 : 0.25 + (0.75 * b) / most);
    tiles.push({ month: m, bars: [bar(bars[0]), bar(bars[1]), bar(bars[2]), bar(bars[3])] });
  }
  return tiles;
}

/**
 * Bringing it in: the button is the progress bar, and the months shelve themselves newest first
 * as their lines are written, while the year counts back. A tick every January; at the end, the
 * companion, and a way to the Diary.
 */
export function ImportBring({
  rows,
  progress,
  today,
  onboarding,
  onDiary,
  onRetry,
}: {
  readonly rows: readonly ImportRow[];
  readonly progress: BringProgress;
  readonly today: string;
  /** From onboarding there is no Diary yet: the last button only goes back. */
  readonly onboarding: boolean;
  readonly onDiary: () => void;
  readonly onRetry: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const count = useCount();
  const months = useMonthLabel();
  const reduceMotion = useReducedMotion();
  const tiles = useMemo(() => monthsOf(rows, today), [rows, today]);
  const total = rows.length;
  const fill = useSharedValue(0);
  const busy = progress.state === 'busy';
  const done = progress.state === 'done';
  useEffect(() => {
    fill.value = withTiming(busy ? progress.written / Math.max(1, total) : 0, {
      duration: 120,
      easing: Easing.linear,
    });
  }, [busy, fill, progress.written, total]);
  const reached = progress.reached ? monthOf(progress.reached) : null;
  // Written newest first: every month from the one just written up to this one is on the shelf.
  const shownUpTo = done ? (tiles[tiles.length - 1]?.month ?? '') : (reached ?? '9999-99');
  const lastYear = useRef<string | null>(null);
  useEffect(() => {
    if (!reached) return;
    const year = reached.slice(0, 4);
    if (lastYear.current !== null && year !== lastYear.current) haptics.tick();
    lastYear.current = year;
  }, [reached]);
  useEffect(() => {
    if (done) haptics.success();
  }, [done]);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const shownCount = tiles.filter((m) => m.month >= shownUpTo).length;
  useEffect(() => {
    const row = Math.floor(Math.max(0, shownCount - 1) / 4);
    scroll.current?.scrollTo({ y: Math.max(0, (row - 4) * 62), animated: !reduceMotion });
  }, [shownCount, reduceMotion]);

  const first = rows[0]?.day ?? today;
  const spanMonths = Math.max(1, tiles.length);
  const years = Math.floor(spanMonths / 12);
  const kicker = done
    ? t('import.bring.backTo', { month: months.long(first) })
    : busy
      ? t('import.bring.shelving')
      : months.long(today);
  const wash = inkWash(palette.dark);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 8, paddingHorizontal: 16, gap: 14 }}>
        <View
          style={{
            paddingHorizontal: 6,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 2 }}>
            <Text
              style={{ ...body(13, 600, 0.06), textTransform: 'uppercase', color: palette.inkSoft }}
            >
              {kicker}
            </Text>
            <Text style={{ ...body(34, 700, -0.03), color: palette.ink }}>{t('diary.title')}</Text>
          </View>
          {busy && reached ? (
            <Animated.Text
              key={reached.slice(0, 4)}
              entering={FadeIn.duration(200)}
              style={{ ...display(40, 500), lineHeight: 40, color: palette.ink }}
            >
              {reached.slice(0, 4)}
            </Animated.Text>
          ) : null}
        </View>
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!busy}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, rowGap: 6 }}>
            {tiles.map((tile, i) => {
              const shown = i === 0 || tile.month >= shownUpTo;
              return (
                <View key={tile.month} style={{ width: '25%', paddingHorizontal: 3 }}>
                  {shown ? (
                    <Animated.View
                      {...(i === 0 || reduceMotion ? {} : { entering: monthIn })}
                      style={{
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: i === 0 ? wash.todayFill : palette.chipBg,
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        justifyContent: 'space-between',
                      }}
                    >
                      <MonthName month={tile.month} shown />
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-end',
                          gap: 1.5,
                          height: 18,
                        }}
                      >
                        {tile.bars.map((h, k) => (
                          <View
                            key={k}
                            style={{
                              flex: 1,
                              height: `${Math.round(h * 100)}%`,
                              borderRadius: 1,
                              backgroundColor: palette.inkSoft,
                              opacity: 0.68,
                            }}
                          />
                        ))}
                      </View>
                    </Animated.View>
                  ) : (
                    <View
                      style={{
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: wash.outline,
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                      }}
                    >
                      <MonthName month={tile.month} shown={false} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        {done ? (
          <Animated.View
            entering={FadeIn.duration(450)}
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}
          >
            <Companion size={62} mood="happy" />
            <View
              style={{
                marginBottom: 24,
                flexShrink: 1,
                paddingTop: 10,
                paddingHorizontal: 15,
                paddingBottom: 11,
                borderRadius: 20,
                borderBottomLeftRadius: 6,
                backgroundColor: palette.bubbleBg,
              }}
            >
              <Text style={{ ...display(16.5, 500), lineHeight: 20.6, color: palette.bubbleFg }}>
                {years >= 1
                  ? t('import.bring.years', { count: years })
                  : t('import.bring.months', { count: spanMonths })}
              </Text>
            </View>
          </Animated.View>
        ) : null}
        {progress.state === 'failed' ? (
          <Text
            style={{
              ...body(13.5),
              lineHeight: 18.2,
              color: palette.inkSoft,
              paddingHorizontal: 6,
            }}
          >
            {t('import.bring.failed')}
          </Text>
        ) : null}
      </View>
      <ImportFoot>
        <PillButton
          tone={done ? 'accent' : 'paper'}
          fill={fill}
          label={
            done
              ? onboarding
                ? t('common.done')
                : t('import.bring.done')
              : busy
                ? t('import.bring.reading')
                : t('import.labels.bringIn', { n: count(total) })
          }
          onPress={done ? onDiary : busy ? () => undefined : onRetry}
        />
      </ImportFoot>
    </View>
  );
}

function MonthName({ month, shown }: { readonly month: string; readonly shown: boolean }) {
  const { palette } = useTheme();
  const { language } = useI18n();
  const label = useMemo(() => {
    const [y = 2026, m = 1] = month.split('-').map(Number);
    const name = new Intl.DateTimeFormat(localeOf(language), { month: 'short' }).format(
      new Date(y, m - 1, 1),
    );
    const short = name.replace('.', '').toLocaleUpperCase();
    // "OCT 26" where the name is short; "10/26" where it is a word and a number ("THÁNG 10").
    return short.length <= 4 ? `${short} ${String(y).slice(2)}` : `${m}/${String(y).slice(2)}`;
  }, [language, month]);
  return (
    <Text
      numberOfLines={1}
      style={{ ...mono(9.5, 400, 0.1), color: palette.ink, opacity: shown ? 0.8 : 0.3 }}
    >
      {label}
    </Text>
  );
}
