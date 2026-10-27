import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps use the names the iPhone shows in Korean (편집, 위젯 추가, 사용자화, 제어 항목 추가,
// 동작 버튼, 실시간 현황). Siri's phrase stays English, as Siri listens for it.
export const koWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': '위젯과 제어 항목',
  'widgetsGuide.headline': '6pm, 한 번 보거나 한 번 누르면 바로.',
  'widgetsGuide.lede':
    '오늘 쓸 수 있는 돈을 늘 보는 곳에 두고, 앱을 찾지 않고도 QR 스캔이나 빠른 추가를 열어요.',
  'widgetsGuide.lookMax': '내 룩으로 그려져요.',
  'widgetsGuide.lookFree': '무료는 골든 아워로. Max면 내 룩을 입어요.',
  'widgetsGuide.howToAdd': '추가하는 법',
  'widgetsGuide.whenItShows': '언제 보이나요',

  'widgetsGuide.home.title': '홈 화면 위젯',
  'widgetsGuide.home.what': '오늘 쓸 수 있는 돈을 한눈에. 탭하면 6pm이 열려요.',
  'widgetsGuide.home.small': '소형',
  'widgetsGuide.home.medium': '중형',
  'widgetsGuide.home.large': '대형',
  'widgetsGuide.home.smallWhat': '오늘 쓸 수 있는 돈.',
  'widgetsGuide.home.mediumWhat': '그 숫자와 함께, 옆에 QR 스캔과 빠른 추가.',
  'widgetsGuide.home.largeWhat': '남은 돈과 오늘의 최근 지출.',
  'widgetsGuide.home.step1': '홈 화면의 빈 곳을 앱이 흔들릴 때까지 길게 누르세요.',
  'widgetsGuide.home.step2': '위쪽 모서리의 편집을 탭한 다음 위젯 추가를 탭하세요.',
  'widgetsGuide.home.step3': '6pm을 검색하고 원하는 크기로 쓸어 넘긴 다음 위젯 추가를 탭하세요.',

  'widgetsGuide.lock.title': '잠금 화면 위젯',
  'widgetsGuide.lock.what': '잠금을 풀지 않고도 오늘 남은 돈을 봐요.',
  'widgetsGuide.lock.ring': '링',
  'widgetsGuide.lock.card': '카드',
  'widgetsGuide.lock.step1': '잠금 화면을 길게 누른 다음 사용자화를 탭하세요.',
  'widgetsGuide.lock.step2': '잠금 화면을 고른 다음 시계 아래 공간을 탭하세요.',
  'widgetsGuide.lock.step3': '6pm을 탭하고 링이나 카드를 고르세요.',

  'widgetsGuide.control.title': '제어 센터',
  'widgetsGuide.control.what': '쓸어내리고 한 번 탭하면 QR 스캔이나 빠른 추가로.',
  'widgetsGuide.control.needs': 'iOS 18 이상',
  'widgetsGuide.control.step1': '화면 오른쪽 위 모서리에서 아래로 쓸어내리세요.',
  'widgetsGuide.control.step2': '빈 곳을 길게 누른 다음 제어 항목 추가를 탭하세요.',
  'widgetsGuide.control.step3': '6pm을 검색하고 QR 스캔이나 빠른 추가를 고르세요.',
  'widgetsGuide.control.note':
    '이 두 가지는 잠금 화면 아래의 손전등이나 카메라 자리에도 둘 수 있어요.',

  'widgetsGuide.action.title': '동작 버튼',
  'widgetsGuide.action.what': '옆면 버튼을 길게 누르면 QR 스캔이 열려요.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro 이후 모델',
  'widgetsGuide.action.step1': '설정을 열고 동작 버튼으로 가세요.',
  'widgetsGuide.action.step2': '제어로 쓸어 넘긴 다음 아래의 제어 항목 이름을 탭하세요.',
  'widgetsGuide.action.step3': '6pm을 검색하고 QR 스캔이나 빠른 추가를 고르세요.',
  'widgetsGuide.action.note':
    '말로 하고 싶다면? Siri에게 “6pm에 기록해”라고 한 다음 금액을 말해요.',

  'widgetsGuide.live.title': '실시간 현황',
  'widgetsGuide.live.what': 'QR 결제를 기다리는 동안, 그리고 여행 중에 알아서 나타나요.',
  'widgetsGuide.live.step1': 'QR을 스캔하고 은행 앱에서 결제하세요. 결제가 잠금 화면에서 기다려요.',
  'widgetsGuide.live.step2': '돈이 나가면 결제 완료를 탭하세요. 알아서 닫혀요.',
  'widgetsGuide.live.step3': '안 보이나요? 설정에서 6pm을 열고 실시간 현황을 켜세요.',
};
