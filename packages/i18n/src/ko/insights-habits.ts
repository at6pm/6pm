import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the companion's other lines: casual 해요체, light 반말 in cheeky and roast. The day's
// line is "한도"; cheeky and roast tease the habit and end on a way forward.
export const koInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': '한 푼도 안 쓴 하루: {kept} 전부 그대로 남았어요.',
  'insight.noSpendDay.soft.2': '무지출 데이. {kept} 지켰어요, 조용히 멋지게.',
  'insight.noSpendDay.cheeky.1': '지출 0, {kept} 그대로. 지갑도 하루 쉬었네.',
  'insight.noSpendDay.cheeky.2': '하루 종일 지출 없음. {kept} 한도가 고맙대.',
  'insight.noSpendDay.roast.1': '지출 0, {kept} 그대로. 누구세요? 계속 있어 줄래요?',
  'insight.noSpendDay.roast.2': '지출 한 건도 없이 {kept} 지킴. 가게들도 살아남을 거야.',
  'insight.noSpendDay.plain': '마지막으로 마감한 날은 지출이 없었어요. 한도 중 {kept} 남겼어요.',

  'insight.noSpendStreak.soft.1': '{days}일 연속 조용한 날: {kept} 그대로 남았어요.',
  'insight.noSpendStreak.soft.2': '{days}일째 지출 없음. {kept} 고스란히 남았어요.',
  'insight.noSpendStreak.cheeky.1': '{days}일 동안 지출 0. 지갑이 슬슬 의심하는 중.',
  'insight.noSpendStreak.cheeky.2': '{days}일 연속 무지출. {kept} 푹 쉬는 중.',
  'insight.noSpendStreak.roast.1': '{days}일 동안 지출 0. 단골 카페가 걱정하고 있어.',
  'insight.noSpendStreak.roast.2': '{days}일 무지출, {kept} 그대로. 너무 이상하게 굴진 마.',
  'insight.noSpendStreak.plain': '{days}일 연속 지출 없이 마감했어요. {kept} 남겼어요.',

  'insight.backUnder.soft.1': '초과한 다음 날 다시 한도 안으로: 여유 {spare}. 잘했어요.',
  'insight.backUnder.soft.2': '하루 넘고, 다음 날은 {spare} 남기고. 이게 리듬이죠.',
  'insight.backUnder.cheeky.1': '역전 드라마: 다시 한도 안, 여유 {spare}.',
  'insight.backUnder.cheeky.2': '하루는 초과, 다음 날은 {spare} 여유. 밸런스 좋네.',
  'insight.backUnder.roast.1': '초과한 바로 다음 날 {spare} 남김. 사과 받아 줄게.',
  'insight.backUnder.roast.2': '여유 {spare} 남기고 한도 안 복귀. 기다리던 컴백이야.',
  'insight.backUnder.plain': '초과한 다음 날 다시 한도 안으로 들어왔어요. 여유 {spare}.',

  'insight.logGap.soft.1': '{since} 이후로 기록이 없어요. 조용했나요, 바빴나요?',
  'insight.logGap.soft.2': '{days}일째 기록된 지출이 없어요. 추가할 거 있어요?',
  'insight.logGap.cheeky.1': '{since} 이후 기록 없음. 수행 중이야, 그냥 바빴어?',
  'insight.logGap.cheeky.2': '{days}일째 기록 없음. 지갑이 휴가 갔나?',
  'insight.logGap.roast.1': '{since} 이후로 아무것도 없네. 진짜 없던 거야, 안 적은 거야?',
  'insight.logGap.roast.2': '{days}일째 침묵. 커피 한 잔도 지출이야. 적으면 퉁쳐 줄게.',
  'insight.logGap.plain': '{since} 이후 기록된 지출이 없어요.',

  'insight.weekendHeavy.soft.1':
    '요즘 주말엔 하루 {weekend}, 평일엔 {weekday} 정도 써요. 토요일 전에 한번 생각해 봐요.',
  'insight.weekendHeavy.soft.2': '주말은 하루 {weekend}, 평일은 {weekday}. 살살 가요.',
  'insight.weekendHeavy.cheeky.1':
    '평일: 하루 {weekday}. 주말: {weekend}. 토요일이 너한테 계획이 있대.',
  'insight.weekendHeavy.cheeky.2':
    '주말 하루 평균 {weekend}, 평일 {weekday}. 주말이 다가온다. 준비됐어?',
  'insight.weekendHeavy.roast.1':
    '평일 {weekday}, 주말 {weekend}. 주말이 계속 이기는 중. 무승부로 할래?',
  'insight.weekendHeavy.roast.2': '주말: 하루 {weekend}. 평일: {weekday}. 이번 주말에 리매치 어때?',
  'insight.weekendHeavy.plain': '최근 4주: 주말 하루 {weekend}, 평일 하루 {weekday}.',

  'insight.recordDay.soft.1':
    '오늘 {amount}, {days}일 중 가장 큰 날이에요. 괜찮아요, 내일은 리셋이에요.',
  'insight.recordDay.soft.2': '오늘 {amount}, 최근 {days}일 중 최고예요. 플랜이 알아서 맞춰 줘요.',
  'insight.recordDay.cheeky.1': '오늘 {amount}. 신기록인데, 원하던 차트는 아니네. 내일은 리셋.',
  'insight.recordDay.cheeky.2': '신기록: {amount}, 최근 {days}일 중 최고. 2연속은 참자.',
  'insight.recordDay.roast.1':
    '오늘 {amount}, 최근 {days}일 중 최고. 대담한데. 내일 앙코르는 작게.',
  'insight.recordDay.roast.2': '하루에 {amount}, {days}일 신기록. 액자에 걸고, 이제 쉬자.',
  'insight.recordDay.plain': '오늘 쓴 {amount}, 최근 {days}일 중 하루 최대 지출이에요.',

  'insight.likelySubscription.soft.1':
    '{merchant}에서 매달 {amount} 정도 나가요. 고정비로 등록할까요?',
  'insight.likelySubscription.soft.2':
    '{merchant}에 {amount}, {months}개월째예요. 고정비로 넣어 둘까요?',
  'insight.likelySubscription.cheeky.1':
    '또 {merchant}, {amount}, 시계처럼 정확하네. 구독인 거 다 알아. 고정비로 등록할래?',
  'insight.likelySubscription.cheeky.2':
    '{merchant}에 {amount}씩 {months}개월. 아직 쓰고 있어? 고정비로 넣어 둬.',
  'insight.likelySubscription.roast.1':
    '{merchant}: {amount}, {months}개월 연속. 쓰고 있는 거야, 돈만 내고 있는 거야?',
  'insight.likelySubscription.roast.2':
    '매달 {merchant}에 {amount}. 계속 쓸 거면 고정비로 등록. 아니면 해지.',
  'insight.likelySubscription.plain':
    '{merchant}에서 {months}개월 동안 매달 {amount} 정도 결제됐어요. 고정비일 수 있어요.',

  'insight.lateNight.soft.1': '늦은 밤 {merchant}에서 {amount}. 도움이 됐길 바라요.',
  'insight.lateNight.soft.2': '{merchant}, {amount}, 밤늦게. 푹 자요.',
  'insight.lateNight.cheeky.1': '잘 시간 한참 지나서 {merchant}에서 {amount}. 올빼미 쇼핑이네.',
  'insight.lateNight.cheeky.2': '야밤의 {merchant}, {amount}. 국룰이지.',
  'insight.lateNight.roast.1': '새벽에 {merchant}에서 {amount}. 큰 결정은 해 뜬 다음에 하자.',
  'insight.lateNight.roast.2': '밤의 {merchant}, {amount}. 다음엔 장바구니에 넣고 자고 일어나서.',
  'insight.lateNight.plain': '늦은 밤 지출: {merchant}에서 {amount}.',

  'insight.cycleHalfway.soft.1': '주기 절반 지점: {percent}% 사용, {left} 남았어요.',
  'insight.cycleHalfway.soft.2':
    '주기의 절반이 지났고, 아직 {left} 자유로워요. 꾸준히 기록하는 게 제일 어려운 건데, 해내고 있어요.',
  'insight.cycleHalfway.cheeky.1': '하프타임. 스코어: {percent}% 사용, 남은 실탄 {left}.',
  'insight.cycleHalfway.cheeky.2': '반 왔다. 후반전에 쓸 돈 {left}.',
  'insight.cycleHalfway.roast.1': '하프타임: {percent}% 사용. 후반전은 {left}. 잘 뛰어 봐.',
  'insight.cycleHalfway.roast.2': '절반 지점, {percent}% 썼고 {left} 남음. 승부는 후반전이야.',
  'insight.cycleHalfway.plain': '주기 절반 지점: {percent}% 사용, {left} 남았어요.',

  'insight.firstWeekPaceUp.soft.1':
    '첫 주에 주기 예산의 {percent}%를 썼어요. 고르게 쓰면 {even}%예요. 남은 주에 맞춰 가면 돼요.',
  'insight.firstWeekPaceUp.soft.2':
    '바빴던 첫 주: 주기 예산의 {percent}%. 차분한 날들이 다시 맞춰 줄 거예요.',
  'insight.firstWeekPaceUp.cheeky.1':
    '첫 주: {percent}% 사용, 고른 속도는 {even}%. 출발 좋다. 너무 좋은가.',
  'insight.firstWeekPaceUp.cheeky.2': '첫 주에 {percent}%. 고르게면 {even}%. 속도 조절!',
  'insight.firstWeekPaceUp.roast.1':
    '첫 주가 주기의 {percent}%를 먹었어. 고른 속도는 {even}%. 나머지 주들이 할 말 있대.',
  'insight.firstWeekPaceUp.roast.2':
    '한 주에 {percent}%, 고른 속도는 {even}%. 전력질주는 끝, 이제 조깅.',
  'insight.firstWeekPaceUp.plain':
    '첫 주에 주기 예산의 {percent}%를 썼어요. 고르게 쓰면 {even}%입니다.',

  'insight.firstWeekPaceDown.soft.1':
    '첫 주에 주기 예산의 {percent}%만 썼어요. 고르게 쓰면 {even}%예요. 출발 좋아요.',
  'insight.firstWeekPaceDown.soft.2':
    '차분한 첫 주: {percent}% 사용, 고른 속도와 비교해 {compare} 썼어요.',
  'insight.firstWeekPaceDown.cheeky.1':
    '첫 주: 고른 속도 {even}%보다 적은 {percent}%. 매끄러운 출발.',
  'insight.firstWeekPaceDown.cheeky.2': '첫 주: {percent}%. 고르게면 {even}%. 이것 봐라.',
  'insight.firstWeekPaceDown.roast.1':
    '첫 주 {percent}% 사용, 고른 속도 {even}%보다 아래. 수상할 만큼 좋은데. 유지해.',
  'insight.firstWeekPaceDown.roast.2': '첫 주 {percent}%, 고른 속도는 {even}%. 지적할 게 없네.',
  'insight.firstWeekPaceDown.plain':
    '첫 주에 주기 예산의 {percent}%를 썼어요. 고르게 쓰면 {even}%입니다.',

  'insight.paceSpare.soft.1': '이 속도라면 월급날({payday})에 {spare} 정도 남아요.',
  'insight.paceSpare.soft.2': '이대로만 가면 {payday}에 {spare} 정도 남겨서 도착해요.',
  'insight.paceSpare.cheeky.1': '{payday}에 예상 잔액: {spare}. 머릿속으로 미리 쓰진 마.',
  'insight.paceSpare.cheeky.2': '이 속도면 {payday}까지 {spare} 남아. 좋은데.',
  'insight.paceSpare.roast.1': '이 속도면 {payday}까지 {spare} 남아. 생기기도 전에 쓰지 마.',
  'insight.paceSpare.roast.2': '예보: {payday}에 {spare} 남음. 예보가 맞게 해 줘.',
  'insight.paceSpare.plain': '지금 속도라면 월급날({payday})에 {spare} 정도 남아요.',

  'insight.paceShort.soft.1':
    '이 속도면 월급날({payday}) 전, {runsOut}쯤 빠듯해져요. 며칠만 덜 쓰면 해결돼요.',
  'insight.paceShort.soft.2':
    '미리 알려 드려요: 이대로면 {runsOut}쯤 부족해져요. 덜 쓰는 날이 도움 되고, 시간도 충분해요.',
  'insight.paceShort.cheeky.1': '이 경로면 {runsOut}쯤 바닥나. 월급날은 {payday}. 경로 재탐색?',
  'insight.paceShort.cheeky.2':
    '이 속도면 {runsOut}쯤 돈이 떨어져. 월급날은 {payday}. 앞으로 살살 가자.',
  'insight.paceShort.roast.1':
    '이 속도면 {runsOut}쯤 바닥, 월급날은 {payday}. 조용한 며칠이면 무사 착륙이야.',
  'insight.paceShort.roast.2':
    '{runsOut}: 이 속도로 돈이 바닥나는 날. {payday}: 월급날. 그 틈, 같이 메우자.',
  'insight.paceShort.plain': '지금 속도라면 월급날({payday}) 전인 {runsOut}쯤 돈이 떨어져요.',
};
