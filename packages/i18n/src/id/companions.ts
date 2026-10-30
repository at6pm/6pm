import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese.
export const idCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.name.sun': 'Senja',
  'companions.name.max': 'Matahari Tengah Malam',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.line.sun': 'Hangat dan setia. Terbenam bersamamu jam enam.',
  'companions.line.max': 'Matahari setelah gelap, dengan cincin dan dua bulan.',
  'companions.line.nhang': 'Tenang, sedikit bijak, tidak pernah terburu-buru.',
  'companions.line.banhbao': 'Hangat, empuk, selalu memikirkan makan malam.',
  'companions.line.giot': 'Iseng dan goyang-goyang. Memercik kalau senang.',
  'companions.line.hac': 'Anggun dan diam-diam bangga. Dilipat dengan hati-hati.',
  'companions.max': 'MAX',
  'companions.locked': '{name}, ada di Max',
  'companions.icon': 'Ikon aplikasi ikut temanku',
  'companions.iconSub': 'Layar Utama menampilkan teman pilihanmu.',
};
