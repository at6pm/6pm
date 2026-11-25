// Translation pending: English text.
import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const legalCopyKo: LegalStrings = {
  brandLabel: '6pm, home',
  updated: 'Last updated',
  contents: 'On this page',
  privacy: 'Privacy',
  terms: 'Terms',
  language: 'Language',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day} ${months[month - 1]} ${year}`;
  },
};
