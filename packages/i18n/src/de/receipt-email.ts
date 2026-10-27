import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

export const deReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'Adresse kopieren',
  'receiptEmail.share': 'Deine 6pm-Adresse teilen',
  'receiptEmail.offline': 'Deine Adresse erscheint, sobald du online bist',
  'receiptEmail.from': 'Von {address}',
  'receiptEmail.deviceMode': 'Aus, solange die KI auf diesem iPhone bleibt',
  'receiptEmail.deviceMode.body':
    'Für Beleg-E-Mails muss unser Server deine Mails lesen. Darum sind sie aus, solange 6pm die KI auf diesem iPhone hält. Teil stattdessen einen Beleg oder scann ihn.',
  'receiptEmail.check.title': '{provider} bittet um Bestätigung der Weiterleitung von {address}',
  'receiptEmail.check.titleNoAddress': '{provider} bittet um Bestätigung der Weiterleitung an 6pm',
  'receiptEmail.check.code': 'Bestätigungscode',
  'receiptEmail.check.copy': 'Kopieren',
  'receiptEmail.check.copyLabel': 'Bestätigungscode kopieren',
  'receiptEmail.check.copied': 'Code kopiert.',
  'receiptEmail.check.hint':
    'Öffne die Bestätigungsseite oder füge den Code in den Einstellungen von {provider} ein. Danach landen weitergeleitete Belege hier.',
  'receiptEmail.check.open': 'Bestätigungsseite öffnen',
  'receiptEmail.check.openFailed': 'Die Seite ließ sich nicht öffnen. Kopier stattdessen den Code.',
  'receiptEmail.check.hintNoCode':
    'Öffne die Bestätigungsseite und tippe auf „Bestätigen“. Danach landen weitergeleitete Belege hier.',
  'receiptEmail.check.openFailedNoCode':
    'Die Seite ließ sich nicht öffnen. Versuch es gleich noch mal.',
  'receiptEmail.check.done': 'Fertig',
};
