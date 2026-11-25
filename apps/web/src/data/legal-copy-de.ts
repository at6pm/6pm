import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export const legalCopyDe: LegalStrings = {
  brandLabel: '6pm, Startseite',
  updated: 'Zuletzt aktualisiert',
  contents: 'Auf dieser Seite',
  privacy: 'Datenschutz',
  terms: 'Nutzungsbedingungen',
  language: 'Sprache',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day}. ${months[month - 1]} ${year}`;
  },
};
