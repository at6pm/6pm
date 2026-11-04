import { useEffect } from 'react';
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
 * column, 1000 ms plus 80 ms a place from the right, and the letters and marks stand still.
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
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={{ flexDirection: 'row', height: lineHeight, overflow: 'hidden' }}
    >
      {chars.map((c, i) => {
        const place = chars.length - i;
        return /\d/.test(c) ? (
          <Column
            key={`d${place}`}
            digit={Number(c)}
            place={place}
            style={style}
            line={lineHeight}
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
}: {
  readonly digit: number;
  readonly place: number;
  readonly style: TextStyle;
  readonly line: number;
}) {
  const y = useSharedValue(-digit * line);
  useEffect(() => {
    y.value = withTiming(-digit * line, {
      duration: durations.odometerBase + durations.odometerStep * place,
      easing: ease,
      reduceMotion: ReduceMotion.System,
    });
  }, [digit, line, place, y]);
  const roll = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: line, overflow: 'hidden' }}>
      <Animated.View style={roll}>
        {DIGITS.map((d) => (
          <Text
            key={d}
            allowFontScaling={false}
            style={[style, tabular, { lineHeight: line, height: line }]}
          >
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}
