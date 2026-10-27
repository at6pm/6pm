import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// `{range}` and `{against}` are time phrases that stand on their own after an amount, so each
// `ask.range.*` reads as a complete phrase (วันนี้, สัปดาห์ที่แล้ว, ตั้งแต่วันเงินเดือนออก).
export const thAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': 'วันนี้',
  'ask.range.yesterday': 'เมื่อวาน',
  'ask.range.thisWeek': 'สัปดาห์นี้',
  'ask.range.lastWeek': 'สัปดาห์ที่แล้ว',
  'ask.range.thisCycle': 'ตั้งแต่วันเงินเดือนออก',
  'ask.range.lastCycle': 'รอบเงินเดือนที่แล้ว',
  'ask.range.thisMonth': 'เดือนนี้',
  'ask.range.lastMonth': 'เดือนที่แล้ว',
  'ask.range.last7Days': 'ในสัปดาห์ที่ผ่านมา',
  'ask.range.last30Days': 'ในเดือนที่ผ่านมา',
  'ask.range.dates': 'ตั้งแต่ {from} ถึง {to}',

  'ask.answer.spent': { other: 'คุณใช้ไป {total} {range} รวม {count} รายการ' },
  'ask.answer.spentOn': { other: 'คุณใช้ไป {total} กับ {category} {range} รวม {count} ครั้ง' },
  'ask.answer.spentAt': { other: 'คุณใช้ไป {total} ที่ {merchant} {range} รวม {count} ครั้ง' },
  'ask.answer.spentNone': 'ไม่มีรายการใช้จ่าย {range}',
  'ask.answer.spentNoneOn': 'ไม่มีรายการในหมวด {category} {range}',
  'ask.answer.spentNoneAt': 'ไม่มีรายการที่ {merchant} {range}',
  'ask.answer.breakdown': 'จาก {total} {range} ส่วนใหญ่ไปที่ {top}',
  'ask.answer.compared.up': '{now} {range} เพิ่มขึ้นจาก {before} {against}',
  'ask.answer.compared.down': '{now} {range} ลดลงจาก {before} {against}',
  'ask.answer.compared.same': 'พอๆ กัน: {now} {range} และ {before} {against}',
  'ask.answer.listed': { other: '{count} รายการ {range} รวม {total}' },
  'ask.answer.listedMore': 'และอีก {more} รายการ',
  'ask.answer.listedNone': 'ไม่มีรายการแบบนั้น {range}',
  'ask.answer.bills': { other: 'เหลือบิล {count} รายการก่อนวันเงินเดือนออก รวม {total}' },
  'ask.answer.billsNone': 'ไม่เหลือบิลก่อนวันเงินเดือนออกแล้ว',
  'ask.answer.how': 'นี่คือสิ่งที่น่าสังเกตตอนนี้',
  'ask.answer.howNothing': 'เงียบสงบดี ยังไม่มีอะไรโดดเด่น',
  'ask.answer.noSuchCategory': 'หาหมวด {category} ไม่เจอ ลองถามถึงหมวดที่คุณมีนะ',
  'ask.answer.noRange': 'ช่วงนั้นยังไม่มีอะไรให้ดู',
  'ask.answer.chat': 'ยินดีเสมอ อยากถามเรื่องเงินเมื่อไหร่ก็ถามได้เลย',
  'ask.answer.partial': 'นับเฉพาะที่ 6pm เก็บไว้ตั้งแต่ {since}',
  'ask.row.total': 'รวม',
  'ask.row.before': 'ก่อนหน้า',
  'ask.answer.goalPace.months': {
    other:
      'ถ้าออมให้ตัวคุณในอนาคตเดือนละ {monthly} เงิน {amount} สำหรับ{what}จะใช้เวลาประมาณ {count} เดือน ราวเดือน{month}',
  },
  'ask.answer.goalPace.years': {
    other:
      'ถ้าออมให้ตัวคุณในอนาคตเดือนละ {monthly} เงิน {amount} สำหรับ{what}จะใช้เวลาประมาณ {count} ปี ราวเดือน{month}',
  },
  'ask.answer.goalPace.note': 'มีกระปุกแยกไว้ให้มันโดยเฉพาะ เงินก้อนนี้จะได้ไม่ปนกับส่วนอื่น',
  'ask.answer.goalNoPace':
    'ตอนนี้ยังไม่มีเงินออมให้ตัวคุณในอนาคตทุกเดือน เลยยังคำนวณไม่ได้ว่า {amount} สำหรับ{what}ต้องใช้เวลาเท่าไหร่ ออมสักนิดทุกเดือนก็เริ่มได้แล้ว',
  'ask.answer.goalAmount':
    '{what} ราคาประมาณเท่าไหร่? บอกราคามา เช่น “{example}” แล้วเราจะคำนวณให้',
  'ask.row.reachedBy': 'ราวๆ',
};
