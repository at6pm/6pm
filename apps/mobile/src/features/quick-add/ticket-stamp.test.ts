import { describe, expect, it } from '@jest/globals';

import { coveredDate, ticketStamp } from './ticket-stamp';

const evening = new Date(2026, 10, 14, 18, 7);

describe('ticketStamp', () => {
  it('writes the Vietnamese date in numbers, so the header fits one line', () => {
    expect(ticketStamp(evening, 'vi')).toBe('T7 14/11 · 18:07');
  });

  it('keeps each other language’s own short date', () => {
    expect(ticketStamp(evening, 'en')).toMatch(/^Sat,? 14 Nov · 18:07$/);
  });
});

describe('coveredDate', () => {
  it('names the weekday and the day the money now covers', () => {
    expect(coveredDate('2026-12-31', 'en')).toMatch(/^THU,? 31 DEC$/);
    expect(coveredDate('2026-12-31', 'vi')).toBe('THỨ NĂM 31/12');
  });
});
