import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const legalCopyId: LegalStrings = {
  brandLabel: '6pm, beranda',
  updated: 'Terakhir diperbarui',
  contents: 'Di halaman ini',
  privacy: 'Privasi',
  terms: 'Ketentuan',
  language: 'Bahasa',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day} ${months[month - 1]} ${year}`;
  },
};
