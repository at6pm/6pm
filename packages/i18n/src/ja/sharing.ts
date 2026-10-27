import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const jaSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': '画像を保存',
  'sharing.share': '共有',
  'sharing.saved': '写真に保存しました。',
  'sharing.photosOff': '6pmの「写真」へのアクセスがオフになっています。',
  'sharing.openSettings': '設定を開く',
  'sharing.failed': '画像を作れませんでした。もう一度お試しください。',
};
