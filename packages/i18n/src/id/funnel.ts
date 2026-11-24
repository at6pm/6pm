import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const idFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'Hitungan anonim',
  'privacyPage.countsSub':
    'Langkah seperti tutup hari pertama. Bukan pengeluaran, tak terkait kamu',
};
