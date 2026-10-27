import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

// The CSV header row is short and plain, so it reads well in any spreadsheet.
export const esExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': 'Exportar',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'Aún no hay nada que exportar. Añade un gasto primero.',
  'export.failed': 'No se ha podido crear el archivo. Inténtalo de nuevo.',

  'export.csv.date': 'Fecha',
  'export.csv.time': 'Hora',
  'export.csv.merchant': 'Comercio',
  'export.csv.category': 'Categoría',
  'export.csv.amount': 'Importe ({code})',
  'export.csv.status': 'Estado',
  'export.csv.source': 'Origen',
  'export.csv.wallet': 'Cuenta',
  'export.csv.note': 'Nota',
  'export.csv.detail': 'Detalles',
  'export.csv.forWork': 'De trabajo',
  'export.csv.foreignAmount': 'Importe en divisa',
  'export.csv.currency': 'Moneda',
  'export.csv.yes': 'Sí',
  'export.csv.no': 'No',
};
