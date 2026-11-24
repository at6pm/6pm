import { useI18n } from '../../i18n/i18n';
import { Switch } from '../../ui/primitives/switch';
import { SettingRow } from '../settings/setting-rows';
import { useFunnelSwitch } from './funnel-sync';

/**
 * Privacy's "Anonymous counts" row: the switch for the funnel counts, under the row that keeps AI
 * on the phone. Shown only while AI runs on the server; on-device mode sends no counts at all.
 */
export function FunnelSwitchRow() {
  const { t } = useI18n();
  const { on, set } = useFunnelSwitch();
  return (
    <SettingRow
      icon="steps"
      label={t('privacyPage.counts')}
      sub={t('privacyPage.countsSub')}
      subLines={2}
      trailing={
        <Switch value={on ?? true} accessibilityLabel={t('privacyPage.counts')} onChange={set} />
      }
    />
  );
}
