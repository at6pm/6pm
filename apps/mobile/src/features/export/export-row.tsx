import { Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { useExportSpends } from './use-export-spends';

/**
 * The Export row of "Your data" (prototype `App:2844`): a download tile, the label, "CSV · Sheets"
 * and a chevron. It shares a CSV of every spend (Files, Numbers, or Google Sheets from the share
 * sheet), free for everyone.
 */
export function ExportRow({ first = false }: { readonly first?: boolean }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { run, busy } = useExportSpends();

  const open = () => {
    haptics.tick();
    void run();
  };

  return (
    <PressScale
      highlight
      onPress={open}
      accessibilityRole="button"
      accessibilityState={{ busy }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: palette.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="download" size={19} color={palette.ink} />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 13,
          borderTopWidth: 0.5,
          borderTopColor: first ? 'transparent' : palette.hair,
        }}
      >
        <Text style={{ flex: 1, ...body(16), color: palette.ink }}>{t('export.title')}</Text>
        <Text style={{ ...body(15), color: palette.inkSoft }}>{t('export.row.value')}</Text>
        <Symbol name="chevron_right" size={20} color={palette.ink} style={{ opacity: 0.35 }} />
      </View>
    </PressScale>
  );
}
