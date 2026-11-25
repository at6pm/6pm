import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

export const legalCopyFr: LegalStrings = {
  brandLabel: '6pm, accueil',
  updated: 'Dernière mise à jour',
  contents: 'Sur cette page',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  language: 'Langue',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day === 1 ? '1er' : day} ${months[month - 1]} ${year}`;
  },
};
