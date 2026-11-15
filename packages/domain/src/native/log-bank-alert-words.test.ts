import { describe, expect, it } from 'vitest';

import { bankAlertResultSchema, type SurfaceContext } from '../contracts/surfaces';
import { logBankAlert } from './entry';

// Every account, code and name here is made up.

const context: SurfaceContext = {
  v: 1,
  language: 'en',
  host: '6pm.ai',
  categories: [
    {
      id: 'food',
      name: 'Food',
      icon: 'restaurant',
      tile: '#f4e3c8',
      glyph: '#6b4a1f',
      countsDaily: true,
    },
  ],
  rules: [],
  safeToday: 245_000,
  strings: {},
};
const now = new Date(2026, 9, 27, 12, 31).toISOString();

const caught = (body: string, keepWords: boolean, { app = 'MB Bank', date = '' } = {}) =>
  bankAlertResultSchema.parse(
    JSON.parse(
      logBankAlert(
        app,
        'Biến động số dư',
        '',
        body,
        date,
        JSON.stringify({ ...context, keepWords }),
        now,
      ),
    ),
  );

const PAID =
  'TK 0123xxx456|GD: -92,000VND 27/10/26 12:20|SD: 1,234,567VND|ND: MBVCB.FT26300AB12 an trua';

describe('logBankAlert, the words and keys of an alert', () => {
  it('drops the words while the capture log is off', () => {
    const { item, heard } = caught(PAID, false);
    expect(item?.words).toBeUndefined();
    expect(heard).toBeUndefined();
    expect(caught('Mã OTP của bạn là 123456', false).heard).toBeUndefined();
  });

  it('keeps them on the item while it is on', () => {
    expect(caught(PAID, true).item?.words).toEqual({
      app: 'MB Bank',
      title: 'Biến động số dư',
      subtitle: '',
      body: PAID,
    });
  });

  it('leaves a skipped alert’s words for the log while it is on, and nothing to import', () => {
    const { item, heard } = caught('Mã OTP của bạn là 123456', true);
    expect(item).toBeNull();
    expect(heard).toMatchObject({
      kind: 'heard',
      skipped: 'code',
      bank: 'MB Bank',
      words: { body: 'Mã OTP của bạn là 123456' },
    });
  });

  it('carries the account, the bank’s code and what its time is', () => {
    expect(caught(PAID, false).item).toMatchObject({
      atKind: 'printed',
      reference: 'FT26300AB12',
      accountTail: '456',
    });
    const delivered = new Date(2026, 9, 27, 12, 30, 41).toISOString();
    expect(caught(PAID, false, { date: delivered }).item?.atKind).toBe('delivered');
    // A printed time past the clock is a misreading: the alert is from now.
    expect(caught(PAID.replace('12:20', '13:20'), false).item?.atKind).toBe('now');
  });

  it('leaves a failed payment as an item that only voids, with no notice to give', () => {
    const { item, last } = caught(
      'Giao dịch thanh toán 250.000đ tại Cửa Hàng Mẫu không thành công',
      false,
    );
    expect(item).toMatchObject({ what: 'failed', amount: 250_000, direction: 'out' });
    expect(last.skipped).toBe('failed');
    expect(caught('Giao dịch không thành công', false).item).toBeNull();
  });

  it('says money in is a refund or a reversal when its words do', () => {
    expect(caught('TK 0123xxx456|GD: +92,000VND|ND: Hoan tien don 55102', false).item?.what).toBe(
      'refund',
    );
    expect(
      caught('TK 0123xxx456|GD: +92,000VND|ND: Hoan tra giao dich FT26300AB12', false).item?.what,
    ).toBe('reversal');
    expect(caught(PAID, false).item?.what).toBeUndefined();
  });
});
