import { z } from 'zod';

import type { ReceivingAccount } from '@6pm/domain';

import type { MoneyStore } from './money-store';

/**
 * The settings key of the account friends pay the user back to. It is this phone's own: never in
 * a backup (`BACKUP_SETTING_KEYS` leaves it out) and never sent anywhere.
 */
export const RECEIVING_ACCOUNT_KEY = 'receivingAccount';

const accountSchema = z.object({
  bankId: z.string(),
  bin: z.string(),
  account: z.string(),
  name: z.string(),
});

/** The receiving account as typed so far, or null when none was ever typed. */
export async function readReceivingAccount(
  store: Pick<MoneyStore, 'db'>,
): Promise<ReceivingAccount | null> {
  const rows = await store.db.getAllAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [RECEIVING_ACCOUNT_KEY],
  );
  const raw = rows[0]?.value;
  if (raw === undefined) return null;
  try {
    const parsed = accountSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Keeps the receiving account as typed, in the store's turn. */
export async function writeReceivingAccount(
  store: Pick<MoneyStore, 'db' | 'exclusive'>,
  account: ReceivingAccount,
): Promise<void> {
  await store.exclusive(() =>
    store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      RECEIVING_ACCOUNT_KEY,
      JSON.stringify(account),
    ]),
  );
}

/** Whether the account can be put in a VietQR: a bank with a BIN, a number and a name. */
export function accountReady(account: ReceivingAccount | null): account is ReceivingAccount {
  return (
    account !== null &&
    /^\d{6}$/.test(account.bin) &&
    /^[0-9A-Za-z]{1,19}$/.test(account.account.replace(/[\s.-]/g, '')) &&
    account.name.trim() !== ''
  );
}
