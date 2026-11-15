import { View } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { shareInksFor } from '@6pm/theme';

import { useTheme } from '../../ui/theme/theme';
import { CardArt } from './cards/card-art';
import type { ArtBox } from './cards/card-size';

/** The arc as "The moment" draws it: 220 × 120, seven 24 pt suns setting onto a line at 96. */
const WIDTH = 220;
const HEIGHT = 120;
const SUN = 24;
const SUNS = 7;
const HORIZON = 96;
/** Room around the arc for the suns' glow, which the canvas lets spill. */
const BLEED = 16;

function sunAt(i: number): { readonly x: number; readonly y: number } {
  const t = i / (SUNS - 1);
  return { x: 14 + t * 192, y: 16 + Math.pow(t, 1.6) * 80 };
}

/**
 * A streak milestone on the close reveal, shown as sunsets: the last seven evenings as suns
 * sinking along an arc onto the horizon, in the look's own sun (gold leaf, a cobalt dab, a neon
 * ring). Tonight's sun, the last and lowest, pops in as the month's dot for today does.
 */
export function StreakSunset() {
  const { palette, look, serious } = useTheme();
  const inks = shareInksFor({ look, serious, dark: palette.dark });
  const sun = (i: number): ArtBox => {
    const { x, y } = sunAt(i);
    return {
      l: BLEED + x - SUN / 2,
      t: BLEED + y - SUN / 2,
      w: SUN,
      h: SUN,
      r: inks.sun.radius,
      bg: inks.sun.full,
      sh: inks.sun.lit,
    };
  };
  const tonight = sunAt(SUNS - 1);
  return (
    <View style={{ width: WIDTH, height: HEIGHT, marginTop: 20 }}>
      <CardArt
        width={WIDTH + BLEED * 2}
        height={HEIGHT + BLEED * 2}
        style={{ position: 'absolute', top: -BLEED, marginHorizontal: -BLEED }}
        boxes={Array.from({ length: SUNS - 1 }, (_, i) => sun(i))}
      />
      <Animated.View
        entering={ZoomIn.delay(900).springify().damping(10).reduceMotion(ReduceMotion.System)}
        style={{
          position: 'absolute',
          left: tonight.x - SUN / 2 - BLEED,
          top: tonight.y - SUN / 2 - BLEED,
        }}
      >
        <CardArt
          width={SUN + BLEED * 2}
          height={SUN + BLEED * 2}
          boxes={[{ ...sun(SUNS - 1), l: BLEED, t: BLEED }]}
        />
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: HORIZON,
          height: inks.horizon.width,
          backgroundColor: inks.horizon.color,
        }}
      />
    </View>
  );
}
