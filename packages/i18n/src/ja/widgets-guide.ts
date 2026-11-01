import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// The steps use the button names the Japanese iPhone shows (編集, ウィジェットを追加, カスタマイズ).
export const jaWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'ウィジェットとコントロール',
  'widgetsGuide.headline': '6pmを、ひと目で、ワンタップで。',
  'widgetsGuide.lede':
    '今日使えるお金をいつも見る場所に。アプリを探さずに「QRをスキャン」や「クイック追加」を開けます。',
  'widgetsGuide.lookMax': 'あなたの着せかえで表示。',
  'widgetsGuide.lookFree': '無料版はゴールデンアワー。Maxならあなたの着せかえになります。',
  'widgetsGuide.howToAdd': '追加のしかた',
  'widgetsGuide.whenItShows': '表示されるとき',

  'widgetsGuide.home.title': 'ホーム画面ウィジェット',
  'widgetsGuide.home.what': '今日使えるお金がひと目で。タップすると6pmが開きます。',
  'widgetsGuide.home.small': '小',
  'widgetsGuide.home.medium': '中',
  'widgetsGuide.home.large': '大',
  'widgetsGuide.home.smallWhat': '今日使えるお金。',
  'widgetsGuide.home.mediumWhat': '数字の横に「QRをスキャン」と「クイック追加」。',
  'widgetsGuide.home.largeWhat': '残りの額と、今日の最新の支出。',
  'widgetsGuide.home.step1': 'ホーム画面の何もないところを、アプリが揺れはじめるまで長押しします。',
  'widgetsGuide.home.step2': '上の隅の「編集」をタップし、「ウィジェットを追加」をタップします。',
  'widgetsGuide.home.step3':
    '6pmを検索し、好きなサイズまでスワイプして「ウィジェットを追加」をタップします。',

  'widgetsGuide.lock.title': 'ロック画面ウィジェット',
  'widgetsGuide.lock.what': 'ロックを解除しなくても、今日の残りが分かります。',
  'widgetsGuide.lock.ring': 'リング',
  'widgetsGuide.lock.card': 'カード',
  'widgetsGuide.lock.step1': 'ロック画面を長押しして、「カスタマイズ」をタップします。',
  'widgetsGuide.lock.step2': '「ロック画面」を選び、時計の下のスペースをタップします。',
  'widgetsGuide.lock.step3': '6pmをタップして、リングかカードを選びます。',

  'widgetsGuide.control.title': 'コントロールセンター',
  'widgetsGuide.control.what':
    '下にスワイプしてワンタップで、「QRをスキャン」か「クイック追加」へ。',
  'widgetsGuide.control.needs': 'iOS 18以降',
  'widgetsGuide.control.step1': '画面の右上隅から下にスワイプします。',
  'widgetsGuide.control.step2':
    '何もないところを長押しして、「コントロールを追加」をタップします。',
  'widgetsGuide.control.step3': '6pmを検索して、「QRをスキャン」か「クイック追加」を選びます。',
  'widgetsGuide.control.note':
    '同じふたつを、ロック画面下の懐中電灯やカメラの代わりに置くこともできます。',

  'widgetsGuide.action.title': 'アクションボタン',
  'widgetsGuide.action.what': '側面のボタンを長押しすると「QRをスキャン」が開きます。',
  'widgetsGuide.action.needs': 'iPhone 15 Pro以降',
  'widgetsGuide.action.step1': '設定を開き、「アクションボタン」をタップします。',
  'widgetsGuide.action.step2':
    '「コントロール」までスワイプし、その下のコントロール名をタップします。',
  'widgetsGuide.action.step3': '6pmを検索して、「QRをスキャン」か「クイック追加」を選びます。',
  'widgetsGuide.action.note':
    '声のほうがいい？ Siriに「6pmで記録」と言って、金額を伝えてください。',

  'widgetsGuide.live.title': 'ライブアクティビティ',
  'widgetsGuide.live.what': 'QR決済の待ち中と、旅行中に自動で表示されます。',
  'widgetsGuide.live.step1':
    'QRをスキャンして銀行アプリで支払います。支払いはロック画面で待っています。',
  'widgetsGuide.live.step2': 'お金が出たら「支払い済み」をタップ。自動で閉じます。',
  'widgetsGuide.live.step3':
    '表示されない？ 設定で6pmを開き、「ライブアクティビティ」をオンにしてください。',

  'widgetsGuide.home.addSafe': '「今日使えるお金」を追加',
  'widgetsGuide.home.addToday': '「今日」を追加',
  'widgetsGuide.tiles.title': 'クイック設定のタイル',
  'widgetsGuide.tiles.what':
    '下にスワイプして一度タップすれば、QRをスキャンかクイック追加が開きます。',
  'widgetsGuide.tiles.step1': '画面の上から2回下にスワイプします。',
  'widgetsGuide.tiles.step2': '鉛筆アイコンをタップしてタイルを編集します。',
  'widgetsGuide.tiles.step3':
    '6pmの「QRをスキャン」と「クイック追加」を見つけて、上にドラッグします。',
  'widgetsGuide.tiles.addScan': '「QRをスキャン」タイルを追加',
  'widgetsGuide.tiles.addQuickAdd': '「クイック追加」タイルを追加',
  'widgetsGuide.tiles.scanIn': '「QRをスキャン」はクイック設定にあります',
  'widgetsGuide.tiles.quickAddIn': '「クイック追加」はクイック設定にあります',
};
