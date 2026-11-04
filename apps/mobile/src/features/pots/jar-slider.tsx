import { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves } from '@6pm/theme';

import { useTheme } from '../../ui/theme/theme';

const settle = Easing.bezier(...curves.jarFill);
const SETTLE_MS = 260;
// The canvas's range input: a 6 pt track on a 30 pt row, and a 30 pt thumb that stays inside
// the track's ends.
const THUMB = 30;
const TRACK = 6;

/**
 * The what-if range on Future you's jar: 0 to `max` in `step`s. The thumb follows the finger on
 * the UI thread and writes where it is to `position` (0 to 1 of `max`), so the jar's fill can
 * follow it; each new notch goes to JS once (`onStep`), and letting go settles on the notch and
 * commits it (`onCommit`).
 */
export function JarSlider({
  value,
  max,
  step: stepSize,
  fillColor,
  trackColor,
  label,
  position,
  onStep,
  onCommit,
}: {
  readonly value: number;
  readonly max: number;
  readonly step: number;
  readonly fillColor: string;
  readonly trackColor: string;
  readonly label: string;
  /** Where the thumb is, 0 to 1, for whatever follows it. */
  readonly position?: SharedValue<number>;
  readonly onStep: (value: number) => void;
  readonly onCommit: (value: number) => void;
}) {
  const { palette } = useTheme();
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(0);
  const own = useSharedValue(max > 0 ? value / max : 0);
  const pos = position ?? own;
  const step = useSharedValue(Math.round(value / stepSize));
  const dragging = useSharedValue(false);
  const steps = Math.max(1, Math.round(max / stepSize));

  useEffect(() => {
    if (dragging.value) return;
    step.value = Math.round(value / stepSize);
    pos.value = withTiming(max > 0 ? value / max : 0, {
      duration: reduceMotion ? 0 : SETTLE_MS,
      easing: settle,
    });
  }, [value, max, stepSize, pos, step, dragging, reduceMotion]);

  const follow = (x: number) => {
    'worklet';
    const room = width.value - THUMB;
    if (room <= 0) return;
    pos.value = Math.min(1, Math.max(0, (x - THUMB / 2) / room));
    const next = Math.round(pos.value * steps);
    if (next !== step.value) {
      step.value = next;
      scheduleOnRN(onStep, next * stepSize);
    }
  };
  const land = () => {
    'worklet';
    dragging.value = false;
    pos.value = withTiming(step.value / steps, {
      duration: reduceMotion ? 0 : SETTLE_MS,
      easing: settle,
    });
    scheduleOnRN(onCommit, Math.min(max, step.value * stepSize));
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .failOffsetY([-12, 12])
    .onStart((e) => {
      dragging.value = true;
      follow(e.x);
    })
    .onUpdate((e) => follow(e.x))
    .onEnd(() => land());
  const tap = Gesture.Tap().onEnd((e) => {
    follow(e.x);
    land();
  });

  const fill = useAnimatedStyle(() => ({
    width: pos.value * Math.max(0, width.value - THUMB) + THUMB / 2,
  }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * Math.max(0, width.value - THUMB) }],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const next = Math.min(
            max,
            Math.max(0, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1) * stepSize),
          );
          onStep(next);
          onCommit(next);
        }}
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
        }}
        style={{ height: THUMB, justifyContent: 'center' }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (THUMB - TRACK) / 2,
            height: TRACK,
            borderRadius: TRACK,
            backgroundColor: trackColor,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                borderRadius: TRACK,
                backgroundColor: fillColor,
              },
              fill,
            ]}
          />
        </View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: palette.btnBg,
              boxShadow: '0 4px 12px rgba(0,0,0,.35)',
            },
            thumb,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
