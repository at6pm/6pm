import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const jaFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': '匿名カウント',
  'privacyPage.countsSub': '初めての締めなどのステップ。支出は含まず、あなたとは結びつきません',
};
