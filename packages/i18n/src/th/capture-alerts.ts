import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const thCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'จับแจ้งเตือนธนาคาร',
  'native.intents.catchAlert.description':
    'อ่านการแจ้งเตือนจากธนาคารหรืออีวอลเล็ตบน iPhone ของคุณ แล้ววางเงินที่เข้าออกไว้ใน Inbox ของ 6pm ข้ามรหัส OTP รายการที่จ่ายไม่สำเร็จ และโปรโมชัน',
  'native.intents.catchAlert.alertTitle': 'ชื่อเรื่อง',
  'native.intents.catchAlert.subtitle': 'ชื่อเรื่องรอง',
  'native.intents.catchAlert.body': 'เนื้อหา',
  'native.intents.catchAlert.date': 'วันที่',
  'native.intents.catchAlert.app': 'แอป',
  'capture.alerts.name': 'แจ้งเตือนธนาคาร',
  'capture.alerts.sub': 'แจ้งเตือนธนาคารและอีวอลเล็ตจดลงเองอัตโนมัติ',
  'capture.alerts.headline': 'ธนาคารแจ้งมาเมื่อไหร่ 6pm จดให้ทันที',
  'capture.alerts.time': 'ราวหนึ่งนาที ครั้งเดียว',
  'capture.alerts.step1': 'ในคำสั่งลัด สร้างระบบอัตโนมัติสำหรับการแจ้งเตือน',
  'capture.alerts.step1Chip': 'ระบบอัตโนมัติ → การแจ้งเตือน',
  'capture.alerts.step2': 'เลือกแอปธนาคารและอีวอลเล็ตของคุณ',
  'capture.alerts.step3': 'ให้เรียกใช้ “จับแจ้งเตือนธนาคาร”',
  'capture.alerts.step3Chip': 'จับแจ้งเตือนธนาคาร',
  'capture.alerts.tip':
    'ข้ามรหัส OTP รายการที่จ่ายไม่สำเร็จ และโปรโมชัน รายการที่จับได้จาก Apple Pay หรืออีเมลแล้วจะไม่ถูกเพิ่มซ้ำ',
  'capture.alerts.privacy': 'แจ้งเตือนถูกอ่านบน iPhone ของคุณ และไม่เคยออกไปจากเครื่อง',
  'capture.alerts.cameIn': 'เงินเข้า {amount}',
  'capture.alerts.skip.code': 'รหัส OTP ข้ามไปแล้ว',
  'capture.alerts.skip.failed': 'จ่ายไม่สำเร็จ ข้ามไปแล้ว',
  'capture.alerts.skip.promo': 'โปรโมชัน ข้ามไปแล้ว',
  'capture.alerts.skip.balance': 'แจ้งยอดคงเหลือ ข้ามไปแล้ว',
  'capture.alerts.skip.security': 'แจ้งเรื่องความปลอดภัย ข้ามไปแล้ว',
  'capture.alerts.skip.unread': 'ไม่ใช่การจ่ายเงิน ข้ามไปแล้ว',
  'capture.alerts.actionAdd': 'รับคำสั่งลัดของ 6pm',
  'capture.alerts.actionOpen': 'เปิดคำสั่งลัด',
  'capture.walk.alerts.s1Title': 'เปิด ระบบอัตโนมัติ แล้วแตะ +',
  'capture.walk.alerts.s1Body':
    'ในแอปคำสั่งลัด แตะ คลัง แล้ว ระบบอัตโนมัติ แล้ว + ถ้าเห็น “อธิบายคำสั่งลัด” ให้แตะ แก้ไข',
  'capture.walk.alerts.s2Title': 'เพิ่มตัวเรียกจากการแจ้งเตือน',
  'capture.walk.alerts.s2Body':
    'ที่แผงด้านล่าง แตะ ระบบอัตโนมัติ แล้ว การแจ้งเตือน การ์ด “เมื่อฉันได้รับการแจ้งเตือนจาก แอป” จะปรากฏขึ้น',
  'capture.walk.alerts.s3Title': 'เลือกธนาคารและอีวอลเล็ต',
  'capture.walk.alerts.s3Body':
    'แตะ แอป แล้วเลือกธนาคารของคุณ แตะ + เพื่อเพิ่มแอปธนาคารและอีวอลเล็ตอื่นที่คุณใช้จ่ายทีละแอป',
  'capture.walk.alerts.s4Title': 'เพิ่ม “จับแจ้งเตือนธนาคาร”',
  'capture.walk.alerts.s4Body':
    'แตะ ค้นหา พิมพ์ “แจ้งเตือนธนาคาร” แล้วแตะ จับแจ้งเตือนธนาคาร ของ 6pm ตั้ง ชื่อเรื่อง ชื่อเรื่องรอง เนื้อหา และ วันที่ ให้เป็นของการแจ้งเตือนนั้นเอง',
  'capture.walk.alerts.s5Title': 'ปิด แจ้ง ไว้ แล้วย้อนกลับ',
  'capture.walk.alerts.s5Body':
    'แตะ › ที่ตัวเรียก: เปิด ระบบอัตโนมัติ ไว้และปิด แจ้ง เพื่อให้จับแจ้งเตือนได้เงียบๆ ย้อนกลับก็บันทึกแล้ว',
  'capture.walk.alerts.s6Title': 'ลองดู',
  'capture.walk.alerts.s6Body':
    'จ่ายเงินนิดหน่อยจากแอปใดแอปหนึ่งในนั้น พอแจ้งเตือนเด้งมา รายการนั้นจะอยู่ใน Inbox แล้ว',
  'capture.walk.alerts.l1Title': 'เพิ่มคำสั่งลัดของ 6pm',
  'capture.walk.alerts.l1Body':
    'แตะ “รับคำสั่งลัดของ 6pm” ด้านบน แล้วแตะ เพิ่มคำสั่งลัด คำสั่งลัดนี้ชื่อ “Catch a bank alert”',
  'capture.walk.alerts.l2Body':
    'เปิดในแอปคำสั่งลัด แตะ แอป ด้านบนแล้วเลือกธนาคารของคุณ จากนั้นแตะ + ทีละธนาคารและอีวอลเล็ต',
  'capture.walk.alerts.mistake1':
    'ปล่อย ชื่อเรื่อง เนื้อหา หรือ วันที่ ว่างไว้ แตะทีละช่องแล้วเลือกของการแจ้งเตือน ไม่อย่างนั้นจะไม่มีอะไรถูกจดเลย',
  'capture.walk.alerts.mistake2':
    'เปิด แจ้ง ทิ้งไว้ ทุกแจ้งเตือนจะเด้งเตือนคุณซ้ำอีกรอบ แทนที่จะถูกจับเงียบๆ',
  'capture.walk.alerts.mistake3':
    'เลือกไว้แอปเดียว ติ๊กทุกธนาคารและอีวอลเล็ตที่คุณใช้ รวมถึง MoMo และ ZaloPay',
  'capture.walk.ios.notification': 'การแจ้งเตือน',
  'capture.walk.ios.notificationEx': '“เมื่อฉันได้รับการแจ้งเตือนจากข่าว”',
  'capture.walk.ios.whenNotified': 'เมื่อฉันได้รับการแจ้งเตือนจาก',
  'capture.walk.ios.notificationTitle': 'การแจ้งเตือน › ชื่อเรื่อง',
  'capture.walk.ios.notificationBody': 'การแจ้งเตือน › เนื้อหา',
  'capture.walk.ios.notificationDate': 'การแจ้งเตือน › วันที่',
  'capture.walk.ios.notificationSummary': 'เมื่อฉันได้รับการแจ้งเตือนจาก MB Bank หรือ MoMo',
  'capture.walk.ios.alertSearch': 'แจ้งเตือนธนาคาร',
  'capture.walk.ios.now': 'ตอนนี้',
  'capture.walk.test.alertRow': 'แจ้งเตือนธนาคาร · รอตรวจ',
  'capture.siri.name': 'บอก Siri',
  'capture.siri.sub': 'พูดว่า “จดใน 6pm” แล้วบอกว่าจ่ายอะไร',
  'capture.siri.headline': 'จดรายจ่ายด้วยเสียง ไม่ต้องเปิด 6pm',
  'capture.siri.time': 'ไม่ต้องตั้งค่าอะไร',
  'capture.siri.step1': 'พูดว่า “หวัดดี Siri จดใน 6pm”',
  'capture.siri.step1Chip': 'จดใน 6pm',
  'capture.siri.step2': 'Siri จะถามว่าเท่าไหร่ บอกว่าอะไรและเท่าไหร่',
  'capture.siri.step2Chip': '“เฝอ 45k”',
  'capture.siri.step3': 'เข้าไปอยู่ในรายจ่ายวันนี้ทันที',
  'capture.siri.step3Chip': 'วันนี้',
  'capture.siri.tip':
    'Siri ฟังภาษาไทยได้ แต่ยังไม่รองรับภาษาเวียดนาม ถ้าอยากพูดเป็นภาษาเวียดนาม กดเพิ่มด่วนค้างไว้',
  'capture.backTap.name': 'แตะด้านหลัง',
  'capture.backTap.sub': 'แตะด้านหลัง iPhone สองครั้งเพื่อจดรายจ่าย',
  'capture.backTap.headline': 'แตะด้านหลังสองที เพิ่มด่วนก็เปิดขึ้นมา',
  'capture.backTap.time': 'สามสิบวินาที ครั้งเดียว',
  'capture.backTap.step1': 'เปิด การตั้งค่า แล้ว การช่วยการเข้าถึง สัมผัส แตะด้านหลัง',
  'capture.backTap.step1Chip': 'แตะด้านหลัง',
  'capture.backTap.step2': 'เลือก แตะสองครั้ง แล้วเลือก เพิ่มด่วน ของ 6pm',
  'capture.backTap.step2Chip': 'แตะสองครั้ง → เพิ่มด่วน',
  'capture.backTap.step3': 'แตะด้านหลัง iPhone สองครั้ง เพิ่มด่วนจะเปิดขึ้น',
  'capture.backTap.step3Chip': 'เพิ่มด่วน',
  'capture.backTap.tip':
    'ไม่เห็น เพิ่มด่วน? ในแอปคำสั่งลัด แตะ + ใส่ เพิ่มด่วน ของ 6pm แล้วบันทึก ใช้ แตะสามครั้ง ก็ได้นะ',
  'capture.walk.ios.notificationSubtitle': 'การแจ้งเตือน › ชื่อเรื่องรอง',
  'capture.walk.ios.notify': 'แจ้ง',
  'capture.walk.ios.cancel': 'ยกเลิก',
};
