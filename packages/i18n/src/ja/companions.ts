import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese.
export const jaCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.name.sun': '夕日',
  'companions.name.max': '真夜中の太陽',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.line.sun': 'あたたかくて、ぶれない。6時にいっしょに沈みます。',
  'companions.line.max': '日が暮れたあとの太陽。輪っかと月をふたつ連れて。',
  'companions.line.nhang': '穏やかで、ちょっと物知り。決して急がない。',
  'companions.line.banhbao': 'ほかほか、ふにふに。頭の中はいつも晩ごはん。',
  'companions.line.giot': 'おちゃめでぷるぷる。うれしいと跳ねます。',
  'companions.line.hac': '上品で、ひそかに誇り高い。ていねいに折られました。',
  'companions.max': 'MAX',
  'companions.locked': '{name}（Maxで利用可）',
  'companions.icon': 'アプリアイコンを相棒に合わせる',
  'companions.iconSub': 'ホーム画面に選んだ相棒が表示されます。',
};
