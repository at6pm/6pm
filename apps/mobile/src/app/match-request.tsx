import { useLocalSearchParams, useRouter } from 'expo-router';

import { MatchByHand, useSettleCandidate } from '../features/owed/request-question';
import { useSpendRow } from '../features/owed/use-spend-row';
import { useI18n } from '../i18n/i18n';
import { SheetScreen } from '../ui/navigation/sheet-screen';
import { useToast } from '../ui/toast/toast-host';

/** "Match to a request", from a money in in the Diary: the open strips it may pay, picked by hand. */
export default function MatchRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const settle = useSettleCandidate();
  const spend = useSpendRow(id);
  if (!spend || spend.direction !== 'in') return null;
  return (
    <SheetScreen title={t('request.hand.title2')} fit>
      <MatchByHand
        spend={spend}
        line={false}
        onMatched={(candidate) => {
          void settle(spend, candidate).then(() =>
            toast(t('request.matched', { name: candidate.line.name ?? t('owed.someone') })),
          );
          router.back();
        }}
        onElse={() => router.back()}
      />
    </SheetScreen>
  );
}
