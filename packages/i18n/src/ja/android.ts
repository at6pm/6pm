import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: “このスマホ”, Google Play, a backup key kept on the phone, and no share
// sheet, Apple Pay, widgets or Siri to point at.
export const jaAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    '入口は3つ：クイック追加（入力か音声）、QRやレシートのスキャン、レシートメールの転送です。6pmがキャッチしたものは、締めまでインボックスで待っています。',
  'capture.share.headline':
    'レシートを画像で保存して、スキャンで選んでください。金額を読み取ります。',
  'capture.wallet.headline':
    'このスマホにはApple Payがありません。カードのレシートメールを転送すれば、自動で届きます。',
  'capture.widgets.headline':
    'ホーム画面の空いている所を長押しし、「ウィジェット」から6pmを追加。QRをスキャンとクイック追加は、クイック設定のタイルにもなります。',

  'backup.row.on': '暗号化済み · {when}',
  'backup.status.sub': {
    other: '{count}件 · 暗号化済み。なくても6pmは使えます。',
  },
  'backup.status.neverSub': '暗号化。なくても6pmは使えます。',
  'backup.off.sub':
    'スマホから出る前に暗号化されます。鍵はこのスマホにだけ残るので、私たちには何も読めません。',
  'backup.tooLarge':
    '前回のバックアップは大きすぎて送れませんでした。データはすべてこのスマホに残っています。',
  'backup.note':
    '1日1回、締めのあとにバックアップします。鍵はこのスマホから出ないため、バックアップはこのスマホでしか開けません。新しいスマホでは開けません。',
  'backup.paused':
    'Maxがないためバックアップは一時停止中です。前回のバックアップは暗号化されたまま安全です。',
  'backup.found.title': 'このスマホのバックアップがすでにあります。',
  'backup.found.sub':
    '以前のインストールで作られたものです。ここからバックアップすると置き換わります。',
  'backup.found.restoreConfirm': 'もう一度タップしてこのスマホの記録を置き換える',
  'backup.found.replace': 'このスマホの内容で置き換える',
  'backup.restore.sub': { other: '{count}件 · 暗号化済み。' },
  'backup.restore.none': 'このスマホのバックアップは見つかりません。',
  'backup.restore.wrongKey': 'このスマホの鍵ではこのバックアップを開けません。',
  'backup.error.keychain':
    'このスマホに鍵を保存できなかったため、バックアップしていません。もう一度お試しください。',
  'backup.error.tooLarge':
    'このバックアップは大きすぎて送れません。データはすべてこのスマホに残っています。',

  'capture.email.sub': 'このスマホには転送先アドレスがありません',
  'capture.scan.tip': 'スキャンするコードがないときは、スキャンボタンを長押しでクイック追加。',
  'onboarding.catch.add.body':
    'スキャンボタンを長押しでクイック追加。「コーヒー {amount}」と話してください。',
  'today.list.empty':
    'まだ何もキャッチしていません。QRやレシートをスキャンするか、使ったときに＋をタップ。',

  'looks.restore.none': 'このGoogleアカウントで復元できるものはありません。',
  'looks.restore.failed': 'Google Playに接続できませんでした。もう一度お試しください。',
  'looks.legal':
    '着せかえはGoogleアカウントでの買い切りです。MaxはGoogle Playでいつでも解約できるサブスクリプションです。価格はGoogle Playに表示されます。',
  'look.buying': 'Google Playを待っています…',
  'look.noteStoreOff': 'Google Playが応答しないため、この着せかえは今は購入できません。',
  'max.cta.waiting': 'Google Playを待っています…',
  'max.terms.storeOff': '今はMaxを購入できません：Google Playが応答していません。',
  'max.sub.backup': '暗号化バックアップ、全履歴、CSVとスプレッドシート。',
  'max.note.backup': '暗号化バックアップ、CSVとスプレッドシート',
  'max.welcome.win.more': '貯金箱、旅行、イヤーブック',

  'privacy.ai.device.title': 'このスマホの中だけで',
  'privacy.ai.device.unavailable': 'Androidでは、6pmにはスマホの中で動くモデルがありません。',
  'settings.ai.device': 'このスマホ',
  'privacy.leaves.device.none': 'AIのためには何も出ません。すべてこのスマホの中で処理します。',
  'receiptEmail.deviceMode': 'AIがこのスマホの中だけの間はオフ',
  'receiptEmail.deviceMode.body':
    'レシートメールはサーバーでメールを読む必要があるため、6pmがAIをこのスマホの中だけで使っている間はオフになります。代わりにレシートをスキャンしてください。',
  'settings.privacyBody':
    'お金のデータは暗号化されて、このスマホに保存されます。「6pmに聞く」の質問を読んだり相棒のひとことを書いたりするために、6pmはAIサービスのAnthropicに、質問か、その日のいくつかの事実（金額、場所、カテゴリ名）を送ります。支出の一覧は送りません。スマホで読み取れなかったレシートの写真も送ります。Anthropicはそれらを学習に使わず、30日以内に削除します。支出を声で伝えると、音声は文字にするためにDeepgramに送られます。上の「AI」で、これらをすべてこのスマホの中だけにできます。バックアップはオンにしたときだけ、エンドツーエンドで暗号化して送ります。クラッシュレポートは金額・名前・メモを含まずにSentryへ送られ、購入はRevenueCatが処理します。',

  'scan.handoff.store': '{wallet}はこのスマホに入っていません',
  'scan.handoff.savedQr':
    'QRをギャラリーに保存しました。銀行アプリで写真から読み取ってください。戻ってきたら確認します。',
  'sharing.saved': 'ギャラリーに保存しました。',
  'sharing.photosOff': '6pmの写真へのアクセスがオフになっています。',

  'startup.failedSub':
    'データは失われていません。もう一度試して、それでも続くならスマホを再起動してください。',
  'voice.unavailable': '音声入力には、このスマホで{language}の音声入力が使える必要があります',

  'onboarding.privacy.phone': 'このスマホの中だけ',
  'onboarding.privacy.backupSub': 'このスマホから出ない鍵でロック',

  'capture.alerts.time': '最初に10秒だけ',
  'capture.alerts.step1': '「通知へのアクセス」で6pmをオンにする',
  'capture.alerts.step1Chip': '通知へのアクセス → 6pm',
  'capture.alerts.step2': '銀行やウォレットのアプリの通知をオンのままにする',
  'capture.alerts.step3': '支払いはインボックスで締めを待ちます',
  'capture.alerts.step3Chip': 'インボックス',
  'capture.alerts.tip':
    '認証コード、失敗した支払い、プロモーションはスキップします。メールでキャッチ済みの支払いは二重に追加されません。',
  'capture.alerts.privacy':
    'このスマホの中で読み取り、どこにも送りません。6pmが読むのは銀行とウォレットの通知だけです。',
  'capture.alerts.actionAdd': '通知へのアクセスを許可',
  'capture.alerts.actionOpen': '通知へのアクセスの設定',

  'widgetsGuide.title': 'ウィジェットとタイル',
  'widgetsGuide.home.title': 'ホーム画面のウィジェット',
  'widgetsGuide.home.largeWhat':
    '残りの金額と今日の最新の支出、それに「QRをスキャン」と「クイック追加」。',
  'widgetsGuide.home.step1': 'ホーム画面の空いている所を長押しします。',
  'widgetsGuide.home.step2': '「ウィジェット」をタップして6pmを探します。',
  'widgetsGuide.home.step3':
    '「今日使えるお金」か「今日」を長押しして好きな場所へドラッグ。「今日使えるお金」は横に広げると「QRをスキャン」と「クイック追加」が付きます。',
  'capture.settings.widgetsValue': 'ホームとタイル',
};
