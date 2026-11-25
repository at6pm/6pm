import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

export const legalCopyZhHans: LegalStrings = {
  brandLabel: '6pm，首页',
  updated: '最后更新',
  contents: '本页内容',
  privacy: '隐私',
  terms: '条款',
  language: '语言',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${year}年${month}月${day}日`;
  },
};
