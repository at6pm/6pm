import { useCallback, useEffect, useRef } from 'react';
import { Platform, View, type TextStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type FrameInfo,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { curves, durations } from '@6pm/theme';

import { haptics } from '../haptics';
import { useGatedFrameCallback } from '../sky/screen-activity';
import { display, tabular } from '../type/fonts';
import {
  clampPosition,
  columnOffset,
  edgeFade,
  holdDelay,
  momentumIndex,
  rowAt,
  rowLook,
  rubberBand,
  touchZone,
  wheelRowHeight,
} from './wheel-maths';

const SNAP = { duration: durations.snap, easing: Easing.bezier(...curves.snap) };
/** CSS `perspective(320px)` on each row. */
const PERSPECTIVE = 320;
const TEXT_ALIGN = { center: 'center', 'flex-start': 'left', 'flex-end': 'right' } as const;
/** A press that travels further than this is a drag, not a hold. */
const HOLD_SLOP = 10;

/** How far a wheel's touch strip reaches past its drawn rows, in points. */
export interface WheelReach {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/**
 * A money wheel's touch: a strip wider and taller than its digits, where a tap above the centre
 * row steps back, below it steps on, a hold keeps rolling, and a tap on the centre row types.
 */
export interface WheelTouch {
  readonly reach: WheelReach;
  /** A tap on the centre row: type the whole amount. */
  readonly onType?: () => void;
}

/** A guide rolling the wheel the way a finger would, without changing its value. */
export interface WheelGuide {
  /** Rows the guide has rolled the wheel by; it eases back to 0 once the guide ends. */
  readonly offset: Readonly<SharedValue<number>>;
  /** True while the guide plays; the first touch on a guided wheel ends it. */
  readonly live: SharedValue<boolean>;
}

export interface WheelProps {
  readonly items: readonly string[];
  readonly index: number;
  /** Called as the centred row changes: live while dragging, and with the row a fling lands on. */
  readonly onChange: (index: number) => void;
  /** Type size in points; a row is 1.4× this. */
  readonly size?: number;
  /** Rows on show: the chosen one and one or two either side. */
  readonly rows?: 3 | 5;
  readonly align?: 'center' | 'flex-start' | 'flex-end';
  readonly ink: string;
  /** Horizontal padding inside each row, in points. */
  readonly padX?: number;
  readonly width: number;
  /** What the wheel sets, for VoiceOver ("Payday"). */
  readonly label: string;
  readonly touch?: WheelTouch;
  readonly guide?: WheelGuide;
}

const NO_REACH: WheelReach = { left: 0, right: 0, top: 0, bottom: 0 };

function Row({
  label,
  index,
  shown,
  rowHeight,
  rows,
  tilt,
  textStyle,
  align,
  padX,
}: {
  readonly label: string;
  readonly index: number;
  readonly shown: Readonly<SharedValue<number>>;
  readonly rowHeight: number;
  readonly rows: number;
  readonly tilt: boolean;
  readonly textStyle: TextStyle;
  readonly align: WheelProps['align'];
  readonly padX: number;
}) {
  const look = useAnimatedStyle(() => {
    const distance = index - shown.value;
    const { opacity, scale, rotateX } = rowLook(distance);
    // The prototype masks the wheel's top and bottom; each row takes the mask at its centre.
    const centre = columnOffset(shown.value, rowHeight, rows) + (index + 0.5) * rowHeight;
    const fade = edgeFade(centre / (rowHeight * rows));
    return {
      opacity: opacity * fade,
      transform: tilt
        ? [{ perspective: PERSPECTIVE }, { rotateX: `${rotateX}deg` }, { scale }]
        : [{ scale }],
    };
  });
  return (
    <Animated.View
      style={[{ height: rowHeight, justifyContent: 'center', paddingHorizontal: padX }, look]}
    >
      {/* The text spans the row and aligns inside it: text sized to its own width is measured
          short on Android under negative tracking, and cut to an ellipsis. Android still finds a
          digit a hair wider than a digit's column and ellipsizes it, though it draws inside, so
          there the row clips instead. */}
      <Animated.Text
        numberOfLines={1}
        ellipsizeMode={Platform.OS === 'android' ? 'clip' : 'tail'}
        allowFontScaling={false}
        style={[textStyle, { textAlign: TEXT_ALIGN[align ?? 'center'] }]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * The iOS-style picker wheel: the column follows the finger on the UI thread with a rubber band past
 * the ends, a fling carries on and snaps to a row, and rows tilt away in 3D, fading and shrinking.
 * Each row passing the centre ticks. Reduce Motion keeps the rows flat.
 *
 * A money wheel (`touch`) answers anywhere in its strip: above the centre row a tap steps back one
 * and below it steps on one, whatever is drawn there; held, it keeps stepping, faster the longer
 * the hold; a tap on the centre row types the amount. Without `touch` a tap picks the row tapped.
 */
export function Wheel({
  items,
  index,
  onChange,
  size = 28,
  rows = 3,
  align = 'center',
  ink,
  padX = 4,
  width,
  label,
  touch,
  guide,
}: WheelProps) {
  const reduceMotion = useReducedMotion();
  const count = items.length;
  const rowHeight = wheelRowHeight(size);
  const reach = touch?.reach ?? NO_REACH;
  const position = useSharedValue(index);
  const start = useSharedValue(index);
  const chosen = useSharedValue(index);
  const touching = useSharedValue(false);
  /** Ticks belong to the user's own movement, not to a value set from outside. */
  const userMoved = useSharedValue(false);
  /** A held money wheel: the way it rolls, the steps so far, and when the next one is due. */
  const holdWay = useSharedValue(0);
  const holding = useSharedValue(false);
  const holdSteps = useSharedValue(0);
  const holdNext = useSharedValue(0);

  const latest = useRef(onChange);
  latest.current = onChange;
  const emitJs = useCallback((next: number) => latest.current(next), []);
  const typing = useRef(touch?.onType);
  typing.current = touch?.onType;
  const typeJs = useCallback(() => {
    const type = typing.current;
    if (!type) return;
    haptics.tick();
    type();
  }, []);

  // A new value from outside (another control, a card coming back) glides the wheel to it.
  useEffect(() => {
    if (touching.value || chosen.value === index) return;
    chosen.value = index;
    userMoved.value = false;
    position.value = withTiming(index, SNAP);
  }, [index, position, chosen, touching, userMoved]);

  // What is drawn: the wheel's own position, rolled by the guide while it plays.
  const shown = useDerivedValue(() => {
    const p = position.value;
    const off = guide ? guide.offset.value : 0;
    if (off === 0) return p;
    const room = off > 0 ? Math.max(0, count - 1 - p) : Math.max(0, p);
    return p + Math.max(-room, Math.min(room, off));
  });

  useAnimatedReaction(
    () => Math.round(clampPosition(position.value, count)),
    (now, before) => {
      if (before !== null && now !== before && userMoved.value) scheduleOnRN(haptics.tick);
    },
  );
  // The guide's roll ticks like a finger's; its way back is silent.
  useAnimatedReaction(
    () => (guide ? Math.round(guide.offset.value) : 0),
    (now, before) => {
      if (guide && before !== null && now > before && guide.live.value) {
        scheduleOnRN(haptics.tick);
      }
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
  /** The first touch on a guided wheel ends the guide, which rolls its wheels back. */
  const endGuide = () => {
    'worklet';
    if (guide && guide.live.value) guide.live.value = false;
  };

  const holdFrame = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      const way = holdWay.value;
      if (way === 0) return;
      if (holdNext.value === 0) {
        holdNext.value = frame.timestamp + holdDelay(holdSteps.value);
        return;
      }
      if (frame.timestamp < holdNext.value) return;
      const next = Math.round(clampPosition(chosen.value + way, count));
      if (next === chosen.value) {
        holdWay.value = 0;
        holding.value = false;
        return;
      }
      userMoved.value = true;
      position.value = withTiming(next, SNAP);
      chosen.value = next;
      scheduleOnRN(emitJs, next);
      holdSteps.value += 1;
      holdNext.value += holdDelay(holdSteps.value);
    },
    [holdWay, holdNext, holdSteps, holding, chosen, count, userMoved, position, emitJs],
  );
  useGatedFrameCallback(holdFrame, touch !== undefined, holding);

  const pan = Gesture.Pan()
    .activeOffsetY([-3, 3])
    .onBegin(() => {
      touching.value = true;
      endGuide();
    })
    .onStart(() => {
      cancelAnimation(position);
      userMoved.value = true;
      start.value = position.value;
    })
    .onUpdate((e) => {
      const next = rubberBand(start.value - e.translationY / rowHeight, count);
      position.value = next;
      emit(Math.round(clampPosition(next, count)));
    })
    .onEnd((e) => {
      settle(momentumIndex(position.value, e.velocityY / 1000, rowHeight, count));
    })
    .onFinalize(() => {
      touching.value = false;
    });

  const step = (way: number) => {
    'worklet';
    const next = Math.round(clampPosition(chosen.value + way, count));
    if (next === chosen.value) return;
    userMoved.value = true;
    settle(next);
  };
  const tap = Gesture.Tap()
    .onBegin(endGuide)
    .onEnd((e) => {
      if (!touch) {
        userMoved.value = true;
        settle(rowAt(e.y, position.value, rowHeight, rows, count));
        return;
      }
      const zone = touchZone(e.y - reach.top, rowHeight, rows);
      if (zone === 0) scheduleOnRN(typeJs);
      else step(zone);
    });
  const hold = Gesture.LongPress()
    .minDuration(holdDelay(0))
    .maxDistance(HOLD_SLOP)
    .onBegin(endGuide)
    .onStart((e) => {
      const zone = touchZone(e.y - reach.top, rowHeight, rows);
      if (zone === 0) return;
      step(zone);
      holdSteps.value = 1;
      holdNext.value = 0;
      holdWay.value = zone;
      holding.value = true;
    })
    .onFinalize(() => {
      holdWay.value = 0;
      holding.value = false;
    });

  const column = useAnimatedStyle(() => ({
    transform: [{ translateY: columnOffset(shown.value, rowHeight, rows) }],
  }));

  const textStyle: TextStyle = { ...display(size, 600, -0.03), ...tabular, color: ink };
  const gesture = touch ? Gesture.Race(pan, hold, tap) : Gesture.Race(pan, tap);
  const actions = touch?.onType
    ? [{ name: 'increment' }, { name: 'decrement' }, { name: 'activate' }]
    : [{ name: 'increment' }, { name: 'decrement' }];

  return (
    <GestureDetector gesture={gesture}>
      {/* The strip reaches past the drawn wheel by its padding, and the negative margins give
          that space back, so nothing around the wheel moves. */}
      <View
        collapsable={false}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: items[index] ?? '' }}
        accessibilityActions={actions}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'activate') {
            touch?.onType?.();
            return;
          }
          const way = e.nativeEvent.actionName === 'increment' ? 1 : -1;
          const next = Math.round(clampPosition(index + way, count));
          if (next !== index) onChange(next);
        }}
        style={{
          marginLeft: -reach.left,
          marginRight: -reach.right,
          marginTop: -reach.top,
          marginBottom: -reach.bottom,
          paddingLeft: reach.left,
          paddingRight: reach.right,
          paddingTop: reach.top,
          paddingBottom: reach.bottom,
        }}
      >
        <View style={{ width, height: rowHeight * rows, overflow: 'hidden' }}>
          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, column]}>
            {items.map((item, i) => (
              <Row
                key={i}
                label={item}
                index={i}
                shown={shown}
                rowHeight={rowHeight}
                rows={rows}
                tilt={!reduceMotion}
                textStyle={textStyle}
                align={align}
                padX={padX}
              />
            ))}
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
}
