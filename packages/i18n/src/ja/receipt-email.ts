import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

export const jaReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'アドレスをコピー',
  'receiptEmail.share': '6pmのアドレスを共有',
  'receiptEmail.offline': 'オンラインになるとアドレスが表示されます',
  'receiptEmail.from': '{address}から',
  'receiptEmail.deviceMode': 'AIがこのiPhoneの中だけの間はオフ',
  'receiptEmail.deviceMode.body':
    'レシートメールはサーバーでメールを読む必要があるため、6pmがAIをこのiPhoneの中だけで使っている間はオフになります。代わりにレシートを共有するか、スキャンしてください。',
  'receiptEmail.check.title': '{provider}が{address}からの転送の確認を求めています',
  'receiptEmail.check.titleNoAddress': '{provider}が6pmへの転送の確認を求めています',
  'receiptEmail.check.code': '確認コード',
  'receiptEmail.check.copy': 'コピー',
  'receiptEmail.check.copyLabel': '確認コードをコピー',
  'receiptEmail.check.copied': 'コードをコピーしました。',
  'receiptEmail.check.hint':
    '確認ページを開くか、{provider}の設定にコードを貼り付けてください。転送したレシートがここに届くようになります。',
  'receiptEmail.check.open': '確認ページを開く',
  'receiptEmail.check.openFailed': 'ページを開けませんでした。代わりにコードをコピーしてください。',
  'receiptEmail.check.hintNoCode':
    '確認ページを開いて「確認」をタップしてください。転送したレシートがここに届くようになります。',
  'receiptEmail.check.openFailedNoCode':
    'ページを開けませんでした。少ししてからもう一度お試しください。',
  'receiptEmail.check.done': '完了',
};
