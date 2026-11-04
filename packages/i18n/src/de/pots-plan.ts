import type { Entry } from '../catalogue-types';
import type { enPotsPlan } from '../en-pots-plan';

export const dePotsPlan: { readonly [Key in keyof typeof enPotsPlan]: Entry } = {
  'potsPlan.title': 'Plan',
};
