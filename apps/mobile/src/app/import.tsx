import { useLocalSearchParams, useRouter } from 'expo-router';

import { ImportFlowView } from '../features/import/import-flow-view';

/**
 * "Bring your history", as a sheet: from Settings › Your data, from onboarding's first number
 * (`from=onboarding`), or opened with a file already chosen (`uri`, a file shared into 6pm).
 */
export default function ImportSheet() {
  const router = useRouter();
  const { from, uri } = useLocalSearchParams<{ from?: string; uri?: string }>();
  return (
    <ImportFlowView
      onboarding={from === 'onboarding'}
      uri={typeof uri === 'string' && uri.length > 0 ? uri : null}
      onClose={() => router.back()}
    />
  );
}
