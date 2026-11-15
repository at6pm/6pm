import { useEffect, useRef, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { easeOut } from '../../ui/motion/curves';
import type { QuickFace } from './face-switch';

/** The old part steps out first, quickly, so the two are never on screen together. */
const OUT_MS = 120;
/** Then the new one rises in on the entrance curve. */
const IN_MS = 240;
const RISE = 12;
/** The sheet's top follows the new height. */
const HEIGHT_MS = 450;
/** Reduce Motion: the same hand-off as two short fades with no travel. */
const QUIET_MS = 100;
const enterEase = Easing.bezier(...curves.enter);
const exitEase = Easing.in(Easing.quad);

/**
 * What sits between the ticket and the keypad, for each face: the categories and the tools for a
 * spend, "Who from" for money in. Switching hands it over as Plan's panels do: the old part folds
 * away (120 ms), the new one rises in (240 ms), and the height follows over 450 ms, so the sheet's
 * top moves with it and the keypad below never jumps.
 */
export function FaceSwap({
  face,
  out,
  into,
  style,
}: {
  readonly face: QuickFace;
  readonly out: ReactNode;
  readonly into: ReactNode;
  readonly style?: ViewProps['style'];
}) {
  const reduced = useReducedMotion();
  const heights = useRef<Partial<Record<QuickFace, number>>>({});
  const height = useSharedValue(-1);
  const shownOut = useSharedValue(face === 'out' ? 1 : 0);
  const shownIn = useSharedValue(face === 'in' ? 1 : 0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const leave = { duration: reduced ? QUIET_MS : OUT_MS, easing: exitEase };
    const arrive = { duration: reduced ? QUIET_MS : IN_MS, easing: reduced ? easeOut : enterEase };
    const delay = reduced ? QUIET_MS : OUT_MS;
    const [going, coming] = face === 'in' ? [shownOut, shownIn] : [shownIn, shownOut];
    going.set(withTiming(0, leave));
    coming.set(withDelay(delay, withTiming(1, arrive)));
    const h = heights.current[face];
    if (h !== undefined && height.get() >= 0) {
      height.set(
        withTiming(h, {
          duration: reduced ? QUIET_MS * 2 : HEIGHT_MS,
          easing: reduced ? easeOut : enterEase,
        }),
      );
    }
  }, [face, reduced, height, shownIn, shownOut]);

  const measured = (which: QuickFace, h: number) => {
    heights.current[which] = h;
    if (which !== face) return;
    // The first height is simply there; a later one (a row opening) follows on the same curve.
    if (height.get() < 0) height.set(h);
    else height.set(withTiming(h, { duration: reduced ? QUIET_MS * 2 : IN_MS, easing: easeOut }));
  };

  const box = useAnimatedStyle(() => {
    const h = height.get();
    return h < 0 ? {} : { height: h };
  });
  const layer = (shown: typeof shownOut) => () => {
    'worklet';
    const s = shown.get();
    return {
      opacity: s,
      transform: [{ translateY: reduced ? 0 : RISE * (1 - s) }],
    };
  };
  const outStyle = useAnimatedStyle(layer(shownOut));
  const inStyle = useAnimatedStyle(layer(shownIn));
  const place = (which: QuickFace) =>
    which === face ? null : { position: 'absolute' as const, top: 0, left: 0, right: 0 };

  return (
    <View style={style}>
      <Animated.View style={[{ overflow: 'hidden' }, box]}>
        <Animated.View
          onLayout={(e) => measured('out', e.nativeEvent.layout.height)}
          pointerEvents={face === 'out' ? 'box-none' : 'none'}
          accessibilityElementsHidden={face !== 'out'}
          importantForAccessibility={face === 'out' ? 'auto' : 'no-hide-descendants'}
          style={[place('out'), outStyle]}
        >
          {out}
        </Animated.View>
        <Animated.View
          onLayout={(e) => measured('in', e.nativeEvent.layout.height)}
          pointerEvents={face === 'in' ? 'box-none' : 'none'}
          accessibilityElementsHidden={face !== 'in'}
          importantForAccessibility={face === 'in' ? 'auto' : 'no-hide-descendants'}
          style={[place('in'), inStyle]}
        >
          {into}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** A face's part laid out with the sheet body's own gap between its rows. */
export function FacePart({ children }: { readonly children: ReactNode }) {
  return <View style={{ gap: 14 }}>{children}</View>;
}
