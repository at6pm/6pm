import type { Entry } from './catalogue-types';
import type { enFunnel } from './en-funnel';

export const viFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'Đếm ẩn danh',
  'privacyPage.countsSub': 'Các bước như lần chốt ngày đầu. Không có chi tiêu, không gắn với bạn',
};
