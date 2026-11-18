import { describe, expect, it } from 'vitest';

import { heardKeyOf } from '../capture/alert-repeat';
import { bankAlertResultSchema, type SurfaceContext } from '../contracts/surfaces';
import { logBankAlert } from './entry';

const UUID_V8 = /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const category = (id: string, name: string) => ({
  id,
  name,
  icon: 'restaurant',
  tile: '#f4e3c8',
  glyph: '#6b4a1f',
  countsDaily: true,
});

const context: SurfaceContext = {
  v: 1,
  language: 'en',
  host: '6pm.ai',
  categories: [category('food', 'Food'), category('drinks', 'Drinks'), category('bills', 'Bills')],
  rules: [{ key: 'phúc long', categoryId: 'drinks' }],
  safeToday: 245_000,
  strings: {},
  rates: [{ currency: 'MYR', rate: '5600' }],
};
const contextJson = JSON.stringify(context);
const now = new Date(2026, 9, 27, 12, 31).toISOString();

const caught = (body: string, { app = '', title = '', date = '', ctx = contextJson } = {}) =>
  bankAlertResultSchema.parse(JSON.parse(logBankAlert(app, title, '', body, date, ctx, now)));

describe('logBankAlert', () => {
  it('leaves money out as a caught alert, filed by the merchant rule', () => {
    const delivered = new Date(2026, 9, 27, 12, 30, 41).toISOString();
    const { item, last } = caught('Bạn đã thanh toán 45.000đ cho Phúc Long. Số dư ví: 155.000đ', {
      app: 'MoMo',
      date: delivered,
    });
    expect(item).toMatchObject({
      v: 1,
      kind: 'spend',
      source: 'alert',
      status: 'caught',
      at: delivered,
      amount: 45_000,
      merchant: 'Phúc Long',
      categoryId: 'drinks',
      receipt: { bank: 'MoMo', namingLines: [] },
      direction: 'out',
    });
    expect(item?.id).toMatch(UUID_V8);
    expect(last).toEqual({
      v: 1,
      at: now,
      bank: 'MoMo',
      amountText: '45.000₫',
      direction: 'out',
    });
  });

  it('names the shop an alert prints before its amount', () => {
    const { item } = caught(
      'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền 119.000đ. Nhấn để kiểm tra giao dịch ngay bạn nhé.',
      { app: 'MoMo', title: 'Thanh toán HIGHLANDS COFFEE thành công' },
    );
    expect(item).toMatchObject({
      amount: 119_000,
      merchant: 'HIGHLANDS COFFEE',
      receipt: { bank: 'MoMo', namingLines: [] },
      direction: 'out',
    });
  });

  it('leaves money in with its memo and no category: the close asks what it was', () => {
    const { item } = caught(
      'TK 0123xxx456|GD: +2,000,000VND 27/10/26 09:15|SD: 3,234,567VND|ND: LUONG T10',
      { app: 'MB Bank' },
    );
    expect(item).toMatchObject({
      amount: 2_000_000,
      merchant: 'LUONG T10',
      categoryId: null,
      receipt: { bank: 'MB Bank', memo: 'LUONG T10' },
      direction: 'in',
      at: new Date(2026, 9, 27, 9, 15).toISOString(),
    });
  });

  it('prices another currency at the app’s rate, keeping what was printed', () => {
    const { item, last } = caught("You've transferred RM 5.00 to ALI BIN ABU");
    expect(item).toMatchObject({
      amount: 28_000,
      foreign: { currency: 'MYR', amount: '5.00', rate: '5600' },
      merchant: 'ALI BIN ABU',
    });
    expect(last.amountText).toBe('28.000₫');
  });

  it('waits for a rate it does not have', () => {
    const { item, last } = caught('You spent £4.20 at Pret A Manger');
    expect(item).toMatchObject({ amount: null, foreign: { currency: 'GBP', amount: '4.20' } });
    expect(item?.foreign?.rate).toBeUndefined();
    expect(last.amountText).not.toBe('');
  });

  it('leaves nothing for a code, and says why', () => {
    expect(caught('Mã OTP của bạn là 123456', { app: 'VCB Digibank' })).toEqual({
      item: null,
      last: { v: 1, at: now, bank: 'Vietcombank', amountText: '', skipped: 'code' },
    });
  });

  it('takes the clock when the printed time is ahead of it', () => {
    const { item } = caught('TK 0123xxx456|GD: -50,000VND 30/10/26 12:30|SD: 1,234,567VND');
    expect(item?.at).toBe(now);
  });

  it('gives the same notification caught twice the same fingerprint, and another payment its own', () => {
    const body =
      'TK 0123xxx456|GD: -40,000VND 27/10/26 12:33|SD: 1,234,567VND|ND: MBCT Techcombank';
    const first = caught(body, { app: 'MB Bank' }).item;
    const again = caught(body, { app: 'MB Bank' }).item;
    const next = caught(body.replace('1,234,567', '1,194,567'), { app: 'MB Bank' }).item;
    expect(first?.id).not.toBe(again?.id);
    expect(heardKeyOf(first?.id)).not.toBeNull();
    expect(heardKeyOf(again?.id)).toBe(heardKeyOf(first?.id));
    expect(heardKeyOf(next?.id)).not.toBe(heardKeyOf(first?.id));
  });

  it('carries a caught alert’s own words for the app’s second reader', () => {
    const body = 'TK 0123xxx456|GD: -40,000VND 27/10/26 12:33|SD: 1,234,567VND';
    const { item, unread } = caught(body, { app: 'MB Bank', title: 'Biến động số dư' });
    expect(item?.alertWords).toEqual({
      app: 'MB Bank',
      title: 'Biến động số dư',
      subtitle: '',
      body,
    });
    expect(item).not.toHaveProperty('words');
    expect(unread).toBeUndefined();
  });

  it('leaves an alert no template read that prints a number for the second reader', () => {
    const delivered = new Date(2026, 9, 27, 12, 30, 41).toISOString();
    const body = 'Quý khách vừa quẹt 85.000 ở The Coffee House';
    const { item, unread, last } = caught(body, { app: 'MB Bank', date: delivered });
    expect(item).toBeNull();
    expect(last.skipped).toBe('unread');
    expect(unread).toMatchObject({
      v: 1,
      kind: 'unread',
      at: now,
      date: delivered,
      bank: 'MB Bank',
      alertWords: { app: 'MB Bank', title: '', subtitle: '', body },
    });
    expect(unread?.id).toMatch(UUID_V8);
  });

  it('leaves an unread alert for the second reader, not the log, while the capture log is on', () => {
    const logging = JSON.stringify({ ...context, keepWords: true });
    const read = caught('Quý khách vừa quẹt 85.000 ở The Coffee House', { ctx: logging });
    expect(read.unread?.kind).toBe('unread');
    expect(read.heard).toBeUndefined();
    const promo = caught('Ưu đãi: giảm 50.000đ khi thanh toán hôm nay', { ctx: logging });
    expect(promo.heard?.skipped).toBe('promo');
    expect(promo.unread).toBeUndefined();
  });

  it('leaves nothing of a code, a promotion, a security notice, or words with no number', () => {
    for (const body of [
      'Ma OTP cua ban la 482913. Khong chia se ma nay.',
      'Ưu đãi: giảm 50.000đ khi thanh toán hôm nay',
      'Đăng nhập trên thiết bị mới lúc 12:30',
      'Cảm ơn quý khách đã sử dụng dịch vụ',
    ]) {
      const { item, unread } = caught(body, { app: 'MB Bank' });
      expect(item).toBeNull();
      expect(unread).toBeUndefined();
    }
  });

  it('answers well-formed for anything unreadable', () => {
    const answer = bankAlertResultSchema.parse(
      JSON.parse(logBankAlert('', '', '', '', '', 'not json', 'not a date')),
    );
    expect(answer.item).toBeNull();
    expect(answer.last.skipped).toBe('unread');
  });

  it('writes the home currency on an item counted in another', () => {
    const { item } = caught('Card payment -12.50 at TESCO', {
      ctx: JSON.stringify({ ...context, currency: 'GBP' }),
    });
    expect(item).toMatchObject({ amount: 1250, currency: 'GBP', merchant: 'TESCO' });
  });
});
