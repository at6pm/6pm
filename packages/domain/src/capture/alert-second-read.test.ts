import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { HeardWords, InboxSpend, InboxUnread } from '../contracts/surfaces';
import { currencyOf, VND } from '../money/currency';
import {
  ALERT_READ_AMOUNTS_MAX,
  alertReadAsk,
  holdsLongNumber,
  maskLongNumbers,
  spendOfUnreadAlert,
  withAlertReading,
  type AlertReading,
} from './alert-second-read';
import { printedAmounts } from './bank-alert';

// Every name, account and amount here is made up.

const words = (body: string, title = 'Thông báo biến động số dư', app = 'MB Bank'): HeardWords => ({
  app,
  title,
  subtitle: '',
  body,
});

const MB =
  'TK 0123456789012|GD: -50,000VND 18/11/26 09:41|SD: 1,250,000VND|ND: NGUYEN VAN AN chuyen tien';

const caught = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d',
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: '2026-11-18T02:41:00.000Z',
  amount: 50_000,
  merchant: '',
  categoryId: 'food',
  receipt: { bank: 'MB Bank', namingLines: [] },
  direction: 'out',
  atKind: 'delivered',
  ...over,
});

const reading = (over: Partial<AlertReading> = {}): AlertReading => ({
  moved: 'out',
  amount: 1,
  merchant: '',
  ...over,
});

describe('printedAmounts', () => {
  it('finds what moved and the balance, and no date, time or account', () => {
    const found = printedAmounts(MB);
    expect(found.map((f) => MB.slice(f.start, f.end))).toEqual(['-50,000VND', '1,250,000VND']);
    expect(found.map((f) => [f.amount, f.currency])).toEqual([
      [50_000, 'VND'],
      [1_250_000, 'VND'],
    ]);
  });

  it('takes a number written as money with no mark, and leaves a year alone', () => {
    const text = 'Ban da chi 119.000 tai HIGHLANDS ngay 18-11-2026, ma 4410';
    expect(printedAmounts(text).map((f) => text.slice(f.start, f.end))).toEqual(['119.000']);
  });

  it('never offers a bare run of digits: an account, a reference, a code', () => {
    const text = 'ND: 12345678 ck FT26316 ma 559201 -45,000VND';
    expect(printedAmounts(text).map((f) => text.slice(f.start, f.end))).toEqual(['-45,000VND']);
  });

  it('reads the mark printed with an amount in another currency', () => {
    const text = 'Card ending 4410: USD 12.50 at AMAZON. Balance 1,204.10 USD';
    expect(printedAmounts(text).map((f) => [f.amount, f.currency])).toEqual([
      [1250, 'USD'],
      [120_410, 'USD'],
    ]);
  });
});

describe('maskLongNumbers', () => {
  it('dots out an account, a card and a phone number, digit for digit', () => {
    expect(maskLongNumbers('TK 0123456789012 nhan tu 0901234567')).toBe(
      'TK ••••••••••••• nhan tu ••••••••••',
    );
    expect(maskLongNumbers('The 4111 1111 1111 1111 vua chi')).toBe(
      'The •••• •••• •••• •••• vua chi',
    );
    expect(maskLongNumbers('STK: 12345678 da nhan')).toBe('STK: •••••••• da nhan');
  });

  it('dots out a number written in groups, whatever separates them', () => {
    expect(maskLongNumbers('Goi 0912 345 678 hoac 0912.345.678')).toBe(
      'Goi •••• ••• ••• hoac ••••.•••.•••',
    );
    expect(maskLongNumbers('Lien he +84 912 345 678')).toBe('Lien he +•• ••• ••• •••');
    expect(maskLongNumbers('TK 1903 6789 0123 456 -50,000VND')).toBe(
      'TK •••• •••• •••• ••• -50,000VND',
    );
    expect(maskLongNumbers('So the 1903-6789-0123')).toBe('So the ••••-••••-••••');
  });

  it('never takes a grouped amount, a date or a time for a long number', () => {
    for (const text of [
      'SD: 1.250.000.000 VND',
      'GD: -50.000 18.11.2026 09:41',
      'GD: -1,250,000,000VND luc 2026-11-18 09:41:07',
      'So du 12.345.678 d, GD 1.234.567 d',
    ]) {
      expect(maskLongNumbers(text)).toBe(text);
      expect(holdsLongNumber(text)).toBe(false);
    }
  });

  it('leaves nothing the server would turn away', () => {
    for (const text of [
      'TK 0123456789012 nhan tu 0901234567',
      'Goi 0912 345 678 hoac STK 1903 6789 0123 so tien 50,000d',
      'Hotline 1900.5555.88 hoac +84 912 345 678',
    ]) {
      expect(holdsLongNumber(text)).toBe(true);
      expect(holdsLongNumber(maskLongNumbers(text))).toBe(false);
    }
  });

  it('leaves amounts, dates and short codes as printed', () => {
    const text = 'GD: -1,500,000VND luc 18/11/2026 09:41. Ma GD FT26316XQ7';
    expect(maskLongNumbers(text)).toBe(text);
  });

  it('never changes the length, and leaves no run of nine digits', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (text) => {
        const masked = maskLongNumbers(text);
        expect(masked.length).toBe(text.length);
        expect(holdsLongNumber(masked)).toBe(false);
      }),
    );
  });
});

describe('alertReadAsk', () => {
  it('marks every printed amount in order and dots out the account', () => {
    const ask = alertReadAsk(words(MB), VND);
    expect(ask?.app).toBe('MB Bank');
    expect(ask?.text).toBe(
      'Thông báo biến động số dư\nTK •••••••••••••|GD: «1: -50,000VND» 18/11/26 09:41|SD: «2: 1,250,000VND»|ND: NGUYEN VAN AN chuyen tien',
    );
    expect(ask?.amounts.map((a) => a.amount)).toEqual([50_000, 1_250_000]);
  });

  it('asks nothing of an alert that prints no amount', () => {
    expect(alertReadAsk(words('Chúc mừng sinh nhật bạn ngày 18/11'), VND)).toBeNull();
  });

  it('offers no more amounts than the server takes', () => {
    const body = Array.from({ length: 12 }, (_, i) => `GD: -${i + 1}0,000VND`).join(' | ');
    expect(alertReadAsk(words(body), VND)?.amounts).toHaveLength(ALERT_READ_AMOUNTS_MAX);
  });

  it('marks money an alert from abroad prints in its own way', () => {
    const ask = alertReadAsk(
      words('ご利用金額：1,234円 ご利用先：コンビニ', 'ご利用のお知らせ', 'Vpass'),
      currencyOf('JPY'),
    );
    expect(ask?.amounts.map((a) => [a.amount, a.currency])).toEqual([[1234, 'JPY']]);
    expect(ask?.text).toContain('«1: 1,234 JPY»');
  });
});

describe('withAlertReading', () => {
  const ask = alertReadAsk(words(MB), VND);
  if (ask === null) throw new Error('the alert prints amounts');

  it('takes the name the server read, and keeps the phone’s when it read none', () => {
    const named = withAlertReading(
      caught(),
      reading({ merchant: 'Nguyễn Văn An' }),
      ask,
      words(MB),
      VND,
    );
    expect(named).toMatchObject({ merchant: 'Nguyễn Văn An', amount: 50_000, direction: 'out' });
    const kept = withAlertReading(caught({ merchant: 'CIRCLE K' }), reading(), ask, words(MB), VND);
    expect(kept.merchant).toBe('CIRCLE K');
  });

  it('takes the amount the server marked over the one the phone read', () => {
    const fixed = withAlertReading(caught({ amount: 1_250_000 }), reading(), ask, words(MB), VND);
    expect(fixed.amount).toBe(50_000);
  });

  it('keeps the phone’s amount when it is not among the marked ones', () => {
    const kept = withAlertReading(
      caught({ amount: 75_000 }),
      reading({ amount: 2 }),
      ask,
      words(MB),
      VND,
    );
    expect(kept.amount).toBe(75_000);
  });

  it('keeps the phone’s amount when the server marked none, or a mark that is not there', () => {
    for (const amount of [0, 7]) {
      expect(withAlertReading(caught(), reading({ amount }), ask, words(MB), VND).amount).toBe(
        50_000,
      );
    }
  });

  it('turns money out into money in, filed nowhere', () => {
    const turned = withAlertReading(caught(), reading({ moved: 'in' }), ask, words(MB), VND);
    expect(turned).toMatchObject({ direction: 'in', categoryId: null, amount: 50_000 });
  });

  it('says a refund is one when the words do', () => {
    const text = words('Hoan tien +50,000VND tu SHOPEE');
    const refund = alertReadAsk(text, VND);
    if (refund === null) throw new Error('the alert prints an amount');
    expect(withAlertReading(caught(), reading({ moved: 'in' }), refund, text, VND).what).toBe(
      'refund',
    );
  });

  it('never drops a row the phone caught, whatever the server says', () => {
    const item = caught();
    expect(withAlertReading(item, reading({ moved: 'none', amount: 0 }), ask, words(MB), VND)).toBe(
      item,
    );
  });

  it('leaves a failed payment’s item alone', () => {
    const failed = caught({ what: 'failed' });
    expect(withAlertReading(failed, reading({ merchant: 'X' }), ask, words(MB), VND)).toBe(failed);
  });

  it('keeps an amount abroad waiting for its rate when the server marks another', () => {
    const text = words('Card 4410: USD 12.50 at AMAZON (fee USD 0.40)', 'Purchase', 'Timo');
    const abroad = alertReadAsk(text, VND);
    if (abroad === null) throw new Error('the alert prints amounts');
    const item = caught({
      amount: 10_000,
      foreign: { currency: 'USD', amount: '0.40', rate: '25000' },
    });
    const fixed = withAlertReading(item, reading({ merchant: 'Amazon' }), abroad, text, VND);
    expect(fixed).toMatchObject({
      amount: null,
      foreign: { currency: 'USD', amount: '12.50' },
      merchant: 'Amazon',
    });
    expect(fixed.foreign).not.toHaveProperty('rate');
  });
});

describe('spendOfUnreadAlert', () => {
  const body = 'Quý khách vừa quẹt 85.000đ ở The Coffee House, cảm ơn quý khách';
  const unread: InboxUnread = {
    v: 1,
    id: '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d',
    kind: 'unread',
    at: '2026-11-18T02:41:05.000Z',
    date: '2026-11-18T02:41:00.000Z',
    bank: 'MB Bank',
    alertWords: words(body, 'Giao dịch mới'),
  };
  const ask = alertReadAsk(unread.alertWords, VND);
  if (ask === null) throw new Error('the alert prints an amount');

  it('is a caught payment once the server finds one', () => {
    expect(spendOfUnreadAlert(unread, reading({ merchant: 'The Coffee House' }), ask, VND)).toEqual(
      {
        v: 1,
        id: unread.id,
        kind: 'spend',
        source: 'alert',
        status: 'caught',
        at: '2026-11-18T02:41:00.000Z',
        amount: 85_000,
        merchant: 'The Coffee House',
        categoryId: null,
        receipt: { bank: 'MB Bank', namingLines: [] },
        direction: 'out',
        atKind: 'delivered',
      },
    );
  });

  it('is nothing when no money moved or no amount was marked', () => {
    expect(spendOfUnreadAlert(unread, reading({ moved: 'none', amount: 0 }), ask, VND)).toBeNull();
    expect(spendOfUnreadAlert(unread, reading({ amount: 0 }), ask, VND)).toBeNull();
  });

  it('is from when the phone read it, with no delivery time', () => {
    const item = spendOfUnreadAlert({ ...unread, date: null }, reading(), ask, VND);
    expect(item).toMatchObject({ at: unread.at, atKind: 'now' });
  });

  it('counts in a home currency that is not đồng', () => {
    const usd = currencyOf('USD');
    const text = words('You tapped $4.50 at Blue Bottle', 'Card', 'Chase');
    const asked = alertReadAsk(text, usd);
    if (asked === null) throw new Error('the alert prints an amount');
    const item = spendOfUnreadAlert({ ...unread, alertWords: text }, reading(), asked, usd);
    expect(item).toMatchObject({ amount: 450, currency: 'USD' });
  });
});
