import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const jaCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': '銀行の通知をキャッチ',
  'native.intents.catchAlert.description':
    'iPhoneに届いた銀行やウォレットの通知を読み取り、動いたお金を6pmのインボックスに入れます。認証コード、失敗した支払い、プロモーションはスキップします。',
  'native.intents.catchAlert.alertTitle': 'タイトル',
  'native.intents.catchAlert.subtitle': 'サブタイトル',
  'native.intents.catchAlert.body': '本文',
  'native.intents.catchAlert.date': '日付',
  'native.intents.catchAlert.app': 'App',
  'capture.alerts.name': '銀行の通知',
  'capture.alerts.sub': '銀行とウォレットの通知を自動で記録',
  'capture.alerts.headline': '銀行とウォレットの通知が、勝手に記録されます。',
  'capture.alerts.time': '最初に1分ほど',
  'capture.alerts.step1': 'ショートカットで通知のオートメーションを追加',
  'capture.alerts.step1Chip': 'オートメーション → 通知',
  'capture.alerts.step2': '銀行とウォレットのアプリを選ぶ',
  'capture.alerts.step3': '「銀行の通知をキャッチ」を実行するように設定',
  'capture.alerts.step3Chip': '銀行の通知をキャッチ',
  'capture.alerts.tip':
    '認証コード、失敗した支払い、プロモーションはスキップします。Apple Payやメールでキャッチ済みの支払いは、二重に追加されません。',
  'capture.alerts.privacy': '通知はiPhoneの中で読み取られ、外に出ることはありません。',
  'capture.alerts.cameIn': '{amount}の入金',
  'capture.alerts.skip.code': '認証コードのためスキップ',
  'capture.alerts.skip.failed': '支払い失敗のためスキップ',
  'capture.alerts.skip.promo': 'プロモーションのためスキップ',
  'capture.alerts.skip.balance': '残高のお知らせのためスキップ',
  'capture.alerts.skip.security': 'セキュリティのお知らせのためスキップ',
  'capture.alerts.skip.unread': '支払いではないためスキップ',
  'capture.alerts.actionAdd': '6pmのショートカットを追加',
  'capture.alerts.actionOpen': 'ショートカットを開く',
  'capture.walk.alerts.s1Title': 'オートメーションを開いて＋をタップ',
  'capture.walk.alerts.s1Body':
    'ショートカットで「ライブラリ」→「オートメーション」→「＋」をタップします。「ショートカットを説明」が表示されたら「編集」をタップします。',
  'capture.walk.alerts.s2Title': '通知のトリガーを追加',
  'capture.walk.alerts.s2Body':
    '下のパネルで「オートメーション」→「通知」をタップします。「次のAppから通知を受信したとき」のカードが表示されます。',
  'capture.walk.alerts.s3Title': '銀行とウォレットを選ぶ',
  'capture.walk.alerts.s3Body':
    '「App」をタップして銀行を選びます。支払いに使うほかの銀行やウォレットのアプリも、「＋」をタップして追加します。',
  'capture.walk.alerts.s4Title': '「銀行の通知をキャッチ」を追加',
  'capture.walk.alerts.s4Body':
    '「検索」をタップして「銀行の通知」と入力し、6pmの「銀行の通知をキャッチ」をタップします。「タイトル」「サブタイトル」「本文」「日付」を、それぞれ通知の同じ項目に設定します。',
  'capture.walk.alerts.s5Title': '「通知」をオフにして戻る',
  'capture.walk.alerts.s5Body':
    'トリガーの「›」をタップし、「オートメーション」はオン、「通知」はオフのままにします。これで銀行の通知が静かにキャッチされます。戻ると保存されます。',
  'capture.walk.alerts.s6Title': '試してみる',
  'capture.walk.alerts.s6Body':
    '選んだアプリのどれかで少額を支払ってください。通知が届けば、支払いはインボックスに入っています。',
  'capture.walk.alerts.l1Title': '6pmのショートカットを追加',
  'capture.walk.alerts.l1Body':
    '上の「6pmのショートカットを追加」をタップし、「ショートカットを追加」をタップします。名前は「Catch a bank alert」です。',
  'capture.walk.alerts.l2Body':
    'ショートカットでそれを開き、上の「App」をタップして銀行を選びます。ほかの銀行やウォレットも「＋」で追加します。',
  'capture.walk.alerts.mistake1':
    '「タイトル」「本文」「日付」が空のまま。それぞれタップして通知の同じ項目を選ばないと、何も記録されません。',
  'capture.walk.alerts.mistake2':
    '「通知」がオンのまま。通知のたびにもう一度知らせが届き、静かにキャッチされません。',
  'capture.walk.alerts.mistake3':
    'アプリをひとつしか選んでいない。MoMoやZaloPayも含め、使っている銀行とウォレットをすべて選びます。',
  'capture.walk.ios.notification': '通知',
  'capture.walk.ios.notificationEx': '「“ニュース”から通知を受信したとき」',
  'capture.walk.ios.whenNotified': '次のAppから通知を受信したとき',
  'capture.walk.ios.notificationTitle': '通知 › タイトル',
  'capture.walk.ios.notificationBody': '通知 › 本文',
  'capture.walk.ios.notificationDate': '通知 › 日付',
  'capture.walk.ios.notificationSummary': 'MB BankまたはMoMoから通知を受信したとき',
  'capture.walk.ios.alertSearch': '銀行の通知',
  'capture.walk.ios.now': '今',
  'capture.walk.test.alertRow': '銀行の通知 · 確認待ち',
  'capture.siri.name': 'Siriに話す',
  'capture.siri.sub': '「6pmで記録」と言って、何に使ったかを話す',
  'capture.siri.headline': '6pmを開かずに、声で支出を記録。',
  'capture.siri.time': '設定はいりません',
  'capture.siri.step1': '「Hey Siri、6pmで記録」と話しかける',
  'capture.siri.step1Chip': '6pmで記録',
  'capture.siri.step2': 'Siriが金額を聞くので、何にいくら使ったかを話す',
  'capture.siri.step2Chip': '「フォー 45k」',
  'capture.siri.step3': 'すぐに今日の支出に入ります',
  'capture.siri.step3Chip': '今日',
  'capture.siri.tip':
    'Siriはまだベトナム語を話せません。ベトナム語で言いたいときは、クイック追加を長押ししてください。',
  'capture.backTap.name': '背面タップ',
  'capture.backTap.sub': 'iPhoneの背面を2回タップして支出を記録',
  'capture.backTap.headline': '背面を2回タップすれば、クイック追加が開きます。',
  'capture.backTap.time': '最初に30秒だけ',
  'capture.backTap.step1': '「設定」→「アクセシビリティ」→「タッチ」→「背面タップ」を開く',
  'capture.backTap.step1Chip': '背面タップ',
  'capture.backTap.step2': '「ダブルタップ」を選び、6pmの「クイック追加」を選ぶ',
  'capture.backTap.step2Chip': 'ダブルタップ → クイック追加',
  'capture.backTap.step3': 'iPhoneの背面を2回タップ。クイック追加が開きます',
  'capture.backTap.step3Chip': 'クイック追加',
  'capture.backTap.tip':
    'クイック追加が見つからない？ ショートカットで「＋」をタップし、6pmの「クイック追加」を追加して保存します。「トリプルタップ」でも使えます。',
  'capture.walk.ios.notificationSubtitle': '通知 › サブタイトル',
  'capture.walk.ios.notify': '通知',
  'capture.walk.ios.cancel': 'キャンセル',
};
