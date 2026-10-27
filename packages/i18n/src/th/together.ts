import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// The feature is งบด้วยกัน and a shared pot is a กระปุกร่วม. Sign in with Apple uses Apple's own
// Thai name, ลงชื่อเข้าด้วย Apple.
export const thTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'งบด้วยกัน',
  'together.card.subOn': 'ชวนใครสักคนมาออมกระปุกร่วมกัน',
  'together.card.subPaired': { other: 'กับ {name} · กระปุกร่วม {count} ใบ' },
  'together.card.open': 'เปิดงบด้วยกัน',
  'together.you': 'คุณ',
  'together.partner': 'คู่ออมของคุณ',

  'together.intro.title': 'ออมไปด้วยกัน',
  'together.intro.sub':
    'ใช้กระปุกร่วมกับคนที่คุณออมด้วย ทั้งสองคนหยอดได้ และเห็นว่าใครหยอดไปเท่าไหร่ ส่วนวันของคุณเองยังอยู่บนโทรศัพท์ของคุณ',
  'together.intro.note':
    'ลงชื่อเข้าด้วย Apple ใช้แค่กับงบด้วยกันเท่านั้น 6pm ขอแค่ชื่อต้นของคุณ ไม่เคยขออีเมล',
  'together.signIn.failed': 'ลงชื่อเข้าด้วย Apple ไม่สำเร็จ ลองอีกครั้งนะ',
  'together.signIn.unavailable': 'iPhone เครื่องนี้ใช้ ลงชื่อเข้าด้วย Apple ไม่ได้',

  'together.waiting.title': 'ตอนนี้มีแค่คุณ',
  'together.waiting.sub':
    'ส่งลิงก์ให้คนที่คุณออมด้วย เมื่อเขาเข้าร่วม จะเห็นกระปุกร่วมของคุณทั้งสอง',
  'together.paired.title': 'คุณกับ {name}',
  'together.paired.sub': { other: 'กระปุกร่วม {count} ใบ' },
  'together.invite': 'ชวนใครสักคน',
  'together.invite.again': 'ส่งลิงก์ชวนใหม่',
  'together.invite.message': 'มาออมด้วยกันใน 6pm นะ: {url}',
  'together.invite.note': 'ลิงก์ชวนใช้ได้ครั้งเดียว ภายใน 7 วัน',
  'together.offline': 'ออฟไลน์อยู่ นี่คือข้อมูลที่คุณเห็นล่าสุด',

  'together.pots.title': 'กระปุกร่วม',
  'together.newPot': 'กระปุกร่วมใหม่',
  'together.newPotSub': 'ทั้งสองคนหยอดได้',
  'together.jar.add': 'หยอด {amount} ลง {name}',
  'together.jar.split': 'คุณ {mine} · {partner} {theirs}',
  'together.jar.mine': 'คุณหยอดไป {mine}',

  'together.pot.edit': 'แก้ไขกระปุกร่วม',
  'together.pot.start': 'เริ่มกระปุกร่วม',
  'together.pot.save': 'บันทึก',
  'together.pot.sumMonthly': 'ราวเดือนละ {amount} รวมกันทั้งสองคน',
  'together.pot.sumSub': 'เงินที่คุณหยอดนับเหมือนเติมกระปุกของคุณเอง',
  'together.pot.sumNone': 'ไม่มีกำหนด ไม่ต้องรีบ',
  'together.pot.sumNoneSub': 'หยอดได้ตามใจเมื่อไหร่ก็ได้',
  'together.pot.amount': 'หยอด',
  'together.pot.addButton': 'หยอด {amount}',
  'together.pot.entries': 'ใครหยอดเท่าไหร่',
  'together.pot.empty': 'ยังไม่มีอะไรในกระปุก',
  'together.pot.entry': '{who} หยอด · {day}',
  'together.pot.takeBack': 'ถอนคืน',
  'together.pot.takeBackLabel': 'ถอนคืน {amount}',
  'together.pot.delete': 'ลบกระปุกร่วม',
  'together.pot.deleteConfirm': 'แตะอีกครั้งเพื่อลบสำหรับทั้งสองคน',
  'together.pot.deleted': 'ลบ {name} แล้ว',
  'together.pot.gone': 'กระปุกนี้ไม่มีแล้ว คู่ออมของคุณอาจลบไปแล้ว',

  'together.leave': 'ออกจากงบด้วยกัน',
  'together.leaveConfirm': 'แตะอีกครั้งเพื่อออก',
  'together.leave.note':
    'การออกจะสิ้นสุดสำหรับทั้งสองคน และลบกระปุกร่วมออกจากเซิร์ฟเวอร์ของเรา แต่ละคนยังเก็บส่วนที่ตัวเองหยอดไว้บนโทรศัพท์ของตัวเอง',
  'together.deleteAccount': 'ลบบัญชีงบด้วยกัน',
  'together.deleteConfirm': 'แตะอีกครั้งเพื่อลบบัญชีของคุณ',
  'together.delete.note':
    'ลบการลงชื่อเข้าและทุกอย่างที่คุณแชร์ และแจ้ง Apple ว่า 6pm ไม่ใช้ Apple ID ของคุณแล้ว ส่วนวันของคุณเองยังอยู่บนโทรศัพท์เครื่องนี้',
  'together.kept.title': 'เก็บไว้บน iPhone เครื่องนี้',
  'together.kept.sub': 'ที่คุณหยอดลงกระปุกร่วม: {amount} ยังอยู่ตรงนี้แม้กระปุกจะไม่มีแล้ว',

  'together.join.title': 'เข้าร่วมงบด้วยกัน',
  'together.join.sub':
    'มีคนชวนคุณมาใช้กระปุกร่วมใน 6pm ลงชื่อเข้าด้วย Apple เพื่อเข้าร่วม ส่วนวันของคุณเองยังอยู่บนโทรศัพท์ของคุณ',
  'together.join.button': 'เข้าร่วม',
  'together.join.expired': 'ลิงก์ชวนนี้หมดอายุแล้ว ขอลิงก์ใหม่นะ',
  'together.join.used': 'ลิงก์ชวนนี้ถูกใช้ไปแล้ว ขอลิงก์ใหม่นะ',
  'together.join.full': 'ตรงนั้นมีสองคนใช้กระปุกร่วมกันอยู่แล้ว',
  'together.join.own': 'นี่คือลิงก์ชวนของคุณเอง ส่งให้คนที่คุณออมด้วยนะ',
  'together.join.paired': 'คุณใช้กระปุกร่วมอยู่แล้ว ออกจากงบด้วยกันก่อน แล้วเปิดลิงก์อีกครั้ง',
  'together.join.missing': 'ลิงก์ชวนนี้ใช้ไม่ได้ ขอลิงก์ใหม่นะ',

  'together.error.offline': 'ติดต่อ 6pm ไม่ได้ ไม่มีอะไรเปลี่ยน',
  'together.error.failed': 'ทำไม่สำเร็จ ไม่มีอะไรเปลี่ยน',
  'together.ended': 'งบด้วยกันสิ้นสุดแล้ว ส่วนที่คุณหยอดไว้ยังอยู่บนโทรศัพท์เครื่องนี้',
  'together.left': 'คุณออกจากงบด้วยกันแล้ว',
  'together.deleted': 'ลบบัญชีงบด้วยกันแล้ว',
  'together.joined': 'เข้าร่วมแล้ว ใช้งบด้วยกันกับ {name}',
};
