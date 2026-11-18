import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { BankAlert, BankAlertInput } from './bank-alert';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';
import { local, moved, read } from './fixtures/bank-alerts';

/**
 * Alerts from Vietnam's wallets and from banks that write in English, what is skipped, and the
 * bank behind an alert. Vietnam's banks are in `bank-alert-banks.test.ts`.
 */
const wallets: [string, BankAlertInput, BankAlert][] = [
  [
    'MoMo: money in, with a message',
    {
      app: 'MoMo',
      title: 'Nhận tiền thành công',
      body: 'Bạn đã nhận được 100.000đ từ NGUYEN VAN A. Lời nhắn: tra tien cafe',
    },
    moved('in', 100_000, { counterparty: 'NGUYEN VAN A', memo: 'tra tien cafe', bank: 'MoMo' }),
  ],
  [
    'MoMo: paid a shop, the wallet balance after',
    {
      app: 'MoMo',
      title: 'Thanh toán thành công',
      body: 'Bạn đã thanh toán 45.000đ cho Phúc Long. Số dư ví: 155.000đ',
    },
    moved('out', 45_000, { counterparty: 'Phúc Long', bank: 'MoMo' }),
  ],
  [
    'MoMo: the shop named before the amount',
    {
      app: 'MoMo',
      title: 'Thanh toán HIGHLANDS COFFEE thành công',
      body: 'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền 119.000đ. Nhấn để kiểm tra giao dịch ngay bạn nhé.',
    },
    moved('out', 119_000, { counterparty: 'HIGHLANDS COFFEE', bank: 'MoMo' }),
  ],
  [
    'MoMo: a shop with one letter for a word, named before the amount',
    {
      app: 'MoMo',
      title: 'Thanh toán CIRCLE K thành công',
      body: 'Bạn đã thực hiện thanh toán thành công cho CIRCLE K với số tiền 42.000đ. Nhấn để kiểm tra giao dịch ngay bạn nhé.',
    },
    moved('out', 42_000, { counterparty: 'CIRCLE K', bank: 'MoMo' }),
  ],
  [
    'a sender named before the amount',
    {
      app: 'MoMo',
      body: 'Bạn đã nhận tiền từ NGUYEN VAN A với số tiền 100.000đ.',
    },
    moved('in', 100_000, { counterparty: 'NGUYEN VAN A', bank: 'MoMo' }),
  ],
  [
    'an account at its own bank before the amount names nobody',
    {
      body: 'TK 1234 tại BIDV số tiền: -120,000 VND lúc 10:02. SD: 880,000 VND',
    },
    moved('out', 120_000, { bank: 'BIDV' }),
  ],
  [
    'ZaloPay: money in',
    {
      app: 'ZaloPay',
      body: 'Bạn đã nhận 50.000 VND từ Trần Thị B qua ZaloPay',
    },
    moved('in', 50_000, { counterparty: 'Trần Thị B', bank: 'ZaloPay' }),
  ],
  [
    'ZaloPay: an order at a shop',
    {
      app: 'ZaloPay',
      body: 'Thanh toán thành công 35.000đ cho đơn hàng tại Circle K',
    },
    moved('out', 35_000, { counterparty: 'Circle K', bank: 'ZaloPay' }),
  ],
  [
    'Viettel Money: to a phone number, never a name',
    {
      app: 'Viettel Money',
      body: 'Quý khách đã chuyển thành công 200.000đ đến số điện thoại 098xxxx123. Số dư: 500.000đ',
    },
    moved('out', 200_000, { bank: 'ViettelMoney' }),
  ],
];

const english: [string, BankAlertInput, BankAlert][] = [
  [
    'a Malaysian transfer, in ringgit',
    { body: "You've transferred RM 5.00 to ALI BIN ABU" },
    moved('out', 500, { currency: 'MYR', counterparty: 'ALI BIN ABU' }),
  ],
  [
    'money received, in dollars',
    { body: 'You received $25.00 from JOHN DOE' },
    moved('in', 2500, { currency: 'USD', counterparty: 'JOHN DOE' }),
  ],
  [
    'a card charge',
    { body: 'A charge of $12.50 at STARBUCKS was made on your credit card ending 1234' },
    moved('out', 1250, { currency: 'USD', counterparty: 'STARBUCKS' }),
  ],
  [
    'a card charged in the currency code',
    { body: 'Your card ending 1234 was charged USD 12.50 at AMAZON on 27 Oct 2026' },
    moved('out', 1250, { currency: 'USD', counterparty: 'AMAZON', at: local(27, 12, 0) }),
  ],
  [
    'pounds spent',
    { body: 'You spent £4.20 at Pret A Manger' },
    moved('out', 420, { currency: 'GBP', counterparty: 'Pret A Manger' }),
  ],
  [
    'a payment in Singapore dollars',
    { body: 'Payment of SGD 15.00 to GRAB on 27 Oct 2026 was successful' },
    moved('out', 1500, { currency: 'SGD', counterparty: 'GRAB', at: local(27, 12, 0) }),
  ],
];

describe('readBankAlert: money that moved', () => {
  it.each(wallets)('%s', (_, input, expected) => {
    expect(read(input)).toEqual(expected);
  });

  it.each(english)('%s', (_, input, expected) => {
    expect(read(input)).toEqual(expected);
  });

  it('takes the delivery time over the printed one', () => {
    const at = new Date(2026, 9, 27, 12, 30, 41).toISOString();
    const alert = read({
      app: 'MB Bank',
      body: 'TK 0123xxx456|GD: -50,000VND 27/10/26 12:30|SD: 1,234,567VND',
      date: at,
    });
    expect(alert).toMatchObject({ kind: 'moved', at });
  });

  it('reads the printed time when the delivery time is not a date', () => {
    const alert = read({ body: 'GD: -50,000VND 27/10/26 12:30', date: 'yesterday' });
    expect(alert).toMatchObject({ at: local(27, 12, 30) });
  });

  it('reads a home currency other than đồng from a bare amount', () => {
    expect(read({ body: 'Card payment -12.50 at TESCO' }, 'GBP')).toMatchObject({
      kind: 'moved',
      direction: 'out',
      amount: 1250,
      currency: 'GBP',
    });
  });

  it('keeps đồng from a Vietnamese bank on a phone counting in euros', () => {
    expect(read({ body: 'TK 0123xxx456|GD: -50,000VND|SD: 1,234,567VND' }, 'EUR')).toMatchObject({
      amount: 50_000,
      currency: 'VND',
    });
  });

  it('names the shop a payment memo names, and only for money out', () => {
    expect(read({ body: 'GD: -50,000VND|ND: Thanh toan QR-PHO HOA' })).toMatchObject({
      counterparty: 'PHO HOA',
    });
    expect(read({ body: 'GD: -50,000VND|ND: thanh toan Grab' })).toMatchObject({
      counterparty: null,
    });
    expect(read({ body: 'GD: +50,000VND|ND: Thanh toan QR-PHO HOA' })).toMatchObject({
      counterparty: null,
    });
  });

  it('names the company a wallet paid a bill to, without the bill’s lead words', () => {
    const alert = read({
      app: 'MoMo',
      title: 'Thanh toán thành công',
      body: 'Bạn đã thanh toán thành công 727.428đ cho hóa đơn của dịch vụ Điện lực Hồ Chí Minh.',
    });
    expect(alert).toMatchObject({
      kind: 'moved',
      direction: 'out',
      amount: 727_428,
      counterparty: 'Điện lực Hồ Chí Minh',
      bank: 'MoMo',
    });
  });

  it('cuts a long memo to the length kept on a spend', () => {
    const long = 'A'.repeat(300);
    const alert = read({ body: `GD: -50,000VND|ND: ${long}` });
    expect(alert.kind === 'moved' && alert.memo?.length).toBe(140);
  });
});

describe('readBankAlert: what is skipped', () => {
  const skipped: [string, BankAlertInput, BankAlert['kind'], string][] = [
    [
      'an OTP',
      { body: 'Mã OTP của bạn là 123456. Không chia sẻ mã này với bất kỳ ai.' },
      'skipped',
      'code',
    ],
    [
      'an OTP for a payment, amount and all',
      {
        app: 'VCB Digibank',
        body: 'Ma xac thuc giao dich 500,000VND tai SHOPEE la 123456. KHONG cung cap OTP cho bat ky ai',
      },
      'skipped',
      'code',
    ],
    ['a verification code', { body: 'Your verification code is 482913' }, 'skipped', 'code'],
    [
      'a payment that failed',
      { body: 'Giao dịch thanh toán 45.000đ tại Highlands không thành công' },
      'skipped',
      'failed',
    ],
    [
      'a declined card',
      { body: 'Your payment of $12.50 at STARBUCKS was declined' },
      'skipped',
      'failed',
    ],
    ['a transfer that failed', { body: 'Chuyển tiền 200.000đ thất bại' }, 'skipped', 'failed'],
    [
      'a cashback promotion',
      { app: 'MoMo', body: 'Ưu đãi tháng 10: Hoàn tiền 50.000đ khi thanh toán QR' },
      'skipped',
      'promo',
    ],
    ['a voucher', { app: 'ZaloPay', body: 'Nhận ngay voucher 100.000đ' }, 'skipped', 'promo'],
    ['a sale', { body: 'Flash sale: giảm 50% cho đơn từ 200.000đ' }, 'skipped', 'promo'],
    ['a gift', { body: 'Quà tặng 100.000đ đang chờ bạn' }, 'skipped', 'promo'],
    [
      'an English offer',
      { body: 'Get $10 cashback when you pay with your card' },
      'skipped',
      'promo',
    ],
    [
      'a balance notice',
      { body: 'Số dư tài khoản 0123xxx456 của Quý khách là 1,234,567 VND' },
      'skipped',
      'balance',
    ],
    ['an English balance', { body: 'Your balance is $1,234.56' }, 'skipped', 'balance'],
    ['a statement', { body: 'Sao kê tháng 10 của bạn đã sẵn sàng' }, 'skipped', 'balance'],
    [
      'a card bill that is due',
      {
        body: 'Sao kê thẻ tín dụng kỳ 10/2026: Tổng dư nợ 2,345,000 VND, hạn thanh toán 05/11/2026',
      },
      'skipped',
      'balance',
    ],
    [
      'a month’s spending in one category',
      {
        app: 'Techcombank',
        body: 'Bạn đã chi tiêu 5.142.790 VND cho danh mục Ăn uống trong tháng 10',
      },
      'skipped',
      'balance',
    ],
    [
      'a month’s total spending',
      { body: 'Tổng chi tiêu tháng 10 của bạn là 12.345.000đ, tăng 8% so với tháng trước' },
      'skipped',
      'balance',
    ],
    [
      'a week’s statistics',
      { app: 'MoMo', body: 'Thống kê chi tiêu tuần qua: 1.200.000đ cho 14 giao dịch' },
      'skipped',
      'balance',
    ],
    [
      'spending this month, in English',
      { body: 'You spent $1,250.40 on Dining this month' },
      'skipped',
      'balance',
    ],
    [
      'a weekly recap',
      { title: 'Your weekly recap', body: 'You spent RM 420.00 across 12 purchases' },
      'skipped',
      'balance',
    ],
    [
      'a sign-in on a new device',
      { body: 'Tài khoản của bạn vừa đăng nhập trên thiết bị mới iPhone 18' },
      'skipped',
      'security',
    ],
    [
      'an English sign-in',
      { body: 'New sign-in to your account from Safari' },
      'skipped',
      'security',
    ],
    ['a password change', { body: 'Mật khẩu của bạn đã được thay đổi' }, 'skipped', 'security'],
    ['nothing about money', { body: 'Cảm ơn bạn đã sử dụng dịch vụ' }, 'skipped', 'unread'],
    ['an amount with no way', { body: 'TK 0123xxx456: 50,000 VND' }, 'skipped', 'unread'],
    ['an empty alert', { body: '' }, 'skipped', 'unread'],
  ];

  it.each(skipped)('%s', (_, input, kind, reason) => {
    expect(read(input)).toMatchObject({ kind, reason });
  });

  it('names the bank of what it skipped', () => {
    expect(read({ app: 'MB Bank', body: 'Mã OTP của bạn là 123456' })).toEqual({
      kind: 'skipped',
      reason: 'code',
      bank: 'MB Bank',
    });
  });

  it('still reads an alert that warns, after the movement, never to share a code', () => {
    expect(
      read({
        app: 'VCB Digibank',
        body: 'Số dư TK VCB 0011000123456 -150,000 VND lúc 27-10-2026 12:30:05. Số dư 1,200,000 VND. Quý khách không cung cấp OTP cho bất kỳ ai.',
      }),
    ).toMatchObject({ kind: 'moved', direction: 'out', amount: 150_000 });
  });

  it('still reads a payment that names the category it was filed in', () => {
    expect(
      read({
        app: 'MoMo',
        body: 'Bạn đã thanh toán 45.000đ cho Phúc Long. Giao dịch đã được xếp vào danh mục Ăn uống.',
      }),
    ).toMatchObject({ kind: 'moved', direction: 'out', amount: 45_000, counterparty: 'Phúc Long' });
    expect(
      read({
        app: 'MB Bank',
        body: 'TK 0123xxx456|GD: -1,850,000VND 28/10/26 09:15|SD: 3,234,567VND|ND: HOC PHI TRONG THANG 10',
      }),
    ).toMatchObject({ kind: 'moved', direction: 'out', amount: 1_850_000 });
  });

  it('reads a cashback that was credited, which no promotion words', () => {
    expect(
      read({ app: 'MoMo', body: 'Bạn được hoàn tiền 5.000đ cho giao dịch tại Circle K' }),
    ).toMatchObject({ kind: 'moved', direction: 'in', amount: 5_000 });
  });
});

describe('readBankAlert: never the balance', () => {
  it('never takes the balance as the amount, whatever the two amounts are', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99_999 }),
        fc.integer({ min: 1, max: 99_999 }),
        fc.boolean(),
        (moving, balance, spent) => {
          const a = moving * 1000;
          const b = balance * 1000;
          const sign = spent ? '-' : '+';
          const body = `TK 0123xxx456|GD: ${sign}${a.toLocaleString('en-US')}VND 27/10/26 12:30|SD: ${b.toLocaleString('en-US')}VND`;
          expect(read({ body })).toMatchObject({
            kind: 'moved',
            amount: a,
            direction: spent ? 'out' : 'in',
          });
        },
      ),
    );
  });

  it('never throws, whatever the text', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (title, subtitle, body) => {
        const alert = read({ title, subtitle, body });
        expect(['moved', 'skipped']).toContain(alert.kind);
        if (alert.kind === 'moved') expect(alert.amount).toBeGreaterThan(0);
      }),
    );
  });
});

describe('the bank behind an alert', () => {
  it.each([
    ['MB Bank', 'MB Bank'],
    ['VCB Digibank', 'Vietcombank'],
    ['Techcombank Mobile', 'Techcombank'],
    ['ACB ONE', 'ACB'],
    ['BIDV SmartBanking', 'BIDV'],
    ['VietinBank iPay', 'VietinBank'],
    ['VPBank NEO', 'VPBank'],
    ['TPBank Mobile', 'TPBank'],
    ['Agribank Plus', 'Agribank'],
    ['Sacombank Pay', 'Sacombank'],
    ['HDBank', 'HDBank'],
    ['MyVIB', 'VIB'],
    ['OCB OMNI', 'OCB'],
    ['SHB SAHA', 'SHB'],
    ['MSB mBank', 'MSB'],
    ['Cake', 'Cake'],
    ['Timo', 'Timo'],
    ['MoMo', 'MoMo'],
    ['Ví MoMo', 'MoMo'],
    ['ZaloPay', 'ZaloPay'],
    ['Viettel Money', 'ViettelMoney'],
    ['com.mbmobile', 'MB Bank'],
  ])('%s is %s', (app, bank) => {
    expect(bankOfApp(app)?.shortName).toBe(bank);
  });

  it('knows no bank in an app it has never heard of', () => {
    expect(bankOfApp('Messages')).toBeNull();
    expect(bankOfApp('')).toBeNull();
    expect(bankOfApp(null)).toBeNull();
  });

  it('finds the first bank a text names, word for word', () => {
    expect(bankNamedIn('Số dư TK VCB 0011000123456')?.shortName).toBe('Vietcombank');
    expect(bankNamedIn('Ref MBVCB.123')).toBeNull();
  });
});
