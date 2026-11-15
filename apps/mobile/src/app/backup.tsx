import { useLocalSearchParams } from 'expo-router';

import { BackupManage } from '../features/backup/backup-manage';
import { BackupSheet } from '../features/backup/backup-sheet';
import { SettingsPage } from '../features/settings/settings-page';
import { useI18n } from '../i18n/i18n';

/**
 * Backup: a page inside Settings, where its row opens it; opened with `restore=1` from the welcome
 * step of a fresh install, its own short sheet offering to bring a backup back.
 */
export default function Backup() {
  const { t } = useI18n();
  const { restore } = useLocalSearchParams<{ restore?: string }>();
  if (restore === '1') return <BackupSheet />;
  return (
    <SettingsPage title={t('backup.title')} gap={12}>
      <BackupManage />
    </SettingsPage>
  );
}
