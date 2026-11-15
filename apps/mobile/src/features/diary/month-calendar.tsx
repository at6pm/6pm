import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

import { type CalendarCell, type LocalDate } from '@6pm/domain';
import { springs } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { FitText } from '../../ui/type/fit-text';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import { PageButton } from './calendar-page-button';
import { dots, inkWash, paper } from './diary-colours';

const SELECT_MS = 200;
/** A day is 43 × 46 pt; a closed day's slip is 42 of it, and its torn foot the rest. */
const CELL_WIDTH = 43;
const CELL_HEIGHT = 46;
const SLIP_HEIGHT = 42;
/** A missed day, or one before the first close, is its date at 34%; a day ahead at 20%. */
const PAST_OPACITY = 0.34;
const AHEAD_OPACITY = 0.2;

/** One key of the legend at the calendar's foot: a dot (an outline for brought-in days) and a word. */
function Legend({
  colour,
  outline,
  label,
}: {
  readonly colour: string;
  readonly outline?: boolean;
  readonly label: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={
          outline
            ? { width: 7, height: 7, borderRadius: 2, borderWidth: 1, borderColor: colour }
            : { width: 6, height: 6, borderRadius: 3, backgroundColor: colour }
        }
      />
      <Text style={{ ...body(12, 600), color: palette.inkSoft }}>{label}</Text>
    </View>
  );
}

/**
 * A closed day: a small slip of that day's receipt, with a torn foot. It lifts and tilts, ringed
 * in the accent, when it is the one shown.
 */
function ClosedCell({
  cell,
  selected,
  onPress,
}: {
  readonly cell: Extract<CalendarCell, { kind: 'closed' }>;
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const money = useMoneyFormat();
  const lift = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(selected ? -3 : 0, springs.pop) },
      { rotate: `${withSpring(selected ? -2 : 0, springs.pop)}deg` },
    ],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 1 : 0, { duration: SELECT_MS }),
  }));
  return (
    <Animated.View style={[{ width: CELL_WIDTH, height: CELL_HEIGHT }, lift]}>
      <PressScale
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={{ height: CELL_HEIGHT }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              inset: -2.5,
              borderRadius: 9.5,
              borderWidth: 2.5,
              borderColor: palette.accent,
              boxShadow: '0 8px 16px rgba(20,8,30,.3)',
            },
            ring,
          ]}
        />
        <View
          style={{
            height: SLIP_HEIGHT,
            borderTopLeftRadius: 7,
            borderTopRightRadius: 7,
            backgroundColor: paper.sheet,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ ...body(15, 700), ...tabular, lineHeight: 15, color: paper.ink }}>
            {Number(cell.day.slice(8))}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '100%' }}>
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: cell.dot === 'under' ? dots.under : dots.over,
              }}
            />
            <FitText
              style={{ ...mono(9, 500, 0.02), lineHeight: 10, color: paper.soft, flexShrink: 1 }}
            >
              {money.short(cell.spent)}
            </FitText>
          </View>
        </View>
        <PaperEdge color={paper.sheet} height={CELL_HEIGHT - SLIP_HEIGHT} step={6} shadow={false} />
      </PressScale>
    </Animated.View>
  );
}

/**
 * A day brought in from another app: an outline with what it spent, no dot (it had no line).
 * It opens its receipt like a closed day.
 */
function BroughtCell({
  cell,
  selected,
  onPress,
}: {
  readonly cell: Extract<CalendarCell, { kind: 'brought' }>;
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const money = useMoneyFormat();
  const wash = inkWash(palette.dark);
  const ring = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 1 : 0, { duration: SELECT_MS }),
  }));
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: wash.outline,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            inset: -2.5,
            borderRadius: 12.5,
            borderWidth: 2,
            borderColor: palette.accent,
          },
          ring,
        ]}
      />
      <Text style={{ ...body(15, 700), ...tabular, lineHeight: 15, color: palette.ink }}>
        {Number(cell.day.slice(8))}
      </Text>
      <FitText
        style={{ ...mono(9, 500), lineHeight: 10, color: palette.inkSoft, maxWidth: '100%' }}
      >
        {money.short(cell.spent)}
      </FitText>
    </PressScale>
  );
}

/**
 * Today before the close: an accent outline and the close time. A missed day, or one before the
 * first close, is only its date, dim; a missed day still opens its late close. Days ahead are
 * dimmer still.
 */
function OpenCell({
  cell,
  past,
  closeAt,
  onPress,
}: {
  readonly cell: Extract<CalendarCell, { kind: 'today' | 'missed' | 'idle' }>;
  /** A day before today. */
  readonly past: boolean;
  readonly closeAt: string;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const n = Number(cell.day.slice(8));
  const frame = {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  } as const;
  if (cell.kind === 'today') {
    return (
      <PressScale
        accessibilityRole="button"
        onPress={onPress}
        style={[frame, { borderRadius: 10, borderWidth: 1.5, borderColor: palette.accent }]}
      >
        <Text style={{ ...body(15, 700), ...tabular, lineHeight: 15, color: palette.ink }}>
          {n}
        </Text>
        <Text style={{ ...mono(9), lineHeight: 10, color: palette.accent }}>{closeAt}</Text>
      </PressScale>
    );
  }
  const numeral = (
    <Text
      style={{
        ...body(15, 500),
        ...tabular,
        color: palette.ink,
        opacity: past ? PAST_OPACITY : AHEAD_OPACITY,
      }}
    >
      {n}
    </Text>
  );
  if (cell.kind === 'idle') return <View style={frame}>{numeral}</View>;
  return (
    <PressScale accessibilityRole="button" onPress={onPress} style={frame}>
      {numeral}
    </PressScale>
  );
}

/**
 * The month as receipts: each closed day a slip of paper with its total and a dot for under or
 * over its line, today waiting for its close, missed days only their dates (a tap still catches
 * them up). Weeks start on Monday; the legend sits on one line at the foot.
 */
export function MonthCalendar({
  title,
  summary,
  letters,
  cells,
  today,
  closeAt,
  selected,
  onSelect,
  onToday,
  onMissed,
  canPrevious,
  canNext,
  onPage,
  stamp = null,
  broughtOnly = false,
  footer = null,
}: {
  readonly title: string;
  readonly summary: string;
  readonly letters: readonly string[];
  readonly cells: readonly CalendarCell[];
  readonly today: LocalDate;
  /** Today's close time ("18:00"), shown on today's date until it closes. */
  readonly closeAt: string;
  readonly selected: string | null;
  readonly onSelect: (day: string) => void;
  readonly onToday: () => void;
  readonly onMissed: (day: string) => void;
  /** Whether a month with days in it lies before / after the one shown. */
  readonly canPrevious: boolean;
  readonly canNext: boolean;
  readonly onPage: (by: 1 | -1) => void;
  /** "ML · 2026": where a month's brought-in days came from, stamped on its card. */
  readonly stamp?: string | null;
  /** Every day with something is brought in: the card is drawn as an outline, not filled. */
  readonly broughtOnly?: boolean;
  /** Under the weeks, at the right: the quiet chip that shares the month. */
  readonly footer?: ReactNode;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const wash = inkWash(palette.dark);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  return (
    <View
      style={{
        borderRadius: 26,
        backgroundColor: broughtOnly ? wash.ghost : palette.cell,
        boxShadow: broughtOnly ? undefined : palette.cardShadow,
        borderWidth: broughtOnly ? 1 : 0,
        borderStyle: 'dashed',
        borderColor: wash.outline,
        padding: 14,
        gap: 14,
        overflow: 'hidden',
      }}
    >
      <View style={{ gap: 3 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <PageButton
            direction="previous"
            enabled={canPrevious}
            label={t('diary.cal.previous')}
            onPress={() => onPage(-1)}
          />
          <Text
            numberOfLines={1}
            style={{
              ...display(22, 600, -0.02),
              color: palette.ink,
              flexShrink: 1,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <PageButton
            direction="next"
            enabled={canNext}
            label={t('diary.cal.next')}
            onPress={() => onPage(1)}
          />
        </View>
        <FitText style={{ ...body(13), color: palette.inkSoft, textAlign: 'center' }}>
          {summary}
        </FitText>
      </View>
      <View style={{ gap: 7 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {letters.map((letter, i) => (
            <Text
              key={i}
              style={{
                width: CELL_WIDTH,
                ...body(11.5, 600),
                color: palette.inkSoft,
                textAlign: 'center',
              }}
            >
              {letter}
            </Text>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={w} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {week.map((cell, i) =>
              cell.kind === 'blank' ? (
                <View key={i} style={{ width: CELL_WIDTH, height: CELL_HEIGHT }} />
              ) : cell.kind === 'closed' ? (
                <ClosedCell
                  key={cell.day}
                  cell={cell}
                  selected={cell.day === selected}
                  onPress={() => onSelect(cell.day)}
                />
              ) : cell.kind === 'brought' ? (
                <BroughtCell
                  key={cell.day}
                  cell={cell}
                  selected={cell.day === selected}
                  onPress={() => onSelect(cell.day)}
                />
              ) : (
                <OpenCell
                  key={cell.day}
                  cell={cell}
                  past={cell.day < today}
                  closeAt={closeAt}
                  onPress={() => (cell.kind === 'today' ? onToday() : onMissed(cell.day))}
                />
              ),
            )}
          </View>
        ))}
        {stamp ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              // Over the last week, 6 pt past the card's edge; clear of the share chip and the
              // legend under the weeks.
              right: -20,
              bottom: 0,
              paddingVertical: 3,
              paddingHorizontal: 8,
              borderWidth: 2,
              borderRadius: 5,
              borderColor: wash.stamp,
              transform: [{ rotate: '-10deg' }],
            }}
          >
            <Text style={{ ...mono(9, 600, 0.12), color: wash.stamp }}>{stamp}</Text>
          </View>
        ) : null}
      </View>
      {footer ? (
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 2 }}>{footer}</View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 16,
          rowGap: 4,
          paddingTop: 2,
        }}
      >
        {broughtOnly ? null : <Legend colour={dots.under} label={t('diary.cal.under')} />}
        {broughtOnly ? null : <Legend colour={dots.over} label={t('diary.cal.over')} />}
        {stamp ? (
          <Legend outline colour={wash.stamp} label={t('import.diary.legendBrought')} />
        ) : null}
        <Text style={{ ...body(12, 600), color: palette.inkSoft, opacity: 0.7 }}>
          {t('diary.cal.tap')}
        </Text>
      </View>
    </View>
  );
}
