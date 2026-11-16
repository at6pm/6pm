import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { OwedPerson, OwedRow } from '@6pm/domain';

import { useMoney } from '../data/money-provider';
import { AskScreen } from '../features/owed/ask-screen';
import { RequestAskScreen } from '../features/owed/request-ask';
import { useOwed, useReceivingAccount } from '../features/owed/use-owed';

/**
 * Ask one person, full screen: their strip with a VietQR on it; or one client's request (`line`),
 * with its job and its code in the note.
 */
export default function OwedAsk() {
  const { key, line } = useLocalSearchParams<{ key: string; line?: string }>();
  const { people } = useOwed();
  const snap = useMoney();
  const { account } = useReceivingAccount();
  // Fixed as it opens: a payback landing meanwhile does not pull the strip from under the friend.
  const [person] = useState<OwedPerson | undefined>(() => people.find((p) => p.key === key));
  const [request] = useState<OwedRow | undefined>(() =>
    line ? snap.owed.find((row) => row.id === line && row.code != null) : undefined,
  );
  if (!account) return null;
  if (request) return <RequestAskScreen row={request} account={account} />;
  if (!person) return null;
  return <AskScreen person={person} account={account} />;
}
