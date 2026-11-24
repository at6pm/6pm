import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const koFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': '익명 집계',
  'privacyPage.countsSub': '첫 마감 같은 단계만. 지출은 담지 않고, 당신과 연결되지 않아요',
};
