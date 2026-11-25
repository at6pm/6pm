import { describe, expect, it } from 'vitest';

import { currencyOf, VND } from './currency';
import { formatShort, formatVnd } from './format';
import { moneyFormat, moneyLocale, vndLocale } from './money-format';

const NBSP = ' ';
const us = moneyFormat(moneyLocale(currencyOf('USD'), 'en', { languageTag: 'en-US' }));
const de = moneyFormat(
  moneyLocale(currencyOf('EUR'), 'en', { languageTag: 'de-DE', decimal: ',', group: '.' }),
);
const jp = moneyFormat(moneyLocale(currencyOf('JPY'), 'en', { languageTag: 'ja-JP' }));
const id = moneyFormat(
  moneyLocale(currencyOf('IDR'), 'en', { languageTag: 'id-ID', decimal: ',', group: '.' }),
);

describe('moneyFormat in đồng', () => {
  it('writes exactly what the design writes, in either language', () => {
    for (const language of ['en', 'vi'] as const) {
      const vnd = moneyFormat(vndLocale(language));
      for (const amount of [0, 49_000, 17_400_000, -1_250_000, 999_500, 1_250_000_000]) {
        expect(vnd.full(amount)).toBe(formatVnd(amount));
        expect(vnd.short(amount)).toBe(formatShort(amount, language));
      }
    }
  });

  it('is the same from the phone locale, whatever the phone writes numbers like', () => {
    const vnd = moneyFormat(moneyLocale(VND, 'en', { languageTag: 'en-US' }));
    expect(vnd.full(49_000)).toBe('49.000₫');
    expect(vnd.parts(-49_000)).toEqual({ sign: '−', prefix: '', number: '49.000', suffix: '₫' });
    expect(vnd.spoken(49_000)).toBe('49.000 đồng');
  });
});

describe('moneyFormat elsewhere', () => {
  it('puts the dollar first and shows cents only when there are some', () => {
    expect(us.full(1_200)).toBe('$12');
    expect(us.full(350)).toBe('$3.50');
    expect(us.full(123_456_7)).toBe('$12,345.67');
    expect(us.full(-1_250)).toBe('−$12.50');
    expect(us.number(123_456_700)).toBe('1,234,567');
  });

  it('writes euros the German way', () => {
    expect(de.full(1_250)).toBe(`12,50${NBSP}€`);
    expect(de.full(123_400)).toBe(`1.234${NBSP}€`);
    expect(de.parts(-1_250)).toEqual({
      sign: '−',
      prefix: '',
      number: '12,50',
      suffix: `${NBSP}€`,
    });
  });

  it('keeps yen and rupiah whole, and spaces a symbol made of letters', () => {
    expect(jp.full(1_234_567)).toBe('¥1,234,567');
    expect(id.full(25_000)).toBe(`Rp${NBSP}25.000`);
  });

  it('writes the short form in steps, then k and M', () => {
    expect(us.short(35_300)).toBe('$353');
    expect(us.short(35_349)).toBe('$353');
    expect(us.short(999_900)).toBe('$9,999');
    expect(us.short(1_250_000)).toBe('$12.5k');
    expect(us.short(12_500_000)).toBe('$125k');
    expect(us.short(120_000_000)).toBe('$1.2M');
    expect(us.short(125_000_000_000)).toBe('$1.25B');
    expect(us.short(-600)).toBe('−$6');
    expect(us.short(0)).toBe('$0');
    expect(de.short(1_740_000)).toBe(`17,4k${NBSP}€`);
    expect(jp.short(3_530)).toBe('¥3,530');
    expect(jp.short(353_000)).toBe('¥353k');
  });

  it('switches to M only once the thousands round to a thousand', () => {
    expect(us.short(95_000_000)).toBe('$950k');
    expect(us.short(99_949_900)).toBe('$999k');
    expect(us.short(99_950_000)).toBe('$1M');
  });

  it('says millions as tr in Vietnamese', () => {
    const vi = moneyFormat(moneyLocale(currencyOf('USD'), 'vi', { languageTag: 'en-US' }));
    expect(vi.short(120_000_000)).toBe('$1.2tr');
  });

  it('counts in ten thousands in Chinese, Japanese and Korean', () => {
    const ja = moneyFormat(moneyLocale(currencyOf('JPY'), 'ja', { languageTag: 'ja-JP' }));
    expect(ja.short(3_530)).toBe('¥3,530');
    expect(ja.short(17_400)).toBe('¥1.7万');
    expect(ja.short(353_000)).toBe('¥35.3万');
    expect(ja.short(12_345_678)).toBe('¥1235万');
    expect(ja.short(99_995_000)).toBe('¥1億');
    expect(ja.short(125_000_000)).toBe('¥1.25億');
    const zh = moneyFormat(moneyLocale(currencyOf('CNY'), 'zh-Hans', { languageTag: 'zh-CN' }));
    expect(zh.short(3_530_000)).toBe('¥3.5万');
    expect(zh.short(12_000_000_000)).toBe('¥1.2亿');
    const ko = moneyFormat(moneyLocale(currencyOf('KRW'), 'ko', { languageTag: 'ko-KR' }));
    expect(ko.short(1_250_000)).toBe('₩125만');
    expect(ko.short(-35_000)).toBe('−₩3.5만');
  });

  it('uses each language’s own words for thousands, millions and billions', () => {
    const idr = moneyFormat(
      moneyLocale(currencyOf('IDR'), 'id', { languageTag: 'id-ID', decimal: ',', group: '.' }),
    );
    expect(idr.short(35_000)).toBe(`Rp${NBSP}35${NBSP}rb`);
    expect(idr.short(1_250_000)).toBe(`Rp${NBSP}1,3${NBSP}jt`);
    expect(idr.short(2_500_000_000)).toBe(`Rp${NBSP}2,5${NBSP}M`);
    const eur = currencyOf('EUR');
    const style = { decimal: ',', group: '.' } as const;
    const deDe = moneyFormat(moneyLocale(eur, 'de', { languageTag: 'de-DE', ...style }));
    expect(deDe.short(17_400_00)).toBe(`17.400${NBSP}€`);
    expect(deDe.short(1_240_000_00)).toBe(`1,2${NBSP}Mio.${NBSP}€`);
    expect(deDe.short(2_500_000_000_00)).toBe(`2,5${NBSP}Mrd.${NBSP}€`);
    const fr = moneyFormat(moneyLocale(eur, 'fr', { languageTag: 'fr-FR', ...style }));
    expect(fr.short(17_400_00)).toBe(`17,4${NBSP}k${NBSP}€`);
    expect(fr.short(2_500_000_000_00)).toBe(`2,5${NBSP}Md${NBSP}€`);
    const es = moneyFormat(moneyLocale(eur, 'es', { languageTag: 'es-ES', ...style }));
    expect(es.short(17_400_00)).toBe(`17,4${NBSP}mil${NBSP}€`);
    expect(es.short(2_500_000_000_00)).toBe(`2500${NBSP}M${NBSP}€`);
    const th = moneyFormat(moneyLocale(currencyOf('THB'), 'th', { languageTag: 'th-TH' }));
    expect(th.short(1_740_000)).toBe('฿17.4k');
  });
});

describe('moneyLocale', () => {
  it('reads the symbol position from the language, Brazil aside', () => {
    expect(moneyLocale(currencyOf('EUR'), 'en', { languageTag: 'fr-FR' }).symbolAfter).toBe(true);
    expect(moneyLocale(currencyOf('EUR'), 'en', { languageTag: 'nl-NL' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('BRL'), 'en', { languageTag: 'pt-BR' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('USD'), 'en').symbolAfter).toBe(false);
  });

  it('puts pesos and dollars first in the Americas, whatever the language writes in Spain', () => {
    const mxn = currencyOf('MXN');
    const mx = { decimal: '.', group: ',' } as const;
    const mexico = moneyFormat(moneyLocale(mxn, 'es', { languageTag: 'es-MX', ...mx }));
    expect(mexico.full(32_700)).toBe('$327');
    expect(mexico.full(242_450)).toBe('$2,424.50');
    expect(mexico.short(1_380_000)).toBe(`$13.8${NBSP}mil`);
    expect(mexico.parts(-32_700)).toEqual({ sign: '−', prefix: '$', number: '327', suffix: '' });
    // iOS keeps the region apart from the language: Spanish with Mexico as the region.
    const regionOnly = moneyLocale(mxn, 'es', { languageTag: 'es', region: 'MX', ...mx });
    expect(regionOnly.symbolAfter).toBe(false);
    expect(moneyLocale(mxn, 'es', { languageTag: 'es-419' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('USD'), 'es', { languageTag: 'es-US' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('ARS'), 'es', { languageTag: 'es-AR' }).symbolAfter).toBe(false);
  });

  it('leaves the symbol where the region writes it', () => {
    const eur = currencyOf('EUR');
    expect(moneyLocale(eur, 'es', { languageTag: 'es-ES' }).symbolAfter).toBe(true);
    expect(moneyLocale(currencyOf('USD'), 'es', { languageTag: 'es-ES' }).symbolAfter).toBe(true);
    expect(moneyLocale(currencyOf('CAD'), 'fr', { languageTag: 'fr-CA' }).symbolAfter).toBe(true);
    expect(moneyLocale(currencyOf('CAD'), 'en', { languageTag: 'en-CA' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('AUD'), 'en', { languageTag: 'en-AU' }).symbolAfter).toBe(false);
    expect(moneyLocale(eur, 'de', { languageTag: 'de-AT' }).symbolAfter).toBe(false);
    expect(moneyLocale(eur, 'de', { languageTag: 'de', region: 'DE' }).symbolAfter).toBe(true);
  });

  it('puts a dollar or peso sign first when the phone names no region', () => {
    expect(moneyLocale(currencyOf('MXN'), 'es', { languageTag: 'es' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('USD'), 'vi', { languageTag: 'vi' }).symbolAfter).toBe(false);
    expect(moneyLocale(currencyOf('EUR'), 'es', { languageTag: 'es' }).symbolAfter).toBe(true);
  });

  it('never groups with the decimal mark', () => {
    const odd = moneyLocale(currencyOf('EUR'), 'en', { decimal: ',', group: ',' });
    expect(odd.group).toBe('.');
  });
});
