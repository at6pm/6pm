import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const zhHansBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': '银行和钱包',
  'banks.sub': '这样 6pm 才认得它们的小票和二维码。用到的都选上。',
  'banks.search': '搜索银行和钱包',
  'banks.clear': '清除搜索',
  'banks.suggested': '为你推荐',
  'banks.yours': '你的和推荐的',
  'banks.all': '所有银行和钱包',
  'banks.none': '没有与“{query}”匹配的银行或钱包。',
  'banks.yoursOnly': '你的',
  'banks.typeHint': '搜索你的银行或钱包，或者输入名称来添加。',
  'banks.byName': '按名称添加',
  'banks.kind.bank': '银行',
  'banks.kind.wallet': '电子钱包',
};
