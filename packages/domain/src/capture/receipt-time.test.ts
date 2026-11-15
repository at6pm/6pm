import { describe, expect, it } from 'vitest';

import { parseReceiptEmail, type ReceiptEmail } from './receipt-email';
import { printedUtcOffset, readReceiptTime, withFullYears } from './receipt-time';

// Synthetic emails in the shape each shop sends; every name, order and amount is made up.

const email = (over: Partial<ReceiptEmail>): ReceiptEmail => ({
  from: null,
  subject: '',
  date: null,
  text: null,
  html: null,
  ...over,
});

describe('withFullYears', () => {
  it('fills in a two-digit year after a named month, before a clock', () => {
    expect(withFullYears('14 Sep 26 08:21 +0700')).toBe('14 Sep 2026 08:21 +0700');
    expect(withFullYears('2 September 26, 18:05')).toBe('2 September 2026, 18:05');
    expect(readReceiptTime(withFullYears('14 Sep 26 08:21 +0700'))).toBe(
      new Date(2026, 8, 14, 8, 21).toISOString(),
    );
  });

  it('leaves a full year, a day with no clock and other words alone', () => {
    expect(withFullYears('14 Sep 2026 08:21')).toBe('14 Sep 2026 08:21');
    expect(withFullYears('14 Sep 26')).toBe('14 Sep 26');
    expect(withFullYears('2 thg 11 10:30')).toBe('2 thg 11 10:30');
    expect(withFullYears('27/10/26 12:30')).toBe('27/10/2026 12:30');
  });
});

describe('printedUtcOffset', () => {
  it('reads a zone named or numbered after the clock', () => {
    expect(printedUtcOffset('October 18, 2026 at 6:10:20 AM PDT')).toBe(-420);
    expect(printedUtcOffset('Jan 5, 2026 9:15 PM EST')).toBe(-300);
    expect(printedUtcOffset('14 Sep 2026 08:21 +0700')).toBe(420);
    expect(printedUtcOffset('2026-10-18 13:10:20 UTC')).toBe(0);
    expect(printedUtcOffset('21/10/2026 16:40 (GMT+7)')).toBe(420);
    expect(printedUtcOffset('21/10/2026 16:40 -03:30')).toBe(-210);
  });

  it('says nothing when no zone follows the clock', () => {
    expect(printedUtcOffset('16:40 Thứ Sáu 09/10/2026')).toBeNull();
    expect(printedUtcOffset('09/10/2026 16:40:12')).toBeNull();
    expect(printedUtcOffset('9 Oct 2026, 4:40 PM')).toBeNull();
    expect(printedUtcOffset('10/10/2026 12:30 -45,000VND')).toBeNull();
    expect(printedUtcOffset('10/10/2026 12:30 -5,000 VND')).toBeNull();
    expect(printedUtcOffset('10/10/2026 12:30 -1200 VND')).toBeNull();
    expect(printedUtcOffset('Picked up 12:30 the same day')).toBeNull();
    expect(printedUtcOffset('Delivered 12:30 Estimated 12:45')).toBeNull();
  });
});

describe('the time a receipt email was paid', () => {
  it('reads Grab’s two-digit year, not the later time the email was sent', () => {
    const grab = email({
      from: { name: 'Grab', address: 'no-reply@grab.com' },
      subject: 'Your Grab E-Receipt',
      date: '2026-09-14T01:40:12.000Z',
      text: [
        'Tổng cộng',
        '84000₫',
        'Ngày | Giờ',
        '14 Sep 26 08:21 +0700',
        'Mã đơn hàng',
        'A-0000TESTORDER',
        'BẠN TRẢ',
        '84000₫',
      ].join('\n'),
    });
    expect(parseReceiptEmail(grab, { receivedAt: '2026-09-14T01:40:20.000Z' })).toMatchObject({
      amount: 84_000,
      at: '2026-09-14T01:21:00.000Z',
    });
  });

  it('reads a time in the zone it names, not as Vietnam’s', () => {
    const stripe = email({
      from: { name: 'Sample AI', address: 'receipts+acct_0000@stripe.com' },
      subject: 'Your Sample AI receipt [#1000-2000]',
      date: '2026-10-18T13:11:40.000Z',
      text: [
        'Receipt from Sample AI',
        'Amount paid',
        '₫312,000',
        'Date paid',
        'October 18, 2026 at 6:10:20 AM PDT',
      ].join('\n'),
    });
    expect(parseReceiptEmail(stripe, { receivedAt: '2026-10-18T13:11:45.000Z' })).toMatchObject({
      amount: 312_000,
      at: '2026-10-18T13:10:20.000Z',
    });
  });

  it('dates a refund by its email, never by the day of the order it gives back', () => {
    const refund = email({
      from: { name: 'Sample Shop', address: 'info@sampleshop.example' },
      subject: 'Đơn #10203 đã được hoàn tiền',
      date: '2026-10-27T03:15:20.000Z',
      text: [
        'Shop đã hoàn tiền cho đơn #10203.',
        'Số tiền hoàn',
        '450.000₫',
        'ĐƠN HÀNG #10203 · 19/10/2026',
        'Tổng cộng: 450.000₫',
      ].join('\n'),
    });
    expect(parseReceiptEmail(refund, { receivedAt: '2026-10-27T03:15:25.000Z' })).toMatchObject({
      kind: 'refund',
      amount: 450_000,
      at: '2026-10-27T03:15:20.000Z',
    });
  });

  it('dates a refund by a time labelled as the transaction’s own', () => {
    const refund = email({
      from: { name: 'Techcombank', address: 'alert@techcombank.com.vn' },
      subject: 'Hoàn tiền giao dịch thẻ',
      date: '2026-10-27T03:15:20.000Z',
      text: 'Số tiền: 450,000 VND\nNgày giao dịch: 27/10/2026 10:11:05\nĐơn hàng ngày 19/10/2026',
    });
    expect(parseReceiptEmail(refund, { receivedAt: '2026-10-27T03:15:25.000Z' })?.at).toBe(
      '2026-10-27T03:11:05.000Z',
    );
  });
});
