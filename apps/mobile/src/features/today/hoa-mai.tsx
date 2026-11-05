import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { seasonInk } from '@6pm/theme';

import { useTheme } from '../../ui/theme/theme';
import { useNewYear } from '../pots/use-new-year';

/** The canvas's five blossoms: size, drop from the sheet's edge and twinkle, in turn. */
const BLOSSOMS = [
  { size: 22, top: 6, ms: 2200 },
  { size: 28, top: 0, ms: 2800 },
  { size: 18, top: 12, ms: 2000 },
  { size: 14, top: 4, ms: 2500 },
  { size: 20, top: 10, ms: 3000 },
] as const;

/** The looks that wear the season: Lantern River and Sơn Mài. */
const SEASON_LOOKS = new Set(['lantern', 'lacquer']);

function Blossom({
  size,
  top,
  ms,
  still,
}: {
  readonly size: number;
  readonly top: number;
  readonly ms: number;
  readonly still: boolean;
}) {
  const p = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    p.set(withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [p, ms, still]);
  const twinkle = useAnimatedStyle(() => ({
    opacity: 0.5 + 0.5 * p.get(),
    transform: [{ scale: 0.9 + 0.18 * p.get() }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          marginTop: top,
          borderRadius: size / 2,
          experimental_backgroundImage: `radial-gradient(circle, ${seasonInk.maiHeart} 0%, ${seasonInk.maiHeart} 18%, ${seasonInk.maiPetal} 20%, ${seasonInk.maiPetal} 60%, ${seasonInk.maiEdge} 62%, transparent 66%)`,
        },
        twinkle,
      ]}
    />
  );
}

/**
 * Hoa mai on the edge of Today's sheet through the Lunar New Year season, in the looks that wear
 * it (Lantern River and Sơn Mài): five blossoms twinkling at the top right, never over the
 * number. None in serious mode; they hold still with Reduce Motion.
 */
export function HoaMai() {
  const { look, serious } = useTheme();
  const { day } = useNewYear();
  const reduceMotion = useReducedMotion();
  if (serious || day === null || !SEASON_LOOKS.has(look)) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', right: 18, top: -16, flexDirection: 'row', gap: 2 }}
    >
      {BLOSSOMS.map((b, i) => (
        <Blossom key={i} size={b.size} top={b.top} ms={b.ms} still={reduceMotion} />
      ))}
    </View>
  );
}
