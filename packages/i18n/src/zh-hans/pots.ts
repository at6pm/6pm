import type { Entry } from '../catalogue-types';
import type { enPots } from '../en-pots';

export const zhHansPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': '未来的你',
};
