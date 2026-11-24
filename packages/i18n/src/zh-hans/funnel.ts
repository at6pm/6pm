import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const zhHansFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': '匿名计数',
  'privacyPage.countsSub': '比如第一次日结这样的步骤。不含花销，也不关联到你',
};
