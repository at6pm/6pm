import { describe, expect, it } from 'vitest';

import { parseSpokenSpend } from './spoken-spend';

describe('lì xì said by the envelope', () => {
  it('reads "lì xì 5 bao 200k" as one 1tr spend of five envelopes', () => {
    expect(parseSpokenSpend('lì xì 5 bao 200k')).toEqual({
      name: '',
      amount: 1_000_000,
      categoryHint: 'gifts',
      envelopes: { count: 5, each: 200_000 },
    });
  });

  it('reads the count after the amount, each envelope said, and words for the numbers', () => {
    expect(parseSpokenSpend('lì xì 200k x 5')).toMatchObject({
      amount: 1_000_000,
      envelopes: { count: 5, each: 200_000 },
    });
    expect(parseSpokenSpend('lì xì 3 bao mỗi bao 500 nghìn')).toMatchObject({
      amount: 1_500_000,
      envelopes: { count: 3, each: 500_000 },
    });
    expect(parseSpokenSpend('Li xi năm bao hai trăm k')).toMatchObject({ amount: 1_000_000 });
  });

  it('is one envelope when no count is said, and keeps who it was for', () => {
    expect(parseSpokenSpend('lì xì cho cháu 500k')).toMatchObject({
      name: 'Cháu',
      amount: 500_000,
      envelopes: { count: 1, each: 500_000 },
    });
  });

  it('reads lì xì received as money in', () => {
    expect(parseSpokenSpend('được lì xì 500k')).toMatchObject({
      amount: 500_000,
      direction: 'in',
      envelopes: { count: 1, each: 500_000 },
    });
    expect(parseSpokenSpend('bà lì xì 2 bao 200k')).toMatchObject({
      amount: 400_000,
      direction: 'in',
    });
  });

  it('leaves everything else alone', () => {
    expect(parseSpokenSpend('phở bò 45k')).not.toHaveProperty('envelopes');
  });
});
