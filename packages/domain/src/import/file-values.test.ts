import { describe, expect, it } from 'vitest';

import { dateOrderOf, fileAmount, fileDate, fileTime } from './file-values';

describe('fileAmount', () => {
  it.each([
    ['1.250.000', 1_250_000],
    ['1,250,000.00', 1_250_000],
    ['1.250.000,00', 1_250_000],
    ['-45,000', -45_000],
    ['45.000 ₫', 45_000],
    ['45.000đ', 45_000],
    ['−45000', -45_000],
    ['(45.000)', -45_000],
    ['+17400000', 17_400_000],
    ['-1.0E7', null],
    ['45000 VND', 45_000],
    ['VND 1,250,000', 1_250_000],
    ['12', 12],
    ['', null],
    ['abc', null],
    ['1.25.000', null],
  ])('reads %s in đồng', (text, expected) => {
    expect(fileAmount(text)).toBe(expected);
  });

  it('reads number cells, Money Lover writing -1.0E7 as a number', () => {
    expect(fileAmount(-195000)).toBe(-195_000);
    expect(fileAmount(-1e7)).toBe(-10_000_000);
  });

  it('reads cents in a currency that has them', () => {
    expect(fileAmount('12.50', 2)).toBe(1250);
    expect(fileAmount('12,50', 2)).toBe(1250);
    expect(fileAmount('1,250', 2)).toBe(125_000);
    expect(fileAmount('$1,250.75', 2)).toBe(125_075);
    expect(fileAmount(-12.5, 2)).toBe(-1250);
  });
});

describe('fileDate', () => {
  it.each([
    ['09/10/2026 08:12:40', '2026-10-09', '08:12:40'],
    ['09/10/2026', '2026-10-09', null],
    ['9/10/26', '2026-10-09', null],
    ['2026-10-09', '2026-10-09', null],
    ['2026-10-09 08:12', '2026-10-09', '08:12:00'],
    ['2026-10-09T21:05:00', '2026-10-09', '21:05:00'],
    ['09.10.2026', '2026-10-09', null],
    ['31/02/2026', null, null],
  ])('reads %s', (text, day, time) => {
    const read = fileDate(text);
    expect(read?.day ?? null).toBe(day);
    if (day) expect(read?.time).toBe(time);
  });

  it('reads Excel day serials', () => {
    expect(fileDate(46304)?.day).toBe('2026-10-09');
    expect(fileDate('46304')?.day).toBe('2026-10-09');
    expect(fileDate(12)).toBeNull();
  });

  it('reads month first when the column is written that way', () => {
    const cells = ['10/09/2026', '10/23/2026', '11/02/2026'];
    expect(dateOrderOf(cells)).toBe('mdy');
    expect(fileDate('10/23/2026', 'mdy')?.day).toBe('2026-10-23');
    expect(dateOrderOf(['09/10/2026', '23/10/2026'])).toBe('dmy');
    expect(dateOrderOf(['01/02/2026'])).toBe('dmy');
  });

  it('reads a time in its own cell', () => {
    expect(fileTime('8:05')).toBe('08:05:00');
    expect(fileTime('8:05 PM')).toBe('20:05:00');
    expect(fileTime(0.5)).toBe('12:00:00');
    expect(fileTime('noon')).toBeNull();
  });
});
