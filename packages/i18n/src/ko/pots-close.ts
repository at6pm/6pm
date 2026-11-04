import type { Entry } from '../catalogue-types';
import type { enPotsClose } from '../en-pots-close';

export const koPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': '저금통에서',
};
