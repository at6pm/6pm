import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { categoryHintOf, foldWords, parseSpokenSpend } from './spoken-spend';

describe('parseSpokenSpend', () => {
  it('reads the Quick add example', () => {
    expect(parseSpokenSpend('trà sữa with pearls, forty-five k')).toEqual({
      name: 'Trà sữa',
      amount: 45_000,
      categoryHint: 'drinks',
    });
  });

  it('reads the close cash example', () => {
    expect(parseSpokenSpend('veggies and eggs at the market, thirty-five k')).toEqual({
      name: 'Veggies & eggs',
      amount: 35_000,
      categoryHint: 'groceries',
    });
  });

  it.each([
    ['Log 45k phở in 6pm', 'Phở', 45_000, 'food'],
    ['phở bò bốn lăm nghìn', 'Phở bò', 45_000, 'food'],
    ['cà phê sữa đá hai mươi lăm nghìn', 'Cà phê sữa đá', 25_000, 'drinks'],
    ['bánh mì 20 nghìn đồng', 'Bánh mì', 20_000, 'food'],
    ['grab về nhà 32k', 'Grab về nhà', 32_000, 'transport'],
    ['đi chợ hết hai trăm rưỡi', 'Đi chợ', 250_000, 'groceries'],
    ['Phở Hai Thìn, bốn lăm nghìn', 'Phở Hai Thìn', 45_000, 'food'],
    [
      'taxi to the airport for one hundred and fifty k',
      'Taxi to the airport',
      150_000,
      'transport',
    ],
    ['quà sinh nhật cho Lan một triệu hai', 'Quà sinh nhật', 1_200_000, 'gifts'],
    ['coffee was forty k', 'Coffee', 40_000, 'drinks'],
    ['spent forty k on lunch', 'Lunch', 40_000, 'food'],
  ])('reads %j', (text, name, amount, categoryHint) => {
    expect(parseSpokenSpend(text)).toEqual({ name, amount, categoryHint });
  });

  it('has an amount with no name when only an amount was said', () => {
    expect(parseSpokenSpend('forty-five k')).toEqual({
      name: '',
      amount: 45_000,
      categoryHint: null,
    });
  });

  it('has a name with no amount when none was said', () => {
    expect(parseSpokenSpend('tiền điện')).toEqual({
      name: 'Tiền điện',
      amount: null,
      categoryHint: null,
    });
  });

  it('takes the number said with a unit over a bare one', () => {
    expect(parseSpokenSpend('2 bát phở 90k').amount).toBe(90_000);
  });

  it('never throws, and an amount is always whole positive đồng', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 80 }), (text) => {
        const spoken = parseSpokenSpend(text);
        if (spoken.amount !== null) {
          expect(Number.isSafeInteger(spoken.amount) && spoken.amount > 0).toBe(true);
        }
        expect(typeof spoken.name).toBe('string');
      }),
    );
  });
});

describe('categoryHintOf', () => {
  it.each([
    ['CIRCLE K VN', 'shopping'],
    ['Phở Hòa Pasteur', 'food'],
    ['Highlands Coffee', 'drinks'],
    ['GRAB VIETNAM', 'transport'],
    ['Bach Hoa Xanh', 'groceries'],
    ['bó hoa tươi', 'gifts'],
    ['the coffee house', 'drinks'],
  ])('points %j to %s', (text, id) => {
    expect(categoryHintOf(text)).toBe(id);
  });

  it('ignores words that only look like a category', () => {
    expect(categoryHintOf('trả tiền hôm qua')).toBeNull();
    expect(categoryHintOf('cho Lan')).toBeNull();
    expect(categoryHintOf('')).toBeNull();
  });

  it('takes the category whose word comes first', () => {
    expect(categoryHintOf('trà sữa and a cake at the market')).toBe('drinks');
  });
});

describe('foldWords', () => {
  it('takes accents and đ off and pads with spaces', () => {
    expect(foldWords('Đi chợ, Phở!')).toBe(' di cho pho ');
    expect(foldWords('')).toBe(' ');
  });
});

describe('money in said out loud', () => {
  it('reads someone giving money, named after the giver', () => {
    expect(parseSpokenSpend('mẹ cho 500k')).toEqual({
      name: 'Mẹ',
      amount: 500_000,
      categoryHint: null,
      direction: 'in',
    });
    expect(parseSpokenSpend('anh Nam chuyển 2 triệu')).toMatchObject({
      name: 'Anh Nam',
      amount: 2_000_000,
      direction: 'in',
    });
    expect(parseSpokenSpend('mom sent me fifty k')).toMatchObject({
      name: 'Mom',
      amount: 50_000,
      direction: 'in',
    });
  });

  it('reads pay and bonuses, by verb or by name', () => {
    expect(parseSpokenSpend('got paid 18 million')).toMatchObject({
      amount: 18_000_000,
      direction: 'in',
    });
    expect(parseSpokenSpend('lương tháng mười 18 triệu')).toMatchObject({
      name: 'Lương tháng mười',
      amount: 18_000_000,
      direction: 'in',
    });
    expect(parseSpokenSpend('nhận được 300k tiền thưởng')).toMatchObject({
      amount: 300_000,
      direction: 'in',
    });
  });

  it('leaves spending alone, a gift bought for someone included', () => {
    expect(parseSpokenSpend('mua quà cho mẹ 200k')).not.toHaveProperty('direction');
    expect(parseSpokenSpend('trà sữa 45k')).not.toHaveProperty('direction');
  });
});
