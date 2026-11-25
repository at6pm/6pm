import { describe, expect, it } from 'vitest';

import { inSentence } from './in-sentence';

describe('inSentence', () => {
  it('lowers a month name inside a French, Spanish or Vietnamese sentence', () => {
    expect(inSentence('Octobre', 'fr')).toBe('octobre');
    expect(inSentence('Octubre', 'es')).toBe('octubre');
    expect(inSentence('Tháng 10', 'vi')).toBe('tháng 10');
    expect(inSentence('tháng 1 năm 2027', 'vi')).toBe('tháng 1 năm 2027');
  });

  it('keeps the capital where the language writes one', () => {
    expect(inSentence('October', 'en')).toBe('October');
    expect(inSentence('Oktober', 'de')).toBe('Oktober');
    expect(inSentence('Oktober', 'id')).toBe('Oktober');
    expect(inSentence('10月', 'ja')).toBe('10月');
  });
});
