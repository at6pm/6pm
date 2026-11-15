import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { OwedRow } from '@6pm/domain';

import { useMoney } from '../data/money-provider';
import { RemindSheet } from '../features/owed/remind-sheet';
import { useReceivingAccount } from '../features/owed/use-owed';
import { UndoHost } from '../ui/undo/undo-host';

/** Remind a client about a request: the strip again, with a line to edit, sent from the phone. */
export default function OwedRemind() {
  const { line } = useLocalSearchParams<{ line: string }>();
  const snap = useMoney();
  const { account } = useReceivingAccount();
  const [row] = useState<OwedRow | undefined>(() =>
    snap.owed.find((r) => r.id === line && r.code != null),
  );
  if (!row || !account) return null;
  return (
    <UndoHost lift={50}>
      <RemindSheet row={row} account={account} />
    </UndoHost>
  );
}
