import { useMemo } from 'react';
import {
  Easing,
  ReduceMotion,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import {
  blendHeaders,
  headerRise,
  scrolledAway,
  type HeaderGeom,
  type HeaderText,
  type SkyHeader,
} from '../../ui/sky/sky-header';

/** The art moving between Today's place and a header's room, when a tab is chosen by a tap. */
const MOVE = {
  duration: 720,
  easing: Easing.bezier(...curves.enter),
  reduceMotion: ReduceMotion.System,
} as const;
/** The entrance clock (a sway dying away, a neon strike) each time a tab is shown. */
const ENTER = { duration: 1400, easing: Easing.linear, reduceMotion: ReduceMotion.System } as const;

const clamp01 = (v: number) => {
  'worklet';
  return Math.max(0, Math.min(1, v));
};

/**
 * The sky's view of the home pages: Today (page 0) leaves its art where the look draws it; Plan and
 * Diary have headers, so the art moves clear of the one in view. A swipe moves it with the finger;
 * a tapped tab moves it with the entrance curve; each tab shown starts the entrance clock.
 */
export function useSkyHeader({
  position,
  tabIndex,
  geoms,
  scroll,
}: {
  /** The pager's position, in pages. */
  readonly position: SharedValue<number>;
  readonly tabIndex: SharedValue<number>;
  /** Each page's measured header, by tab index. */
  readonly geoms: readonly [
    SharedValue<HeaderGeom>,
    SharedValue<HeaderGeom>,
    SharedValue<HeaderGeom>,
  ];
  readonly scroll: SharedValue<number>;
}): SkyHeader {
  const away = useSharedValue(clamp01(position.get()));
  const enter = useSharedValue(0);
  const [today, plan, diary] = geoms;

  useAnimatedReaction(
    () => position.get(),
    (p, previous) => {
      const target = clamp01(p);
      if (previous === null) return;
      // A tab tapped jumps the pager a whole page; a finger moves it a little each frame.
      away.set(Math.abs(p - previous) > 0.5 ? withTiming(target, MOVE) : target);
    },
  );
  useAnimatedReaction(
    () => tabIndex.get(),
    (index, previous) => {
      if (previous !== null && index === previous) return;
      enter.set(withSequence(withTiming(0, { duration: 0 }), withTiming(1, ENTER)));
    },
  );
  const geom = useDerivedValue(() => {
    const p = position.get();
    if (p <= 0) return today.value;
    if (p < 1) return blendHeaders(today.value, plan.value, p);
    if (p < 2) return blendHeaders(plan.value, diary.value, p - 1);
    return diary.value;
  });
  // Today's date rides its hero, which drifts down at half the scroll and fades over 300 pt;
  // the other headers drift at a third and are gone by 70 pt.
  const text = useDerivedValue<HeaderText>(() => {
    const y = scroll.value;
    return position.get() < 0.5
      ? { dy: -0.5 * y, shown: clamp01(1 - y / 300) }
      : { dy: headerRise(y), shown: 1 - scrolledAway(y) };
  });
  return useMemo(() => ({ away, geom, scroll, enter, text }), [away, geom, scroll, enter, text]);
}
