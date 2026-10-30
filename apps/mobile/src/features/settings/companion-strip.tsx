import { useEffect, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { Companion } from '../../ui/companion/companion';
import { COMPANION_FORMS, type CompanionForm } from '../../ui/companion/companion-mood';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { LIFTED_SHADOW, liftedFill } from './persona-segment';

const TILE = 84;
const GAP = 8;
/** The card's own inset, which the strip scrolls under so tiles run to its edges. */
const INSET = 16;
/** Settings' cards sit 16 pt in from each side of the screen. */
const SIDE = 16;
const PREVIEW = 56;
const MARK_MS = 200;

/**
 * The six companions side by side in the Companion card, each live, the one worn lifted as the
 * voice segment's pill is, the Max ones locked for non-members. Opens scrolled to the one worn.
 */
export function CompanionStrip({
  worn,
  locked,
  onPick,
}: {
  readonly worn: CompanionForm;
  readonly locked: (form: CompanionForm) => boolean;
  readonly onPick: (form: CompanionForm) => void;
}) {
  const { width } = useWindowDimensions();
  const view = width - SIDE * 2;
  const content = INSET * 2 + COMPANION_FORMS.length * (TILE + GAP) - GAP;
  // Opens centred on the one worn, as far as the strip reaches; a pick after that never scrolls it.
  const [start] = useState(() => {
    const index = COMPANION_FORMS.indexOf(worn);
    const x = INSET + index * (TILE + GAP) - (view - TILE) / 2;
    return { x: Math.max(0, Math.min(content - view, x)), y: 0 };
  });
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentOffset={start}
      decelerationRate="fast"
      snapToInterval={TILE + GAP}
      style={{ marginHorizontal: -INSET }}
      contentContainerStyle={{ paddingHorizontal: INSET, gap: GAP }}
    >
      {COMPANION_FORMS.map((form) => (
        <StripTile
          key={form}
          form={form}
          worn={form === worn}
          locked={locked(form)}
          onPress={() => onPick(form)}
        />
      ))}
    </ScrollView>
  );
}

function StripTile({
  form,
  worn,
  locked,
  onPress,
}: {
  readonly form: CompanionForm;
  readonly worn: boolean;
  readonly locked: boolean;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const name = t(`companions.name.${form}`);
  const lift = useSharedValue(worn ? 1 : 0);
  useEffect(() => {
    lift.set(
      withTiming(worn ? 1 : 0, {
        duration: MARK_MS,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [lift, worn]);
  const lifted = useAnimatedStyle(() => ({ opacity: lift.get() }));
  return (
    <PressScale
      inScroll
      accessibilityRole="radio"
      accessibilityState={{ checked: worn }}
      accessibilityLabel={locked ? t('companions.locked', { name }) : name}
      accessibilityHint={t(`companions.line.${form}`)}
      scaleTo={0.95}
      onPress={onPress}
      style={{
        width: TILE,
        borderRadius: 18,
        backgroundColor: palette.chipBg,
        alignItems: 'center',
        paddingTop: 6,
        paddingBottom: 9,
        gap: 2,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            backgroundColor: liftedFill(palette.dark),
            boxShadow: `${LIFTED_SHADOW}, inset 0 0 0 1.5px ${palette.ink}`,
          },
          lifted,
        ]}
      />
      <Companion size={PREVIEW} mood="calm" form={form} />
      <Text
        numberOfLines={2}
        style={{
          ...body(12, 600),
          lineHeight: 15,
          textAlign: 'center',
          paddingHorizontal: 6,
          color: worn ? palette.ink : palette.inkSoft,
        }}
      >
        {name}
      </Text>
      {locked ? (
        <View
          style={{
            position: 'absolute',
            left: 6,
            top: 6,
            height: 16,
            paddingLeft: 3,
            paddingRight: 5,
            borderRadius: 5,
            backgroundColor: palette.btnBg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Symbol name="lock" size={10} fill={1} color={palette.btnFg} />
          <Text style={{ ...body(8.5, 800, 0.1), color: palette.btnFg }}>
            {t('companions.max')}
          </Text>
        </View>
      ) : null}
    </PressScale>
  );
}
