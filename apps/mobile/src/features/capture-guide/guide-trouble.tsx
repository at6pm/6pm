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
 * follow the steps and never open it; the ones who do get every fix in one place. As a `row` it
 * is a card's width, its words on the left and the chevron on the right, closing a list of cards.
 */
export function GuideTrouble({
  look = 'link',
  children,
}: {
  readonly look?: 'link' | 'row';
  readonly children: ReactNode;
}) {
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
        style={
          look === 'row'
            ? {
                height: 54,
                paddingLeft: 18,
                paddingRight: 14,
                borderRadius: 20,
                backgroundColor: palette.cell,
                boxShadow: palette.cardShadow,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }
            : {
                alignSelf: 'center',
                height: 44,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }
        }
      >
        <Text
          style={
            look === 'row'
              ? { ...body(16, 600), color: palette.ink }
              : { ...body(15, 600), color: palette.inkSoft }
          }
        >
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
