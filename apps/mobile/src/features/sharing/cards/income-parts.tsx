import { Canvas, Group } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves, springs, type ShareInks } from '@6pm/theme';

import { BoxLayer } from '../../../ui/sky/scenes/boxes/box-layer';
import { parseBoxes, type Box } from '../../../ui/sky/scenes/boxes/box-model';
import { useSceneMotionValues, type SceneMotion } from '../../../ui/sky/scenes/boxes/scene-motion';
import { InkedAmount, kicker, ON_CARD, Rule } from './card-parts';
import type { ArtBox } from './card-size';

/**
 * What the cards for money that is not one salary share: the mono rows under a dashed rule, an
 * amount under ink that a tap can lift, and art that draws itself in turn as the preview opens.
 */

/** The rows under the picture: a dashed rule, then a label and its count or amount a line. */
export function CardRows({
  inks,
  children,
}: {
  readonly inks: ShareInks;
  readonly children: ReactNode;
}) {
  return (
    <View style={{ gap: 5, paddingTop: 10 }}>
      <Rule rule={inks.rule} style={{ position: 'absolute', left: 0, right: 0, top: 0 }} />
      {children}
    </View>
  );
}

/** One row: the label in caps and its value; `strong` is the row an amount closes on. */
export function CardRow({
  inks,
  label,
  value,
  strong = false,
}: {
  readonly inks: ShareInks;
  readonly label: string;
  readonly value: ReactNode;
  readonly strong?: boolean;
}) {
  const style = { ...kicker(inks, 11.5, 0, strong ? 600 : 400), color: inks.ink };
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text {...ON_CARD} numberOfLines={1} style={{ ...style, flexShrink: 1 }}>
        {label.toLocaleUpperCase()}
      </Text>
      {typeof value === 'string' ? (
        <Text {...ON_CARD} numberOfLines={1} style={style}>
          {value.toLocaleUpperCase()}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

/** The row's amount under the card's ink, as the month card's Spent. */
export function RowAmount({
  inks,
  text,
  shown,
}: {
  readonly inks: ShareInks;
  readonly text: string;
  readonly shown: boolean;
}) {
  return (
    <InkedAmount
      text={text}
      shown={shown}
      ink={inks.ink}
      style={{ ...kicker(inks, 11.5, 0, 600), color: inks.ink }}
    />
  );
}

/** An amount that a tap inks or lifts (the thank-you's figure). */
export function TappableAmount({
  shown,
  onAmounts,
  label,
  children,
}: {
  readonly shown: boolean;
  readonly onAmounts: ((shown: boolean) => void) | undefined;
  readonly label: string;
  readonly children: ReactNode;
}) {
  if (!onAmounts) return <>{children}</>;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: shown }}
      hitSlop={8}
      onPress={() => onAmounts(!shown)}
    >
      {children}
    </Pressable>
  );
}

/**
 * How a box of the art comes in: rising from its foot on the entrance curve (`rise`) or on the pop
 * spring (`springRise`), or popping from its middle on the pop spring (`pop`).
 */
export interface Entrance {
  readonly kind: 'rise' | 'springRise' | 'pop';
  /** When it starts, and for a rise how long it takes, in milliseconds. */
  readonly at: number;
  readonly ms?: number;
}

/** A rise: 300 ms on the entrance curve. */
export const RISE_MS = 300;
const riseEase = Easing.bezierFn(...curves.enter);
/** The pop spring (`springs.pop`) settles in about 600 ms. */
export const POP_MS = 600;

/** The pop spring's travel at `ms` after it starts: under-damped, a small overshoot, then 1. */
function popAt(ms: number): number {
  'worklet';
  if (ms <= 0) return 0;
  const { damping, stiffness, mass } = springs.pop;
  const w = Math.sqrt(stiffness / mass);
  const z = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = w * Math.sqrt(1 - z * z);
  const s = ms / 1000;
  return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + ((z * w) / wd) * Math.sin(wd * s));
}

function progress(clock: number, entrance: Entrance): number {
  'worklet';
  const local = clock - entrance.at;
  if (entrance.kind !== 'rise') return popAt(local);
  const ms = entrance.ms ?? RISE_MS;
  return riseEase(Math.min(1, Math.max(0, local / ms)));
}

/** When the last of the entrances is done. */
export function entrancesMs(entrances: readonly (Entrance | null)[]): number {
  return entrances.reduce(
    (most, e) =>
      e === null ? most : Math.max(most, e.at + (e.kind === 'rise' ? (e.ms ?? RISE_MS) : POP_MS)),
    0,
  );
}

/**
 * The art's clock in milliseconds, run once from 0 when the card appears; already at rest when the
 * card is drawn `still` or the phone asks for less motion.
 */
export function useEntranceClock(total: number, still: boolean): SharedValue<number> {
  const reduce = useReducedMotion();
  const clock = useSharedValue(still || reduce ? total : 0);
  useEffect(() => {
    if (still || reduce || total <= 0) return;
    clock.set(0);
    clock.set(withTiming(total, { duration: total, easing: Easing.linear }));
  }, [clock, total, still, reduce]);
  return clock;
}

const px = (n: number) => `${n}px`;

const InTurn = memo(function InTurn({
  box,
  entrance,
  clock,
  time,
  motion,
}: {
  readonly box: Box;
  readonly entrance: Entrance | null;
  readonly clock: SharedValue<number>;
  readonly time: SharedValue<number>;
  readonly motion: SceneMotion;
}) {
  const boxes = useMemo(() => [box], [box]);
  const transform = useDerivedValue(() => {
    if (entrance === null) return [];
    const p = Math.max(0.001, progress(clock.get(), entrance));
    if (entrance.kind === 'pop') {
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      return [
        { translateX: cx },
        { translateY: cy },
        { scale: p },
        { translateX: -cx },
        { translateY: -cy },
      ];
    }
    const foot = box.y + box.h;
    return [{ translateY: foot }, { scaleY: p }, { translateY: -foot }];
  });
  return (
    <Group transform={transform}>
      <BoxLayer boxes={boxes} time={time} motion={motion} />
    </Group>
  );
});

/**
 * The card's art in one canvas, each box coming in on its own entrance (null: there from the first
 * frame), as `CardArt` draws boxes at rest.
 */
export function ArtInTurn({
  boxes,
  entrances,
  width,
  height,
  clock,
}: {
  readonly boxes: readonly ArtBox[];
  readonly entrances: readonly (Entrance | null)[];
  readonly width: number;
  readonly height: number;
  readonly clock: SharedValue<number>;
}) {
  const time = useSharedValue(0);
  const motion = useSceneMotionValues();
  const key = useMemo(() => JSON.stringify(boxes), [boxes]);
  // Each box parsed on its own, so a box the parser leaves out never shifts the entrances.
  const parsed = useMemo(
    () =>
      (JSON.parse(key) as ArtBox[]).flatMap((b, i) => {
        const [box] = parseBoxes(
          [{ ...b, l: px(b.l), t: px(b.t), w: px(b.w), h: px(b.h) }],
          width,
          height,
        );
        return box ? [{ box, i }] : [];
      }),
    [key, width, height],
  );
  return (
    <Canvas pointerEvents="none" style={{ width, height }}>
      {parsed.map(({ box, i }) => (
        <InTurn
          key={i}
          box={box}
          entrance={entrances[i] ?? null}
          clock={clock}
          time={time}
          motion={motion}
        />
      ))}
    </Canvas>
  );
}

/** The companion's line for a card: its key by persona, or null in serious mode. */
export function companionLine(
  t: (key: string, params: Record<string, string | number>) => string,
  plan: { readonly persona?: string; readonly serious?: boolean } | null,
  event: string,
  params: Record<string, string | number>,
): string | null {
  if (plan?.serious) return null;
  return t(`companion.${event}.${plan?.persona ?? 'cheeky'}`, params);
}
