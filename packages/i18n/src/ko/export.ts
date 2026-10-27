import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

// The CSV header row uses short column names a spreadsheet shows well.
export const koExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': '내보내기',
  'export.row.value': 'CSV · Sheets',
  'export.empty': '아직 내보낼 게 없어요. 먼저 지출을 추가하세요.',
  'export.failed': '파일을 만들지 못했어요. 다시 시도하세요.',

  'export.csv.date': '날짜',
  'export.csv.time': '시간',
  'export.csv.merchant': '가게',
  'export.csv.category': '카테고리',
  'export.csv.amount': '금액({code})',
  'export.csv.status': '상태',
  'export.csv.source': '출처',
  'export.csv.wallet': '결제 수단',
  'export.csv.note': '메모',
  'export.csv.detail': '세부 정보',
  'export.csv.forWork': '업무용',
  'export.csv.foreignAmount': '외화 금액',
  'export.csv.currency': '통화',
  'export.csv.yes': '예',
  'export.csv.no': '아니요',
};
