import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const thPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'มีรูปแนบ',
  'photo.slot': 'รูป',
  'photo.add': 'เพิ่มรูป',
  'photo.open': 'เปิดรูป',
  'photo.take': 'ถ่ายรูป',
  'photo.choose': 'เลือกจากรูปภาพ',
  'photo.close': 'ปิด',
  'photo.hint': 'ปัดลงเพื่อหนีบกลับ',
  'photo.replace': 'เปลี่ยนรูป',
  'photo.remove': 'เอาออก',
  'photo.removed': 'เอารูปออกแล้ว รายจ่ายยังอยู่',
  'photo.stamp.top': 'เก็บไว้',
  'photo.stamp.bottom': 'ในเครื่องนี้เท่านั้น',
  'photo.clipOne': 'หนีบรูป',
  'photo.cameraOff': 'กล้องของ 6pm ปิดอยู่ เปิดได้ในการตั้งค่า',
  'photo.failed': 'เก็บรูปนี้ไม่ได้',
};
