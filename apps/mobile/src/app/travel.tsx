import { SettingsPage } from '../features/settings/settings-page';
import { TravelPage } from '../features/travel/travel-row';
import { useI18n } from '../i18n/i18n';

/** Settings › Your day › Travel mode, a page inside Settings. */
export default function Travel() {
  const { t } = useI18n();
  return (
    <SettingsPage title={t('travel.settings.label')}>
      <TravelPage />
    </SettingsPage>
  );
}
