import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// `{range}` and `{against}` are time words placed before the verb, as Chinese puts them
// (你本周花了…), so every range reads as an adverb of time.
export const zhHansAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': '今天',
  'ask.range.yesterday': '昨天',
  'ask.range.thisWeek': '本周',
  'ask.range.lastWeek': '上周',
  'ask.range.thisCycle': '发薪日以来',
  'ask.range.lastCycle': '上个发薪周期',
  'ask.range.thisMonth': '本月',
  'ask.range.lastMonth': '上个月',
  'ask.range.last7Days': '最近一周',
  'ask.range.last30Days': '最近一个月',
  'ask.range.dates': '从 {from} 到 {to}',

  'ask.answer.spent': { other: '你{range}花了 {total}，共 {count} 笔。' },
  'ask.answer.spentOn': { other: '你{range}在 {category} 上花了 {total}，共 {count} 次。' },
  'ask.answer.spentAt': { other: '你{range}在 {merchant} 花了 {total}，去了 {count} 次。' },
  'ask.answer.spentNone': '{range}没有支出。',
  'ask.answer.spentNoneOn': '{range}在 {category} 上没有花钱。',
  'ask.answer.spentNoneAt': '{range}没有在 {merchant} 花钱。',
  'ask.answer.breakdown': '{range}共 {total}，花得最多的是 {top}。',
  'ask.answer.compared.up': '{range}是 {now}，比{against}的 {before} 多。',
  'ask.answer.compared.down': '{range}是 {now}，比{against}的 {before} 少。',
  'ask.answer.compared.same': '差不多：{range} {now}，{against} {before}。',
  'ask.answer.listed': { other: '{range}有 {count} 笔支出，共 {total}。' },
  'ask.answer.listedMore': '还有 {more} 笔。',
  'ask.answer.listedNone': '{range}没有这样的支出。',
  'ask.answer.bills': { other: '发薪日前还有 {count} 笔账单，共 {total}。' },
  'ask.answer.billsNone': '发薪日前没有待付的账单了。',
  'ask.answer.how': '这是目前值得注意的几点。',
  'ask.answer.howNothing': '目前一切平静，还没有特别值得注意的。',
  'ask.answer.noSuchCategory': '我找不到“{category}”这个分类。问问你自己的分类吧。',
  'ask.answer.noRange': '这段时间还没有可以看的内容。',
  'ask.answer.chat': '随时都在。想问钱的事，随时来找我。',
  'ask.answer.partial': '这里只算 6pm 从 {since} 起记下的内容。',
  'ask.row.total': '合计',
  'ask.row.before': '之前',
  'ask.answer.goalPace.months': {
    other:
      '每月给未来的你存 {monthly}，{what} 的 {amount} 大约要 {count} 个月，{month}左右能存够。',
  },
  'ask.answer.goalPace.years': {
    other: '每月给未来的你存 {monthly}，{what} 的 {amount} 大约要 {count} 年，{month}左右能存够。',
  },
  'ask.answer.goalPace.note': '为它单独建一个存钱罐，这笔钱就能和其他钱分开。',
  'ask.answer.goalNoPace':
    '目前每月还没有给未来的你存钱，所以没法算出 {what} 的 {amount} 要存多久。每月存一点，就有节奏了。',
  'ask.answer.goalAmount': '{what} 大概要多少钱？告诉我价格，比如“{example}”，我来帮你算。',
  'ask.row.reachedBy': '大约在',
};
