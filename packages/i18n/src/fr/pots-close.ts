import type { Entry } from '../catalogue-types';
import type { enPotsClose } from '../en-pots-close';

export const frPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': 'D’un bocal',
};
