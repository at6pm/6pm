import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import { readBankAlert, type BankAlert, type BankAlertInput } from './bank-alert';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';

/**
 * Alerts as each bank and wallet prints its balance changes, written for these tests: every
 * account number, name and code is made up.
 */

/** Alerts print the phone's local time; the expected instant is built the same way. */
const local = (d: number, h: number, m: number, s = 0) =>
  new Date(2026, 9, d, h, m, s).toISOString();

const moved = (
  direction: 'in' | 'out',
  amount: number,
  more: Partial<Extract<BankAlert, { kind: 'moved' }>> = {},
): BankAlert => ({
  kind: 'moved',
  direction,
  amount,
  currency: 'VND',
  counterparty: null,
  memo: null,
  at: null,
  bank: null,
  ...more,
});

const read = (input: BankAlertInput | string, home = 'VND') =>
  readBankAlert(typeof input === 'string' ? { body: input } : input, currencyOf(home));

const vietnamese: [string, BankAlertInput, BankAlert][] = [
  [
    'MB Bank: pipes, a two-digit year, money out',
    {
      app: 'MB Bank',
      body: 'TK 0123xxx456|GD: -50,000VND 27/10/26 12:30|SD: 1,234,567VND|ND: CHUYEN TIEN',
    },
    moved('out', 50_000, { memo: 'CHUYEN TIEN', at: local(27, 12, 30), bank: 'MB Bank' }),
  ],
  [
    'MB Bank: money in, named in the memo',
    {
      title: 'MB Bank',
      body: 'TK 0123xxx456|GD: +2,000,000VND 27/10/26 09:15|SD: 3,234,567VND|ND: NGUYEN VAN A chuyen tien',
    },
    moved('in', 2_000_000, {
      memo: 'NGUYEN VAN A chuyen tien',
      at: local(27, 9, 15),
      bank: 'MB Bank',
    }),
  ],
  [
    'Vietcombank: "Số dư TK" before the change, a reference, the salary memo',
    {
      app: 'VCB Digibank',
      body: 'Số dư TK VCB 0011000123456 +5,000,000 VND lúc 27-10-2026 09:02:11. Số dư 12,345,678 VND. Ref MBVCB.1234567890.LUONG T10. ND: LUONG T10',
    },
    moved('in', 5_000_000, { memo: 'LUONG T10', at: local(27, 9, 2, 11), bank: 'Vietcombank' }),
  ],
  [
    'Vietcombank: a QR payment out',
    {
      body: 'Số dư TK VCB 0011000123456 -150,000 VND lúc 27-10-2026 12:30:05. Số dư 1,200,000 VND. Ref 5123IBT1aW12345.Thanh toan QR. ND: Thanh toan QR-PHO HOA',
    },
    moved('out', 150_000, {
      counterparty: 'PHO HOA',
      memo: 'Thanh toan QR-PHO HOA',
      at: local(27, 12, 30, 5),
      bank: 'Vietcombank',
    }),
  ],
  [
    'Techcombank: lines, the sign apart from the mark',
    {
      app: 'Techcombank',
      title: 'Biến động số dư',
      body: 'Tài khoản 1903****7890\nSố tiền: - VND 45,000\nSố dư hiện tại: VND 2,345,000\nMô tả: Thanh toan QR HIGHLANDS COFFEE',
    },
    moved('out', 45_000, {
      counterparty: 'HIGHLANDS COFFEE',
      memo: 'Thanh toan QR HIGHLANDS COFFEE',
      bank: 'Techcombank',
    }),
  ],
  [
    'Techcombank: money in with the mark first',
    {
      app: 'Techcombank',
      body: 'Tài khoản 1903****7890\nSố tiền giao dịch: +VND 2,000,000\nSố dư hiện tại: VND 5,000,000\nMô tả: NGUYEN VAN A chuyen tien',
    },
    moved('in', 2_000_000, { memo: 'NGUYEN VAN A chuyen tien', bank: 'Techcombank' }),
  ],
  [
    'ACB: "(VND)" against the account, the memo after "GD:"',
    {
      body: 'ACB: TK 12345678(VND) + 1,500,000 luc 09:15 27/10/2026. So du 4,500,000. GD: NGUYEN VAN B CHUYEN KHOAN',
    },
    moved('in', 1_500_000, {
      memo: 'NGUYEN VAN B CHUYEN KHOAN',
      at: local(27, 9, 15),
      bank: 'ACB',
    }),
  ],
  [
    'BIDV: labelled lines, "Số dư cuối"',
    {
      app: 'BIDV SmartBanking',
      body: 'Thời gian: 27/10/2026 09:15\nTài khoản thanh toán: 1234567890\nSố tiền GD: -120,000 VND\nSố dư cuối: 1,880,000 VND\nNội dung giao dịch: Thanh toan hoa don dien',
    },
    moved('out', 120_000, {
      memo: 'Thanh toan hoa don dien',
      at: local(27, 9, 15),
      bank: 'BIDV',
    }),
  ],
  [
    'BIDV: one line, the bank named before the amount, never as who paid',
    {
      body: 'TK 1234567890 tai BIDV +500,000VND vao 09:15 27/10/2026. So du: 2,500,000VND. ND: TRAN THI C tra no',
    },
    moved('in', 500_000, { memo: 'TRAN THI C tra no', at: local(27, 9, 15), bank: 'BIDV' }),
  ],
  [
    'VietinBank: "Giao dịch" as the change',
    {
      app: 'VietinBank iPay',
      body: 'Thời gian: 27/10/2026 12:30\nTài khoản: 1088xxxx1234\nGiao dịch: -75,000VND\nSố dư hiện tại: 925,000VND\nNội dung: thanh toan Grab',
    },
    moved('out', 75_000, { memo: 'thanh toan Grab', at: local(27, 12, 30), bank: 'VietinBank' }),
  ],
  [
    'VPBank: "luc" and "SD" with no colon',
    {
      app: 'VPBank NEO',
      body: 'TK 1234xxxx789 -1,200,000VND luc 27/10/2026 18:45:10. SD 3,800,000VND. ND: thanh toan the tin dung',
    },
    moved('out', 1_200_000, {
      memo: 'thanh toan the tin dung',
      at: local(27, 18, 45, 10),
      bank: 'VPBank',
    }),
  ],
  [
    'TPBank: dotted thousands, "PS:", a semicolon before the clock',
    {
      body: '(TPBank): 27/10/26;12:30\nTK: xxxx1234\nPS:-35.000VND\nSD: 1.965.000VND\nSD KHA DUNG: 1.965.000VND\nND: THANH TOAN TAI CIRCLE K\nSO GD: 123ABC',
    },
    moved('out', 35_000, {
      counterparty: 'CIRCLE K',
      memo: 'THANH TOAN TAI CIRCLE K',
      at: local(27, 12, 30),
      bank: 'TPBank',
    }),
  ],
  [
    'Agribank: the account before a colon',
    {
      app: 'Agribank Plus',
      body: 'Agribank: 12:30 27/10/2026 Tai khoan 1500205123456: -200,000VND. Noi dung giao dich: CHUYEN TIEN NHA. So du: 3,000,000VND',
    },
    moved('out', 200_000, { memo: 'CHUYEN TIEN NHA', at: local(27, 12, 30), bank: 'Agribank' }),
  ],
  [
    'Sacombank: "So du kha dung:" right against its number',
    {
      body: 'Sacombank 27/10/2026 12:30 TK:0601xxxx1234 PS:-99,000VND So du kha dung:1,901,000VND ND:Thanh toan Shopee',
    },
    moved('out', 99_000, { memo: 'Thanh toan Shopee', at: local(27, 12, 30), bank: 'Sacombank' }),
  ],
  [
    'HDBank: a refund comes in',
    {
      body: 'HDBank: TK 0123xxx789 GD: +300,000 VND luc 27/10/2026 08:00. SD: 1,300,000 VND. ND: Hoan tien don hang',
    },
    moved('in', 300_000, { memo: 'Hoan tien don hang', at: local(27, 8, 0), bank: 'HDBank' }),
  ],
  [
    'VIB: "ghi có" with no sign',
    {
      app: 'MyVIB',
      body: 'VIB: TK 0123456789 ghi co 1,000,000 VND luc 27/10/2026 10:10. SD: 6,000,000 VND. ND: Tran Thi B tra tien an',
    },
    moved('in', 1_000_000, {
      memo: 'Tran Thi B tra tien an',
      at: local(27, 10, 10),
      bank: 'VIB',
    }),
  ],
  [
    'VIB: "ghi nợ"',
    {
      body: 'VIB: TK 0123456789 ghi nợ 250,000 VND lúc 27/10/2026 13:00. SD: 5,750,000 VND',
    },
    moved('out', 250_000, { at: local(27, 13, 0), bank: 'VIB' }),
  ],
  [
    'OCB: "thay đổi"',
    {
      app: 'OCB OMNI',
      body: 'Tài khoản 0041xxxx1234 thay đổi -60,000 VND vào lúc 27/10/2026 07:45:00. Số dư: 940,000 VND. Nội dung: Grab thanh toan',
    },
    moved('out', 60_000, { memo: 'Grab thanh toan', at: local(27, 7, 45), bank: 'OCB' }),
  ],
  [
    'SHB: "giam" for money out',
    {
      app: 'SHB SAHA',
      body: 'TK 1012xxxx789 giam 250,000VND luc 27/10/26 13:20. SD: 750,000VND. ND: Thanh toan dien thoai',
    },
    moved('out', 250_000, { memo: 'Thanh toan dien thoai', at: local(27, 13, 20), bank: 'SHB' }),
  ],
  [
    'MSB: a plus with no label',
    {
      title: 'MSB',
      body: 'TK 0300xxxx1234 +150,000 VND 27/10/2026 15:30 SD: 1,150,000 VND. ND: hoan tien',
    },
    moved('in', 150_000, { memo: 'hoan tien', at: local(27, 15, 30), bank: 'MSB' }),
  ],
  [
    'Cake: who sent it, in a sentence',
    {
      app: 'Cake',
      body: 'Tài khoản của bạn vừa nhận 500.000 đ từ TRAN THI B. Nội dung: tien an trua',
    },
    moved('in', 500_000, { counterparty: 'TRAN THI B', memo: 'tien an trua', bank: 'Cake' }),
  ],
  [
    'Cake: who was paid, and the balance after',
    {
      app: 'Cake',
      body: 'Bạn vừa chuyển 120.000 đ đến NGUYEN VAN C. Số dư: 380.000 đ',
    },
    moved('out', 120_000, { counterparty: 'NGUYEN VAN C', bank: 'Cake' }),
  ],
  [
    'Timo: in English',
    {
      app: 'Timo',
      body: 'Your account received 2,000,000 VND from NGUYEN VAN A. Balance: 5,000,000 VND',
    },
    moved('in', 2_000_000, { counterparty: 'NGUYEN VAN A', bank: 'Timo' }),
  ],
  [
    'Timo: a card payment, the shop after "tại"',
    {
      app: 'Timo',
      body: 'Giao dịch thẻ 65.000 VND tại GRAB*FOOD thành công',
    },
    moved('out', 65_000, { counterparty: 'GRAB*FOOD', bank: 'Timo' }),
  ],
  [
    'Tài khoản … đã nhận … từ',
    { body: 'Tài khoản 0123xxx456 đã nhận 200.000đ từ NGUYEN VAN A' },
    moved('in', 200_000, { counterparty: 'NGUYEN VAN A' }),
  ],
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
  it.each(vietnamese)('%s', (_, input, expected) => {
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
