import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// The companion speaks as เรา, gender-neutral. The serious lines (distress, investing, unsafe) are
// plain and keep the Vietnamese hotline and emergency numbers the English gives.
export const thAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': 'สวัสดี! อยากเช็กเรื่องเงินเมื่อไหร่ เราอยู่ตรงนี้นะ',
  'ask.chat.greeting.cheeky': 'เฮ้! ถามเรื่องเงินมาได้เลย ตัวเลขของคุณเรามีครบ',
  'ask.chat.greeting.roast': 'อ้าว คุณเองเหรอ มาถามว่าแย่แค่ไหนใช่ไหม?',
  'ask.chat.greeting.plain': 'สวัสดี ถามเรื่องการใช้จ่าย บิล หรือกระปุกได้เลย',
  'ask.chat.thanks.soft': 'ยินดีเสมอ วันนี้ดูแลตัวเองด้วยนะ',
  'ask.chat.thanks.cheeky': 'ยินดี! ค่าตอบแทนขอเป็นการปิดวันตรงเวลาก็พอ',
  'ask.chat.thanks.roast': 'ไม่ต้องขอบคุณเรา ขอบคุณงบที่คุณเกือบจะคุมได้นั่นแหละ',
  'ask.chat.thanks.plain': 'ยินดี',
  'ask.chat.offTopic.soft': 'เรื่องนี้นอกเหนือที่เราถนัด แต่ถ้าเป็นเรื่องเงิน ถามมาได้เต็มที่เลย',
  'ask.chat.offTopic.cheeky': 'ไม่ใช่แผนกเรา ถามว่าเงินหายไปไหนดีกว่า 👀',
  'ask.chat.offTopic.roast': 'เราเป็นงบนะ ไม่ใช่เครื่องมือค้นหา ถามเรื่องการใช้จ่ายมาเถอะ',
  'ask.chat.offTopic.plain': 'เราช่วยได้แค่เรื่องเงินของคุณใน 6pm',
  'ask.chat.identity':
    'เราคือเพื่อนคู่ใจของคุณใน 6pm ทุกตัวเลขที่เราบอกคำนวณบนโทรศัพท์ของคุณ จากรายการใช้จ่ายของคุณเอง เราเป็นโปรแกรม ไม่ใช่คน',
  'ask.chat.privacy':
    'เรามองไม่เห็นบัญชีธนาคารของคุณ เรารู้แค่สิ่งที่อยู่ใน 6pm และทั้งหมดอยู่บนโทรศัพท์ของคุณ เวลาอ่านคำถาม เซิร์ฟเวอร์ของเราเห็นแค่คำถามกับชื่อหมวดหมู่และชื่อกระปุก เวลาแต่งประโยค ก็เห็นแค่ข้อมูลไม่กี่อย่างในประโยคนั้น',
  'ask.chat.venting.soft': 'ฟังดูหนักเลยนะ คุณไม่ได้แบกไว้คนเดียว',
  'ask.chat.venting.cheeky': 'หนักเลยนะ หายใจลึกๆ ก่อน มันแค่ตัวเลข ไม่ใช่คำตัดสิน',
  'ask.chat.venting.plain': 'ความเครียดเรื่องเงินเป็นเรื่องจริง',
  'ask.chat.goingRight': 'มีเรื่องหนึ่งที่ไปได้ดี:',
  'ask.chat.freshStart': 'พรุ่งนี้เริ่มต้นด้วยยอดใหม่',
  'ask.chat.roast.soft': 'งั้นเบาๆ นะ:',
  'ask.chat.roast.cheeky': 'โอเค ขอมาเองนะ',
  'ask.chat.roast.roast': 'เตรียมใจไว้เลย',
  'ask.chat.roast.plain': 'รายการที่โดดเด่นที่สุด:',
  'ask.chat.roastNothing.soft': 'ไม่มีอะไรให้แซวเลย คุณทำได้ดีมาก',
  'ask.chat.roastNothing.cheeky': 'ส่องแล้ว บอกตรงๆ ไม่มีอะไรให้แซวเลย น่าหงุดหงิด',
  'ask.chat.roastNothing.roast': 'ตั้งใจจะแซวซะหน่อย แต่ไม่มีอะไรให้แซวเลย เสียมารยาทจริง',
  'ask.chat.roastNothing.plain': 'ตอนนี้ยังไม่มีอะไรโดดเด่น',
  'ask.chat.hype.soft': 'คุณควรได้ยินเรื่องนี้:',
  'ask.chat.hype.cheeky': 'เปิดโหมดเชียร์:',
  'ask.chat.hype.roast': 'ก็ได้ ยอมรับว่าเก่ง:',
  'ask.chat.hype.plain': 'สิ่งที่ไปได้ดี:',
  'ask.chat.hypeNothing.soft': 'คุณเปิดมาเช็กแล้ว แค่นี้ก็นับแล้วนะ',
  'ask.chat.hypeNothing.cheeky': 'ตั้งใจเปิดแอปจดรายจ่ายเอง ตำนานชัดๆ',
  'ask.chat.hypeNothing.roast': 'อย่างน้อยก็ยังมา ดีกว่าหลายคน ภูมิใจนิดๆ',
  'ask.chat.hypeNothing.plain': 'ทำต่อไป ทีละนิดก็สะสมได้',
  'ask.chat.distress':
    'เสียใจจริงๆ ที่คุณรู้สึกแบบนี้ คุณไม่ต้องแบกไว้คนเดียว ลองคุยกับคนที่คุณไว้ใจ หรือโทรสายด่วน Ngày Mai ที่ 096 306 1414 (13.00–20.30 น. วันพุธถึงวันอาทิตย์) ถ้าตอนนี้คุณกำลังตกอยู่ในอันตราย โทร 115',
  'ask.chat.investing':
    'เราบอกไม่ได้ว่าควรลงทุนอะไรหรือเมื่อไหร่ เรื่องนั้นต้องปรึกษาที่ปรึกษาที่มีใบอนุญาต แต่เราแสดงได้ว่าแต่ละเดือนคุณมีเงินเหลือเท่าไหร่ หรือกระปุกเต็มเร็วแค่ไหน',
  'ask.chat.unsafe':
    'เรื่องนี้เราช่วยไม่ได้ ถ้าเงินตึงอยู่ เราแสดงได้ว่าเหลือเท่าไหร่ถึงวันเงินเดือนออก หรือกระปุกช่วยได้แค่ไหน ถ้ามีเจ้าหนี้นอกระบบข่มขู่ โทรแจ้งตำรวจที่ 113',
};
