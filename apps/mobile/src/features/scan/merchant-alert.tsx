import type { VietQRFailure } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { phoneNumberStyle } from '../../money/device-money';
import { useHomeCurrency } from '../../money/use-money-format';
import { foreignAmountLabel } from './pay-options';
import { ScanAlert } from './scan-card';

/**
 * A shop's Vietnamese payment code outside NAPAS (VNPay's, on a kiosk screen): named, with the
 * shop and amount it carries, and not payable from 6pm because no bank app takes it as a link. The
 * user pays it by scanning the screen in their bank app, and 6pm keeps the spend.
 */
export function MerchantAlert({
  failure,
  onKeep,
  onLog,
  onRetry,
}: {
  readonly failure: VietQRFailure;
  readonly onKeep: () => void;
  readonly onLog: () => void;
  readonly onRetry: () => void;
}) {
  const { t, language } = useI18n();
  const home = useHomeCurrency();
  const scheme = failure.provider === undefined ? null : t(`scan.scheme.${failure.provider}`);
  const title =
    scheme === null ? t('scan.merchant.titleOther') : t('scan.merchant.title', { scheme });
  const amount =
    failure.dong === undefined
      ? null
      : foreignAmountLabel(failure, { home, language, phone: phoneNumberStyle() });

  return (
    <ScanAlert
      icon="storefront"
      title={title}
      body={amount === null ? t('scan.merchant.bodyPlain') : t('scan.merchant.body', { amount })}
      secondary={{ label: t('scan.tryAgain'), onPress: onRetry }}
      primary={
        amount === null
          ? { label: t('scan.abroad.logPlain'), onPress: onLog }
          : { label: t('scan.merchant.keep', { amount }), onPress: onKeep }
      }
    />
  );
}
