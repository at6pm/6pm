import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const koPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': '사진 있음',
  'photo.slot': '사진',
  'photo.add': '사진 추가',
  'photo.open': '사진 열기',
  'photo.take': '사진 찍기',
  'photo.choose': '사진에서 선택',
  'photo.close': '닫기',
  'photo.hint': '아래로 쓸어서 다시 끼우기',
  'photo.replace': '바꾸기',
  'photo.remove': '빼기',
  'photo.removed': '사진을 뺐어요. 지출은 그대로예요.',
  'photo.stamp.top': '이 폰에만',
  'photo.stamp.bottom': '보관',
  'photo.clipOne': '사진 끼우기',
  'photo.cameraOff': '6pm의 카메라 접근이 꺼져 있어요. 설정에서 켜 주세요.',
  'photo.failed': '이 사진을 보관하지 못했어요.',
};
