import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const thBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': 'ธนาคารและวอลเล็ต',
  'banks.sub': 'เพื่อให้ 6pm อ่านใบเสร็จและคิวอาร์โค้ดของแต่ละที่ได้ เลือกทุกที่ที่คุณใช้',
  'banks.search': 'ค้นหาธนาคารและวอลเล็ต',
  'banks.clear': 'ล้างการค้นหา',
  'banks.suggested': 'แนะนำสำหรับคุณ',
  'banks.yours': 'ของคุณและที่แนะนำ',
  'banks.all': 'ธนาคารและวอลเล็ตทั้งหมด',
  'banks.none': 'ไม่มีธนาคารหรือวอลเล็ตที่ตรงกับ “{query}”',
  'banks.yoursOnly': 'ของคุณ',
  'banks.typeHint': 'ค้นหาธนาคารหรือวอลเล็ตของคุณ หรือพิมพ์ชื่อเพื่อเพิ่มเอง',
  'banks.byName': 'เพิ่มด้วยชื่อ',
  'banks.kind.bank': 'ธนาคาร',
  'banks.kind.wallet': 'วอลเล็ต',
};
