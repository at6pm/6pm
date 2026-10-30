import type { ReactElement } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useHomeNav } from './home-nav';
import { useHomeScroll, type HomePull } from './home-scroll';
import { HOME_TABS, type HomeTab } from './home-tabs';

/**
 * Whether a page's pull is read from its own scroll offset: iOS lets a scroll view run past its
 * top and bounce back, so the offset is the pull. Android's stops at its top, so the finger is read.
 */
const PULL_FROM_SCROLL = Platform.OS === 'ios';

/** iOS's rubber band: the further past the edge, the less the page follows the finger. */
function rubber(over: number, size: number): number {
  'worklet';
  return (1 - 1 / ((over * 0.55) / size + 1)) * size;
}

/**
 * Android's pull past the top of a home page, the way iOS's bounce gives it: a downward drag that
 * starts with the page at its top moves the page down on the iOS rubber band, feeds `pull` as the
 * scroll offset does on iOS, runs `onRelease` when let go at `reach` or further, and springs home.
 * The page's scroll view takes the style and sits in `PullDetector` with the gesture; on iOS there
 * is no gesture and the style is empty.
 */
export function useOverscrollPull(tab: HomeTab, pulling: HomePull) {
  const { pageY } = useHomeScroll();
  const { tabIndex } = useHomeNav();
  const { height } = useWindowDimensions();
  const index = HOME_TABS.indexOf(tab);
  const offset = pageY[index] ?? pageY[0];
  const { pull, reach, onRelease } = pulling;
  const fromTop = useSharedValue(false);

  const scroll = Gesture.Native();
  const drag = Gesture.Pan()
    // Down only, and never a sideways swipe between the pages.
    .activeOffsetY([-10_000, 8])
    .failOffsetY(-8)
    .failOffsetX([-16, 16])
    .simultaneousWithExternalGesture(scroll)
    .onStart(() => {
      fromTop.set(offset.get() <= 0.5 && tabIndex.get() === index);
    })
    .onUpdate((event) => {
      if (!fromTop.get()) return;
      pull.set(rubber(Math.max(0, event.translationY), height));
    })
    .onEnd(() => {
      if (fromTop.get() && pull.get() >= reach) scheduleOnRN(onRelease);
    })
    .onFinalize(() => {
      fromTop.set(false);
      pull.set(
        withSpring(0, {
          damping: 26,
          stiffness: 260,
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        }),
      );
    });
  const style = useAnimatedStyle(() =>
    PULL_FROM_SCROLL ? {} : { transform: [{ translateY: pull.get() }] },
  );
  return { gesture: PULL_FROM_SCROLL ? null : Gesture.Simultaneous(scroll, drag), style };
}

/** The page's scroll view under the pull's gesture, or as it is where the scroll gives the pull. */
export function PullDetector({
  gesture,
  children,
}: {
  readonly gesture: ReturnType<typeof useOverscrollPull>['gesture'];
  readonly children: ReactElement;
}) {
  return gesture ? <GestureDetector gesture={gesture}>{children}</GestureDetector> : children;
}
