import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion speaks casual 해요체 (light 반말 in cheeky and roast); plain lines are neutral.
// The day's line is "한도", a pot is "저금통", closing the day is "마감". No particle right after a
// placeholder: a noun, a colon or a counter follows it instead.
export const koInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': '훨씬 많이',
  'insight.compare.more': '더 많이',
  'insight.compare.about': '비슷하게',
  'insight.compare.less': '덜',
  'insight.compare.muchLess': '훨씬 덜',

  'insight.todayOver.soft.1': '오늘 {over} 넘었어요. 괜찮아요, 내일 한도는 {tomorrow}.',
  'insight.todayOver.soft.2':
    '조금 큰 하루였네요, {over} 초과. 플랜이 맞춰 줘요: 내일은 {tomorrow}.',
  'insight.todayOver.cheeky.1': '오늘 {over} 초과! 내일은 {tomorrow}, 새로 시작이야.',
  'insight.todayOver.cheeky.2': '오늘 한도를 {over} 넘겼어. 반전이네. 내일은 {tomorrow}.',
  'insight.todayOver.roast.1': '{over} 초과. 한도가 꽤 버텼는데. 내일은 {tomorrow}, 살살 가자.',
  'insight.todayOver.roast.2':
    '한도는 안 된다 했고 오늘은 {over} 더 썼지. 내일 {tomorrow}, 2라운드야.',
  'insight.todayOver.plain': '오늘 한도를 {over} 넘었어요. 내일 한도는 {tomorrow}입니다.',

  'insight.todayUnder.soft.1': '지금까지 {spent} 썼고, 아직 {safe} 남았어요. 차분하니 좋아요.',
  'insight.todayUnder.soft.2': '오늘 아직 {safe} 여유 있어요. 잘하고 있어요.',
  'insight.todayUnder.cheeky.1': '오늘 {safe} 남았어. 잘 쓰든 아끼든, 네 마음이야.',
  'insight.todayUnder.cheeky.2': '{spent} 쓰고 {safe} 남음. 순조롭네.',
  'insight.todayUnder.roast.1':
    '아직 {spent}밖에 안 썼다고? 지갑이 어리둥절해. 좋은 쪽으로. {safe} 남았어.',
  'insight.todayUnder.roast.2': '아직 {safe} 남았네. 좀 수상한데. 계속 그렇게 해.',
  'insight.todayUnder.plain': '오늘 {spent} 썼고, {safe} 남았어요.',

  'insight.noSpendYet.soft.1': '아직 쓴 돈이 없어요. 오늘 {line} 전부 그대로예요.',
  'insight.noSpendYet.soft.2': '깨끗한 하루: 오늘 한도 {line}.',
  'insight.noSpendYet.cheeky.1': '오늘 {line}, 아직 흠집 하나 없어. 아직은.',
  'insight.noSpendYet.cheeky.2': '오늘 {line} 고스란히 남아 있어. 일단은.',
  'insight.noSpendYet.roast.1': '아직 한 푼도 안 썼네. {line} 한도가 네 다음 수를 지켜보는 중.',
  'insight.noSpendYet.roast.2': '{line} 한도가 손도 안 댄 채 있어. 수상한데. 계속해.',
  'insight.noSpendYet.plain': '아직 지출이 없어요. 오늘 한도는 {line}입니다.',

  'insight.waitingTonight.soft.1': {
    other: '지출 {count}건({amount})이 오늘 밤을 기다려요. 길어야 1분이에요.',
  },
  'insight.waitingTonight.soft.2': {
    other: '오늘 밤 살펴볼 지출 {count}건, 모두 {amount}.',
  },
  'insight.waitingTonight.cheeky.1': {
    other: '지출 {count}건({amount})이 오늘 밤 판결을 기다리는 중.',
  },
  'insight.waitingTonight.cheeky.2': {
    other: '오늘 밤 마감: {count}건, {amount}. 껌이지.',
  },
  'insight.waitingTonight.roast.1': {
    other: '{count}건, {amount} 대기 중. 저절로 마감되진 않아. 1분이면 돼.',
  },
  'insight.waitingTonight.roast.2': {
    other: '{count}건, {amount}. “응, 그거 나야” 한마디 기다리는 중.',
  },
  'insight.waitingTonight.plain': {
    other: '지출 {count}건({amount})이 오늘 밤 마감을 기다립니다.',
  },

  'insight.paydaySoon.soft.1': { other: '월급날까지 {count}일. 거의 다 왔어요.' },
  'insight.paydaySoon.soft.2': { other: '월급날({payday})까지 {count}일. 조금만 버텨요.' },
  'insight.paydaySoon.cheeky.1': { other: '월급날까지 {count}일. 벌써 냄새가 나.' },
  'insight.paydaySoon.cheeky.2': { other: '월급날까지 {count}밤만 자면 돼.' },
  'insight.paydaySoon.roast.1': { other: '월급날까지 {count}일. 버텨.' },
  'insight.paydaySoon.roast.2': {
    other: '월급날은 {payday}. 그때까지 지갑은 꼭 닫아 둬.',
  },
  'insight.paydaySoon.plain': { other: '월급날까지 {count}일 남았어요({payday}).' },

  'insight.billDueToday.soft.1': '오늘은 {bill} 납부일이에요({amount}).',
  'insight.billDueToday.soft.2': '살짝 알려 드려요: {bill}, {amount}, 오늘 내는 날이에요.',
  'insight.billDueToday.cheeky.1': '{bill} 님이 오늘 {amount} 달래.',
  'insight.billDueToday.cheeky.2': '오늘의 특별 게스트: {bill}, {amount}.',
  'insight.billDueToday.roast.1': '오늘 {bill} 내는 날. 절대 안 기다려 줘.',
  'insight.billDueToday.roast.2': '{bill}에 {amount}, 오늘이야. 읽씹 금지.',
  'insight.billDueToday.plain': '오늘 {bill} 납부일입니다({amount}).',

  'insight.billDue.soft.1': { other: '{count}일 뒤 {bill} 납부일이에요({amount}).' },
  'insight.billDue.soft.2': { other: '미리 알려 드려요: {bill}, {amount}, {count}일 뒤.' },
  'insight.billDue.cheeky.1': { other: '{count}일 뒤 {bill} 님이 {amount} 받으러 온대.' },
  'insight.billDue.cheeky.2': { other: '{count}일 뒤: {bill}, {amount}. 표시해 둬.' },
  'insight.billDue.roast.1': { other: '{count}일 뒤 {bill} 님이 {amount} 달래. 늘 그렇듯.' },
  'insight.billDue.roast.2': { other: '{count}일 뒤 {bill}에 {amount}. 놀란 척 금지.' },
  'insight.billDue.plain': { other: '{count}일 뒤 {bill} 납부일입니다({amount}).' },

  'insight.categoryPaceUp.soft.1':
    '이번 주기 {category} 지출 {now}. 지난번 이맘때와 비교해 {compare} 쓰고 있어요.',
  'insight.categoryPaceUp.soft.2':
    '{category} 지출이 앞서가요: 지금까지 {now}, 지난 주기엔 {before}.',
  'insight.categoryPaceUp.cheeky.1': '{category}: 벌써 {now}. 지난 주기 이맘땐 {before}. 흠.',
  'insight.categoryPaceUp.cheeky.2': '{category} 전성기 왔네: {now} vs {before}.',
  'insight.categoryPaceUp.roast.1':
    '{category} 지출 {now}. 지난 주기엔 {before}. 다 보여. 조용한 한 주면 다시 맞춰져.',
  'insight.categoryPaceUp.roast.2':
    '{category}에 벌써 {now}. 지난번엔 {before}. 그냥 하는 말이야, 애정을 담아서.',
  'insight.categoryPaceUp.plain': '{category}: 이번 주기 {now}, 지난 주기 같은 시점 {before}.',

  'insight.categoryPaceDown.soft.1':
    '{category} 지출이 줄었어요: 지난 주기 {before}, 지금 {now}. 멋져요.',
  'insight.categoryPaceDown.soft.2':
    '{category}, 지난 주기와 비교해 {compare} 쓰고 있어요: {now} vs {before}.',
  'insight.categoryPaceDown.cheeky.1': '{category}: {before} → {now}, 뚝. 대단한데?',
  'insight.categoryPaceDown.cheeky.2': '{category} 다이어트 성공: {now} vs {before}.',
  'insight.categoryPaceDown.roast.1': '{category} 겨우 {now}? 전엔 {before}. 이 버전 유지해.',
  'insight.categoryPaceDown.roast.2': '{category} 지출 {now}, 전엔 {before}. 성장했다.',
  'insight.categoryPaceDown.plain': '{category}: 이번 주기 {now}, 지난 주기 같은 시점 {before}.',

  'insight.repeatMerchant.soft.1': '이번 주 {merchant} 방문 {visits}번. 거기서도 반가워하겠어요.',
  'insight.repeatMerchant.soft.2': '월요일부터 {merchant} 방문 {visits}번, 모두 {amount}.',
  'insight.repeatMerchant.cheeky.1': '또 {merchant}? 월요일부터 벌써 {visits}번째야.',
  'insight.repeatMerchant.cheeky.2': '너랑 {merchant}: 이번 주 데이트 {visits}번, {amount}.',
  'insight.repeatMerchant.roast.1': '{merchant} 방문 {visits}번째. 이제 거기서 이름 외웠겠다?',
  'insight.repeatMerchant.roast.2':
    '이번 주 {merchant}에서 {amount}. 방문 {visits}번. 이건 라이프스타일이야.',
  'insight.repeatMerchant.plain': '{merchant}: 이번 주 방문 {visits}번, {amount}.',

  'insight.firstTimeMerchant.soft.1': '{merchant} 첫 방문이네요. 좋았길 바라요.',
  'insight.firstTimeMerchant.soft.2': '새로운 곳: {merchant}, {amount}.',
  'insight.firstTimeMerchant.cheeky.1': '{merchant}? 처음 보는 데네. 모험심 좋은데.',
  'insight.firstTimeMerchant.cheeky.2': '오, {merchant}. 이건 처음 보는데.',
  'insight.firstTimeMerchant.roast.1': '{merchant}. 가게는 새롭고, 지갑은 그대로.',
  'insight.firstTimeMerchant.roast.2': '{merchant} 첫 방문. 습관 되면 곤란해. 아님 말고.',
  'insight.firstTimeMerchant.plain': '{merchant} 첫 지출: {amount}.',

  'insight.biggestSpend.soft.1': '이번 주의 큰 지출: {merchant}에서 {amount}.',
  'insight.biggestSpend.soft.2': '{merchant}, {amount}: 이번 주 최대 지출. 플랜에 다 들어 있어요.',
  'insight.biggestSpend.cheeky.1': '이번 주 헤드라이너: {merchant}, {amount}.',
  'insight.biggestSpend.cheeky.2': '{merchant}에서 {amount}. 나한테 주는 선물이었나 봐.',
  'insight.biggestSpend.roast.1': '{merchant}에서 {amount}. 이번 주 주인공 등극.',
  'insight.biggestSpend.roast.2':
    '이번 주 {merchant}에 {amount}. 그럴 가치 있었냐고? 대답 안 해도 돼. 플랜에 다 있어.',
  'insight.biggestSpend.plain': '이번 주 최대 지출: {merchant}에서 {amount}.',

  'insight.underStreak.soft.1': '{days}일 연속 한도 안. 한결같네요.',
  'insight.underStreak.soft.2': '{days}일 연속 평온한 날이에요.',
  'insight.underStreak.cheeky.1': '{days}일째 한도 안. 연속 기록 시대 개막.',
  'insight.underStreak.cheeky.2': '{days}일 연속 한도 안. 부정 타니까 쉿.',
  'insight.underStreak.roast.1': '{days}일 연속 한도 안. 놀릴 거리 준비해 놨는데. 다 버렸어.',
  'insight.underStreak.roast.2': '{days}일 연속이라니. 놀릴 거리가 바닥났어.',
  'insight.underStreak.plain': '{days}일 연속 한도 이하로 마감했어요.',

  'insight.closeStreak.soft.1': '{days}일 연속 마감. 이게 바로 루틴이죠.',
  'insight.closeStreak.soft.2': '{days}일 연속 마감. 매일 와 줘서 고마워요.',
  'insight.closeStreak.cheeky.1': '{days}일 연속 마감. 습관 잠금 해제.',
  'insight.closeStreak.cheeky.2': '연속 {days}일. 오늘 밤이면 하나 더.',
  'insight.closeStreak.roast.1': '{days}일 내리 마감. 연속 기록이 잘 어울리네. 끊지 마.',
  'insight.closeStreak.roast.2': '{days}일 연속 마감 중. 지금 끊으면 아깝다.',
  'insight.closeStreak.plain': '{days}일 연속 마감했어요.',

  'insight.weekSpare.soft.1': {
    other: '이번 주 {count}일이 한도 안이었어요. {spare}, 다음 날들로 넘어가요.',
  },
  'insight.weekSpare.soft.2': { other: '이번 주 여유 {spare}, 다음으로 넘겨요.' },
  'insight.weekSpare.cheeky.1': {
    other: '좋은 날 {count}일이 남긴 {spare}. 앞으로의 날들이 고맙대.',
  },
  'insight.weekSpare.cheeky.2': { other: '이번 주 {spare} 앞서가는 중. 순조롭네.' },
  'insight.weekSpare.roast.1': {
    other: '한도 안 {count}일, 여유 {spare}. 한 번에 다 쓰진 마.',
  },
  'insight.weekSpare.roast.2': { other: '이번 주 {spare} 남겼네. 인정해 줄게.' },
  'insight.weekSpare.plain': { other: '이번 주 마감한 날들에서 {spare} 남았어요.' },

  'insight.weekOver.soft.1': '이번 주 {over} 넘었어요. 앞으로의 하루가 조금 작아질 뿐, 괜찮아요.',
  'insight.weekOver.soft.2': '이번 주 {over} 초과. 같이 천천히 맞춰 가요.',
  'insight.weekOver.cheeky.1': '이번 주 {over} 초과. 남은 한 달이 알아서 맞춰 줄 거야.',
  'insight.weekOver.cheeky.2': '지금까지 {over} 초과. 반전일 뿐, 결말은 아니야.',
  'insight.weekOver.roast.1': '이번 주: {over} 초과. 다음 주만 조용하면 한 달은 버텨.',
  'insight.weekOver.roast.2': '{over} 초과. 잊고 싶은 한 주, 바로잡을 한 달.',
  'insight.weekOver.plain': '이번 주 마감한 날들이 한도를 {over} 넘었어요.',

  'insight.potMilestone.soft.1': '{pot} 저금통 {percent}% 돌파. 쑥쑥 크고 있어요.',
  'insight.potMilestone.soft.2': '{pot}까지 {percent}% 왔어요.',
  'insight.potMilestone.cheeky.1': '{pot}: {percent}% 달성. 진짜 되고 있어.',
  'insight.potMilestone.cheeky.2': '{pot} {percent}% 완료. 계속 밥 줘.',
  'insight.potMilestone.roast.1': '{pot} 저금통 {percent}%. 저금통이 이기는 중. 그냥 둬.',
  'insight.potMilestone.roast.2': '{pot}까지 {percent}%. 털어 가지 마.',
  'insight.potMilestone.plain': '{pot} 저금통이 목표의 {percent}%를 넘었어요.',

  'insight.potFull.soft.1': '{pot} 저금통이 꽉 찼어요. 해냈어요.',
  'insight.potFull.soft.2': '{pot}: 완료. 마음껏 즐겨요.',
  'insight.potFull.cheeky.1': '{pot} 저금통 완성! 축하 폭죽, 조용히 팡.',
  'insight.potFull.cheeky.2': '{pot}, 넘치기 직전까지 꽉.',
  'insight.potFull.roast.1': '{pot} 저금통 완성. 놀릴 말 준비했는데 필요 없었네.',
  'insight.potFull.roast.2': '꽉 찬 저금통: {pot}. 이제 원래 쓰려던 데 써.',
  'insight.potFull.plain': '{pot} 저금통이 목표에 도달했어요.',

  'insight.workToClaim.soft.1': { other: '경비 청구할 업무 지출 {count}건({amount})이 있어요.' },
  'insight.workToClaim.soft.2': {
    other: '업무 지출 {count}건, {amount}. 경비 청구를 기다리고 있어요.',
  },
  'insight.workToClaim.cheeky.1': { other: '회사가 너한테 {amount} 빚졌어. 영수증 {count}건어치.' },
  'insight.workToClaim.cheeky.2': { other: '업무 지출 {count}건, {amount}. 받아 내자.' },
  'insight.workToClaim.roast.1': {
    other: '회사가 갚아야 할 {amount}. 무려 {count}건. 부끄러워 말고 청구해.',
  },
  'insight.workToClaim.roast.2': {
    other: '회사 운영에 {amount} 보태는 중이야. 청구해.',
  },
  'insight.workToClaim.plain': {
    other: '업무 지출 {count}건({amount})이 경비 청구를 기다리고 있어요.',
  },
};
