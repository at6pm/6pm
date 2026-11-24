import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const koMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': '친구에게 Max 선물하기',
  'maxCodes.give.sub': 'Max 혜택 링크 보내기',
  'maxCodes.give.message':
    '6pm은 오늘 쓸 수 있는 금액을 알려 주고 지출도 알아서 기록해 줘요. 6pm Max 혜택을 보내요: {url}',
  'maxCodes.give.failed': '공유를 열 수 없어요. 다시 시도해 주세요.',
  'maxCodes.redeem': '코드 사용하기',
  'maxCodes.head.friend': '친구가 Max를 선물했어요.',
  'maxCodes.head.code': '나만의 Max 혜택이에요.',
  'maxCodes.playHint': 'Google Play에서 결제 수단을 탭한 다음 코드 사용을 선택하세요.',
  'maxCodes.playHint.code':
    '코드를 복사했어요: {code}. Google Play에서 결제 수단을 탭한 다음 코드 사용을 선택하세요.',
};
