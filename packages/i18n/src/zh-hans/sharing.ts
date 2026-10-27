import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

// Apple's own names: “照片”, “设置”, and 共享 for the share sheet.
export const zhHansSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': '存储图片',
  'sharing.share': '共享',
  'sharing.saved': '已存到“照片”。',
  'sharing.photosOff': '6pm 没有“照片”的访问权限。',
  'sharing.openSettings': '打开“设置”',
  'sharing.failed': '图片没生成出来，再试一次吧。',
};
