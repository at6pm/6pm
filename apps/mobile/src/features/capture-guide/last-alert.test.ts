import { describe, expect, it, jest } from '@jest/globals';

import { translate } from '../../i18n/translate';
import { lastAlertLine, readLastAlert } from './last-alert';

jest.mock('../../../modules/surfaces', () => ({ surfaces: null }));

const t: Parameters<typeof lastAlertLine>[1] = (key, ...params) => translate('en', key, ...params);
const time = () => '12:30';

const file = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    v: 1,
    at: '2026-10-27T05:30:41.000Z',
    bank: 'MB Bank',
    amountText: '50.000₫',
    direction: 'out',
    ...over,
  });

describe('readLastAlert', () => {
  it('reads what the shortcut left', () => {
    expect(readLastAlert(file())).toMatchObject({ bank: 'MB Bank', amountText: '50.000₫' });
  });

  it('is null before any alert, and for anything that is not one', () => {
    expect(readLastAlert(null)).toBeNull();
    expect(readLastAlert('')).toBeNull();
    expect(readLastAlert('not json')).toBeNull();
    expect(readLastAlert(file({ v: 2 }))).toBeNull();
  });
});

describe('lastAlertLine', () => {
  const line = (over: Record<string, unknown> = {}) => {
    const last = readLastAlert(file(over));
    if (last === null) throw new Error('not a last alert');
    return lastAlertLine(last, t, time);
  };

  it('names the bank, the amount and the time of money out', () => {
    expect(line()).toBe('Last: MB Bank · 50.000₫ · 12:30');
  });

  it('says money came in', () => {
    expect(line({ direction: 'in', amountText: '2.000.000₫' })).toBe(
      'Last: MB Bank · 2.000.000₫ in · 12:30',
    );
  });

  it('says why an alert was skipped', () => {
    expect(line({ amountText: '', skipped: 'code', direction: undefined })).toBe(
      'Last: MB Bank · a code, skipped · 12:30',
    );
  });

  it('leaves out a bank the alert did not name', () => {
    expect(line({ bank: null })).toBe('Last: 50.000₫ · 12:30');
  });
});
