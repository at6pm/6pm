import type { Currency } from '../money/currency';

/**
 * Money as banks outside Vietnam print it, rewritten the way `bank-alert` reads amounts: every
 * script's digits as 0-9, a currency word or a symbol several currencies share as its ISO code,
 * thousands grouped by spaces, apostrophes or in lakhs joined up, and a space between an amount and
 * letters of a script that puts none.
 */

/** The digit zero of each script whose digits banks print: Arabic, Persian, Devanagari, Bengali, Thai, Lao, Khmer. */
const DIGIT_ZEROS = [0x660, 0x6f0, 0x966, 0x9e6, 0xe50, 0xed0, 0x17e0];
const OTHER_DIGITS = /[٠-٩۰-۹०-९০-৯๐-๙໐-໙០-៩]/gu;

function asciiDigits(text: string): string {
  return text
    .replace(OTHER_DIGITS, (digit) => {
      const code = digit.codePointAt(0) ?? 0;
      const zero = DIGIT_ZEROS.find((z) => code >= z && code <= z + 9) ?? code;
      return String(code - zero);
    })
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
}

/** The code a word stands for, given the phone's home: the home's own where it shares the word. */
type Owner = (home: Currency) => string;
const one =
  (code: string): Owner =>
  () =>
    code;
const homeOr =
  (codes: readonly string[], otherwise: string): Owner =>
  (home) =>
    codes.includes(home.code) ? home.code : otherwise;
/** A mark that stands for a currency only on a phone counting it ("R" in South Africa). */
const onlyAt =
  (code: string): Owner =>
  (home) =>
    home.code === code ? code : '';

const YUAN = homeOr(['CNY', 'TWD', 'HKD', 'MOP'], 'CNY');
const RIAL = homeOr(['SAR', 'QAR', 'OMR', 'YER', 'IRR'], 'SAR');
const RUPEE = homeOr(['INR', 'PKR', 'LKR', 'NPR'], 'INR');
const KRONA = homeOr(['SEK', 'NOK', 'DKK', 'ISK'], 'SEK');

/** Words printed after the digits ("1,234円", "500.00 บาท", "125,00 kr"). */
const AFTER: readonly (readonly [RegExp, Owner])[] = [
  [/(?<=\d\s*)(?:港元|港幣|港币)/gu, one('HKD')],
  [/(?<=\d\s*)(?:日元|日圓)/gu, one('JPY')],
  [/(?<=\d\s*)(?:美元|美金)/gu, one('USD')],
  [/(?<=\d\s*)(?:新台幣|新臺幣|台幣)/gu, one('TWD')],
  [/(?<=\d\s*)(?:人民币|人民幣)/gu, one('CNY')],
  [/(?<=\d\s*)円/gu, one('JPY')],
  [/(?<=\d\s*)원/gu, one('KRW')],
  [/(?<=\d\s*)WON(?!\p{L})/gu, one('KRW')],
  [/(?<=\d\s*)달러/gu, one('USD')],
  [/(?<=\d\s*)[元圓]/gu, YUAN],
  [/(?<=\d\s*)บาท/gu, one('THB')],
  [/(?<=\d\s*)บ\.?(?=[\s/]|$)/gu, one('THB')],
  [/(?<=\d\s*)ກີບ/gu, one('LAK')],
  [/(?<=\d\s*)រៀល/gu, one('KHR')],
  [/(?<=\d\s*)টাকা/gu, one('BDT')],
  [/(?<=\d\s*)(?:ريال سعود[يى]|ر\.\s?س\.?)/gu, one('SAR')],
  [/(?<=\d\s*)(?:ريال|﷼)/gu, RIAL],
  [/(?<=\d\s*)(?:درهم|د\.\s?إ\.?)/gu, one('AED')],
  [/(?<=\d\s*)TL(?!\p{L})/gu, one('TRY')],
  [/(?<=\d\s*)kr\.?(?!\p{L})/gu, KRONA],
  [/(?<=\d\s*)z[łl](?!\p{L})/gu, one('PLN')],
  [/(?<=\d\s*)(?:Rs\.?|₨)(?!\p{L})/gu, RUPEE],
];

/** Marks printed before the digits ("Rs.500", "Ksh1,000.00", "人民币100.00", "R150.00"). */
const BEFORE: readonly (readonly [RegExp, Owner])[] = [
  [/(?:人民币|人民幣)(?=\s?\d)/gu, one('CNY')],
  [/(?:新台幣|新臺幣|台幣)(?=\s?\d)/gu, one('TWD')],
  [/(?:港幣|港币|港元)(?=\s?\d)/gu, one('HKD')],
  [/(?<![\p{L}\p{N}])(?:[Rr][Ss]\.?|₨)(?=\s?\d)/gu, RUPEE],
  [/(?<![\p{L}\p{N}])K[Ss][Hh][Ss]?\.?(?=\s?\d)/gu, one('KES')],
  [/(?<![\p{L}\p{N}])[Tt][Kk]\.?(?=\s?\d)/gu, onlyAt('BDT')],
  [/(?<![\p{L}\p{N}$])R(?=\s?\d)/gu, onlyAt('ZAR')],
  [/(?<![\p{L}\p{N}])N(?=\s?\d)/gu, onlyAt('NGN')],
  [/(?<![\p{L}\p{N}])P(?=\s?\d)/gu, onlyAt('PHP')],
  [/(?<![\p{L}\p{N}])Dhs?\.?(?=\s?\d)/gu, one('AED')],
  [/(?<![\p{L}\p{N}])SR(?=\s?\d)/gu, one('SAR')],
  [/(?:ريال سعود[يى]|ر\.\s?س\.?)(?=\s?\d)/gu, one('SAR')],
  [/(?:ريال|﷼)(?=\s?\d)/gu, RIAL],
  [/(?:درهم|د\.\s?إ\.?)(?=\s?\d)/gu, one('AED')],
  [/(?<![\p{L}\p{N}])kr\.?(?=\s?\d)/gu, KRONA],
  [/(?<![\p{L}\p{N}])TL(?=\s?\d)/gu, one('TRY')],
];

function marksAsCodes(text: string, home: Currency): string {
  let out = text;
  for (const [mark, owner] of AFTER) {
    out = out.replace(mark, (found) => {
      const code = owner(home);
      return code === '' ? found : ` ${code} `;
    });
  }
  for (const [mark, owner] of BEFORE) {
    out = out.replace(mark, (found) => {
      const code = owner(home);
      return code === '' ? found : ` ${code} `;
    });
  }
  return out;
}

/** Cents after a dot that also groups thousands: "Rp100.000.00", "PKR 70.000.00". */
const DOTTED_CENTS = /(?<![\d.,])(\d{1,3}(?:\.\d{3})+)\.(\d{2})(?![\d.,])/g;
/** Thousands grouped in lakhs, as India prints them: "1,23,456.00". */
const LAKHS = /(?<![\d.,])\d{1,2}(?:,\d{2})+,\d{3}(?![\d,])/g;
/** Thousands grouped by apostrophes, as Switzerland prints them: "1'234.50". */
const APOSTROPHES = /(?<![\d.,])\d{1,3}(?:['’]\d{3})+(?!\d)/g;
/** Thousands grouped by spaces: "1 234,56 €", "12 500 kr". */
const SPACES = /(?<![\d.,:/])\d{1,3}(?:[ \u00A0\u202F\u2009]\d{3})+(?!\d)/g;
/** After a space-grouped number, what makes it money: its decimals or its currency. */
const MONEY_AFTER = /^(?:[.,]\d{1,2}(?!\d)|\s*(?:[A-Z]{3}(?!\p{L})|\p{Sc}))/u;
const MONEY_BEFORE = /(?:\p{Sc}|(?<!\p{L})[A-Z]{3})\s*$/u;

function joinGroups(text: string): string {
  return text
    .replace(DOTTED_CENTS, '$1,$2')
    .replace(LAKHS, (found) => found.replace(/,/g, ''))
    .replace(APOSTROPHES, (found) => found.replace(/['’]/g, ''))
    .replace(SPACES, (found, offset: number, whole: string) => {
      const after = whole.slice(offset + found.length);
      const before = whole.slice(0, offset);
      return MONEY_AFTER.test(after) || MONEY_BEFORE.test(before)
        ? found.replace(/[ \u00A0\u202F\u2009]/g, '')
        : found;
    });
}

/**
 * What is no amount though it looks like one: a phone number's "+" ("+254700000000", "+91 99518
 * 60002") and the dash after a masked account ("****-4054-93").
 */
const PHONE_PLUS = /\+(?=\d{1,4}(?:[ -]?\d){7,})/g;
const MASKED_DASH = /(?<=[*•]|[xX]{2})-(?=\d)/g;
/** A dash set between spaces separates two parts ("diterima - Rp 100"); it signs nothing. */
const LONE_DASH = /(?<=\s)[-–—](?=\s)/g;
/** Words a message ran together, an upper-case one before a capitalised one ("PMWithdraw"). */
const RUN_TOGETHER = /(?<=\p{Lu}{2})(?=\p{Lu}\p{Ll}{2})/gu;

/** Scripts that set no space between a word and a number. */
const CLOSE_SCRIPTS =
  String.raw`\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}` +
  String.raw`\p{Script=Lao}\p{Script=Khmer}\p{Script=Arabic}\p{Script=Bengali}`;
const WORD_THEN_AMOUNT = new RegExp(`([${CLOSE_SCRIPTS}\u0640])(?=[\\dA-Za-z\\p{Sc}+\\-−])`, 'gu');
/** A number before these is a date or a time ("10月13日", "11월 12일"), kept off any amount. */
const DATE_UNITS = '年月日时時分秒号號년월일시분초';
const AMOUNT_THEN_WORD = new RegExp(
  `([\\dA-Za-z])(?=[${CLOSE_SCRIPTS}])(?<![\\d](?=[${DATE_UNITS}]))`,
  'gu',
);

/** An alert from outside Vietnam with its money written as `bank-alert` reads it. */
export function normalizeWorldAlert(text: string, home: Currency): string {
  const plain = asciiDigits(text.normalize('NFKC'))
    .replace(PHONE_PLUS, '')
    .replace(MASKED_DASH, ' ')
    .replace(LONE_DASH, '·')
    .replace(RUN_TOGETHER, ' ');
  return joinGroups(marksAsCodes(plain, home))
    .replace(WORD_THEN_AMOUNT, '$1 ')
    .replace(AMOUNT_THEN_WORD, '$1 ')
    .replace(/[ \t]{2,}/g, ' ');
}
