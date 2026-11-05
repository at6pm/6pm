import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const jaPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': '写真あり',
  'photo.slot': '写真',
  'photo.add': '写真を追加',
  'photo.open': '写真を開く',
  'photo.take': '写真を撮る',
  'photo.choose': '写真から選ぶ',
  'photo.close': '閉じる',
  'photo.hint': '下にスワイプしてクリップに戻す',
  'photo.replace': '差し替え',
  'photo.remove': '外す',
  'photo.removed': '写真を外しました。支出はそのままです。',
  'photo.stamp.top': 'この端末',
  'photo.stamp.bottom': 'だけに保存',
  'photo.clipOne': 'クリップする',
  'photo.cameraOff': '6pm のカメラがオフです。設定でオンにしてください。',
  'photo.failed': 'この写真を保存できませんでした。',
};
