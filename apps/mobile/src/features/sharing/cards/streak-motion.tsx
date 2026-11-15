import { Canvas, Group } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo, type ReactNode } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves, type ShareInks } from '@6pm/theme';

import { BoxLayer } from '../../../ui/sky/scenes/boxes/box-layer';
import { parseBoxes, type Box } from '../../../ui/sky/scenes/boxes/box-model';
import { useSceneMotionValues, type SceneMotion } from '../../../ui/sky/scenes/boxes/scene-motion';
import { CardArt } from './card-art';
import type { ArtBox } from './card-size';

/** Each band grows out from the left as the canvas's `bandIn`: 700 ms on the entrance curve. */
const BAND_IN_MS = 700;
const bandEase = Easing.bezierFn(...curves.enter);

/** The bands follow one another 90 ms apart up to ten, 30 ms up to forty, 8 ms past that. */
export function bandStagger(count: number): number {
  return count > 40 ? 8 : count > 10 ? 30 : 90;
}

/** How long the streak card takes to draw its bands in, so a capture waits for them. */
export function bandsSettleMs(count: number): number {
  return BAND_IN_MS + bandStagger(count) * Math.max(0, count - 1);
}

function growth(clock: number, index: number, stagger: number): number {
  'worklet';
  const local = Math.min(1, Math.max(0, (clock - index * stagger) / BAND_IN_MS));
  return bandEase(local);
}

/**
 * The bands' clock in milliseconds, run once from 0 when the card appears; already at rest when
 * the card is drawn `still` or the phone asks for less motion.
 */
export function useBandClock(count: number, still: boolean): SharedValue<number> {
  const reduce = useReducedMotion();
  const total = bandsSettleMs(count);
  const clock = useSharedValue(still || reduce ? total : 0);
  useEffect(() => {
    if (still || reduce) return;
    clock.set(0);
    clock.set(withTiming(total, { duration: total, easing: Easing.linear }));
  }, [clock, total, still, reduce]);
  return clock;
}

const px = (n: number) => `${n}px`;

const Band = memo(function Band({
  box,
  index,
  stagger,
  clock,
  time,
  motion,
}: {
  readonly box: Box;
  readonly index: number;
  readonly stagger: number;
  readonly clock: SharedValue<number>;
  readonly time: SharedValue<number>;
  readonly motion: SceneMotion;
}) {
  const boxes = useMemo(() => [box], [box]);
  const transform = useDerivedValue(() => [
    { translateX: box.x },
    { scaleX: Math.max(0.001, growth(clock.get(), index, stagger)) },
    { translateX: -box.x },
  ]);
  return (
    <Group transform={transform}>
      <BoxLayer boxes={boxes} time={time} motion={motion} />
    </Group>
  );
});

/** The evenings' bands in one canvas, each growing from its left edge in turn. */
export function GrowingBands({
  boxes,
  width,
  height,
  clock,
}: {
  readonly boxes: readonly ArtBox[];
  readonly width: number;
  readonly height: number;
  readonly clock: SharedValue<number>;
}) {
  const time = useSharedValue(0);
  const motion = useSceneMotionValues();
  const key = useMemo(() => JSON.stringify(boxes), [boxes]);
  const parsed = useMemo(
    () =>
      parseBoxes(
        (JSON.parse(key) as ArtBox[]).map((b) => ({
          ...b,
          l: px(b.l),
          t: px(b.t),
          w: px(b.w),
          h: px(b.h),
        })),
        width,
        height,
      ),
    [key, width, height],
  );
  const stagger = bandStagger(parsed.length);
  return (
    <Canvas pointerEvents="none" style={{ position: 'absolute', width, height }}>
      {parsed.map((box, i) => (
        <Band
          key={i}
          box={box}
          index={i}
          stagger={stagger}
          clock={clock}
          time={time}
          motion={motion}
        />
      ))}
    </Canvas>
  );
}

/** A band's label, growing out from the left with its band. */
export function GrowingRow({
  clock,
  index,
  count,
  style,
  children,
}: {
  readonly clock: SharedValue<number>;
  readonly index: number;
  readonly count: number;
  readonly style: object;
  readonly children: ReactNode;
}) {
  const stagger = bandStagger(count);
  const grow = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0.001, growth(clock.get(), index, stagger)) }],
  }));
  return (
    <Animated.View style={[style, { transformOrigin: 'left center' }, grow]}>
      {children}
    </Animated.View>
  );
}

/** The streak sun's room for its glow, around its 92 pt. */
const GLOW = 100;

/** The canvas's `flick`: lit, dropping to .35 twice in five seconds. */
const FLICK_AT = [0, 0.18, 0.19, 0.205, 0.62, 0.63, 0.64, 1];
const FLICK_TO = [1, 1, 0.35, 1, 1, 0.35, 1, 1];

const LOOPS = {
  sink: { duration: 4000, easing: Easing.bezier(0.42, 0, 0.58, 1), reverse: true },
  sway: { duration: 6000, easing: Easing.bezier(0.42, 0, 0.58, 1), reverse: true },
  flick: { duration: 5000, easing: Easing.linear, reverse: false },
} as const;

/**
 * The sun setting into the streak's panel, moving as the look's sun does while the card is on
 * screen: Golden Hour's sinks 6 pt up and 4 pt down, Neon Alley's tube flickers, Lantern
 * River's lantern sways ±3°. Still when the phone asks for less motion.
 */
export function StreakSun({
  inks,
  left,
  top,
  size,
}: {
  readonly inks: ShareInks;
  /** The sun's top-left corner on the bands' region, in points. */
  readonly left: number;
  readonly top: number;
  readonly size: number;
}) {
  const reduce = useReducedMotion();
  const kind = inks.bigSun.motion;
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduce || kind === 'none') return undefined;
    const loop = LOOPS[kind];
    p.set(0);
    p.set(
      withRepeat(
        withTiming(1, {
          duration: loop.duration,
          easing: loop.easing,
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
        loop.reverse,
      ),
    );
    return () => cancelAnimation(p);
  }, [p, kind, reduce]);
  const moving = useAnimatedStyle(() => {
    const v = p.get();
    if (kind === 'sink') return { transform: [{ translateY: -6 + 10 * v }] };
    if (kind === 'sway') return { transform: [{ rotate: `${-3 + 6 * v}deg` }] };
    if (kind === 'flick') return { opacity: interpolate(v, FLICK_AT, FLICK_TO) };
    return {};
  });
  const box: ArtBox = {
    l: GLOW,
    t: GLOW,
    w: size,
    h: size,
    r: '50%',
    bg: inks.bigSun.bg,
    sh: inks.bigSun.sh,
    ...(inks.bigSun.border === 'none' ? {} : { bd: inks.bigSun.border }),
  };
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: left - GLOW, top: top - GLOW }, moving]}
    >
      <CardArt boxes={[box]} width={size + GLOW * 2} height={size + GLOW * 2} />
    </Animated.View>
  );
}
