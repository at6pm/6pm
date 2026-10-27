import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

// Plain and reassuring: this is a privacy choice, so no jokes. Settings is การตั้งค่า, as on the iPhone.
export const thPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': 'ให้ 6pm คิดที่ไหนดี?',
  'privacy.ai.sub': 'ที่ที่คำถามและคำพูดของเพื่อนคู่ใจถูกประมวลผล เปลี่ยนได้ทุกเมื่อในการตั้งค่า',
  'privacy.ai.server.title': 'บนเซิร์ฟเวอร์ของเรา กับ Claude',
  'privacy.ai.server.text':
    'คำตอบคมที่สุด และฟังภาษาเวียดนามได้แม่น มีแค่คำถามหรือข้อมูลไม่กี่อย่างที่ออกจากโทรศัพท์ ไม่เคยส่งรายการใช้จ่ายของคุณ',
  'privacy.ai.server.tag': 'แนะนำ',
  'privacy.ai.device.title': 'บน iPhone เครื่องนี้เท่านั้น',
  'privacy.ai.device.text': 'ไม่มีอะไรด้าน AI ออกจากโทรศัพท์ ดาวน์โหลดโมเดลครั้งเดียวผ่าน Wi‑Fi',
  'privacy.ai.device.unavailable': 'iPhone เครื่องนี้มีหน่วยความจำไม่พอสำหรับโมเดลของตัวเอง',
  'privacy.ai.models': 'โมเดล',
  'privacy.model.fast': 'เร็วและเบาที่สุด',
  'privacy.model.words': 'เขียนดีที่สุด',
  'privacy.model.reading': 'เข้าใจคำถามดีที่สุด',
  'privacy.model.size': '{size} GB',
  'privacy.model.download': 'ดาวน์โหลด',
  'privacy.model.downloading': '{percent}%',
  'privacy.model.verifying': 'กำลังตรวจสอบ',
  'privacy.model.ready': 'พร้อมแล้ว',
  'privacy.model.failed': 'ลองอีกครั้ง',
  'privacy.model.delete': 'ลบ',
  'privacy.model.later': 'ใช้ต่อได้เลยระหว่างที่ดาวน์โหลด',
  'settings.ai': 'AI',
  'settings.ai.server': 'บนเซิร์ฟเวอร์ของเรา',
  'settings.ai.device': 'บน iPhone เครื่องนี้',
  'privacy.leaves.title': 'อะไรบ้างที่ออกจากโทรศัพท์',
  'privacy.leaves.server.ask': 'คำถาม พร้อมชื่อหมวดหมู่และชื่อกระปุก เพื่อให้เข้าใจคำถาม',
  'privacy.leaves.server.lines': 'ข้อมูลไม่กี่อย่างในคำพูดหนึ่งประโยคของเพื่อนคู่ใจ',
  'privacy.leaves.server.receipts': 'รูปใบเสร็จที่โทรศัพท์อ่านเองไม่ได้',
  'privacy.leaves.server.voice': 'เสียงของคุณขณะพูด เพื่อแปลงเป็นข้อความ',
  'privacy.leaves.device.none': 'ไม่มีอะไรด้าน AI ทุกอย่างคำนวณบน iPhone เครื่องนี้',
  'privacy.leaves.device.network':
    'อัตราแลกเปลี่ยน (ส่งแค่วันที่) การอัปเดตแอป และการซื้อ ยังใช้อินเทอร์เน็ต',
  'privacy.leaves.device.emails': 'อีเมลใบเสร็จปิดอยู่ในโหมดนี้',
};
