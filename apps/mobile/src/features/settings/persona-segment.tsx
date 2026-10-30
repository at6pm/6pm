import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { PlanSettings } from '../../data/plan-settings';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { easeInOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

const PERSONAS = ['soft', 'cheeky', 'roast'] as const;
const INSET = 3;
/** How long the lifted pill takes to slide to the voice picked. */
const SLIDE_MS = 300;

/** The prototype's lifted segment (`personaOpts`): white on light looks, a light wash on dark. */
export function liftedFill(dark: boolean): string {
  return dark ? 'rgba(255,255,255,.2)' : '#fff';
}
export const LIFTED_SHADOW = '0 1px 4px rgba(0,0,0,.12)';

/** Soft, Cheeky, Roast: the lifted pill slides to the voice picked. */
export function PersonaSegment({
  persona,
  onPersona,
}: {
  readonly persona: PlanSettings['persona'];
  readonly onPersona: (persona: PlanSettings['persona']) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const index = PERSONAS.indexOf(persona);
  const at = useSharedValue(index);
  /** One option's width, known once the track is laid out; the pill waits for it. */
  const width = useSharedValue(0);
  useEffect(() => {
    at.set(
      withTiming(index, {
        duration: SLIDE_MS,
        easing: easeInOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [at, index]);
  const pill = useAnimatedStyle(() => ({
    width: width.get(),
    opacity: width.get() > 0 ? 1 : 0,
    transform: [{ translateX: at.get() * width.get() }],
  }));
  return (
    <View
      accessibilityRole="radiogroup"
      onLayout={(e) => width.set((e.nativeEvent.layout.width - INSET * 2) / PERSONAS.length)}
      style={{
        flexDirection: 'row',
        padding: INSET,
        borderRadius: 13,
        backgroundColor: palette.chipBg,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: INSET,
            left: INSET,
            height: 36,
            borderRadius: 10,
            backgroundColor: liftedFill(palette.dark),
            boxShadow: LIFTED_SHADOW,
          },
          pill,
        ]}
      />
      {PERSONAS.map((p) => {
        const on = p === persona;
        return (
          <PressScale
            key={p}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => {
              if (on) return;
              haptics.tick();
              onPersona(p);
            }}
            style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text numberOfLines={1} style={{ ...body(14, 600), color: palette.ink }}>
              {t(`settings.persona.${p}`)}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}
