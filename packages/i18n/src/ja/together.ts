import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// Budget together is ふたりで家計; a shared pot is a 共有の貯金箱.
export const jaTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'ふたりで家計',
  'together.card.subOn': '誰かを招待して貯金箱を共有しましょう。',
  'together.card.subPaired': { other: '{name}と · 共有の貯金箱{count}個' },
  'together.card.open': 'ふたりで家計を開く',
  'together.you': 'あなた',
  'together.partner': 'パートナー',

  'together.intro.title': 'ふたりで貯めよう。',
  'together.intro.sub':
    '一緒に貯める相手と貯金箱を共有できます。ふたりとも入金でき、誰がいくら入れたかがお互いに見えます。あなた自身の毎日の記録はあなたのスマホから出ません。',
  'together.intro.note':
    'Appleでサインインは、ふたりで家計のためだけに使います。6pmが求めるのは名前（名）だけで、メールアドレスは求めません。',
  'together.signIn.failed': 'Appleでサインインできませんでした。もう一度お試しください。',
  'together.signIn.unavailable': 'このiPhoneではAppleでサインインを使えません。',

  'together.waiting.title': '今はまだあなただけです。',
  'together.waiting.sub':
    '一緒に貯める相手にリンクを送りましょう。参加すると、共有の貯金箱が見られるようになります。',
  'together.paired.title': 'あなたと{name}',
  'together.paired.sub': { other: '共有の貯金箱{count}個' },
  'together.invite': '招待する',
  'together.invite.again': '新しい招待リンクを送る',
  'together.invite.message': '6pmで一緒に貯めよう：{url}',
  'together.invite.note': '招待リンクは1回だけ、7日間有効です。',
  'together.offline': 'オフラインです。前回表示した内容です。',

  'together.pots.title': '共有の貯金箱',
  'together.newPot': '新しい共有の貯金箱',
  'together.newPotSub': 'ふたりで入金できます。',
  'together.jar.add': '{name}に{amount}を入れる',
  'together.jar.split': 'あなた {mine} · {partner} {theirs}',
  'together.jar.mine': 'あなたが入れた額：{mine}',

  'together.pot.edit': '共有の貯金箱を編集',
  'together.pot.start': '共有の貯金箱を始める',
  'together.pot.save': '保存',
  'together.pot.sumMonthly': 'ふたり合わせて月に約{amount}',
  'together.pot.sumSub': 'あなたが入れた分は、自分の貯金箱への入金と同じように数えられます。',
  'together.pot.sumNone': '期限なし、急がなくてOK',
  'together.pot.sumNoneSub': '好きなときに入れましょう。',
  'together.pot.amount': '入れる額',
  'together.pot.addButton': '{amount}を入れる',
  'together.pot.entries': '誰がいくら入れたか',
  'together.pot.empty': 'まだ何も入っていません。',
  'together.pot.entry': '{who} · {day}',
  'together.pot.takeBack': '取り消す',
  'together.pot.takeBackLabel': '{amount}を取り消す',
  'together.pot.delete': '共有の貯金箱を削除',
  'together.pot.deleteConfirm': 'もう一度タップすると、ふたりとも削除されます',
  'together.pot.deleted': '{name}を削除しました',
  'together.pot.gone': 'この貯金箱はなくなりました。パートナーが削除したのかもしれません。',

  'together.leave': 'ふたりで家計をやめる',
  'together.leaveConfirm': 'もう一度タップしてやめる',
  'together.leave.note':
    'やめると、ふたりとも終了になり、共有の貯金箱はサーバーから削除されます。それぞれが入れた分は、各自のスマホに残ります。',
  'together.deleteAccount': 'ふたりで家計のアカウントを削除',
  'together.deleteConfirm': 'もう一度タップしてアカウントを削除',
  'together.delete.note':
    'サインイン情報と共有しているものすべてを削除し、6pmがあなたのAppleアカウントを使わなくなったことをAppleに伝えます。あなた自身の毎日の記録はこのスマホに残ります。',
  'together.kept.title': 'このiPhoneに保存',
  'together.kept.sub': '共有の貯金箱に入れた額：{amount}。貯金箱がなくなっても、ここに残ります。',

  'together.join.title': 'ふたりで家計に参加',
  'together.join.sub':
    '6pmで貯金箱を共有しようと招待されています。Appleでサインインして参加しましょう。あなた自身の毎日の記録はあなたのスマホから出ません。',
  'together.join.button': '参加する',
  'together.join.expired': 'この招待は期限切れです。新しいリンクをもらってください。',
  'together.join.used': 'この招待はすでに使われています。新しいリンクをもらってください。',
  'together.join.full': 'そこではすでに2人が貯金箱を共有しています。',
  'together.join.own': 'これはあなた自身の招待です。一緒に貯める相手に送りましょう。',
  'together.join.paired':
    'すでに貯金箱を共有しています。先にふたりで家計をやめてから、もう一度リンクを開いてください。',
  'together.join.missing': 'この招待リンクは使えません。新しいリンクをもらってください。',

  'together.error.offline': '6pmに接続できませんでした。何も変更されていません。',
  'together.error.failed': 'うまくいきませんでした。何も変更されていません。',
  'together.ended': 'ふたりで家計は終了しました。あなたが入れた分はこのスマホに残ります。',
  'together.left': 'ふたりで家計をやめました。',
  'together.deleted': 'ふたりで家計のアカウントを削除しました。',
  'together.joined': '参加しました。{name}とふたりで家計を始めます。',
};
