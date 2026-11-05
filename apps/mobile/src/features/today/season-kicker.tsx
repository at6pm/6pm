import { useEffect } from 'react';
import { Text, View, type LayoutChangeEvent, type TextLayoutEvent } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { LunarTradition, SeasonDay } from '@6pm/domain';
import { seasonInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

const sway = Easing.inOut(Easing.ease);
/** A lantern goes out over 600 ms, as the canvas dims it to a third of its brightness. */
const OUT_MS = 600;
const OUT_SHADE = 0.65;

/** How long the i-th lantern's cord hangs (the canvas's string: a gentle sag in the middle). */
function cordOf(i: number, count: number): number {
  return 6 + (i % 2) * 6 + Math.round(Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 8);
}

/**
 * One lantern on the string (a silk pouch in Korean): it sways ±4° from its cord, 7 to 11 s a
 * swing; one gone out lies under a dark wash, and today's goes out as Today opens (600 ms).
 * Nothing moves in serious mode or with Reduce Motion.
 */
function Lantern({
  index,
  count,
  lit,
  goingOut,
  pouch,
  still,
}: {
  readonly index: number;
  readonly count: number;
  readonly lit: boolean;
  readonly goingOut: boolean;
  readonly pouch: boolean;
  readonly still: boolean;
}) {
  const angle = useSharedValue(-4);
  const out = useSharedValue(lit || goingOut ? 0 : OUT_SHADE);
  useEffect(() => {
    if (still) {
      angle.set(0);
      return;
    }
    angle.set(
      withRepeat(withTiming(4, { duration: (7 + index * 0.6) * 1000, easing: sway }), -1, true),
    );
  }, [angle, index, still]);
  useEffect(() => {
    if (lit) out.set(0);
    else if (goingOut) {
      out.set(
        withTiming(OUT_SHADE, {
          duration: OUT_MS,
          easing: Easing.out(Easing.ease),
          reduceMotion: ReduceMotion.System,
        }),
      );
    } else out.set(OUT_SHADE);
  }, [out, lit, goingOut]);
  const swing = useAnimatedStyle(() => ({
    transformOrigin: '50% 0%',
    transform: [{ rotate: `${angle.get()}deg` }],
  }));
  const shade = useAnimatedStyle(() => ({ opacity: out.get() }));
  const silk = seasonInk.pouches[index % seasonInk.pouches.length] ?? seasonInk.pouches[0];
  return (
    <Animated.View style={[{ alignItems: 'center' }, swing]}>
      <View style={{ width: 1, height: cordOf(index, count), backgroundColor: seasonInk.cord }} />
      <View
        style={{
          width: 16,
          height: pouch ? 18 : 20,
          overflow: 'hidden',
          ...(pouch
            ? {
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                experimental_backgroundImage: `linear-gradient(180deg, ${silk[0]}, ${silk[1]})`,
              }
            : {
                borderRadius: 8,
                experimental_backgroundImage: `radial-gradient(circle at 50% 40%, ${seasonInk.lanternCore} 0%, ${seasonInk.lanternRed} 62%, ${seasonInk.lanternEdge} 100%)`,
              }),
          boxShadow: lit ? seasonInk.lanternGlow : undefined,
        }}
      >
        <Animated.View
          style={[{ position: 'absolute', inset: 0, backgroundColor: seasonInk.lanternOut }, shade]}
        />
      </View>
    </Animated.View>
  );
}

/**
 * Today's kicker in the season, in place of the date: "Còn 7 ngày nữa là Tết" from 23 tháng Chạp,
 * over a string of lanterns, one for each day the countdown began with, lit for each day still
 * left; on mùng 1 to mùng 6 "Mùng 1 Tết" with every lantern lit. Korean hangs silk pouches. In
 * serious mode only the words show.
 */
export function SeasonKicker({
  day,
  tradition,
  festival,
  onLayout,
  onTextLayout,
}: {
  readonly day: SeasonDay;
  readonly tradition: LunarTradition;
  readonly festival: string;
  readonly onLayout: (e: LayoutChangeEvent) => void;
  readonly onTextLayout: (e: TextLayoutEvent) => void;
}) {
  const { palette, serious } = useTheme();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const countdown = day.kind === 'countdown';
  const count = countdown ? day.lanterns : 7;
  const left = countdown ? day.left : count;
  const words = countdown
    ? t('season.kicker.countdown', { count: day.left, festival })
    : t('season.kicker.holiday', { day: day.mung, festival });
  return (
    <View style={{ gap: 6 }}>
      {/* One line, as the date it stands in for: the hero's band has no room for a second one
          over the lanterns, so at the largest text it grows less and then shrinks to fit. */}
      <Text
        onLayout={onLayout}
        onTextLayout={onTextLayout}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        maxFontSizeMultiplier={1.25}
        style={{ ...body(22, 700, -0.02), color: palette.ink }}
      >
        {words}
      </Text>
      {serious ? null : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: 10, paddingTop: 10, alignSelf: 'flex-start' }}
        >
          <View
            style={{
              position: 'absolute',
              left: -4,
              right: -4,
              top: 4,
              height: 10,
              borderTopWidth: 1,
              borderColor: seasonInk.cord,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
            }}
          />
          {Array.from({ length: count }, (_, i) => (
            <Lantern
              key={i}
              index={i}
              count={count}
              lit={i < left}
              goingOut={countdown && i === left}
              pouch={tradition === 'seollal'}
              still={reduceMotion}
            />
          ))}
        </View>
      )}
    </View>
  );
}
