import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// Small talk in the companion's voices: soft is warm 해요체, cheeky and roast drop to light 반말,
// plain and the serious topics stay plain 해요체. Vietnam's hotlines stay as they are.
export const koAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': '안녕하세요! 돈 이야기 하고 싶을 땐 언제든 여기 있어요.',
  'ask.chat.greeting.cheeky': '하이 하이. 돈 얘기면 뭐든 물어봐, 네 숫자는 내가 다 알아.',
  'ask.chat.greeting.roast': '아, 너구나. 얼마나 심각한지 물어보러 왔어?',
  'ask.chat.greeting.plain': '안녕하세요. 지출, 고정비, 저금통에 대해 물어보세요.',
  'ask.chat.thanks.soft': '언제든지요. 오늘 하루 잘 챙겨요.',
  'ask.chat.thanks.cheeky': '언제든! 수고비는 제때 마감한 하루로 받을게.',
  'ask.chat.thanks.roast': '나한테 고마워하지 마. 거의 지킬 뻔한 예산한테 고마워해.',
  'ask.chat.thanks.plain': '천만에요.',
  'ask.chat.offTopic.soft': '그건 제 분야 밖이에요. 그래도 돈 얘기라면 전부 들어 줄게요.',
  'ask.chat.offTopic.cheeky': '그건 내 담당 아니야. 대신 네 돈이 어디로 갔는지 물어봐 👀',
  'ask.chat.offTopic.roast': '난 가계부지 검색 엔진이 아니야. 지출 얘기나 물어봐.',
  'ask.chat.offTopic.plain': '6pm 속 내 돈에 관한 것만 도와드릴 수 있어요.',
  'ask.chat.identity':
    '저는 6pm 속 짝꿍이에요. 제가 드리는 숫자는 전부 내 지출을 바탕으로 이 폰에서 계산돼요. 저는 사람이 아니라 프로그램이에요.',
  'ask.chat.privacy':
    '저는 은행 계좌를 볼 수 없어요. 6pm에 있는 것만 알고, 그건 폰에만 남아요. 질문을 읽을 땐 저희 서버가 질문과 카테고리·저금통 이름을 보고, 한마디를 쓸 땐 그 안에 들어갈 몇 가지 사실만 봐요.',
  'ask.chat.venting.soft': '마음이 많이 무겁겠어요. 혼자 짊어지지 않아도 돼요.',
  'ask.chat.venting.cheeky': '힘든 날이네. 숨 한번 쉬자: 숫자일 뿐, 판결이 아니야.',
  'ask.chat.venting.plain': '돈 스트레스는 진짜예요.',
  'ask.chat.goingRight': '잘 되고 있는 것 하나:',
  'ask.chat.freshStart': '내일은 새 한도로 시작해요.',
  'ask.chat.roast.soft': '그럼 살살 하나만:',
  'ask.chat.roast.cheeky': '좋아, 네가 원한 거다.',
  'ask.chat.roast.roast': '마음의 준비 해.',
  'ask.chat.roast.plain': '눈에 띄는 것 하나:',
  'ask.chat.roastNothing.soft': '놀릴 게 없어요. 정말 잘하고 있어요.',
  'ask.chat.roastNothing.cheeky': '찾아봤는데, 솔직히? 놀릴 게 없어. 얄밉게.',
  'ask.chat.roastNothing.roast': '놀려 주려 했는데 건더기가 하나도 없네. 너무해.',
  'ask.chat.roastNothing.plain': '지금은 눈에 띄는 게 없어요.',
  'ask.chat.hype.soft': '이 말은 꼭 들어야 해요:',
  'ask.chat.hype.cheeky': '칭찬 모드 ON:',
  'ask.chat.hype.roast': '좋아. 인정할 건 인정하지:',
  'ask.chat.hype.plain': '잘 되고 있는 것:',
  'ask.chat.hypeNothing.soft': '와서 확인한 것만으로도 충분해요.',
  'ask.chat.hypeNothing.cheeky': '가계부 앱을 제 발로 열었어. 레전드.',
  'ask.chat.hypeNothing.roast': '여기 온 것만 해도 대부분보다 낫지. 좀 뿌듯하네.',
  'ask.chat.hypeNothing.plain': '계속해 보세요. 쌓이면 달라져요.',
  'ask.chat.distress':
    '그렇게 느끼고 있다니 정말 마음이 아파요. 혼자 견디지 않아도 돼요. 믿을 수 있는 사람과 이야기하거나, Ngày Mai 상담전화 096 306 1414(수요일~일요일, 오후 1시~8시 30분)로 연락하세요. 지금 위험한 상황이라면 115로 전화하세요.',
  'ask.chat.investing':
    '무엇에, 언제 투자하라고는 말씀드릴 수 없어요. 그건 자격 있는 전문가의 몫이에요. 대신 매달 남는 돈이나 저금통이 얼마나 빨리 차는지는 보여 드릴 수 있어요.',
  'ask.chat.unsafe':
    '그건 도와드릴 수 없어요. 돈이 빠듯하다면 월급날까지 남은 돈이나 저금통으로 감당할 수 있는 걸 보여 드릴게요. 불법 대부업자가 협박한다면 113으로 경찰에 신고하세요.',
};
