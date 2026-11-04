import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves } from '@6pm/theme';

import { easeOut } from '../../ui/motion/curves';
import { useTheme } from '../../ui/theme/theme';

/** The three panels under the hero, in the order their parts sit in the split. */
export type PanelKind = 'bills' | 'pots' | 'free';
const ORDER: Readonly<Record<PanelKind, number>> = { bills: 0, pots: 1, free: 2 };

/** The design's rise: 300 ms on the entrance curve, for the panel coming in and the card resizing. */
const IN_MS = 300;
/** The old panel is already being left, so it goes quicker than the new one arrives. */
const OUT_MS = 150;
/** Reduce Motion: no travel, a quick crossfade. */
const FADE_MS = 200;
/** How far a panel slides in from (and out towards) the side of the part it belongs to. */
const SHIFT = 24;
/** The card rising in on first view, as the design's `rise`. */
const RISE = 12;
const enterEase = Easing.bezier(...curves.enter);
const resize = { duration: IN_MS, dampingRatio: 1, reduceMotion: ReduceMotion.Never } as const;
const never = ReduceMotion.Never;

type Side = -1 | 0 | 1;
interface Layer {
  readonly kind: PanelKind;
  /** The panel on show; the rest are on their way out. */
  readonly on: boolean;
  /** The side it comes in from, or leaves towards. */
  readonly side: Side;
}

/** The layers after `to` is chosen over `from`: it comes in from its side, the others leave. */
function switched(layers: readonly Layer[], from: PanelKind, to: PanelKind): Layer[] {
  const dir: Side = ORDER[to] > ORDER[from] ? 1 : -1;
  const kept = layers.map((l): Layer => {
    if (l.kind === to) return { kind: to, on: true, side: dir };
    return l.on ? { kind: l.kind, on: false, side: dir === 1 ? -1 : 1 } : l;
  });
  return kept.some((l) => l.kind === to) ? kept : [...kept, { kind: to, on: true, side: dir }];
}

/**
 * The card under the hero. Choosing another part slides its panel in from that part's side while
 * the old one leaves the other way, and the card eases to the new panel's height, so nothing
 * below jumps. A tap mid-switch turns each panel round from wherever it is; a panel tapped back
 * before it has gone comes back the way it left.
 */
export function PanelSwitch({
  active,
  grow,
  children,
}: {
  readonly active: PanelKind;
  /** Changes each time the split draws in again; the card rises with it. 0: not yet. */
  readonly grow: number;
  readonly children: (kind: PanelKind) => ReactNode;
}) {
  const { palette } = useTheme();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(active);
  const [layers, setLayers] = useState<readonly Layer[]>(() => [
    { kind: active, on: true, side: 0 },
  ]);
  // Swapped while rendering, so the new panel is in the same frame as the ring moving.
  if (shown !== active) {
    setShown(active);
    setLayers((l) => switched(l, shown, active));
  }

  const gone = useCallback((kind: PanelKind) => {
    setLayers((l) => l.filter((x) => x.on || x.kind !== kind));
  }, []);

  // The card's height: free until the first panel lays out, then eased to each panel's own.
  const height = useSharedValue(-1);
  const heights = useRef<Partial<Record<PanelKind, number>>>({});
  const current = useRef(active);
  const fit = useCallback(
    (h: number) => {
      if (height.get() < 0) {
        height.set(h);
        return;
      }
      // A spring with no bounce: it starts gently, so the card grows rather than snaps, and a
      // tap mid-resize carries on from the card's speed instead of starting over.
      height.set(
        reduced
          ? withTiming(h, { duration: FADE_MS, easing: easeOut, reduceMotion: never })
          : withSpring(h, resize),
      );
    },
    [height, reduced],
  );
  const measured = useCallback(
    (kind: PanelKind, h: number) => {
      heights.current[kind] = h;
      if (kind === current.current) fit(h);
    },
    [fit],
  );
  useEffect(() => {
    current.current = active;
    const h = heights.current[active];
    if (h !== undefined) fit(h);
  }, [active, fit]);

  const risen = useSharedValue(0);
  useEffect(() => {
    if (grow === 0) return;
    risen.set(0);
    risen.set(
      withTiming(1, {
        duration: reduced ? FADE_MS : IN_MS,
        easing: reduced ? easeOut : enterEase,
        reduceMotion: never,
      }),
    );
  }, [grow, reduced, risen]);

  const card = useAnimatedStyle(() => {
    const h = height.get();
    const r = risen.get();
    return {
      ...(h < 0 ? {} : { height: h }),
      opacity: r,
      transform: [{ translateY: reduced ? 0 : RISE * (1 - r) }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          overflow: 'hidden',
        },
        card,
      ]}
    >
      {layers.map((l) => (
        <PanelLayer key={l.kind} layer={l} reduced={reduced} onGone={gone} onHeight={measured}>
          {children(l.kind)}
        </PanelLayer>
      ))}
    </Animated.View>
  );
}

/** One panel in the card: the one on show sizes the card; a leaving one floats over it, fading. */
function PanelLayer({
  layer,
  reduced,
  onGone,
  onHeight,
  children,
}: {
  readonly layer: Layer;
  readonly reduced: boolean;
  readonly onGone: (kind: PanelKind) => void;
  readonly onHeight: (kind: PanelKind, height: number) => void;
  readonly children: ReactNode;
}) {
  const { kind, on, side } = layer;
  // A panel arriving starts off to its side and clear; the first one is simply there.
  const x = useSharedValue(reduced ? 0 : side * SHIFT);
  const opacity = useSharedValue(side === 0 ? 1 : 0);

  useEffect(() => {
    if (on) {
      const timing = {
        duration: reduced ? FADE_MS : IN_MS,
        easing: reduced ? easeOut : enterEase,
        reduceMotion: never,
      };
      x.set(withTiming(0, timing));
      opacity.set(withTiming(1, timing));
      return;
    }
    const timing = { duration: reduced ? FADE_MS : OUT_MS, easing: easeOut, reduceMotion: never };
    x.set(withTiming(reduced ? 0 : side * SHIFT, timing));
    opacity.set(
      withTiming(0, timing, (finished) => {
        if (finished) scheduleOnRN(onGone, kind);
      }),
    );
  }, [on, side, reduced, kind, onGone, x, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: x.get() }],
  }));

  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) => onHeight(kind, e.nativeEvent.layout.height)}
      pointerEvents={on ? 'auto' : 'none'}
      accessibilityElementsHidden={!on}
      importantForAccessibility={on ? 'auto' : 'no-hide-descendants'}
      style={[on ? null : { position: 'absolute', top: 0, left: 0, right: 0 }, style]}
    >
      {children}
    </Animated.View>
  );
}
