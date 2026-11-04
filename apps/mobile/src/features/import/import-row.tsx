import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { AppIcons } from './import-parts';

/**
 * "Bring your history · From Money Lover, MISA or MoMo": the first row of Settings › Your data.
 * Their app icons say where it comes from, so the line does not have to.
 */
export function ImportSettingsRow() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <PressScale
      highlight
      accessibilityRole="button"
      accessibilityLabel={`${t('import.row.title')}, ${t('import.row.sub')}`}
      onPress={() => {
        haptics.tick();
        router.push('/import');
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 16,
        paddingHorizontal: 14,
      }}
    >
      <AppIcons size={30} radius={9} ring={2.5} ringColor={palette.cell} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ ...body(16, 650), color: palette.ink }}>{t('import.row.title')}</Text>
        <Text numberOfLines={1} style={{ ...body(12.5), color: palette.inkSoft }}>
          {t('import.row.sub')}
        </Text>
      </View>
      <Symbol name="chevron_right" size={18} color={palette.ink} style={{ opacity: 0.45 }} />
    </PressScale>
  );
}

/** The same row on onboarding's first number, under "since payday", on the evening sky. */
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
