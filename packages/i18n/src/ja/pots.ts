import type { Entry } from '../catalogue-types';
import type { enPots } from '../en-pots';

export const jaPots: { readonly [Key in keyof typeof enPots]: Entry } = {
  'pots.futureYou': '未来の自分',
};
