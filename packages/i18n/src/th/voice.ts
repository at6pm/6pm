import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

// Speech is heard in Vietnamese or English, so the spoken example stays an English amount.
export const thVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': 'กำลังฟัง',
  'voice.sayIt': 'พูดเลย',
  'voice.nothingTap': 'ยังฟังไม่ทัน แตะแล้วพูดอีกครั้งนะ',
  'voice.noAmount': 'ยังไม่ได้ยินยอดเงิน บอกด้วยว่าเท่าไหร่ เช่น “สี่หมื่นห้าพัน”',
  'voice.unavailable': 'การพูดต้องใช้การป้อนตามคำบอก{language}บน iPhone เครื่องนี้',
  'voice.language.vi': 'ภาษาเวียดนาม',
  'voice.language.en': 'ภาษาอังกฤษ',
  'voice.denied': 'ไมโครโฟนหรือการรู้จำเสียงพูดปิดอยู่สำหรับ 6pm',
  'voice.openSettings': 'เปิดการตั้งค่า',
  'voice.tapHint': 'พูดรายการเงินสด',
  'voice.promptTap': 'พูดเหมือนพิมพ์แชตหาเพื่อน',
  'voice.reading': 'กำลังทำความเข้าใจ',
  'voice.gotIt': 'เข้าใจแล้ว',
  'voice.doneTalking': 'พูดเสร็จแล้ว',
  'voice.cancel': 'ยกเลิก',
  'voice.heard': 'ได้ยินว่า “{said}”',
  'voice.micHint': 'พูดรายการใช้จ่าย',
  'voice.stopHint': 'หยุดฟัง',
};
