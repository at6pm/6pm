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
