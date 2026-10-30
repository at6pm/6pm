import { useCallback, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves, durations } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { keyframe, type Track } from '../../ui/motion/keyframes';
import { body } from '../../ui/type/fonts';
import type { WheelGuide } from '../../ui/wheel/wheel';
import type { OnboardingPalette } from './onboarding-palette';

/** The design's timing functions: the guide's own curve, and CSS `ease-out` and `ease`. */
const GUIDE_EASE = Easing.bezierFn(...curves.guide);
const EASE_OUT = Easing.bezierFn(0, 0, 0.58, 1);
const EASE = Easing.bezierFn(0.25, 0.1, 0.25, 1);
/** The guide waits for the step to slide in before the finger shows. */
const START_DELAY = 400;
const FADE = { duration: durations.snap, easing: Easing.bezier(...curves.snap) };

/** One 6 s loop, as the design's keyframes: the millions wheel rolls a row, then the hundreds. */
const MILLIONS_ROLL: Track = [
  [0.12, 0],
  [0.34, 1],
  [0.88, 1],
  [0.96, 0],
];
const HUNDREDS_ROLL: Track = [
  [0.5, 0],
  [0.58, 1],
  [0.88, 1],
  [0.96, 0],
];
/** The first finger presses below the centre, drags up a row and lifts. */
const DRAG_SHOWN: Track = [
  [0, 0],
  [0.06, 1],
  [0.34, 1],
  [0.4, 0],
];
const DRAG_Y: Track = [
  [0.12, 14],
  [0.34, -34],
];
const DRAG_SCALE: Track = [
  [0, 1.15],
  [0.06, 1],
  [0.12, 0.86],
  [0.34, 0.86],
  [0.4, 1.1],
];
/** The second taps the hundreds wheel's lower row, with a ripple. */
const TAP_SHOWN: Track = [
  [0.4, 0],
  [0.46, 1],
  [0.54, 1],
  [0.62, 0],
];
const TAP_SCALE: Track = [
  [0.4, 1.2],
  [0.46, 1],
  [0.5, 0.82],
  [0.54, 1],
  [0.62, 1.1],
];
const RIPPLE_SHOWN: Track = [
  [0.49, 0],
  [0.51, 0.55],
  [0.64, 0],
];
const RIPPLE_SCALE: Track = [
  [0.49, 0.4],
  [0.51, 0.5],
  [0.64, 1.5],
];
/** Each hint lights with its beat. */
const DRAG_LIT: Track = [
  [0.04, 0],
  [0.08, 1],
  [0.38, 1],
  [0.44, 0],
];
const TAP_LIT: Track = [
  [0.42, 0],
  [0.46, 1],
  [0.64, 1],
  [0.7, 0],
];

const FINGER = 44;
const RIPPLE = 66;

export interface MoneyInGuide {
  readonly millions: WheelGuide;
  readonly hundreds: WheelGuide;
  /** Through the loop, 0 to 1. */
  readonly clock: SharedValue<number>;
  /** 1 while the guide plays, easing to 0 once it ends. */
  readonly strength: SharedValue<number>;
  readonly reduceMotion: boolean;
}

/**
 * Money in's gesture guide: a ghost finger drags the millions wheel up a row and taps the hundreds
 * wheel's lower row, and the real wheels roll with it, on a 6 s loop. It plays while `enabled`
 * until the first touch on either wheel, then fades out and rolls the wheels back to their own
 * values, which it never changed, and calls `onDone`. Reduce Motion plays nothing.
 */
export function useMoneyInGuide(enabled: boolean, onDone: () => void): MoneyInGuide {
  const reduceMotion = useReducedMotion();
  const clock = useSharedValue(0);
  const strength = useSharedValue(0);
  const live = useSharedValue(false);
  const done = useRef(onDone);
  done.current = onDone;
  const doneJs = useCallback(() => done.current(), []);

  useEffect(() => {
    if (!enabled || reduceMotion) return;
    live.value = true;
    strength.value = 1;
    clock.value = 0;
    clock.value = withDelay(
      START_DELAY,
      withRepeat(withTiming(1, { duration: durations.guideLoop, easing: Easing.linear }), -1),
    );
    return () => cancelAnimation(clock);
  }, [enabled, reduceMotion, clock, strength, live]);

  useAnimatedReaction(
    () => live.value,
    (now, before) => {
      if (before !== true || now) return;
      strength.value = withTiming(0, FADE);
      scheduleOnRN(doneJs);
    },
  );

  const millions = useDerivedValue(
    () => keyframe(clock.value, MILLIONS_ROLL, GUIDE_EASE) * strength.value,
  );
  const hundreds = useDerivedValue(
    () => keyframe(clock.value, HUNDREDS_ROLL, GUIDE_EASE) * strength.value,
  );
  return {
    millions: { offset: millions, live },
    hundreds: { offset: hundreds, live },
    clock,
    strength,
    reduceMotion,
  };
}

/**
 * The ghost fingers over the wheels: `millionsX` and `hundredsX` are the wheels' centres along
 * their row, and `rowHeight` the wheels' row (the centre row is the middle of three).
 */
export function GuideFingers({
  guide,
  millionsX,
  hundredsX,
  rowHeight,
  pal,
}: {
  readonly guide: MoneyInGuide;
  readonly millionsX: number;
  readonly hundredsX: number;
  readonly rowHeight: number;
  readonly pal: OnboardingPalette;
}) {
  const { clock, strength } = guide;
  const drag = useAnimatedStyle(() => ({
    opacity: keyframe(clock.value, DRAG_SHOWN, GUIDE_EASE) * strength.value,
    transform: [
      { translateY: keyframe(clock.value, DRAG_Y, GUIDE_EASE) },
      { scale: keyframe(clock.value, DRAG_SCALE, GUIDE_EASE) },
    ],
  }));
  const tap = useAnimatedStyle(() => ({
    opacity: keyframe(clock.value, TAP_SHOWN, GUIDE_EASE) * strength.value,
    transform: [{ scale: keyframe(clock.value, TAP_SCALE, GUIDE_EASE) }],
  }));
  const ripple = useAnimatedStyle(() => ({
    opacity: keyframe(clock.value, RIPPLE_SHOWN, EASE_OUT) * strength.value,
    transform: [{ scale: keyframe(clock.value, RIPPLE_SCALE, EASE_OUT) }],
  }));
  if (guide.reduceMotion) return null;
  const finger = {
    position: 'absolute',
    width: FINGER,
    height: FINGER,
    borderRadius: FINGER / 2,
    borderWidth: 2,
    borderColor: pal.fingerRing,
    backgroundColor: pal.finger,
    boxShadow: pal.fingerShadow,
  } as const;
  const centre = rowHeight * 1.5;
  const lower = rowHeight * 2.5;
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: hundredsX - RIPPLE / 2,
            top: lower - RIPPLE / 2,
            width: RIPPLE,
            height: RIPPLE,
            borderRadius: RIPPLE / 2,
            borderWidth: 2,
            borderColor: pal.accent,
          },
          ripple,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[{ ...finger, left: millionsX - FINGER / 2, top: centre - FINGER / 2 }, drag]}
      />
      <Animated.View
        pointerEvents="none"
        style={[{ ...finger, left: hundredsX - FINGER / 2, top: lower - FINGER / 2 }, tap]}
      />
    </>
  );
}

function HintPill({
  icon,
  label,
  lit,
  pal,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly lit: Readonly<SharedValue<number>>;
  readonly pal: OnboardingPalette;
}) {
  const on = useAnimatedStyle(() => ({ opacity: lit.value }));
  const face = (ink: string) => (
    <>
      <Symbol name={icon} size={16} fill={1} weight={500} color={ink} />
      <Text style={{ ...body(13, 650), color: ink }}>{label}</Text>
    </>
  );
  const pill = {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as const;
  return (
    <View style={{ ...pill, backgroundColor: pal.hintBg }}>
      {face(pal.hintInk)}
      <Animated.View
        style={[{ ...pill, position: 'absolute', inset: 0, backgroundColor: pal.btnBg }, on]}
      >
        {face(pal.btnFg)}
      </Animated.View>
    </View>
  );
}

/**
 * The two hints under the wheels, "Drag a wheel" and "Tap a number": each lights with its beat of
 * the guide and rests as a quiet hint once the guide has ended. Reduce Motion shows both lit.
 */
export function GuideHints({
  guide,
  pal,
}: {
  readonly guide: MoneyInGuide;
  readonly pal: OnboardingPalette;
}) {
  const { t } = useI18n();
  const { clock, strength, reduceMotion } = guide;
  const drag = useDerivedValue(() =>
    reduceMotion ? 1 : keyframe(clock.value, DRAG_LIT, EASE) * strength.value,
  );
  const tap = useDerivedValue(() =>
    reduceMotion ? 1 : keyframe(clock.value, TAP_LIT, EASE) * strength.value,
  );
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 2 }}
    >
      <HintPill icon="swipe_vertical" label={t('onboarding.wheel.drag')} lit={drag} pal={pal} />
      <HintPill icon="touch_app" label={t('onboarding.wheel.tap')} lit={tap} pal={pal} />
    </View>
  );
}
