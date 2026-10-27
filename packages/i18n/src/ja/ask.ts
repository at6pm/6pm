import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// 6pm answers in friendly です・ます; the suggested questions are the user's own casual voice.
export const jaAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': '6pmに聞く',
  'ask.sub': '使える？もしも？いつ貯まる？',
  'ask.back': '戻る',
  'ask.intro':
    '何なら使えるか、大きな出費でこの先の日がどう変わるか、貯金箱がいつ満タンになるか。聞いてくれたら計算も見せます。',
  'ask.try': '聞いてみる',
  'ask.placeholder': '質問するか、話しかけて…',
  'ask.send': '送信',
  'ask.speak': '声で聞く',
  'ask.listening': '聞いています…',
  'ask.suggest.afford': '土曜に{amount}のディナー、行ける？',
  'ask.suggest.weekend': '今週末はいくら使える？',
  'ask.suggest.spend': '{amount}のジャケットを買ったら？',
  'ask.suggest.pot': '{pot}はいつ貯まる？',
  'ask.suggest.save': 'もっと貯めたほうがいい？',
  'ask.meter': '今日の無料質問：残り{left}/{total}',
  'ask.unlimitedWith': '無制限にするなら',
  'ask.locked.title': '今日の{total}問を使い切りました',
  'ask.locked.sub': 'また明日。Maxなら無制限です',
  'ask.locked.cta': 'Maxにする',
  'ask.bar.now': '今',
  'ask.bar.after': 'そのあと',
  'ask.bar.perDay': '1日{amount}',
  'ask.bar.nothing': 'ゼロ',
  'ask.row.free': '給料日まで自由に使える',
  'ask.row.this': 'これ',
  'ask.row.leftPerDay': '残り（1日あたり）',
  'ask.row.safeToday': '今日使えるお金',
  'ask.row.tomorrow': '明日',
  'ask.row.futureYou': '毎月の未来の自分',
  'ask.row.moving': '追加で回す額',
  'ask.row.inPot': '貯金箱の中',
  'ask.row.goal': '目標',
  'ask.row.perMonth': '毎月',
  'ask.answer.fitsToday': 'はい、余裕です。今日の{safe}に収まるので、明日は変わりません。',
  'ask.answer.fits': 'はい。給料日までの1日あたりが{from}から{to}になります。',
  'ask.answer.tight': '使えますが、ギリギリです。この先の1日あたりが{from}から{to}に下がります。',
  'ask.answer.tight.pots': '貯金箱から{take}出せば、1日{withPots}を保てます。',
  'ask.answer.notThisMonth':
    '今月は無理です。自由に使えるお金を全部合わせても足りません。給料日（{payday}）のあとなら収まります。',
  'ask.answer.notThisMonth.pots': 'または、一部を貯金箱から出すこともできます。',
  'ask.answer.weekend.two': 'それまでの日がプランどおりなら、{first}と{second}で約{total}です。',
  'ask.answer.weekend.one': 'それまでの日がプランどおりなら、{first}は約{total}です。',
  'ask.answer.weekend.none':
    '週末の前に給料日（{payday}）が来るので、そこで新しい数字が始まります。',
  'ask.answer.saveMore': '未来の自分にあと{amount}回すと、給料日まで1日あたり約{perDay}減ります。',
  'ask.answer.saveMore.none': '未来の自分にあと{amount}回しても、毎日にはほとんど影響しません。',
  'ask.answer.saveMore.note': 'プランから設定できます。',
  'ask.answer.potFull': '毎月{monthly}なら、{pot}の貯金箱は{month}までに満タンになります。',
  'ask.answer.potFull.done': '{pot}の貯金箱はもう満タンです。',
  'ask.answer.potFull.idle':
    '今は{pot}の貯金箱に毎月の積み立てがないので、自然には満タンになりません。',
  'ask.answer.noSuchPot':
    '{pot}という貯金箱が見つかりません。あなたの貯金箱について聞くか、プランで作ってください。',
  'ask.answer.noPots':
    'まだ貯金箱がありません。プランで作ってくれたら、いつ満タンになるかお知らせします。',
  'ask.answer.today': '今日は{safe}使えます。明日の数字は{tomorrow}です。',
  'ask.answer.today.used': '今日の数字は使い切りました。明日は{tomorrow}です。',
  'ask.answer.help':
    '何なら使えるか、大きな出費でこの先の日がどう変わるか、貯金箱がいつ満タンになるかを答えられます。「土曜に{amount}使っても大丈夫？」と聞いてみてください。',
  'ask.error': 'うまくいかず、答えられませんでした。もう一度お試しください。',
  'ask.answer.offline': 'サーバーに接続できないため、今はかんたんな質問しか読み取れません。',
};
