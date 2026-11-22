import { bankOfApp } from './bank-alert-senders';

/**
 * Who sent a notification the iPhone's Shortcuts automation passed on, decided from the app alone
 * and before a word of the notification is read. The automation runs for whatever apps are on its
 * trigger, and a shared shortcut or the person can put any app there: a chat, a shop, a game.
 */
export type AlertSender =
  /** A bank or wallet 6pm knows by its app: read as a bank alert. */
  | 'bank'
  /** 6pm itself: only the test alert it is waiting for is taken, and never as money. */
  | 'own'
  /**
   * The automation named no app: one built by hand with the action's App left empty. There is no
   * sender to check, so it is read as it always was.
   */
  | 'unnamed'
  /** Any other app. Nothing of it is read, kept, shown or sent. */
  | 'other';

/**
 * The sender of a notification from the app the automation named: its name as the phone shows it
 * ("MB Bank") or its bundle id. `own` lists what 6pm answers to on this phone (its name, its
 * bundle id), matched whole. A bank or wallet is one `bankOfApp` knows; nothing in the
 * notification's own words can make an app one.
 */
export function alertSenderOf(app: string | null | undefined, own: readonly string[]): AlertSender {
  const named = (app ?? '').trim().toLowerCase();
  if (named === '') return 'unnamed';
  if (own.some((name) => name.trim() !== '' && name.trim().toLowerCase() === named)) return 'own';
  return bankOfApp(app) !== null ? 'bank' : 'other';
}
