import type { Entry } from '../catalogue-types';
import type { enPots } from '../en-pots';

export const esPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': 'Tu yo futuro',
};
