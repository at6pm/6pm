import { foldWords } from './fold-words';

/** The kinds of bill a paper bill or a payee can be told apart as: the onboarding deck's three asks. */
export type BillTopic = 'rent' | 'power' | 'phone';

/** Finer than a topic: power is electricity or water, so a water bill never takes an EVN payment. */
type BillWord = 'electric' | 'water' | 'phone' | 'rent';

const TOPIC_OF: Readonly<Record<BillWord, BillTopic>> = {
  electric: 'power',
  water: 'power',
  phone: 'phone',
  rent: 'rent',
};

/**
 * Words a bill, a bank's payee or a transfer's memo prints, accents folded (`foldWords`): the
 * electricity and water companies, the phone and internet providers, the landlord's "tiền nhà".
 * Phrases, so "điện" alone (also in "điện thoại") names nothing; "điện thoại" is read as one word
 * (`dienthoai`) first, so "tiền điện thoại" is a phone bill, never power.
 */
const PRINTED: Readonly<Record<BillWord, readonly string[]>> = {
  electric: [
    'tien dien',
    'hoa don dien',
    'dien luc',
    'evn',
    'evnhcmc',
    'evnhanoi',
    'evnspc',
    'evncpc',
    'evnnpc',
    'dien nang',
    'electricity',
    'electric bill',
    'power bill',
  ],
  water: [
    'tien nuoc',
    'hoa don nuoc',
    'cap nuoc',
    'cap thoat nuoc',
    'nuoc sach',
    'sawaco',
    'water bill',
    'water supply',
  ],
  phone: [
    'cuoc vien thong',
    'cuoc di dong',
    'cuoc dienthoai',
    'tien dienthoai',
    'hoa don dienthoai',
    'nap tien dienthoai',
    'nap dienthoai',
    'thue bao',
    'tra sau',
    'internet',
    'cap quang',
    'fpt telecom',
    'fpt internet',
    'vnpt',
    'viettel',
    'viettel telecom',
    'mobifone',
    'vinaphone',
    'vietnamobile',
    'truyen hinh',
    'vtvcab',
    'sctv',
    'broadband',
    'mobile plan',
  ],
  rent: ['tien nha', 'tien phong', 'thue nha', 'thue phong', 'rent'],
};

/** Words in a bill's own name that say which kind it is, accents folded. */
const NAMED: Readonly<Record<BillWord, readonly string[]>> = {
  electric: ['dien', 'power', 'electric', 'electricity', 'evn', 'utilities', 'utility'],
  water: ['nuoc', 'water', 'utilities', 'utility'],
  phone: [
    'dienthoai',
    'mang',
    'internet',
    'wifi',
    'net',
    'phone',
    'mobile',
    '4g',
    '5g',
    'fpt',
    'viettel',
    'vnpt',
    'mobifone',
    'vinaphone',
  ],
  rent: ['nha', 'phong', 'rent', 'house', 'flat', 'apartment'],
};

/**
 * Names that hold a provider's word without being its bill: the telcos' wallets, Viettel's shops
 * and its courier. Taken out before the words are read.
 */
const NOT_A_BILL =
  / (?:viettel money|viettelpay|viettel pay|viettel store|viettel post|vnpt money|vnpt pay|vnptpay|mobifone money|mobifone pay)(?= )/g;

/** Folded, with "điện thoại" as one word and the providers' other businesses taken out. */
function foldBill(text: string): string {
  return foldWords(text)
    .replace(/ dien thoai(?= )/g, ' dienthoai')
    .replace(NOT_A_BILL, '');
}

const has = (folded: string, words: readonly string[]) =>
  words.some((word) => folded.includes(` ${word} `));

const ORDER: readonly BillWord[] = ['electric', 'water', 'phone', 'rent'];

function printedIn(text: string): BillWord[] {
  const folded = foldBill(text);
  return ORDER.filter((word) => has(folded, PRINTED[word]));
}

/** The kinds a bill's name says; "Điện thoại" is a phone, never power. */
function namedIn(name: string): BillWord[] {
  const folded = foldBill(name);
  if (has(folded, NAMED.phone)) return ['phone'];
  return ORDER.filter((word) => word !== 'phone' && has(folded, NAMED[word]));
}

/** Which kind of bill a receipt's text, a payee or a memo is, or null when it reads as no bill. */
export function billTopicOf(text: string): BillTopic | null {
  const first = printedIn(text)[0];
  return first === undefined ? null : TOPIC_OF[first];
}

/**
 * Where in a text (folded, as `foldWords` folds it) its first bill word starts, or -1 when it
 * prints none: for weighing it against other words, the earliest winning.
 */
export function billWordAt(text: string): number {
  const folded = foldBill(text);
  let at = -1;
  for (const word of ORDER.flatMap((kind) => PRINTED[kind])) {
    const found = folded.indexOf(` ${word} `);
    if (found >= 0 && (at < 0 || found < at)) at = found;
  }
  return at;
}

/** Which kind of bill a plan bill's name says it is; "Điện thoại" is a phone, not power. */
export function billTopicOfName(name: string): BillTopic | null {
  const first = namedIn(name)[0];
  return first === undefined ? null : TOPIC_OF[first];
}

/**
 * Whether a payee, note or memo reads as the same kind of bill as a plan bill's name: an EVN
 * payment and "Điện nước", a VNPT one and "Điện thoại & mạng". Electricity and water are told
 * apart when both sides say which ("Tiền nước" never takes an EVN payment).
 */
export function sameBillKind(text: string, name: string): boolean {
  const printed = printedIn(text);
  const named = namedIn(name);
  return printed.some((word) => named.includes(word));
}

/**
 * Whether a payee reads as one kind of bill and the bill's name as another: a Viettel payment is
 * never "Điện", whatever words they share.
 */
export function otherBillKind(text: string, name: string): boolean {
  const printed = printedIn(text);
  const named = namedIn(name);
  return printed.length > 0 && named.length > 0 && !printed.some((word) => named.includes(word));
}

/**
 * What a bank or wallet prints before the payee of a bill it paid: "Thanh toán hóa đơn của dịch
 * vụ Điện lực Hồ Chí Minh", "HOA DON DICH VU VNPT", "Thanh toán dịch vụ FPT Telecom". "Thanh toán"
 * alone is left as it is (it also says what a memo paid off).
 */
const BILL_LEAD =
  /^(?:(?:(?:thanh\s*to[aá]n|tt)\s+)?(?:h[oó]a|ho[aá])\s*[đd][oơ]n\s+(?:c[uủ]a\s+)?(?:d[iị]ch\s*v[uụ]\s+)?|(?:thanh\s*to[aá]n|tt)\s+d[iị]ch\s*v[uụ]\s+)/iu;

/**
 * A payee with a bill payment's lead words taken off: "hóa đơn của dịch vụ Điện lực Hồ Chí Minh"
 * is "Điện lực Hồ Chí Minh". Anything else, or a lead with no name after it, is kept as it is.
 */
export function tidyPayee(name: string): string {
  const trimmed = name.trim();
  const plain = trimmed.normalize('NFC');
  const lead = BILL_LEAD.exec(plain);
  if (!lead) return trimmed;
  const rest = plain.slice(lead[0].length).replace(/^[\s,.;:-]+/u, '');
  return /\p{L}{2}/u.test(rest) ? rest : trimmed;
}
