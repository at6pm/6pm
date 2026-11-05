import { strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';

import { importTargetOf, labelTargetOf, looksLikePerson, payeeTargetOf } from './category-words';
import { columnSamples, mainSheet, planOf, planReads, valueShape } from './columns';
import { misa, momoHistory, momoLocked, moneyLover } from './fixtures/export-files';
import {
  birthdayPassword,
  needsPassword,
  openImportFile,
  spentBeforeJoining,
  summariseImport,
} from './import-file';
import { readLines, type ReadLines } from './import-read';
import { base64Bytes } from './office-crypto';
import type { Sheet } from './xlsx-read';

const VND = { code: 'VND', minorDigits: 0 } as const;

function read(bytes: Uint8Array, password?: string): ReadLines & { sheet: Sheet } {
  const opened = openImportFile(bytes, password);
  if (!opened.ok) throw new Error(opened.reason);
  const sheet = mainSheet(opened.sheets);
  if (sheet === null) throw new Error('no sheet');
  return { ...readLines(sheet, planOf(sheet), VND), sheet };
}

const csv = (text: string) => strToU8(text);

describe('MoMo history', () => {
  it('asks for the birthday, says when it is wrong, and opens with it', () => {
    const locked = base64Bytes(momoLocked);
    expect(needsPassword(locked)).toBe(true);
    expect(openImportFile(locked)).toEqual({ ok: false, reason: 'locked' });
    expect(openImportFile(locked, birthdayPassword(6, 1, 1970))).toEqual({
      ok: false,
      reason: 'wrongPassword',
    });
    expect(birthdayPassword(5, 1, 1970)).toBe('05011970');
    expect(read(locked, '05011970').rows).toHaveLength(read(base64Bytes(momoHistory)).rows.length);
  });

  it('keeps payments and money in, and sets aside own moves and failed payments', () => {
    const lines = read(base64Bytes(momoHistory));
    expect(lines.app).toBe('momo');
    expect(lines.setAside).toEqual({
      ownMove: 4,
      balanceFix: 0,
      debt: 0,
      failed: 1,
      otherCurrency: 0,
    });
    const out = lines.rows.filter((r) => r.direction === 'out');
    const moneyIn = lines.rows.filter((r) => r.direction === 'in');
    expect(out).toHaveLength(11);
    expect(out.find((r) => r.amount === 61_000)?.merchant).toBe('GRAB');
    expect(moneyIn.map((r) => r.amount).sort((a, b) => a - b)).toEqual([312, 43_000, 250_000]);
    const grab = out.find((r) => r.merchant === 'GRAB');
    expect(grab).toMatchObject({
      amount: 143_000,
      day: '2026-11-02',
      time: '19:30:02',
      payLater: true,
    });
    const circle = out.find((r) => r.amount === 38_000);
    expect(circle).toMatchObject({ merchant: 'CIRCLE K', label: 'CIRCLE K' });
    expect(out.find((r) => r.amount === 120_000)?.label).toBe('Chuyển tiền');
    const interest = moneyIn.find((r) => r.amount === 312);
    expect(interest?.merchant).toBe('Tiền lời Túi Thần Tài');
  });

  it('gives every line an id that is the same on a second read, two equal lines two ids', () => {
    const first = read(base64Bytes(momoHistory)).rows.map((r) => r.id);
    const again = read(base64Bytes(momoHistory)).rows.map((r) => r.id);
    expect(again).toEqual(first);
    expect(new Set(first).size).toBe(first.length);
  });
});

describe('Money Lover', () => {
  it('reads its Excel export: signed amounts, transfers, balance fixes and loans set aside', () => {
    const lines = read(base64Bytes(moneyLover));
    expect(lines.app).toBe('moneyLover');
    expect(lines.setAside).toEqual({
      ownMove: 2,
      balanceFix: 1,
      debt: 1,
      failed: 0,
      otherCurrency: 1,
    });
    expect(lines.rows).toHaveLength(8);
    expect(lines.rows.find((r) => r.label === 'Lương')).toMatchObject({
      direction: 'in',
      amount: 17_400_000,
    });
    expect(lines.rows.find((r) => r.label === 'Mua sắm')?.amount).toBe(1_000_000);
    expect(lines.rows.find((r) => r.label === 'Cà phê')).toMatchObject({
      merchant: 'Cà phê',
      note: null,
    });
  });

  it('reads its CSV, with a byte order mark, by comma or semicolon', () => {
    const header =
      'Id,Date,Category,Subcategory,Amount,Currency,Wallet,Note,With,Event,Exclude from report,Members';
    const body = [
      '1,02/10/2026,Food & Beverage,Café,"-29,000",VND,Cash,Highlands,,,,',
      '2,01/10/2026,Transfer,,-2000000,VND,Cash,,,,,',
      '3,30/09/2026,Salary,,"17,400,000",VND,Bank,,,,,',
    ];
    const comma = read(csv(`\uFEFF${[header, ...body].join('\r\n')}`));
    expect(comma.app).toBe('moneyLover');
    expect(comma.rows.map((r) => [r.label, r.amount, r.direction])).toEqual([
      ['Café', 29_000, 'out'],
      ['Salary', 17_400_000, 'in'],
    ]);
    expect(comma.setAside.ownMove).toBe(1);
    const semi = read(
      csv(
        'ID;Note;Amount;Category;Account;Currency;Date;Event;Exclude Report\n' +
          '1;Phở;-45.000;Ăn uống;Tiền mặt;VND;02/10/2026;;False\n' +
          '2;;-1.250.000;Hoá đơn điện;Tiền mặt;VND;25/09/2026;;False',
      ),
    );
    expect(semi.rows.map((r) => [r.label, r.amount])).toEqual([
      ['Ăn uống', 45_000],
      ['Hoá đơn điện', 1_250_000],
    ]);
  });
});

describe('MISA', () => {
  it('finds the header under the title rows, reads in and out columns and skips the total', () => {
    const lines = read(base64Bytes(misa));
    expect(lines.app).toBe('misa');
    expect(lines.setAside).toMatchObject({ ownMove: 1, balanceFix: 1 });
    expect(lines.rows.map((r) => [r.label, r.amount, r.direction, r.day, r.time])).toEqual([
      ['Ăn sáng', 25_000, 'out', '2026-10-03', '07:30:00'],
      ['Đi chợ/siêu thị', 420_000, 'out', '2026-10-02', '12:00:00'],
      ['Lương', 15_000_000, 'in', '2026-10-01', '09:00:00'],
      ['Hiếu hỉ', 1_000_000, 'out', '2026-09-28', '20:00:00'],
      ['Điện', 1_250_000, 'out', '2026-09-27', '19:00:00'],
    ]);
  });
});

describe('a file 6pm does not know', () => {
  it('guesses its columns from bilingual headers and a type column', () => {
    const lines = read(
      csv(
        '\uFEFFDate (Ngày),Type (Loại),Category (Hạng mục),Amount (Số tiền),Wallet/Account (Tài khoản),Note (Ghi chú)\n' +
          '01/11/2026,Expense (Chi),Food & Beverage,150000,Cash,Lunch\n' +
          '01/11/2026,Income (Thu),Salary,25000000,Techcombank,Monthly salary\n',
      ),
    );
    expect(lines.rows.map((r) => [r.label, r.direction])).toEqual([
      ['Food & Beverage', 'out'],
      ['Salary', 'in'],
    ]);
  });

  it('reads an ISO-dated export with a category type, all amounts positive', () => {
    const lines = read(
      csv(
        'Date,Wallet,Category Type,Category Name,Amount,Currency,Note,Description\n' +
          '2026-11-01,Cash,Expense,Food & Beverage,120000,VND,Lunch with team,Pho restaurant\n' +
          '2026-11-03,Bank Account,Income,Salary,25000000,VND,Monthly paycheck,Company payroll\n',
      ),
    );
    expect(lines.rows.map((r) => [r.label, r.amount, r.direction, r.merchant])).toEqual([
      ['Food & Beverage', 120_000, 'out', 'Lunch with team'],
      ['Salary', 25_000_000, 'in', 'Monthly paycheck'],
    ]);
  });

  it('says so when it cannot find a date and an amount, and shows the server only shapes', () => {
    const opened = openImportFile(
      csv('Ngày GD;Cột B;Nhóm\n09/10/2026;-120000;Mua sắm\n08/10/2026;+17400000;Lương\n'),
    );
    if (!opened.ok) throw new Error('not opened');
    const sheet = opened.sheets[0];
    if (sheet === undefined) throw new Error('no sheet');
    expect(planReads(planOf(sheet))).toBe(false);
    // What it could name is kept, for the person to finish.
    expect(planOf(sheet).roles).toEqual(['date', 'skip', 'category']);
    expect(columnSamples(sheet, 0)).toEqual([
      { header: 'Ngày GD', shapes: ['dd/dd/dddd'] },
      { header: 'Cột B', shapes: ['-dddddd', '+dddddddd'] },
      { header: 'Nhóm', shapes: ['w w', 'w'] },
    ]);
    expect(valueShape('Thành công', true)).toBe('Thành công');
    expect(valueShape('NGUYEN VAN AN 0900000001', true)).toBe('w w w dddddddddd');
  });

  it('calls a header with nothing under it empty, and a binary file it cannot read unsupported', () => {
    expect(openImportFile(csv('Date,Amount,Note\n'))).toEqual({ ok: false, reason: 'empty' });
    expect(openImportFile(new Uint8Array([1, 0, 2, 0, 3]))).toEqual({
      ok: false,
      reason: 'unsupported',
    });
    expect(openImportFile(new Uint8Array())).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('summariseImport', () => {
  it('brings in only days before 6pm started, counting the rest as already in', () => {
    const lines = read(base64Bytes(momoHistory));
    const summary = summariseImport(lines, '2026-11-01');
    expect(summary.alreadyIn).toBe(3);
    expect(summary.rows.every((r) => r.day < '2026-11-01')).toBe(true);
    expect(summary.first).toBe('2024-03-02');
    expect(summary.last).toBe('2026-10-28');
    expect(summary.years).toEqual([
      { year: '2024', spending: 1, moneyIn: 0 },
      { year: '2025', spending: 2, moneyIn: 0 },
      { year: '2026', spending: 5, moneyIn: 3 },
    ]);
    expect(summary.setAsideTotal).toBe(5);
    expect(summary.labels[0]?.target).toBeNull();
  });

  it('adds up what went before joining, in the joined cycle and daily categories only', () => {
    const rows = [
      { day: '2026-10-24', amount: 100, direction: 'out', countsDaily: true },
      { day: '2026-10-26', amount: 200, direction: 'out', countsDaily: true },
      { day: '2026-10-27', amount: 900, direction: 'out', countsDaily: false },
      { day: '2026-10-28', amount: 400, direction: 'in', countsDaily: true },
      { day: '2026-11-02', amount: 800, direction: 'out', countsDaily: true },
    ] as const;
    expect(spentBeforeJoining(rows, '2026-10-25', '2026-11-01')).toBe(200);
  });
});

describe('importTargetOf', () => {
  it.each([
    ['Ăn uống', 'food'],
    ['Food & Beverage', 'food'],
    ['Cà phê', 'drinks'],
    ['Café', 'drinks'],
    ['Di chuyển', 'transport'],
    ['GRAB', 'transport'],
    ['Green SM', 'transport'],
    ['Đi chợ / siêu thị', 'groceries'],
    ['CIRCLE K', 'groceries'],
    ['Hoá đơn & Tiện ích', 'bills'],
    ['Hoá đơn điện', 'bills'],
    ['Điện', 'bills'],
    ['Nước', 'bills'],
    ['Thú cưng', 'family'],
    ['Điện lực Hồ Chí Minh', 'bills'],
    ['data vinaphone trực tiếp', 'bills'],
    ['Mua sắm', 'shopping'],
    ['Giải trí', 'fun'],
    ['Sức khỏe', 'health'],
    ['Gia đình', 'family'],
    ['Hiếu hỉ', 'gifts'],
    ['Quà tặng & Quyên góp', 'gifts'],
    ['Đầu tư', 'notDaily'],
    ['Fees & Charges', 'notDaily'],
    ['Các chi phí khác', null],
    ['Khác', null],
    ['Chuyển tiền', null],
    ['Trả nợ', null],
  ])('puts %s in %s', (name, target) => {
    expect(importTargetOf(name)).toBe(target);
  });
});

describe('payeeTargetOf', () => {
  it.each([
    ['GRAB', 'transport'],
    ['MAI LINH', 'transport'],
    ['CIRCLE K', 'groceries'],
    ['Highlands Coffee', 'drinks'],
    ['Điện lực Hồ Chí Minh', 'bills'],
    ['data vinaphone trực tiếp', 'bills'],
    ['VNPT', 'bills'],
    ['Phở Thìn', 'food'],
    // People, transfers and the wallet's own names are the person's to pick.
    ['NGUYEN VAN AN', null],
    ['TRẦN THỊ BÍCH', null],
    ['LE MI', null],
    ['Chuyển tiền', null],
    ['dư nợ Ví Trả Sau', null],
    ['Ví Trả Sau', null],
    // Words inside a shop's name never make it Not daily.
    ['Phí Dịch Vụ ABC', null],
    ['Công ty Đầu tư XYZ', null],
    ['FastMoney', null],
    ['Apple Services', null],
    ['Google', null],
  ])('puts %s in %s', (payee, target) => {
    expect(payeeTargetOf(payee)).toBe(target);
  });

  it('reads a MoMo history’s labels as payees, and other apps’ as their categories', () => {
    expect(labelTargetOf('momo', 'Đầu tư')).toBeNull();
    expect(labelTargetOf('moneyLover', 'Đầu tư')).toBe('notDaily');
    expect(labelTargetOf('momo', 'GRAB')).toBe('transport');
  });

  it('tells a full name in capitals from a shop', () => {
    expect(looksLikePerson('NGUYEN VAN AN')).toBe(true);
    expect(looksLikePerson('PHẠM MINH')).toBe(true);
    expect(looksLikePerson('Nguyen Van An')).toBe(false);
    expect(looksLikePerson('CIRCLE K')).toBe(false);
    expect(looksLikePerson('SUKIYA')).toBe(false);
    expect(looksLikePerson('LE 123')).toBe(false);
  });
});

describe('a MoMo history’s pay-later', () => {
  const header = [
    'STT',
    'Thời gian ',
    'Mã giao dịch',
    'Loại giao dịch',
    'Tài khoản chuyển',
    'Tên định danh\n Tài khoản chuyển',
    'Tài khoản nhận',
    'Tên định danh \nTài khoản nhận',
    'Số Tiền',
    'Số Dư Sau giao dịch',
    'Trạng Thái GD',
  ];
  const line = (n: number, note: string, from: string, to: string, amount: number) => [
    n,
    `0${n}/10/2026 12:00:00`,
    `${9_000_000 + n}`,
    note,
    '',
    from,
    '',
    to,
    -amount,
    0,
    'Thành công',
  ];

  it('keeps what pay-later paid for and sets aside paying the pay-later balance off', () => {
    const sheet: Sheet = {
      name: '',
      rows: [
        header,
        line(1, 'Thanh toán GRAB', 'Ví Trả Sau', 'GRAB', 61_000),
        line(2, 'Thanh toán SHOP ONE', 'Ví Trả Sau', 'SHOP ONE', 39_000),
        line(3, 'Thanh toán dư nợ Ví Trả Sau', 'NGUYEN VAN AN', 'dư nợ Ví Trả Sau', 100_000),
      ],
    };
    const plan = planOf(sheet);
    expect(plan.app).toBe('momo');
    const lines = readLines(sheet, plan, VND);
    expect(lines.rows.map((r) => [r.label, r.amount, r.payLater])).toEqual([
      ['GRAB', 61_000, true],
      ['SHOP ONE', 39_000, true],
    ]);
    expect(lines.setAside.debt).toBe(1);
    const summary = summariseImport(lines, '2026-11-01');
    expect(summary.labels.map((l) => [l.label, l.target])).toEqual([
      ['SHOP ONE', null],
      ['GRAB', 'transport'],
    ]);
  });
});
