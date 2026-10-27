import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// Ask asks before it saves anything. The spoken examples stay in Vietnamese (“trà sữa 45k”,
// “10tr”), the way people in Vietnam actually log a spend, and the way the phone reads it.
export const koAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': '추가',
  'ask.action.notNow': '나중에',
  'ask.action.confirmSpend': '{category}에 {name} {amount} 추가할까요?',
  'ask.action.added': '추가했어요. {name} {amount}, 오늘 지출로 계산돼요.',
  'ask.action.cancelled': '알겠어요, 바뀐 건 없어요.',
  'ask.action.failed': '저장되지 않았어요. 빠른 추가로 해 보세요.',
  'ask.action.confirmPot': '{name} 저금통: {goal}. 만들까요?',
  'ask.action.confirmPotBy': '{name} 저금통: {month}까지 {goal}. 만들까요?',
  'ask.action.setUp': '만들기',
  'ask.action.potLocked':
    '무료로는 내 저금통을 하나만 쓸 수 있는데, 이미 사용 중이에요. Max면 더 만들 수 있어요.',
  'ask.action.seeMax': 'Max 보기',
  'ask.action.potGoal': '{name}, 얼마가 필요해요? “10tr”처럼 알려 주세요.',
  'ask.action.showMe': '방법 보기',
  'ask.action.openQuickAdd': '빠른 추가 열기',
  'ask.howTo.ways':
    '방법은 여섯 가지예요: 빠른 추가(입력하거나 말하기), 은행 영수증을 6pm으로 공유, 영수증 이메일 전달, VietQR 스캔해서 결제, 저절로 들어오는 Apple Pay 결제, 위젯과 제어 항목. 6pm이 잡은 지출은 마감 때까지 수신함에서 기다려요.',
  'ask.howTo.quickAdd':
    '빠른 추가는 “trà sữa 45k”처럼 입력하거나 말로 한 지출을 받아요. 아니면 여기서 그냥 말해 주세요: “vừa ăn phở 50k”.',
  'ask.howTo.dailyNumber':
    '하루 금액은 고정비, 미래의 나, 저금통을 빼고 이번 월급 주기에 남은 여윳돈을 월급날까지 남은 날로 나눈 돈이에요. 덜 쓰면 내일 금액이 늘고, 넘기면 내일 금액이 조금 줄어요.',
  'ask.howTo.negative':
    '이번 주기 지출이 여윳돈보다 많으면 0 아래로 내려가요. 큰일 나는 건 없어요. 플랜이 남은 날들에 나눠서 메워요. 며칠 덜 쓰거나, 플랜에서 저금통 돈을 조금 꺼내세요.',
  'ask.howTo.pot':
    '저금통은 여행이나 설처럼 한 가지를 위해 따로 모아 두는 돈이에요. 6pm이 매달 조금씩 넣고 하루 금액에서는 빼 둬서, 필요할 때 그대로 있어요.',
  'ask.howTo.close':
    '저녁 6시에 하루를 마감해요. 잡힌 지출을 맞다고 하거나 넘기고, 오늘 어디쯤 왔는지 확인하세요. 놓쳐도 사라지는 건 없어요. 잡힌 지출은 정할 때까지 기다리고, 계산에도 들어가요.',
  'ask.howTo.budget':
    '6pm에는 카테고리별 예산이 없어요. 하루 금액이 곧 예산이에요. 고정비, 미래의 나, 저금통은 이미 빠져 있어요. 어떤 데 덜 쓰고 싶다면 플랜에서 저금통을 만들거나 미래의 나에게 더 주세요.',
};
