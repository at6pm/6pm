import type { enExport } from '../en-export';

// The CSV headers are plain column names a spreadsheet user would expect in Thai.
export const thExport: { readonly [Key in keyof typeof enExport]: string } = {
  'export.title': 'ส่งออก',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'ยังไม่มีอะไรให้ส่งออก เพิ่มรายการใช้จ่ายก่อนนะ',
  'export.failed': 'สร้างไฟล์ไม่สำเร็จ ลองอีกครั้งนะ',

  'export.csv.date': 'วันที่',
  'export.csv.time': 'เวลา',
  'export.csv.merchant': 'ร้านค้า',
  'export.csv.category': 'หมวดหมู่',
  'export.csv.amount': 'จำนวนเงิน ({code})',
  'export.csv.status': 'สถานะ',
  'export.csv.source': 'ที่มา',
  'export.csv.wallet': 'กระเป๋าเงิน',
  'export.csv.note': 'โน้ต',
  'export.csv.detail': 'รายละเอียด',
  'export.csv.forWork': 'ค่างาน',
  'export.csv.foreignAmount': 'จำนวนเงินต่างประเทศ',
  'export.csv.currency': 'สกุลเงิน',
  'export.csv.yes': 'ใช่',
  'export.csv.no': 'ไม่ใช่',
};
