import type {
  Catalogue,
  Entry,
  Language,
  ParamsArgument,
  Platform,
  StringKey,
  Variants,
} from './catalogue-types';
import { de, deAndroid } from './de';
import { en } from './en';
import { enAndroid } from './en-android';
import { es, esAndroid } from './es';
import { fr, frAndroid } from './fr';
import { id, idAndroid } from './id';
import { ja, jaAndroid } from './ja';
import { ko, koAndroid } from './ko';
import { th, thAndroid } from './th';
import { vi } from './vi';
import { viAndroid } from './vi-android';
import { zhHans, zhHansAndroid } from './zh-hans';

export const catalogues: { readonly [L in Language]: Catalogue } = {
  en,
  vi,
  'zh-Hans': zhHans,
  ja,
  ko,
  th,
  id,
  es,
  fr,
  de,
};

const pluralRules = new Map<Language, Intl.PluralRules>();

/** The languages whose `one` takes 1 alone; French's takes 0 too. The rest have only `other`. */
const ONE_IS_ONE: ReadonlySet<Language> = new Set(['en', 'es', 'de']);

/**
 * The plural category of a number. Uses `Intl.PluralRules`; on an engine that ships without it,
 * falls back to the rules these languages need for whole counts: `one` for 1 in English, Spanish
 * and German, for 0 and 1 in French, and `other` for everything else.
 */
function pluralCategory(language: Language, count: number): Intl.LDMLPluralRule {
  if (typeof Intl === 'undefined' || typeof Intl.PluralRules !== 'function') {
    if (language === 'fr') return count === 0 || count === 1 ? 'one' : 'other';
    return ONE_IS_ONE.has(language) && count === 1 ? 'one' : 'other';
  }
  let rules = pluralRules.get(language);
  if (!rules) {
    rules = new Intl.PluralRules(language);
    pluralRules.set(language, rules);
  }
  return rules.select(count);
}

/** Android's own wording for the keys it reads differently, in each language. */
export const androidVariants: { readonly [L in Language]: Variants } = {
  en: enAndroid,
  vi: viAndroid,
  'zh-Hans': zhHansAndroid,
  ja: jaAndroid,
  ko: koAndroid,
  th: thAndroid,
  id: idAndroid,
  es: esAndroid,
  fr: frAndroid,
  de: deAndroid,
};

const variantsOf: { readonly [P in Platform]: { readonly [L in Language]: Variants } | null } = {
  ios: null,
  android: androidVariants,
};

/**
 * The interface string for a key, in a language, as the iPhone reads it. `{name}` placeholders
 * are filled from `params`; a plural string picks its form from `params.count`.
 */
export function t<Key extends StringKey>(
  language: Language,
  key: Key,
  ...[params]: ParamsArgument<Key>
): string {
  return render(language, catalogues[language][key], params);
}

/**
 * `t` for a platform: a key the platform words its own way reads that way, every other key as the
 * catalogue has it.
 */
export function translatorFor(platform: Platform): typeof t {
  const variants = variantsOf[platform];
  if (variants === null) return t;
  return (language, key, ...[params]) =>
    render(language, variants[language][key] ?? catalogues[language][key], params);
}

function render(
  language: Language,
  entry: Entry,
  params: Readonly<Record<string, string | number>> | undefined,
): string {
  const values: Readonly<Record<string, string | number>> = params ?? {};
  let text: string;
  if (typeof entry === 'string') {
    text = entry;
  } else {
    const count = values['count'];
    const category = typeof count === 'number' ? pluralCategory(language, count) : 'other';
    text = entry[category] ?? entry.other;
  }
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}
