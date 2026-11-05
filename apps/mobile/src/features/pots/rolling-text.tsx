import { useEffect, useRef, useState } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations } from '@6pm/theme';

import { tabular } from '../../ui/type/fonts';

const ease = Easing.bezier(...curves.enter);
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * A short amount ("3,5tr", "351k") on the odometer: each digit rolls to its new place on its own
 * column, 1000 ms plus 80 ms a place from the right, and the letters and marks stand still. Each
 * column is as wide as the digit it rests on, measured in the face (a serif's narrow "1" leaves no
 * gap before "tr"), and eases to the next digit's width as it rolls.
 */
export function RollingText({
  text,
  style,
  lineHeight,
}: {
  readonly text: string;
  readonly style: TextStyle;
  /** One digit's row: the columns roll by it. */
  readonly lineHeight: number;
}) {
  const chars = text.split('');
  const [advances, setAdvances] = useState<readonly number[] | null>(null);
  const measured = useRef<number[]>([]);
  const face = `${String(style.fontFamily)}:${String(style.fontSize)}:${String(style.fontWeight)}`;
  const [measuredFace, setMeasuredFace] = useState(face);
  if (measuredFace !== face) {
    setMeasuredFace(face);
    setAdvances(null);
    measured.current = [];
  }
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={{ flexDirection: 'row', height: lineHeight, overflow: 'hidden' }}
    >
      {advances === null ? (
        // Each digit's width in this face, measured once off screen.
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: 0, opacity: 0, flexDirection: 'row' }}
        >
          {DIGITS.map((d) => (
            <Text
              key={d}
              allowFontScaling={false}
              onLayout={(e) => {
                measured.current[d] = e.nativeEvent.layout.width;
                if (DIGITS.every((n) => (measured.current[n] ?? 0) > 0)) {
                  setAdvances([...measured.current]);
                }
              }}
              style={[style, { lineHeight, fontVariant: [] }]}
            >
              {d}
            </Text>
          ))}
        </View>
      ) : null}
      {chars.map((c, i) => {
        const place = chars.length - i;
        return /\d/.test(c) ? (
          <Column
            key={`d${place}`}
            digit={Number(c)}
            place={place}
            style={style}
            line={lineHeight}
            advances={advances}
          />
        ) : (
          <Text
            key={`c${place}${c}`}
            allowFontScaling={false}
            style={[style, tabular, { lineHeight, height: lineHeight }]}
          >
            {c}
          </Text>
        );
      })}
    </View>
  );
}

function Column({
  digit,
  place,
  style,
  line,
  advances,
}: {
  readonly digit: number;
  readonly place: number;
  readonly style: TextStyle;
  readonly line: number;
  /** Each digit's width, once measured. */
  readonly advances: readonly number[] | null;
}) {
  const y = useSharedValue(-digit * line);
  const widest = advances ? Math.max(...advances) : 0;
  const width = useSharedValue(advances?.[digit] ?? 0);
  useEffect(() => {
    const timing = {
      duration: durations.odometerBase + durations.odometerStep * place,
      easing: ease,
      reduceMotion: ReduceMotion.System,
    };
    y.value = withTiming(-digit * line, timing);
    const w = advances?.[digit] ?? 0;
    // The first measure lands as it is; a new digit's width eases in with the roll.
    width.value = width.value === 0 ? w : withTiming(w, timing);
  }, [digit, line, place, y, width, advances]);
  const box = useAnimatedStyle(() => (widest > 0 ? { width: width.value } : {}));
  const roll = useAnimatedStyle(() => ({
    transform: [
      { translateX: widest > 0 ? (width.value - widest) / 2 : 0 },
      { translateY: y.value },
    ],
  }));
  return (
    <Animated.View style={[{ height: line, overflow: 'hidden' }, box]}>
      <Animated.View style={[widest > 0 ? { width: widest, alignItems: 'center' } : null, roll]}>
        {DIGITS.map((d) => (
          <Text
            key={d}
            allowFontScaling={false}
            style={[
              style,
              widest > 0 ? { fontVariant: [] } : tabular,
              { lineHeight: line, height: line },
            ]}
          >
            {d}
          </Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
}
