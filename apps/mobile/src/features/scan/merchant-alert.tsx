import { VND, type BankInfo, type VietQRFailure } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { moneyFormatFor } from '../../money/use-money-format';
import { ScanAlert } from './scan-card';

/**
 * A shop's Vietnamese payment code outside NAPAS (VNPay's, on a kiosk screen): named, with the
 * shop and amount it carries, and not payable from 6pm because no bank app takes it as a link. The
 * user pays it by scanning the screen in their bank app, and 6pm keeps the spend.
 */
export function MerchantAlert({
  failure,
  banks,
  onPay,
  onKeep,
  onLog,
  onRetry,
}: {
  readonly failure: VietQRFailure;
  /** The user's banks that take the code in their transfer link. */
  readonly banks: readonly BankInfo[];
  readonly onPay: (bank: BankInfo) => void;
  readonly onKeep: () => void;
  readonly onLog: () => void;
  readonly onRetry: () => void;
}) {
  const { t, language } = useI18n();
  const scheme = failure.provider === undefined ? null : t(`scan.scheme.${failure.provider}`);
  const title =
    scheme === null ? t('scan.merchant.titleOther') : t('scan.merchant.title', { scheme });
  const amount =
    failure.dong === undefined ? null : moneyFormatFor(VND, language).full(failure.dong);
  const bank = banks[0];

  return (
    <ScanAlert
      icon="storefront"
      title={title}
      body={amount === null ? t('scan.merchant.bodyPlain') : t('scan.merchant.body', { amount })}
      {...(bank
        ? {
            lead: {
              label: t('scan.merchant.payIn', { bank: bank.shortName }),
              onPress: () => onPay(bank),
            },
          }
        : {})}
      secondary={{ label: t('scan.tryAgain'), onPress: onRetry }}
      primary={
        amount === null
          ? { label: t('scan.abroad.logPlain'), onPress: onLog }
          : { label: t('scan.merchant.keep', { amount }), onPress: onKeep }
      }
    />
  );
}
