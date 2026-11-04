import type { Entry } from '../catalogue-types';
import type { enPotsClose } from '../en-pots-close';

export const jaPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': '瓶から',
};
