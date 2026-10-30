import { VND, type Currency, type Money } from './currency';
import { formatShort, formatVnd, groupDigits, MINUS } from './format';

/** How the phone writes money: its currency, separators and where the symbol goes. */
export interface MoneyLocale {
  readonly currency: Currency;
  /**
   * The app's language ("en", "vi", "ja"…), for the short form's words: "17,4tr" in Vietnamese,
   * "35.3万" in Japanese, "1,2 Mio." in German.
   */
  readonly language: string;
  /** The decimal mark: "." or ",". */
  readonly decimal: string;
  /** The thousands separator: ",", ".", a space or an apostrophe. */
  readonly group: string;
  /** "12,50 €" rather than "€12.50". */
  readonly symbolAfter: boolean;
}

/** An amount split for drawing: the odometer rolls `number` and sets the symbol on its own. */
export interface MoneyParts {
  /** U+2212 for a negative amount, else empty. */
  readonly sign: string;
  /** The symbol and its space when it comes first ("$", "Rp "), else empty. */
  readonly prefix: string;
  /** Digits with separators: "1.250.000", "1,234.50". */
  readonly number: string;
  /** The symbol and its space when it comes last ("₫", " €"), else empty. */
  readonly suffix: string;
}

export interface MoneyFormat {
  readonly locale: MoneyLocale;
  readonly currency: Currency;
  /** Full amount with its symbol: "49.000₫", "$1,234.50", "12,50 €". */
  full(amount: Money): string;
  /** The short form for labels and companion lines: "353k", "17,4tr", "$17.4k", "¥35.3万". */
  short(amount: Money): string;
  /** `full` in pieces. */
  parts(amount: Money): MoneyParts;
  /** Digits and separators only, no sign or symbol: "49.000", "1,234.50". */
  number(amount: Money): string;
  /** What VoiceOver reads: "49.000 đồng", "$12.50". */
  spoken(amount: Money): string;
}

/** Languages that write the symbol after the amount ("12,50 €"). Brazil writes it first. */
const SYMBOL_AFTER = new Set([
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'fr',
  'hr',
  'hu',
  'is',
  'it',
  'lt',
  'lv',
  'nb',
  'nn',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sr',
  'sv',
  'uk',
  'vi',
]);

export interface PhoneNumberStyle {
  /** BCP 47 tag of the phone's first locale: "en-US", "de-DE". */
  readonly languageTag?: string | null;
  readonly decimal?: string | null;
  readonly group?: string | null;
}

/** The money locale for a currency, written the way the phone writes numbers. */
export function moneyLocale(
  currency: Currency,
  language: string,
  phone: PhoneNumberStyle = {},
): MoneyLocale {
  const tag = (phone.languageTag ?? '').toLowerCase();
  const [lang = ''] = tag.split(/[-_]/);
  const decimal = phone.decimal === ',' ? ',' : '.';
  const rawGroup = phone.group ?? (decimal === ',' ? '.' : ',');
  const group = rawGroup === decimal ? (decimal === ',' ? '.' : ',') : rawGroup;
  const symbolAfter = SYMBOL_AFTER.has(lang) && tag !== 'pt-br';
  return { currency, language, decimal, group, symbolAfter };
}

/** The design's own: đồng, written the Vietnamese way in every language. */
export function vndLocale(language: string): MoneyLocale {
  return { currency: VND, language, decimal: ',', group: '.', symbolAfter: true };
}

function grouped(whole: number, group: string): string {
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

/** Digits of an amount: whole part grouped, decimals only when the amount has some. */
function digitsOf(amount: Money, locale: MoneyLocale): string {
  const { currency, decimal, group } = locale;
  const abs = Math.abs(Math.round(amount));
  const whole = Math.floor(abs / currency.minorPerMajor);
  const minor = abs % currency.minorPerMajor;
  const head = grouped(whole, group);
  if (minor === 0) return head;
  return head + decimal + minor.toString().padStart(currency.minorDigits, '0');
}

/** A symbol made of letters ("Rp", "CHF", "R$") keeps a space from the number. */
function spaced(symbol: string): boolean {
  return /\p{L}/u.test(symbol);
}

function partsOf(amount: Money, locale: MoneyLocale): MoneyParts {
  const sign = Math.round(amount) < 0 ? MINUS : '';
  const { symbol } = locale.currency;
  const number = digitsOf(amount, locale);
  if (locale.symbolAfter) return { sign, prefix: '', number, suffix: ' ' + symbol };
  return { sign, prefix: symbol + (spaced(symbol) ? ' ' : ''), number, suffix: '' };
}

const NBSP = '\u00a0';

/** One step of a language's short form: "k" for a thousand, "万" for ten thousand. */
interface ShortScale {
  readonly size: number;
  /** The word after the number, with its space where the language puts one. */
  readonly word: string;
}

function thousands(thousand: string | null, million: string, billion?: string): ShortScale[] {
  const scales: ShortScale[] = [];
  if (thousand !== null) scales.push({ size: 1e3, word: thousand });
  scales.push({ size: 1e6, word: million });
  if (billion !== undefined) scales.push({ size: 1e9, word: billion });
  return scales;
}

function myriads(tenThousand: string, hundredMillion: string): ShortScale[] {
  return [
    { size: 1e4, word: tenThousand },
    { size: 1e8, word: hundredMillion },
  ];
}

/**
 * How each language shortens money, after its own phone's compact numbers. Chinese, Japanese and
 * Korean count in ten thousands; German leaves thousands whole; Spanish counts thousands of
 * millions in millions. English keeps the design's lowercase "k", as Thai does.
 */
const SHORT_SCALES: Readonly<Record<string, readonly ShortScale[]>> = {
  vi: thousands('k', 'tr', NBSP + 'tỷ'),
  de: thousands(null, NBSP + 'Mio.', NBSP + 'Mrd.'),
  es: thousands(NBSP + 'mil', NBSP + 'M'),
  fr: thousands(NBSP + 'k', NBSP + 'M', NBSP + 'Md'),
  id: thousands(NBSP + 'rb', NBSP + 'jt', NBSP + 'M'),
  ja: myriads('万', '億'),
  'zh-Hans': myriads('万', '亿'),
  ko: myriads('만', '억'),
};
const ENGLISH_SCALES = thousands('k', 'M', 'B');

/**
 * The amount in the language's scales. Each step carries one decimal ("17.4k") and drops it from a
 * hundred ("353k"); the last carries two ("1.25B"). An amount that rounds up to the next step is
 * written in it: "$1M", never "1000k".
 */
function scaled(major: number, scales: readonly ShortScale[], decimal: string): string {
  for (let level = 0; ; level++) {
    const scale = scales[level];
    if (!scale) return '';
    const next = scales[level + 1];
    const units = major / scale.size;
    const digits = units >= 100 ? 0 : next ? 1 : 2;
    const rounded = Math.round(units * 10 ** digits) / 10 ** digits;
    if (next && rounded >= next.size / scale.size) continue;
    return rounded.toString().replace('.', decimal) + scale.word;
  }
}

/**
 * The short form outside đồng: whole steps below ten thousand, or below the language's first scale
 * ("$353", "¥3,530", "17.400 €"), then the language's scales ("$17.4k", "¥35.3万", "₩125만",
 * "Rp 353 rb", "1,2 Mio. €", "$1.2tr" in Vietnamese).
 */
function shortOf(amount: Money, locale: MoneyLocale): string {
  const { currency, decimal } = locale;
  const sign = amount < 0 ? MINUS : '';
  const major = Math.abs(amount) / currency.minorPerMajor;
  const stepMajor = currency.step / currency.minorPerMajor;
  const scales = SHORT_SCALES[locale.language] ?? ENGLISH_SCALES;
  const whole = Math.round(major / stepMajor) * stepMajor;
  const body =
    whole < Math.max(10_000, scales[0]?.size ?? 0)
      ? grouped(whole, locale.group)
      : scaled(major, scales, decimal);
  const { prefix, suffix } = partsOf(1, locale);
  return (body === '0' ? '' : sign) + prefix + body + suffix;
}

/** Writes money for one locale. VND keeps the design's exact forms in every language. */
export function moneyFormat(locale: MoneyLocale): MoneyFormat {
  const { currency } = locale;
  if (currency.code === 'VND') {
    return {
      locale,
      currency,
      full: formatVnd,
      short: (amount) => formatShort(amount, locale.language),
      parts: (amount) => ({
        sign: Math.round(amount) < 0 ? MINUS : '',
        prefix: '',
        number: groupDigits(amount),
        suffix: '₫',
      }),
      number: groupDigits,
      spoken: (amount) => `${formatVnd(amount).slice(0, -1)} đồng`,
    };
  }
  return {
    locale,
    currency,
    full: (amount) => {
      const p = partsOf(amount, locale);
      return p.sign + p.prefix + p.number + p.suffix;
    },
    short: (amount) => shortOf(amount, locale),
    parts: (amount) => partsOf(amount, locale),
    number: (amount) => digitsOf(amount, locale),
    spoken: (amount) => {
      const p = partsOf(amount, locale);
      return p.sign + p.prefix + p.number + p.suffix;
    },
  };
}
