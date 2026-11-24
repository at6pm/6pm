import { describe, expect, it } from '@jest/globals';

import { languages, localeOf, type Language } from '@6pm/i18n';

import { diaryDateLabels, monthComesFirst } from './date-labels';

const labels = (language: Language) => diaryDateLabels(localeOf(language));
const MONTH_FIRST: readonly Language[] = ['ja', 'ko', 'zh-Hans'];
const dayFirst = languages.filter((language) => !MONTH_FIRST.includes(language));

describe('monthComesFirst', () => {
  it('is true for Japanese, Korean and Chinese and for no other language', () => {
    for (const language of languages) {
      expect([language, monthComesFirst(localeOf(language))]).toEqual([
        language,
        MONTH_FIRST.includes(language),
      ]);
    }
  });

  it('reads the order from the locale, not the language list', () => {
    expect(monthComesFirst('en-US')).toBe(true);
    expect(monthComesFirst('hu-HU')).toBe(true);
    expect(monthComesFirst('pt-BR')).toBe(false);
  });
});

describe('a run of days in one month', () => {
  it('leads with the month, said once, where the language writes the month first', () => {
    expect(labels('ja').range('2026-10-26', '2026-10-31')).toBe('10月26日–31日');
    expect(labels('zh-Hans').range('2026-10-26', '2026-10-31')).toBe('10月26日–31日');
    expect(labels('ko').range('2026-10-26', '2026-10-31')).toBe('10월 26일–31일');
  });

  it('ends with the month in every other language', () => {
    expect(labels('en').range('2026-10-26', '2026-10-31')).toBe('26–31 OCT');
    expect(labels('en').range('2026-10-26', '2026-10-31', false)).toBe('26–31 Oct');
    for (const language of dayFirst) {
      const text = labels(language).range('2026-10-26', '2026-10-31');
      // German counts its days with a full stop: "26.–31. OKT".
      expect([language, text.replace(/\./g, '').slice(0, 6)]).toEqual([language, '26–31 ']);
      expect([language, text.length > 6]).toEqual([language, true]);
    }
  });

  it('gives German days their full stop', () => {
    expect(labels('de').range('2026-10-26', '2026-10-31').startsWith('26.–31. OKT')).toBe(true);
    expect(labels('de').range('2026-10-31', '2026-10-31').startsWith('31. OKT')).toBe(true);
  });

  it('keeps Vietnamese at the month written out, not the engine’s "thg"', () => {
    expect(labels('vi').range('2026-10-26', '2026-10-31').toLowerCase()).not.toContain('thg');
  });
});

describe('a single day and a run across a month end', () => {
  it('writes one day once, in the language’s order', () => {
    expect(labels('ja').range('2026-10-31', '2026-10-31')).toBe('10月31日');
    expect(labels('ko').range('2026-10-31', '2026-10-31')).toBe('10월 31일');
    expect(labels('en').range('2026-10-31', '2026-10-31')).toBe('31 OCT');
  });

  it('names both months across a month end, each day in the language’s order', () => {
    expect(labels('ja').range('2026-10-28', '2026-11-02')).toBe('10月28日 – 11月2日');
    expect(labels('ko').range('2026-10-28', '2026-11-02')).toBe('10월 28일 – 11월 2일');
    expect(labels('zh-Hans').range('2026-10-28', '2026-11-02')).toBe('10月28日 – 11月2日');
    expect(labels('en').range('2026-10-28', '2026-11-02')).toBe('28 OCT – 2 NOV');
    for (const language of languages) {
      const text = labels(language).range('2026-10-28', '2026-11-02');
      expect([language, text.split(' – ').length]).toEqual([language, 2]);
    }
  });
});

describe('a day’s stamp', () => {
  it('is the weekday, the day in two digits and the month where the day comes first', () => {
    expect(labels('en').stamp('2026-10-07')).toBe('WED 07 OCT');
    for (const language of dayFirst) {
      expect([language, labels(language).stamp('2026-10-07').includes(' 07 ')]).toEqual([
        language,
        true,
      ]);
    }
  });

  it('is the language’s own date where the month comes first', () => {
    expect(labels('ja').stamp('2026-10-07')).toBe('10月7日(水)');
    expect(labels('ko').stamp('2026-10-07')).toBe('10월 7일 (수)');
    expect(labels('zh-Hans').stamp('2026-10-07')).toBe('10月7日周三');
  });
});
