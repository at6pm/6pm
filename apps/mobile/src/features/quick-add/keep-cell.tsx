import { useEffect } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { quickAddInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

/** Asleep, Keep it is the button's cream at this strength, its words at half. */
const ASLEEP = 0.16;
const WAKE_MS = 180;

/**
 * Keep it in the keypad's last row. It wakes on the first digit: its fill rises from 16% to the
 * button's cream over 180 ms and its shadow comes in; it never moves. `dim` holds it half-lit while
 * voice is still reading the words.
 */
export function KeepCell({
  awake,
  dim = false,
  onPress,
  style,
}: {
  readonly awake: boolean;
  readonly dim?: boolean;
  readonly onPress: () => void;
  readonly style?: ViewProps['style'];
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const lit = useSharedValue(awake ? 1 : 0);
  const half = useSharedValue(dim ? 1 : 0);
  useEffect(() => {
    const timing = { duration: WAKE_MS, easing: easeOut, reduceMotion: ReduceMotion.System };
    lit.set(withTiming(awake ? 1 : 0, timing));
    half.set(withTiming(dim ? 1 : 0, timing));
  }, [awake, dim, lit, half]);
  const fill = useAnimatedStyle(() => ({ opacity: ASLEEP + (1 - ASLEEP) * lit.get() }));
  const shadow = useAnimatedStyle(() => ({ opacity: lit.get() }));
  const wordsOn = useAnimatedStyle(() => ({ opacity: lit.get() }));
  const wordsOff = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - lit.get()) }));
  const whole = useAnimatedStyle(() => ({ opacity: 1 - 0.5 * half.get() }));
  const label = (color: string) => (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingHorizontal: 8,
      }}
    >
      <Symbol name="receipt_long" size={19} color={color} />
      <Text numberOfLines={1} style={{ ...body(16, 650), color, flexShrink: 1 }}>
        {t('quick.keep')}
      </Text>
    </View>
  );
  return (
    <View style={[{ height: 48 }, style]}>
      <Animated.View style={[{ flex: 1 }, whole]}>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('quick.keep')}
          accessibilityState={{ disabled: !awake || dim }}
          disabled={!awake || dim}
          scaleTo={0.97}
          onPress={onPress}
          style={{ flex: 1 }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                inset: 0,
                borderRadius: 15,
                boxShadow: quickAddInk.keepShadow,
              },
              shadow,
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              { position: 'absolute', inset: 0, borderRadius: 15, backgroundColor: palette.btnBg },
              fill,
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', inset: 0 }, wordsOff]}
          >
            {label(palette.btnBg)}
          </Animated.View>
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, wordsOn]}>
            {label(palette.btnFg)}
          </Animated.View>
        </PressScale>
      </Animated.View>
    </View>
  );
}
