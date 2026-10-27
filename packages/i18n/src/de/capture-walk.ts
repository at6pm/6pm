import type { Entry } from '../catalogue-types';
import type { enCaptureWalk } from '../en-capture-walk';

// The labels inside the pictured screens are the German iOS and Gmail ones; steps quote them in „ “.
// “Log to 6pm” is the shortcut’s own name and stays as it is.
export const deCaptureWalk: { readonly [Key in keyof typeof enCaptureWalk]: Entry } = {
  'capture.walk.stepOf': 'Schritt {step} von {total}',
  'capture.walk.next': 'Weiter',
  'capture.walk.back': 'Zurück',
  'capture.walk.again': 'Von vorn',
  'capture.walk.mistakes': 'Häufige Fehler',

  'capture.walk.wallet.s1Title': 'Den 6pm-Kurzbefehl hinzufügen',
  'capture.walk.wallet.s1Body':
    'Tippe unten auf „6pm-Kurzbefehl hinzufügen“, dann auf „Kurzbefehl hinzufügen“. Er heißt „Log to 6pm“.',
  'capture.walk.wallet.s2Title': '„Automation“ öffnen und + tippen',
  'capture.walk.wallet.s2Body':
    'Tippe in Kurzbefehle auf „Mediathek“, dann „Automation“, dann +. Siehst du „Kurzbefehl beschreiben“, tippe auf „Bearbeiten“.',
  'capture.walk.wallet.s3Title': 'Den Wallet-Auslöser hinzufügen',
  'capture.walk.wallet.s3Body':
    'Tippe im Bereich unten auf „Automation“, dann auf „Wallet“. Die Karte „Wenn Beliebige Karte angetippt wird“ erscheint.',
  'capture.walk.wallet.s4Title': '„Log to 6pm“ ausführen',
  'capture.walk.wallet.s4Body':
    'Tippe auf „Suchen“, gib „Kurzbefehl ausführen“ ein und tippe darauf. Dann tippe auf „Kurzbefehl“ und wähle „Log to 6pm“.',
  'capture.walk.wallet.s5Title': '„Beim Ausführen anzeigen“ aus, dann zurück',
  'capture.walk.wallet.s5Body':
    'Lass die Automation an. Beim Zurückgehen wird sie gesichert. Nur bestimmte Karten? Tippe auf „Beliebige Karte“ und wähle sie aus.',
  'capture.walk.wallet.s6Title': 'Ausprobieren',
  'capture.walk.wallet.s6Body':
    'Bezahl etwas mit Apple Pay auf diesem iPhone und öffne dann 6pm. Die Zahlung liegt in deinem Eingang.',
  'capture.walk.wallet.mistake1':
    'Ein Kurzbefehl ohne die Karte „Wenn Beliebige Karte angetippt wird“ ganz oben. Er läuft nur, wenn du ihn selbst startest.',
  'capture.walk.wallet.mistake2':
    '„Kurzbefehl ausführen“ ohne gewählten Kurzbefehl. Tippe auf „Kurzbefehl“ und wähle „Log to 6pm“, sonst wird nichts erfasst.',
  'capture.walk.wallet.mistake3':
    '„Beim Ausführen anzeigen“ ist noch an. Dann hält jede Zahlung an und zeigt dir eine Karte, statt still zu erfassen.',
  'capture.walk.wallet.olderTitle': 'Unter iOS 26',
  'capture.walk.wallet.older1': 'Öffne in Kurzbefehle den Tab „Automation“ und tippe auf +.',
  'capture.walk.wallet.older2':
    'Tippe auf „Wallet“, wähle deine Karten, dann „Sofort ausführen“ und „Weiter“.',
  'capture.walk.wallet.older3': 'Wähle „Log to 6pm“ aus deinen Kurzbefehlen, dann „Fertig“.',
  'capture.walk.wallet.handTitle': 'Lieber selbst bauen?',
  'capture.walk.wallet.hand1':
    'Füge statt „Kurzbefehl ausführen“ die Aktion „In 6pm erfassen“ hinzu und schalte „Beim Ausführen anzeigen“ aus.',
  'capture.walk.wallet.hand2':
    'Setze „Betrag“ auf „Transaktion › Betrag“ und „Wo“ auf „Transaktion › Händler“.',

  'capture.walk.email.s1Title': 'Gmail-Einstellungen am Computer öffnen',
  'capture.walk.email.s1Body':
    'In der Gmail-App lässt sich keine Weiterleitung einrichten. Klicke in Gmail im Browser auf das Zahnrad, dann auf „Alle Einstellungen aufrufen“.',
  'capture.walk.email.s2Title': 'Weiterleitung und POP/IMAP',
  'capture.walk.email.s2Body':
    'Öffne diesen Tab und klicke auf „Weiterleitungsadresse hinzufügen“.',
  'capture.walk.email.s3Title': 'Deine 6pm-Adresse einfügen',
  'capture.walk.email.s3Body':
    'Kopiere sie mit dem Button unten, füge sie ein, dann „Weiter“ und „Fortfahren“.',
  'capture.walk.email.s4Title': 'Den Code aus 6pm eingeben',
  'capture.walk.email.s4Body':
    'Gmail schickt eine Bestätigung an deine 6pm-Adresse, und 6pm zeigt dir den Code. Gib ihn neben „Bestätigen“ ein.',
  'capture.walk.email.s5Title': 'Einen Filter für Belege anlegen',
  'capture.walk.email.s5Body':
    'Leite nicht alles weiter. Öffne die Suchoptionen und trag deine Beleg-Absender bei „Von“ ein.',
  'capture.walk.email.s6Title': 'An 6pm weiterleiten',
  'capture.walk.email.s6Body':
    'Klicke auf „Filter erstellen“, hake „Weiterleiten an“ an, wähle deine 6pm-Adresse und klicke noch mal auf „Filter erstellen“.',
  'capture.walk.email.otherTitle': 'Andere Mail-Dienste',
  'capture.walk.email.outlook': 'Outlook.com',
  'capture.walk.email.outlook1': 'Öffne im Browser „Einstellungen“, dann „E-Mail“, dann „Regeln“.',
  'capture.walk.email.outlook2':
    'Neue Regel hinzufügen: Kommt sie von deinen Beleg-Absendern, wird sie an deine 6pm-Adresse weitergeleitet.',
  'capture.walk.email.outlook3':
    'Speichern. Outlook bittet dich eventuell vorher, dich erneut anzumelden.',
  'capture.walk.email.icloud': 'iCloud Mail',
  'capture.walk.email.icloud1': 'Öffne auf icloud.com/mail „Einstellungen“, dann „Regeln“, dann +.',
  'capture.walk.email.icloud2':
    'Kommt eine Nachricht von einem Beleg-Absender, leite sie an deine 6pm-Adresse weiter.',
  'capture.walk.email.icloud3':
    'Eine Regel pro Absender. Bis sie greift, können 15 Minuten vergehen.',

  'capture.walk.share.s1Title': 'Den Beleg in deiner Banking-App öffnen',
  'capture.walk.share.s1Body':
    'Der Bildschirm nach einer Überweisung oder einer aus deinem Verlauf. Tippe auf „Teilen“.',
  'capture.walk.share.s2Title': 'Auf 6pm tippen',
  'capture.walk.share.s2Body':
    'Ist es nicht zu sehen, scroll durch die App-Reihe. Du kannst auch ein oder mehrere Fotos von Belegen teilen.',
  'capture.walk.share.s3Title': 'Prüfen und bestätigen',
  'capture.walk.share.s3Body':
    'Ich lese den Betrag und wen du bezahlt hast. Bestätige, und es liegt in deinem Eingang.',
  'capture.walk.share.inInbox': 'In deinem Eingang',

  'capture.walk.bank.done': 'Überweisung erfolgreich',
  'capture.walk.bank.from': 'Von',
  'capture.walk.bank.yourBank': 'Deine Bank',
  'capture.walk.bank.share': 'Teilen',
  'capture.walk.bank.home': 'Start',

  'capture.walk.test.paid': 'Fertig',
  'capture.walk.test.inbox': 'Eingang',
  'capture.walk.test.row': 'Apple Pay · zu prüfen',

  'capture.walk.ios.library': 'Mediathek',
  'capture.walk.ios.allShortcuts': 'Alle Kurzbefehle',
  'capture.walk.ios.shareSheet': 'Share-Sheet',
  'capture.walk.ios.gallery': 'Galerie',
  'capture.walk.ios.automation': 'Automation',
  'capture.walk.ios.apps': 'Apps',
  'capture.walk.ios.edit': 'Bearbeiten',
  'capture.walk.ios.noAutomations': 'Keine Automationen',
  'capture.walk.ios.noAutomationsSub': 'Kurzbefehle automatisch ausführen lassen.',
  'capture.walk.ios.newShortcut': 'Neuer Kurzbefehl',
  'capture.walk.ios.describe': 'Kurzbefehl beschreiben',
  'capture.walk.ios.addActions': 'Füge unten Aktionen hinzu, um einen Kurzbefehl zu erstellen.',
  'capture.walk.ios.search': 'Suchen',
  'capture.walk.ios.scripting': 'Skripterstellung',
  'capture.walk.ios.sendMessage': 'Nachricht senden',
  'capture.walk.ios.openApp': 'App öffnen',
  'capture.walk.ios.playMusic': 'Musik wiedergeben',
  'capture.walk.ios.app': 'App',
  'capture.walk.ios.appEx': '„Wenn Wetter geöffnet oder geschlossen wird“',
  'capture.walk.ios.wallet': 'Wallet',
  'capture.walk.ios.walletEx': '„Wenn ich eine Wallet-Karte oder einen Pass antippe“',
  'capture.walk.ios.screenshot': 'Bildschirmfoto',
  'capture.walk.ios.screenshotEx': '„Wenn ein Bildschirmfoto gesichert wird“',
  'capture.walk.ios.when': 'Wenn',
  'capture.walk.ios.isTapped': 'angetippt wird',
  'capture.walk.ios.anyCard': 'Beliebige Karte',
  'capture.walk.ios.showWhenRun': 'Beim Ausführen anzeigen',
  'capture.walk.ios.addShortcut': 'Kurzbefehl hinzufügen',
  'capture.walk.ios.dontAdd': 'Nicht hinzufügen',
  'capture.walk.ios.runShortcut': 'Kurzbefehl ausführen',
  'capture.walk.ios.run': 'Ausführen',
  'capture.walk.ios.shortcut': 'Kurzbefehl',
  'capture.walk.ios.shortcutA': 'Ankunft zu Hause',
  'capture.walk.ios.shortcutB': 'Wäsche-Timer',
  'capture.walk.ios.personal': 'Persönlich',
  'capture.walk.ios.walletSummary': 'Wenn ich einen Wallet-Pass oder eine Zahlungskarte antippe',
  'capture.walk.ios.messages': 'Nachrichten',
  'capture.walk.ios.mail': 'Mail',
  'capture.walk.ios.image': 'Bild',
  'capture.walk.ios.copy': 'Kopieren',
  'capture.walk.ios.saveImage': 'Bild sichern',

  'capture.walk.gmail.searchMail': 'In E-Mails suchen',
  'capture.walk.gmail.quickSettings': 'Schnelleinstellungen',
  'capture.walk.gmail.seeAll': 'Alle Einstellungen aufrufen',
  'capture.walk.gmail.settings': 'Einstellungen',
  'capture.walk.gmail.general': 'Allgemein',
  'capture.walk.gmail.labels': 'Labels',
  'capture.walk.gmail.filters': 'Filter und blockierte Adressen',
  'capture.walk.gmail.forwarding': 'Weiterleitung und POP/IMAP',
  'capture.walk.gmail.forwardingHead': 'Weiterleitung:',
  'capture.walk.gmail.addAddress': 'Weiterleitungsadresse hinzufügen',
  'capture.walk.gmail.enterAddress': 'Neue Weiterleitungsadresse eingeben:',
  'capture.walk.gmail.next': 'Weiter',
  'capture.walk.gmail.cancel': 'Abbrechen',
  'capture.walk.gmail.proceed': 'Fortfahren',
  'capture.walk.gmail.forwardTo': 'Eingehende E-Mails weiterleiten an',
  'capture.walk.gmail.verify': 'Bestätigen',
  'capture.walk.gmail.code': 'Bestätigungscode',
  'capture.walk.gmail.disable': 'Weiterleitung deaktivieren',
  'capture.walk.gmail.from': 'Von',
  'capture.walk.gmail.subject': 'Betreff',
  'capture.walk.gmail.hasWords': 'Enthält die Wörter',
  'capture.walk.gmail.createFilter': 'Filter erstellen',
  'capture.walk.gmail.search': 'Suchen',
  'capture.walk.gmail.whenArrives': 'Wenn eine Nachricht genau den Suchkriterien entspricht:',
  'capture.walk.gmail.skipInbox': 'Posteingang überspringen (archivieren)',
  'capture.walk.gmail.markRead': 'Als gelesen markieren',
  'capture.walk.gmail.forwardIt': 'Weiterleiten an:',
  'capture.walk.gmail.inbox': 'Posteingang',
};
