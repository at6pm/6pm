import { useLocalSearchParams } from 'expo-router';

import { ReachFlow, type ReachFrom } from '../features/onboarding/reach-flow';

/**
 * "How does money reach you?", asked again: of someone counting on "It varies" (from Today), of
 * anyone editing a plan that holds its incomes (`?from=plan`), or of someone picking "It varies"
 * on Plan's month sheet (`?from=varies&income=`).
 */
export default function Reach() {
  const params = useLocalSearchParams<{ from?: string; income?: string }>();
  const from: ReachFrom =
    params.from === 'plan' || params.from === 'varies' ? params.from : 'today';
  const income = Number(params.income);
  return (
    <ReachFlow
      from={from}
      {...(Number.isSafeInteger(income) && income >= 0 && params.income ? { income } : {})}
    />
  );
}
