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
  'capture.alerts.time': 'Etwa eine Minute, einmalig',
  'capture.alerts.step1': 'Füge in Kurzbefehle eine Mitteilungs-Automation hinzu',
  'capture.alerts.step1Chip': 'Automation → Mitteilung',
  'capture.alerts.step2': 'Wähl deine Banking- und E-Wallet-Apps',
  'capture.alerts.step3': 'Lass sie „Bankmitteilung erwischen“ ausführen',
  'capture.alerts.step3Chip': 'Bankmitteilung erwischen',
  'capture.alerts.tip':
    'Codes, fehlgeschlagene Zahlungen und Werbung werden übersprungen. Was Apple Pay oder eine E-Mail schon erwischt hat, kommt nicht doppelt rein.',
  'capture.alerts.privacy':
    'Mitteilungen werden zuerst auf deinem iPhone gelesen, dann ein zweites Mal auf unserem Server: Text und Beträge der Mitteilung, auch der Kontostand, wenn er dasteht. Lange Nummern wie Konto-, Karten- und Telefonnummern werden vorher verdeckt. Nie, wenn die KI auf diesem Handy läuft.',
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
    'Tippe auf „6pm-Kurzbefehl holen“, dann auf „Kurzbefehl hinzufügen“. Er heißt „Catch a bank alert“.',
  'capture.walk.alerts.l2Title': 'Die Automation einschalten',
  'capture.walk.alerts.l2Body':
    'Öffne ihn in Kurzbefehle und tippe beim Auslöser auf ›. Schalte „Automation“ ein und lass „Mitteilen“ aus, damit Mitteilungen still erwischt werden. Beim Zurückgehen wird sie gesichert.',
  'capture.walk.alerts.l2ChooseBody':
    'Öffne ihn in Kurzbefehle, tippe oben auf „App“ und wähl deine Bank, dann + für jede weitere Bank und E-Wallet.',
  'capture.walk.alerts.l3Title': 'Eine Testmitteilung senden',
  'capture.walk.alerts.l3Body':
    'Geh zurück zu 6pm und tippe auf „Testmitteilung senden“. 6pm schickt sich selbst eine und sagt dir, wenn sie ankommt.',
  'capture.walk.alerts.addBank':
    'Deine Bank steht nicht in der Liste des Kurzbefehls? Öffne ihn und tippe beim Auslöser auf +, um ihre App hinzuzufügen. Leert iOS danach die Liste, füg 6pm und jede deiner Banken mit + wieder hinzu.',
  'capture.walk.alerts.mistake1':
    '„Titel“, „Inhalt“ oder „Datum“ leer gelassen. Tippe jeweils darauf und wähl den Wert der Mitteilung, sonst wird nichts erfasst.',
  'capture.walk.alerts.mistake2':
    '„Mitteilen“ ist an. Dann meldet sich jede Mitteilung ein zweites Mal, statt still erwischt zu werden.',
  'capture.walk.alerts.mistake3':
    'Nur eine App gewählt. Wähl jede Bank und E-Wallet, die du nutzt, auch MoMo und ZaloPay.',
  'capture.walk.alerts.linkedMistake1':
    '„Automation“ ist noch aus. Der Kurzbefehl kommt ausgeschaltet an: Öffne ihn, tippe beim Auslöser auf › und schalte „Automation“ ein.',
  'capture.walk.alerts.linkedMistake3':
    '6pm wurde aus dem Auslöser entfernt. Die Testmitteilung kommt nur an, wenn 6pm bei seinen Apps steht: Füg es mit + wieder hinzu.',
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

  // Android: letting 6pm keep running, and bank alerts paused while access is off.
  'capture.alerts.keepRunning':
    'Lass 6pm weiterlaufen, damit Mitteilungen auch ankommen, während dein Handy schläft. Manche Handys nennen das Autostart oder Hintergrundaktivität.',
  'capture.alerts.keepRunningChip': 'Akku → 6pm',
  'capture.alerts.keepRunningOpen': 'Akku-Einstellungen öffnen',
  'capture.alerts.paused.title': 'Bankmitteilungen sind pausiert',
  'capture.alerts.paused.body':
    '6pm sieht deine Mitteilungen nicht mehr. Erlaub den Zugriff wieder, dann tragen sich deine Zahlungen wieder von selbst ein.',
  'capture.alerts.paused.action': 'Zugriff wieder erlauben',
  'capture.alerts.steps.headline':
    'Deine Ausgaben tragen sich selbst ein, aus den Mitteilungen deiner Bank.',
  'capture.alerts.steps.addTitle': 'Kurzbefehl hinzufügen',
  'capture.alerts.steps.addLine': 'Wenn er sich öffnet, tippe auf „Kurzbefehl hinzufügen“.',
  'capture.alerts.steps.addAction': 'Kurzbefehl holen',
  'capture.alerts.steps.onTitle': 'Automation einschalten',
  'capture.alerts.steps.onLine':
    'Tippe in „Catch a bank alert“ beim Auslöser auf ›. Automation an, Mitteilen aus.',
  'capture.alerts.steps.testTitle': 'Prüfen, ob es klappt',
  'capture.alerts.steps.testLine':
    '6pm schickt sich selbst eine Testmitteilung. Nichts wird eingetragen.',
  'capture.alerts.steps.privacy': 'Lange Nummern bleiben vor unserem Server verdeckt.',
  'capture.alerts.steps.privacyDevice': 'Mitteilungen werden nur auf diesem iPhone gelesen.',
  'capture.alerts.steps.done': 'Erledigt',
};
