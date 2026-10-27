import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

// Permission prompts read like Japanese iOS purpose strings (…に使用します). Siri phrases are short
// spoken commands with the app name once.
export const jaNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    'スキャンしたQRコードやレシートを読み取るためにカメラを使用します。レシートを詳しく読む必要がある場合を除き、写真はiPhoneの外に出ません。',
  'native.permission.microphone':
    '支出を声で記録するときにマイクを使用します。音声は文字に起こすため音声認識サービスに送られます。端末内モードではこのiPhoneから出ません。',
  'native.permission.speech': '話した内容を金額と名前に変換するために使用します。',
  'native.permission.photos':
    '締めのレシートとお金日記を写真に保存するためだけに使用します。ライブラリの中を見ることはありません。',
  'native.permission.photosAdd': '保存を選んだときに、締めのレシートとお金日記を写真に保存します。',
  'native.permission.location': '海外で旅行モードを自動でオンにするため、いまいる国を確認します。',
  'native.surfaces.safeToday.name': '今日使えるお金',
  'native.surfaces.safeToday.description': '今日使えるお金がひと目で分かります。',
  'native.surfaces.setUp': '6pmを開いて設定',
  'native.surfaces.markPaid.title': '支払い済み',
  'native.surfaces.todayList.name': '今日',
  'native.surfaces.todayList.description': '今日の支出を新しい順に表示します。',
  'native.share.title': '6pmに追加',
  'native.share.readFromBank': '{bank}の明細をこのiPhoneで読み取りました',
  'native.share.readHere': 'レシートをこのiPhoneで読み取りました',
  'native.share.unreadable': 'このレシートは読み取れませんでした。金額を入力してください。',
  'native.share.to': '支払い先',
  'native.share.when': '日時',
  'native.share.code': 'コード',
  'native.share.category': 'カテゴリ',
  'native.share.unsure': '名前に自信がありません。タップして確認してください。',
  'native.share.checkName': '名前を確認',
  'native.share.amountHint': '金額',
  'native.share.nameHint': '支払い先',
  'native.share.chooseCategory': '選択',
  'native.share.edit': '編集',
  'native.share.done': '完了',
  'native.share.confirm': '確認',
  'native.share.currency': '通貨',
  'native.share.currencyUnsure':
    'このレシートには通貨が書かれていません。タップして確認してください。',
  'native.share.checkCurrency': '通貨を確認',
  'native.share.inDong': '≈ {amount}',
  'native.share.noRate': 'レートがまだありません。レートが届きしだい、その日のレートで換算します。',
  'native.share.unknownCurrency': '通貨が分かりませんでした。金額をドンで入力してください。',
  'native.share.unknownCurrencyIn':
    '通貨が分かりませんでした。金額を{currency}で入力してください。',
  'native.share.looking': 'もう少し詳しく読み取っています…',
  'native.share.step': '{n}/{total}',
  'native.share.skip': 'スキップ',
  'native.intents.logSpend.title': '6pmで記録',
  'native.intents.logSpend.amount': '金額',
  'native.intents.logSpend.merchant': '場所',
  'native.intents.logSpend.description':
    '6pmに支出を記録します。ウォレットでのApple Payのタッチや、Siriに話した内容を記録できます。',
  'native.intents.logSpend.short': '支出を記録',
  'native.intents.logSpend.askAmount': 'いくらでしたか？',
  'native.intents.logSpend.logged': '記録しました。',
  'native.intents.logSpend.failed':
    '6pmに記録できませんでした。6pmを開いてクイック追加をお試しください。',
  'native.intents.scan.title': 'QRをスキャン',
  'native.intents.scan.description': '6pmで「スキャンして支払う」を開きます。',
  'native.intents.quickAdd.title': 'クイック追加',
  'native.intents.quickAdd.description': '6pmでクイック追加を開きます。',
  // What Siri listens for, in the languages Siri speaks: the English phrase is the table's key.
  'native.appShortcuts.logIn': '${applicationName}で記録',
  'native.appShortcuts.logSpend': '${applicationName}で支出を記録',
  'native.appShortcuts.scan': '${applicationName}でQRをスキャン',
  'native.appShortcuts.scanToPay': '${applicationName}でスキャンして支払う',
  'native.appShortcuts.quickAdd': '${applicationName}でクイック追加',
};
