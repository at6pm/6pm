import { describe, expect, it } from 'vitest';

import type { BankAlert, BankAlertInput } from './bank-alert';
import { local, moved, read } from './fixtures/bank-alerts';

/** Alerts from Vietnam's banks, as each prints its balance changes. */
const banks: [string, BankAlertInput, BankAlert][] = [
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
      counterparty: 'NGUYEN VAN A',
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
    moved('in', 2_000_000, {
      counterparty: 'NGUYEN VAN A',
      memo: 'NGUYEN VAN A chuyen tien',
      bank: 'Techcombank',
    }),
  ],
  [
    'ACB: "(VND)" against the account, the memo after "GD:"',
    {
      body: 'ACB: TK 12345678(VND) + 1,500,000 luc 09:15 27/10/2026. So du 4,500,000. GD: NGUYEN VAN B CHUYEN KHOAN',
    },
    moved('in', 1_500_000, {
      counterparty: 'NGUYEN VAN B',
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
    moved('in', 500_000, {
      counterparty: 'TRAN THI C',
      memo: 'TRAN THI C tra no',
      at: local(27, 9, 15),
      bank: 'BIDV',
    }),
  ],
  [
    'VietinBank: "Giao dịch" as the change',
    {
      app: 'VietinBank iPay',
      body: 'Thời gian: 27/10/2026 12:30\nTài khoản: 1088xxxx1234\nGiao dịch: -75,000VND\nSố dư hiện tại: 925,000VND\nNội dung: thanh toan Grab',
    },
    moved('out', 75_000, {
      counterparty: 'Grab',
      memo: 'thanh toan Grab',
      at: local(27, 12, 30),
      bank: 'VietinBank',
    }),
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
    moved('out', 99_000, {
      counterparty: 'Shopee',
      memo: 'Thanh toan Shopee',
      at: local(27, 12, 30),
      bank: 'Sacombank',
    }),
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
      counterparty: 'Tran Thi B',
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
    moved('out', 60_000, {
      counterparty: 'Grab',
      memo: 'Grab thanh toan',
      at: local(27, 7, 45),
      bank: 'OCB',
    }),
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
];

describe('readBankAlert: money that moved', () => {
  it.each(banks)('%s', (_, input, expected) => {
    expect(read(input)).toEqual(expected);
  });
});
