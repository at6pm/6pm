import { describe, expect, it } from '@jest/globals';

import { currencyOf } from '@6pm/domain';

import { currencyChoices, currencyName } from './currency-choices';

describe('currencyChoices', () => {
  it('lists what the phone points at first, then đồng and the dollar, each once', () => {
    const choices = currencyChoices('USD', ['VND', 'USD']);
    expect(choices.slice(0, 2)).toEqual(['VND', 'USD']);
    expect(new Set(choices).size).toBe(choices.length);
    expect(choices).toContain('THB');
  });

  it('keeps its order when the plan changes currency', () => {
    expect(currencyChoices('VND', ['VND', 'USD'])).toEqual(currencyChoices('USD', ['VND', 'USD']));
  });

  it('always lists the plan’s own currency', () => {
    expect(currencyChoices('XOF', ['XOF'])[0]).toBe('XOF');
    expect(currencyChoices('XOF', ['USD'])).toContain('XOF');
  });
});

describe('currencyName', () => {
  it('is the code with its symbol, or the code alone', () => {
    expect(currencyName(currencyOf('VND'))).toBe('VND (₫)');
    expect(currencyName(currencyOf('CHF'))).toBe('CHF');
  });
});
