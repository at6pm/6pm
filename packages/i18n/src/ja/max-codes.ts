import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const jaMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': '友だちにMaxを贈る',
  'maxCodes.give.sub': 'Maxの特典リンクを送る',
  'maxCodes.give.message':
    '6pmは今日使える金額を教えてくれて、支出も自動で記録してくれます。6pm Maxの特典をどうぞ：{url}',
  'maxCodes.give.failed': '共有を開けませんでした。もう一度お試しください。',
  'maxCodes.redeem': 'コードを使う',
  'maxCodes.head.friend': '友だちからMaxが届きました。',
  'maxCodes.head.code': 'あなたへのMax特典。',
  'maxCodes.playHint': 'Google Playで支払い方法をタップし、「コードを利用」を選んでください。',
  'maxCodes.playHint.code':
    'コード {code} をコピーしました。Google Playで支払い方法をタップし、「コードを利用」を選んでください。',
};
