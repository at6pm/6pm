import type { LiveLines } from './live-lines';

export const liveLinesTh: LiveLines = {
  clock: (time, left) => `ที่คุณตอนนี้ ${time} · อีก ${left} ถึงเวลาปิดวัน`,
  closeNow: 'หกโมงแล้ว ปิดวันนี้กัน',
  duration: (h, m) => (h ? `${h} ชม. ${m} นาที` : `${m} นาที`),
  countdown: (d, h, m) => `อีก ${d} วัน ${h} ชม. ${m} นาทีจะเปิดตัว`,
  out: 'มาแล้ว',
  sent: 'ลงชื่อเรียบร้อย เจอกันตอนหกโมงเย็น',
  notAnEmail: 'ดูยังไม่เหมือนอีเมลเลยนะ',
  busy: 'ลองจากที่นี่บ่อยเกินไป รอสักนาทีแล้วลองใหม่',
  unreachable: 'เชื่อมต่อรายชื่อไม่ได้ ตรวจดูอินเทอร์เน็ตแล้วลองใหม่',
};
