import { useRouter } from 'expo-router';

import { findBank } from '@6pm/domain';

import { accountReady } from '../../data/receiving-account';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { SettingRow } from '../settings/setting-rows';
import { useReceivingAccount } from './use-owed';

/**
 * "Receiving account" in Settings › Your day, with the bank it pays into; it opens the account.
 * Only for a home in đồng, where an Ask carries a VietQR.
 */
export function ReceivingAccountRow() {
  const router = useRouter();
  const { t } = useI18n();
  const { account } = useReceivingAccount();
  const home = useHomeCurrency();
  if (home.code !== 'VND') return null;
  const value = accountReady(account ?? null)
    ? (findBank(account?.bankId ?? '')?.shortName ?? '')
    : t('owed.account.notSet');
  return (
    <SettingRow
      icon="qr_code_2"
      label={t('owed.account.title')}
      value={value}
      onPress={() => {
        haptics.tick();
        router.push('/receiving-account');
      }}
    />
  );
}
