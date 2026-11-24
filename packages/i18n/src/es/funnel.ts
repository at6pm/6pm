import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const esFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'Recuentos anónimos',
  'privacyPage.countsSub': 'Pasos como el primer cierre. Nunca lo que gastas, nunca ligado a ti',
};
