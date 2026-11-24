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
const BANK_ALERT_SHORTCUTS: Readonly<Record<string, string>> = {
  VN: VIETNAM,
  AE: 'https://www.icloud.com/shortcuts/1261dfb5259245a88a078acd4ee705f9',
  AU: 'https://www.icloud.com/shortcuts/d200b856dc4b4447acd65bbb7518c551',
  BD: 'https://www.icloud.com/shortcuts/e0cf0df44ea34382af34e06af3ec361f',
  BR: 'https://www.icloud.com/shortcuts/5ce1d426a5f7426cb70a3e3d26874ac2',
  CA: 'https://www.icloud.com/shortcuts/49836df465604e658ab34c364115ae22',
  CH: 'https://www.icloud.com/shortcuts/88cf7b2d47b7447a854b64433b3aa8ca',
  CN: 'https://www.icloud.com/shortcuts/e0bebfdf8989471d942cc4e08fe6fe1c',
  DE: 'https://www.icloud.com/shortcuts/79c581e7ecbf49828cc29ac4adb604c1',
  ES: 'https://www.icloud.com/shortcuts/60e0c92318744cb9ba9119a975d41220',
  FR: 'https://www.icloud.com/shortcuts/5905bac87f4a4d0a9594f7e60c9f57a6',
  GB: 'https://www.icloud.com/shortcuts/67ebffe06a8947a494745697c4e13ecd',
  HK: 'https://www.icloud.com/shortcuts/b4f680614cc346aca82a61bd33ac783b',
  ID: 'https://www.icloud.com/shortcuts/3c8acf6c2c404c7c847b303c6a80bb61',
  IE: 'https://www.icloud.com/shortcuts/8c7374c6ac8e41c49e1e11d870bb4a49',
  IN: 'https://www.icloud.com/shortcuts/0d290dd7ede2416ea949f77b2f4c7815',
  IT: 'https://www.icloud.com/shortcuts/c681cbfadcdf40d0a5b46fbae03e20d4',
  JP: 'https://www.icloud.com/shortcuts/db069f11db074cfc8038362d9174abcd',
  KE: 'https://www.icloud.com/shortcuts/829f4a2eedfd47d8af857fb1147df9d0',
  KH: 'https://www.icloud.com/shortcuts/ca9284d65c384715ab3dd69d5d524d34',
  KR: 'https://www.icloud.com/shortcuts/62e6a6a0f64c4ead9156b5005cea50dd',
  LA: 'https://www.icloud.com/shortcuts/946899de4dc140738aa65dd7baf9baad',
  MX: 'https://www.icloud.com/shortcuts/436916527fbb4c3cbb04887a10a86f2b',
  MY: 'https://www.icloud.com/shortcuts/910cdda498814ed38312810af54ecb76',
  NG: 'https://www.icloud.com/shortcuts/ebfd851b01f346f4b6ba9c7069692aa2',
  NL: 'https://www.icloud.com/shortcuts/b08ade38c6bb45158f2f184498af5b4b',
  NZ: 'https://www.icloud.com/shortcuts/5f73cdc11a89462389801da3ad6dc8bf',
  PH: 'https://www.icloud.com/shortcuts/b1a50a4b412e40b5b0e62b3eca4693b2',
  PK: 'https://www.icloud.com/shortcuts/a9606a8f0ce14db289bd7c660d0bcba2',
  PL: 'https://www.icloud.com/shortcuts/73a4a0a436bd448eb13f5a401279d548',
  SA: 'https://www.icloud.com/shortcuts/9a2517c03be84a07bb70fecd7db10109',
  SE: 'https://www.icloud.com/shortcuts/fe2af5633aeb4d51a05a3202a855eb18',
  SG: 'https://www.icloud.com/shortcuts/6f2a6b4aa2d44cd9b474c18268155635',
  TH: 'https://www.icloud.com/shortcuts/f0f1d452f77c4bca9ac5310ddd383858',
  TR: 'https://www.icloud.com/shortcuts/08e2fd029d0e4858924d92f3f7ffe965',
  TW: 'https://www.icloud.com/shortcuts/43ad793687714060a9229793680ac176',
  US: 'https://www.icloud.com/shortcuts/cf379198952247d9ad8c8b607368d842',
  ZA: 'https://www.icloud.com/shortcuts/9b296307701d40a18375c91330448c3e',
  world: 'https://www.icloud.com/shortcuts/10cd14b9138744c59f58d4b8e7c9e2bf',
};

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
