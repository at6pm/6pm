import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const thMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'ให้ Max กับเพื่อน',
  'maxCodes.give.sub': 'ส่งลิงก์ข้อเสนอ Max',
  'maxCodes.give.message':
    '6pm บอกว่าวันนี้ใช้เงินได้เท่าไร และจดรายจ่ายให้เอง นี่คือข้อเสนอ 6pm Max สำหรับคุณ: {url}',
  'maxCodes.give.failed': 'เปิดการแชร์ไม่ได้ ลองอีกครั้ง',
  'maxCodes.redeem': 'แลกรับโค้ด',
  'maxCodes.head.friend': 'เพื่อนส่ง Max มาให้คุณ',
  'maxCodes.head.code': 'ข้อเสนอ Max ของคุณ',
  'maxCodes.playHint': 'ใน Google Play แตะวิธีการชำระเงิน แล้วเลือก แลกรับโค้ด',
  'maxCodes.playHint.code':
    'คัดลอกโค้ด {code} แล้ว ใน Google Play แตะวิธีการชำระเงิน แล้วเลือก แลกรับโค้ด',
};
