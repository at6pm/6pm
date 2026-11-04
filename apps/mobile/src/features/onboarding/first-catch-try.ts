import { Linking, Platform } from 'react-native';

import { BANKS, findBank } from '@6pm/domain';

import type { ListenWay } from './catch-ways';

/** Photos, where a bank receipt screenshot is shared from. */
const PHOTOS_URL = 'photos-redirect://';
/** Wallet, to pay with a tap. */
const WALLET_URL = 'shoebox://';

/**
 * The first of the person's own banks (from "Pay with") with an app 6pm can open, for the
 * 1.000₫ move to themselves; null when they picked none.
 */
export function ownBankOf(wallets: readonly string[]): string | null {
  for (const id of wallets) {
    const bank = findBank(id);
    if (bank && BANKS.includes(bank) && bank.ios !== null) return bank.id;
  }
  return null;
}

/**
 * Opens what a way needs to make one catch right now: the person's bank app at its home (a small
 * move to themselves sends its alert), Photos to share a receipt from, Wallet to pay with a tap.
 * Nothing is moved or paid by 6pm; when the app will not open, nothing happens and the screen
 * keeps listening.
 */
export function tryWay(way: ListenWay, bankId: string | null): void {
  const url =
    way === 'share'
      ? PHOTOS_URL
      : way === 'wallet'
        ? WALLET_URL
        : bankId !== null && Platform.OS === 'ios'
          ? (findBank(bankId)?.ios?.scheme ?? null)
          : null;
  if (url !== null) void Linking.openURL(url).catch(() => undefined);
}
