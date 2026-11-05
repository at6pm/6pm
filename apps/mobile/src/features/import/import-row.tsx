import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';
import { SettingRow } from '../settings/setting-rows';
import { AppIcons } from './import-parts';

/**
 * "Bring your history": the first row of Settings › Your data, a row like the others there. The
 * apps it brings from are named in the guide it opens.
 */
export function ImportSettingsRow() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <SettingRow
      first
      icon="history"
      label={t('import.row.title')}
      onPress={() => {
        haptics.tick();
        router.push('/import');
      }}
    />
  );
}

/**
 * The row on onboarding's first number, under "since payday", on the evening sky: the apps' icons
 * say where it comes from.
 */
export function ImportOnboardingRow({
  chip,
  ink,
  inkSoft,
  ring,
}: {
  readonly chip: string;
  readonly ink: string;
  readonly inkSoft: string;
  readonly ring: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${t('import.row.title')}, ${t('import.row.sub')}`}
      scaleTo={0.97}
      onPress={() => {
        haptics.tick();
        router.push('/import?from=onboarding');
      }}
      style={{
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: chip,
      }}
    >
      <AppIcons size={26} radius={8} ring={2} ringColor={ring} />
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text style={{ ...body(15, 650), color: ink }}>{t('import.row.title')}</Text>
        <Text numberOfLines={1} style={{ ...body(12.5), color: inkSoft }}>
          {t('import.row.sub')}
        </Text>
      </View>
      <Symbol name="chevron_right" size={18} color={ink} style={{ opacity: 0.6 }} />
    </PressScale>
  );
}
