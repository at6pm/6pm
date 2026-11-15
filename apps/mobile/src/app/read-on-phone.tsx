import { ReadOnPhone } from '../features/settings/read-on-phone';
import { useI18n } from '../i18n/i18n';
import { SheetScreen } from '../ui/navigation/sheet-screen';

/** Settings › Your data: this month's receipts and how they were read on the phone. */
export default function ReadOnPhoneSheet() {
  const { t } = useI18n();
  return (
    <SheetScreen title={t('catch.reading.title')} gap={16} fit>
      <ReadOnPhone />
    </SheetScreen>
  );
}
