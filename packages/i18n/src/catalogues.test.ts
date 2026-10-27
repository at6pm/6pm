import { describe, expect, it } from 'vitest';

import { languages, type Language } from './catalogue-types';
import { findCatalogueProblems, findVariantProblems, sameInBothLanguages } from './completeness';
import { deSameAsEnglish } from './de';
import { en } from './en';
import { enAndroid } from './en-android';
import { esSameAsEnglish } from './es';
import { frSameAsEnglish } from './fr';
import { idSameAsEnglish } from './id';
import { jaSameAsEnglish } from './ja';
import { koSameAsEnglish } from './ko';
import { localeOf, pickLanguage } from './pick-language';
import { thSameAsEnglish } from './th';
import { androidVariants, catalogues, t, translatorFor } from './translate';
import { zhHansSameAsEnglish } from './zh-hans';

/** What each language writes exactly as English does, beyond the shared list. */
const sameAsEnglish: { readonly [L in Exclude<Language, 'en'>]: readonly string[] } = {
  vi: [],
  'zh-Hans': zhHansSameAsEnglish,
  ja: jaSameAsEnglish,
  ko: koSameAsEnglish,
  th: thSameAsEnglish,
  id: idSameAsEnglish,
  es: esSameAsEnglish,
  fr: frSameAsEnglish,
  de: deSameAsEnglish,
};
const translations = languages.filter((language) => language !== 'en');

describe('catalogue completeness', () => {
  // A key added to English and not yet to a language fails here, naming the key and the language.
  it.each(translations)(
    'has every English string in %s, with the same parameters and a real translation',
    (language) => {
      const allowed = [...sameInBothLanguages, ...sameAsEnglish[language]];
      expect(findCatalogueProblems(en, catalogues[language], allowed)).toEqual([]);
    },
  );

  it.each(translations)(
    'words every Android key in %s, with the same parameters and a real translation',
    (language) => {
      const allowed = [...sameInBothLanguages, ...sameAsEnglish[language]];
      expect(findCatalogueProblems(enAndroid, androidVariants[language], allowed)).toEqual([]);
    },
  );

  it.each(languages)(
    'varies in %s only keys the catalogue has, keeping their shape',
    (language) => {
      expect(findVariantProblems(catalogues[language], androidVariants[language])).toEqual([]);
    },
  );

  it('keeps only texts a language really writes as English on its own list', () => {
    for (const language of translations) {
      const texts = new Set(
        Object.values(catalogues[language]).flatMap((entry) =>
          typeof entry === 'string' ? [entry] : Object.values(entry),
        ),
      );
      expect(sameAsEnglish[language].filter((text) => !texts.has(text))).toEqual([]);
    }
  });

  it('names each language in its own words', () => {
    expect(languages.map((language) => t(language, 'settings.languageName'))).toEqual([
      'English',
      'Tiếng Việt',
      '简体中文',
      '日本語',
      '한국어',
      'ไทย',
      'Bahasa Indonesia',
      'Español',
      'Français',
      'Deutsch',
    ]);
  });

  it('flags an Android wording that drifts from the catalogue', () => {
    expect(
      findVariantProblems(
        { a: 'Hi {name}', b: { one: '{count} day', other: '{count} days' }, c: 'Same' },
        { a: 'Hello', b: 'days', c: 'Same', d: 'Extra' },
      ),
    ).toEqual([
      'a: parameters differ ({name} against {})',
      'b: plural in one of them only',
      'c: the same as the catalogue',
      'd: not in the catalogue',
    ]);
  });

  it('never names Apple’s things in Android’s own wording', () => {
    const apple =
      /iPhone|App Store|Apple ID|iCloud|Siri|Lock Screen|Home Screen|Shortcuts|\bPhotos\b/;
    for (const entry of languages.flatMap((language) => Object.values(androidVariants[language]))) {
      for (const text of typeof entry === 'string' ? [entry] : Object.values(entry)) {
        expect(text).not.toMatch(apple);
      }
    }
  });
});

describe('translatorFor', () => {
  it('reads Android’s own wording on Android and the catalogue’s everywhere else', () => {
    const android = translatorFor('android');
    expect(android('en', 'scan.handoff.store', { wallet: 'MB Bank' })).toBe(
      'MB Bank isn’t on this phone',
    );
    expect(translatorFor('ios')('en', 'scan.handoff.store', { wallet: 'MB Bank' })).toBe(
      'MB Bank isn’t on this iPhone',
    );
    expect(android('vi', 'today.meterUsed', { spent: '302k', line: '351k' })).toBe(
      'Đã dùng 302k / 351k',
    );
  });

  it('picks an Android plural form from the count', () => {
    expect(translatorFor('android')('en', 'backup.restore.sub', { count: 1 })).toBe(
      '1 item · encrypted.',
    );
  });
});

describe('t', () => {
  it('fills placeholders in the asked language', () => {
    expect(t('en', 'today.meterUsed', { spent: '302k', line: '351k' })).toBe('302k of 351k used');
    expect(t('vi', 'today.meterUsed', { spent: '302k', line: '351k' })).toBe('Đã dùng 302k / 351k');
  });

  it('picks plural forms from the count', () => {
    expect(t('en', 'today.inbox.waiting', { count: 1 })).toBe('1 waiting in Inbox');
    expect(t('vi', 'today.inbox.waiting', { count: 4 })).toBe('4 khoản đang chờ trong Inbox');
  });

  it('reads French one for none and one, and other from two', () => {
    const one = catalogues.fr['plan.daysToPayday'];
    if (typeof one === 'string' || one.one === undefined) throw new Error('a plural with one');
    expect(t('fr', 'plan.daysToPayday', { count: 0 })).toBe(one.one.replace('{count}', '0'));
    expect(t('fr', 'plan.daysToPayday', { count: 1 })).toBe(one.one.replace('{count}', '1'));
    expect(t('fr', 'plan.daysToPayday', { count: 2 })).toBe(one.other.replace('{count}', '2'));
  });
});

describe('pickLanguage', () => {
  it('follows the device, a stored choice wins, English is the fallback', () => {
    expect(pickLanguage(['vi-VN', 'en-US'])).toBe('vi');
    expect(pickLanguage(['en-GB', 'vi-VN'])).toBe('en');
    expect(pickLanguage(['vi-VN'], 'en')).toBe('en');
    expect(pickLanguage(['fr-FR'])).toBe('fr');
    expect(pickLanguage(['pt-BR', 'nl-NL'])).toBe('en');
    expect(pickLanguage(['pt-BR', 'de-AT'])).toBe('de');
    expect(pickLanguage(['de-DE'], 'ja')).toBe('ja');
    expect(pickLanguage(['de-DE'], 'pt')).toBe('de');
  });

  it('reads every language 6pm speaks from the phone’s tags', () => {
    expect(pickLanguage(['ja-JP'])).toBe('ja');
    expect(pickLanguage(['ko-KR'])).toBe('ko');
    expect(pickLanguage(['th-TH'])).toBe('th');
    expect(pickLanguage(['id-ID'])).toBe('id');
    expect(pickLanguage(['in-ID'])).toBe('id');
    expect(pickLanguage(['es-MX'])).toBe('es');
    expect(pickLanguage(['fr-CA'])).toBe('fr');
  });

  it('speaks Simplified Chinese to Simplified tags and passes over Traditional ones', () => {
    for (const tag of ['zh-Hans-CN', 'zh-CN', 'zh-SG', 'zh_CN', 'zh-Hans', 'zh', 'zh-Hans-HK']) {
      expect(pickLanguage([tag])).toBe('zh-Hans');
    }
    for (const tag of ['zh-Hant-TW', 'zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant']) {
      expect(pickLanguage([tag])).toBe('en');
      expect(pickLanguage([tag, 'ja-JP'])).toBe('ja');
    }
  });
});

describe('localeOf', () => {
  it('writes dates in each language’s own locale, Thai years Gregorian', () => {
    const october = new Date('2026-10-27T12:00:00Z');
    const year = (language: Language) =>
      new Intl.DateTimeFormat(localeOf(language), { year: 'numeric', timeZone: 'UTC' }).format(
        october,
      );
    expect(year('th')).toContain('2026');
    expect(
      new Intl.DateTimeFormat(localeOf('de'), { month: 'long', timeZone: 'UTC' }).format(october),
    ).toBe('Oktober');
  });
});
