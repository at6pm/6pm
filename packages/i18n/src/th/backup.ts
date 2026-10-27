import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// iCloud Keychain is พวงกุญแจ iCloud and iOS Settings is การตั้งค่า, as the iPhone shows them.
export const thBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'สำรองข้อมูล',
  'backup.row.off': 'ปิด',
  'backup.row.on': 'iCloud · สำรองไว้ {when}',
  'backup.row.found': 'พบข้อมูลสำรอง',
  'backup.row.deleting': 'กำลังลบ…',
  'backup.ago.now': 'เมื่อสักครู่',
  'backup.ago.minutes': { other: '{count} นาทีที่แล้ว' },
  'backup.ago.hours': { other: '{count} ชั่วโมงที่แล้ว' },
  'backup.ago.days': { other: '{count} วันที่แล้ว' },

  'backup.status.on': 'สำรองข้อมูลแล้ว {when}',
  'backup.status.sub': {
    other: 'iCloud · {count} รายการ · เข้ารหัสแล้ว ไม่มีก็ยังใช้ 6pm ได้ตามปกติ',
  },
  'backup.status.never': 'พร้อมเมื่อคุณพร้อม',
  'backup.status.neverSub': 'iCloud · เข้ารหัสแล้ว ไม่มีก็ยังใช้ 6pm ได้ตามปกติ',
  'backup.off.title': 'เก็บทุกวันไว้ตลอดไป',
  'backup.off.sub':
    'ปิดผนึกบน iPhone ก่อนส่งออกไป กุญแจอยู่ในพวงกุญแจ iCloud ของคุณ เราจึงอ่านอะไรไม่ได้เลย',
  'backup.tooLarge': 'ข้อมูลสำรองครั้งล่าสุดใหญ่เกินกว่าจะส่ง ทุกอย่างยังอยู่บน iPhone เครื่องนี้',
  'backup.note':
    'สำรองวันละครั้งหลังคุณปิดวัน ถ้าจะกู้คืนบน iPhone เครื่องใหม่ ให้เปิดพวงกุญแจ iCloud ในการตั้งค่าของ iOS',
  'backup.paused': 'การสำรองข้อมูลหยุดไว้เมื่อไม่มี Max ข้อมูลสำรองล่าสุดยังปลอดภัยใน iCloud',
  'backup.empty': 'ยังไม่มีอะไรให้สำรอง ปิดวันแรกก่อนแล้วค่อยกลับมานะ',

  'backup.turnOn': 'เปิดการสำรองข้อมูล',
  'backup.now': 'สำรองตอนนี้',
  'backup.working': 'กำลังสำรองข้อมูล…',
  'backup.delete': 'ลบข้อมูลสำรอง',
  'backup.deleteConfirm': 'แตะอีกครั้งเพื่อลบข้อมูลสำรอง',
  'backup.deleting': 'กำลังลบ…',
  'backup.deletePending': 'ข้อมูลสำรองจะถูกลบทันทีที่ 6pm ออนไลน์ ระหว่างนี้จะไม่มีอะไรถูกส่งเพิ่ม',

  'backup.found.title': 'มีข้อมูลสำรองอยู่ใน iCloud ของคุณแล้ว',
  'backup.found.sub':
    'มาจาก iPhone เครื่องอื่นหรือการติดตั้งครั้งก่อน ถ้าสำรองจากเครื่องนี้จะเขียนทับของเดิม',
  'backup.found.restore': 'กู้คืนมาที่นี่',
  'backup.found.restoreConfirm': 'แตะอีกครั้งเพื่อแทนที่วันต่างๆ บน iPhone เครื่องนี้',
  'backup.found.replace': 'แทนที่ด้วย iPhone เครื่องนี้',

  'backup.restore.link': 'กู้คืนจากข้อมูลสำรอง',
  'backup.restore.title': 'กู้คืนจากข้อมูลสำรอง',
  'backup.restore.found': 'พบข้อมูลสำรองของคุณจากวันที่ {date}',
  'backup.restore.sub': { other: '{count} รายการ · เข้ารหัสไว้ใน iCloud' },
  'backup.restore.do': 'กู้คืนวันของฉัน',
  'backup.restore.working': 'กำลังกู้คืน…',
  'backup.restore.fresh': 'เริ่มใหม่แทน',
  'backup.restore.freshNote':
    'ถ้าเริ่มใหม่ ข้อมูลสำรองจะยังอยู่จนกว่าข้อมูลสำรองใหม่ครั้งแรกจะเขียนทับ',
  'backup.restore.looking': 'กำลังหาข้อมูลสำรองของคุณ…',
  'backup.restore.none': 'ไม่พบข้อมูลสำรองสำหรับพวงกุญแจ iCloud นี้',
  'backup.restore.unsupported':
    'ข้อมูลสำรองนี้สร้างจาก 6pm เวอร์ชันใหม่กว่า อัปเดตแอปก่อนแล้วค่อยกู้คืน',
  'backup.restore.wrongKey': 'กุญแจบน iPhone เครื่องนี้เปิดข้อมูลสำรองนี้ไม่ได้',
  'backup.restore.damaged': 'ข้อมูลสำรองนี้เสียหาย กู้คืนไม่ได้',

  'backup.error.network': 'ติดต่อ 6pm ไม่ได้ ลองใหม่อีกสักครู่นะ',
  'backup.error.keychain':
    'พวงกุญแจ iCloud ไม่ยอมเก็บกุญแจ เลยยังไม่ได้สำรองอะไร ตรวจดูว่าเปิดไว้ในการตั้งค่าของ iOS แล้ว',
  'backup.error.tooLarge': 'ข้อมูลสำรองนี้ใหญ่เกินกว่าจะส่ง ทุกอย่างยังอยู่บน iPhone เครื่องนี้',
  'backup.retry': 'ลองอีกครั้ง',
  'backup.error.generic': 'ไม่สำเร็จ ลองอีกครั้งนะ',

  'backup.toast.deleted': 'ลบข้อมูลสำรองแล้ว',
  'companion.backupDone.soft': 'สำรองแล้ว วันของคุณปลอดภัยดี',
  'companion.backupDone.cheeky': 'สำรองแล้ว แม้แต่วันอังคารที่แย่ที่สุดก็ปลอดภัยแล้ว',
  'companion.backupDone.roast': 'สำรองแล้ว ความพลาดทั้งหลายขึ้นไปอยู่บนคลาวด์ตลอดกาล',
  'companion.backupDone.plain': 'สำรองข้อมูลเสร็จแล้ว',
  'companion.backupRestored.soft': 'ยินดีต้อนรับกลับ ทุกอย่างอยู่ครบ',
  'companion.backupRestored.cheeky': 'กลับมาจากคลาวด์แล้ว ไม่มีอะไรหาย',
  'companion.backupRestored.roast': 'กู้คืนแล้ว คราวนี้อย่าทำโทรศัพท์หายอีกนะ',
  'companion.backupRestored.plain': 'กู้คืนข้อมูลสำรองแล้ว',
};
