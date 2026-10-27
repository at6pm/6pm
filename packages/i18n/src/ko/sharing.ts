import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const koSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': '이미지 저장',
  'sharing.share': '공유',
  'sharing.saved': '사진에 저장했어요.',
  'sharing.photosOff': '6pm의 ‘사진’ 접근이 꺼져 있어요.',
  'sharing.openSettings': '설정 열기',
  'sharing.failed': '이미지를 만들지 못했어요. 다시 시도해 주세요.',
};
