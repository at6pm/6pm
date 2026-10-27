import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// `{range}` is always followed by は or の so every range reads as a noun phrase.
export const jaAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': '今日',
  'ask.range.yesterday': '昨日',
  'ask.range.thisWeek': '今週',
  'ask.range.lastWeek': '先週',
  'ask.range.thisCycle': '給料日から',
  'ask.range.lastCycle': '前の給料サイクル',
  'ask.range.thisMonth': '今月',
  'ask.range.lastMonth': '先月',
  'ask.range.last7Days': '直近1週間',
  'ask.range.last30Days': '直近1か月',
  'ask.range.dates': '{from}から{to}まで',

  'ask.answer.spent': { other: '{range}は{total}使いました（{count}件）。' },
  'ask.answer.spentOn': { other: '{range}は{category}に{total}使いました（{count}回）。' },
  'ask.answer.spentAt': { other: '{range}は{merchant}で{total}使いました（{count}回）。' },
  'ask.answer.spentNone': '{range}の支出はありません。',
  'ask.answer.spentNoneOn': '{range}の{category}の支出はありません。',
  'ask.answer.spentNoneAt': '{range}の{merchant}での支出はありません。',
  'ask.answer.breakdown': '{range}の{total}のうち、いちばん多かったのは{top}です。',
  'ask.answer.compared.up': '{range}は{now}。{against}の{before}から増えています。',
  'ask.answer.compared.down': '{range}は{now}。{against}の{before}から減っています。',
  'ask.answer.compared.same': 'ほぼ同じです：{range}は{now}、{against}は{before}。',
  'ask.answer.listed': { other: '{range}の支出は{count}件、合計{total}です。' },
  'ask.answer.listedMore': 'ほかに{more}件あります。',
  'ask.answer.listedNone': '{range}は、そういう支出はありません。',
  'ask.answer.bills': { other: '給料日までに残っている固定費は{count}件、合計{total}です。' },
  'ask.answer.billsNone': '給料日までに残っている固定費はありません。',
  'ask.answer.how': '今、目立っているのはこちらです。',
  'ask.answer.howNothing': '今のところ穏やかです。目立つことはまだありません。',
  'ask.answer.noSuchCategory':
    '{category}というカテゴリが見つかりません。あなたのカテゴリについて聞いてください。',
  'ask.answer.noRange': 'その期間には、まだ見られるものがありません。',
  'ask.answer.chat': 'いつでもどうぞ。お金のことなら、好きなときに聞いてください。',
  'ask.answer.partial': '{since}から6pmに残した記録で数えています。',
  'ask.row.total': '合計',
  'ask.row.before': '前回',
  'ask.answer.goalPace.months': {
    other:
      '未来の自分に毎月{monthly}なら、{what}の{amount}まではおよそ{count}か月、{month}ごろです。',
  },
  'ask.answer.goalPace.years': {
    other:
      '未来の自分に毎月{monthly}なら、{what}の{amount}まではおよそ{count}年、{month}ごろです。',
  },
  'ask.answer.goalPace.note': '専用の貯金箱を作れば、そのお金をほかと分けておけます。',
  'ask.answer.goalNoPace':
    'まだ毎月の未来の自分への積み立てがないので、{what}の{amount}までのペースを計算できません。毎月少しずつ始めてみましょう。',
  'ask.answer.goalAmount':
    '{what}はだいたいいくらですか？「{example}」のように値段を教えてくれたら計算します。',
  'ask.row.reachedBy': '達成見込み',
};
