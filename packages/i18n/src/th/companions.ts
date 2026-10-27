import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay as they are; Sunset and Midnight Sun take Thai names, as the Vietnamese does.
export const thCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.title': 'เพื่อนคู่ใจ',
  'companions.intro': 'เลือกเพื่อนที่จะอยู่ด้วยกันทุกเย็น ทุกตัวสัญญาเหมือนกันหมด',
  'companions.name.sun': 'ตะวันรอน',
  'companions.name.max': 'ตะวันเที่ยงคืน',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.gloss.sun': 'ดวงอาทิตย์ยามเย็น',
  'companions.gloss.max': 'ดวงอาทิตย์ของ Max',
  'companions.gloss.nhang': 'ธูปหอม',
  'companions.gloss.banhbao': 'ซาลาเปานึ่ง',
  'companions.gloss.giot': 'หยดฝน',
  'companions.gloss.hac': 'นกกระเรียนกระดาษ',
  'companions.line.sun': 'อบอุ่นและมั่นคง ตกดินไปพร้อมคุณตอนหกโมงเย็น',
  'companions.line.max': 'ดวงอาทิตย์หลังฟ้ามืด มีวงแหวนกับดวงจันทร์สองดวง',
  'companions.line.nhang': 'ใจเย็น รู้อะไรเยอะนิดๆ ไม่เคยรีบ',
  'companions.line.banhbao': 'นุ่มนิ่ม อบอุ่น คิดถึงแต่มื้อเย็น',
  'companions.line.giot': 'ซนและดุ๊กดิ๊ก ดีใจทีไรกระเซ็นทุกที',
  'companions.line.hac': 'สง่างาม ภูมิใจแบบเงียบๆ พับมาอย่างประณีต',
  'companions.wearing': 'อยู่กับคุณ',
  'companions.max': 'MAX',
  'companions.locked': '{name} มากับ Max',
  'companions.icon': 'ไอคอนแอปตามเพื่อนคู่ใจ',
  'companions.iconSub': 'หน้าจอโฮมจะแสดงเพื่อนที่คุณเลือก',
};
