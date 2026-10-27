import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const deCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'Bankmitteilung erwischen',
  'native.intents.catchAlert.description':
    'Liest eine Mitteilung deiner Bank oder E-Wallet auf deinem iPhone und legt die Geldbewegung in den Eingang von 6pm. Codes, fehlgeschlagene Zahlungen und Werbung werden übersprungen.',
  'native.intents.catchAlert.alertTitle': 'Titel',
  'native.intents.catchAlert.subtitle': 'Untertitel',
  'native.intents.catchAlert.body': 'Inhalt',
  'native.intents.catchAlert.date': 'Datum',
  'native.intents.catchAlert.app': 'App',
  'capture.alerts.name': 'Bankmitteilungen',
  'capture.alerts.sub': 'Mitteilungen von Bank und E-Wallet erfassen sich selbst',
  'capture.alerts.headline': 'Mitteilungen von Bank und E-Wallet erfassen sich selbst.',
  'capture.alerts.time': 'Etwa zwei Minuten, einmalig',
  'capture.alerts.step1': 'Füge in Kurzbefehle eine Mitteilungs-Automation hinzu',
  'capture.alerts.step1Chip': 'Automation → Mitteilung',
  'capture.alerts.step2': 'Wähl deine Banking- und E-Wallet-Apps',
  'capture.alerts.step3': 'Lass sie „Bankmitteilung erwischen“ ausführen',
  'capture.alerts.step3Chip': 'Bankmitteilung erwischen',
  'capture.alerts.tip':
    'Codes, fehlgeschlagene Zahlungen und Werbung werden übersprungen. Was Apple Pay oder eine E-Mail schon erwischt hat, kommt nicht doppelt rein.',
  'capture.alerts.privacy': 'Mitteilungen werden auf deinem iPhone gelesen und verlassen es nie.',
  'capture.alerts.statusTitle': 'Letzte Mitteilung',
  'capture.alerts.none': 'Noch keine Bankmitteilung gesehen',
  'capture.alerts.noneBody': 'Wenn alles eingerichtet ist, mach zum Testen eine kleine Zahlung.',
  'capture.alerts.seenBody': 'Die Automation läuft. Was sich bewegt hat, wartet in deinem Eingang.',
  'capture.alerts.cameIn': '{amount} eingegangen',
  'capture.alerts.skip.code': 'ein Code, übersprungen',
  'capture.alerts.skip.failed': 'fehlgeschlagene Zahlung, übersprungen',
  'capture.alerts.skip.promo': 'Werbung, übersprungen',
  'capture.alerts.skip.balance': 'Kontostand-Info, übersprungen',
  'capture.alerts.skip.security': 'Sicherheitshinweis, übersprungen',
  'capture.alerts.skip.unread': 'keine Zahlung, übersprungen',
  'capture.alerts.actionAdd': '6pm-Kurzbefehl holen',
  'capture.alerts.actionOpen': 'Kurzbefehle öffnen',
  'capture.walk.alerts.s1Title': '„Automation“ öffnen und + tippen',
  'capture.walk.alerts.s1Body':
    'Tippe in Kurzbefehle auf „Mediathek“, dann „Automation“, dann +. Siehst du „Kurzbefehl beschreiben“, tippe auf „Bearbeiten“.',
  'capture.walk.alerts.s2Title': 'Den Mitteilungs-Auslöser hinzufügen',
  'capture.walk.alerts.s2Body':
    'Tippe im Bereich unten auf „Automation“, dann auf „Mitteilung“. Die Karte „Wenn ich eine Mitteilung erhalte von App“ erscheint.',
  'capture.walk.alerts.s3Title': 'Banken und E-Wallets wählen',
  'capture.walk.alerts.s3Body':
    'Tippe auf „App“ und wähl deine Bank. Tippe auf +, um jede weitere Banking- und E-Wallet-App hinzuzufügen, mit der du zahlst.',
  'capture.walk.alerts.s4Title': '„Bankmitteilung erwischen“ hinzufügen',
  'capture.walk.alerts.s4Body':
    'Tippe auf „Suchen“, gib „Bankmitteilung“ ein und tippe auf „Bankmitteilung erwischen“ von 6pm. Setze „Titel“, „Untertitel“, „Inhalt“ und „Datum“ auf die Werte der Mitteilung.',
  'capture.walk.alerts.s5Title': '„Mitteilen“ aus, dann zurück',
  'capture.walk.alerts.s5Body':
    'Tippe beim Auslöser auf ›: Lass „Automation“ an und „Mitteilen“ aus, damit Mitteilungen still erwischt werden. Beim Zurückgehen wird sie gesichert.',
  'capture.walk.alerts.s6Title': 'Ausprobieren',
  'capture.walk.alerts.s6Body':
    'Bezahl eine Kleinigkeit mit einer dieser Apps. Sobald die Mitteilung kommt, liegt die Zahlung in deinem Eingang.',
  'capture.walk.alerts.l1Title': 'Den 6pm-Kurzbefehl hinzufügen',
  'capture.walk.alerts.l1Body':
    'Tippe unten auf „6pm-Kurzbefehl holen“, dann auf „Kurzbefehl hinzufügen“. Er heißt „Catch bank alerts“.',
  'capture.walk.alerts.l2Body':
    'Öffne ihn in Kurzbefehle, tippe oben auf „App“ und wähl deine Bank, dann + für jede weitere Bank und E-Wallet.',
  'capture.walk.alerts.mistake1':
    '„Titel“, „Inhalt“ oder „Datum“ leer gelassen. Tippe jeweils darauf und wähl den Wert der Mitteilung, sonst wird nichts erfasst.',
  'capture.walk.alerts.mistake2':
    '„Mitteilen“ ist an. Dann meldet sich jede Mitteilung ein zweites Mal, statt still erwischt zu werden.',
  'capture.walk.alerts.mistake3':
    'Nur eine App gewählt. Wähl jede Bank und E-Wallet, die du nutzt, auch MoMo und ZaloPay.',
  'capture.walk.ios.notification': 'Mitteilung',
  'capture.walk.ios.notificationEx': '„Wenn ich eine Mitteilung von News erhalte“',
  'capture.walk.ios.whenNotified': 'Wenn ich eine Mitteilung erhalte von',
  'capture.walk.ios.notificationTitle': 'Mitteilung › Titel',
  'capture.walk.ios.notificationBody': 'Mitteilung › Inhalt',
  'capture.walk.ios.notificationDate': 'Mitteilung › Datum',
  'capture.walk.ios.notificationSummary': 'Wenn ich eine Mitteilung von MB Bank oder MoMo erhalte',
  'capture.walk.ios.alertSearch': 'Bankmitteilung',
  'capture.walk.ios.now': 'jetzt',
  'capture.walk.test.alertRow': 'Bankmitteilung · zu prüfen',
  'capture.siri.name': 'Sag’s Siri',
  'capture.siri.sub': 'Sag „In 6pm erfassen“, dann, was es war',
  'capture.siri.headline': 'Erfass eine Ausgabe laut, ohne 6pm zu öffnen.',
  'capture.siri.time': 'Nichts einzurichten',
  'capture.siri.step1': 'Sag „Hey Siri, in 6pm erfassen“',
  'capture.siri.step1Chip': 'In 6pm erfassen',
  'capture.siri.step2': 'Siri fragt nach dem Betrag. Sag, was und wie viel',
  'capture.siri.step2Chip': '„Phở fünfundvierzigtausend“',
  'capture.siri.step3': 'Es steht sofort in deinen heutigen Ausgaben',
  'capture.siri.step3Chip': 'Heute',
  'capture.siri.tip':
    'Siri spricht noch kein Vietnamesisch, also sprich Deutsch mit ihr. Lieber auf Vietnamesisch? Halte „Schnell erfassen“ gedrückt.',
  'capture.backTap.name': 'Auf Rückseite tippen',
  'capture.backTap.sub': 'Zweimal auf die iPhone-Rückseite tippen, um eine Ausgabe zu erfassen',
  'capture.backTap.headline': 'Zweimal hinten tippen, und „Schnell erfassen“ ist offen.',
  'capture.backTap.time': 'Dreißig Sekunden, einmalig',
  'capture.backTap.step1':
    'Öffne „Einstellungen“, dann „Bedienungshilfen“, „Tippen“, „Auf Rückseite tippen“',
  'capture.backTap.step1Chip': 'Auf Rückseite tippen',
  'capture.backTap.step2': 'Wähl „Doppeltippen“, dann „Schnell erfassen“ von 6pm',
  'capture.backTap.step2Chip': 'Doppeltippen → Schnell erfassen',
  'capture.backTap.step3': 'Tippe zweimal auf die iPhone-Rückseite. „Schnell erfassen“ öffnet sich',
  'capture.backTap.step3Chip': 'Schnell erfassen',
  'capture.backTap.tip':
    'Kein „Schnell erfassen“ zu sehen? Tippe in Kurzbefehle auf +, füge „Schnell erfassen“ von 6pm hinzu und sichere. „Dreifachtippen“ geht auch.',
  'capture.walk.ios.notificationSubtitle': 'Mitteilung › Untertitel',
  'capture.walk.ios.notify': 'Mitteilen',
  'capture.walk.ios.cancel': 'Abbrechen',
};
