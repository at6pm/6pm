import type { Entry } from '../catalogue-types';
import type { enPotsClose } from '../en-pots-close';

export const esPotsClose: { readonly [Key in keyof typeof enPotsClose]: Entry } = {
  'potsClose.fromJar': 'De un frasco',
};
