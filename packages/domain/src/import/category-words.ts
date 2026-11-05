import { billWordAt } from '../capture/bill-topic';
import { foldWords } from '../capture/fold-words';
import { categoryHintOf } from '../capture/spoken-spend';

/**
 * Their category names, and the shops in a MoMo history, mapped to 6pm's starter categories. The
 * names are Money Lover's and MISA's defaults in Vietnamese and English (Money Lover's from its
 * help centre and real exports; MISA's from its help screens), plus the everyday shops and bills
 * a wallet's history names. Matching is on folded words, so accents and case do not matter.
 */

/** 6pm's starter categories, plus Bills and Not daily, which an import may add. */
export const IMPORT_TARGETS = [
  'food',
  'drinks',
  'transport',
  'groceries',
  'shopping',
  'fun',
  'health',
  'home',
  'family',
  'gifts',
  'bills',
  'notDaily',
] as const;
export type ImportTarget = (typeof IMPORT_TARGETS)[number];

/** Names that say nothing of what the money went on: the person picks. */
const UNSAID = new Set([
  'other',
  'others',
  'khac',
  'other expense',
  'other expenses',
  'cac chi phi khac',
  'chi phi khac',
  'chi tieu khac',
  'uncategorized',
  'chua phan loai',
  'misc',
  'miscellaneous',
  'chuyen tien',
  'transfer money',
]);

/** Whole names first, then the words a name holds; the first match wins, so order matters. */
const NAMES: readonly (readonly [ImportTarget, readonly string[]])[] = [
  ['bills', ['dien', 'nuoc', 'gas', 'internet', 'dien thoai', 'truyen hinh', 'cap']],
  [
    'notDaily',
    [
      'chi phi',
      'phi',
      'fees charges',
      'fees and charges',
      'fees',
      'dau tu',
      'investment',
      'investments',
      'kinh doanh',
      'business',
      'bao hiem',
      'insurance',
      'insurances',
      'withdrawal',
      'rut tien mat',
      'tra lai',
      'pay interest',
      'thue',
      'tax',
      'taxes',
    ],
  ],
];

const WORDS: readonly (readonly [ImportTarget, readonly string[]])[] = [
  [
    'bills',
    [
      'hoa don',
      'tien ich',
      'bills',
      'bill',
      'utilities',
      'utility',
      'dich vu sinh hoat',
      'dien nuoc',
      'tien dien',
      'tien nuoc',
      'dien luc',
      'evn',
      'cap nuoc',
      'sawaco',
      'electricity',
      'water bill',
      'internet',
      'wifi',
      'dien thoai',
      'cuoc dien thoai',
      'phone bill',
      'television',
      'truyen hinh',
      'gas',
      'thue nha',
      'tien nha',
      'tien phong',
      'rent',
      'rentals',
      'vnpt',
      'viettel',
      'fpt',
      'mobifone',
      'vinaphone',
      'vietnamobile',
      'nap data',
      'data',
      'nap tien dien thoai',
      'goi cuoc',
      'top up',
    ],
  ],
  [
    'drinks',
    [
      'ca phe',
      'cafe',
      'coffee',
      'tra sua',
      'milk tea',
      'do uong',
      'drinks',
      'drink',
      'bia',
      'beer',
      'bar',
      'highlands',
      'phuc long',
      'starbucks',
      'katinat',
      'cong ca phe',
      'the coffee house',
      'trung nguyen',
      'gong cha',
      'koi the',
      'phe la',
    ],
  ],
  [
    'groceries',
    [
      'di cho',
      'sieu thi',
      'groceries',
      'grocery',
      'supermarket',
      'circle k',
      'gs25',
      'familymart',
      'family mart',
      '7 eleven',
      'ministop',
      'winmart',
      'vinmart',
      'bach hoa xanh',
      'co op',
      'coop',
      'coopmart',
      'co opmart',
      'lotte mart',
      'aeon',
      'big c',
      'go mart',
      'mega market',
      'thuc pham',
    ],
  ],
  [
    'food',
    [
      'an uong',
      'food',
      'food beverage',
      'food and beverage',
      'food and dining',
      'dining',
      'restaurant',
      'restaurants',
      'nha hang',
      'an sang',
      'an trua',
      'an toi',
      'an vat',
      'do an',
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'snacks',
      'pho',
      'bun',
      'com tam',
      'com ga',
      'banh mi',
      'baemin',
      'shopeefood',
      'grabfood',
      'grab food',
      'kfc',
      'lotteria',
      'jollibee',
      'mcdonald',
      'pizza',
    ],
  ],
  [
    'transport',
    [
      'di chuyen',
      'di lai',
      'transportation',
      'transport',
      'auto transport',
      'xang',
      'xang dau',
      'xang xe',
      'petrol',
      'fuel',
      'gui xe',
      'parking',
      'parking fees',
      'taxi',
      'grab',
      'green sm',
      'xanh sm',
      'gojek',
      'mai linh',
      'vinasun',
      'be group',
      'bebike',
      'becar',
      'bao duong',
      'bao duong xe',
      'sua xe',
      'rua xe',
      'maintenance',
      'service parts',
      've xe',
      've may bay',
      'vetc',
      'epass',
      'petrolimex',
      'xe om',
      'bus',
      'metro',
    ],
  ],
  [
    'health',
    [
      'suc khoe',
      'health',
      'health fitness',
      'health and fitness',
      'kham chua benh',
      'kham suc khoe',
      'kham benh',
      'thuoc',
      'nha thuoc',
      'doctor',
      'pharmacy',
      'medicine',
      'medical',
      'the duc the thao',
      'the thao',
      'sports',
      'gym',
      'fitness',
      'benh vien',
      'long chau',
      'pharmacity',
      'an khang',
      'nha khoa',
      'dentist',
    ],
  ],
  [
    'shopping',
    [
      'mua sam',
      'shopping',
      'quan ao',
      'trang phuc',
      'clothing',
      'clothes',
      'giay dep',
      'footwear',
      'phu kien',
      'accessories',
      'do dien tu',
      'electronics',
      'do dung ca nhan',
      'cham soc ca nhan',
      'personal care',
      'lam dep',
      'beauty',
      'my pham',
      'shopee',
      'lazada',
      'tiki',
      'tiktok shop',
      'sendo',
      'uniqlo',
    ],
  ],
  [
    'fun',
    [
      'giai tri',
      'entertainment',
      'phim anh',
      'phim',
      'movies',
      'movie',
      'tro choi',
      'games',
      'game',
      'du lich',
      'travel',
      'huong thu',
      'vui choi',
      'ban be nguoi yeu',
      'friends lover',
      'friends and lover',
      'tu tap ban be',
      'cgv',
      'galaxy cinema',
      'lotte cinema',
      'bhd',
      'netflix',
      'spotify',
      'youtube',
      'karaoke',
      'concert',
    ],
  ],
  [
    'home',
    [
      'nha cua',
      'home',
      'do gia dung',
      'dich vu gia dinh',
      'home improvement',
      'home services',
      'household',
      'noi that',
      'sua chua nha',
      'ikea',
      'dien may xanh',
    ],
  ],
  [
    'family',
    [
      'gia dinh',
      'family',
      'con cai',
      'children',
      'children babies',
      'kids',
      'vat nuoi',
      'thu cung',
      'pets',
      'pet',
      'giao duc',
      'education',
      'hoc phi',
      'books',
      'sach',
    ],
  ],
  [
    'gifts',
    [
      'qua tang',
      'qua tang quyen gop',
      'gifts',
      'gift',
      'gifts donations',
      'gifts and donations',
      'quyen gop',
      'tu thien',
      'charity',
      'hieu hi',
      'bieu tang',
      'dam cuoi',
      'cuoi hoi',
      'marriage',
      'wedding',
      'funeral',
      'dam hieu',
      'li xi',
    ],
  ],
];

/** The first target a word or phrase in the folded text points to, on word boundaries only. */
function wordTargetOf(folded: string): ImportTarget | null {
  for (const [target, words] of WORDS) {
    for (const word of words) if (folded.includes(` ${word} `)) return target;
  }
  return null;
}

/**
 * The 6pm category one of their category names goes in (Money Lover's, MISA's, a CSV's), or null
 * when the person has to pick. A name that says nothing ("Other", "Khác") is always theirs to
 * pick; Not daily comes only from a whole name ("Phí", "Đầu tư"), never from a word inside one.
 */
export function importTargetOf(name: string): ImportTarget | null {
  const folded = foldWords(name);
  const whole = folded.trim();
  if (whole === '' || UNSAID.has(whole)) return null;
  for (const [target, names] of NAMES) if (names.includes(whole)) return target;
  return wordTargetOf(folded);
}

/** Family names most Vietnamese full names start with, folded. */
const FAMILY_NAMES = new Set([
  'nguyen',
  'tran',
  'le',
  'pham',
  'hoang',
  'huynh',
  'phan',
  'vu',
  'vo',
  'dang',
  'bui',
  'do',
  'ho',
  'ngo',
  'duong',
  'ly',
  'dinh',
  'dao',
  'doan',
  'lam',
  'mai',
  'trinh',
  'truong',
  'luong',
  'luu',
  'ha',
  'cao',
  'ton',
  'thai',
  'quach',
  'chau',
  'ta',
  'la',
  'kieu',
  'trieu',
  'tang',
]);

/**
 * Whether a payee reads as a person: a full name in capitals, as a wallet prints the account
 * holder ("NGUYEN VAN AN"), two to five words of letters, the first a family name.
 */
export function looksLikePerson(payee: string): boolean {
  const raw = payee.trim();
  if (raw === '' || raw !== raw.toLocaleUpperCase('vi') || !/\p{L}/u.test(raw)) return false;
  const words = foldWords(raw).trim().split(' ');
  return (
    words.length >= 2 &&
    words.length <= 5 &&
    words.every((w) => /^[a-z]+$/.test(w)) &&
    FAMILY_NAMES.has(words[0] ?? '')
  );
}

/** The wallet's own names, which say how it was paid, never what for ("Ví Trả Sau" is no phone bill). */
const WALLET_WORDS = / (?:vi tra sau|vi momo|tui than tai|du no)(?= )/g;

/**
 * Where a payee in a wallet's history goes (MoMo's shops and people): a shop's or a bill's words
 * ("GRAB", "Circle K", "Điện lực") to a starter category or Bills, as Quick add reads a merchant.
 * Never Not daily, which only a category name of theirs can say, and never anything for a person
 * or a transfer: those, and every shop 6pm's words cannot place, are the person's to pick.
 */
export function payeeTargetOf(payee: string): ImportTarget | null {
  const whole = foldWords(payee).trim();
  if (whole === '' || UNSAID.has(whole)) return null;
  // A name in capitals is a person, unless it is a shop's whole name ("MAI LINH" is the taxi).
  if (looksLikePerson(payee)) {
    return WORDS.find(([, words]) => words.includes(whole))?.[0] ?? null;
  }
  const folded = foldWords(payee).replace(WALLET_WORDS, '');
  if (folded.trim() === '') return null;
  const named = wordTargetOf(folded);
  if (named !== null) return named;
  const hint = categoryHintOf(folded);
  if (hint === 'home' && billWordAt(folded) >= 0) return 'bills';
  return hint;
}

/** The guess for a label, as the app that wrote it means it: their category, or a wallet's payee. */
export function labelTargetOf(app: string, label: string): ImportTarget | null {
  return app === 'momo' ? payeeTargetOf(label) : importTargetOf(label);
}
