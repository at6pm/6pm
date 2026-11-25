import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export const legalCopyEs: LegalStrings = {
  brandLabel: '6pm, inicio',
  updated: 'Última actualización',
  contents: 'En esta página',
  privacy: 'Privacidad',
  terms: 'Términos',
  language: 'Idioma',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day} de ${months[month - 1]} de ${year}`;
  },
};
