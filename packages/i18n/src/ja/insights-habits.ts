import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other insight lines: casual companion, です・ます for plain. Cheeky and roast
// poke at the purchase or the pattern, never the person.
export const jaInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': '一円も使わなかった一日。{kept}がまるごと残ったよ。',
  'insight.noSpendDay.soft.2': 'ノースペンドデー。{kept}をキープ、静かにすてき。',
  'insight.noSpendDay.cheeky.1': '支出ゼロ、{kept}は無傷。財布もお休みの日だったね。',
  'insight.noSpendDay.cheeky.2': 'まる一日、支出なし。{kept}がありがとうって。',
  'insight.noSpendDay.roast.1': '支出ゼロで{kept}は無傷。どちらさま？ずっといてほしい。',
  'insight.noSpendDay.roast.2': '支出は一件もなし、{kept}キープ。お店はなんとかやっていけるよ。',
  'insight.noSpendDay.plain': '前回締めた日は支出がなく、ラインのうち{kept}が残りました。',

  'insight.noSpendStreak.soft.1': '静かな日が{days}日続いて、{kept}が手つかず。',
  'insight.noSpendStreak.soft.2': '{days}日間、支出なし。{kept}がそのまま残ってるよ。',
  'insight.noSpendStreak.cheeky.1': '{days}日間、支出ゼロ。財布が怪しみはじめてる。',
  'insight.noSpendStreak.cheeky.2': '{days}日連続ノースペンド。{kept}はのんびり休憩中。',
  'insight.noSpendStreak.roast.1': '{days}日間、支出ゼロ。いつものカフェが心配してるよ。',
  'insight.noSpendStreak.roast.2': '{days}日間ノースペンド、{kept}は無傷。逆にちょっと心配。',
  'insight.noSpendStreak.plain': '締めた日のうち{days}日連続で支出なし。{kept}が残りました。',

  'insight.backUnder.soft.1': 'オーバーの翌日、ライン内に戻って{spare}の余り。おみごと。',
  'insight.backUnder.soft.2': 'オーバーの日のあとは{spare}残してライン内。それがリズムだね。',
  'insight.backUnder.cheeky.1': '名誉挽回の回：ライン内に復帰、{spare}の余り。',
  'insight.backUnder.cheeky.2': '昨日はオーバー、今日は{spare}残してライン内。バランス。',
  'insight.backUnder.roast.1': 'オーバーの翌日に{spare}のライン内。おわび、受け取りました。',
  'insight.backUnder.roast.2': '{spare}残してライン内に復帰。待ってたよ、この逆転劇。',
  'insight.backUnder.plain': 'オーバーの翌日、ライン内に戻りました。余りは{spare}です。',

  'insight.logGap.soft.1': '{since}から記録がないよ。静かな日々？それとも忙しかった？',
  'insight.logGap.soft.2': '{days}日間、支出の記録がないよ。追加するものはある？',
  'insight.logGap.cheeky.1': '{since}から記録なし。修行モード？それとも忙しいだけ？',
  'insight.logGap.cheeky.2': '{days}日間、記録ゼロ。財布がバカンスに出かけた？',
  'insight.logGap.roast.1': '{since}から何もなし。本当にゼロ？それとも書いてないだけ？',
  'insight.logGap.roast.2': '{days}日間の沈黙。コーヒー1杯でも立派な記録。足せば帳消しだよ。',
  'insight.logGap.plain': '{since}から支出の記録がありません。',

  'insight.weekendHeavy.soft.1':
    '最近は週末が1日{weekend}くらい、平日は{weekday}。土曜の前にちょっと考えてみて。',
  'insight.weekendHeavy.soft.2': '週末は1日{weekend}、平日は{weekday}。ゆっくりいこう。',
  'insight.weekendHeavy.cheeky.1': '平日は1日{weekday}、週末は{weekend}。土曜日が何か企んでるよ。',
  'insight.weekendHeavy.cheeky.2':
    '週末は1日平均{weekend}、平日は{weekday}。もうすぐ週末。準備はいい？',
  'insight.weekendHeavy.roast.1':
    '平日{weekday}、週末{weekend}。週末の連勝が止まらない。そろそろ引き分けにする？',
  'insight.weekendHeavy.roast.2': '週末は1日{weekend}、平日は{weekday}。今週末はリベンジマッチ？',
  'insight.weekendHeavy.plain': '直近4週間：週末は1日{weekend}、平日は1日{weekday}。',

  'insight.recordDay.soft.1':
    '今日は{amount}、ここ{days}日でいちばんの日。大丈夫、明日はリセット。',
  'insight.recordDay.soft.2': '今日の{amount}はここ{days}日で最多。プランがうまく合わせるよ。',
  'insight.recordDay.cheeky.1':
    '今日は{amount}。最高記録、ただし欲しかったグラフじゃない。明日はリセット。',
  'insight.recordDay.cheeky.2': '新記録：{amount}、ここ{days}日でトップ。連覇は狙わないでおこう。',
  'insight.recordDay.roast.1':
    '今日は{amount}、ここ{days}日で最大。大胆だね。明日のアンコールは控えめに。',
  'insight.recordDay.roast.2': '1日で{amount}、{days}日ぶりの記録。額に飾って、あとは休もう。',
  'insight.recordDay.plain': '今日の{amount}は、直近{days}日で1日の支出が最も多い額です。',

  'insight.likelySubscription.soft.1': '{merchant}から毎月{amount}くらいの請求。固定費にする？',
  'insight.likelySubscription.soft.2': '{merchant}に{amount}、{months}か月連続。固定費にしておく？',
  'insight.likelySubscription.cheeky.1':
    'また{merchant}、{amount}。時計みたいに正確。サブスクだよね？固定費にする？',
  'insight.likelySubscription.cheeky.2':
    '{merchant}に{amount}を{months}か月。まだ使ってる？固定費に追加しよう。',
  'insight.likelySubscription.roast.1':
    '{merchant}：{amount}、{months}か月連続。使ってる？それとも払ってるだけ？',
  'insight.likelySubscription.roast.2':
    '毎月{merchant}に{amount}。続けるなら固定費に。やめるなら解約を。',
  'insight.likelySubscription.plain':
    '{merchant}から{months}か月間、毎月約{amount}の請求があります。固定費として登録できます。',

  'insight.lateNight.soft.1': '深夜に{merchant}で{amount}。役に立ったならいいな。',
  'insight.lateNight.soft.2': '夜遅くに{merchant}、{amount}。ゆっくり休んでね。',
  'insight.lateNight.cheeky.1': 'とっくに寝る時間に{merchant}で{amount}。夜ふかしショッピング。',
  'insight.lateNight.cheeky.2': '深夜の{merchant}、{amount}。定番だね。',
  'insight.lateNight.roast.1': '真夜中に{merchant}で{amount}。大きな決断は明るいうちにね。',
  'insight.lateNight.roast.2': '夜の{merchant}で{amount}。次はカートをひと晩寝かせよう。',
  'insight.lateNight.plain': '深夜の支出：{merchant}で{amount}。',

  'insight.cycleHalfway.soft.1': 'サイクルの折り返し：{percent}%使って、残り{left}。',
  'insight.cycleHalfway.soft.2':
    'サイクルも半分、まだ{left}が自由に使える。記録を続けてる、それがいちばん大変なところ。',
  'insight.cycleHalfway.cheeky.1': 'ハーフタイム。スコア：{percent}%使用、残り{left}で勝負。',
  'insight.cycleHalfway.cheeky.2': '折り返し地点。後半戦は{left}。',
  'insight.cycleHalfway.roast.1': 'ハーフタイム：{percent}%使用。後半は{left}、うまく戦おう。',
  'insight.cycleHalfway.roast.2': '折り返しで{percent}%消化、残り{left}。勝負は後半で決まる。',
  'insight.cycleHalfway.plain': 'サイクルの半分が過ぎました：{percent}%使用、残り{left}です。',

  'insight.firstWeekPaceUp.soft.1':
    '最初の1週間でサイクルの{percent}%を使ったよ。均等なペースなら{even}%。この先の週でならせるよ。',
  'insight.firstWeekPaceUp.soft.2':
    '忙しい最初の1週間：サイクルのお金の{percent}%。落ち着いた日が続けば戻るよ。',
  'insight.firstWeekPaceUp.cheeky.1':
    '1週目：{percent}%消化、均等ペースなら{even}%。好スタート。ちょっと好すぎ？',
  'insight.firstWeekPaceUp.cheeky.2': '1週目で{percent}%。均等なら{even}%。ペース配分ね。',
  'insight.firstWeekPaceUp.roast.1':
    '1週目がサイクルの{percent}%を平らげたよ。均等なら{even}%。残りの週がひとこと言いたいって。',
  'insight.firstWeekPaceUp.roast.2':
    '均等なら{even}%のところ、1週間で{percent}%。ダッシュはおしまい、ここからジョグで。',
  'insight.firstWeekPaceUp.plain':
    '最初の1週間でサイクルのお金の{percent}%を使いました。均等なペースは{even}%です。',

  'insight.firstWeekPaceDown.soft.1':
    '最初の1週間で使ったのはサイクルの{percent}%だけ。均等なペースなら{even}%。いいスタート。',
  'insight.firstWeekPaceDown.soft.2':
    'おだやかな1週目：{percent}%使用、均等なペースと比べて{compare}だよ。',
  'insight.firstWeekPaceDown.cheeky.1':
    '1週目：たったの{percent}%、均等の{even}%を下回ってる。快調。',
  'insight.firstWeekPaceDown.cheeky.2': '1週目：{percent}%。均等なら{even}%。見てよ、これ。',
  'insight.firstWeekPaceDown.roast.1':
    '1週目は{percent}%、均等の{even}%より下。怪しいほど優秀。そのままでね。',
  'insight.firstWeekPaceDown.roast.2': '1週目で{percent}%、均等は{even}%。言うことなし。',
  'insight.firstWeekPaceDown.plain':
    '最初の1週間でサイクルのお金の{percent}%を使いました。均等なペースは{even}%です。',

  'insight.paceSpare.soft.1': 'このペースなら、給料日（{payday}）に{spare}くらい余りそう。',
  'insight.paceSpare.soft.2': 'この調子なら{payday}に{spare}くらい残るよ。',
  'insight.paceSpare.cheeky.1': '{payday}の余り予想：{spare}。頭の中で使わないでね。',
  'insight.paceSpare.cheeky.2': 'このペースなら{payday}までに{spare}の余り。いいね。',
  'insight.paceSpare.roast.1': 'このペースで{payday}に{spare}の余り。まだないお金は使わないでね。',
  'insight.paceSpare.roast.2': '予報：{payday}に{spare}の残り。予報を外さないようにね。',
  'insight.paceSpare.plain': 'これまでのペースだと、給料日（{payday}）に約{spare}が残ります。',

  'insight.paceShort.soft.1':
    'このペースだと給料日（{payday}）の前、{runsOut}ごろに苦しくなりそう。控えめな日が何日かあれば大丈夫。',
  'insight.paceShort.soft.2':
    'お知らせ：このペースだと{runsOut}ごろに足りなくなりそう。控えめな日で調整できるし、時間もあるよ。',
  'insight.paceShort.cheeky.1':
    'このルートだと{runsOut}ごろにガス欠。給料日は{payday}。ルート変更する？',
  'insight.paceShort.cheeky.2':
    'このペースだと{runsOut}ごろにお金が尽きそう。給料日は{payday}。この先はやさしい日で。',
  'insight.paceShort.roast.1':
    'このペースだと{runsOut}ごろに干上がる、給料日は{payday}なのに。静かな日が何日かあれば着地できるよ。',
  'insight.paceShort.roast.2':
    '{runsOut}：このペースでお金が尽きる日。{payday}：給料日。その差を埋めよう。',
  'insight.paceShort.plain':
    'これまでのペースだと、給料日（{payday}）より前の{runsOut}ごろにお金が尽きます。',
};
