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

/** What trying a way does on a phone: opens an app to make a catch with, or sends a test alert. */
export type WayTry =
  { readonly kind: 'open'; readonly url: string } | { readonly kind: 'test' } | null;

/** The phone a way is tried on. */
export interface TryPhone {
  readonly os: string;
  /**
   * Bank alerts are read here (Android's listener, or the iPhone's Shortcuts automation) and this
   * build can post a test alert.
   */
  readonly testAlert: boolean;
}

/**
 * What a way's tile does on this phone. Photos to share a receipt from and Wallet to pay with a
 * tap, as before. Bank alerts: a test alert 6pm sends to itself wherever it can, since it shows
 * the way working in seconds with no money moved (on Android nothing else would until a real
 * payment came; on the iPhone it is the only sign that the automation runs). An iPhone build that
 * cannot send one opens the person's bank app at its home, for a small move to themselves, or
 * does nothing when 6pm cannot open one.
 */
export function wayTryOf(way: ListenWay, bankId: string | null, phone: TryPhone): WayTry {
  if (way === 'share') return { kind: 'open', url: PHOTOS_URL };
  if (way === 'wallet') return { kind: 'open', url: WALLET_URL };
  if (phone.testAlert) return { kind: 'test' };
  if (phone.os !== 'ios') return null;
  const scheme = bankId !== null ? (findBank(bankId)?.ios?.scheme ?? null) : null;
  return scheme !== null ? { kind: 'open', url: scheme } : null;
}

/**
 * Opens what a way needs to make one catch right now: Photos to share a receipt from, Wallet to
 * pay with a tap, or (where no test alert can be sent) the person's bank app at its home, since a
 * small move to themselves sends its alert. Nothing is moved or paid by 6pm; when the app will
 * not open, nothing happens and the screen keeps listening. A test alert is not sent from here:
 * the wait itself sends it and shows what became of it, so `testAlert` only keeps the bank app
 * from opening over it.
 */
export function tryWay(way: ListenWay, bankId: string | null, testAlert: boolean): void {
  const made = wayTryOf(way, bankId, { os: Platform.OS, testAlert });
  if (made?.kind === 'open') void Linking.openURL(made.url).catch(() => undefined);
}
