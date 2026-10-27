import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// Amount examples stay in the forms 6pm reads (45k, 10M), since the phone parses them as typed.
export const zhHansAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': '添加',
  'ask.action.notNow': '先不了',
  'ask.action.confirmSpend': '把 {name}（{amount}）记到 {category}？',
  'ask.action.added': '记好了。{name}，{amount}，计入今天。',
  'ask.action.cancelled': '好的，什么都没改。',
  'ask.action.failed': '没能保存。试试快速记账吧。',
  'ask.action.confirmPot': '为 {name} 建一个存钱罐：{goal}。现在建吗？',
  'ask.action.confirmPotBy': '为 {name} 建一个存钱罐：{month}前存够 {goal}。现在建吗？',
  'ask.action.setUp': '建一个',
  'ask.action.potLocked': '免费版只能有一个自己的存钱罐，而你的已经在用了。Max 能放下更多。',
  'ask.action.seeMax': '看看 Max',
  'ask.action.potGoal': '{name} 需要多少钱？告诉我，比如“10M”。',
  'ask.action.showMe': '教我怎么做',
  'ask.action.openQuickAdd': '打开快速记账',
  'ask.howTo.ways':
    '六种方式：快速记账（打字或说出来）、把银行小票分享到 6pm、转发小票邮件、扫 VietQR 付款、自动记下的 Apple Pay 付款，以及小组件和控制项。6pm 记下的内容会在收件箱里等到日结。',
  'ask.howTo.quickAdd':
    '快速记账可以打字或直接说出一笔支出，比如“奶茶 45k”。也可以直接在这里告诉我：“刚吃了碗粉 50k”。',
  'ask.howTo.dailyNumber':
    '每日额度，就是这个发薪周期扣掉固定账单、未来的你和存钱罐之后可自由花的钱，平均分到离发薪日剩下的每一天。花得比它少，明天的就变多；超了，明天的就少一点。',
  'ask.howTo.negative':
    '当这个周期的支出超过可自由花的钱时，它就会变成负数。不会出什么问题：计划会把它摊到剩下的日子里。接下来几天省着点，或者在“计划”里从存钱罐拿一些出来。',
  'ask.howTo.pot':
    '存钱罐是为某一件事预留的钱，比如一次旅行或过年。6pm 每月往里存一点，并且不计入你的每日额度，需要的时候它就在那里。',
  'ask.howTo.close':
    '每天 6pm，你来日结：保留或跳过记下的支出，再看看今天的结果。错过了也不会丢东西；记下的支出会一直等着，并且照样计入，直到你决定。',
  'ask.howTo.budget':
    '6pm 不设分类预算。你的每日额度就是预算：固定账单、未来的你和存钱罐都已经预留好了。想在某件事上少花点，就在“计划”里建一个存钱罐，或者多给未来的你存一些。',
};
