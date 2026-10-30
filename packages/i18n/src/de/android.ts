import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own words: "dieses Handy", Google Play, "speichern" and "Galerie"; no Apple names at all.
export const deAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    'Drei Wege rein: „Schnell erfassen“ (getippt oder gesagt), einen QR-Code oder Beleg scannen und Beleg-E-Mails weiterleiten. Was 6pm erwischt, wartet in deinem Eingang bis zum Tagesabschluss.',
  'capture.share.headline':
    'Speicher den Beleg als Bild und wähl ihn dann unter „Scannen“ aus. Ich lese den Betrag.',
  'capture.wallet.headline':
    'Kartenzahlungen am Handy kann 6pm hier nicht mitlesen. Leite die Beleg-E-Mails deiner Karte weiter, dann kommen sie von selbst an.',
  'capture.widgets.headline':
    'Auf diesem Handy gibt es keine 6pm-Widgets. Halte die Scan-Taste gedrückt, dann öffnet sich „Schnell erfassen“.',

  'backup.row.on': 'Verschlüsselt · {when}',
  'backup.status.sub': {
    one: '{count} Eintrag · verschlüsselt. 6pm läuft auch ohne.',
    other: '{count} Einträge · verschlüsselt. 6pm läuft auch ohne.',
  },
  'backup.status.neverSub': 'Verschlüsselt. 6pm läuft auch ohne.',
  'backup.off.sub':
    'Auf diesem Handy versiegelt, bevor es rausgeht. Der Schlüssel bleibt auf diesem Handy, wir können also nichts lesen.',
  'backup.tooLarge': 'Das letzte Backup war zu groß zum Senden. Alles ist noch auf diesem Handy.',
  'backup.note':
    'Sichert einmal am Tag, nach deinem Tagesabschluss. Der Schlüssel verlässt dieses Handy nie, darum lässt sich ein Backup nur hier öffnen, nicht auf einem neuen Handy.',
  'backup.paused':
    'Ohne Max ist das Backup pausiert. Dein letztes Backup bleibt sicher verschlüsselt.',
  'backup.found.title': 'Für dieses Handy gibt es schon ein Backup.',
  'backup.found.sub':
    'Es stammt von einer früheren Installation. Ein Backup von hier würde es ersetzen.',
  'backup.found.restoreConfirm': 'Noch mal tippen, um die Tage auf diesem Handy zu ersetzen',
  'backup.found.replace': 'Durch dieses Handy ersetzen',
  'backup.restore.sub': {
    one: '{count} Eintrag · verschlüsselt.',
    other: '{count} Einträge · verschlüsselt.',
  },
  'backup.restore.none': 'Für dieses Handy wurde kein Backup gefunden.',
  'backup.restore.wrongKey': 'Der Schlüssel auf diesem Handy kann dieses Backup nicht öffnen.',
  'backup.error.keychain':
    'Dieses Handy hat den Schlüssel nicht behalten, darum wurde nichts gesichert. Versuch es noch mal.',
  'backup.error.tooLarge': 'Dieses Backup ist zu groß zum Senden. Alles ist noch auf diesem Handy.',

  'capture.email.sub': 'Keine Weiterleitungsadresse auf diesem Handy',
  'capture.scan.tip':
    'Halte die Scan-Taste gedrückt für „Schnell erfassen“, wenn es keinen Code zu scannen gibt.',
  'onboarding.catch.add.body':
    'Halte die Scan-Taste gedrückt für „Schnell erfassen“ und sag „Kaffee {amount}“.',
  'today.list.empty':
    'Noch nichts erwischt. Scann einen QR-Code oder Beleg, oder tippe auf +, wenn du etwas ausgibst.',

  'looks.restore.none': 'Auf diesem Google-Konto gibt es nichts wiederherzustellen.',
  'looks.restore.failed': 'Google Play war nicht erreichbar. Versuch es noch mal.',
  'looks.legal':
    'Looks sind Einmalkäufe über dein Google-Konto. Max ist ein Abo, das du jederzeit in Google Play kündigen kannst. Die Preise zeigt Google Play an.',
  'look.buying': 'Warte auf Google Play …',
  'look.noteStoreOff':
    'Google Play antwortet nicht, darum lässt sich dieser Look gerade nicht kaufen.',
  'max.cta.waiting': 'Warte auf Google Play …',
  'max.terms.storeOff': 'Max lässt sich gerade nicht kaufen: Google Play antwortet nicht.',
  'max.sub.backup': 'Verschlüsseltes Backup, komplette Historie, CSV und Sheets.',
  'max.note.backup': 'Verschlüsseltes Backup, CSV und Sheets',
  'max.welcome.win.more': 'Spartöpfe, Reisemodus und das Jahrbuch',

  'privacy.ai.device.title': 'Nur auf diesem Handy',
  'privacy.ai.device.unavailable': 'Auf Android hat 6pm kein Modell, das auf dem Handy läuft.',
  'settings.ai.device': 'Auf diesem Handy',
  'privacy.leaves.device.none': 'Nichts für die KI. Alles wird auf diesem Handy berechnet.',
  'receiptEmail.deviceMode': 'Aus, solange die KI auf diesem Handy bleibt',
  'receiptEmail.deviceMode.body':
    'Für Beleg-E-Mails muss unser Server deine Mails lesen. Darum sind sie aus, solange 6pm die KI auf diesem Handy hält. Scann stattdessen den Beleg.',
  'settings.privacyBody':
    'Dein Geld bleibt verschlüsselt auf diesem Handy. Um deine Fragen an „Frag 6pm“ zu verstehen und die Sprüche deines Begleiters zu schreiben, schickt 6pm die Frage oder ein paar Fakten über deinen Tag an Anthropic, einen KI-Dienst: Beträge, Orte und Kategorienamen, nie deine Liste der Ausgaben. Auch ein Belegfoto, das dein Handy nicht lesen kann, geht dorthin. Anthropic trainiert nicht damit und löscht alles innerhalb von 30 Tagen. Wenn du eine Ausgabe ansagst, geht deine Stimme an Deepgram und wird dort zu Text. Oben unter „KI“ kannst du all das auf diesem Handy behalten. Das Backup verlässt das Handy nur, wenn du es aktivierst, und zwar Ende-zu-Ende-verschlüsselt. Absturzberichte gehen ohne Beträge, Namen oder Notizen an Sentry, und RevenueCat wickelt Käufe ab.',

  'scan.handoff.store': '{wallet} ist nicht auf diesem Handy',
  'scan.handoff.savedQr':
    'QR-Code in deiner Galerie gespeichert: Scanne ihn in der Banking-App aus deinen Fotos. Ich frag nach, wenn du zurück bist.',
  'sharing.saved': 'In deiner Galerie gespeichert.',
  'sharing.photosOff': 'Der Zugriff auf Fotos ist für 6pm deaktiviert.',

  'startup.failedSub':
    'Nichts ist verloren. Versuch es noch mal, und wenn es wieder passiert, starte dein Handy neu.',
  'voice.unavailable': 'Spracheingabe braucht {language} als Diktiersprache auf diesem Handy',

  'onboarding.privacy.phone': 'Nur auf diesem Handy',
  'onboarding.privacy.backupSub': 'Verschlossen mit einem Schlüssel, der dieses Handy nie verlässt',

  'capture.alerts.time': 'Zehn Sekunden, einmal',
  'capture.alerts.step1': 'Schalte 6pm unter Benachrichtigungszugriff ein',
  'capture.alerts.step1Chip': 'Benachrichtigungszugriff → 6pm',
  'capture.alerts.step2': 'Lass die Mitteilungen deiner Bank- und Wallet-Apps an',
  'capture.alerts.step3': 'Jede Zahlung wartet im Eingang auf den Tagesabschluss',
  'capture.alerts.step3Chip': 'Eingang',
  'capture.alerts.tip':
    'Codes, fehlgeschlagene Zahlungen und Werbung werden übersprungen. Eine Zahlung, die schon per E-Mail erwischt wurde, kommt nicht doppelt.',
  'capture.alerts.privacy':
    'Auf diesem Handy gelesen und nirgendwohin geschickt. 6pm liest nur die Mitteilungen deiner Banken und Wallets.',
  'capture.alerts.actionAdd': 'Benachrichtigungszugriff erlauben',
  'capture.alerts.actionOpen': 'Einstellungen für Benachrichtigungszugriff',
};
