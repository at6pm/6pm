import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { owedByPerson, owedTotal, type OwedPerson, type ReceivingAccount } from '@6pm/domain';

import { useMoneySelector, useMoneyStore } from '../../data/money-provider';
import type { MoneySnapshot } from '../../data/money-store';
import { openOwedOf, owedActions, owedLineOf, type OwedActions } from '../../data/owed-actions';
import { readReceivingAccount, writeReceivingAccount } from '../../data/receiving-account';

/** The owed actions on the app's store. */
export function useOwedActions(): OwedActions {
  const store = useMoneyStore();
  return useMemo(() => owedActions(store), [store]);
}

const selectOpen = (snapshot: MoneySnapshot) => openOwedOf(snapshot);
const sameLines = (a: readonly { id: string; amount: number; updatedAt: string }[], b: typeof a) =>
  a.length === b.length &&
  a.every(
    (x, i) => x.id === b[i]?.id && x.amount === b[i]?.amount && x.updatedAt === b[i]?.updatedAt,
  );

/** Every open owed line, and the people they come to, re-read only when a line changes. */
export function useOwed() {
  const rows = useMoneySelector(selectOpen, sameLines);
  return useMemo(() => {
    const people: OwedPerson[] = owedByPerson(rows.map(owedLineOf));
    return { rows, people, total: owedTotal(rows), count: rows.length };
  }, [rows]);
}

/**
 * The receiving account, read whenever the screen is in front (so Settings' edits show at once),
 * and a way to keep a new one. Undefined until read; null when none was ever typed.
 */
export function useReceivingAccount() {
  const store = useMoneyStore();
  const [account, setAccount] = useState<ReceivingAccount | null | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      readReceivingAccount(store)
        .then((read) => live && setAccount(read))
        .catch(() => live && setAccount(null));
      return () => {
        live = false;
      };
    }, [store]),
  );
  const save = useCallback(
    (next: ReceivingAccount) => {
      setAccount(next);
      return writeReceivingAccount(store, next);
    },
    [store],
  );
  return { account, save };
}
