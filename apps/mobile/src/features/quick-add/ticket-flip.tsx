import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import type { QuickFace } from './face-switch';

/** The ticket turns over on its X axis in 320 ms on the entrance curve. */
const FLIP_MS = 320;
const flipEase = Easing.bezier(...curves.enter);
/** Reduce Motion: the faces cross-fade instead. */
const FADE_MS = 200;
const PERSPECTIVE = 900;

/**
 * Quick add's ticket, a face on each side: "Spent · Got paid" turns it over. Each face is drawn
 * flat on its own side; the one turned away is hidden and takes no touches. The sheet sizes to
 * the face showing.
 */
export function TicketFlip({
  face,
  out,
  into,
}: {
  readonly face: QuickFace;
  /** The spend's face. */
  readonly out: ReactNode;
  /** The money-in face. */
  readonly into: ReactNode;
}) {
  const reduced = useReducedMotion();
  const turn = useSharedValue(face === 'in' ? 1 : 0);
  useEffect(() => {
    turn.set(
      withTiming(face === 'in' ? 1 : 0, {
        duration: reduced ? FADE_MS : FLIP_MS,
        easing: reduced ? Easing.linear : flipEase,
      }),
    );
  }, [face, reduced, turn]);
  const side = (back: boolean) => () => {
    'worklet';
    const t = turn.get();
    const shown = back ? t : 1 - t;
    if (reduced) return { opacity: shown, transform: [{ perspective: PERSPECTIVE }] };
    const angle = back ? (1 - t) * -180 : t * 180;
    return {
      // A face turned more than a quarter away is out of sight.
      opacity: shown >= 0.5 ? 1 : 0,
      transform: [{ perspective: PERSPECTIVE }, { rotateX: `${angle}deg` }],
    };
  };
  const front = useAnimatedStyle(side(false));
  const back = useAnimatedStyle(side(true));
  const showing = face === 'in';

  return (
    <View>
      <Animated.View
        pointerEvents={showing ? 'none' : 'auto'}
        accessibilityElementsHidden={showing}
        importantForAccessibility={showing ? 'no-hide-descendants' : 'auto'}
        style={[showing ? { position: 'absolute', top: 0, left: 0, right: 0 } : null, front]}
      >
        {out}
      </Animated.View>
      <Animated.View
        pointerEvents={showing ? 'auto' : 'none'}
        accessibilityElementsHidden={!showing}
        importantForAccessibility={showing ? 'auto' : 'no-hide-descendants'}
        style={[showing ? null : { position: 'absolute', top: 0, left: 0, right: 0 }, back]}
      >
        {into}
      </Animated.View>
    </View>
  );
}
