import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion talks casually (だね、よ) and rarely names the user; plain lines are です・ます.
// The day's limit is the “ライン”, a pot is a 貯金箱, a pay cycle is a サイクル.
export const jaInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'かなり多め',
  'insight.compare.more': '多め',
  'insight.compare.about': 'ほぼ同じ',
  'insight.compare.less': '少なめ',
  'insight.compare.muchLess': 'かなり少なめ',

  'insight.todayOver.soft.1': '今日は{over}オーバー。大丈夫、明日は{tomorrow}あるよ。',
  'insight.todayOver.soft.2':
    'ちょっと大きめの日で{over}オーバー。プランが調整して、明日は{tomorrow}だよ。',
  'insight.todayOver.cheeky.1': '今日は{over}オーバー。明日は{tomorrow}、まっさらでリスタート。',
  'insight.todayOver.cheeky.2': '今日はラインを{over}突破。まさかの展開だけど、明日は{tomorrow}。',
  'insight.todayOver.roast.1':
    '{over}オーバー。ラインも粘ったんだけどね。明日は{tomorrow}、お手柔らかに。',
  'insight.todayOver.roast.2':
    'ラインは「ダメ」、今日は「あと{over}」。明日は{tomorrow}、第2ラウンドね。',
  'insight.todayOver.plain': '今日はラインを{over}超えています。明日のラインは{tomorrow}です。',

  'insight.todayUnder.soft.1': 'ここまで{spent}、まだ{safe}使えるよ。いいペース。',
  'insight.todayUnder.soft.2': '今日はまだ{safe}の余裕。順調だね。',
  'insight.todayUnder.cheeky.1': '今日の残りは{safe}。上手に使うも、残すも自由だよ。',
  'insight.todayUnder.cheeky.2': '{spent}使って、残り{safe}。スムーズ。',
  'insight.todayUnder.roast.1':
    'まだ{spent}だけ？財布もいい意味で戸惑ってるよ。{safe}はまだ使える。',
  'insight.todayUnder.roast.2': 'まだ{safe}使える。ちょっと怪しいくらい。この調子で。',
  'insight.todayUnder.plain': '今日の支出は{spent}、あと{safe}使えます。',

  'insight.noSpendYet.soft.1': 'まだ何も使ってないよ。今日の{line}はまるごとあなたのもの。',
  'insight.noSpendYet.soft.2': 'まっさらな一日。今日は{line}。',
  'insight.noSpendYet.cheeky.1': '今日は{line}、まだ無傷。今のところはね。',
  'insight.noSpendYet.cheeky.2': '今日の{line}、まるごと手つかず。今はまだ。',
  'insight.noSpendYet.roast.1': 'まだ使ってないね。{line}がどう出るか様子見してるよ。',
  'insight.noSpendYet.roast.2': '{line}が手つかずのまま。怪しい。そのまま続けて。',
  'insight.noSpendYet.plain': 'まだ支出はありません。今日のラインは{line}です。',

  'insight.waitingTonight.soft.1': {
    other: '今夜の確認待ちが{count}件（{amount}）。1分もあれば終わるよ。',
  },
  'insight.waitingTonight.soft.2': {
    other: '今夜見直すのは{count}件、合計{amount}だよ。',
  },
  'insight.waitingTonight.cheeky.1': {
    other: '{count}件（{amount}）が今夜の判決を待ってるよ。',
  },
  'insight.waitingTonight.cheeky.2': {
    other: '今夜の締め：{count}件、{amount}。楽勝。',
  },
  'insight.waitingTonight.roast.1': {
    other: '{count}件、{amount}が待機中。勝手には締まらないけど、1分で片づくよ。',
  },
  'insight.waitingTonight.roast.2': {
    other: '{count}件、{amount}が「うん、それ自分」の一言を待ってるよ。',
  },
  'insight.waitingTonight.plain': {
    other: '{count}件（{amount}）が今夜の締めを待っています。',
  },

  'insight.paydaySoon.soft.1': {
    other: '給料日まであと{count}日。もう少しだよ。',
  },
  'insight.paydaySoon.soft.2': {
    other: '給料日（{payday}）まであと{count}日。あとひと息、がんばろう。',
  },
  'insight.paydaySoon.cheeky.1': {
    other: '給料日まであと{count}日。においがしてきた。',
  },
  'insight.paydaySoon.cheeky.2': {
    other: '給料日まで、あと{count}回寝たら。',
  },
  'insight.paydaySoon.roast.1': {
    other: '給料日まであと{count}日。財布、持ちこたえて。',
  },
  'insight.paydaySoon.roast.2': {
    other: '給料日は{payday}。それまで財布のチャックは閉めておこう。',
  },
  'insight.paydaySoon.plain': {
    other: '給料日まであと{count}日です（{payday}）。',
  },

  'insight.billDueToday.soft.1': '今日は{bill}（{amount}）の支払日だよ。',
  'insight.billDueToday.soft.2': 'お知らせ：{bill}、{amount}が今日支払日だよ。',
  'insight.billDueToday.cheeky.1': '{bill}が今日{amount}を取りに来るよ。',
  'insight.billDueToday.cheeky.2': '今日のゲスト：{bill}、{amount}。',
  'insight.billDueToday.roast.1': '{bill}は今日が支払日。待ってはくれないよ。',
  'insight.billDueToday.roast.2': '今日は{bill}に{amount}。既読スルーはなしで。',
  'insight.billDueToday.plain': '今日は{bill}（{amount}）の支払日です。',

  'insight.billDue.soft.1': {
    other: '{bill}（{amount}）の支払日まであと{count}日だよ。',
  },
  'insight.billDue.soft.2': {
    other: 'お知らせ：{bill}、{amount}、あと{count}日。',
  },
  'insight.billDue.cheeky.1': {
    other: 'あと{count}日で{bill}が{amount}を取りに来るよ。',
  },
  'insight.billDue.cheeky.2': {
    other: 'あと{count}日：{bill}、{amount}。覚えておいてね。',
  },
  'insight.billDue.roast.1': {
    other: 'あと{count}日で{bill}が{amount}をご所望。いつものことだね。',
  },
  'insight.billDue.roast.2': {
    other: 'あと{count}日で{bill}に{amount}。驚いたふりはなしね。',
  },
  'insight.billDue.plain': {
    other: '{bill}（{amount}）の支払日まであと{count}日です。',
  },

  'insight.categoryPaceUp.soft.1':
    '{category}は今サイクル{now}。前回の同じ時点と比べて{compare}だね。',
  'insight.categoryPaceUp.soft.2':
    '{category}がハイペース。ここまで{now}、前のサイクルは{before}。',
  'insight.categoryPaceUp.cheeky.1':
    '{category}、もう{now}。前のサイクルは{before}だったのに。ふむ。',
  'insight.categoryPaceUp.cheeky.2': '{category}が絶好調：{before}→{now}。',
  'insight.categoryPaceUp.roast.1':
    '{category}が{now}。前のサイクルは{before}。見てるよ。静かな一週間で取り戻せるけどね。',
  'insight.categoryPaceUp.roast.2':
    '{category}にもう{now}。前回は{before}だったよ。愛をこめて言ってるだけ。',
  'insight.categoryPaceUp.plain': '{category}：今サイクル{now}、前サイクルの同時点は{before}です。',

  'insight.categoryPaceDown.soft.1': '{category}が前のサイクルの{before}から{now}に。すてき。',
  'insight.categoryPaceDown.soft.2': '{category}は前のサイクルと比べて{compare}。{before}→{now}。',
  'insight.categoryPaceDown.cheeky.1': '{category}：{before}から{now}にダウン。やるじゃん。',
  'insight.categoryPaceDown.cheeky.2': '{category}がダイエット中：{before}→{now}。',
  'insight.categoryPaceDown.roast.1':
    '{category}が{now}だけ？前は{before}だったのに。このままでいこう。',
  'insight.categoryPaceDown.roast.2': '{category}は{before}から{now}に。成長だね。',
  'insight.categoryPaceDown.plain':
    '{category}：今サイクル{now}、前サイクルの同時点は{before}です。',

  'insight.repeatMerchant.soft.1': '今週{merchant}に{visits}回。きっとお店にも愛されてるね。',
  'insight.repeatMerchant.soft.2': '月曜から{merchant}に{visits}回、合計{amount}。',
  'insight.repeatMerchant.cheeky.1': 'また{merchant}？月曜から{visits}回目だよ。',
  'insight.repeatMerchant.cheeky.2': '{merchant}と今週{visits}回デート、{amount}。',
  'insight.repeatMerchant.roast.1': '{merchant}、{visits}回目。もう名前で呼ばれてない？',
  'insight.repeatMerchant.roast.2': '今週{merchant}で{amount}。{visits}回。もはやライフスタイル。',
  'insight.repeatMerchant.plain': '{merchant}：今週{visits}回、{amount}。',

  'insight.firstTimeMerchant.soft.1': '{merchant}は初めてだね。よかったかな？',
  'insight.firstTimeMerchant.soft.2': '新しいお店：{merchant}、{amount}。',
  'insight.firstTimeMerchant.cheeky.1': '{merchant}？初めてのお店。冒険家だね。',
  'insight.firstTimeMerchant.cheeky.2': 'おっ、{merchant}。見ない顔だね。',
  'insight.firstTimeMerchant.roast.1': '{merchant}。お店は新しく、財布はいつもの。',
  'insight.firstTimeMerchant.roast.2': '{merchant}デビュー。クセにしないでね。してもいいけど。',
  'insight.firstTimeMerchant.plain': '{merchant}での初めての支出：{amount}。',

  'insight.biggestSpend.soft.1': '今週の大きな出費：{merchant}で{amount}。',
  'insight.biggestSpend.soft.2': '{merchant}、{amount}が今週いちばん。プランに入ってるから大丈夫。',
  'insight.biggestSpend.cheeky.1': '今週の主役：{merchant}、{amount}。',
  'insight.biggestSpend.cheeky.2': '{merchant}で{amount}。自分へのごほうび、なのかな。',
  'insight.biggestSpend.roast.1': '{merchant}で{amount}。今週の主人公だね。',
  'insight.biggestSpend.roast.2':
    '今週{merchant}が{amount}を持っていったよ。価値あった？答えなくていい。プランに入ってるから。',
  'insight.biggestSpend.plain': '今週いちばん大きな支出：{merchant}で{amount}。',

  'insight.underStreak.soft.1': '{days}日連続でライン内。安定してるね。',
  'insight.underStreak.soft.2': '穏やかな日が{days}日続いてるよ。',
  'insight.underStreak.cheeky.1': '{days}日連続ライン内。連勝モード突入。',
  'insight.underStreak.cheeky.2': '{days}日続けてライン内。口に出すと崩れるから静かにね。',
  'insight.underStreak.roast.1': '{days}日ライン内。ツッコミ用意してたのに出番なし。',
  'insight.underStreak.roast.2': '{days}日連続。そろそろネタ切れだよ。',
  'insight.underStreak.plain': '締めた日のうち{days}日連続でライン以内です。',

  'insight.closeStreak.soft.1': '{days}日連続で締めたね。これぞ習慣。',
  'insight.closeStreak.soft.2': '{days}日連続の締め。毎晩来てくれてありがとう。',
  'insight.closeStreak.cheeky.1': '{days}回連続で締め。実績解除：習慣化。',
  'insight.closeStreak.cheeky.2': '連続記録：{days}。今夜でまた伸びるよ。',
  'insight.closeStreak.roast.1': '{days}日連続。その記録、似合ってるよ。途切れさせないでね。',
  'insight.closeStreak.roast.2': '{days}回連続で締め。ここで途切れたらもったいない。',
  'insight.closeStreak.plain': '{days}日連続で締めています。',

  'insight.weekSpare.soft.1': {
    other: '今週{count}日がライン内。{spare}がこの先の日に回るよ。',
  },
  'insight.weekSpare.soft.2': {
    other: '今週は{spare}の余り。この先に持ち越しだよ。',
  },
  'insight.weekSpare.cheeky.1': {
    other: 'いい日が{count}日で{spare}の余り。未来の日たちが感謝してるよ。',
  },
  'insight.weekSpare.cheeky.2': {
    other: '今週は{spare}のプラス。スムーズ。',
  },
  'insight.weekSpare.roast.1': {
    other: '{count}日ライン内で{spare}の余り。一気に使わないでね。',
  },
  'insight.weekSpare.roast.2': {
    other: '今週は{spare}のプラス。まあ、許そう。',
  },
  'insight.weekSpare.plain': {
    other: '今週締めた日で{spare}が余りました。',
  },

  'insight.weekOver.soft.1': '今週は{over}オーバー。この先の日が少し小さくなるけど、それで大丈夫。',
  'insight.weekOver.soft.2': '今週は{over}オーバー。一緒にならしていこう。',
  'insight.weekOver.cheeky.1': '今週は{over}オーバー。残りの月が調整してくれるよ。',
  'insight.weekOver.cheeky.2': 'ここまで{over}オーバー。まさかの展開だけど、まだ最終回じゃない。',
  'insight.weekOver.roast.1': '今週は{over}オーバー。来週おとなしくすれば、月は持ちこたえるよ。',
  'insight.weekOver.roast.2': '{over}オーバー。今週は忘れて、月で取り戻そう。',
  'insight.weekOver.plain': '今週締めた日はラインを{over}超えました。',

  'insight.potMilestone.soft.1': '{pot}が{percent}%を突破。育ってるね。',
  'insight.potMilestone.soft.2': '{pot}への道のり、{percent}%まで来たよ。',
  'insight.potMilestone.cheeky.1': '{pot}：{percent}%達成。現実味が出てきた。',
  'insight.potMilestone.cheeky.2': '{pot}、{percent}%クリア。どんどん育てよう。',
  'insight.potMilestone.roast.1': '{pot}が{percent}%。貯金箱が勝ってる。勝たせてあげて。',
  'insight.potMilestone.roast.2': '{pot}まで{percent}%。つまみ食いは禁止ね。',
  'insight.potMilestone.plain': '{pot}は目標の{percent}%を超えました。',

  'insight.potFull.soft.1': '{pot}がいっぱいになったよ。やったね。',
  'insight.potFull.soft.2': '{pot}：達成。思いきり楽しんでね。',
  'insight.potFull.cheeky.1': '{pot}が満タン！紙吹雪、ただし控えめに。',
  'insight.potFull.cheeky.2': '{pot}、ふちまでいっぱい。',
  'insight.potFull.roast.1': '{pot}が満タン。ツッコミ用意してたのに、いらなかったね。',
  'insight.potFull.roast.2': '満タン：{pot}。さあ、本来の目的に使おう。',
  'insight.potFull.plain': '{pot}は目標に達しました。',

  'insight.workToClaim.soft.1': {
    other: '経費精算できる仕事の支出が{count}件（{amount}）あるよ。',
  },
  'insight.workToClaim.soft.2': {
    other: '仕事の{amount}、{count}件が精算待ちだよ。',
  },
  'insight.workToClaim.cheeky.1': {
    other: '会社に{amount}の貸しがあるよ。レシート{count}枚分。',
  },
  'insight.workToClaim.cheeky.2': {
    other: '仕事の支出が{count}件、{amount}。取り返しに行こう。',
  },
  'insight.workToClaim.roast.1': {
    other: '会社に貸してる{amount}。{count}回分。遠慮しないで。',
  },
  'insight.workToClaim.roast.2': {
    other: '仕事に{amount}も立て替えてるよ。精算しよう。',
  },
  'insight.workToClaim.plain': {
    other: '仕事の支出{count}件（{amount}）が経費精算を待っています。',
  },
};
