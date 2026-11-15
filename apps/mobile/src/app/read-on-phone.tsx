import { ReadOnPhone } from '../features/settings/read-on-phone';
import { useI18n } from '../i18n/i18n';
import { SettingsPage } from '../features/settings/settings-page';

/** Settings › Your data, a page inside Settings: this month's receipts and how they were read on the phone. */
export default function ReadOnPhoneSheet() {
  const { t } = useI18n();
  return (
    <SettingsPage title={t('catch.reading.title')}>
      <ReadOnPhone />
    </SettingsPage>
  );
}
