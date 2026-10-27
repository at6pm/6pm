import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

export const koTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': '여행 모드',
  'travel.settings.sub': '해외에 가면 알아서 켜져요',
  'travel.settings.locationOff': '해외인지 알 수 있게 위치를 허용해 주세요',
  'travel.settings.stale': '{date} 환율',
  'travel.settings.noRates': '오늘 환율을 기다리는 중',
  'travel.pill': '{place} · {symbol}, 아래에 {home}',
  'travel.activity.place': '{place} · 오늘',
  'travel.activity.left': '{amount} 남음',
  'travel.activity.over': '{amount} 초과',
  'travel.activity.of': '{line} 중 · ≈ {vnd}',
  'travel.activity.leftOf': '{line} 중 남음 · ≈ {home}',
  'travel.activity.overOf': '{line} 초과 · ≈ {home}',
  'travel.activity.leftHome': '남음 · ≈ {home}',
  'travel.activity.overHome': '초과 · ≈ {home}',
  'travel.activity.log': '{symbol} 기록',
  'travel.quick.underneath': '약 {amount}',
  'travel.quick.underneathStale': '약 {amount} · {date} 환율',
  'travel.quick.currency': '통화 바꾸기',
  'travel.scan.body':
    '은행 앱으로 결제하세요. 베트남 은행 대부분이 받아 줘요. 6pm은 {symbol} 기준으로 기록하고 아래에 ₫ 금액도 보여 줘요.',
  'travel.scan.bodyAway':
    '그곳에서 결제하던 방법대로 결제하세요. 6pm은 {symbol} 기준으로 기록하고 아래에 {home} 금액도 보여 줘요.',
  'travel.scan.keep': '결제 완료 · {amount} 기록',
  'travel.scan.logIn': '{symbol} 기준으로 기록',
};
