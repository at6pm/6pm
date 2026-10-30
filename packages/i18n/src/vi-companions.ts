import type { Entry } from './catalogue-types';
import type { enCompanions } from './en-companions';

export const viCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.name.sun': 'Hoàng Hôn',
  'companions.name.max': 'Mặt Trời Nửa Đêm',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.line.sun': 'Ấm áp, đều đặn. Cùng bạn lặn lúc sáu giờ.',
  'companions.line.max': 'Mặt trời sau khi tối, có vành đai và hai mặt trăng.',
  'companions.line.nhang': 'Điềm tĩnh, hơi hiền triết, chẳng bao giờ vội.',
  'companions.line.banhbao': 'Ấm cúng, mềm mềm, lúc nào cũng nghĩ tới bữa tối.',
  'companions.line.giot': 'Lém lỉnh, lúc lắc. Vui là té nước.',
  'companions.line.hac': 'Thanh lịch, kiêu hãnh lặng lẽ. Được gấp thật khéo.',
  'companions.max': 'MAX',
  'companions.locked': '{name}, có trong Max',
  'companions.icon': 'Biểu tượng app theo bạn đồng hành',
  'companions.iconSub': 'Màn hình chính hiện người bạn đã chọn.',
};
