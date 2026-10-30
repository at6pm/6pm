import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: "이 폰" for this phone, Google Play for the store, 갤러리 for pictures, and
// a backup key that stays on the phone. No Apple product or Apple app name appears here.
export const koAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    '방법은 세 가지예요: 빠른 추가(입력하거나 말하기), QR이나 영수증 스캔, 영수증 이메일 전달. 6pm이 잡은 지출은 마감 때까지 수신함에서 기다려요.',
  'capture.share.headline':
    '영수증을 이미지로 저장한 다음 스캔에서 골라 주세요. 금액은 제가 읽을게요.',
  'capture.wallet.headline':
    '이 폰에는 Apple Pay가 없어요. 카드 영수증 이메일을 전달하면 알아서 들어와요.',
  'capture.widgets.headline':
    '이 폰에는 6pm 위젯이 없어요. 스캔 버튼을 길게 누르면 빠른 추가가 열려요.',

  'backup.row.on': '암호화됨 · {when}',
  'backup.status.sub': { other: '{count}개 항목 · 암호화됨. 백업 없이도 6pm은 잘 돌아가요.' },
  'backup.status.neverSub': '암호화됨. 백업 없이도 6pm은 잘 돌아가요.',
  'backup.off.sub':
    '이 폰을 떠나기 전에 암호화돼요. 키는 이 폰에만 있어서 저희는 아무것도 읽을 수 없어요.',
  'backup.tooLarge': '지난 백업은 너무 커서 보내지 못했어요. 모든 기록은 이 폰에 그대로 있어요.',
  'backup.note':
    '하루에 한 번, 마감한 뒤에 백업해요. 키는 이 폰을 떠나지 않으니, 백업은 새 폰이 아닌 이 폰에서만 열 수 있어요.',
  'backup.paused': 'Max가 없어서 백업이 멈췄어요. 마지막 백업은 암호화된 채 안전하게 있어요.',
  'backup.found.title': '이 폰의 백업이 이미 있어요.',
  'backup.found.sub': '이전 설치에서 만든 백업이에요. 여기서 백업하면 그 백업을 덮어써요.',
  'backup.found.restoreConfirm': '한 번 더 탭하면 이 폰의 기록을 덮어써요',
  'backup.found.replace': '이 폰 기록으로 덮어쓰기',
  'backup.restore.sub': { other: '{count}개 항목 · 암호화됨.' },
  'backup.restore.none': '이 폰의 백업을 찾지 못했어요.',
  'backup.restore.wrongKey': '이 폰에 있는 키로는 이 백업을 열 수 없어요.',
  'backup.error.keychain': '이 폰이 키를 저장하지 못해서 백업하지 않았어요. 다시 시도하세요.',
  'backup.error.tooLarge': '백업이 너무 커서 보낼 수 없어요. 모든 기록은 이 폰에 그대로 있어요.',

  'capture.email.sub': '이 폰에는 전달 주소가 없어요',
  'capture.scan.tip': '스캔할 코드가 없을 땐 스캔 버튼을 길게 눌러 빠른 추가를 여세요.',
  'onboarding.catch.add.body':
    '스캔 버튼을 길게 눌러 빠른 추가를 열고 “커피 {amount}”라고 말해 보세요.',
  'today.list.empty': '아직 잡힌 지출이 없어요. QR이나 영수증을 스캔하거나, 쓸 때 +를 탭하세요.',

  'looks.restore.none': '이 Google 계정에는 복원할 구매가 없어요.',
  'looks.restore.failed': 'Google Play에 연결하지 못했어요. 다시 시도하세요.',
  'looks.legal':
    '룩은 Google 계정으로 한 번 구매하는 상품이에요. Max는 구독이며 Google Play에서 언제든 해지할 수 있어요. 가격은 Google Play에 표시된 대로예요.',
  'look.buying': 'Google Play 응답 기다리는 중…',
  'look.noteStoreOff': 'Google Play가 응답하지 않아서 지금은 이 룩을 살 수 없어요.',
  'max.cta.waiting': 'Google Play 응답 기다리는 중…',
  'max.terms.storeOff': '지금은 Max를 구매할 수 없어요: Google Play가 응답하지 않아요.',
  'max.sub.backup': '암호화 백업, 전체 기록, CSV와 Sheets.',
  'max.note.backup': '암호화 백업, CSV와 Sheets',
  'max.welcome.win.more': '저금통, 여행, 이어북',

  'privacy.ai.device.title': '이 폰에서만',
  'privacy.ai.device.unavailable': '이 폰은 자체 모델을 돌릴 메모리가 부족해요.',
  'settings.ai.device': '이 폰에서',
  'privacy.leaves.device.none': 'AI로 나가는 건 없어요. 모든 처리는 이 폰에서 해요.',
  'receiptEmail.deviceMode': 'AI를 이 폰에서만 쓰는 동안 꺼짐',
  'receiptEmail.deviceMode.body':
    '영수증 이메일은 저희 서버가 메일을 읽어야 해서, 6pm이 AI를 이 폰에서만 쓰는 동안은 꺼져 있어요. 대신 영수증을 스캔하세요.',
  'settings.privacyBody':
    '내 돈 기록은 암호화된 채 이 폰에 남아요. 6pm에게 묻기의 질문을 읽고 짝꿍의 말을 쓰기 위해, 6pm은 AI 서비스인 Anthropic에 질문이나 하루에 관한 몇 가지 사실(금액, 장소, 카테고리 이름)을 보내요. 지출 목록은 절대 보내지 않아요. 폰이 읽지 못한 영수증 사진도 그곳으로 가요. Anthropic은 이 데이터로 학습하지 않으며 30일 안에 삭제해요. 지출을 말로 입력하면 음성은 텍스트 변환을 위해 Deepgram으로 가요. 위의 AI 항목에서 이 모든 걸 이 폰 안에서만 처리하게 할 수 있어요. 백업은 켰을 때만 종단간 암호화되어 나가요. 오류 보고서는 금액, 이름, 메모 없이 Sentry로 가고, 구매는 RevenueCat이 처리해요.',

  'scan.handoff.store': '이 폰에 {wallet} 앱이 없어요',
  'scan.handoff.savedQr':
    'QR을 갤러리에 저장했어요. 은행 앱에서 갤러리 이미지로 스캔하세요. 돌아오면 물어볼게요.',
  'sharing.saved': '갤러리에 저장했어요.',
  'sharing.photosOff': '6pm의 사진 접근이 꺼져 있어요.',

  'startup.failedSub': '사라진 건 없어요. 다시 시도해 보고, 계속 이러면 폰을 다시 시작하세요.',
  'voice.unavailable': '음성 입력에는 이 폰의 {language} 받아쓰기가 필요해요',

  'onboarding.privacy.phone': '이 폰에만',
  'onboarding.privacy.backupSub': '이 폰을 떠나지 않는 키로 잠가요',

  'capture.alerts.time': '처음 한 번, 10초',
  'capture.alerts.step1': '알림 접근 권한에서 6pm 켜기',
  'capture.alerts.step1Chip': '알림 접근 권한 → 6pm',
  'capture.alerts.step2': '은행과 지갑 앱의 알림을 켜 두기',
  'capture.alerts.step3': '결제마다 수신함에서 마감을 기다려요',
  'capture.alerts.step3Chip': '수신함',
  'capture.alerts.tip':
    '인증번호, 실패한 결제, 프로모션은 건너뛰어요. 이메일로 이미 잡힌 결제는 두 번 들어가지 않아요.',
  'capture.alerts.privacy':
    '이 폰 안에서 읽고 어디로도 보내지 않아요. 6pm은 은행과 지갑의 알림만 읽어요.',
  'capture.alerts.actionAdd': '알림 접근 허용',
  'capture.alerts.actionOpen': '알림 접근 설정',
};
