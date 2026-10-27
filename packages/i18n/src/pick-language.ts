import { languages } from './catalogue-types';
import type { Language } from './catalogue-types';

export const defaultLanguage: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/** Regions whose Chinese is written in Traditional characters when the tag names no script. */
const TRADITIONAL_REGIONS = new Set(['tw', 'hk', 'mo']);

/**
 * The language 6pm speaks for one locale tag, or null when it has none. `vi-VN`, `vi_VN` and `VI`
 * give `vi`; Chinese is Simplified when the tag says `Hans` or names a Simplified region (`zh-CN`,
 * `zh-SG`, plain `zh`), and Traditional Chinese has no catalogue; `in` is Indonesian's old code.
 */
function languageOfLocale(locale: string): Language | null {
  const [first = '', ...rest] = locale.toLowerCase().split(/[-_]/);
  if (first === 'zh') {
    if (rest.includes('hans')) return 'zh-Hans';
    if (rest.includes('hant')) return null;
    return rest.some((part) => TRADITIONAL_REGIONS.has(part)) ? null : 'zh-Hans';
  }
  const language = first === 'in' ? 'id' : first;
  return isLanguage(language) ? language : null;
}

/**
 * The interface language. A stored choice (the switch in Settings) wins when it names a language
 * we ship. Otherwise the first device locale we have a catalogue for decides, so Vietnamese is
 * used only when `vi` comes before `en` in the device's list. Anything else is English.
 */
export function pickLanguage(
  deviceLocales: readonly string[],
  storedChoice?: string | null,
): Language {
  if (isLanguage(storedChoice)) return storedChoice;
  for (const locale of deviceLocales) {
    const language = languageOfLocale(locale);
    if (language !== null) return language;
  }
  return defaultLanguage;
}

/**
 * The locale each language writes dates and plain numbers in: weekday and month names, their
 * order, the 24-hour clock and the decimal mark. Thai keeps the Gregorian year, the one 6pm's own
 * years are counted in. Money keeps its own rules (`@6pm/domain`).
 */
export const languageLocales: { readonly [L in Language]: string } = {
  en: 'en-GB',
  vi: 'vi-VN',
  'zh-Hans': 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  th: 'th-TH-u-ca-gregory',
  id: 'id-ID',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

/** The locale a language writes dates and plain numbers in (see `languageLocales`). */
export function localeOf(language: Language): string {
  return languageLocales[language];
}
