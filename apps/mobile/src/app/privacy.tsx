import { PrivacyPage } from '../features/privacy/privacy-page';
import { SettingsPage } from '../features/settings/settings-page';
import { useI18n } from '../i18n/i18n';

/** Settings › Your data › Privacy, a page inside Settings. */
export default function Privacy() {
  const { t } = useI18n();
  return (
    <SettingsPage title={t('settings.privacy')} gap={18}>
      <PrivacyPage />
    </SettingsPage>
  );
}
