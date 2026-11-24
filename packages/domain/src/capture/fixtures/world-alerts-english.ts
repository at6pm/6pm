import { skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from English-speaking countries, and wallets used everywhere, as public sources quote them (`world-alerts`). */
export const ENGLISH_ALERTS: readonly WorldAlertSample[] = [
  // https://www.doctorofcredit.com/chase-cracking-down-on-bank-account-funding/
  {
    country: 'US',
    app: 'Chase',
    body: 'You recently used your credit card to transfer money or to fund an account(s). This is like withdrawing cash, which has a cash advance fee and APR.',
    reads: skipped('unread'),
  },
  // https://www.desjardins.com/ca/security/security-alerts-prevent-fraud
  {
    country: 'CA',
    app: 'Desjardins',
    body: 'Hi ROBIN GRIFFIN,\nDesjardins detected an unusual transaction of CAN$195.73 attempted with your Visa ending in 4561 on April 11, 2024, at 2:32PM (Eastern Time) at MAJESTIC JEWELLERS. Your card has been locked as a security measure.\nWas this you? Reply Yes or No, then try your transaction again if necessary.',
    reads: skipped('failed'),
  },
  // https://www.desjardins.com/ca/security/security-alerts-prevent-fraud
  {
    country: 'CA',
    app: 'Desjardins',
    body: 'Hi,\nDesjardins detected an unusual transaction of CAN$1,032.65 attempted with your debit card ending in 4321 on September 10, 2024, at 2:32 PM (Eastern Time) at TECH IT EASY. Your card was locked as a security measure.\nCall the phone number on the back of your debit card for assistance.\nNever share your card number or PIN by phone, text message or email.',
    reads: skipped('failed'),
  },
  // https://www.desjardins.com/fr/securite/alertes-prevenir-fraude.html
  {
    country: 'CA',
    app: 'Desjardins',
    body: 'Bonjour ROBIN JOLIN,\nDesjardins a détecté qu’une transaction inhabituelle de 195,73 $ CA a été tentée avec votre carte Visa se terminant par 4561 le 11 avril 2024 à 14 h 32 (heure de l’Est) chez BIJOUTERIE LAMOUREUX. Votre carte a été bloquée par mesure de sécurité.\nÊtes-vous à l’origine de cette transaction? Textez Oui ou Non, puis reprenez votre transaction au besoin.',
    reads: skipped('failed'),
  },
  // https://www.desjardins.com/fr/securite/alertes-prevenir-fraude.html
  {
    country: 'CA',
    app: 'Desjardins',
    body: "Bonjour,\nDesjardins a détecté qu'une transaction inhabituelle de 1032,65 $ CA a été tentée avec votre carte de débit se terminant par 4321 le 10 septembre 2024 à 14 h 32 (heure de l'Est) chez QUINCAILLERIE MASSON. Votre carte a été bloquée par mesure de sécurité.\nComposez le numéro de téléphone inscrit au verso de votre carte de débit pour obtenir de l'assistance.\nNe partagez jamais votre numéro de carte ou votre NIP au téléphone, par texto ou courriel.",
    reads: skipped('failed'),
  },
  // https://community.monzo.com/t/youve-spent-xx-today-messages/24260
  {
    country: 'GB',
    app: 'Monzo',
    body: 'You spent 5.60 at Pret. You’ve spent 17.10 today.',
    reads: spent(560, 'GBP'),
  },
  // https://community.monzo.com/t/introducing-salary-sorter-and-bills-pots/81016
  {
    country: 'GB',
    app: 'Monzo',
    body: 'You spent £5 at xyz, you’ve spent £21 today',
    reads: spent(500, 'GBP'),
  },
  // https://monzo.com/blog/new-bill-split-reminder/
  {
    country: 'GB',
    app: 'Monzo',
    body: '👋 Got a second to pay the £5.20 you owe Katy?',
    reads: skipped('unread'),
  },
  // https://community.monzo.com/t/if-there-is-insufficient-money-in-the-account/91085
  {
    country: 'GB',
    app: 'Monzo',
    body: 'You have insufficient funds for your £30 EE direct debit. Please transfer some money now to avoid it failing',
    reads: skipped('failed'),
  },
  // https://www.business.aib.ie/text-alerts
  {
    country: 'GB',
    app: 'AIB (GB)',
    body: "AIB (GB): Is transaction for £100.00 at Retailer name on card ending 1234 yours? If so reply '1', if not reply '9'.",
    reads: skipped('unread'),
  },
  // https://www.unibank.com.au/content/dam/channels/websites/uni/common-assets/guides/ub-fraud-alert-sms-how-to.pdf
  {
    country: 'AU',
    app: 'Teachers Mutual Bank / UniBank',
    body: 'Teachers Mutual Bank Ltd. would like to confirm if you made a payment of $1313.00. To confirm reply Yes 821268 or if not, reply No 821268',
    reads: skipped('unread'),
  },
];
