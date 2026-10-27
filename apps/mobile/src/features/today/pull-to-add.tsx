import { useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { paperInk, pullInk } from '@6pm/theme';

import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { PaperEdge } from '../../ui/paper-edge';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import type { HomePull } from '../home/home-scroll';

/** How far Today is pulled past its top before letting go opens Quick add. */
export const PULL_REACH = 96;
/** The pull the slot waits for before it feeds any paper: a scroll's own bounce shows nothing. */
const FEED_FROM = 10;
/** A printer's tick for every this much paper fed, on the way to the reach. */
const FEED_TICK = 28;
const SLOT_WIDTH = 168;
const SLOT_HEIGHT = 10;
const TICKET_WIDTH = 150;
/** The ticket's paper, without its torn edge. */
const TICKET_HEIGHT = 74;
const EDGE = 7;
/** How long the ticket takes to ink its "+" and swap its word at the reach. */
const ARM_MS = 160;
/** How far the torn-off ticket falls, toward Quick add's own ticket rising to meet it. */
const FALL = 300;

/** Runs on the UI thread: `v` between 0 and 1. */
function clamp01(v: number): number {
  'worklet';
  return Math.min(1, Math.max(0, v));
}

/**
 * Today's pull: how far it is pulled, and what letting go far enough does. The ticket tears off
 * and falls as Quick add rises, and is back in its slot by the time Today has bounced home.
 */
export function usePullToAdd(onAdd: () => void): {
  pulling: HomePull;
  leave: SharedValue<number>;
} {
  const pull = useSharedValue(0);
  const leave = useSharedValue(0);
  const onRelease = useCallback(() => {
    haptics.commit();
    // A spring, not a curve: the ticket falls loose, as torn paper does.
    leave.set(
      withSpring(1, {
        damping: 18,
        stiffness: 160,
        mass: 0.9,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
      }),
    );
    onAdd();
  }, [leave, onAdd]);
  // Home again, the ticket that left is back in the slot, ready for the next pull.
  useAnimatedReaction(
    () => pull.get() === 0,
    (home) => {
      if (home && leave.get() > 0) leave.set(0);
    },
  );
  return { pulling: { pull, reach: PULL_REACH, onRelease }, leave };
}

/**
 * The island prints a ticket. As Today is pulled down past its top, a slot opens under the status
 * bar and a little receipt feeds out of it, a point of paper for each point pulled, with a
 * printer's tick every few lines. It hangs from the slot and swings a touch with the speed of the
 * pull. Far enough, it pops, its "+" inks in the accent with a quarter turn and it says to let go;
 * let go there and it tears off and falls into Quick add as the sheet rises. Let go short, and it
 * feeds back in with the bounce. Everything but the swap, the pop and the fall follows the finger.
 */
export function PullToAdd({
  pull,
  leave,
  heading,
  pullLabel,
  releaseLabel,
}: {
  readonly pull: SharedValue<number>;
  readonly leave: SharedValue<number>;
  /** The ticket's number line: "6pm · Nº 034". */
  readonly heading: string;
  readonly pullLabel: string;
  readonly releaseLabel: string;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const still = useReducedMotion();

  const armed = useSharedValue(0);
  const pop = useSharedValue(1);
  const sway = useSharedValue(0);
  useAnimatedReaction(
    () => pull.get(),
    (now, before) => {
      if (before === null || leave.get() > 0) return;
      // A printer's tick for each stretch of paper fed on the way out, none on the way back in.
      const fed = Math.floor(Math.max(0, now - FEED_FROM) / FEED_TICK);
      const was = Math.floor(Math.max(0, before - FEED_FROM) / FEED_TICK);
      if (now < PULL_REACH && now > before && fed > was) scheduleOnRN(haptics.tick);
      // The paper hangs from the slot: a quick pull swings it, and it settles when the pull does.
      if (!still) {
        const lean = Math.max(-2.4, Math.min(2.4, (now - before) * 0.4));
        sway.set(withSpring(lean, { damping: 10, stiffness: 170, mass: 0.6 }));
      }
      // Crossing into "let go" (and back out) is one moment, not a blend.
      const ready = now >= PULL_REACH;
      if (ready === before >= PULL_REACH) return;
      scheduleOnRN(ready ? haptics.tap : haptics.tick);
      armed.set(
        withTiming(ready ? 1 : 0, {
          duration: ARM_MS,
          easing: easeOut,
          reduceMotion: ReduceMotion.System,
        }),
      );
      if (ready && !still) {
        pop.set(
          withSequence(
            withTiming(1.045, { duration: 90, easing: easeOut }),
            withSpring(1, { damping: 9, stiffness: 260 }),
          ),
        );
      }
    },
    [still],
  );

  const slot = useAnimatedStyle(() => {
    const open = clamp01(pull.get() / 36);
    // The slot shuts while the ticket is still falling: it never lingers over the page.
    const shut = clamp01(leave.get() * 2.2);
    return {
      opacity: clamp01(pull.get() / 16) * (1 - shut),
      height: 2 + (SLOT_HEIGHT - 2) * open * (1 - shut),
      transform: [{ scaleX: 0.55 + 0.45 * open }],
    };
  });
  const ticket = useAnimatedStyle(() => {
    const p = pull.get();
    const feed = clamp01((p - FEED_FROM) / (PULL_REACH - FEED_FROM));
    // Past the reach the paper keeps coming, a third as fast: it never runs out, never runs away.
    const over = Math.max(0, p - PULL_REACH) * 0.32;
    const gone = leave.get();
    const full = TICKET_HEIGHT + EDGE;
    // Tucked in the slot its shadow would still fall below it: at rest there is no ticket at all.
    const fed = clamp01((p - 2) / (FEED_FROM - 2));
    return {
      opacity: fed * (1 - clamp01((gone - 0.55) / 0.45)),
      transform: [
        { translateY: -full + feed * full + over + gone * FALL },
        { rotate: `${sway.get() + gone * 6}deg` },
        { scale: pop.get() * (1 + gone * 0.12) },
      ],
    };
  });
  const ready = useAnimatedStyle(() => ({
    opacity: armed.get(),
    transform: [{ translateY: (1 - armed.get()) * 5 }],
  }));
  const waiting = useAnimatedStyle(() => ({
    opacity: 1 - armed.get(),
    transform: [{ translateY: armed.get() * -5 }],
  }));
  const disc = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(armed.get(), [0, 1], [pullInk.discIdle, palette.accent]),
    transform: [{ scale: 1 + 0.1 * armed.get() }, { rotate: `${armed.get() * 90}deg` }],
  }));
  const plusIdle = useAnimatedStyle(() => ({ opacity: 1 - armed.get() }));
  // Only while there is paper under the slot to fall on.
  const shade = useAnimatedStyle(() => ({
    opacity: clamp01((pull.get() - FEED_FROM) / 8) * (1 - leave.get()),
  }));
  const label = {
    ...body(14, 650),
    color: paperInk.ink,
    position: 'absolute',
    left: 0,
  } as const;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 4,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 30,
      }}
    >
      {/* The slot: a dark mouth with a lip, opening as the pull begins. */}
      <View style={{ height: SLOT_HEIGHT, justifyContent: 'center', zIndex: 2 }}>
        <Animated.View
          style={[
            {
              width: SLOT_WIDTH,
              borderRadius: SLOT_HEIGHT / 2,
              backgroundColor: pullInk.slot,
              boxShadow: `inset 0 2px 3px ${pullInk.slotDepth}, 0 1px 0 ${pullInk.slotLip}`,
            },
            slot,
          ]}
        />
      </View>
      {/* Only the paper already fed is seen: it is cut off where it leaves the slot. */}
      <View
        style={{
          width: SLOT_WIDTH,
          height: TICKET_HEIGHT + EDGE + FALL + 40,
          marginTop: -SLOT_HEIGHT / 2,
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              width: TICKET_WIDTH,
              transformOrigin: '50% 0%',
            },
            ticket,
          ]}
        >
          <View
            style={{
              // The paper casts the shadow, not its torn edge, which would show it between the teeth.
              boxShadow: `0 10px 18px ${pullInk.ticketShadow}`,
              height: TICKET_HEIGHT,
              experimental_backgroundImage: `linear-gradient(180deg, ${pullInk.paperTop}, ${paperInk.sheet})`,
              paddingTop: 10,
              paddingHorizontal: 14,
              gap: 8,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...mono(9.5, 400, 0.14),
                color: paperInk.soft,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {heading}
            </Text>
            <DashedRule color={paperInk.rule} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Animated.View
                style={[
                  {
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  disc,
                ]}
              >
                <Animated.View style={[{ position: 'absolute' }, plusIdle]}>
                  <Symbol name="add" size={16} color={paperInk.ink} />
                </Animated.View>
                <Animated.View style={[{ position: 'absolute' }, ready]}>
                  <Symbol name="add" size={16} color={palette.accentFg} />
                </Animated.View>
              </Animated.View>
              {/* Both words in one box, swapping in place, so the row never shifts. */}
              <View style={{ width: 96, height: 19, justifyContent: 'center' }}>
                <Animated.Text numberOfLines={1} style={[label, waiting]}>
                  {pullLabel}
                </Animated.Text>
                <Animated.Text numberOfLines={1} style={[label, ready]}>
                  {releaseLabel}
                </Animated.Text>
              </View>
            </View>
          </View>
          <PaperEdge color={paperInk.sheet} height={EDGE} />
        </Animated.View>
        {/* The slot's shadow on the paper just leaving it, so it reads as coming from inside. */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              width: TICKET_WIDTH,
              height: 10,
              experimental_backgroundImage: `linear-gradient(180deg, ${pullInk.slotShade}, transparent)`,
            },
            shade,
          ]}
        />
      </View>
    </View>
  );
}
