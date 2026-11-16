import { describe, expect, it } from 'vitest';

import {
  ALERT_PAYEE_SHAPES,
  payeeByShape,
  shapesOf,
  type AlertPayeeShape,
} from './alert-payee-shapes';
import { readBankAlert } from './bank-alert';

// Every name and account here is made up.

describe('payeeByShape', () => {
  it.each([
    ['MB', 'in', 'NGUYEN VAN A chuyen tien', 'NGUYEN VAN A'],
    ['TCB', 'in', 'NGUYEN VAN A chuyen tien', 'NGUYEN VAN A'],
    ['ACB', 'in', 'NGUYEN VAN B CHUYEN KHOAN', 'NGUYEN VAN B'],
    ['VIB', 'in', 'Tran Thi B tra tien an', 'Tran Thi B'],
    ['BIDV', 'in', 'TRAN THI C tra no', 'TRAN THI C'],
    ['MB', 'in', 'Lê Thị Hoà chuyển tiền', 'Lê Thị Hoà'],
    ['ICB', 'out', 'thanh toan Grab', 'Grab'],
    ['STB', 'out', 'Thanh toan Shopee', 'Shopee'],
    ['OCB', 'out', 'Grab thanh toan', 'Grab'],
  ] as const)('reads %s’s %s memo “%s”', (bank, way, memo, name) => {
    expect(payeeByShape(bank, way, { memo, text: '' })).toBe(name);
  });

  it('reads a bank only by its own shapes', () => {
    expect(payeeByShape('VBA', 'in', { memo: 'NGUYEN VAN A chuyen tien', text: '' })).toBeNull();
    expect(payeeByShape('MB', 'out', { memo: 'NGUYEN VAN A chuyen tien', text: '' })).toBeNull();
    expect(payeeByShape(null, 'in', { memo: 'NGUYEN VAN A chuyen tien', text: '' })).toBeNull();
  });

  it('never takes a bill, a card or a bank for a payee', () => {
    for (const memo of [
      'thanh toan hoa don dien',
      'thanh toan the tin dung',
      'Thanh toan dien thoai',
      'thanh toan Techcombank',
      'thanh toan tien nha',
    ]) {
      expect(payeeByShape('ICB', 'out', { memo, text: '' })).toBeNull();
    }
    expect(payeeByShape('MB', 'in', { memo: 'MB BANK chuyen tien', text: '' })).toBeNull();
  });

  it('reads a bank’s new wording beside its old one: one more line of data', () => {
    const reworded: AlertPayeeShape = {
      banks: ['MB'],
      way: 'in',
      from: 'memo',
      pattern: String.raw`^tu\s+(\p{L}+(?:\s+\p{L}+){1,4})\s*-`,
      since: '2026-12',
    };
    const shapes = [...ALERT_PAYEE_SHAPES, reworded];
    expect(shapesOf('MB', shapes)[0]).toBe(reworded);
    const read = (memo: string) => payeeByShape('MB', 'in', { memo, text: '' }, shapes);
    expect(read('tu NGUYEN VAN A - tien nha')).toBe('NGUYEN VAN A');
    expect(read('NGUYEN VAN A chuyen tien')).toBe('NGUYEN VAN A');
  });
});

describe('readBankAlert never names the bank as who was paid', () => {
  it.each([
    'Bạn vừa chuyển 120.000 đ đến Vietcombank. Số dư: 380.000 đ',
    'Giao dịch thẻ 65.000 VND tại MB Bank thành công',
    'TK 0123xxx456|GD: -50,000VND|ND: Thanh toan QR tai TECHCOMBANK',
  ])('%s', (body) => {
    expect(readBankAlert({ body })).toMatchObject({ kind: 'moved', counterparty: null });
  });
});
