import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const jaNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': '給料日',
  'notify.channel.capture': '支出のキャッチ',
  'notify.channel.reminders': '自分で設定したリマインダー',

  'notify.close.leadSix': '6時です。',
  'notify.close.leadAt': '{time}です。',

  'notify.close.jarReady.soft': '{lead}{jar}の貯金びんの準備ができました。',
  'notify.close.jarReady.cheeky': '{lead}{jar}の貯金びんの準備ができました。のぞいてみて。',
  'notify.close.jarReady.roast': '{lead}{jar}の貯金びん、準備完了。やればできるじゃないですか。',
  'notify.close.jarReady.plain': '{lead}{jar}の貯金びんの準備ができています。',

  'notify.close.countdown.soft': { other: '{lead}{festival}まであと{count}日。' },
  'notify.close.countdown.cheeky': {
    other: '{lead}{festival}まであと{count}日。ランタンが飾られ始めました。',
  },
  'notify.close.countdown.roast': {
    other: '{lead}{festival}まであと{count}日。お財布をしっかり守って。',
  },
  'notify.close.countdown.plain': { other: '{lead}{festival}まであと{count}日です。' },
  'notify.close.countdownJar.soft': {
    other: '{lead}{festival}まであと{count}日。{festival}の貯金箱には{amount}。',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead}{festival}まであと{count}日。貯金箱に{amount}貯まっています。',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead}{festival}まであと{count}日。貯金箱に{amount}。しっかり守って。',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead}{festival}まであと{count}日です。{festival}の貯金箱は{amount}です。',
  },

  'notify.close.pay.soft': '{lead}お給料が振り分けを待っています。',
  'notify.close.pay.cheeky': '{lead}お給料が入りました。仕事を割り振ってあげて。',
  'notify.close.pay.roast': '{lead}お給料が着地。どこかへ消える前に振り分けを。',
  'notify.close.pay.plain': '{lead}給料の振り分けがまだです。',

  'notify.close.bonus.soft': '{lead}{festival}のボーナスが振り分けを待っています。',
  'notify.close.bonus.cheeky': '{lead}{festival}のボーナスが届きました。分けに来て。',
  'notify.close.bonus.roast': '{lead}{festival}のボーナスが着地。お店に見つかる前に振り分けを。',
  'notify.close.bonus.plain': '{lead}{festival}のボーナスの振り分けがまだです。',

  'notify.close.payback.soft': '{lead}{name}が返してくれました。',
  'notify.close.payback.cheeky': '{lead}{name}が返してくれました。友情は無事です。',
  'notify.close.payback.roast': '{lead}{name}、ちゃんと返してくれました。',
  'notify.close.payback.plain': '{lead}{name}から返金がありました。',

  'notify.close.moneyIn.soft': '{lead}入金がありました。締めで待っています。',
  'notify.close.moneyIn.cheeky': '{lead}入金がありました。行き先を決めてあげて。',
  'notify.close.moneyIn.roast': '{lead}入金がありました。変な気を起こす前に。',
  'notify.close.moneyIn.plain': '{lead}入金がありました。締めで振り分けてください。',

  'notify.close.yearCard.soft': '{lead}{year}年を振り返る準備ができました。',
  'notify.close.yearCard.cheeky': '{lead}あなたの{year}年ができあがりました。見てみる？',
  'notify.close.yearCard.roast': '{lead}{year}年のすべてです。見る勇気、ありますか？',
  'notify.close.yearCard.plain': '{lead}{year}年の振り返りの準備ができています。',

  'notify.payday.amounts.soft': '給料日です。貯金びんに{jars}、{date}まで1日{daily}。',
  'notify.payday.amounts.cheeky': '給料日！貯金びんに{jars}、{date}まで1日{daily}。',
  'notify.payday.amounts.roast': '給料日です。まばたきする間に{jars}を貯金、{date}まで1日{daily}。',
  'notify.payday.amounts.plain': '給料日。貯金びんへ{jars}、{date}まで1日{daily}。',
  'notify.payday.noJars': '給料日です。{date}まで1日{daily}。',
  'notify.payday.hidden': '給料日です。貯金びんに入れておきました。',
  'notify.payday.hiddenNoJars': '給料日です。新しい月が始まります。',

  'notify.firstCatch.amounts.soft': '最初の1件をキャッチ：{amount} · {name}。これだけです。',
  'notify.firstCatch.amounts.cheeky': '最初の1件をキャッチ：{amount} · {name}。簡単でしょ？',
  'notify.firstCatch.amounts.roast':
    '最初の1件をキャッチ：{amount} · {name}。痛くもなかったでしょ。',
  'notify.firstCatch.amounts.plain': '最初の1件：{amount} · {name}。',
  'notify.firstCatch.hidden': '{name}での最初の1件をキャッチしました。これだけです。',
  'notify.firstCatch.noName': '最初の1件をキャッチしました。これだけです。',

  'notify.quiet.soft':
    '{count}日間、{way}から何も届いていません。オートメーションはオンのままですか？',
  'notify.quiet.cheeky':
    '{count}日間、{way}から何も届いていません。節約中？それともオートメーションがオフ？',
  'notify.quiet.roast':
    '{count}日間、{way}から何も届いていません。聖人なのか、オートメーションがオフなのか。',
  'notify.quiet.plain':
    '{count}日間、{way}から何も届いていません。オートメーションがオンか確認してください。',
  'notify.quiet.yourAlerts': '銀行の通知',

  'notify.owed.one.soft': '{name}にまだ{amount}貸しています。都合のいいときに声をかけて。',
  'notify.owed.one.cheeky': '{name}にまだ{amount}貸しています。そろそろやんわり声をかける？',
  'notify.owed.one.roast': '{name}にまだ{amount}貸しています。お金があなたを恋しがっています。',
  'notify.owed.one.plain': '{name}に{amount}貸しています。',
  'notify.owed.oneHidden': '{name}にまだ貸しています。都合のいいときに声をかけて。',
  'notify.owed.noName': 'まだ{amount}が戻っていません。',
  'notify.owed.noNameHidden': 'まだ戻っていないお金があります。都合のいいときに声をかけて。',
  'notify.owed.many': '{count}人にまだ{amount}貸しています。',
  'notify.owed.manyHidden': '{count}人にまだ貸しています。',

  'settings.notifications': '通知',
  'settings.notificationsOn': 'オン',
  'notify.settings.title': '通知',
  'notify.settings.phone': 'このスマホ',
  'notify.settings.allowed': '許可済み',
  'notify.settings.turnOn': 'オンにする',
  'notify.settings.offInSettings': '設定でオフ',
  'notify.settings.offSub': 'オンにするまで何も届きません。',
  'notify.settings.kinds': '6pmが送るもの',
  'notify.kind.close': '締めの通知',
  'notify.kind.close.sub': '毎日{time}に、その日のお知らせと一緒に',
  'notify.kind.payday': '給料日',
  'notify.kind.payday.sub': '給料が入る日の朝、08:30に',
  'notify.kind.capture': '支出のキャッチ',
  'notify.kind.capture.sub': '最初のキャッチと、静かになった経路',
  'notify.kind.reminders': '自分で設定したリマインダー',
  'notify.kind.reminders.sub': '貸している相手を、選んだ日に',
  'notify.settings.lockScreen': 'ロック画面',
  'notify.settings.amounts': 'ロック画面に金額を表示',
  'notify.settings.amounts.sub': 'オフのときは数字を出しません',
  'notify.settings.note':
    '1日1回が習慣です。締めの通知がその日のお知らせを届けます。ほかは1日最大1件まで、22:00〜08:00は締めの通知だけです。',

  'owed.remind.button': 'リマインド',
  'owed.remind.threeDays': '3日後',
  'owed.remind.week': '1週間後',
  'owed.remind.payday': '給料日に',
  'owed.remind.set': 'リマインド：{date}',
  'owed.remind.cancel': 'リマインドしない',
  'owed.remind.toast': '{date} 10:00にお知らせします。',
  'owed.remind.off': '自分で設定したリマインダーは設定でオフになっています。',
};
