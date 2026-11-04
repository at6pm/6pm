import type { Entry } from '../catalogue-types';
import type { enPotsClose } from '../en-pots-close';

export const zhHansPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': '从罐子里',
};
