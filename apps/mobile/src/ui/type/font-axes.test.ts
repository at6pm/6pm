import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../../../modules/font-instance', () => ({
  fontInstance: {
    register: jest.fn((_name: string, family: string) => family !== 'Missing-Variable'),
  },
}));

import { fontInstance } from '../../../modules/font-instance';
import { axesOf, familyOf, withAxes } from './font-axes';

// eslint-disable-next-line @typescript-eslint/unbound-method -- a jest.fn, read for its calls
const mockRegister = jest.mocked(fontInstance!.register);

describe('withAxes on Android', () => {
  it('draws the family set at the axes by its own name, registered once', () => {
    const style = withAxes('Literata-Variable', "'opsz' 18, 'wght' 600");
    expect(style).toEqual({ fontFamily: 'Literata-Variable#opsz 18,wght 600' });
    withAxes('Literata-Variable', "'opsz' 18, 'wght' 600");
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith(
      style.fontFamily,
      'Literata-Variable',
      "'opsz' 18, 'wght' 600",
    );
  });

  it('keeps the axes on the text when the file cannot be set', () => {
    expect(withAxes('Missing-Variable', "'wght' 500")).toEqual({
      fontFamily: 'Missing-Variable',
      fontVariationSettings: "'wght' 500",
    });
  });

  it('reads the family and axes back from an instance', () => {
    const style = withAxes('MaterialSymbolsRounded-Variable', "'FILL' 1, 'opsz' 24, 'wght' 400");
    expect(familyOf(style)).toBe('MaterialSymbolsRounded-Variable');
    expect(axesOf(style)).toBe("'FILL' 1, 'opsz' 24, 'wght' 400");
  });

  it('reads plain styles as they are', () => {
    expect(familyOf({ fontFamily: 'BeVietnamPro-Medium' })).toBe('BeVietnamPro-Medium');
    expect(axesOf({ fontFamily: 'X', fontVariationSettings: "'wght' 650" })).toBe("'wght' 650");
    expect(axesOf({ fontFamily: 'X' })).toBeUndefined();
  });
});
