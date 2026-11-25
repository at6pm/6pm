/**
 * The site's languages, the same ten the app speaks, in the order the language menu lists them.
 * English lives at the site root; every other language under its own prefix (`/vi`, `/ja`…).
 */
export const siteLangs = ['en', 'vi', 'zh-Hans', 'ja', 'ko', 'th', 'id', 'es', 'fr', 'de'] as const;

export type SiteLang = (typeof siteLangs)[number];

/** The blog, the social cards and the launch list speak only these two. */
export type BaseLang = 'en' | 'vi';

export interface SiteLangInfo {
  /** The language in its own words, as the language menu lists it. */
  readonly name: string;
  /** Its home page as a site path; its other pages sit under it (`/ja/privacy`). */
  readonly home: string;
  /** For `og:locale`. */
  readonly ogLocale: string;
  /** Where its prices come from: the market the page speaks to, and its money. */
  readonly market: { readonly locale: string; readonly currency: string };
  /**
   * The language its visitors get where a page speaks only English and Vietnamese: the blog, the
   * social cards and the launch list.
   */
  readonly base: BaseLang;
}

export const siteLangInfo: Readonly<Record<SiteLang, SiteLangInfo>> = {
  en: {
    name: 'English',
    home: '/',
    ogLocale: 'en_US',
    market: { locale: 'en-US', currency: 'USD' },
    base: 'en',
  },
  vi: {
    name: 'Tiếng Việt',
    home: '/vi',
    ogLocale: 'vi_VN',
    market: { locale: 'vi-VN', currency: 'VND' },
    base: 'vi',
  },
  'zh-Hans': {
    name: '简体中文',
    home: '/zh-hans',
    ogLocale: 'zh_CN',
    market: { locale: 'zh-CN', currency: 'CNY' },
    base: 'en',
  },
  ja: {
    name: '日本語',
    home: '/ja',
    ogLocale: 'ja_JP',
    market: { locale: 'ja-JP', currency: 'JPY' },
    base: 'en',
  },
  ko: {
    name: '한국어',
    home: '/ko',
    ogLocale: 'ko_KR',
    market: { locale: 'ko-KR', currency: 'KRW' },
    base: 'en',
  },
  th: {
    name: 'ไทย',
    home: '/th',
    ogLocale: 'th_TH',
    market: { locale: 'th-TH', currency: 'THB' },
    base: 'en',
  },
  id: {
    name: 'Bahasa Indonesia',
    home: '/id',
    ogLocale: 'id_ID',
    market: { locale: 'id-ID', currency: 'IDR' },
    base: 'en',
  },
  es: {
    name: 'Español',
    home: '/es',
    ogLocale: 'es_ES',
    market: { locale: 'es-ES', currency: 'EUR' },
    base: 'en',
  },
  fr: {
    name: 'Français',
    home: '/fr',
    ogLocale: 'fr_FR',
    market: { locale: 'fr-FR', currency: 'EUR' },
    base: 'en',
  },
  de: {
    name: 'Deutsch',
    home: '/de',
    ogLocale: 'de_DE',
    market: { locale: 'de-DE', currency: 'EUR' },
    base: 'en',
  },
};

/** The languages with their own URL prefix: every one but English. */
export const prefixedLangs: readonly Exclude<SiteLang, 'en'>[] = siteLangs.filter(
  (lang): lang is Exclude<SiteLang, 'en'> => lang !== 'en',
);

/** A language's URL segment (`zh-hans`), for the routes under it. */
export const langSegment = (lang: SiteLang): string => siteLangInfo[lang].home.slice(1);

/** A page in one language, as a site path: `/privacy` in English, `/ja/privacy` in Japanese. */
export function langPath(lang: SiteLang, page: string): string {
  return lang === 'en' ? `/${page}` : `${siteLangInfo[lang].home}/${page}`;
}

/** The language a document says it is in (`<html lang>`), when it is one of the site's. */
export function siteLangOf(code: string | undefined): SiteLang | undefined {
  return siteLangs.find((lang) => lang === code);
}
