import { surfaces } from '../../../modules/surfaces';
import { readDeviceRegion } from '../banks/device-region';
import { bankAlertShortcutFor } from './bank-alert-shortcut-country';

/**
 * The published "Catch a bank alert" shortcuts for the App Store app (ai.sixpm.app), by country
 * (ISO 3166-1 alpha-2, and `world` for a country 6pm has no list for): iOS 27's Notification
 * trigger running 6pm's "Catch a bank alert" with the notification's App, Title, Subtitle, Body and
 * Date. Each trigger arrives with apps already chosen: 6pm itself, so the test alert 6pm sends
 * reaches the action, then that country's most used bank and wallet apps, the same ones the bank
 * picker offers there (those not on the phone stay as grey placeholders). Adding one brings the
 * automation along, turned off: the guide's steps are adding it, turning the automation on and
 * sending a test alert; a bank that is not on the trigger is added there with +. The lists they
 * are built from, and how each link is made, are in `tools/scripts/bank-alert-shortcut/`. A
 * country whose link is not here yet is given the world's, and Vietnam's while that is missing.
 */
const VIETNAM = 'https://www.icloud.com/shortcuts/d13f5fcf5417402aa280c51b7ac0eb68';
const BANK_ALERT_SHORTCUTS: Readonly<Record<string, string>> = { VN: VIETNAM };

/** The published shortcut for this phone's country: see `bankAlertShortcutFor`. */
export const BANK_ALERT_SHORTCUT_TEMPLATE: string =
  bankAlertShortcutFor(readDeviceRegion(), BANK_ALERT_SHORTCUTS) ?? VIETNAM;

/**
 * The shortcut published before it, with no apps on its trigger: the person chose them. It stays
 * for a build whose "Catch a bank alert" reads every notification it is handed by its words, since
 * the template's trigger holds 6pm itself and that action would take 6pm's own notifications for
 * a bank's.
 */
const BANK_ALERT_SHORTCUT_EARLIER =
  'https://www.icloud.com/shortcuts/d2eb2768c2ab4c24baa52ad35cdb53aa';

/**
 * Whether this build's action looks at the sender before the words, so the template can be
 * offered. It came in the same native build as the test alert, which is how it is told.
 */
export const BANK_ALERT_SHORTCUT_READY = typeof surfaces?.postTestAlert === 'function';

/** The shortcut the guide adds: the template, or the earlier one for an older build. */
export const BANK_ALERT_SHORTCUT_URL: string | null = BANK_ALERT_SHORTCUT_READY
  ? BANK_ALERT_SHORTCUT_TEMPLATE
  : BANK_ALERT_SHORTCUT_EARLIER;

/** Its name, as Shortcuts lists it once added, in every language. */
export const BANK_ALERT_SHORTCUT_NAME = 'Catch a bank alert';
