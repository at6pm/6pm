import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// Ask speaks as 6pm in 해요체, answering first and showing the maths after. "여윳돈" is free
// money, "미래의 나" is Future you, a pot is "저금통".
export const koAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': '6pm에게 묻기',
  'ask.sub': '써도 될지, 만약에, 언제 모일지',
  'ask.back': '뒤로',
  'ask.intro':
    '써도 되는지, 큰 지출이 내 하루를 어떻게 바꾸는지, 저금통이 언제 다 차는지 물어보세요. 계산 과정도 보여 드릴게요.',
  'ask.try': '이렇게 물어보세요',
  'ask.placeholder': '물어보거나 그냥 말하세요…',
  'ask.send': '보내기',
  'ask.speak': '말로 묻기',
  'ask.listening': '듣고 있어요…',
  'ask.suggest.afford': '토요일에 {amount}짜리 저녁 먹어도 돼?',
  'ask.suggest.weekend': '이번 주말엔 얼마 쓸 수 있어?',
  'ask.suggest.spend': '{amount}짜리 재킷 사면 어떻게 돼?',
  'ask.suggest.pot': '{pot} 저금통은 언제 다 차?',
  'ask.suggest.save': '저축을 더 해야 할까?',
  'ask.meter': '오늘 무료 질문 {total}개 중 {left}개 남음',
  'ask.unlimitedWith': '무제한으로 쓰려면',
  'ask.locked.title': '오늘 질문 {total}개를 다 썼어요',
  'ask.locked.sub': '내일 다시 오거나, Max로 무제한',
  'ask.locked.cta': 'Max 받기',
  'ask.bar.now': '지금',
  'ask.bar.after': '이후',
  'ask.bar.perDay': '하루 {amount}',
  'ask.bar.nothing': '남는 돈 없음',
  'ask.row.free': '월급날까지 여윳돈',
  'ask.row.this': '이 지출',
  'ask.row.leftPerDay': '남는 돈, 하루',
  'ask.row.safeToday': '오늘 쓸 수 있는 돈',
  'ask.row.tomorrow': '내일',
  'ask.row.futureYou': '매달 미래의 나에게',
  'ask.row.moving': '더 옮길 돈',
  'ask.row.inPot': '저금통 잔액',
  'ask.row.goal': '목표',
  'ask.row.perMonth': '매달',
  'ask.answer.fitsToday':
    '네, 여유 있어요. 오늘 쓸 수 있는 {safe} 안에 들어가니까 내일은 그대로예요.',
  'ask.answer.fits': '네. 월급날까지 남은 날들의 하루 금액이 {from}에서 {to} 수준으로 바뀌어요.',
  'ask.answer.tight': '할 수는 있지만 빠듯해요. 그다음 날들이 {from}에서 {to} 수준으로 줄어요.',
  'ask.answer.tight.pots': '저금통에서 {take} 꺼내면 하루 {withPots} 유지할 수 있어요.',
  'ask.answer.notThisMonth':
    '이번 달은 어려워요. 여윳돈을 전부 합친 것보다 많아요. {payday} 월급날 이후엔 괜찮아요.',
  'ask.answer.notThisMonth.pots': '아니면 일부를 저금통에서 꺼내도 돼요.',
  'ask.answer.weekend.two': '그 전날들이 플랜대로 가면, {first}·{second} 이틀 동안 약 {total}.',
  'ask.answer.weekend.one': '그 전날들이 플랜대로 가면, {first}에 약 {total}.',
  'ask.answer.weekend.none': '주말 전에 {payday} 월급날이 와서, 그때부터 새 금액으로 시작해요.',
  'ask.answer.saveMore': '미래의 나에게 {amount} 더 옮기면 월급날까지 하루에 {perDay} 정도 줄어요.',
  'ask.answer.saveMore.none': '미래의 나에게 {amount} 더 옮겨도 하루 금액은 거의 그대로예요.',
  'ask.answer.saveMore.note': '플랜에서 바로 할 수 있어요.',
  'ask.answer.potFull': '매달 {monthly}씩 넣으면 {pot} 저금통은 {month}까지 다 차요.',
  'ask.answer.potFull.done': '{pot} 저금통은 이미 다 찼어요.',
  'ask.answer.potFull.idle':
    '지금은 매달 {pot} 저금통에 들어가는 돈이 없어서, 저절로 차지는 않아요.',
  'ask.answer.noSuchPot':
    '{pot} 저금통을 못 찾았어요. 내 저금통 중 하나를 물어보거나, 플랜에서 만들어 보세요.',
  'ask.answer.noPots': '아직 저금통이 없어요. 플랜에서 하나 만들면 언제 다 차는지 알려 드릴게요.',
  'ask.answer.today': '오늘은 {safe} 쓸 수 있어요. 내일 금액은 {tomorrow}.',
  'ask.answer.today.used': '오늘 금액은 다 썼어요. 내일 금액은 {tomorrow}.',
  'ask.answer.help':
    '써도 되는지, 큰 지출이 하루를 어떻게 바꾸는지, 저금통이 언제 다 차는지 알려 드릴 수 있어요. “토요일에 {amount} 써도 돼?”처럼 물어보세요.',
  'ask.error': '문제가 생겨서 답하지 못했어요. 다시 시도해 주세요.',
  'ask.answer.offline': '서버에 연결하지 못해서, 지금은 간단한 질문만 이해할 수 있어요.',
};
