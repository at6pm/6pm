import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  ALERT_NAMING_LINE_MAX,
  ALERT_NAMING_LINES_MAX,
  alertNamingLines,
} from './alert-naming-lines';

describe('alertNamingLines', () => {
  it('keeps the words of a wallet alert and none of its numbers', () => {
    expect(
      alertNamingLines({
        app: 'MoMo',
        title: 'Thanh toán HIGHLANDS COFFEE thành công',
        body: 'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền 119.000đ. Nhấn để kiểm tra giao dịch ngay bạn nhé.',
      }),
    ).toEqual([
      'Thanh toán HIGHLANDS COFFEE thành công',
      'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền',
      'Nhấn để kiểm tra giao dịch ngay bạn nhé',
    ]);
  });

  it('drops the account, the amount, the time and the balance of a bank alert', () => {
    expect(
      alertNamingLines({
        app: 'MB Bank',
        title: 'Thông báo biến động số dư',
        body: 'TK 0123xxx456|GD: -45,000VND 27/10/26 12:30|SD: 1,234,567VND|ND: Thanh toan QR-PHO HOA',
      }),
    ).toEqual(['Thông báo biến động số dư', 'ND: Thanh toan QR-PHO HOA']);
  });

  it('says a line once when the title and the body repeat it', () => {
    expect(
      alertNamingLines({ title: 'Thanh toán thành công', body: 'Thanh toán thành công' }),
    ).toEqual(['Thanh toán thành công']);
  });

  it('gives nothing for an alert of numbers alone', () => {
    expect(alertNamingLines({ body: '-45,000 12:30 27/10' })).toEqual([]);
  });

  it('never returns a digit, a long line or too many lines', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (title, subtitle, body) => {
        const lines = alertNamingLines({ title, subtitle, body });
        expect(lines.length).toBeLessThanOrEqual(ALERT_NAMING_LINES_MAX);
        for (const line of lines) {
          expect(line).not.toMatch(/\p{Nd}/u);
          expect(line.length).toBeLessThanOrEqual(ALERT_NAMING_LINE_MAX);
        }
      }),
    );
  });
});
