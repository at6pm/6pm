import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

export const legalCopyKo: LegalStrings = {
  brandLabel: '6pm, 홈',
  updated: '최종 업데이트',
  contents: '이 페이지의 내용',
  privacy: '개인정보',
  terms: '이용약관',
  language: '언어',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${year}년 ${month}월 ${day}일`;
  },
};
