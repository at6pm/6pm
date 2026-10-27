import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

export const frExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': 'Exporter',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'Rien à exporter pour l’instant. Ajoute d’abord une dépense.',
  'export.failed': 'Impossible de créer le fichier. Réessaie.',

  'export.csv.date': 'Date',
  'export.csv.time': 'Heure',
  'export.csv.merchant': 'Commerçant',
  'export.csv.category': 'Catégorie',
  'export.csv.amount': 'Montant ({code})',
  'export.csv.status': 'Statut',
  'export.csv.source': 'Origine',
  'export.csv.wallet': 'Moyen de paiement',
  'export.csv.note': 'Remarque',
  'export.csv.detail': 'Détails',
  'export.csv.forWork': 'Pour le travail',
  'export.csv.foreignAmount': 'Montant en devise',
  'export.csv.currency': 'Devise',
  'export.csv.yes': 'Oui',
  'export.csv.no': 'Non',
};
