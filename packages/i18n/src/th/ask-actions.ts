import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// The how-to answers use the glossary's words (ยอดรายวัน, โหล, ตัวคุณในอนาคต, เพิ่มด่วน, แผน).
// Quick add's examples stay Vietnamese, as the English keeps them: they are what the parser reads.
export const thAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': 'เพิ่ม',
  'ask.action.notNow': 'ไว้ก่อน',
  'ask.action.confirmSpend': 'เพิ่ม {name} {amount} ในหมวด {category} ไหม?',
  'ask.action.added': 'เพิ่มแล้ว {name} {amount} นับในวันนี้',
  'ask.action.cancelled': 'โอเค ไม่มีอะไรเปลี่ยน',
  'ask.action.failed': 'บันทึกไม่สำเร็จ ลองใช้เพิ่มด่วนแทนนะ',
  'ask.action.confirmPot': 'โหลสำหรับ {name}: {goal} ตั้งเลยไหม?',
  'ask.action.confirmPotBy': 'โหลสำหรับ {name}: {goal} ภายในเดือน{month} ตั้งเลยไหม?',
  'ask.action.setUp': 'ตั้งเลย',
  'ask.action.potLocked': 'แบบฟรีมีโหลของตัวเองได้สามใบ และคุณใช้ครบแล้ว Max ให้มีได้มากกว่านั้น',
  'ask.action.seeMax': 'ดู Max',
  'ask.action.potGoal': '{name} ต้องใช้เท่าไหร่? บอกมาได้เลย เช่น “10tr”',
  'ask.action.showMe': 'ดูวิธีทำ',
  'ask.action.openQuickAdd': 'เปิดเพิ่มด่วน',
  'ask.howTo.ways':
    'มีหกช่องทาง: เพิ่มด่วน (พิมพ์หรือพูด) แชร์ใบเสร็จธนาคารมาที่ 6pm ส่งต่ออีเมลใบเสร็จ สแกน VietQR เพื่อจ่าย การแตะจ่ายด้วย Apple Pay ที่เข้ามาเอง และวิดเจ็ตกับตัวควบคุม สิ่งที่ 6pm จับได้จะรออยู่ใน Inbox จนถึงเวลาปิดวัน',
  'ask.howTo.quickAdd':
    'เพิ่มด่วนรับรายการที่พิมพ์หรือพูดออกมา เช่น “trà sữa 45k” หรือบอกเราตรงนี้เลยก็ได้: “vừa ăn phở 50k”',
  'ask.howTo.dailyNumber':
    'ยอดรายวันคือเงินที่ใช้ได้อิสระในรอบเงินเดือนนี้ หลังหักบิลประจำ ตัวคุณในอนาคต และโหล แล้วหารด้วยจำนวนวันที่เหลือถึงวันเงินเดือนออก ใช้น้อยกว่ายอด พรุ่งนี้จะเพิ่มขึ้น ใช้เกิน พรุ่งนี้จะลดลงนิดหน่อย',
  'ask.howTo.negative':
    'ยอดติดลบเมื่อรอบนี้ใช้ไปมากกว่าเงินใช้ได้อิสระ ไม่มีอะไรพัง แผนจะเกลี่ยส่วนนั้นไปตามวันที่เหลือ ลองใช้น้อยลงสักสองสามวัน หรือดึงเงินจากโหล',
  'ask.howTo.pot':
    'โหลคือเงินที่กันไว้สำหรับเรื่องเดียว เช่น ทริปเที่ยวหรือมือถือเครื่องใหม่ 6pm จะหยอดให้ทีละนิดทุกวันเงินเดือนออกและแยกไว้นอกยอดรายวัน พอถึงเวลาต้องใช้ก็มีพร้อม',
  'ask.howTo.close':
    'ตอนหกโมงเย็นคุณจะปิดวัน: เก็บไว้หรือข้ามสิ่งที่จับได้ แล้วดูว่าวันนี้จบที่เท่าไหร่ ถ้าพลาดไปก็ไม่มีอะไรหาย รายการที่จับได้จะรออยู่และยังนับรวม จนกว่าคุณจะตัดสินใจ',
  'ask.howTo.budget':
    '6pm ไม่มีงบแยกตามหมวด ยอดรายวันของคุณคืองบ บิลประจำ ตัวคุณในอนาคต และโหล ถูกกันไว้แล้ว ถ้าอยากใช้กับอะไรน้อยลง ให้เริ่มโหลใหม่ หรือออมให้ตัวคุณในอนาคตเพิ่ม',
};
