import type { Entry } from '../catalogue-types';
import type { enExport } from '../en-export';

export const zhHansExport: { readonly [Key in keyof typeof enExport]: Entry } = {
  'export.title': '导出',
  'export.row.value': 'CSV · Sheets',
  'export.empty': '还没有可导出的内容。先记一笔支出吧。',
  'export.failed': '没能生成文件。再试一次。',

  'export.csv.date': '日期',
  'export.csv.time': '时间',
  'export.csv.merchant': '商家',
  'export.csv.category': '分类',
  'export.csv.amount': '金额（{code}）',
  'export.csv.status': '状态',
  'export.csv.source': '来源',
  'export.csv.wallet': '付款方式',
  'export.csv.note': '备注',
  'export.csv.detail': '详情',
  'export.csv.forWork': '工作支出',
  'export.csv.foreignAmount': '外币金额',
  'export.csv.currency': '币种',
  'export.csv.yes': '是',
  'export.csv.no': '否',
};
