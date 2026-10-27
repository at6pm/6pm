import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

export const jaExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': 'エクスポート',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'まだエクスポートするものがありません。まず支出を追加してください。',
  'export.failed': 'ファイルを作成できませんでした。もう一度お試しください。',

  'export.csv.date': '日付',
  'export.csv.time': '時刻',
  'export.csv.merchant': 'お店',
  'export.csv.category': 'カテゴリ',
  'export.csv.amount': '金額（{code}）',
  'export.csv.status': '状態',
  'export.csv.source': '入力元',
  'export.csv.wallet': '支払い方法',
  'export.csv.note': 'メモ',
  'export.csv.detail': '詳細',
  'export.csv.forWork': '仕事用',
  'export.csv.foreignAmount': '外貨金額',
  'export.csv.currency': '通貨',
  'export.csv.yes': 'はい',
  'export.csv.no': 'いいえ',
};
