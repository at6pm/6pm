import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { HEADING_BREAKS, headingWords } from '../../ui/type/word-fit-text';
import { useHeaderMeasure, type HeaderShape } from '../home/header-measure';
import { planRoutes } from './plan-routes';

/** Plan's header, for the sky to keep the look's art clear of it. */
const HEADER: HeaderShape = {
  parents: { eyebrow: 'block', row: 'block', title: 'row', button: 'row' },
  texts: ['eyebrow', 'title'],
  title: 'title',
  button: 'button',
  padRight: 6,
};

/**
 * Plan's kicker, title and edit button. The header drifts down at a third of the scroll and is
 * gone by 70 pt, as in the prototype.
 */
export function PlanHeader({
  kicker,
  y,
}: {
  readonly kicker: string;
  readonly y: SharedValue<number>;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const holdsIncomes = useMoney().plan?.incomes !== undefined;
  const measure = useHeaderMeasure('plan', HEADER);
  const header = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, 1 - y.value / 70)),
    transform: [{ translateY: Math.min(y.value, 80) * 0.3 }],
  }));
  return (
    <Animated.View
      onLayout={measure.layout('block')}
      style={[{ paddingHorizontal: 6, gap: 2 }, header]}
    >
      <Text
        onLayout={measure.layout('eyebrow')}
        onTextLayout={measure.lines('eyebrow')}
        style={{ ...body(13, 600, 0.06), textTransform: 'uppercase', color: palette.inkSoft }}
      >
        {kicker}
      </Text>
      <View
        onLayout={measure.layout('row')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text
          {...HEADING_BREAKS}
          accessibilityRole="header"
          onLayout={measure.layout('title')}
          onTextLayout={measure.lines('title')}
          style={{ ...body(34, 700, -0.03), color: palette.ink }}
        >
          {headingWords(t('potsPlan.title'))}
        </Text>
        <PressScale
          onLayout={measure.layout('button')}
          accessibilityRole="button"
          accessibilityLabel={t('potsPlan.tune')}
          hitSlop={4}
          onPress={() => {
            haptics.tap();
            // A plan that holds its incomes is edited where they were set: the question itself.
            router.push(holdsIncomes ? planRoutes.reach : planRoutes.month);
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: palette.glass,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="edit" size={20} color={palette.ink} />
        </PressScale>
      </View>
    </Animated.View>
  );
}
