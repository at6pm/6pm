import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';
import { MONEY_WAYS, type MoneyWay } from './money-ways';
import { riseEntering } from './onboarding-motion';
import type { OnboardingPalette } from './onboarding-palette';
import { StepHeading } from './step-parts';

/** The month each card draws: 28 days, a bar on each day money lands, as tall as the amount. */
const MONTHS: Readonly<Record<MoneyWay, readonly number[]>> = {
  salary: dayBars({ 24: 41 }),
  weekly: dayBars({ 4: 22, 11: 22, 18: 22, 25: 22 }),
  landed: dayBars({ 2: 32, 8: 16, 9: 22, 20: 41 }),
  sell: [
    13, 16, 13, 19, 16, 22, 0, 13, 16, 13, 19, 16, 22, 0, 13, 16, 19, 13, 16, 22, 0, 16, 13, 16, 19,
    16, 22, 0,
  ],
};

function dayBars(bars: Readonly<Record<number, number>>): number[] {
  return Array.from({ length: 28 }, (_, day) => bars[day] ?? 0);
}

const COPY: Readonly<
  Record<
    MoneyWay,
    readonly [title: `onboarding.reach.${MoneyWay}`, sub: `onboarding.reach.${MoneyWay}Sub`]
  >
> = {
  salary: ['onboarding.reach.salary', 'onboarding.reach.salarySub'],
  weekly: ['onboarding.reach.weekly', 'onboarding.reach.weeklySub'],
  landed: ['onboarding.reach.landed', 'onboarding.reach.landedSub'],
  sell: ['onboarding.reach.sell', 'onboarding.reach.sellSub'],
};

/** The cards' bars grow from the baseline, left to right, over this long. */
const GROW_MS = 400;
/** The check's pop: `cubic-bezier(.3,1.4,.5,1)`. */
const POP = { duration: 300, easing: Easing.bezier(0.3, 1.4, 0.5, 1) };
const BARS_HEIGHT = 41;
/** How many days' width each bar takes to rise as the sweep passes. */
const SWEEP = 4;

/**
 * "How does money reach you?": four cards, as many picked as fit, each drawing its month of money
 * as bars. A picked card takes the accent outline and check that a picked bank tile does, and its
 * bars grow again from the left.
 */
export function StepMoneyWays({
  pal,
  ways,
  onToggle,
}: {
  readonly pal: OnboardingPalette;
  readonly ways: readonly MoneyWay[];
  readonly onToggle: (way: MoneyWay) => void;
}) {
  const { t } = useI18n();
  return (
    <View style={{ gap: 14 }}>
      <StepHeading title={t('onboarding.reach.title')} sub={t('onboarding.reach.sub')} pal={pal} />
      <View style={{ gap: 10, paddingTop: 4 }}>
        {MONEY_WAYS.map((way, i) => (
          <WayCard
            key={way}
            way={way}
            index={i}
            on={ways.includes(way)}
            pal={pal}
            onPress={() => {
              haptics.tap();
              onToggle(way);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function WayCard({
  way,
  index,
  on,
  pal,
  onPress,
}: {
  readonly way: MoneyWay;
  readonly index: number;
  readonly on: boolean;
  readonly pal: OnboardingPalette;
  readonly onPress: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const grow = useSharedValue(1);
  useEffect(() => {
    if (!on || reduceMotion) return;
    grow.value = 0;
    grow.value = withTiming(1, { duration: GROW_MS, easing: Easing.out(Easing.cubic) });
  }, [on, reduceMotion, grow]);
  const outline = useAnimatedStyle(() => ({
    borderColor: withTiming(on ? pal.accent : pal.accentClear, { duration: 200 }),
  }));
  const [title, sub] = COPY[way];
  return (
    <Animated.View entering={riseEntering(450, index * 90, reduceMotion, 12)}>
      <PressScale
        scaleTo={0.98}
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on }}
        accessibilityLabel={`${t(title)}, ${t(sub)}`}
      >
        <Animated.View
          style={[
            {
              borderRadius: 24,
              borderWidth: 2,
              backgroundColor: pal.cell,
              boxShadow: pal.cardShadow,
              paddingVertical: 13,
              paddingLeft: 13,
              paddingRight: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
            },
            outline,
          ]}
        >
          <MonthBars bars={MONTHS[way]} grow={grow} pal={pal} />
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            {/* Two lines fit beside the month's 64 pt, so a long title wraps instead of clipping. */}
            <Text
              numberOfLines={2}
              style={{ ...body(17, 650, -0.02), lineHeight: 20.4, color: pal.ink }}
            >
              {t(title)}
            </Text>
            <Text numberOfLines={1} style={{ ...body(13), lineHeight: 17.5, color: pal.inkSoft }}>
              {t(sub)}
            </Text>
          </View>
          <Check on={on} pal={pal} />
        </Animated.View>
      </PressScale>
    </Animated.View>
  );
}

/** A month in 28 days: a bar on each day money lands, a dot on the rest. */
function MonthBars({
  bars,
  grow,
  pal,
}: {
  readonly bars: readonly number[];
  readonly grow: SharedValue<number>;
  readonly pal: OnboardingPalette;
}) {
  return (
    <View
      style={{
        width: 88,
        height: 64,
        borderRadius: 16,
        backgroundColor: pal.chipBg,
        paddingTop: 11,
        paddingHorizontal: 8,
        paddingBottom: 12,
        justifyContent: 'flex-end',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BARS_HEIGHT }}>
        {bars.map((height, day) => (
          <DayBar key={day} day={day} count={bars.length} height={height} grow={grow} pal={pal} />
        ))}
      </View>
    </View>
  );
}

function DayBar({
  day,
  count,
  height,
  grow,
  pal,
}: {
  readonly day: number;
  readonly count: number;
  readonly height: number;
  readonly grow: SharedValue<number>;
  readonly pal: OnboardingPalette;
}) {
  // Each bar rises in its own slice of the sweep, so they grow from left to right.
  const rise = useAnimatedStyle(() => {
    const scale = Math.min(1, Math.max(0, (grow.value * (count + SWEEP) - day) / SWEEP));
    return { transform: [{ scaleY: height > 0 ? scale : 1 }] };
  });
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View
        style={[
          height > 0
            ? { width: 2.5, height, borderRadius: 1, backgroundColor: pal.moneyBar }
            : { width: 1.5, height: 1.5, borderRadius: 1, backgroundColor: pal.moneyDot },
          { transformOrigin: 'bottom' },
          rise,
        ]}
      />
    </View>
  );
}

/** The round check: an empty ring, or the accent with a tick that pops in. */
function Check({ on, pal }: { readonly on: boolean; readonly pal: OnboardingPalette }) {
  const fill = useAnimatedStyle(() => ({
    backgroundColor: withTiming(on ? pal.accent : pal.accentClear, { duration: 200 }),
    borderColor: withTiming(on ? pal.accent : pal.ring, { duration: 200 }),
  }));
  const tick = useAnimatedStyle(() => ({
    opacity: withTiming(on ? 1 : 0, { duration: 150 }),
    transform: [{ scale: withTiming(on ? 1 : 0.3, POP) }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        fill,
      ]}
    >
      <Animated.View style={tick}>
        <Symbol name="check" size={18} weight={600} color={pal.onAccent} />
      </Animated.View>
    </Animated.View>
  );
}
