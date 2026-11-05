import { describe, expect, it } from 'vitest';

import { closeStreak, daysUntil, jarDay, monthSuns, streakRun, widgetHours } from './widget-days';

const closed = (day: string, spent = 100_000, line = 200_000) => ({ day, spent, line });

describe('closeStreak', () => {
  it('counts back from yesterday while today is still open', () => {
    const days = [closed('2026-10-06'), closed('2026-10-07'), closed('2026-10-08')];
    expect(closeStreak(days, '2026-10-09')).toBe(3);
  });

  it('counts today once it is closed', () => {
    const days = ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'].map((d) => closed(d));
    expect(closeStreak(days, '2026-10-09')).toBe(4);
  });

  it('ends at the first evening not closed, over the line or not', () => {
    const days = [closed('2026-10-03'), closed('2026-10-05', 300_000), closed('2026-10-06')];
    expect(closeStreak(days, '2026-10-07')).toBe(2);
  });

  it('is nothing when yesterday was missed', () => {
    expect(closeStreak([closed('2026-10-06')], '2026-10-08')).toBe(0);
  });

  it('gives the run oldest first, for the strata', () => {
    const days = [closed('2026-10-08'), closed('2026-10-07'), closed('2026-10-01')];
    expect(streakRun(days, '2026-10-09').map((d) => d.day)).toEqual(['2026-10-07', '2026-10-08']);
  });
});

describe('monthSuns', () => {
  it('draws the design’s October: suns, halves over the line, a miss, today and the rest', () => {
    const rows = [1, 2, 3, 5, 6, 7].map((d) => closed(`2026-10-0${d}`));
    rows.push(closed('2026-10-04', 250_000));
    const suns = monthSuns({
      month: '2026-10',
      today: '2026-10-09',
      closed: rows,
      since: '2026-10-01',
    });
    expect(suns.cells).toHaveLength(35);
    // 1 October is a Thursday: three blanks first.
    expect(suns.cells.slice(0, 3)).toEqual(['blank', 'blank', 'blank']);
    expect(suns.cells[3]).toBe('sun');
    expect(suns.cells[6]).toBe('half');
    expect(suns.cells[10]).toBe('miss');
    expect(suns.cells[11]).toBe('today');
    expect(suns.cells[12]).toBe('ahead');
    expect(suns.cells[34]).toBe('blank');
    expect(suns).toMatchObject({ closed: 7, under: 6 });
  });

  it('leaves days before the person started as still to come, not missed', () => {
    const suns = monthSuns({
      month: '2026-10',
      today: '2026-10-09',
      closed: [],
      since: '2026-10-08',
    });
    expect(suns.cells[9]).toBe('ahead');
    expect(suns.cells[10]).toBe('miss');
  });
});

describe('widgetHours', () => {
  it('turns six times a day around a close at six', () => {
    expect(widgetHours('18:00')).toEqual([7, 10, 13, 16.5, 18, 21]);
  });

  it('moves the close to where the person set it', () => {
    expect(widgetHours('19:30')).toEqual([7, 10, 13, 16.5, 19.5, 21]);
    expect(widgetHours('16:30')).toEqual([7, 10, 13, 16.5, 21]);
  });

  it('lets a close at or after nine take the night’s place', () => {
    expect(widgetHours('21:00')).toEqual([7, 10, 13, 16.5, 21]);
    expect(widgetHours('22:15')).toEqual([7, 10, 13, 16.5, 22.25]);
  });
});

describe('jarDay', () => {
  it('counts the Tết jar down to mùng 1', () => {
    const pot = { neededBy: '2027-02', season: 'newYear' as const };
    expect(jarDay(pot, '2026-10-09', 'tet')).toBe('2027-02-06');
    expect(daysUntil('2026-10-09', '2027-02-06')).toBe(120);
  });

  it('counts a dated jar down to the first of its month', () => {
    expect(jarDay({ neededBy: '2027-06' }, '2026-10-09', null)).toBe('2027-06-01');
  });

  it('has no day for a jar with no date', () => {
    expect(jarDay({ neededBy: null }, '2026-10-09', 'tet')).toBeNull();
  });

  it('never counts below nothing once the day has passed', () => {
    expect(daysUntil('2026-10-09', '2026-10-01')).toBe(0);
  });
});
