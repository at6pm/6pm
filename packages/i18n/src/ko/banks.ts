import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const koBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': '은행과 지갑',
  'banks.sub': '6pm이 영수증과 QR 코드를 알아볼 수 있게요. 쓰는 건 전부 고르세요.',
  'banks.search': '은행, 지갑 검색',
  'banks.clear': '검색 지우기',
  'banks.suggested': '추천',
  'banks.yours': '내 것과 추천',
  'banks.all': '모든 은행과 지갑',
  'banks.none': '“{query}”에 맞는 은행이나 지갑이 없어요.',
  'banks.yoursOnly': '내 것',
  'banks.typeHint': '은행이나 지갑을 검색하거나, 이름을 입력해 추가하세요.',
  'banks.byName': '이름으로 추가',
  'banks.kind.bank': '은행',
  'banks.kind.wallet': '전자지갑',
};
