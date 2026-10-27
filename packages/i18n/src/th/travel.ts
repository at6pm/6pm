import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

export const thTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': 'โหมดเดินทาง',
  'travel.settings.sub': 'เปิดเองเมื่ออยู่ต่างประเทศ',
  'travel.settings.locationOff': 'อนุญาตตำแหน่งเพื่อให้รู้ว่าคุณอยู่ต่างประเทศ',
  'travel.settings.stale': 'อัตราแลกเปลี่ยนจาก {date}',
  'travel.settings.noRates': 'กำลังรออัตราแลกเปลี่ยนวันนี้',
  'travel.pill': '{place} · {symbol} มี {home} อยู่ด้านล่าง',
  'travel.activity.place': '{place} · วันนี้',
  'travel.activity.left': 'เหลือ {amount}',
  'travel.activity.over': 'เกิน {amount}',
  'travel.activity.of': 'จาก {line} · ≈ {vnd}',
  'travel.activity.leftOf': 'เหลือจาก {line} · ≈ {home}',
  'travel.activity.overOf': 'เกิน {line} · ≈ {home}',
  'travel.activity.leftHome': 'เหลือ · ≈ {home}',
  'travel.activity.overHome': 'เกิน · ≈ {home}',
  'travel.activity.log': 'จด {symbol}',
  'travel.quick.underneath': 'ประมาณ {amount}',
  'travel.quick.underneathStale': 'ประมาณ {amount} · อัตราจาก {date}',
  'travel.quick.currency': 'เปลี่ยนสกุลเงิน',
  'travel.scan.body':
    'จ่ายในแอปธนาคารของคุณได้เลย ธนาคารเวียดนามส่วนใหญ่รับโค้ดนี้ 6pm จะจดเป็น {symbol} และมี ₫ อยู่ด้านล่าง',
  'travel.scan.bodyAway':
    'จ่ายแบบที่คุณจ่ายกันที่นั่น 6pm จะจดเป็น {symbol} และมี {home} อยู่ด้านล่าง',
  'travel.scan.keep': 'จ่ายแล้ว · เก็บไว้ {amount}',
  'travel.scan.logIn': 'จดเป็น {symbol}',
};
