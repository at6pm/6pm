import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

export const legalCopyVi: LegalStrings = {
  brandLabel: '6pm, trang chủ',
  updated: 'Cập nhật lần cuối',
  contents: 'Nội dung',
  privacy: 'Quyền riêng tư',
  terms: 'Điều khoản',
  language: 'Ngôn ngữ',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day} tháng ${month}, ${year}`;
  },
};
