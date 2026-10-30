import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '../haptics';
import { Symbol } from '../icons/symbol';
import { easeOut } from '../motion/curves';
import { useTheme } from '../theme/theme';
import { body } from '../type/fonts';
import { PressScale } from './press-scale';

export interface MenuChoice {
  readonly key: string;
  readonly label: string;
}

export interface ChoiceMenuProps {
  readonly choices: readonly MenuChoice[];
  readonly selected: string;
  readonly onSelect: (key: string) => void;
  /** What VoiceOver says the row is for. */
  readonly label: string;
  /** The row itself, laid out: its label, value and chevron. */
  readonly children: ReactNode;
  readonly highlightBleed?: number;
}

const ROW = 46;
const PAD = 7;
const WIDTH = 252;
const RADIUS = 26;
/** How far from the window's edges the menu keeps. */
const MARGIN = 12;
const GAP = 6;
/** iOS's menu: out of its button with a little give, gone at once. */
const OPEN = { damping: 19, stiffness: 320, mass: 0.8, reduceMotion: ReduceMotion.System };
const CLOSE_MS = 150;

interface Anchor {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * A row that opens a menu of choices, drawn here where the system has no pull-down menu to lend
 * (iOS uses its own, in `choice-menu.ios.tsx`): tapped, a frosted menu grows out of the row's right
 * end, the chosen line ticked. Tap a line, or slide a finger over the lines and let go on one; each
 * line crossed ticks. Anywhere else closes it with nothing changed.
 */
export function ChoiceMenu({
  choices,
  selected,
  onSelect,
  label,
  children,
  highlightBleed,
}: ChoiceMenuProps) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  return (
    <View ref={ref} collapsable={false}>
      <PressScale
        highlight
        {...(highlightBleed === undefined ? {} : { highlightBleed })}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={() => {
          haptics.tap();
          ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
        }}
      >
        {children}
      </PressScale>
      {anchor ? (
        <MenuSheet
          anchor={anchor}
          choices={choices}
          selected={selected}
          onDone={(key) => {
            setAnchor(null);
            if (key !== null && key !== selected) onSelect(key);
          }}
        />
      ) : null}
    </View>
  );
}

function MenuSheet({
  anchor,
  choices,
  selected,
  onDone,
}: {
  readonly anchor: Anchor;
  readonly choices: readonly MenuChoice[];
  readonly selected: string;
  readonly onDone: (key: string | null) => void;
}) {
  const { palette } = useTheme();
  const window = useWindowDimensions();
  const open = useSharedValue(0);
  const lit = useSharedValue(-1);
  const closing = useRef(false);

  const height = choices.length * ROW + PAD * 2;
  const room = window.height - (anchor.y + anchor.height) - MARGIN;
  // Under the row when it fits, else over it, as iOS does near the bottom of the screen.
  const below = room >= height + GAP || room > anchor.y;
  const top = below
    ? Math.min(anchor.y + anchor.height + GAP, window.height - MARGIN - height)
    : Math.max(MARGIN, anchor.y - GAP - height);
  const right = Math.max(MARGIN, window.width - (anchor.x + anchor.width));

  const close = (key: string | null) => {
    if (closing.current) return;
    closing.current = true;
    open.set(
      withTiming(0, { duration: CLOSE_MS, easing: easeOut }, (done) => {
        if (done) scheduleOnRN(onDone, key);
      }),
    );
  };
  const choose = (at: number) => {
    const choice = choices[at];
    if (!choice) return;
    haptics.tick();
    close(choice.key);
  };

  // Opening as soon as the sheet is laid out.
  if (open.get() === 0 && !closing.current) open.set(withSpring(1, OPEN));

  const rowAt = (y: number) => {
    'worklet';
    const at = Math.floor((y - PAD) / ROW);
    return at >= 0 && at < choices.length ? at : -1;
  };
  const tick = () => haptics.tick();
  const slide = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      lit.set(rowAt(e.y));
    })
    .onUpdate((e) => {
      const at = rowAt(e.y);
      if (at !== lit.get()) {
        lit.set(at);
        if (at >= 0) scheduleOnRN(tick);
      }
    })
    .onEnd((e) => {
      const at = rowAt(e.y);
      if (at >= 0) scheduleOnRN(choose, at);
    })
    .onFinalize(() => {
      lit.set(-1);
    });

  const menu = useAnimatedStyle(() => {
    const p = open.get();
    return {
      opacity: Math.min(1, p * 1.6),
      transform: [{ scale: 0.35 + 0.65 * p }],
    };
  });

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => close(null)}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable
          accessibilityLabel=""
          style={StyleSheet.absoluteFill}
          onPress={() => close(null)}
        />
        <Animated.View
          accessibilityRole="menu"
          style={[
            {
              position: 'absolute',
              top,
              right,
              width: WIDTH,
              height,
              borderRadius: RADIUS,
              borderCurve: 'continuous',
              overflow: 'hidden',
              boxShadow: '0 14px 44px rgba(0,0,0,.24)',
              transformOrigin: below ? '100% 0%' : '100% 100%',
            },
            menu,
          ]}
        >
          {/* No blur reaches behind a modal window on Android: the look's own sheet, which its
              ink is made to read on, in every look and at every hour. */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.sheet }]} />
          <GestureDetector gesture={slide}>
            <View style={{ flex: 1, paddingVertical: PAD }}>
              {choices.map((c, k) => (
                <MenuLine
                  key={c.key}
                  index={k}
                  lit={lit}
                  label={c.label}
                  on={c.key === selected}
                  ink={palette.ink}
                  wash={palette.chipBg}
                />
              ))}
            </View>
          </GestureDetector>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function MenuLine({
  index,
  lit,
  label,
  on,
  ink,
  wash,
}: {
  readonly index: number;
  readonly lit: ReturnType<typeof useSharedValue<number>>;
  readonly label: string;
  readonly on: boolean;
  readonly ink: string;
  readonly wash: string;
}) {
  const press = useAnimatedStyle(() => ({ opacity: lit.get() === index ? 1 : 0 }));
  return (
    <View
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      style={{
        height: ROW,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 1,
            bottom: 1,
            left: PAD,
            right: PAD,
            borderRadius: ROW / 2,
            backgroundColor: wash,
          },
          press,
        ]}
      />
      <View style={{ width: 22, alignItems: 'center' }}>
        {on ? <Symbol name="check" size={19} color={ink} weight={600} /> : null}
      </View>
      <Text numberOfLines={1} style={{ ...body(17, on ? 600 : 400), color: ink, flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );
}
