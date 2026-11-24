import Animated, { ReduceMotion, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { haptics } from '../../ui/haptics';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { captureColours } from './capture-colours';

/**
 * How a guide's button stands: `accent` is the one thing to do next (the house orange), `primary`
 * the sheet's dark pill, `secondary` the same pill washed in the chip colour, for what is done or
 * can wait.
 */
export type GuideButtonKind = 'accent' | 'primary' | 'secondary';

const recolour = { duration: 260, easing: easeOut, reduceMotion: ReduceMotion.System } as const;

/**
 * A full-width pill inside a guide's card, at the height a card holds. When a step is done and
 * its button steps back, the colours change over a quarter second rather than at once.
 */
export function GuideButton({
  label,
  kind,
  onPress,
  disabled = false,
}: {
  readonly label: string;
  readonly kind: GuideButtonKind;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}) {
  const { palette } = useTheme();
  const fg =
    kind === 'accent'
      ? captureColours(palette).onAccent
      : kind === 'primary'
        ? palette.btnFg
        : palette.ink;
  const bg =
    kind === 'accent' ? palette.accent : kind === 'primary' ? palette.btnBg : palette.chipBg;
  const fill = useAnimatedStyle(() => ({ backgroundColor: withTiming(bg, recolour) }));
  const ink = useAnimatedStyle(() => ({ color: withTiming(fg, recolour) }));
  return (
    <PressScale
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Animated.View
        style={[
          {
            height: 50,
            borderRadius: 99,
            paddingHorizontal: 18,
            alignItems: 'center',
            justifyContent: 'center',
          },
          fill,
        ]}
      >
        <Animated.Text numberOfLines={1} style={[body(16.5, 650), ink]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </PressScale>
  );
}
