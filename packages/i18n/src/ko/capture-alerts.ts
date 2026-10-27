import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const koCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': '은행 알림 잡기',
  'native.intents.catchAlert.description':
    'iPhone에서 은행·페이 앱 알림을 읽고, 오간 돈을 6pm 수신함에 넣어 둬요. 인증번호, 실패한 결제, 광고는 건너뛰어요.',
  'native.intents.catchAlert.alertTitle': '제목',
  'native.intents.catchAlert.subtitle': '부제목',
  'native.intents.catchAlert.body': '본문',
  'native.intents.catchAlert.date': '날짜',
  'native.intents.catchAlert.app': '앱',
  'capture.alerts.name': '은행 알림',
  'capture.alerts.sub': '은행·페이 알림이 알아서 기록돼요',
  'capture.alerts.headline': '은행이 알리면, 6pm이 받아 적어요.',
  'capture.alerts.time': '2분 정도, 한 번만',
  'capture.alerts.step1': '단축어에서 알림 자동화 만들기',
  'capture.alerts.step1Chip': '자동화 → 알림',
  'capture.alerts.step2': '은행 앱과 페이 앱 고르기',
  'capture.alerts.step3': '“은행 알림 잡기”를 실행하게 설정',
  'capture.alerts.step3Chip': '은행 알림 잡기',
  'capture.alerts.tip':
    '인증번호, 실패한 결제, 광고는 건너뛰어요. Apple Pay나 이메일로 이미 잡힌 결제는 두 번 들어가지 않아요.',
  'capture.alerts.privacy': '알림은 iPhone 안에서 읽고, 밖으로 나가지 않아요.',
  'capture.alerts.statusTitle': '최근 알림',
  'capture.alerts.none': '아직 은행 알림을 못 봤어요',
  'capture.alerts.noneBody': '설정을 마쳤다면 소액을 결제해서 시험해 보세요.',
  'capture.alerts.seenBody': '자동화가 돌아가고 있어요. 오간 돈은 수신함에서 기다려요.',
  'capture.alerts.cameIn': '{amount} 입금',
  'capture.alerts.skip.code': '인증번호, 건너뜀',
  'capture.alerts.skip.failed': '실패한 결제, 건너뜀',
  'capture.alerts.skip.promo': '광고, 건너뜀',
  'capture.alerts.skip.balance': '잔액 알림, 건너뜀',
  'capture.alerts.skip.security': '보안 알림, 건너뜀',
  'capture.alerts.skip.unread': '결제 아님, 건너뜀',
  'capture.alerts.actionAdd': '6pm 단축어 받기',
  'capture.alerts.actionOpen': '단축어 열기',
  'capture.walk.alerts.s1Title': '자동화를 열고 + 탭하기',
  'capture.walk.alerts.s1Body':
    '단축어에서 보관함, 자동화, + 순서로 탭하세요. “단축어 설명하기”가 보이면 편집을 탭하세요.',
  'capture.walk.alerts.s2Title': '알림 트리거 추가하기',
  'capture.walk.alerts.s2Body':
    '아래쪽 패널에서 자동화, 알림 순서로 탭하세요. “앱에서 알림을 받을 때” 카드가 나타나요.',
  'capture.walk.alerts.s3Title': '은행과 페이 앱 고르기',
  'capture.walk.alerts.s3Body':
    '앱을 탭해 은행을 고르세요. 결제에 쓰는 다른 은행·페이 앱도 +를 탭해 하나씩 추가하세요.',
  'capture.walk.alerts.s4Title': '“은행 알림 잡기” 추가하기',
  'capture.walk.alerts.s4Body':
    '검색을 탭하고 “은행 알림”을 입력한 다음 6pm의 은행 알림 잡기를 탭하세요. 제목, 부제목, 본문, 날짜는 각각 알림의 값으로 설정하세요.',
  'capture.walk.alerts.s5Title': '실행할 때 알림 끄고 돌아가기',
  'capture.walk.alerts.s5Body':
    '트리거의 ›를 탭하세요. 자동화는 켜고 실행할 때 알림은 꺼 두면 알림을 조용히 잡아요. 돌아가면 저장돼요.',
  'capture.walk.alerts.s6Title': '테스트하기',
  'capture.walk.alerts.s6Body':
    '그 앱 중 하나로 소액을 결제해 보세요. 알림이 오면 결제가 수신함에 와 있어요.',
  'capture.walk.alerts.l1Title': '6pm 단축어 추가하기',
  'capture.walk.alerts.l1Body':
    '아래 “6pm 단축어 받기”를 탭한 다음 단축어 추가를 탭하세요. 이름은 “Catch bank alerts”예요.',
  'capture.walk.alerts.l2Body':
    '단축어에서 열고 맨 위의 앱을 탭해 은행을 고른 다음, 다른 은행·페이 앱마다 +를 탭하세요.',
  'capture.walk.alerts.mistake1':
    '제목, 본문, 날짜를 비워 둔 경우. 하나씩 탭해 알림의 값을 고르지 않으면 아무것도 기록되지 않아요.',
  'capture.walk.alerts.mistake2':
    '실행할 때 알림을 켜 둔 경우. 조용히 잡히지 않고 알림마다 한 번 더 울려요.',
  'capture.walk.alerts.mistake3':
    '앱을 하나만 고른 경우. MoMo, ZaloPay까지 쓰는 은행·페이 앱을 모두 체크하세요.',
  'capture.walk.ios.notification': '알림',
  'capture.walk.ios.notificationEx': '“뉴스에서 알림을 받을 때”',
  'capture.walk.ios.whenNotified': '다음 앱에서 알림을 받을 때',
  'capture.walk.ios.notificationTitle': '알림 › 제목',
  'capture.walk.ios.notificationBody': '알림 › 본문',
  'capture.walk.ios.notificationDate': '알림 › 날짜',
  'capture.walk.ios.notificationSummary': 'MB Bank 또는 MoMo에서 알림을 받을 때',
  'capture.walk.ios.alertSearch': '은행 알림',
  'capture.walk.ios.now': '지금',
  'capture.walk.test.alertRow': '은행 알림 · 확인 대기',
  'capture.siri.name': 'Siri에게 말하기',
  'capture.siri.sub': '“6pm에 기록해”라고 한 뒤 뭐였는지 말하기',
  'capture.siri.headline': '6pm을 열지 않고 말로 지출을 기록해요.',
  'capture.siri.time': '설정할 것 없음',
  'capture.siri.step1': '“시리야, 6pm에 기록해”라고 말하기',
  'capture.siri.step1Chip': '6pm에 기록해',
  'capture.siri.step2': 'Siri가 얼마냐고 물으면 뭐에 얼마 썼는지 말하기',
  'capture.siri.step2Chip': '“쌀국수 45k”',
  'capture.siri.step3': '바로 오늘 지출에 들어가요',
  'capture.siri.step3Chip': '오늘',
  'capture.siri.tip':
    'Siri에게는 한국어로 말하면 돼요. Siri 없이 말로 넣고 싶다면 빠른 추가를 길게 누르세요.',
  'capture.backTap.name': '뒷면 탭',
  'capture.backTap.sub': 'iPhone 뒷면을 두 번 두드려 지출 기록',
  'capture.backTap.headline': '뒷면을 톡톡, 빠른 추가가 열려요.',
  'capture.backTap.time': '30초, 한 번만',
  'capture.backTap.step1': '설정에서 손쉬운 사용, 터치, 뒷면 탭 순서로 열기',
  'capture.backTap.step1Chip': '뒷면 탭',
  'capture.backTap.step2': '이중 탭을 고른 다음 6pm의 빠른 추가 선택',
  'capture.backTap.step2Chip': '이중 탭 → 빠른 추가',
  'capture.backTap.step3': 'iPhone 뒷면을 두 번 두드리면 빠른 추가가 열려요',
  'capture.backTap.step3Chip': '빠른 추가',
  'capture.backTap.tip':
    '빠른 추가가 안 보이나요? 단축어에서 +를 탭해 6pm의 빠른 추가를 넣고 저장하세요. 삼중 탭도 돼요.',
  'capture.walk.ios.notificationSubtitle': '알림 › 부제목',
  'capture.walk.ios.notify': '실행할 때 알림',
  'capture.walk.ios.cancel': '취소',
};
