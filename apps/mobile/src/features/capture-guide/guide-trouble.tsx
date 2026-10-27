import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

/**
 * "Not working?": what goes wrong and the other ways in, folded away until asked for. Most people
 * follow the steps and never open it; the ones who do get every fix in one place.
 */
export function GuideTrouble({ children }: { readonly children: ReactNode }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const chevron = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(open ? '180deg' : '0deg', {
          duration: 240,
          easing: easeOut,
          reduceMotion: ReduceMotion.System,
        }),
      },
    ],
  }));
  return (
    <View style={{ gap: 12 }}>
      <PressScale
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          haptics.tap();
          setOpen((was) => !was);
        }}
        style={{
          alignSelf: 'center',
          height: 44,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Text style={{ ...body(15, 600), color: palette.inkSoft }}>
          {t('capture.guide.trouble')}
        </Text>
        <Animated.View style={chevron}>
          <Symbol name="expand_more" size={20} color={palette.inkSoft} />
        </Animated.View>
      </PressScale>
      {open ? (
        <Animated.View
          entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(140).reduceMotion(ReduceMotion.System)}
          style={{ gap: 12 }}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}
