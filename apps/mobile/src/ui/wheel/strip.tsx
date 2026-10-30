import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, type TextStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves, durations } from '@6pm/theme';

import { haptics } from '../haptics';
import { display, tabular } from '../type/fonts';
import {
  cellCentres,
  cellLook,
  cellWidthAt,
  clampPosition,
  momentumCell,
  rubberBand,
  stripFade,
  stripOffset,
  stripPosition,
} from './wheel-maths';

const SNAP = { duration: durations.snap, easing: Easing.bezier(...curves.snap) };
/** The strip is 52 pt tall; its cells and the band behind the chosen one are 48. */
const HEIGHT = 52;
const CELL = 48;
const BAND_RADIUS = 15;
/** The chosen cell's type size; the others are drawn smaller by `cellLook`. */
const SIZE = 28;
/** A phone's card before the strip has measured itself. */
const FIRST_WIDTH = 358;

export interface StripProps {
  /** Each cell's text. */
  readonly items: readonly string[];
  /** Each cell's width in points: 48 for a number, wider for a word. */
  readonly widths: readonly number[];
  readonly index: number;
  /** Called as the centred cell changes: live while dragging, and with the cell a fling lands on. */
  readonly onChange: (index: number) => void;
  readonly ink: string;
  /** The soft band behind the chosen cell. */
  readonly band: string;
  /** What the strip sets, for VoiceOver ("Payday"). */
  readonly label: string;
  /** Each cell as VoiceOver reads it ("5th", "Last day"). */
  readonly spoken: readonly string[];
}

function Cell({
  label,
  index,
  width,
  position,
  centres,
  widths,
  stripWidth,
  textStyle,
}: {
  readonly label: string;
  readonly index: number;
  readonly width: number;
  readonly position: SharedValue<number>;
  readonly centres: readonly number[];
  readonly widths: readonly number[];
  readonly stripWidth: SharedValue<number>;
  readonly textStyle: TextStyle;
}) {
  const look = useAnimatedStyle(() => {
    const { opacity, scale } = cellLook(index - position.value);
    // The prototype masks the strip's sides; each cell takes the mask at its centre.
    const x =
      stripWidth.value / 2 + (centres[index] ?? 0) - stripOffset(position.value, centres, widths);
    return {
      opacity: opacity * stripFade(x / Math.max(1, stripWidth.value)),
      transform: [{ scale }],
    };
  });
  return (
    <Animated.View
      style={[
        {
          width,
          height: CELL,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
        },
        look,
      ]}
    >
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        allowFontScaling={false}
        style={textStyle}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * The wheel laid on its side: a row of cells that follows the finger on the UI thread, with a
 * rubber band past the ends, carries a fling on and snaps to a cell under the band. Cells fade
 * and shrink away from the centre and fade out at the sides; each cell passing the centre ticks,
 * and a tap picks the cell tapped.
 */
export function Strip({ items, widths, index, onChange, ink, band, label, spoken }: StripProps) {
  const count = items.length;
  const centres = useMemo(() => cellCentres(widths), [widths]);
  const position = useSharedValue(index);
  const start = useSharedValue(0);
  const chosen = useSharedValue(index);
  const touching = useSharedValue(false);
  const userMoved = useSharedValue(false);
  const stripWidth = useSharedValue(FIRST_WIDTH);

  const latest = useRef(onChange);
  latest.current = onChange;
  const emitJs = useCallback((next: number) => latest.current(next), []);

  // A new value from outside glides the strip to it.
  useEffect(() => {
    if (touching.value || chosen.value === index) return;
    chosen.value = index;
    userMoved.value = false;
    position.value = withTiming(index, SNAP);
  }, [index, position, chosen, touching, userMoved]);

  useAnimatedReaction(
    () => Math.round(clampPosition(position.value, count)),
    (now, before) => {
      if (before !== null && now !== before && userMoved.value) scheduleOnRN(haptics.tick);
    },
  );

  const emit = (next: number) => {
    'worklet';
    if (next === chosen.value) return;
    chosen.value = next;
    scheduleOnRN(emitJs, next);
  };
  const settle = (next: number) => {
    'worklet';
    position.value = withTiming(next, SNAP);
    emit(next);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .failOffsetY([-10, 10])
    .onBegin(() => {
      touching.value = true;
    })
    .onStart(() => {
      cancelAnimation(position);
      userMoved.value = true;
      start.value = stripOffset(position.value, centres, widths);
    })
    .onUpdate((e) => {
      const raw = stripPosition(start.value - e.translationX, centres, widths);
      const next = rubberBand(raw, count);
      position.value = next;
      emit(Math.round(clampPosition(next, count)));
    })
    .onEnd((e) => {
      settle(momentumCell(position.value, e.velocityX / 1000, centres, widths));
    })
    .onFinalize(() => {
      touching.value = false;
    });
  const tap = Gesture.Tap().onEnd((e) => {
    const at = stripOffset(position.value, centres, widths) + e.x - stripWidth.value / 2;
    userMoved.value = true;
    settle(Math.round(clampPosition(stripPosition(at, centres, widths), count)));
  });

  const row = useAnimatedStyle(() => ({
    transform: [{ translateX: -stripOffset(position.value, centres, widths) }],
  }));
  const bandLook = useAnimatedStyle(() => {
    const w = cellWidthAt(position.value, widths);
    return { width: w, transform: [{ translateX: -w / 2 }] };
  });

  const textStyle: TextStyle = { ...display(SIZE, 600, -0.03), ...tabular, color: ink };

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        collapsable={false}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: spoken[index] ?? '' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const way = e.nativeEvent.actionName === 'increment' ? 1 : -1;
          const next = Math.round(clampPosition(index + way, count));
          if (next !== index) onChange(next);
        }}
        onLayout={(e) => {
          stripWidth.value = e.nativeEvent.layout.width;
        }}
        style={{ height: HEIGHT, overflow: 'hidden' }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: '50%',
              top: (HEIGHT - CELL) / 2,
              height: CELL,
              borderRadius: BAND_RADIUS,
              backgroundColor: band,
            },
            bandLook,
          ]}
        />
        {/* The row starts at the strip's middle and slides left by the chosen cell's centre. */}
        <Animated.View
          style={[
            { position: 'absolute', left: '50%', top: (HEIGHT - CELL) / 2, flexDirection: 'row' },
            row,
          ]}
        >
          {items.map((item, i) => (
            <Cell
              key={i}
              label={item}
              index={i}
              width={widths[i] ?? CELL}
              position={position}
              centres={centres}
              widths={widths}
              stripWidth={stripWidth}
              textStyle={textStyle}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
