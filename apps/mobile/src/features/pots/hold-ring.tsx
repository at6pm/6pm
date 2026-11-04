import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';

const R = 35;
const STROKE = 2.5;
const SIZE = 2 * R + 2 * STROKE;
const circle = (() => {
  const p = Skia.Path.Make();
  p.addCircle(SIZE / 2, SIZE / 2, R);
  return p;
})();

/**
 * The ring that draws around a held jar in the hold's first half second (the canvas's 70 pt
 * circle, 2.5 pt accent stroke, from the top clockwise). `progress` runs 0 to 1 on the UI thread.
 */
export function HoldRing({
  progress,
  left,
  top,
}: {
  readonly progress: SharedValue<number>;
  /** Where the ring's 70 pt square sits against the jar (the canvas: −9, −2 on 52 × 66). */
  readonly left: number;
  readonly top: number;
}) {
  const { palette } = useTheme();
  const shown = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: left - STROKE,
          top: top - STROKE,
          width: SIZE,
          height: SIZE,
          transform: [{ rotate: '-90deg' }],
        },
        shown,
      ]}
    >
      <Canvas style={{ width: SIZE, height: SIZE }}>
        <Path
          path={circle}
          style="stroke"
          strokeWidth={STROKE}
          strokeCap="round"
          color={palette.accent}
          start={0}
          end={progress}
        />
      </Canvas>
    </Animated.View>
  );
}

/** "+100k" floating up off a jar as each step goes in (the canvas's floatUp, 900 ms). */
export function FloatChip({ label }: { readonly label: string }) {
  const { palette } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  }, [t]);
  const style = useAnimatedStyle(() => {
    const v = t.value;
    const first = v < 0.2;
    const p = first ? v / 0.2 : (v - 0.2) / 0.8;
    return {
      opacity: first ? p : 1 - p,
      transform: [
        { translateY: first ? 8 * (1 - p) : -26 * p },
        { scale: first ? 0.9 + 0.1 * p : 1 },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: -16,
          left: '50%',
          marginLeft: -24,
          width: 48,
          height: 20,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        },
        style,
      ]}
    >
      <Text allowFontScaling={false} style={{ ...body(11, 700), ...tabular, color: palette.btnFg }}>
        {label}
      </Text>
    </Animated.View>
  );
}
