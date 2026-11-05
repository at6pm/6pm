import { NotificationsScreen } from '../features/settings/notifications-screen';
import { useI18n } from '../i18n/i18n';
import { SheetScreen } from '../ui/navigation/sheet-screen';

/** Settings › Your day › Notifications. */
export default function NotificationsSheet() {
  const { t } = useI18n();
  return (
    <SheetScreen title={t('notify.settings.title')} gap={26}>
      <NotificationsScreen />
    </SheetScreen>
  );
}
