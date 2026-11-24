import type { Entry } from '../catalogue-types';
import type { enFunnel } from '../en-funnel';

export const thFunnel: { readonly [Key in keyof typeof enFunnel]: Entry } = {
  'privacyPage.counts': 'การนับแบบไม่ระบุตัวตน',
  'privacyPage.countsSub': 'ขั้นตอนอย่างการปิดวันครั้งแรก ไม่มีรายจ่าย ไม่ผูกกับตัวคุณ',
};
