import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves } from '@6pm/theme';

import { easeOut } from '../../ui/motion/curves';
import { useTheme } from '../../ui/theme/theme';

/** The three panels under the hero, in the order their parts sit in the split. */
export type PanelKind = 'bills' | 'pots' | 'free';
const ORDER: Readonly<Record<PanelKind, number>> = { bills: 0, pots: 1, free: 2 };
/** Nobody holds the card: the old panel has gone and the new one may come in. */
const FREE = -1;

/** The old panel steps out first, quickly, so the two are never on screen together. */
const OUT_MS = 120;
/** Then the new one comes in on the entrance curve. */
const IN_MS = 240;
/** Reduce Motion: the same hand-off, as two short fades with no travel. */
const QUIET_MS = 100;
/** The card rising in on first view, as the design's `rise` (300 ms, 12 pt). */
const RISE_MS = 300;
const RISE = 12;
/** Travel: in from the tapped part's side, out the other way, half as far. */
const SHIFT_IN = 24;
const SHIFT_OUT = 12;
const enterEase = Easing.bezier(...curves.enter);
const exitEase = Easing.in(Easing.quad);
const never = ReduceMotion.Never;
/** The card's height runs across both halves of the hand-off, with no bounce. */
const resize = { duration: OUT_MS + IN_MS, dampingRatio: 1, reduceMotion: never } as const;

type Side = -1 | 0 | 1;
interface Layer {
  readonly kind: PanelKind;
  /** The panel chosen; the rest are on their way out (or were never seen and simply go). */
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
 * The card under the hero. Choosing another part hands the card over: the old panel slips out
 * away from the tapped part, then the new one comes in from its side, while the card springs to
 * the new panel's height across both, so the page never jumps. Only one panel is ever visible.
 * A tap while the old one is leaving skips straight to the newest choice; a tap while the new one
 * is arriving turns it round from where it is.
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

  // Which panel holds the card (visible, or leaving), and which one has been chosen. Kept on the
  // UI thread so the hand-off happens in the frame the old panel reaches zero.
  const stage = useSharedValue(ORDER[active]);
  const target = useSharedValue(ORDER[active]);
  useEffect(() => {
    target.set(ORDER[active]);
  }, [active, target]);

  // The card's height: free until the first panel lays out, then sprung to each panel's own.
  const height = useSharedValue(-1);
  const heights = useRef<Partial<Record<PanelKind, number>>>({});
  const current = useRef(active);
  const fit = useCallback(
    (h: number) => {
      if (height.get() < 0) {
        height.set(h);
        return;
      }
      height.set(
        reduced
          ? withTiming(h, { duration: QUIET_MS * 2, easing: easeOut, reduceMotion: never })
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
        duration: reduced ? QUIET_MS * 2 : RISE_MS,
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
        <PanelLayer
          key={l.kind}
          layer={l}
          reduced={reduced}
          stage={stage}
          target={target}
          onGone={gone}
          onHeight={measured}
        >
          {children(l.kind)}
        </PanelLayer>
      ))}
    </Animated.View>
  );
}

/**
 * One panel in the card. The chosen one sizes the card and waits, clear, until the card is free;
 * a leaving one floats over it until it has faded, then frees the card.
 */
function PanelLayer({
  layer,
  reduced,
  stage,
  target,
  onGone,
  onHeight,
  children,
}: {
  readonly layer: Layer;
  readonly reduced: boolean;
  readonly stage: SharedValue<number>;
  readonly target: SharedValue<number>;
  readonly onGone: (kind: PanelKind) => void;
  readonly onHeight: (kind: PanelKind, height: number) => void;
  readonly children: ReactNode;
}) {
  const { kind, on, side } = layer;
  const me = ORDER[kind];
  // A panel arriving waits off to its side and clear; the first one is simply there.
  const x = useSharedValue(reduced ? 0 : side * SHIFT_IN);
  const opacity = useSharedValue(side === 0 ? 1 : 0);
  const wanted = useSharedValue(on);
  const towards = useSharedValue<Side>(side);
  useEffect(() => {
    towards.set(side);
    wanted.set(on);
  }, [on, side, towards, wanted]);

  useAnimatedReaction(
    () => ({ want: wanted.get(), held: stage.get(), next: target.get() }),
    ({ want, held, next }, before) => {
      if (before !== null && before.want === want && before.held === held && before.next === next) {
        return;
      }
      if (want) {
        // In once the card is ours: still holding it (turned round mid-exit), or free and chosen.
        if (held !== me && !(held === FREE && next === me)) return;
        if (held === FREE) stage.set(me);
        const timing = {
          duration: reduced ? QUIET_MS : IN_MS,
          easing: reduced ? easeOut : enterEase,
          reduceMotion: never,
        };
        x.set(withTiming(0, timing));
        opacity.set(withTiming(1, timing));
        return;
      }
      if (held !== me) {
        // Never seen (it was still waiting): it simply goes.
        if (!before || before.want) scheduleOnRN(onGone, kind);
        return;
      }
      if (before && !before.want && before.held === me) return;
      const free = () => {
        'worklet';
        stage.set(FREE);
        scheduleOnRN(onGone, kind);
      };
      if (opacity.get() === 0) {
        free();
        return;
      }
      const timing = {
        duration: reduced ? QUIET_MS : OUT_MS,
        easing: reduced ? easeOut : exitEase,
        reduceMotion: never,
      };
      x.set(withTiming(reduced ? 0 : towards.get() * SHIFT_OUT, timing));
      opacity.set(
        withTiming(0, timing, (finished) => {
          if (finished) free();
        }),
      );
    },
  );

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
