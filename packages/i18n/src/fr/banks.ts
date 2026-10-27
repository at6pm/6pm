import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const frBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': 'Banques et portefeuilles',
  'banks.sub':
    'Pour que 6pm reconnaisse leurs tickets et leurs codes QR. Choisis tous ceux que tu utilises.',
  'banks.search': 'Chercher une banque ou un portefeuille',
  'banks.clear': 'Effacer la recherche',
  'banks.suggested': 'Suggestions pour toi',
  'banks.yours': 'Tes choix et suggestions',
  'banks.all': 'Toutes les banques et portefeuilles',
  'banks.none': 'Aucune banque ni portefeuille ne correspond à « {query} ».',
  'banks.yoursOnly': 'Tes choix',
  'banks.typeHint': 'Cherche ta banque ou ton portefeuille, ou tape son nom pour l’ajouter.',
  'banks.byName': 'Ajouter par son nom',
  'banks.kind.bank': 'Banque',
  'banks.kind.wallet': 'Portefeuille',
};
