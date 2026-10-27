import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

export const deExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': 'Exportieren',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'Noch nichts zu exportieren. Erfass zuerst eine Ausgabe.',
  'export.failed': 'Die Datei ließ sich nicht erstellen. Versuch es noch mal.',

  'export.csv.date': 'Datum',
  'export.csv.time': 'Uhrzeit',
  'export.csv.merchant': 'Händler',
  'export.csv.category': 'Kategorie',
  'export.csv.amount': 'Betrag ({code})',
  'export.csv.status': 'Status',
  'export.csv.source': 'Quelle',
  'export.csv.wallet': 'Zahlungsmittel',
  'export.csv.note': 'Notiz',
  'export.csv.detail': 'Einzelheiten',
  'export.csv.forWork': 'Beruflich',
  'export.csv.foreignAmount': 'Fremdwährungsbetrag',
  'export.csv.currency': 'Währung',
  'export.csv.yes': 'Ja',
  'export.csv.no': 'Nein',
};
