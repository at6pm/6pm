import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const koNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': '월급날',
  'notify.channel.capture': '지출 잡기',
  'notify.channel.reminders': '내가 설정한 알림',

  'notify.close.leadSix': '여섯 시예요.',
  'notify.close.leadAt': '벌써 {time}.',

  'notify.close.jarReady.soft': '{lead} {jar} 저금통이 준비됐어요.',
  'notify.close.jarReady.cheeky': '{lead} {jar} 저금통이 준비됐어요. 한번 보러 가요.',
  'notify.close.jarReady.roast': '{lead} {jar} 저금통이 준비됐어요. 해낼 줄 누가 알았겠어요.',
  'notify.close.jarReady.plain': '{lead} {jar} 저금통이 준비되었습니다.',

  'notify.close.countdown.soft': { other: '{lead} {festival}까지 {count}일 남았어요.' },
  'notify.close.countdown.cheeky': {
    other: '{lead} {festival}까지 {count}일 남았어요. 등불이 하나둘 걸리고 있어요.',
  },
  'notify.close.countdown.roast': {
    other: '{lead} {festival}까지 {count}일 남았어요. 지갑 꽉 붙잡으세요.',
  },
  'notify.close.countdown.plain': { other: '{lead} {festival}까지 {count}일 남았습니다.' },
  'notify.close.countdownJar.soft': {
    other: '{lead} {festival}까지 {count}일 남았어요. {festival} 저금통에 {amount} 있어요.',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead} {festival}까지 {count}일 남았어요. 저금통이 든든해요: {amount}.',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead} {festival}까지 {count}일 남았어요. 저금통에 {amount}. 잘 지켜요.',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead} {festival}까지 {count}일 남았습니다. {festival} 저금통: {amount}.',
  },

  'notify.close.pay.soft': '{lead} 월급이 자리를 기다리고 있어요.',
  'notify.close.pay.cheeky': '{lead} 월급 들어왔어요. 할 일을 정해 줘요.',
  'notify.close.pay.roast': '{lead} 월급 들어왔어요. 어디로 새기 전에 자리 잡아 줘요.',
  'notify.close.pay.plain': '{lead} 월급을 나눌 차례입니다.',

  'notify.close.bonus.soft': '{lead} {festival} 상여금이 자리를 기다리고 있어요.',
  'notify.close.bonus.cheeky': '{lead} {festival} 상여금 왔어요. 나누러 가요.',
  'notify.close.bonus.roast': '{lead} {festival} 상여금 도착. 쇼핑몰이 찾기 전에 자리 잡아 줘요.',
  'notify.close.bonus.plain': '{lead} {festival} 상여금을 나눌 차례입니다.',

  'notify.close.payback.soft': '{lead} {name}에게서 돈을 돌려받았어요.',
  'notify.close.payback.cheeky': '{lead} {name}에게서 돈을 돌려받았어요. 우정은 무사해요.',
  'notify.close.payback.roast': '{lead} {name}에게서 진짜로 돈을 돌려받았어요.',
  'notify.close.payback.plain': '{lead} {name}에게서 돈을 돌려받았습니다.',

  'notify.close.moneyIn.soft': '{lead} 돈이 들어왔어요. 마감에서 기다리고 있어요.',
  'notify.close.moneyIn.cheeky': '{lead} 돈이 들어왔어요. 갈 곳을 알려 줘요.',
  'notify.close.moneyIn.roast': '{lead} 돈이 들어왔어요. 딴마음 먹기 전에 붙잡아요.',
  'notify.close.moneyIn.plain': '{lead} 돈이 들어왔습니다. 마감 때 나눠 주세요.',

  'notify.close.yearCard.soft': '{lead} 나의 {year}년을 돌아볼 준비가 됐어요.',
  'notify.close.yearCard.cheeky': '{lead} {year}년이 완성됐어요. 볼래요?',
  'notify.close.yearCard.roast': '{lead} {year}년의 전부예요. 볼 용기 있어요?',
  'notify.close.yearCard.plain': '{lead} {year}년 돌아보기가 준비되었습니다.',

  'notify.payday.amounts.soft': '월급날이에요. 저금통에 {jars}, {date}까지 하루 {daily}.',
  'notify.payday.amounts.cheeky': '월급날! 저금통에 {jars}, {date}까지 하루 {daily}.',
  'notify.payday.amounts.roast': '월급날이에요. 눈 깜짝할 새 {jars} 저축, {date}까지 하루 {daily}.',
  'notify.payday.amounts.plain': '월급날입니다. 저금통에 {jars}, {date}까지 하루 {daily}.',
  'notify.payday.noJars': '월급날이에요. {date}까지 하루 {daily}.',
  'notify.payday.hidden': '월급날이에요. 저금통을 채웠어요.',
  'notify.payday.hiddenNoJars': '월급날이에요. 새 달이 시작돼요.',

  'notify.firstCatch.amounts.soft': '첫 지출을 잡았어요: {amount} · {name}. 이게 다예요.',
  'notify.firstCatch.amounts.cheeky': '첫 지출을 잡았어요: {amount} · {name}. 쉽죠?',
  'notify.firstCatch.amounts.roast': '첫 지출을 잡았어요: {amount} · {name}. 하나도 안 아팠죠?',
  'notify.firstCatch.amounts.plain': '첫 지출: {amount} · {name}.',
  'notify.firstCatch.hidden': '{name}에서 첫 지출을 잡았어요. 이게 다예요.',
  'notify.firstCatch.noName': '첫 지출을 잡았어요. 이게 다예요.',

  'notify.quiet.soft': '{count}일째 {way}에서 소식이 없어요. 자동화가 아직 켜져 있나요?',
  'notify.quiet.cheeky':
    '{count}일째 {way}에서 소식이 없어요. 아주 알뜰한 건가요, 자동화가 꺼진 건가요?',
  'notify.quiet.roast': '{count}일째 {way}에서 소식이 없어요. 성인군자거나, 자동화가 꺼졌거나.',
  'notify.quiet.plain': '{count}일째 {way}에서 소식이 없습니다. 자동화가 켜져 있는지 확인하세요.',
  'notify.quiet.yourAlerts': '은행 알림',

  'notify.owed.one.soft': '{name}에게 아직 {amount} 받을 게 있어요. 편할 때 요청해요.',
  'notify.owed.one.cheeky': '{name}에게 아직 {amount} 받을 게 있어요. 살짝 말 걸어 볼까요?',
  'notify.owed.one.roast': '{name}에게 아직 {amount} 받을 게 있어요. 돈이 당신을 그리워해요.',
  'notify.owed.one.plain': '{name}에게 아직 {amount} 받을 게 있습니다.',
  'notify.owed.oneHidden': '{name}에게 아직 받을 돈이 있어요. 편할 때 요청해요.',
  'notify.owed.noName': '받을 돈이 아직 {amount} 남았어요.',
  'notify.owed.noNameHidden': '아직 받을 돈이 있어요. 편할 때 요청해요.',
  'notify.owed.many': '{count}명에게 아직 {amount} 받을 게 있어요.',
  'notify.owed.manyHidden': '{count}명에게 아직 받을 돈이 있어요.',

  'settings.notifications': '알림',
  'settings.notificationsOn': '켬',
  'notify.settings.title': '알림',
  'notify.settings.phone': '이 휴대폰',
  'notify.settings.allowed': '허용됨',
  'notify.settings.turnOn': '켜기',
  'notify.settings.offInSettings': '설정에서 꺼짐',
  'notify.settings.offSub': '켜기 전에는 아무것도 오지 않아요.',
  'notify.settings.kinds': '6pm이 보내는 알림',
  'notify.kind.close': '마감 알림',
  'notify.kind.close.sub': '매일 {time}, 그날의 소식과 함께',
  'notify.kind.payday': '월급날',
  'notify.kind.payday.sub': '월급 들어오는 날 아침 08:30',
  'notify.kind.capture': '지출 잡기',
  'notify.kind.capture.sub': '처음 잡은 지출, 그리고 조용해진 경로',
  'notify.kind.reminders': '내가 설정한 알림',
  'notify.kind.reminders.sub': '받을 돈, 내가 고른 날에',
  'notify.settings.lockScreen': '잠금 화면',
  'notify.settings.amounts': '잠금 화면에 금액 표시',
  'notify.settings.amounts.sub': '끄면 숫자 없이 알려요',
  'notify.settings.note':
    '하루 한 번이 의식이에요. 마감 알림이 그날의 소식을 전해요. 그 외에는 하루 최대 한 번, 22:00부터 08:00까지는 마감 알림만 와요.',

  'owed.remind.button': '알려 줘요',
  'owed.remind.threeDays': '3일 후',
  'owed.remind.week': '1주일 후',
  'owed.remind.payday': '월급날에',
  'owed.remind.set': '알림: {date}',
  'owed.remind.cancel': '알리지 않기',
  'owed.remind.toast': '{date} 10:00에 알려 드릴게요.',
  'owed.remind.off': '내가 설정한 알림이 설정에서 꺼져 있어요.',
};
