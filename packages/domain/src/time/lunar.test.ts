import { describe, expect, it } from 'vitest';

import {
  inNewYearWindow,
  lunarNewYear,
  newYearWindow,
  nextNewYearWindow,
  seasonDay,
} from './lunar';

describe('the lunar table', () => {
  it('starts Tết on the published days, 2027 to 2030', () => {
    // Đinh Mùi, Mậu Thân, Kỷ Dậu, Canh Tuất.
    expect(lunarNewYear(2027, 'tet')).toBe('2027-02-06');
    expect(lunarNewYear(2028, 'tet')).toBe('2028-01-26');
    expect(lunarNewYear(2029, 'tet')).toBe('2029-02-13');
    expect(lunarNewYear(2030, 'tet')).toBe('2030-02-02');
  });

  it('runs the 2027 window from 23 tháng Chạp to mùng 6: 30 Jan to 11 Feb', () => {
    expect(newYearWindow(2027, 'tet')).toEqual({
      tradition: 'tet',
      year: 2027,
      start: '2027-01-30',
      newYear: '2027-02-06',
      end: '2027-02-11',
    });
  });

  it('works out the windows of 2028 to 2030 from the length of tháng Chạp', () => {
    expect(newYearWindow(2028, 'tet')).toMatchObject({ start: '2028-01-19', end: '2028-01-31' });
    expect(newYearWindow(2029, 'tet')).toMatchObject({ start: '2029-02-06', end: '2029-02-18' });
    expect(newYearWindow(2030, 'tet')).toMatchObject({ start: '2030-01-26', end: '2030-02-07' });
  });

  it('keeps each country on its own clock', () => {
    // Seollal 2027 is the day after Tết and 春节; 春节 2030 the day after Tết.
    expect(lunarNewYear(2027, 'seollal')).toBe('2027-02-07');
    expect(lunarNewYear(2027, 'chunjie')).toBe('2027-02-06');
    expect(lunarNewYear(2028, 'seollal')).toBe('2028-01-27');
    expect(lunarNewYear(2030, 'chunjie')).toBe('2030-02-03');
    // Seollal's twelfth month of 2027 has 30 days, so its 23rd is still 30 Jan.
    expect(newYearWindow(2027, 'seollal')).toMatchObject({
      start: '2027-01-30',
      end: '2027-02-12',
    });
  });

  it('knows nothing outside 2027 to 2040', () => {
    expect(lunarNewYear(2026, 'tet')).toBeNull();
    expect(lunarNewYear(2041, 'tet')).toBeNull();
    expect(lunarNewYear(2040, 'tet')).toBe('2040-02-12');
  });
});

describe('the season around a day', () => {
  it('finds this year’s window until it ends, then next year’s', () => {
    expect(nextNewYearWindow('2026-12-01', 'tet')?.newYear).toBe('2027-02-06');
    expect(nextNewYearWindow('2027-02-11', 'tet')?.newYear).toBe('2027-02-06');
    expect(nextNewYearWindow('2027-02-12', 'tet')?.newYear).toBe('2028-01-26');
    expect(inNewYearWindow('2027-01-29', newYearWindow(2027, 'tet'))).toBe(false);
    expect(inNewYearWindow('2027-01-30', newYearWindow(2027, 'tet'))).toBe(true);
  });

  it('counts down from 23 tháng Chạp: seven lanterns, one day left on 5 Feb', () => {
    expect(seasonDay('2027-01-30', 'tet')).toMatchObject({
      kind: 'countdown',
      left: 7,
      lanterns: 7,
    });
    expect(seasonDay('2027-02-05', 'tet')).toMatchObject({ kind: 'countdown', left: 1 });
    expect(seasonDay('2027-01-30', 'seollal')).toMatchObject({ left: 8, lanterns: 8 });
  });

  it('names the holiday mùng 1 to mùng 6, and nothing after', () => {
    expect(seasonDay('2027-02-06', 'tet')).toMatchObject({ kind: 'holiday', mung: 1 });
    expect(seasonDay('2027-02-11', 'tet')).toMatchObject({ kind: 'holiday', mung: 6 });
    expect(seasonDay('2027-02-12', 'tet')).toBeNull();
    expect(seasonDay('2027-01-25', 'tet')).toBeNull();
    expect(seasonDay('2027-02-05', null)).toBeNull();
  });
});
