import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const zhHansNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': '发薪日',
  'notify.channel.capture': '抓取消费',
  'notify.channel.reminders': '你设的提醒',

  'notify.close.leadSix': '六点了。',
  'notify.close.leadAt': '{time} 了。',

  'notify.close.jarReady.soft': '{lead}你的{jar}存钱罐准备好了。',
  'notify.close.jarReady.cheeky': '{lead}{jar}存钱罐准备好了，快去看看。',
  'notify.close.jarReady.roast': '{lead}{jar}存钱罐准备好了。没想到吧，你还真行。',
  'notify.close.jarReady.plain': '{lead}{jar}存钱罐已就绪。',

  'notify.close.countdown.soft': { other: '{lead}距离{festival}还有{count}天。' },
  'notify.close.countdown.cheeky': {
    other: '{lead}距离{festival}还有{count}天。灯笼都挂起来了。',
  },
  'notify.close.countdown.roast': { other: '{lead}距离{festival}还有{count}天。捂紧钱包。' },
  'notify.close.countdown.plain': { other: '{lead}距{festival}还有{count}天。' },
  'notify.close.countdownJar.soft': {
    other: '{lead}距离{festival}还有{count}天。{festival}罐里有{amount}。',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead}距离{festival}还有{count}天。罐子里已经攒了{amount}。',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead}距离{festival}还有{count}天。罐里有{amount}，看好它。',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead}距{festival}还有{count}天。{festival}罐余额{amount}。',
  },

  'notify.close.pay.soft': '{lead}工资在等你安排。',
  'notify.close.pay.cheeky': '{lead}工资到了，来给它派点活。',
  'notify.close.pay.roast': '{lead}工资到账了，趁它没跑远赶紧安排。',
  'notify.close.pay.plain': '{lead}工资待分配。',

  'notify.close.bonus.soft': '{lead}{festival}奖金在等你安排。',
  'notify.close.bonus.cheeky': '{lead}{festival}奖金到了，来分一分。',
  'notify.close.bonus.roast': '{lead}{festival}奖金到账了，趁商家没发现赶紧安排。',
  'notify.close.bonus.plain': '{lead}{festival}奖金待分配。',

  'notify.close.payback.soft': '{lead}{name}把钱还你了。',
  'notify.close.payback.cheeky': '{lead}{name}把钱还你了。友谊完好无损。',
  'notify.close.payback.roast': '{lead}{name}居然真的还钱了。',
  'notify.close.payback.plain': '{lead}{name}已还款。',

  'notify.close.moneyIn.soft': '{lead}有钱进账，在日结里等你。',
  'notify.close.moneyIn.cheeky': '{lead}有钱进账，来告诉它去哪儿。',
  'notify.close.moneyIn.roast': '{lead}有钱进账，别让它动歪心思。',
  'notify.close.moneyIn.plain': '{lead}有钱进账，请在日结时分配。',

  'notify.close.yearCard.soft': '{lead}你的 {year} 年，可以回顾了。',
  'notify.close.yearCard.cheeky': '{lead}你的 {year} 年做好了，要看看吗？',
  'notify.close.yearCard.roast': '{lead}你的 {year} 年，全在这儿。敢看吗？',
  'notify.close.yearCard.plain': '{lead}{year} 年回顾已就绪。',

  'notify.payday.amounts.soft': '发薪日。{jars}存进罐子，到{date}每天{daily}。',
  'notify.payday.amounts.cheeky': '发薪啦！{jars}存进罐子，到{date}每天{daily}。',
  'notify.payday.amounts.roast': '发薪日。眨眼间{jars}已存好，到{date}每天{daily}。',
  'notify.payday.amounts.plain': '发薪日。{jars}存入存钱罐，到{date}每天{daily}。',
  'notify.payday.noJars': '发薪日。到{date}每天{daily}。',
  'notify.payday.hidden': '发薪日。存钱罐已经存好了。',
  'notify.payday.hiddenNoJars': '发薪日。新的一个月开始了。',

  'notify.firstCatch.amounts.soft': '抓到第一笔：{amount} · {name}。就这么简单。',
  'notify.firstCatch.amounts.cheeky': '抓到第一笔：{amount} · {name}。简单吧？',
  'notify.firstCatch.amounts.roast': '抓到第一笔：{amount} · {name}。一点都不疼。',
  'notify.firstCatch.amounts.plain': '第一笔：{amount} · {name}。',
  'notify.firstCatch.hidden': '抓到{name}的第一笔。就这么简单。',
  'notify.firstCatch.noName': '抓到第一笔了。就这么简单。',

  'notify.quiet.soft': '{way}已经{count}天没动静了。自动化还开着吗？',
  'notify.quiet.cheeky': '{way}已经{count}天没动静了。是太省了，还是自动化关了？',
  'notify.quiet.roast': '{way}已经{count}天没动静了。要么你是圣人，要么自动化关了。',
  'notify.quiet.plain': '{way}已经{count}天没有消息。请检查自动化是否开启。',
  'notify.quiet.yourAlerts': '银行通知',

  'notify.owed.one.soft': '{name}还欠你{amount}。方便时再提。',
  'notify.owed.one.cheeky': '{name}还欠你{amount}。要不要友好地提醒一下？',
  'notify.owed.one.roast': '{name}还欠你{amount}。你的钱想你了。',
  'notify.owed.one.plain': '{name}欠你{amount}。',
  'notify.owed.oneHidden': '{name}还欠你钱。方便时再提。',
  'notify.owed.noName': '还有{amount}没还你。',
  'notify.owed.noNameHidden': '有人还欠你钱。方便时再提。',
  'notify.owed.many': '{count}个人还欠你{amount}。',
  'notify.owed.manyHidden': '{count}个人还欠你钱。',

  'settings.notifications': '通知',
  'settings.notificationsOn': '开',
  'notify.settings.title': '通知',
  'notify.settings.phone': '这台手机',
  'notify.settings.allowed': '已允许',
  'notify.settings.turnOn': '打开',
  'notify.settings.offInSettings': '已在设置中关闭',
  'notify.settings.offSub': '打开之前，什么都收不到。',
  'notify.settings.kinds': '6pm 会发什么',
  'notify.kind.close': '日结提醒',
  'notify.kind.close.sub': '每天 {time}，附上当天的消息',
  'notify.kind.payday': '发薪日',
  'notify.kind.payday.sub': '工资到账那天早上 08:30',
  'notify.kind.capture': '抓取消费',
  'notify.kind.capture.sub': '抓到的第一笔，以及安静下来的渠道',
  'notify.kind.reminders': '你设的提醒',
  'notify.kind.reminders.sub': '谁欠你钱，在你选的那天',
  'notify.settings.lockScreen': '锁屏',
  'notify.settings.amounts': '在锁屏上显示金额',
  'notify.settings.amounts.sub': '关闭时，文字里不出现数字',
  'notify.settings.note':
    '一天一次是仪式：日结提醒带来当天的消息。每天最多再发一条，22:00 到 08:00 之间只有你的日结提醒。',

  'owed.remind.button': '提醒我',
  'owed.remind.threeDays': '3 天后',
  'owed.remind.week': '一周后',
  'owed.remind.payday': '发薪日',
  'owed.remind.set': '提醒时间：{date}',
  'owed.remind.cancel': '不用提醒',
  'owed.remind.toast': '我会在{date} 10:00 提醒你。',
  'owed.remind.off': '你设的提醒已在设置中关闭。',
};
