import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const thYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': 'เข้าเล่มวันที่ 31 ธันวาคม รวมไดอารี่สิบสองเล่มไว้ในเล่มเดียว',
  'yearBook.bound': 'เข้าเล่มแล้วเมื่อ 31 ธันวาคม แตะเพื่อแชร์เป็น PDF',
  'yearBook.binding': 'กำลังเข้าเล่มสมุดประจำปีของคุณ…',
  'yearBook.failed': 'เข้าเล่มสมุดประจำปีไม่สำเร็จ ลองใหม่อีกสักครู่นะ',
  'yearBook.shareTitle': 'สมุดประจำปี {year}',
  'yearBook.cover.kicker': '6PM · ไดอารี่เงิน',
  'yearBook.cover.sub': { other: 'ไดอารี่เงิน {count} เล่ม เข้าเล่มเมื่อ 31 ธันวาคม' },
  'yearBook.cover.closed': { other: 'ปิดวันตอน 6PM ไป {count} วัน' },
  'yearBook.summary.kicker': 'สมุดประจำปี · {year}',
  'yearBook.summary.headline.spare': 'คุณจบปี {year} โดยยังเหลือ {amount}',
  'yearBook.summary.headline.over': 'ปีนี้เกินแผนไปนิดหน่อย ปี {next} เริ่มใหม่ได้เลย',
  'yearBook.summary.futureYouSub': 'เก็บไว้ในปีนี้',
  'yearBook.summary.contents': 'ไดอารี่ทั้งหมด',
};
