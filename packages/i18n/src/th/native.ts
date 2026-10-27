import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

// Permission prompts read like Thai iOS: "6pm ใช้…เพื่อ…". Apple's own names follow the Thai iPhone (รูปภาพ, กระเป๋าสตางค์).
export const thNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    '6pm ใช้กล้องเพื่ออ่านคิวอาร์โค้ดและใบเสร็จที่คุณสแกน รูปจะอยู่บน iPhone ของคุณ เว้นแต่ใบเสร็จนั้นต้องอ่านละเอียดขึ้น',
  'native.permission.microphone':
    '6pm ฟังขณะที่คุณพูดรายจ่าย เสียงของคุณจะถูกส่งไปยังบริการแปลงเสียงเป็นข้อความ หรืออยู่บน iPhone เครื่องนี้เท่านั้นในโหมดบนอุปกรณ์',
  'native.permission.speech': '6pm แปลงสิ่งที่คุณพูดเป็นยอดเงินและชื่อรายการ',
  'native.permission.photos':
    '6pm บันทึกเฉพาะใบเสร็จปิดวันและไดอารี่เงินของคุณลงในรูปภาพ และจะไม่เปิดดูคลังรูปภาพของคุณ',
  'native.permission.photosAdd':
    '6pm บันทึกใบเสร็จปิดวันและไดอารี่เงินของคุณลงในรูปภาพเมื่อคุณสั่ง',
  'native.permission.location':
    '6pm ตรวจสอบว่าคุณอยู่ประเทศไหน เพื่อให้โหมดเดินทางเปิดเองเมื่ออยู่ต่างประเทศ',
  'native.surfaces.safeToday.name': 'วันนี้ใช้ได้',
  'native.surfaces.safeToday.description': 'ยอดที่คุณใช้ได้วันนี้ ดูได้ในพริบตา',
  'native.surfaces.setUp': 'เปิด 6pm เพื่อตั้งค่า',
  'native.surfaces.markPaid.title': 'จ่ายแล้ว',
  'native.surfaces.todayList.name': 'วันนี้',
  'native.surfaces.todayList.description': 'รายจ่ายวันนี้ ล่าสุดอยู่บนสุด',
  'native.share.title': 'เพิ่มใน 6pm',
  'native.share.readFromBank': 'อ่านบน iPhone เครื่องนี้จากใบเสร็จ {bank} ของคุณ',
  'native.share.readHere': 'อ่านบน iPhone เครื่องนี้จากใบเสร็จของคุณ',
  'native.share.unreadable': 'อ่านใบเสร็จนี้ไม่ได้ พิมพ์ยอดเงินเองนะ',
  'native.share.to': 'ถึง',
  'native.share.when': 'เมื่อ',
  'native.share.code': 'รหัส',
  'native.share.category': 'หมวดหมู่',
  'native.share.unsure': 'ไม่แน่ใจเรื่องชื่อ แตะเพื่อตรวจสอบ',
  'native.share.checkName': 'ตรวจสอบชื่อ',
  'native.share.amountHint': 'ยอดเงิน',
  'native.share.nameHint': 'จ่ายให้ใคร',
  'native.share.chooseCategory': 'เลือก',
  'native.share.edit': 'แก้ไข',
  'native.share.done': 'เสร็จสิ้น',
  'native.share.confirm': 'ยืนยัน',
  'native.share.currency': 'สกุลเงิน',
  'native.share.currencyUnsure': 'ใบเสร็จไม่ได้ระบุสกุลเงิน แตะเพื่อตรวจสอบ',
  'native.share.checkCurrency': 'ตรวจสอบสกุลเงิน',
  'native.share.inDong': 'ประมาณ {amount}',
  'native.share.noRate': 'ยังไม่มีอัตราแลกเปลี่ยน 6pm จะคิดตามอัตราของวันนั้นเมื่อมีแล้ว',
  'native.share.unknownCurrency': 'ไม่รู้ว่าเป็นสกุลเงินอะไร พิมพ์ยอดเป็นดองนะ',
  'native.share.unknownCurrencyIn': 'ไม่รู้ว่าเป็นสกุลเงินอะไร พิมพ์ยอดเป็น {currency} นะ',
  'native.share.looking': 'กำลังอ่านให้ละเอียดขึ้น…',
  'native.share.step': '{n} จาก {total}',
  'native.share.skip': 'ข้าม',
  'native.intents.logSpend.title': 'จดใน 6pm',
  'native.intents.logSpend.amount': 'ยอดเงิน',
  'native.intents.logSpend.merchant': 'ที่ไหน',
  'native.intents.logSpend.description':
    'จดรายจ่ายใน 6pm: การแตะ Apple Pay จากกระเป๋าสตางค์ หรือสิ่งที่คุณบอก Siri',
  'native.intents.logSpend.short': 'จดรายจ่าย',
  'native.intents.logSpend.askAmount': 'เท่าไหร่?',
  'native.intents.logSpend.logged': 'จดแล้ว',
  'native.intents.logSpend.failed': '6pm จดรายการนั้นไม่ได้ เปิด 6pm แล้วลองเพิ่มด่วนนะ',
  'native.intents.scan.title': 'สแกนคิวอาร์',
  'native.intents.scan.description': 'เปิดสแกนจ่ายใน 6pm',
  'native.intents.quickAdd.title': 'เพิ่มด่วน',
  'native.intents.quickAdd.description': 'เปิดเพิ่มด่วนใน 6pm',
  // Spoken commands, as a Thai speaker would say them to Siri.
  'native.appShortcuts.logIn': 'จดใน ${applicationName}',
  'native.appShortcuts.logSpend': 'จดรายจ่ายใน ${applicationName}',
  'native.appShortcuts.scan': 'สแกนคิวอาร์ใน ${applicationName}',
  'native.appShortcuts.scanToPay': 'สแกนจ่ายใน ${applicationName}',
  'native.appShortcuts.quickAdd': 'เพิ่มด่วนใน ${applicationName}',
};
