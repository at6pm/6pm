import type { Entry } from './catalogue-types';
import type { enPots } from './en-pots';

export const viPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': 'Tương lai',
};
