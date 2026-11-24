import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { useI18n } from '../../../i18n/i18n';
import { haptics } from '../../../ui/haptics';
import { useToast } from '../../../ui/toast/toast-host';
import { apiBase } from '../../api/native-api';
import { SettingRow, SettingsSection } from '../../settings/setting-rows';
import { usePurchases } from '../purchases-provider';

/** The site this build talks to, which serves the code links; the public one without a server. */
export function friendLink(base: string | null): string {
  const site = base === null ? 'https://at6pm.app' : base.replace(/\/api\/?$/, '');
  return `${site}/r/friend`;
}

/**
 * Settings' Max rows, under the Max card: "Give a friend Max" shares the friend link (the site
 * sends it on to the store's own offer), and "Redeem a code" opens the Max sheet on the store's
 * redemption. Redeeming is for someone not on Max, where the store can be asked.
 */
export function MaxCodesSection() {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const { port, customer } = usePurchases();
  const [sharing, setSharing] = useState(false);

  const give = () => {
    if (sharing) return;
    haptics.tick();
    setSharing(true);
    Share.share({ message: t('maxCodes.give.message', { url: friendLink(apiBase()) }) })
      .catch(() => toast(t('maxCodes.give.failed')))
      .finally(() => setSharing(false));
  };

  const redeem = () => {
    haptics.tick();
    router.push({ pathname: '/max', params: { redeem: '1' } });
  };

  return (
    <SettingsSection title={t('maxCodes.section')}>
      <SettingRow
        first
        icon="card_giftcard"
        label={t('maxCodes.give')}
        sub={t('maxCodes.give.sub')}
        onPress={give}
      />
      {customer.max.active || !port.available ? null : (
        <SettingRow icon="confirmation_number" label={t('maxCodes.redeem')} onPress={redeem} />
      )}
    </SettingsSection>
  );
}
