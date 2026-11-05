import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const zhHansPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': '已附照片',
  'photo.slot': '照片',
  'photo.add': '添加照片',
  'photo.open': '打开照片',
  'photo.take': '拍照',
  'photo.choose': '从照片中选取',
  'photo.close': '关闭',
  'photo.hint': '向下轻扫，夹回去',
  'photo.replace': '替换',
  'photo.remove': '移除',
  'photo.removed': '照片已移除，这笔支出还在。',
  'photo.stamp.top': '只存在',
  'photo.stamp.bottom': '这台手机上',
  'photo.clipOne': '夹一张',
  'photo.cameraOff': '6pm 的相机权限已关闭，请在设置中打开。',
  'photo.failed': '这张照片没能保存。',
};
