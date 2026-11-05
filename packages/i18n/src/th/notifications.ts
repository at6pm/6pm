import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const thNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'วันเงินเดือนออก',
  'notify.channel.capture': 'จับรายจ่าย',
  'notify.channel.reminders': 'การเตือนที่คุณตั้งไว้',

  'notify.close.leadSix': 'หกโมงแล้ว',
  'notify.close.leadAt': '{time} แล้ว',

  'notify.close.jarReady.soft': '{lead} กระปุก{jar}ของคุณพร้อมแล้ว',
  'notify.close.jarReady.cheeky': '{lead} กระปุก{jar}ของคุณพร้อมแล้ว ไปดูกันหน่อย',
  'notify.close.jarReady.roast': '{lead} กระปุก{jar}ของคุณพร้อมแล้ว ใครจะไปคิดว่าคุณทำได้',
  'notify.close.jarReady.plain': '{lead} กระปุก{jar}พร้อมแล้ว',

  'notify.close.countdown.soft': { other: '{lead} อีก {count} วันถึง{festival}' },
  'notify.close.countdown.cheeky': {
    other: '{lead} อีก {count} วันถึง{festival} โคมเริ่มประดับแล้ว',
  },
  'notify.close.countdown.roast': {
    other: '{lead} อีก {count} วันถึง{festival} กอดกระเป๋าเงินไว้แน่น ๆ',
  },
  'notify.close.countdown.plain': { other: '{lead} เหลืออีก {count} วันถึง{festival}' },
  'notify.close.countdownJar.soft': {
    other: '{lead} อีก {count} วันถึง{festival} กระปุก{festival}ของคุณมี {amount}',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead} อีก {count} วันถึง{festival} กระปุกเก็บไว้ให้แล้ว {amount}',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead} อีก {count} วันถึง{festival} ในกระปุกมี {amount} เฝ้าไว้ดี ๆ',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead} เหลืออีก {count} วันถึง{festival} กระปุก{festival}มี {amount}',
  },

  'notify.close.pay.soft': '{lead} เงินเดือนรอให้คุณจัดที่อยู่',
  'notify.close.pay.cheeky': '{lead} เงินเดือนเข้าแล้ว มาหางานให้มันทำกัน',
  'notify.close.pay.roast': '{lead} เงินเดือนเข้าแล้ว จัดที่ให้ก่อนมันหลงทาง',
  'notify.close.pay.plain': '{lead} เงินเดือนรอการจัดสรร',

  'notify.close.bonus.soft': '{lead} โบนัส{festival}รอให้คุณจัดที่อยู่',
  'notify.close.bonus.cheeky': '{lead} โบนัส{festival}มาแล้ว มาแบ่งกัน',
  'notify.close.bonus.roast': '{lead} โบนัส{festival}เข้าแล้ว จัดที่ให้ก่อนร้านค้าจะเจอ',
  'notify.close.bonus.plain': '{lead} โบนัส{festival}รอการจัดสรร',

  'notify.close.payback.soft': '{lead} {name} คืนเงินคุณแล้ว',
  'notify.close.payback.cheeky': '{lead} {name} คืนเงินคุณแล้ว มิตรภาพยังอยู่ครบ',
  'notify.close.payback.roast': '{lead} {name} คืนเงินจริง ๆ ด้วย',
  'notify.close.payback.plain': '{lead} {name} คืนเงินแล้ว',

  'notify.close.moneyIn.soft': '{lead} มีเงินเข้า รอคุณอยู่ตอนปิดวัน',
  'notify.close.moneyIn.cheeky': '{lead} มีเงินเข้า มาบอกมันหน่อยว่าจะไปไหน',
  'notify.close.moneyIn.roast': '{lead} มีเงินเข้า อย่าปล่อยให้มันคิดการใหญ่',
  'notify.close.moneyIn.plain': '{lead} มีเงินเข้า จัดสรรตอนปิดวัน',

  'notify.close.yearCard.soft': '{lead} ปี {year} ของคุณพร้อมให้มองย้อนแล้ว',
  'notify.close.yearCard.cheeky': '{lead} ปี {year} ของคุณเสร็จแล้ว อยากดูไหม?',
  'notify.close.yearCard.roast': '{lead} ปี {year} ทั้งปีของคุณ กล้าดูไหม?',
  'notify.close.yearCard.plain': '{lead} สรุปปี {year} พร้อมแล้ว',

  'notify.payday.amounts.soft': 'เงินเดือนออก {jars} เข้ากระปุก {daily} ต่อวันถึง {date}',
  'notify.payday.amounts.cheeky': 'เงินเดือนออกแล้ว! {jars} เข้ากระปุก {daily} ต่อวันถึง {date}',
  'notify.payday.amounts.roast':
    'เงินเดือนออก เก็บ {jars} ก่อนจะทันกะพริบตา {daily} ต่อวันถึง {date}',
  'notify.payday.amounts.plain': 'วันเงินเดือนออก {jars} เข้ากระปุก {daily} ต่อวันถึง {date}',
  'notify.payday.noJars': 'เงินเดือนออก {daily} ต่อวันถึง {date}',
  'notify.payday.hidden': 'เงินเดือนออก เติมกระปุกของคุณแล้ว',
  'notify.payday.hiddenNoJars': 'เงินเดือนออก เริ่มเดือนใหม่แล้ว',

  'notify.firstCatch.amounts.soft': 'จับรายการแรกได้แล้ว: {amount} · {name} แค่นี้เอง',
  'notify.firstCatch.amounts.cheeky': 'จับรายการแรกได้แล้ว: {amount} · {name} ง่ายใช่ไหม?',
  'notify.firstCatch.amounts.roast': 'จับรายการแรกได้แล้ว: {amount} · {name} ไม่เจ็บเลยใช่ไหม',
  'notify.firstCatch.amounts.plain': 'รายการแรก: {amount} · {name}',
  'notify.firstCatch.hidden': 'จับรายการแรกจาก {name} ได้แล้ว แค่นี้เอง',
  'notify.firstCatch.noName': 'จับรายการแรกได้แล้ว แค่นี้เอง',

  'notify.quiet.soft': '{count} วันแล้วที่ไม่มีอะไรจาก {way} ระบบอัตโนมัติยังเปิดอยู่ไหม?',
  'notify.quiet.cheeky':
    '{count} วันแล้วที่ไม่มีอะไรจาก {way} ประหยัดสุด ๆ หรือระบบอัตโนมัติปิดอยู่?',
  'notify.quiet.roast':
    '{count} วันแล้วที่ไม่มีอะไรจาก {way} ถ้าคุณไม่ใช่นักบุญ ก็ระบบอัตโนมัติปิดแล้ว',
  'notify.quiet.plain': '{count} วันแล้วที่ไม่มีอะไรจาก {way} ตรวจสอบว่าระบบอัตโนมัติยังเปิดอยู่',
  'notify.quiet.yourAlerts': 'แจ้งเตือนธนาคารของคุณ',

  'notify.owed.one.soft': '{name} ยังติดเงินคุณ {amount} สะดวกเมื่อไหร่ค่อยทวง',
  'notify.owed.one.cheeky': '{name} ยังติดเงินคุณ {amount} ถึงเวลาสะกิดเบา ๆ ไหม?',
  'notify.owed.one.roast': '{name} ยังติดเงินคุณ {amount} เงินของคุณคิดถึงคุณนะ',
  'notify.owed.one.plain': '{name} ยังติดเงินคุณ {amount}',
  'notify.owed.oneHidden': '{name} ยังติดเงินคุณอยู่ สะดวกเมื่อไหร่ค่อยทวง',
  'notify.owed.noName': 'ยังมีคนติดเงินคุณ {amount}',
  'notify.owed.noNameHidden': 'ยังมีคนติดเงินคุณอยู่ สะดวกเมื่อไหร่ค่อยทวง',
  'notify.owed.many': '{count} คนยังติดเงินคุณ {amount}',
  'notify.owed.manyHidden': '{count} คนยังติดเงินคุณอยู่',

  'settings.notifications': 'การแจ้งเตือน',
  'settings.notificationsOn': 'เปิด',
  'notify.settings.title': 'การแจ้งเตือน',
  'notify.settings.phone': 'บนโทรศัพท์เครื่องนี้',
  'notify.settings.allowed': 'อนุญาตแล้ว',
  'notify.settings.turnOn': 'เปิดใช้',
  'notify.settings.offInSettings': 'ปิดอยู่ในการตั้งค่า',
  'notify.settings.offSub': 'จะไม่มีอะไรส่งถึงคุณจนกว่าจะเปิด',
  'notify.settings.kinds': 'สิ่งที่ 6pm ส่ง',
  'notify.kind.close': 'เตือนปิดวัน',
  'notify.kind.close.sub': 'ทุกวันเวลา {time} พร้อมข่าวของวันนั้น',
  'notify.kind.payday': 'วันเงินเดือนออก',
  'notify.kind.payday.sub': 'เช้าวันที่เงินเดือนเข้า เวลา 08:30',
  'notify.kind.capture': 'จับรายจ่าย',
  'notify.kind.capture.sub': 'รายการแรกที่จับได้ และช่องทางที่เงียบไป',
  'notify.kind.reminders': 'การเตือนที่คุณตั้งไว้',
  'notify.kind.reminders.sub': 'ใครติดเงินคุณ ในวันที่คุณเลือก',
  'notify.settings.lockScreen': 'หน้าจอล็อก',
  'notify.settings.amounts': 'แสดงจำนวนเงินบนหน้าจอล็อก',
  'notify.settings.amounts.sub': 'ถ้าปิด ข้อความจะไม่มีตัวเลข',
  'notify.settings.note':
    'วันละครั้งคือพิธีประจำวัน: การเตือนปิดวันจะบอกข่าวของวันนั้น ส่งเพิ่มได้อีกไม่เกินวันละครั้ง และช่วง 22:00 ถึง 08:00 มีแค่การเตือนปิดวันของคุณ',

  'owed.remind.button': 'เตือนฉัน',
  'owed.remind.threeDays': 'อีก 3 วัน',
  'owed.remind.week': 'อีกหนึ่งสัปดาห์',
  'owed.remind.payday': 'วันเงินเดือนออก',
  'owed.remind.set': 'จะเตือน {date}',
  'owed.remind.cancel': 'ไม่ต้องเตือน',
  'owed.remind.toast': 'จะเตือนคุณ {date} เวลา 10:00',
  'owed.remind.off': 'การเตือนที่คุณตั้งไว้ปิดอยู่ในการตั้งค่า',
};
