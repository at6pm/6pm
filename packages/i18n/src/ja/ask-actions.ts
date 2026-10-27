import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// The Vietnamese examples are what the parser reads, so they stay as they are.
export const jaAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': '追加',
  'ask.action.notNow': '今はしない',
  'ask.action.confirmSpend': '{name}、{amount}を{category}に追加しますか？',
  'ask.action.added': '追加しました。{name}、{amount}は今日の分に入ります。',
  'ask.action.cancelled': 'わかりました。何も変えていません。',
  'ask.action.failed': '保存できませんでした。クイック追加を使ってみてください。',
  'ask.action.confirmPot': '{name}の貯金箱：{goal}。作りますか？',
  'ask.action.confirmPotBy': '{name}の貯金箱：{month}までに{goal}。作りますか？',
  'ask.action.setUp': '作る',
  'ask.action.potLocked':
    '無料プランで持てる自分の貯金箱は1つで、もう使っています。Maxならもっと作れます。',
  'ask.action.seeMax': 'Maxを見る',
  'ask.action.potGoal': '{name}にはいくら必要ですか？「10tr」のように教えてください。',
  'ask.action.showMe': 'やり方を見る',
  'ask.action.openQuickAdd': 'クイック追加を開く',
  'ask.howTo.ways':
    '入口は6つ：クイック追加（入力か音声）、銀行のレシートを6pmに共有、レシートメールの転送、VietQRをスキャンして支払い、自動で届くApple Payのタップ、そしてウィジェットとコントロールです。6pmがキャッチしたものは、締めまでインボックスで待っています。',
  'ask.howTo.quickAdd':
    'クイック追加では、「trà sữa 45k」のように支出を入力するか声で伝えられます。ここで直接「vừa ăn phở 50k」と話しかけてもOKです。',
  'ask.howTo.dailyNumber':
    '今日の数字は、この給料サイクルで自由に使えるお金（固定費、未来の自分、貯金箱を引いた残り）を、給料日までの残り日数で割ったものです。下回れば明日の数字が増え、超えれば明日の数字が少し減ります。',
  'ask.howTo.negative':
    'このサイクルの支出が自由に使えるお金を超えると、マイナスになります。何も壊れません。プランが残りの日に分散させます。数日控えめにするか、プランで貯金箱から少し出しましょう。',
  'ask.howTo.pot':
    '貯金箱は、旅行やテトなど、ひとつの目的のために取っておくお金です。6pmが毎月少しずつ入れて今日の数字から外しておくので、必要なときにちゃんとあります。',
  'ask.howTo.close':
    '18時に一日を締めます。キャッチしたものを残すかスキップして、着地点を確認します。忘れても何も失われません。キャッチした支出は、決めるまで待っていて、数字にも入っています。',
  'ask.howTo.budget':
    '6pmにはカテゴリ別の予算はありません。今日の数字が予算です。固定費、未来の自分、貯金箱はもう取り分けてあります。何かを減らしたいなら、プランで貯金箱を作るか、未来の自分への額を増やしましょう。',
};
