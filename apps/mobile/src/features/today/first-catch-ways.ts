import type { SymbolName } from '../../ui/icons/symbols.generated';
import type { NativeReach } from '../surfaces/native-reach';

/** The ways that run by themselves which Today's reminder can set up: its icons, in this order. */
export const REMINDER_WAYS = ['alerts', 'wallet'] as const;
export type ReminderWay = (typeof REMINDER_WAYS)[number];

export const REMINDER_ICON: Readonly<Record<ReminderWay, SymbolName>> = {
  alerts: 'account_balance',
  wallet: 'contactless',
};

/**
 * The ways Today's reminder is about on this phone: bank alerts where the phone can read them, the
 * Wallet automation where there is one. A phone with neither is never reminded: there is nothing
 * for the reminder to set up.
 */
export function reminderWaysOf(
  reach: Pick<NativeReach, 'bankAlerts' | 'wallet'>,
): readonly ReminderWay[] {
  return REMINDER_WAYS.filter((way) => (way === 'alerts' ? reach.bankAlerts : reach.wallet));
}

/** What the phone knows about whether a way that runs by itself is set up. */
export interface SetUpSigns {
  /** The ways whose set-up was walked in onboarding, as the first-catch state keeps them. */
  readonly walked: readonly string[];
  /** Android's Notification access; null where bank alerts come through a Shortcut. */
  readonly alertAccess: boolean | null;
  /** The Shortcut or the listener has read an alert, caught or skipped. */
  readonly alertRead: boolean;
}

/**
 * Whether a way that runs by itself is set up, as far as the phone can tell: Android's
 * Notification access is on; or, where a Shortcut does the work, its set-up was walked or it has
 * already passed an alert on; or the Wallet or mail set-up was walked. Android's access switched
 * off is not set up, whatever was read before.
 */
export function selfRunningSetUp({ walked, alertAccess, alertRead }: SetUpSigns): boolean {
  const alerts =
    alertAccess === null ? walked.includes('alerts') || alertRead : alertAccess === true;
  return alerts || walked.includes('wallet') || walked.includes('email');
}
