import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion is gender-neutral (นะ / เลย / แล้ว, never ครับ/ค่ะ) and calls the user คุณ. A pot is
// a กระปุก, a spend is a รายการ, the day's line is ยอด (เส้น when it is playing the opponent).
export const thInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'มากกว่าเยอะ',
  'insight.compare.more': 'มากกว่า',
  'insight.compare.about': 'พอๆ กัน',
  'insight.compare.less': 'น้อยกว่า',
  'insight.compare.muchLess': 'น้อยกว่าเยอะ',

  'insight.todayOver.soft.1': 'วันนี้เกินไป {over} ไม่เป็นไรนะ พรุ่งนี้มี {tomorrow}',
  'insight.todayOver.soft.2':
    'วันนี้ใช้หนักหน่อย เกินไป {over} แผนปรับตามให้แล้ว พรุ่งนี้มี {tomorrow}',
  'insight.todayOver.cheeky.1': 'วันนี้เกิน {over} พรุ่งนี้มี {tomorrow} เริ่มใหม่สดๆ เลย',
  'insight.todayOver.cheeky.2': 'วันนี้ทะลุเส้นไป {over} หักมุมนิดหน่อย พรุ่งนี้มี {tomorrow}',
  'insight.todayOver.roast.1': 'เกิน {over} เส้นสู้สุดใจแล้วนะ พรุ่งนี้ {tomorrow} เบามือหน่อยนะ',
  'insight.todayOver.roast.2': 'เส้นบอกพอ วันนี้บอกขออีก {over} พรุ่งนี้ {tomorrow} ยกสองนะ',
  'insight.todayOver.plain': 'วันนี้เกินยอดไป {over} ยอดของพรุ่งนี้คือ {tomorrow}',

  'insight.todayUnder.soft.1': 'ใช้ไป {spent} ยังใช้ได้อีก {safe} ไปได้สวยเลย',
  'insight.todayUnder.soft.2': 'วันนี้ยังเหลืออีก {safe} ทำได้ดีแล้วนะ',
  'insight.todayUnder.cheeky.1': 'วันนี้เหลือ {safe} จะใช้ให้คุ้มหรือเก็บไว้ก็แล้วแต่คุณ',
  'insight.todayUnder.cheeky.2': 'ใช้ไป {spent} เหลืออีก {safe} ลื่นปรื๊ด',
  'insight.todayUnder.roast.1':
    'เพิ่งใช้ไป {spent} เองเหรอ กระเป๋าตังค์งงเลย แบบดีๆ นะ ยังใช้ได้อีก {safe}',
  'insight.todayUnder.roast.2': 'ยังใช้ได้อีก {safe} น่าสงสัยนิดๆ แต่ทำต่อไปนะ',
  'insight.todayUnder.plain': 'วันนี้ใช้ไป {spent} ยังใช้ได้อีก {safe}',

  'insight.noSpendYet.soft.1': 'ยังไม่ได้ใช้อะไรเลย {line} ของวันนี้ยังเป็นของคุณทั้งหมด',
  'insight.noSpendYet.soft.2': 'เริ่มต้นใหม่หมดจด: วันนี้มี {line}',
  'insight.noSpendYet.cheeky.1': 'วันนี้มี {line} ยังไม่มีรอยขีดข่วนสักนิด ตอนนี้นะ',
  'insight.noSpendYet.cheeky.2': '{line} เต็มๆ วันนี้ยังไม่ได้แตะเลย แค่ตอนนี้แหละ',
  'insight.noSpendYet.roast.1': 'ยังไม่ได้ใช้อะไร {line} กำลังรอดูว่าคุณจะเอายังไง',
  'insight.noSpendYet.roast.2': '{line} นอนนิ่งยังไม่มีใครแตะ น่าสงสัยจัง ทำต่อไปนะ',
  'insight.noSpendYet.plain': 'ยังไม่ได้ใช้จ่าย ยอดของวันนี้คือ {line}',

  'insight.waitingTonight.soft.1': {
    other: '{count} รายการ ({amount}) รอปิดวันคืนนี้ นาทีเดียวพอ',
  },
  'insight.waitingTonight.soft.2': { other: 'คืนนี้มี {count} รายการให้ดู รวม {amount}' },
  'insight.waitingTonight.cheeky.1': {
    other: '{count} รายการ ({amount}) รอคำตัดสินจากคุณคืนนี้',
  },
  'insight.waitingTonight.cheeky.2': {
    other: 'ปิดวันคืนนี้: {count} รายการ {amount} สบายๆ',
  },
  'insight.waitingTonight.roast.1': {
    other: '{count} รายการ {amount} รออยู่ มันไม่ปิดเองหรอก แต่นาทีเดียวก็จบ',
  },
  'insight.waitingTonight.roast.2': {
    other: '{count} รายการ {amount} รอให้คุณบอกว่า “ใช่ ของฉันเอง”',
  },
  'insight.waitingTonight.plain': { other: '{count} รายการ ({amount}) รอปิดวันคืนนี้' },

  'insight.paydaySoon.soft.1': { other: 'อีก {count} วันเงินเดือนออก ใกล้แล้วนะ' },
  'insight.paydaySoon.soft.2': {
    other: 'อีก {count} วันถึงวันเงินเดือนออก {payday} อดทนอีกนิดนะ',
  },
  'insight.paydaySoon.cheeky.1': { other: 'อีก {count} วันเงินเดือนออก ได้กลิ่นแล้วเนี่ย' },
  'insight.paydaySoon.cheeky.2': { other: 'นอนอีก {count} คืนก็เงินเดือนออกแล้ว' },
  'insight.paydaySoon.roast.1': { other: 'อีก {count} วันเงินเดือนออก ประคองไว้นะ' },
  'insight.paydaySoon.roast.2': {
    other: 'อีก {count} วันเงินเดือนออก ({payday}) รูดซิปกระเป๋าไว้จนถึงวันนั้นเลย',
  },
  'insight.paydaySoon.plain': { other: 'อีก {count} วันถึงวันเงินเดือนออก คือ {payday}' },

  'insight.billDueToday.soft.1': '{bill} ({amount}) ครบกำหนดวันนี้',
  'insight.billDueToday.soft.2': 'เตือนเบาๆ: {bill} {amount} ครบกำหนดวันนี้นะ',
  'insight.billDueToday.cheeky.1': '{bill} มาขอ {amount} วันนี้แล้ว',
  'insight.billDueToday.cheeky.2': 'แขกรับเชิญวันนี้: {bill} {amount}',
  'insight.billDueToday.roast.1': '{bill} ครบกำหนดวันนี้ ไม่รอใครทั้งนั้น',
  'insight.billDueToday.roast.2': '{amount} สำหรับ {bill} วันนี้เลย อย่าเทนะ',
  'insight.billDueToday.plain': 'บิล {bill} ({amount}) ครบกำหนดวันนี้',

  'insight.billDue.soft.1': { other: '{bill} ({amount}) ครบกำหนดในอีก {count} วัน' },
  'insight.billDue.soft.2': { other: 'เตือนไว้ก่อน: {bill} {amount} อีก {count} วัน' },
  'insight.billDue.cheeky.1': { other: 'อีก {count} วัน {bill} จะมาเก็บ {amount}' },
  'insight.billDue.cheeky.2': { other: 'อีก {count} วัน: {bill} {amount} จดไว้เลย' },
  'insight.billDue.roast.1': { other: 'อีก {count} วัน {bill} จะมาขอ {amount} เหมือนทุกที' },
  'insight.billDue.roast.2': {
    other: '{amount} สำหรับ {bill} ในอีก {count} วัน อย่าทำเป็นตกใจนะ',
  },
  'insight.billDue.plain': { other: 'บิล {bill} ({amount}) ครบกำหนดในอีก {count} วัน' },

  'insight.categoryPaceUp.soft.1':
    '{category} รอบนี้ใช้ไป {now} แล้ว เทียบกับช่วงเดียวกันของรอบก่อนถือว่า{compare}',
  'insight.categoryPaceUp.soft.2': '{category} มาไวกว่าปกติ: ตอนนี้ {now} รอบก่อน {before}',
  'insight.categoryPaceUp.cheeky.1': '{category}: {now} แล้ว รอบก่อนตอนนี้อยู่ที่ {before} อืม…',
  'insight.categoryPaceUp.cheeky.2': '{category} กำลังมาแรง: {now} ต่อ {before}',
  'insight.categoryPaceUp.roast.1':
    '{category} อยู่ที่ {now} รอบก่อน: {before} เห็นนะ สัปดาห์เงียบๆ สักสัปดาห์ก็เกลี่ยได้',
  'insight.categoryPaceUp.roast.2':
    '{category} ไปแล้ว {now} รอบก่อนแค่ {before} แค่บอกเฉยๆ ด้วยความรักนะ',
  'insight.categoryPaceUp.plain': '{category}: รอบนี้ {now} ช่วงเดียวกันของรอบก่อน {before}',

  'insight.categoryPaceDown.soft.1': '{category} ลดลงเหลือ {now} จาก {before} รอบก่อน ดีจัง',
  'insight.categoryPaceDown.soft.2': 'เทียบกับรอบก่อน {category} ใช้{compare}: {now} ต่อ {before}',
  'insight.categoryPaceDown.cheeky.1': '{category}: {now} ลดจาก {before} เก่งนี่',
  'insight.categoryPaceDown.cheeky.2': '{category} ไปไดเอตมา: {now} ต่อ {before}',
  'insight.categoryPaceDown.roast.1':
    '{category} แค่ {now} เองเหรอ รอบก่อนตั้ง {before} เวอร์ชันนี้แหละ เก็บไว้เลย',
  'insight.categoryPaceDown.roast.2': '{category} {now} ลดจาก {before} โตขึ้นเยอะนะ',
  'insight.categoryPaceDown.plain': '{category}: รอบนี้ {now} ช่วงเดียวกันของรอบก่อน {before}',

  'insight.repeatMerchant.soft.1': 'สัปดาห์นี้ไป {merchant} มา {visits} ครั้งแล้ว ร้านคงรักคุณมาก',
  'insight.repeatMerchant.soft.2': 'ไป {merchant} {visits} ครั้งตั้งแต่วันจันทร์ รวม {amount}',
  'insight.repeatMerchant.cheeky.1':
    '{merchant} อีกแล้วเหรอ ตั้งแต่วันจันทร์ก็ {visits} ครั้งแล้วนะ',
  'insight.repeatMerchant.cheeky.2': 'คุณกับ {merchant}: สัปดาห์นี้เดตกัน {visits} ครั้ง {amount}',
  'insight.repeatMerchant.roast.1': '{merchant} ครั้งที่ {visits} แล้ว ร้านจำชื่อคุณได้หรือยัง',
  'insight.repeatMerchant.roast.2':
    'สัปดาห์นี้ {amount} ที่ {merchant} {visits} ครั้ง กลายเป็นไลฟ์สไตล์ไปแล้ว',
  'insight.repeatMerchant.plain': '{merchant}: สัปดาห์นี้ {visits} ครั้ง {amount}',

  'insight.firstTimeMerchant.soft.1': 'ครั้งแรกที่ {merchant} หวังว่าจะถูกใจนะ',
  'insight.firstTimeMerchant.soft.2': 'ที่ใหม่: {merchant} {amount}',
  'insight.firstTimeMerchant.cheeky.1': '{merchant} เหรอ ร้านใหม่ สายลองนี่นา',
  'insight.firstTimeMerchant.cheeky.2': 'โอ้ {merchant} ไม่เคยเห็นร้านนี้มาก่อนเลย',
  'insight.firstTimeMerchant.roast.1': '{merchant} ร้านใหม่ กระเป๋าใบเดิม',
  'insight.firstTimeMerchant.roast.2':
    'ไป {merchant} ครั้งแรก อย่าให้ติดเป็นนิสัยนะ หรือจะติดก็ได้',
  'insight.firstTimeMerchant.plain': 'ใช้จ่ายครั้งแรกที่ {merchant}: {amount}',

  'insight.biggestSpend.soft.1': 'รายการใหญ่ของสัปดาห์: {amount} ที่ {merchant}',
  'insight.biggestSpend.soft.2': '{merchant} {amount}: ใหญ่สุดของสัปดาห์นี้ แผนรับไหว',
  'insight.biggestSpend.cheeky.1': 'ตัวชูโรงของสัปดาห์: {merchant} {amount}',
  'insight.biggestSpend.cheeky.2': '{amount} ที่ {merchant} ให้รางวัลตัวเองสินะ',
  'insight.biggestSpend.roast.1': '{amount} ที่ {merchant} ตัวเอกของสัปดาห์เลย',
  'insight.biggestSpend.roast.2':
    '{merchant} เอาไป {amount} สัปดาห์นี้ คุ้มไหม ไม่ต้องตอบ แผนรับไหว',
  'insight.biggestSpend.plain': 'รายการใหญ่สุดสัปดาห์นี้: {amount} ที่ {merchant}',

  'insight.underStreak.soft.1': 'ไม่เกินยอดติดกัน {days} วันแล้ว มั่นคงสุดๆ',
  'insight.underStreak.soft.2': 'วันสงบๆ ติดกัน {days} วัน',
  'insight.underStreak.cheeky.1': 'ไม่เกินยอด {days} วัน เข้าสู่ยุคสตรีคแล้ว',
  'insight.underStreak.cheeky.2': 'ไม่เกินยอดติดกัน {days} วัน อย่าทักนะ',
  'insight.underStreak.roast.1': 'ไม่เกินยอด {days} วัน เตรียมมุกไว้แล้วแท้ๆ เสียของหมด',
  'insight.underStreak.roast.2': 'ติดกัน {days} วัน มุกจะหมดแล้วเนี่ย',
  'insight.underStreak.plain': 'ปิดวันติดกัน {days} วันโดยไม่เกินยอด',

  'insight.closeStreak.soft.1': 'ปิดวันติดกัน {days} วันแล้ว นี่แหละกิจวัตรของเรา',
  'insight.closeStreak.soft.2': 'สตรีคปิดวัน {days} วัน ขอบคุณที่มาทุกเย็นนะ',
  'insight.closeStreak.cheeky.1': 'ปิดวันติดกัน {days} ครั้ง ปลดล็อกนิสัยใหม่แล้ว',
  'insight.closeStreak.cheeky.2': 'สตรีค: {days} คืนนี้เพิ่มอีกหนึ่ง',
  'insight.closeStreak.roast.1': 'ติดกัน {days} วันเต็ม สตรีคนี้เข้ากับคุณมาก อย่าทำขาดนะ',
  'insight.closeStreak.roast.2': 'ปิดวันติดกัน {days} ครั้ง จะมาขาดตอนนี้ไม่ได้นะ',
  'insight.closeStreak.plain': 'ปิดวันติดกัน {days} วัน',

  'insight.weekSpare.soft.1': {
    other: 'สัปดาห์นี้ไม่เกินยอด {count} วัน เหลือ {spare} ยกไปวันข้างหน้า',
  },
  'insight.weekSpare.soft.2': { other: 'สัปดาห์นี้เหลือ {spare} ยกไปข้างหน้า' },
  'insight.weekSpare.cheeky.1': {
    other: 'เหลือ {spare} จาก {count} วันดีๆ วันข้างหน้าฝากขอบคุณ',
  },
  'insight.weekSpare.cheeky.2': { other: 'สัปดาห์นี้นำอยู่ {spare} ลื่นปรื๊ด' },
  'insight.weekSpare.roast.1': {
    other: 'ไม่เกินยอด {count} วัน เหลือ {spare} อย่าใช้หมดทีเดียวล่ะ',
  },
  'insight.weekSpare.roast.2': { other: 'สัปดาห์นี้บวก {spare} โอเค อนุญาต' },
  'insight.weekSpare.plain': { other: 'วันที่ปิดแล้วของสัปดาห์นี้เหลือรวม {spare}' },

  'insight.weekOver.soft.1': 'สัปดาห์นี้เกินไป {over} วันข้างหน้าจะเล็กลงนิดหน่อย ไม่เป็นไรเลย',
  'insight.weekOver.soft.2': 'สัปดาห์นี้เกิน {over} เดี๋ยวค่อยๆ เกลี่ยกัน',
  'insight.weekOver.cheeky.1': 'สัปดาห์นี้เกิน {over} ที่เหลือของเดือนปรับตามเอง',
  'insight.weekOver.cheeky.2': 'เกินมา {over} แล้ว แค่จุดหักมุม ยังไม่ใช่ตอนจบ',
  'insight.weekOver.roast.1': 'สัปดาห์นี้: เกิน {over} สัปดาห์หน้าเบาๆ หน่อย เดือนนี้ก็ยังไหว',
  'insight.weekOver.roast.2': 'เกิน {over} สัปดาห์นี้ลืมไปซะ เดือนนี้ยังแก้ทัน',
  'insight.weekOver.plain': 'วันที่ปิดแล้วของสัปดาห์นี้เกินยอดรวม {over}',

  'insight.potMilestone.soft.1': 'กระปุก {pot} เกิน {percent}% แล้ว ดูมันโตขึ้นสิ',
  'insight.potMilestone.soft.2': 'มาได้ {percent}% ของกระปุก {pot} แล้ว',
  'insight.potMilestone.cheeky.1': 'กระปุก {pot}: {percent}% แล้ว เป็นจริงขึ้นมาแล้ว',
  'insight.potMilestone.cheeky.2': 'กระปุก {pot} สำเร็จไป {percent}% หยอดต่อเลย',
  'insight.potMilestone.roast.1': 'กระปุก {pot} อยู่ที่ {percent}% กระปุกกำลังชนะ ปล่อยให้ชนะไป',
  'insight.potMilestone.roast.2': 'กระปุก {pot} ถึง {percent}% แล้ว ห้ามแอบแคะนะ',
  'insight.potMilestone.plain': 'กระปุก {pot} เกิน {percent}% ของเป้าแล้ว',

  'insight.potFull.soft.1': 'กระปุก {pot} เต็มแล้ว ฝีมือคุณล้วนๆ',
  'insight.potFull.soft.2': 'กระปุก {pot}: สำเร็จ ใช้ให้สุขใจเลยนะ',
  'insight.potFull.cheeky.1': 'กระปุก {pot} เต็มแล้ว! โปรยกระดาษสี แต่เบาๆ',
  'insight.potFull.cheeky.2': 'กระปุก {pot} เต็มเอี้ยด',
  'insight.potFull.roast.1': 'กระปุก {pot} เต็มแล้ว เตรียมมุกไว้แต่คุณไม่ต้องใช้เลย',
  'insight.potFull.roast.2': 'กระปุกเต็ม: {pot} ทีนี้เอาไปใช้กับสิ่งที่ตั้งใจไว้เลย',
  'insight.potFull.plain': 'กระปุก {pot} ถึงเป้าแล้ว',

  'insight.workToClaim.soft.1': { other: 'ค่างาน {count} รายการ ({amount}) รอเบิกคืน' },
  'insight.workToClaim.soft.2': { other: 'ค่างาน {amount} จาก {count} รายการ รอเบิกคืนอยู่' },
  'insight.workToClaim.cheeky.1': { other: 'ที่ทำงานติดคุณอยู่ {amount} ใบเสร็จตั้ง {count} ใบ' },
  'insight.workToClaim.cheeky.2': { other: 'ค่างาน {count} รายการ {amount} ไปเบิกเลย' },
  'insight.workToClaim.roast.1': {
    other: 'บริษัทติดคุณอยู่ {amount} ตั้ง {count} ครั้ง ไม่ต้องเกรงใจ',
  },
  'insight.workToClaim.roast.2': { other: 'คุณกำลังออกเงินให้บริษัท {amount} เบิกคืนเลย' },
  'insight.workToClaim.plain': { other: 'ค่างาน {count} รายการ ({amount}) รอเบิกคืน' },
};
