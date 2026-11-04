import * as Clipboard from 'expo-clipboard';
import { Linking, Platform } from 'react-native';

import {
  handoffPlan,
  payloadFor,
  rawHandoffPlan,
  type BankInfo,
  type HandoffPlan,
  type VietQR,
} from '@6pm/domain';

import { saveImage } from '../sharing/share-image';
import { shareFileName } from '../sharing/share-file';
import { qrImage } from './qr-image';

/**
 * What happened when 6pm tried to open the bank: it opened, it is not on this phone (its store
 * page opened instead), or 6pm has no link to it and the user opens it themselves.
 */
export type HandoffResult = 'opened' | 'store' | 'manual';

export interface Handoff {
  readonly result: HandoffResult;
  /** The payment's QR is in the phone's photos, for the bank app's "scan from photo". */
  readonly qrSaved: boolean;
}

const OS = Platform.OS === 'android' ? 'android' : 'ios';

/**
 * Hands a payment to a bank app. A bank whose transfer link 6pm knows opens with the payment
 * filled in. Any other bank cannot be handed it, so the payment's QR (the amount written in, a
 * shop's code as scanned) is saved to the phone's photos for the bank's own scanner to read back,
 * and the app opens at its home. The amount goes on the clipboard either way (digits only, as a
 * bank's amount field wants it).
 *
 * The app is opened without asking the phone first whether it is there (on iOS that check is
 * deprecated and capped at 25 apps), and opening fails just as clearly when the app is missing:
 * its App Store or Play Store page opens instead.
 */
export async function handOff(bank: BankInfo | null, qr: VietQR, amount: number): Promise<Handoff> {
  await Clipboard.setStringAsync(String(amount));
  return run(handoffPlan(bank, OS, qr, amount), payloadFor(qr, amount));
}

/**
 * Hands a bank app a shop's payment code as scanned (VNPay's, which 6pm cannot rewrite): the
 * bank's link carries it when the bank takes one, else the code goes to the photos for the bank's
 * own scanner. The amount, when the code has one, is on the clipboard.
 */
export async function handOffCode(
  bank: BankInfo | null,
  raw: string,
  amount: number | null,
): Promise<Handoff> {
  if (amount !== null) await Clipboard.setStringAsync(String(amount));
  return run(rawHandoffPlan(bank, OS, raw), raw);
}

async function run(plan: HandoffPlan | null, payload: string): Promise<Handoff> {
  const qrSaved = plan?.filledIn === true ? false : await saveQr(payload);
  if (plan === null) return { result: 'manual', qrSaved };
  if (plan.open !== null && (await opens(plan.open))) return { result: 'opened', qrSaved };
  for (const url of plan.store) {
    if (await opens(url)) return { result: 'store', qrSaved };
  }
  return { result: 'manual', qrSaved };
}

function opens(url: string): Promise<boolean> {
  return Linking.openURL(url).then(
    () => true,
    () => false,
  );
}

/** Saves the code to the photos; a refusal or a failure leaves the copied amount to carry the payment. */
async function saveQr(payload: string): Promise<boolean> {
  try {
    const saved = await saveImage(
      () => Promise.resolve(qrImage(payload)),
      shareFileName('payment-qr', ''),
    );
    return saved === 'saved';
  } catch {
    return false;
  }
}
