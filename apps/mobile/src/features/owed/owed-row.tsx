import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { Avatar } from './owed-parts';
import { useOwed } from './use-owed';

/**
 * "Owed to you · 1,15tr" on Today and in the Diary, only while someone owes something: the people's
 * avatars, the total, and the way into the owed list. It never changes the daily number.
 */
export function OwedRow() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const { people, total } = useOwed();
  if (people.length === 0) return null;
  const faces = people.slice(0, 3);
  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
      <PressScale
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${t('owed.row')}, ${money.spoken(total)}`}
        onPress={() => {
          haptics.tick();
          router.push('/owed');
        }}
        style={{
          minHeight: 56,
          borderRadius: 22,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          paddingLeft: 12,
          paddingRight: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {faces.map((p, i) => (
            <View
              key={p.key}
              style={{
                marginLeft: i === 0 ? 0 : -9,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: palette.cell,
              }}
            >
              <Avatar name={p.name} size={28} />
            </View>
          ))}
        </View>
        <Text numberOfLines={1} style={{ ...body(16, 600), color: palette.ink, flex: 1 }}>
          {t('owed.row')}
        </Text>
        <Text style={{ ...body(16, 650), ...tabular, color: palette.ink }}>
          {money.short(total)}
        </Text>
        <Symbol name="chevron_right" size={20} color={palette.inkSoft} />
      </PressScale>
    </Animated.View>
  );
}
