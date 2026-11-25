import type { LegalStrings } from './legal';
import { dateParts } from './legal-dates';

const months = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

export const legalCopyTh: LegalStrings = {
  brandLabel: '6pm, หน้าแรก',
  updated: 'อัปเดตล่าสุด',
  contents: 'ในหน้านี้',
  privacy: 'ความเป็นส่วนตัว',
  terms: 'ข้อกำหนด',
  language: 'ภาษา',
  rights: '© 2026',
  formatDate: (iso) => {
    const [year, month, day] = dateParts(iso);
    return `${day} ${months[month - 1]} ${year}`;
  },
};
