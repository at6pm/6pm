import { NotificationsScreen } from '../features/settings/notifications-screen';
import { useI18n } from '../i18n/i18n';
import { SettingsPage } from '../features/settings/settings-page';

/** Settings › Your day › Notifications, a page inside Settings. */
export default function NotificationsSheet() {
  const { t } = useI18n();
  return (
    <SettingsPage title={t('notify.settings.title')} gap={26}>
      <NotificationsScreen />
    </SettingsPage>
  );
}
