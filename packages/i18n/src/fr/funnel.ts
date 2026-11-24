import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const frFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'Comptages anonymes',
  'privacyPage.countsSub': 'Étapes comme la première clôture. Ni tes dépenses, ni qui tu es',
};
