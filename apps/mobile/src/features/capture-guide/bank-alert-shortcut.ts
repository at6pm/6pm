/**
 * The published "Catch a bank alert" shortcut for the App Store app (ai.sixpm.app): iOS 27's
 * Notification trigger running 6pm's "Catch a bank alert" with the notification's App, Title,
 * Subtitle, Body and Date. Its trigger arrives with apps already chosen: 6pm itself, so the test
 * alert 6pm sends reaches the action, and Vietnam's most used bank and wallet apps (those not on
 * the phone stay as grey placeholders). Adding it brings the automation along, turned off: the
 * guide's steps are adding it, turning the automation on and sending a test alert; a bank that is
 * not on the trigger is added there with +. The list it is built from, and how the link is made,
 * are in `tools/scripts/bank-alert-shortcut/`.
 */
export const BANK_ALERT_SHORTCUT_URL: string | null =
  'https://www.icloud.com/shortcuts/d13f5fcf5417402aa280c51b7ac0eb68';

/** Its name, as Shortcuts lists it once added, in every language. */
export const BANK_ALERT_SHORTCUT_NAME = 'Catch a bank alert';
