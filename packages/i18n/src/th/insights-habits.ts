import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same companion voice as the other insight lines: gender-neutral, คุณ for the user, the joke lands
// on the purchase or the pattern. A cycle is a รอบ; the day's line is ยอด.
export const thInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': 'วันที่ไม่ต้องจ่ายอะไรเลย {kept} ยังอยู่ครบ',
  'insight.noSpendDay.soft.2': 'วันไม่ใช้เงิน เก็บไว้ได้ {kept} เงียบๆ แต่น่ารัก',
  'insight.noSpendDay.cheeky.1': 'ใช้ไปศูนย์ {kept} ไม่ถูกแตะ กระเป๋าตังค์ได้หยุดพักวันนึง',
  'insight.noSpendDay.cheeky.2': 'ทั้งวันไม่ใช้สักแดง {kept} ฝากขอบคุณ',
  'insight.noSpendDay.roast.1': 'ไม่ใช้อะไรเลย {kept} ไม่ถูกแตะ นี่ใครเนี่ย อยู่ต่อได้ไหม',
  'insight.noSpendDay.roast.2': 'ไม่มีสักรายการ เก็บไว้ได้ {kept} ร้านค้าเขาอยู่รอดได้ ไม่ต้องห่วง',
  'insight.noSpendDay.plain': 'วันที่ปิดล่าสุดไม่มีรายการใช้จ่าย เก็บยอดไว้ได้ {kept}',

  'insight.noSpendStreak.soft.1': 'วันสงบติดกัน {days} วัน {kept} ไม่ถูกแตะเลย',
  'insight.noSpendStreak.soft.2': '{days} วันไม่ได้ใช้เงิน {kept} ยังอยู่กับคุณ',
  'insight.noSpendStreak.cheeky.1': '{days} วัน ไม่ใช้สักรายการ กระเป๋าตังค์เริ่มสงสัยแล้ว',
  'insight.noSpendStreak.cheeky.2': 'ไม่ใช้เงินติดกัน {days} วัน {kept} ได้นอนพักสบายเลย',
  'insight.noSpendStreak.roast.1': '{days} วัน ไม่ใช้สักรายการ ร้านกาแฟประจำเริ่มเป็นห่วงแล้ว',
  'insight.noSpendStreak.roast.2': '{days} วันไม่ใช้เงิน {kept} ไม่ถูกแตะ อย่าทำให้แปลกไปกว่านี้นะ',
  'insight.noSpendStreak.plain': 'ปิดวันติดกัน {days} วันโดยไม่มีรายการใช้จ่าย เก็บไว้ได้ {kept}',

  'insight.backUnder.soft.1': 'กลับมาไม่เกินยอดหลังจากเกินไปวันนึง เหลือ {spare} ทำได้ดีมาก',
  'insight.backUnder.soft.2': 'เกินไปวันนึง แล้ววันต่อมาเหลือ {spare} นี่แหละจังหวะชีวิต',
  'insight.backUnder.cheeky.1': 'ภาคไถ่โทษ: กลับมาไม่เกินยอด เหลือ {spare}',
  'insight.backUnder.cheeky.2': 'เกินวันนึง วันต่อมาเหลือ {spare} สมดุลพอดี',
  'insight.backUnder.roast.1': 'เหลือ {spare} ทันทีหลังวันที่เกิน รับคำขอโทษแล้ว',
  'insight.backUnder.roast.2': 'กลับมาไม่เกินยอด เหลือ {spare} การคัมแบ็กที่รอคอย',
  'insight.backUnder.plain': 'กลับมาไม่เกินยอดหลังจากเกินไปหนึ่งวัน เหลือ {spare}',

  'insight.logGap.soft.1': 'ไม่มีรายการตั้งแต่ {since} ช่วงนี้เงียบๆ หรือยุ่งอยู่นะ',
  'insight.logGap.soft.2': 'ไม่มีรายการใช้จ่ายมา {days} วันแล้ว มีอะไรจะเพิ่มไหม',
  'insight.logGap.cheeky.1': 'ไม่มีรายการตั้งแต่ {since} โหมดถือศีล หรือแค่ยุ่ง',
  'insight.logGap.cheeky.2': '{days} วันไม่มีรายการเลย กระเป๋าตังค์ไปเที่ยวหรือเปล่า',
  'insight.logGap.roast.1': 'ไม่มีอะไรเลยตั้งแต่ {since} ไม่ได้ใช้จริงๆ หรือแค่ไม่ได้จด',
  'insight.logGap.roast.2': 'เงียบไป {days} วัน กาแฟแก้วเดียวก็นับนะ เพิ่มมาแล้วเราหายกัน',
  'insight.logGap.plain': 'ไม่มีรายการใช้จ่ายตั้งแต่ {since}',

  'insight.weekendHeavy.soft.1':
    'ช่วงนี้วันเสาร์อาทิตย์ใช้ราว {weekend} วันธรรมดา {weekday} ลองคิดไว้ก่อนถึงวันเสาร์นะ',
  'insight.weekendHeavy.soft.2': 'วันหยุดใช้วันละ {weekend} วันธรรมดา {weekday} ค่อยๆ ไปนะ',
  'insight.weekendHeavy.cheeky.1':
    'วันธรรมดา: วันละ {weekday} วันหยุด: {weekend} วันเสาร์มีแผนให้คุณแล้วล่ะ',
  'insight.weekendHeavy.cheeky.2':
    'วันหยุดเฉลี่ยวันละ {weekend} วันธรรมดา {weekday} สุดสัปดาห์ใกล้มาแล้ว พร้อมไหม',
  'insight.weekendHeavy.roast.1':
    'วันธรรมดา {weekday} วันหยุด {weekend} วันหยุดชนะตลอด ขอเสมอสักทีได้ไหม',
  'insight.weekendHeavy.roast.2':
    'วันหยุด: วันละ {weekend} วันธรรมดา: {weekday} สุดสัปดาห์นี้ขอแก้มือหน่อย',
  'insight.weekendHeavy.plain':
    'สี่สัปดาห์ที่ผ่านมา: วันหยุดใช้วันละ {weekend} วันธรรมดาวันละ {weekday}',

  'insight.recordDay.soft.1':
    'วันนี้ {amount} มากที่สุดในรอบ {days} วัน ไม่เป็นไรนะ พรุ่งนี้เริ่มใหม่',
  'insight.recordDay.soft.2': 'วันนี้ {amount} มากที่สุดในรอบ {days} วัน แผนปรับตามให้แล้ว',
  'insight.recordDay.cheeky.1':
    'วันนี้ {amount} ทำสถิติใหม่ แต่ไม่ใช่กราฟที่อยากเห็น พรุ่งนี้เริ่มใหม่',
  'insight.recordDay.cheeky.2': 'สถิติใหม่: {amount} มากสุดในรอบ {days} วัน อย่าทำซ้ำนะ',
  'insight.recordDay.roast.1':
    'วันนี้ {amount} มากสุดในรอบ {days} วัน กล้ามาก พรุ่งนี้ขออังกอร์เบาๆ',
  'insight.recordDay.roast.2': 'วันเดียว {amount} สถิติในรอบ {days} วัน ใส่กรอบไว้ แล้วพักก่อน',
  'insight.recordDay.plain': 'วันนี้ใช้ {amount} มากที่สุดต่อวันในรอบ {days} วันที่ผ่านมา',

  'insight.likelySubscription.soft.1': '{merchant} เรียกเก็บราว {amount} ทุกเดือน ตั้งเป็นบิลไหม',
  'insight.likelySubscription.soft.2':
    'จ่าย {merchant} {amount} ติดกัน {months} เดือนแล้ว ตั้งเป็นบิลไหม',
  'insight.likelySubscription.cheeky.1':
    '{merchant} อีกแล้ว {amount} ตรงเป๊ะเหมือนนาฬิกา เห็นนะ ค่าสมาชิก ตั้งเป็นบิลไหม',
  'insight.likelySubscription.cheeky.2':
    '{merchant} {amount} มา {months} เดือนแล้ว ยังใช้อยู่ไหม เพิ่มเป็นบิลเลย',
  'insight.likelySubscription.roast.1':
    '{merchant}: {amount} ติดกัน {months} เดือน ยังใช้อยู่ หรือแค่จ่ายอยู่',
  'insight.likelySubscription.roast.2':
    'จ่าย {merchant} {amount} ทุกเดือน จะเก็บไว้ไหม ถ้าเก็บตั้งเป็นบิล ถ้าไม่ก็ยกเลิก',
  'insight.likelySubscription.plain':
    '{merchant} เรียกเก็บราวเดือนละ {amount} มา {months} เดือน ตั้งเป็นบิลได้',

  'insight.lateNight.soft.1': 'ดึกๆ ใช้ไป {amount} ที่ {merchant} หวังว่าช่วยได้นะ',
  'insight.lateNight.soft.2': '{merchant} {amount} ตอนค่ำคืน หลับฝันดีนะ',
  'insight.lateNight.cheeky.1': '{amount} ที่ {merchant} เลยเวลานอนไปไกล ช้อปสายนกฮูก',
  'insight.lateNight.cheeky.2': '{merchant} ตอนดึก {amount} คลาสสิก',
  'insight.lateNight.roast.1':
    '{amount} ที่ {merchant} ตอนตีหนึ่งตีสอง เรื่องใหญ่ตัดสินตอนกลางวันดีกว่านะ',
  'insight.lateNight.roast.2': '{merchant} ตอนดึก {amount} คราวหน้านอนคิดก่อนกดจ่ายนะ',
  'insight.lateNight.plain': 'ใช้จ่ายตอนดึก: {amount} ที่ {merchant}',

  'insight.cycleHalfway.soft.1': 'มาครึ่งรอบแล้ว: ใช้ไป {percent}% เหลือ {left}',
  'insight.cycleHalfway.soft.2':
    'ผ่านไปครึ่งรอบ ยังเหลืออิสระอีก {left} คุณติดตามอยู่ ซึ่งนั่นคือส่วนที่ยากที่สุด',
  'insight.cycleHalfway.cheeky.1': 'พักครึ่ง สกอร์: ใช้ไป {percent}% เหลือเล่นอีก {left}',
  'insight.cycleHalfway.cheeky.2': 'มาได้ครึ่งทางแล้ว เหลือ {left} สำหรับครึ่งหลัง',
  'insight.cycleHalfway.roast.1':
    'พักครึ่ง: ใช้ไป {percent}% เหลือ {left} สำหรับครึ่งหลัง เล่นให้ดีนะ',
  'insight.cycleHalfway.roast.2': 'ครึ่งทาง ใช้ไป {percent}% เหลือ {left} ครึ่งหลังตัดสินทุกอย่าง',
  'insight.cycleHalfway.plain': 'ผ่านครึ่งรอบแล้ว: ใช้ไป {percent}% เหลือ {left}',

  'insight.firstWeekPaceUp.soft.1':
    'สัปดาห์แรกใช้ไป {percent}% ของรอบ ถ้าเฉลี่ยเท่าๆ กันคือ {even}% สัปดาห์ถัดไปเกลี่ยได้',
  'insight.firstWeekPaceUp.soft.2':
    'สัปดาห์แรกใช้เยอะหน่อย: {percent}% ของเงินทั้งรอบ วันสบายๆ จะพากลับมาเอง',
  'insight.firstWeekPaceUp.cheeky.1':
    'สัปดาห์แรก: ไปแล้ว {percent}% ถ้าเฉลี่ยคือ {even}% ออกตัวแรง อาจจะแรงไปหน่อย',
  'insight.firstWeekPaceUp.cheeky.2':
    'สัปดาห์แรกไป {percent}% เฉลี่ยควรอยู่ที่ {even}% คุมจังหวะหน่อย',
  'insight.firstWeekPaceUp.roast.1':
    'สัปดาห์แรกกินไป {percent}% ของรอบ เฉลี่ยคือ {even}% สัปดาห์อื่นขอคุยด้วยหน่อย',
  'insight.firstWeekPaceUp.roast.2':
    '{percent}% ในสัปดาห์เดียว ทั้งที่เฉลี่ยคือ {even}% สปรินต์จบแล้ว ทีนี้จ็อกกิ้ง',
  'insight.firstWeekPaceUp.plain':
    'สัปดาห์แรกใช้ไป {percent}% ของเงินทั้งรอบ ถ้าเฉลี่ยเท่าๆ กันคือ {even}%',

  'insight.firstWeekPaceDown.soft.1':
    'สัปดาห์แรกใช้ไปแค่ {percent}% ของรอบ ถ้าเฉลี่ยคือ {even}% เริ่มต้นได้สวย',
  'insight.firstWeekPaceDown.soft.2':
    'สัปดาห์แรกเบาๆ: ใช้ไป {percent}% เทียบกับค่าเฉลี่ยถือว่า{compare}',
  'insight.firstWeekPaceDown.cheeky.1':
    'สัปดาห์แรก: แค่ {percent}% ต่ำกว่าเฉลี่ย {even}% ออกตัวนุ่มๆ',
  'insight.firstWeekPaceDown.cheeky.2': 'สัปดาห์แรก: {percent}% เฉลี่ยคือ {even}% ดูสิ',
  'insight.firstWeekPaceDown.roast.1':
    'สัปดาห์แรกใช้ {percent}% ต่ำกว่าเฉลี่ย {even}% ดีจนน่าสงสัย รักษาไว้นะ',
  'insight.firstWeekPaceDown.roast.2': 'สัปดาห์แรก {percent}% เฉลี่ยคือ {even}% ไม่มีอะไรจะติ',
  'insight.firstWeekPaceDown.plain':
    'สัปดาห์แรกใช้ไป {percent}% ของเงินทั้งรอบ ถ้าเฉลี่ยเท่าๆ กันคือ {even}%',

  'insight.paceSpare.soft.1': 'ถ้าใช้แบบนี้ ถึงวันเงินเดือนออก ({payday}) จะเหลือราว {spare}',
  'insight.paceSpare.soft.2': 'รักษาแบบนี้ไว้ ถึง {payday} จะเหลือราว {spare}',
  'insight.paceSpare.cheeky.1': 'คาดว่าวันที่ {payday} จะเหลือ: {spare} อย่าเพิ่งใช้ในหัวนะ',
  'insight.paceSpare.cheeky.2': 'ถ้าเป็นแบบนี้ ถึง {payday} เหลือ {spare} เยี่ยม',
  'insight.paceSpare.roast.1': 'ถ้าใช้แบบนี้ ถึง {payday} เหลือ {spare} อย่าใช้เงินที่ยังไม่มีนะ',
  'insight.paceSpare.roast.2': 'พยากรณ์: {payday} เหลือ {spare} ทำให้พยากรณ์แม่นด้วยนะ',
  'insight.paceSpare.plain': 'ตามจังหวะที่ผ่านมา วันเงินเดือนออก ({payday}) จะเหลือราว {spare}',

  'insight.paceShort.soft.1':
    'ถ้าใช้แบบนี้ เงินจะตึงช่วง {runsOut} ก่อนวันเงินเดือนออก ({payday}) ใช้น้อยลงสักไม่กี่วันก็แก้ได้',
  'insight.paceShort.soft.2':
    'เตือนไว้ก่อน: ถ้าเป็นแบบนี้ เงินจะไม่พอช่วง {runsOut} ใช้น้อยลงหน่อยก็ช่วยได้ ยังมีเวลา',
  'insight.paceShort.cheeky.1':
    'เส้นทางนี้เงินหมดราว {runsOut} เงินเดือนออก {payday} เปลี่ยนเส้นทางไหม',
  'insight.paceShort.cheeky.2':
    'ถ้าใช้แบบนี้ เงินจะหมดแรงราว {runsOut} เงินเดือนออก {payday} ข้างหน้าขอวันเบาๆ',
  'insight.paceShort.roast.1':
    'จังหวะนี้เงินหมดราว {runsOut} แต่เงินเดือนออก {payday} เงียบๆ สักไม่กี่วันก็ลงจอดได้',
  'insight.paceShort.roast.2':
    '{runsOut}: วันที่เงินหมดถ้าใช้แบบนี้ {payday}: วันเงินเดือนออก มาปิดช่องว่างนี้กัน',
  'insight.paceShort.plain':
    'ตามจังหวะที่ผ่านมา เงินจะหมดราว {runsOut} ก่อนวันเงินเดือนออก {payday}',
};
