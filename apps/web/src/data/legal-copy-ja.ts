import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

export const legalCopyJa: LegalStrings = {
  brandLabel: '6pm、ホーム',
  updated: '最終更新日',
  contents: 'このページの内容',
  privacy: 'プライバシー',
  terms: '利用規約',
  language: '言語',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${year}年${month}月${day}日`;
  },
};
