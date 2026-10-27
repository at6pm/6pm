import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

// Plain, exact wording about what leaves the phone; "Claude" and "AI" keep their names.
export const koPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': '6pm은 어디서 생각할까요?',
  'privacy.ai.sub': '질문과 짝꿍의 말이 만들어지는 곳이에요. 설정에서 언제든 바꿀 수 있어요.',
  'privacy.ai.server.title': 'Claude와 함께, 저희 서버에서',
  'privacy.ai.server.text':
    '가장 똑똑한 답과 베트남어를 정확히 알아듣는 음성 인식. 폰 밖으로 나가는 건 질문이나 몇 가지 사실뿐, 지출 목록은 절대 나가지 않아요.',
  'privacy.ai.server.tag': '추천',
  'privacy.ai.device.title': '이 iPhone에서만',
  'privacy.ai.device.text':
    'AI 관련 정보는 폰 밖으로 나가지 않아요. 모델은 Wi‑Fi로 한 번만 내려받아요.',
  'privacy.ai.device.unavailable': '이 iPhone은 자체 모델을 돌릴 메모리가 부족해요.',
  'privacy.ai.models': '모델',
  'privacy.model.fast': '가장 빠르고 가벼움',
  'privacy.model.words': '문장이 가장 자연스러움',
  'privacy.model.reading': '질문 이해가 가장 정확함',
  'privacy.model.size': '{size}GB',
  'privacy.model.download': '다운로드',
  'privacy.model.downloading': '{percent}%',
  'privacy.model.verifying': '확인 중',
  'privacy.model.ready': '준비됨',
  'privacy.model.failed': '다시 시도',
  'privacy.model.delete': '삭제',
  'privacy.model.later': '다운로드되는 동안 계속 진행해도 돼요.',
  'settings.ai': 'AI',
  'settings.ai.server': '저희 서버에서',
  'settings.ai.device': '이 iPhone에서',
  'privacy.leaves.title': '폰 밖으로 나가는 것',
  'privacy.leaves.server.ask': '질문을 읽기 위한 질문 내용과 카테고리·저금통 이름',
  'privacy.leaves.server.lines': '짝꿍의 한마디에 들어가는 몇 가지 사실',
  'privacy.leaves.server.receipts': '폰이 읽지 못한 영수증 사진',
  'privacy.leaves.server.voice': '텍스트로 바꾸기 위한, 말하는 동안의 음성',
  'privacy.leaves.device.none': 'AI로 나가는 건 없어요. 모든 처리는 이 iPhone에서 해요.',
  'privacy.leaves.device.network': '환율(날짜만 보내요), 앱 업데이트, 구매는 여전히 인터넷을 써요.',
  'privacy.leaves.device.emails': '이 모드에서는 영수증 이메일이 꺼져요.',
};
