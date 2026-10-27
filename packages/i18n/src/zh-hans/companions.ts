import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese; the gloss says what each one is.
export const zhHansCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.title': '小伙伴',
  'companions.intro': '选一位每晚陪着你的小伙伴。它们守着同一个承诺。',
  'companions.name.sun': '夕阳',
  'companions.name.max': '午夜太阳',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.gloss.sun': '落日',
  'companions.gloss.max': 'Max 的太阳',
  'companions.gloss.nhang': '一炷香',
  'companions.gloss.banhbao': '包子',
  'companions.gloss.giot': '雨滴',
  'companions.gloss.hac': '纸鹤',
  'companions.line.sun': '温暖又稳当，六点陪你一起落下。',
  'companions.line.max': '天黑之后的太阳，带着光环和两颗月亮。',
  'companions.line.nhang': '沉静，有点智慧，从不着急。',
  'companions.line.banhbao': '软乎乎、暖洋洋，满脑子都是晚饭。',
  'companions.line.giot': '调皮又晃悠，一开心就溅起水花。',
  'companions.line.hac': '优雅，带着一点安静的骄傲。折得很用心。',
  'companions.wearing': '陪着你',
  'companions.max': 'MAX',
  'companions.locked': '{name}，Max 专享',
  'companions.icon': 'App 图标跟随小伙伴',
  'companions.iconSub': '主屏幕会显示你选的小伙伴。',
};
