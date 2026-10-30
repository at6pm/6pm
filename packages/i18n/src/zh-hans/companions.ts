import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese.
export const zhHansCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.name.sun': '夕阳',
  'companions.name.max': '午夜太阳',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.line.sun': '温暖又稳当，六点陪你一起落下。',
  'companions.line.max': '天黑之后的太阳，带着光环和两颗月亮。',
  'companions.line.nhang': '沉静，有点智慧，从不着急。',
  'companions.line.banhbao': '软乎乎、暖洋洋，满脑子都是晚饭。',
  'companions.line.giot': '调皮又晃悠，一开心就溅起水花。',
  'companions.line.hac': '优雅，带着一点安静的骄傲。折得很用心。',
  'companions.max': 'MAX',
  'companions.locked': '{name}，Max 专享',
  'companions.icon': 'App 图标跟随小伙伴',
  'companions.iconSub': '主屏幕会显示你选的小伙伴。',
};
