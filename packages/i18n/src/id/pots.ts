import type { Entry } from '../catalogue-types';
import type { enPots } from '../en-pots';

export const idPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': 'Kamu di masa depan',
};
