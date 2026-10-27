import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const jaBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': '銀行とウォレット',
  'banks.sub': '6pmがレシートやQRコードを読めるように。使っているものを全部選んでください。',
  'banks.search': '銀行・ウォレットを検索',
  'banks.clear': '検索をクリア',
  'banks.suggested': 'おすすめ',
  'banks.yours': '登録済みとおすすめ',
  'banks.all': 'すべての銀行とウォレット',
  'banks.none': '「{query}」に一致する銀行・ウォレットはありません。',
  'banks.yoursOnly': '登録済み',
  'banks.typeHint': '銀行やウォレットを検索するか、名前を入力して追加してください。',
  'banks.byName': '名前で追加',
  'banks.kind.bank': '銀行',
  'banks.kind.wallet': 'ウォレット',
};
