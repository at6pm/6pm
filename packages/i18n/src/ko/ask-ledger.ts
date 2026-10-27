import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// Each {range} is a time phrase that needs no particle (오늘, 이번 주, 월급날 이후), so it opens the
// sentence. Spends are counted with 건, visits with 번.
export const koAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': '오늘',
  'ask.range.yesterday': '어제',
  'ask.range.thisWeek': '이번 주',
  'ask.range.lastWeek': '지난주',
  'ask.range.thisCycle': '월급날 이후',
  'ask.range.lastCycle': '지난 월급 주기',
  'ask.range.thisMonth': '이번 달',
  'ask.range.lastMonth': '지난달',
  'ask.range.last7Days': '최근 일주일',
  'ask.range.last30Days': '최근 한 달',
  'ask.range.dates': '{from}부터 {to}까지',

  'ask.answer.spent': { other: '{range} {total} 썼어요. 지출 {count}건이에요.' },
  'ask.answer.spentOn': { other: '{range} {category}에 {total} 썼어요. {count}번이에요.' },
  'ask.answer.spentAt': { other: '{range} {merchant}에서 {total} 썼어요. 방문 {count}번이에요.' },
  'ask.answer.spentNone': '{range} 쓴 돈이 없어요.',
  'ask.answer.spentNoneOn': '{range} {category}에 쓴 돈이 없어요.',
  'ask.answer.spentNoneAt': '{range} {merchant}에서 쓴 돈이 없어요.',
  'ask.answer.breakdown': '{range} 쓴 {total} 중 가장 많이 나간 곳은 {top}.',
  'ask.answer.compared.up': '{range} {now}. {against} {before}에서 늘었어요.',
  'ask.answer.compared.down': '{range} {now}. {against} {before}에서 줄었어요.',
  'ask.answer.compared.same': '거의 비슷해요: {range} {now}, {against} {before}.',
  'ask.answer.listed': { other: '{range} 지출 {count}건, 모두 {total}.' },
  'ask.answer.listedMore': '그리고 {more}건 더 있어요.',
  'ask.answer.listedNone': '{range} 그런 지출은 없어요.',
  'ask.answer.bills': { other: '월급날 전 남은 고정비 {count}건, 모두 {total}.' },
  'ask.answer.billsNone': '월급날 전에 남은 고정비가 없어요.',
  'ask.answer.how': '지금 눈에 띄는 것들이에요.',
  'ask.answer.howNothing': '아직은 조용해요. 눈에 띄는 게 없어요.',
  'ask.answer.noSuchCategory': '{category} 카테고리를 못 찾았어요. 내 카테고리 중에서 물어보세요.',
  'ask.answer.noRange': '그 기간엔 아직 볼 게 없어요.',
  'ask.answer.chat': '언제든지요. 돈 얘기라면 언제든 물어보세요.',
  'ask.answer.partial': '6pm이 {since}부터 기록한 것만 계산했어요.',
  'ask.row.total': '합계',
  'ask.row.before': '이전',
  'ask.answer.goalPace.months': {
    other:
      '미래의 나에게 매달 {monthly}씩이면, {what}에 필요한 {amount}까지 약 {count}개월, {month}쯤이에요.',
  },
  'ask.answer.goalPace.years': {
    other:
      '미래의 나에게 매달 {monthly}씩이면, {what}에 필요한 {amount}까지 약 {count}년, {month}쯤이에요.',
  },
  'ask.answer.goalPace.note': '그것만을 위한 저금통을 만들면 그 돈을 따로 떼어 둘 수 있어요.',
  'ask.answer.goalNoPace':
    '아직 매달 미래의 나에게 가는 돈이 없어서, {what}에 필요한 {amount}까지 속도를 계산할 수 없어요. 매달 조금씩만 넣어도 시작돼요.',
  'ask.answer.goalAmount':
    '{what}, 대략 얼마쯤이에요? “{example}”처럼 가격을 알려 주면 계산해 드릴게요.',
  'ask.row.reachedBy': '예상 시점',
};
