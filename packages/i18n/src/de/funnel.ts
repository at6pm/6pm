import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const deFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'Anonyme Zählungen',
  'privacyPage.countsSub':
    'Schritte wie dein erster Abschluss. Nie Ausgaben, nie mit dir verknüpft',
};
