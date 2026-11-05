import { useLocalSearchParams } from 'expo-router';

import { SplitSheet } from '../features/owed/split-sheet';

/** Tearing one spend's bill into strips, one per person. */
export default function Split() {
  const { spend } = useLocalSearchParams<{ spend: string }>();
  return <SplitSheet spendId={spend} />;
}
