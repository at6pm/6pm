import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { OwedPerson } from '@6pm/domain';

import { AskScreen } from '../features/owed/ask-screen';
import { useOwed, useReceivingAccount } from '../features/owed/use-owed';

/** Ask one person, full screen: their strip with a VietQR on it. */
export default function OwedAsk() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { people } = useOwed();
  const { account } = useReceivingAccount();
  // Fixed as it opens: a payback landing meanwhile does not pull the strip from under the friend.
  const [person] = useState<OwedPerson | undefined>(() => people.find((p) => p.key === key));
  if (!person || !account) return null;
  return <AskScreen person={person} account={account} />;
}
