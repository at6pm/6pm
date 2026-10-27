import { useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { paperInk, pullInk } from '@6pm/theme';

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
const FEED_FROM = 14;
const TICKET_WIDTH = 176;
/** The ticket's paper, without its torn edge. */
const TICKET_HEIGHT = 62;
const EDGE = 9;
const SLOT_WIDTH = 132;
/** How long the ticket takes to ink its "+" and swap its word at the reach. */
const ARM_MS = 160;

/** Runs on the UI thread: `v` between 0 and 1. */
function clamp01(v: number): number {
  'worklet';
  return Math.min(1, Math.max(0, v));
}

/**
 * Today's pull: how far it is pulled, and what letting go far enough does. The ticket drops away
 * as Quick add rises, and is back in its slot by the time Today has bounced home.
 */
export function usePullToAdd(onAdd: () => void): { pulling: HomePull; leave: SharedValue<number> } {
  const pull = useSharedValue(0);
  const leave = useSharedValue(0);
  const onRelease = useCallback(() => {
    haptics.tap();
    leave.set(withTiming(1, { duration: 320, easing: easeOut, reduceMotion: ReduceMotion.System }));
    onAdd();
  }, [leave, onAdd]);
  // Home again, the ticket that left is back in the slot, ready for the next pull.
  useAnimatedReaction(
    () => pull.get() === 0,
    (home) => {
      if (home && leave.get() === 1) leave.set(0);
    },
  );
  return { pulling: { pull, reach: PULL_REACH, onRelease }, leave };
}

/**
 * The island prints a ticket: as Today is pulled down past its top, a printer slot opens under the
 * status bar and a little receipt feeds out of it, one point of paper for each point pulled. Far
 * enough, it straightens, its "+" inks in the accent and it says to let go (with a tick); let go
 * there, and it drops away as Quick add opens. Let go short, and it feeds back in with the bounce.
 * Everything follows the finger on the UI thread; nothing here is timed but the drop.
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
  /** The ticket's number line: "6pm · Nº 008". */
  readonly heading: string;
  readonly pullLabel: string;
  readonly releaseLabel: string;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  // Crossing into "let go" (and back out) is one moment, not a blend: a tick, and the ticket inks
  // its "+" and swaps its word in a quick crossfade, so the two words are never read at once.
  const armed = useSharedValue(0);
  useAnimatedReaction(
    () => pull.get() >= PULL_REACH,
    (ready, was) => {
      if (was === null || ready === was) return;
      if (leave.get() === 0) scheduleOnRN(haptics.tick);
      armed.set(
        withTiming(ready ? 1 : 0, {
          duration: ARM_MS,
          easing: easeOut,
          reduceMotion: ReduceMotion.System,
        }),
      );
    },
  );

  const slot = useAnimatedStyle(() => {
    const open = clamp01(pull.get() / 40);
    return {
      opacity: Math.max(clamp01(pull.get() / 18), 0) * (1 - leave.get()),
      transform: [{ scaleX: 0.6 + 0.4 * open }],
    };
  });
  const ticket = useAnimatedStyle(() => {
    const p = pull.get();
    const feed = clamp01((p - FEED_FROM) / (PULL_REACH - FEED_FROM));
    // Past the reach the paper keeps following, a quarter as far: it never runs out.
    const over = Math.max(0, p - PULL_REACH) * 0.25;
    const gone = leave.get();
    const full = TICKET_HEIGHT + EDGE;
    return {
      opacity: 1 - gone,
      transform: [
        { translateY: -full + feed * full + over + gone * 240 },
        // Curled while it feeds, straight once it is far enough; tipped as it drops away.
        { rotate: `${(1 - feed) * -3 + gone * 7}deg` },
      ],
    };
  });
  const ready = useAnimatedStyle(() => ({
    opacity: armed.get(),
    transform: [{ translateY: (1 - armed.get()) * 4 }],
  }));
  const waiting = useAnimatedStyle(() => ({
    opacity: 1 - armed.get(),
    transform: [{ translateY: armed.get() * -4 }],
  }));
  const disc = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(armed.get(), [0, 1], [pullInk.discIdle, palette.accent]),
    transform: [{ scale: 1 + 0.12 * armed.get() }, { rotate: `${armed.get() * 90}deg` }],
  }));
  const plusIdle = useAnimatedStyle(() => ({ opacity: 1 - armed.get() }));

  const top = insets.top + 6;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top, left: 0, right: 0, alignItems: 'center', zIndex: 30 }}
    >
      <Animated.View
        style={[
          {
            width: SLOT_WIDTH,
            height: 8,
            borderRadius: 4,
            backgroundColor: pullInk.slot,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.08)',
            zIndex: 2,
          },
          slot,
        ]}
      />
      {/* The paper is cut off at the slot: only what has fed out is seen. */}
      <View
        style={{
          width: TICKET_WIDTH + 24,
          height: TICKET_HEIGHT + EDGE + 260,
          marginTop: -4,
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={[{ width: TICKET_WIDTH, boxShadow: '0 12px 20px rgba(20,10,30,.25)' }, ticket]}
        >
          <View
            style={{
              height: TICKET_HEIGHT,
              backgroundColor: paperInk.sheet,
              paddingTop: 10,
              paddingHorizontal: 12,
              gap: 7,
            }}
          >
            <Animated.Text
              numberOfLines={1}
              style={{
                ...mono(9.5, 400, 0.14),
                color: paperInk.soft,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {heading}
            </Animated.Text>
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
              {/* Both words in one box, crossfading in place, so the row never shifts. */}
              <View style={{ width: 112, height: 19, justifyContent: 'center' }}>
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    { ...body(14, 650), color: paperInk.ink, position: 'absolute', left: 0 },
                    waiting,
                  ]}
                >
                  {pullLabel}
                </Animated.Text>
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    { ...body(14, 650), color: paperInk.ink, position: 'absolute', left: 0 },
                    ready,
                  ]}
                >
                  {releaseLabel}
                </Animated.Text>
              </View>
            </View>
          </View>
          <PaperEdge color={paperInk.sheet} />
        </Animated.View>
      </View>
    </View>
  );
}
