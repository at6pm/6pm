import type { Entry } from './catalogue-types';
import type { enPhoto } from './en-photo';

export const viPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'Có ảnh kèm',
  'photo.slot': 'ẢNH',
  'photo.add': 'Thêm ảnh',
  'photo.open': 'Mở ảnh',
  'photo.take': 'Chụp ảnh',
  'photo.choose': 'Chọn từ Ảnh',
  'photo.close': 'Đóng',
  'photo.hint': 'Vuốt xuống để kẹp lại',
  'photo.replace': 'Thay ảnh',
  'photo.remove': 'Gỡ ảnh',
  'photo.removed': 'Đã gỡ ảnh. Khoản chi vẫn còn.',
  'photo.stamp.top': 'CHỈ LƯU',
  'photo.stamp.bottom': 'TRÊN MÁY NÀY',
  'photo.clipOne': 'KẸP ẢNH',
  'photo.cameraOff': 'Camera đang tắt với 6pm. Bật lại trong Cài đặt.',
  'photo.failed': 'Không giữ được ảnh này.',
};
