import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps use the names the iPhone shows in Thai (แก้ไข, เพิ่มวิดเจ็ต, กำหนดเอง, เพิ่มตัวควบคุม, ปุ่มการทำงาน).
// The Siri phrase stays in English: it is the phrase 6pm registers with Siri.
export const thWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'วิดเจ็ตและตัวควบคุม',
  'widgetsGuide.headline': '6pm แค่เหลือบมองหรือกดครั้งเดียว',
  'widgetsGuide.lede':
    'วางยอดวันนี้ใช้ได้ไว้ตรงที่คุณมองอยู่แล้ว และเปิดสแกนคิวอาร์หรือเพิ่มด่วนได้โดยไม่ต้องหาแอป',
  'widgetsGuide.lookMax': 'วาดตามลุคของคุณ',
  'widgetsGuide.lookFree': 'ฟรีในลุคแสงสีทอง มี Max แล้วจะเป็นลุคของคุณ',
  'widgetsGuide.howToAdd': 'วิธีเพิ่ม',
  'widgetsGuide.whenItShows': 'แสดงเมื่อไหร่',

  'widgetsGuide.home.title': 'วิดเจ็ตหน้าจอโฮม',
  'widgetsGuide.home.what': 'เห็นยอดวันนี้ใช้ได้ในพริบตา แตะเพื่อเปิด 6pm',
  'widgetsGuide.home.small': 'เล็ก',
  'widgetsGuide.home.medium': 'กลาง',
  'widgetsGuide.home.large': 'ใหญ่',
  'widgetsGuide.home.smallWhat': 'ยอดที่ใช้ได้วันนี้ของคุณ',
  'widgetsGuide.home.mediumWhat': 'ยอดเงิน พร้อมปุ่มสแกนคิวอาร์และเพิ่มด่วนข้างๆ',
  'widgetsGuide.home.largeWhat': 'ยอดที่เหลือ และรายจ่ายล่าสุดของวันนี้',
  'widgetsGuide.home.step1': 'แตะพื้นที่ว่างบนหน้าจอโฮมค้างไว้จนแอปเริ่มสั่น',
  'widgetsGuide.home.step2': 'แตะแก้ไขที่มุมบน แล้วแตะเพิ่มวิดเจ็ต',
  'widgetsGuide.home.step3': 'ค้นหา 6pm ปัดไปที่ขนาดที่ต้องการ แล้วแตะเพิ่มวิดเจ็ต',

  'widgetsGuide.lock.title': 'วิดเจ็ตหน้าจอล็อค',
  'widgetsGuide.lock.what': 'ดูว่าวันนี้เหลือเท่าไหร่โดยไม่ต้องปลดล็อค',
  'widgetsGuide.lock.ring': 'วงแหวน',
  'widgetsGuide.lock.card': 'การ์ด',
  'widgetsGuide.lock.step1': 'แตะหน้าจอล็อคค้างไว้ แล้วแตะกำหนดเอง',
  'widgetsGuide.lock.step2': 'เลือกหน้าจอล็อค แล้วแตะช่องใต้นาฬิกา',
  'widgetsGuide.lock.step3': 'แตะ 6pm แล้วเลือกแบบวงแหวนหรือการ์ด',

  'widgetsGuide.control.title': 'ศูนย์ควบคุม',
  'widgetsGuide.control.what': 'ปัดลง แตะครั้งเดียว ก็เข้าสแกนคิวอาร์หรือเพิ่มด่วนได้เลย',
  'widgetsGuide.control.needs': 'iOS 18 ขึ้นไป',
  'widgetsGuide.control.step1': 'ปัดลงจากมุมขวาบนของหน้าจอ',
  'widgetsGuide.control.step2': 'แตะพื้นที่ว่างค้างไว้ แล้วแตะเพิ่มตัวควบคุม',
  'widgetsGuide.control.step3': 'ค้นหา 6pm แล้วเลือกสแกนคิวอาร์หรือเพิ่มด่วน',
  'widgetsGuide.control.note': 'สองปุ่มนี้ใช้แทนไฟฉายหรือกล้องที่ด้านล่างของหน้าจอล็อคได้ด้วย',

  'widgetsGuide.action.title': 'ปุ่มการทำงาน',
  'widgetsGuide.action.what': 'กดปุ่มด้านข้างค้างไว้เพื่อเปิดสแกนคิวอาร์',
  'widgetsGuide.action.needs': 'iPhone 15 Pro ขึ้นไป',
  'widgetsGuide.action.step1': 'เปิดการตั้งค่า แล้วไปที่ปุ่มการทำงาน',
  'widgetsGuide.action.step2': 'ปัดไปที่ตัวควบคุม แล้วแตะชื่อตัวควบคุมด้านล่าง',
  'widgetsGuide.action.step3': 'ค้นหา 6pm แล้วเลือกสแกนคิวอาร์หรือเพิ่มด่วน',
  'widgetsGuide.action.note': 'อยากพูดมากกว่า? บอก Siri ว่า “จดใน 6pm” แล้วตามด้วยยอดเงิน',

  'widgetsGuide.live.title': 'กิจกรรมสด',
  'widgetsGuide.live.what': 'ขึ้นมาเองระหว่างรอจ่ายคิวอาร์ และระหว่างที่คุณเดินทาง',
  'widgetsGuide.live.step1': 'สแกนคิวอาร์แล้วจ่ายในแอปธนาคาร รายการจะรออยู่บนหน้าจอล็อค',
  'widgetsGuide.live.step2': 'แตะจ่ายแล้วเมื่อเงินออกไปแล้ว มันจะปิดไปเอง',
  'widgetsGuide.live.step3': 'ไม่ขึ้น? เข้าการตั้งค่า เปิด 6pm แล้วเปิดกิจกรรมสด',
};
