import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

// Forwarding is การส่งต่อ, the word Gmail and Outlook use in Thai.
export const thReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'คัดลอกที่อยู่',
  'receiptEmail.share': 'แชร์ที่อยู่ 6pm ของคุณ',
  'receiptEmail.offline': 'ที่อยู่ของคุณจะแสดงเมื่อออนไลน์',
  'receiptEmail.from': 'จาก {address}',
  'receiptEmail.deviceMode': 'ปิดอยู่ขณะที่ AI ทำงานบน iPhone เครื่องนี้',
  'receiptEmail.deviceMode.body':
    'อีเมลใบเสร็จต้องให้เซิร์ฟเวอร์ของเราอ่านเมลของคุณ จึงปิดไว้ขณะที่ 6pm ให้ AI ทำงานบน iPhone เครื่องนี้ แชร์หรือสแกนใบเสร็จแทนได้',
  'receiptEmail.check.title': '{provider} ขอให้ยืนยันการส่งต่อจาก {address}',
  'receiptEmail.check.titleNoAddress': '{provider} ขอให้ยืนยันการส่งต่อมาที่ 6pm',
  'receiptEmail.check.code': 'รหัสยืนยัน',
  'receiptEmail.check.copy': 'คัดลอก',
  'receiptEmail.check.copyLabel': 'คัดลอกรหัสยืนยัน',
  'receiptEmail.check.copied': 'คัดลอกรหัสแล้ว',
  'receiptEmail.check.hint':
    'เปิดหน้ายืนยัน หรือวางรหัสในการตั้งค่าของ {provider} แล้วใบเสร็จที่ส่งต่อมาจะเข้ามาที่นี่',
  'receiptEmail.check.open': 'เปิดหน้ายืนยัน',
  'receiptEmail.check.openFailed': 'เปิดหน้านี้ไม่ได้ คัดลอกรหัสแทนนะ',
  'receiptEmail.check.hintNoCode':
    'เปิดหน้ายืนยันแล้วแตะ ยืนยัน จากนั้นใบเสร็จที่ส่งต่อมาจะเข้ามาที่นี่',
  'receiptEmail.check.openFailedNoCode': 'เปิดหน้านี้ไม่ได้ ลองใหม่อีกสักครู่นะ',
  'receiptEmail.check.done': 'เสร็จ',
};
