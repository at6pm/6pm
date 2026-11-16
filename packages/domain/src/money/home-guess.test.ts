import { describe, expect, it } from 'vitest';

import { guessHomeCurrency } from './home-guess';

describe('guessHomeCurrency', () => {
  it('is the region currency when nothing says otherwise', () => {
    expect(
      guessHomeCurrency({
        regionCurrency: 'VND',
        languageTags: ['vi-VN'],
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
    ).toEqual({ code: 'VND', candidates: ['VND'] });
    expect(
      guessHomeCurrency({
        regionCurrency: 'usd',
        languageTags: ['en-US'],
        timeZone: 'America/New_York',
      }),
    ).toEqual({ code: 'USD', candidates: ['USD'] });
  });

  it('counts in đồng on a phone in Vietnam whose region is somewhere else', () => {
    expect(
      guessHomeCurrency({
        regionCurrency: 'USD',
        languageTags: ['en-US', 'vi-US'],
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
    ).toEqual({ code: 'VND', candidates: ['VND', 'USD'] });
    expect(
      guessHomeCurrency({
        regionCurrency: 'USD',
        languageTags: ['vi-US'],
        timeZone: 'Asia/Saigon',
      }),
    ).toEqual({ code: 'VND', candidates: ['VND', 'USD'] });
  });

  it('keeps the region currency for a phone in Vietnamese abroad, with đồng to choose', () => {
    expect(
      guessHomeCurrency({
        regionCurrency: 'USD',
        languageTags: ['vi-US'],
        timeZone: 'America/Los_Angeles',
      }),
    ).toEqual({ code: 'USD', candidates: ['USD', 'VND'] });
  });

  it('counts a phone with no region in dollars', () => {
    expect(guessHomeCurrency({ regionCurrency: null, languageTags: [], timeZone: null })).toEqual({
      code: 'USD',
      candidates: ['USD'],
    });
    expect(
      guessHomeCurrency({ regionCurrency: '€', languageTags: ['fr-FR'], timeZone: 'Europe/Paris' }),
    ).toEqual({ code: 'USD', candidates: ['USD'] });
  });
});
