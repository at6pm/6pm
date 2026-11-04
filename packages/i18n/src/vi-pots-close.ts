import type { Entry } from './catalogue-types';
import type { enPotsClose } from './en-pots-close';

export const viPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': 'Lấy từ lọ',
};
