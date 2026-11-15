import { describe, expect, it } from '@jest/globals';

import { quickKeyRows } from './quick-keys';

describe('quickKeyRows', () => {
  it('keeps 1–9, delete, k and 000 where they are at home in đồng', () => {
    expect(quickKeyRows({ decimal: false, currency: false })).toEqual([
      ['1', '2', '3', 'back'],
      ['4', '5', '6', 'k'],
      ['7', '8', '9', '000'],
    ]);
  });

  it('gives the decimal key or the currency key the 000 cell, keeping k', () => {
    expect(quickKeyRows({ decimal: true, currency: false })[2]).toEqual(['7', '8', '9', '.']);
    expect(quickKeyRows({ decimal: false, currency: true })[2]).toEqual([
      '7',
      '8',
      '9',
      'currency',
    ]);
    expect(quickKeyRows({ decimal: true, currency: false })[1]).toEqual(['4', '5', '6', 'k']);
  });

  it('with both, the currency key takes k and the decimal key 000', () => {
    const rows = quickKeyRows({ decimal: true, currency: true });
    expect(rows[1]).toEqual(['4', '5', '6', 'currency']);
    expect(rows[2]).toEqual(['7', '8', '9', '.']);
  });
});
