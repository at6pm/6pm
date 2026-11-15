import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { curves, springs } from '@6pm/theme';

import { haptics } from '../../ui/haptics';
import { useTheme } from '../../ui/theme/theme';
import { mono } from '../../ui/type/fonts';
import { captureColours } from './capture-colours';

/** One day's cell: 6 pt wide, 2.6 pt apart, 18 pt tall at most. */
const CELL = 6;
const GAP = 2.6;
const TALL = 18;
/** Fourteen cells and the gaps between them: the column every row's strip lines up in. */
export const STRIP_WIDTH = 14 * CELL + 13 * GAP;
/** Each bar rises this long after the one on its left. */
const RISE_STAGGER_MS = 12;

/** A day's bar: 5 pt for one catch and 3 pt more for each after it, up to the strip's height. */
function barHeight(count: number): number {
  return Math.min(TALL, 5 + 3 * count);
}

function rise(index: number, reduceMotion: boolean) {
  return new Keyframe({
    0: { transform: [{ scaleY: 0 }] },
    100: { transform: [{ scaleY: 1 }], easing: Easing.bezier(...curves.enter) },
  })
    .duration(reduceMotion ? 0 : 350)
    .delay(reduceMotion ? 0 : index * RISE_STAGGER_MS)
    .reduceMotion(ReduceMotion.Never);
}

/**
 * A way's last 14 days, today on the right: a bar for a day that caught something, as tall as
 * its count; a faint dot for a day that caught nothing; today in the look's accent. A quiet way's
 * empty days after its last catch are warm dashed slots. The bars rise from their baseline left to
 * right as Settings opens; a strip with no catches is dots, drawn at once.
 */
export function HeartbeatStrip({
  beats,
  quietDays = 0,
}: {
  readonly beats: readonly number[];
  /** Empty days at the end of a quiet way's strip. */
  readonly quietDays?: number;
}) {
  const { palette } = useTheme();
  const reduceMotion = useReducedMotion();
  const warm = captureColours(palette).warn;
  const last = beats.length - 1;
  return (
    <View
      style={{
        width: STRIP_WIDTH,
        height: TALL,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: GAP,
        flexShrink: 0,
      }}
    >
      {beats.map((count, k) => {
        // A quiet way's empty days are warm slots, today's too.
        const quiet = count === 0 && k > last - quietDays;
        if (k === last && !quiet) return <TodayCell key={k} count={count} index={k} />;
        if (count > 0) {
          return (
            <Animated.View
              key={k}
              entering={rise(k, reduceMotion)}
              style={{
                width: CELL,
                height: barHeight(count),
                borderRadius: 2,
                backgroundColor: palette.ink,
                opacity: 0.86,
                transformOrigin: '50% 100%',
              }}
            />
          );
        }
        if (quiet) {
          return (
            <View
              key={k}
              style={{
                width: CELL,
                height: 14,
                borderRadius: 2,
                borderWidth: 1.2,
                borderStyle: 'dashed',
                borderColor: warm,
                opacity: 0.85,
              }}
            />
          );
        }
        return <Dot key={k} color={palette.ink} faint />;
      })}
    </View>
  );
}

function Dot({ color, faint = false }: { readonly color: string; readonly faint?: boolean }) {
  return (
    <View style={{ width: CELL, alignItems: 'center' }}>
      <View
        style={{
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: color,
          opacity: faint ? 0.28 : 1,
        }}
      />
    </View>
  );
}

/**
 * Today, in the accent. A catch arriving while Settings is open grows it by one step with the
 * house pop and a selection tick (from a dot to its first bar too).
 */
function TodayCell({ count, index }: { readonly count: number; readonly index: number }) {
  const { palette } = useTheme();
  const reduceMotion = useReducedMotion();
  const height = useSharedValue(count > 0 ? barHeight(count) : 0);
  const seen = useRef(count);
  useEffect(() => {
    if (count === seen.current) return;
    if (count > seen.current) haptics.tick();
    seen.current = count;
    const to = count > 0 ? barHeight(count) : 0;
    height.value = reduceMotion ? to : withSpring(to, springs.pop);
  }, [count, height, reduceMotion]);
  const bar = useAnimatedStyle(() => ({ height: height.value }));
  return (
    <Animated.View
      {...(count > 0 ? { entering: rise(index, reduceMotion) } : {})}
      style={{ width: CELL, height: TALL, justifyContent: 'flex-end', transformOrigin: '50% 100%' }}
    >
      {count === 0 ? <Dot color={palette.accent} /> : null}
      <Animated.View style={[{ borderRadius: 2, backgroundColor: palette.accent }, bar]} />
    </Animated.View>
  );
}

/** The axis over the strips: the first day on the left, "TODAY" in the accent on the right. */
export function HeartbeatAxis({
  first,
  today,
}: {
  readonly first: string;
  readonly today: string;
}) {
  const { palette } = useTheme();
  const text = mono(9, 500, 0.12);
  return (
    <View
      style={{
        width: STRIP_WIDTH,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'flex-end',
      }}
    >
      <Text style={{ ...text, color: palette.inkSoft }}>{first}</Text>
      <Text style={{ ...text, color: palette.accent }}>{today}</Text>
    </View>
  );
}
