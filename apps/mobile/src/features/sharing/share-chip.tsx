import { useRouter, type Href } from 'expo-router';
import { Text } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { springs } from '@6pm/theme';

import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import type { CardId } from './cards/registry';

/** The share sheet for a card: `of` is its month, year, jar or the day a streak ends. */
export function shareCardHref(card: CardId, of?: string): Href {
  const query = of === undefined ? '' : `&of=${encodeURIComponent(of)}`;
  return `/share-card?card=${card}${query}` as Href;
}

const SIZES = {
  regular: { height: 38, left: 12, right: 15, gap: 6, icon: 18, text: 14 },
  small: { height: 30, left: 9, right: 12, gap: 5, icon: 16, text: 13 },
} as const;

/**
 * The quiet glass chip that offers a card, never a pop-up or a button: a tap opens the card's
 * preview. `delay` brings it in on the pop spring that long after it mounts (the close reveal's,
 * once the number has settled); without one it is simply there.
 */
export function ShareChip({
  card,
  of,
  label,
  size = 'regular',
  delay,
}: {
  readonly card: CardId;
  readonly of?: string;
  readonly label: string;
  readonly size?: keyof typeof SIZES;
  readonly delay?: number;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const s = SIZES[size];
  return (
    <Animated.View
      {...(delay === undefined
        ? {}
        : {
            entering: ZoomIn.delay(delay)
              .springify()
              .damping(springs.pop.damping)
              .stiffness(springs.pop.stiffness)
              .mass(springs.pop.mass)
              .reduceMotion(ReduceMotion.System),
          })}
    >
      <PressScale
        accessibilityRole="button"
        scaleTo={0.95}
        hitSlop={6}
        onPress={() => {
          haptics.tap();
          router.push(shareCardHref(card, of));
        }}
        style={{
          height: s.height,
          paddingLeft: s.left,
          paddingRight: s.right,
          borderRadius: 99,
          backgroundColor: palette.glass,
          boxShadow: palette.glassShadow,
          flexDirection: 'row',
          alignItems: 'center',
          gap: s.gap,
        }}
      >
        <Symbol name="ios_share" size={s.icon} color={palette.ink} />
        <Text style={{ ...body(s.text, 650), color: palette.ink }}>{label}</Text>
      </PressScale>
    </Animated.View>
  );
}
