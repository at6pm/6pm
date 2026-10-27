import type { Entry } from '../catalogue-types';
import type { enCaptureWalk } from '../en-capture-walk';

// The labels inside the pictured screens are the Japanese iOS and Gmail ones. The shared shortcut
// keeps its name “Log to 6pm”, as it shows in Shortcuts.
export const jaCaptureWalk: { readonly [Key in keyof typeof enCaptureWalk]: Entry } = {
  'capture.walk.stepOf': 'ステップ {step}/{total}',
  'capture.walk.next': '次へ',
  'capture.walk.back': '戻る',
  'capture.walk.again': '最初から',
  'capture.walk.mistakes': 'よくあるミス',

  'capture.walk.wallet.s1Title': '6pmのショートカットを追加',
  'capture.walk.wallet.s1Body':
    '下の「6pmのショートカットを追加」をタップし、「ショートカットを追加」をタップします。名前は「Log to 6pm」です。',
  'capture.walk.wallet.s2Title': 'オートメーションを開いて＋をタップ',
  'capture.walk.wallet.s2Body':
    'ショートカットで「ライブラリ」→「オートメーション」→「＋」をタップします。「ショートカットを説明」が表示されたら「編集」をタップします。',
  'capture.walk.wallet.s3Title': 'ウォレットのトリガーを追加',
  'capture.walk.wallet.s3Body':
    '下のパネルで「オートメーション」→「ウォレット」をタップします。「いずれかのカードがタップされたとき」のカードが表示されます。',
  'capture.walk.wallet.s4Title': '「Log to 6pm」を実行',
  'capture.walk.wallet.s4Body':
    '「検索」をタップして「ショートカットを実行」と入力し、タップします。次に「ショートカット」をタップして「Log to 6pm」を選びます。',
  'capture.walk.wallet.s5Title': '「実行時に表示」をオフにして戻る',
  'capture.walk.wallet.s5Body':
    'オートメーションはオンのまま。戻ると保存されます。一部のカードだけにするなら「いずれかのカード」をタップして選びます。',
  'capture.walk.wallet.s6Title': '試してみる',
  'capture.walk.wallet.s6Body':
    'このiPhoneのApple Payで何か支払ってから6pmを開いてください。インボックスに入っています。',
  'capture.walk.wallet.mistake1':
    '一番上に「いずれかのカードがタップされたとき」のカードがないショートカット。自分で実行したときしか動きません。',
  'capture.walk.wallet.mistake2':
    '「ショートカットを実行」でショートカットを選んでいない。「ショートカット」をタップして「Log to 6pm」を選ばないと、何も記録されません。',
  'capture.walk.wallet.mistake3':
    '「実行時に表示」がオンのまま。タップのたびに止まってカードが表示され、静かに記録されません。',
  'capture.walk.wallet.olderTitle': 'iOS 26の場合',
  'capture.walk.wallet.older1':
    'ショートカットで「オートメーション」タブを開き、「＋」をタップします。',
  'capture.walk.wallet.older2':
    '「ウォレット」をタップしてカードを選び、「すぐに実行」を選んで「次へ」をタップします。',
  'capture.walk.wallet.older3':
    'ショートカットの一覧から「Log to 6pm」を選び、「完了」をタップします。',
  'capture.walk.wallet.handTitle': '自分で作りたい場合',
  'capture.walk.wallet.hand1':
    '「ショートカットを実行」の代わりに「6pmで記録」を追加し、「実行時に表示」をオフにします。',
  'capture.walk.wallet.hand2':
    '「金額」を「取引 › 金額」に、「場所」を「取引 › 加盟店」に設定します。',

  'capture.walk.email.s1Title': 'パソコンでGmailの設定を開く',
  'capture.walk.email.s1Body':
    '転送はGmailアプリでは設定できません。ウェブ版Gmailで歯車をクリックし、「すべての設定を表示」を開きます。',
  'capture.walk.email.s2Title': 'メール転送と POP/IMAP',
  'capture.walk.email.s2Body': 'そのタブを開いて「転送先アドレスを追加」をクリックします。',
  'capture.walk.email.s3Title': '6pmのアドレスを貼り付け',
  'capture.walk.email.s3Body':
    '下のボタンでコピーして貼り付け、「次へ」→「続行」をクリックします。',
  'capture.walk.email.s4Title': '6pmに表示されたコードを入力',
  'capture.walk.email.s4Body':
    'Gmailが6pmのアドレスに確認メールを送り、6pmがコードを表示します。「確認」の横に入力してください。',
  'capture.walk.email.s5Title': 'レシート用のフィルタを作る',
  'capture.walk.email.s5Body':
    'すべてを転送しないでください。検索オプションを開き、「From」にレシートの送信元を入れます。',
  'capture.walk.email.s6Title': '6pmに転送する',
  'capture.walk.email.s6Body':
    '「フィルタを作成」をクリックし、「次のアドレスに転送する」にチェックして6pmのアドレスを選び、もう一度「フィルタを作成」をクリックします。',
  'capture.walk.email.otherTitle': 'ほかのメール',
  'capture.walk.email.outlook': 'Outlook.com',
  'capture.walk.email.outlook1': 'ウェブで「設定」→「メール」→「ルール」を開きます。',
  'capture.walk.email.outlook2':
    '新しいルールを追加：レシートの送信元から届いたら、6pmのアドレスに転送します。',
  'capture.walk.email.outlook3': '保存します。先にもう一度サインインを求められることがあります。',
  'capture.walk.email.icloud': 'iCloud Mail',
  'capture.walk.email.icloud1': 'icloud.com/mailで「設定」→「ルール」→「＋」を開きます。',
  'capture.walk.email.icloud2':
    'メッセージの差出人がレシートの送信元なら、6pmのアドレスに転送します。',
  'capture.walk.email.icloud3':
    '送信元ごとにルールを1つ追加します。動き始めるまで15分ほどかかることがあります。',

  'capture.walk.share.s1Title': '銀行アプリでレシートを開く',
  'capture.walk.share.s1Body': '振込後の画面か、履歴の明細を開いて「共有」をタップします。',
  'capture.walk.share.s2Title': '6pmをタップ',
  'capture.walk.share.s2Body':
    '見つからなければアプリの列をスクロールしてください。レシートの写真を1枚でも何枚でも共有できます。',
  'capture.walk.share.s3Title': '確認して決定',
  'capture.walk.share.s3Body': '金額と支払い先を読み取ります。確定すれば、インボックスに入ります。',
  'capture.walk.share.inInbox': 'インボックスに追加',

  'capture.walk.bank.done': '振込完了',
  'capture.walk.bank.from': '振込元',
  'capture.walk.bank.yourBank': 'あなたの銀行',
  'capture.walk.bank.share': '共有',
  'capture.walk.bank.home': 'ホーム',

  'capture.walk.test.paid': '完了',
  'capture.walk.test.inbox': 'インボックス',
  'capture.walk.test.row': 'Apple Pay · 確認待ち',

  'capture.walk.ios.library': 'ライブラリ',
  'capture.walk.ios.allShortcuts': 'すべてのショートカット',
  'capture.walk.ios.shareSheet': '共有シート',
  'capture.walk.ios.gallery': 'ギャラリー',
  'capture.walk.ios.automation': 'オートメーション',
  'capture.walk.ios.apps': 'App',
  'capture.walk.ios.edit': '編集',
  'capture.walk.ios.noAutomations': 'オートメーションなし',
  'capture.walk.ios.noAutomationsSub': 'ショートカットを自動で実行できます。',
  'capture.walk.ios.newShortcut': '新規ショートカット',
  'capture.walk.ios.describe': 'ショートカットを説明',
  'capture.walk.ios.addActions': '下からアクションを追加してショートカットを作成します。',
  'capture.walk.ios.search': '検索',
  'capture.walk.ios.scripting': 'スクリプティング',
  'capture.walk.ios.sendMessage': 'メッセージを送信',
  'capture.walk.ios.openApp': 'Appを開く',
  'capture.walk.ios.playMusic': 'ミュージックを再生',
  'capture.walk.ios.app': 'App',
  'capture.walk.ios.appEx': '「“天気”を開いたとき/閉じたとき」',
  'capture.walk.ios.wallet': 'ウォレット',
  'capture.walk.ios.walletEx': '「ウォレットのカードまたはパスをタップしたとき」',
  'capture.walk.ios.screenshot': 'スクリーンショット',
  'capture.walk.ios.screenshotEx': '「スクリーンショットが保存されたとき」',
  'capture.walk.ios.when': 'ウォレットで',
  'capture.walk.ios.isTapped': 'がタップされたとき',
  'capture.walk.ios.anyCard': 'いずれかのカード',
  'capture.walk.ios.showWhenRun': '実行時に表示',
  'capture.walk.ios.addShortcut': 'ショートカットを追加',
  'capture.walk.ios.dontAdd': '追加しない',
  'capture.walk.ios.runShortcut': 'ショートカットを実行',
  'capture.walk.ios.run': '実行',
  'capture.walk.ios.shortcut': 'ショートカット',
  'capture.walk.ios.shortcutA': '帰宅予定時刻',
  'capture.walk.ios.shortcutB': '洗濯タイマー',
  'capture.walk.ios.personal': '個人',
  'capture.walk.ios.walletSummary': 'ウォレットのパスまたは支払いカードをタップしたとき',
  'capture.walk.ios.messages': 'メッセージ',
  'capture.walk.ios.mail': 'メール',
  'capture.walk.ios.image': 'イメージ',
  'capture.walk.ios.copy': 'コピー',
  'capture.walk.ios.saveImage': 'イメージを保存',

  'capture.walk.gmail.searchMail': 'メールを検索',
  'capture.walk.gmail.quickSettings': 'クイック設定',
  'capture.walk.gmail.seeAll': 'すべての設定を表示',
  'capture.walk.gmail.settings': '設定',
  'capture.walk.gmail.general': '全般',
  'capture.walk.gmail.labels': 'ラベル',
  'capture.walk.gmail.filters': 'フィルタとブロック中のアドレス',
  'capture.walk.gmail.forwarding': 'メール転送と POP/IMAP',
  'capture.walk.gmail.forwardingHead': '転送:',
  'capture.walk.gmail.addAddress': '転送先アドレスを追加',
  'capture.walk.gmail.enterAddress': '新しい転送先メールアドレスを入力してください:',
  'capture.walk.gmail.next': '次へ',
  'capture.walk.gmail.cancel': 'キャンセル',
  'capture.walk.gmail.proceed': '続行',
  'capture.walk.gmail.forwardTo': '受信メールの転送先:',
  'capture.walk.gmail.verify': '確認',
  'capture.walk.gmail.code': '確認コード',
  'capture.walk.gmail.disable': '転送を無効にする',
  'capture.walk.gmail.from': 'From',
  'capture.walk.gmail.subject': '件名',
  'capture.walk.gmail.hasWords': '含む',
  'capture.walk.gmail.createFilter': 'フィルタを作成',
  'capture.walk.gmail.search': '検索',
  'capture.walk.gmail.whenArrives': '検索条件に一致するメールが届いたとき:',
  'capture.walk.gmail.skipInbox': '受信トレイをスキップ (アーカイブする)',
  'capture.walk.gmail.markRead': '既読にする',
  'capture.walk.gmail.forwardIt': '次のアドレスに転送する:',
  'capture.walk.gmail.inbox': '受信トレイ',
};
