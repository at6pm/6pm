import { useLocalSearchParams } from 'expo-router';

import { ReceivingAccountSheet } from '../features/owed/receiving-account-sheet';

/** Where friends pay the user back; opened by a first Ask (`then`), it goes on to that Ask. */
export default function ReceivingAccount() {
  const { then } = useLocalSearchParams<{ then?: string }>();
  return <ReceivingAccountSheet then={then} />;
}
