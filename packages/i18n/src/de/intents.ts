import type { Entry } from '../catalogue-types';
import type { enIntents } from '../en-intents';

// iPhone labels follow German iOS (Kurzbefehle, Sperrbildschirm, Aktionstaste) and sit in „ “ in steps.
// “Log to 6pm” is the shortcut’s own name and stays as it is.
export const deIntents: { readonly [Key in keyof typeof enIntents]: Entry } = {
  'capture.settings.title': 'Wie Ausgaben erwischt werden',
  'capture.settings.summary': '{on} von {total} an',
  'capture.status.on': 'An',
  'capture.status.off': 'Aus',
  'capture.settings.widgets': 'Widgets',
  'capture.settings.widgetsValue': 'Home & Sperrbildschirm',
  'capture.last': 'Zuletzt: {name} · {time}',

  'capture.guide.back': 'Einstellungen',
  'capture.guide.howItWorks': 'So funktioniert’s',
  'capture.guide.trouble': 'Klappt nicht?',
  'capture.guide.lands': 'Was in deinem Eingang landet',
  'capture.guide.landsNote':
    'Dort wartet es, bis du es beim Tagesabschluss behältst. Nichts zählt, bevor du es sagst.',

  'capture.share.name': 'Mit 6pm teilen',
  'capture.share.sub': 'Bei einem Bankbeleg auf „Teilen“ tippen, dann auf 6pm',
  'capture.share.headline': 'Teil einen Bankbeleg. Ich lese den Betrag.',
  'capture.share.time': 'Unter einer Minute',
  'capture.share.step1': 'Öffne den Überweisungsbeleg in deiner Banking-App',
  'capture.share.step2': 'Tippe auf „Teilen“, dann auf 6pm',
  'capture.share.step2Chip': 'Teilen → 6pm',
  'capture.share.step3': 'Zurück in deinen Tag. Es liegt in deinem Eingang',
  'capture.share.step3Chip': 'Eingang',
  'capture.share.tip':
    'Zieh 6pm in deiner Teilen-Reihe nach vorn. Dann ist es von jedem Beleg nur einen Tipp entfernt.',
  'capture.share.action': '6pm in „Teilen“ anheften',
  'capture.share.pinText': 'Tippe auf „Mehr“, dann „Bearbeiten“, und füge 6pm hinzu.',

  'capture.email.name': 'Beleg-E-Mail',
  'capture.email.sub': 'Keine Weiterleitungsadresse auf diesem iPhone',
  'capture.email.headline': 'Leite Belege weiter. Sie kommen von selbst an.',
  'capture.email.time': 'Zwei Minuten, einmalig',
  'capture.email.step1': 'Kopier deine 6pm-Adresse',
  'capture.email.step1Chip': 'Deine 6pm-Adresse',
  'capture.email.step2': 'Leite eine E-Mail von Grab, Shopee oder deiner Bank dorthin weiter',
  'capture.email.step2Chip': 'Weiterleiten',
  'capture.email.step3': 'Oder leg einmal einen Filter an, dann geht das von selbst',
  'capture.email.step3Chip': 'Gmail- oder Outlook-Filter',
  'capture.email.tip':
    'Klappt am besten mit E-Belegen von Grab, Be, Shopee und Banken. Andere E-Mails werden übersprungen.',
  'capture.email.sample': 'Grab-Fahrt nach Hause',

  'capture.scan.name': 'Scannen & zahlen',
  'capture.scan.sub':
    'Scann einen VietQR, um in deiner Banking-App zu zahlen, oder einen Beleg, um ihn zu erfassen',
  'capture.scan.headline': 'Scannen, in der Banking-App zahlen, zurückkommen.',
  'capture.scan.time': 'Bei jeder Zahlung',
  'capture.scan.step1': 'Scann einen beliebigen VietQR aus 6pm',
  'capture.scan.step1Chip': 'Scannen',
  'capture.scan.step2': 'Wähl deine Bank. Sie öffnet sich mit dem Betrag',
  'capture.scan.step2Chip': 'Bank öffnen',
  'capture.scan.step3': 'Zurück in 6pm, tippe auf „Bezahlt“. Oder ich frag später',
  'capture.scan.step3Chip': 'Bezahlt · Noch nicht',
  'capture.scan.tip':
    'Leg „QR scannen“ auf den Sperrbildschirm oder die Aktionstaste, dann musst du nicht entsperren.',
  'capture.scan.action': 'Jetzt scannen',

  'capture.wallet.name': 'Wallet-Automation',
  'capture.wallet.subOn': 'An · erwischt Apple Pay-Zahlungen',
  'capture.wallet.subOff': 'In Kurzbefehle aktivieren, um Apple Pay zu erwischen',
  'capture.wallet.statusOn': 'An · jede Zahlung',
  'capture.wallet.headline': 'Apple Pay-Zahlungen erwischen, ohne einen Finger zu rühren.',
  'capture.wallet.time': 'Etwa eine Minute, einmalig',
  'capture.wallet.step1': 'Füge den 6pm-Kurzbefehl hinzu',
  'capture.wallet.step1Chip': 'Log to 6pm',
  'capture.wallet.step2': 'Füge in Kurzbefehle eine Wallet-Automation hinzu',
  'capture.wallet.step2Chip': 'Automation → Wallet',
  'capture.wallet.step3': 'Lass sie „Log to 6pm“ ausführen',
  'capture.wallet.step3Chip': 'Kurzbefehl ausführen',
  'capture.wallet.tip':
    'Zahlungen bringen Händler und Betrag mit. Bestätigen musst du sie trotzdem beim Tagesabschluss.',
  'capture.wallet.actionAdd': '6pm-Kurzbefehl hinzufügen',
  'capture.wallet.actionOff': 'Kurzbefehle öffnen',
  'capture.wallet.actionOn': 'Ausschalten',

  'capture.widgets.name': 'Widgets & Steuerelemente',
  'capture.widgets.sub': 'Sperrbildschirm · Kontrollzentrum · Aktionstaste',
  'capture.widgets.headline': 'Erfasst, bevor das Handy wieder in der Tasche ist.',
  'capture.widgets.time': 'Dreißig Sekunden',
  'capture.widgets.step1': 'Halte den Sperrbildschirm gedrückt, dann „Anpassen“',
  'capture.widgets.step1Chip': 'Sperrbildschirm',
  'capture.widgets.step2': 'Füge „QR scannen“ oder „Schnell erfassen“ von 6pm hinzu',
  'capture.widgets.step2Chip': '6pm · Schnell erfassen',
  'capture.widgets.step3': 'Oder leg die Aktionstaste auf 6pm',
  'capture.widgets.step3Chip': 'Aktionstaste',
  'capture.widgets.tip': 'Halte „Schnell erfassen“ gedrückt und sag es: „trà sữa 45k“.',
  'capture.widgets.action': 'Fertig',
};
