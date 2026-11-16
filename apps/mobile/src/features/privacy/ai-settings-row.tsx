import { useRouter } from 'expo-router';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { SettingRow } from '../settings/setting-rows';
import { useAiMode } from './use-ai-mode';

/** Settings → AI: where 6pm's AI runs now; opens the choice. Its own glyph, apart from Backup's cloud. */
export function AiSettingsRow() {
  const router = useRouter();
  const { t } = useI18n();
  const mode = useAiMode();
  return (
    <SettingRow
      icon="auto_awesome"
      label={t('settings.ai')}
      value={t(mode === 'device' ? 'settings.ai.device' : 'settings.ai.server')}
      onPress={() => {
        haptics.tick();
        router.push('/ai');
      }}
    />
  );
}
