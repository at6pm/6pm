import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

// Permission prompts follow iOS's German register; App Shortcut phrases are spoken commands.
export const deNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    '6pm verwendet die Kamera, um die QR-Codes und Belege zu lesen, die du scannst. Fotos bleiben auf deinem iPhone, außer ein Beleg muss genauer gelesen werden.',
  'native.permission.microphone':
    '6pm hört zu, während du eine Ausgabe sagst. Deine Stimme wird zum Verschriftlichen an einen Spracherkennungsdienst gesendet oder bleibt im Modus „Auf dem Gerät“ auf diesem iPhone.',
  'native.permission.speech': '6pm macht aus dem, was du sagst, einen Betrag und einen Namen.',
  'native.permission.photos':
    '6pm sichert nur deinen Tagesbeleg und dein Geldtagebuch in Fotos. Deine Mediathek wird nie durchsucht.',
  'native.permission.photosAdd':
    '6pm sichert deinen Tagesbeleg und dein Geldtagebuch in Fotos, wenn du das möchtest.',
  'native.permission.location':
    '6pm prüft, in welchem Land du bist, damit sich der Reisemodus im Ausland von selbst einschaltet.',
  'native.surfaces.safeToday.name': 'Heute verfügbar',
  'native.surfaces.safeToday.description': 'Was du heute ausgeben kannst, auf einen Blick.',
  'native.surfaces.setUp': '6pm zum Einrichten öffnen',
  'native.surfaces.markPaid.title': 'Bezahlt',
  'native.surfaces.todayList.name': 'Heute',
  'native.surfaces.todayList.description': 'Was du heute ausgegeben hast, Neuestes zuerst.',
  'native.share.title': 'Zu 6pm hinzufügen',
  'native.share.readFromBank': 'Auf diesem iPhone aus deinem Beleg von {bank} gelesen',
  'native.share.readHere': 'Auf diesem iPhone aus deinem Beleg gelesen',
  'native.share.unreadable': 'Dieser Beleg ließ sich nicht lesen. Gib den Betrag ein.',
  'native.share.to': 'An',
  'native.share.when': 'Wann',
  'native.share.code': 'Referenz',
  'native.share.category': 'Kategorie',
  'native.share.unsure': 'Beim Namen bin ich unsicher. Tippe zum Prüfen.',
  'native.share.checkName': 'Namen prüfen',
  'native.share.amountHint': 'Betrag',
  'native.share.nameHint': 'An wen du gezahlt hast',
  'native.share.chooseCategory': 'Wählen',
  'native.share.edit': 'Ändern',
  'native.share.done': 'Fertig',
  'native.share.confirm': 'Bestätigen',
  'native.share.currency': 'Währung',
  'native.share.currencyUnsure': 'Der Beleg nennt keine Währung. Tippe zum Prüfen.',
  'native.share.checkCurrency': 'Währung prüfen',
  'native.share.inDong': 'ca. {amount}',
  'native.share.noRate':
    'Noch kein Kurs. 6pm rechnet zum Kurs dieses Tages um, sobald es einen gibt.',
  'native.share.unknownCurrency': 'Währung nicht erkannt. Gib den Betrag in Đồng ein.',
  'native.share.unknownCurrencyIn': 'Währung nicht erkannt. Gib den Betrag in {currency} ein.',
  'native.share.looking': 'Wird genauer gelesen …',
  'native.share.step': '{n} von {total}',
  'native.share.skip': 'Überspringen',
  'native.intents.logSpend.title': 'In 6pm erfassen',
  'native.intents.logSpend.amount': 'Betrag',
  'native.intents.logSpend.merchant': 'Wo',
  'native.intents.logSpend.description':
    'Erfasse eine Ausgabe in 6pm: Apple Pay-Zahlungen aus Wallet oder was du Siri sagst.',
  'native.intents.logSpend.short': 'Ausgabe erfassen',
  'native.intents.logSpend.askAmount': 'Wie viel war es?',
  'native.intents.logSpend.logged': 'Erfasst.',
  'native.intents.logSpend.failed':
    '6pm konnte das nicht erfassen. Öffne 6pm und nutze „Schnell erfassen“.',
  'native.intents.scan.title': 'QR scannen',
  'native.intents.scan.description': 'Öffne „Scannen & zahlen“ in 6pm.',
  'native.intents.quickAdd.title': 'Schnell erfassen',
  'native.intents.quickAdd.description': 'Öffne „Schnell erfassen“ in 6pm.',
  'native.appShortcuts.logIn': 'In ${applicationName} erfassen',
  'native.appShortcuts.logSpend': 'Ausgabe in ${applicationName} erfassen',
  'native.appShortcuts.scan': 'QR-Code in ${applicationName} scannen',
  'native.appShortcuts.scanToPay': 'Mit ${applicationName} scannen und zahlen',
  'native.appShortcuts.quickAdd': 'Schnell in ${applicationName} erfassen',
};
