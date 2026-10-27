import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese; the gloss says what each one is in Korean.
export const koCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.title': '짝꿍',
  'companions.intro': '매일 저녁 함께할 짝꿍을 골라요. 누구든 약속은 똑같이 지켜요.',
  'companions.name.sun': '노을',
  'companions.name.max': '한밤의 해',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.gloss.sun': '지는 해',
  'companions.gloss.max': 'Max의 해',
  'companions.gloss.nhang': '향',
  'companions.gloss.banhbao': '찐빵',
  'companions.gloss.giot': '빗방울',
  'companions.gloss.hac': '종이학',
  'companions.line.sun': '따뜻하고 한결같아요. 여섯 시에 함께 저물어요.',
  'companions.line.max': '어둠이 내린 뒤의 해. 고리 하나, 달 두 개.',
  'companions.line.nhang': '차분하고 조금 지혜로워요. 절대 서두르지 않아요.',
  'companions.line.banhbao': '포근하고 말랑말랑. 늘 저녁 메뉴 생각뿐.',
  'companions.line.giot': '장난스럽고 말랑거려요. 기분 좋으면 첨벙.',
  'companions.line.hac': '우아하고 은근히 당당해요. 정성껏 접었어요.',
  'companions.wearing': '함께하는 중',
  'companions.max': 'MAX',
  'companions.locked': '{name}, Max에 포함',
  'companions.icon': '앱 아이콘도 짝꿍으로',
  'companions.iconSub': '홈 화면에 내가 고른 짝꿍이 보여요.',
};
