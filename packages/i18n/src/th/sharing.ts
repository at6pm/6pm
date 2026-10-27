import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const thSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': 'บันทึกรูป',
  'sharing.share': 'แชร์',
  'sharing.saved': 'บันทึกลงในรูปภาพแล้ว',
  'sharing.photosOff': '6pm ยังไม่ได้รับสิทธิ์เข้าถึงรูปภาพ',
  'sharing.openSettings': 'เปิดการตั้งค่า',
  'sharing.failed': 'สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้งนะ',
};
