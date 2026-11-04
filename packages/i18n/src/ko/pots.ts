import type { Entry } from '../catalogue-types';
import type { enPots } from '../en-pots';

export const koPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': '미래의 나',
};
