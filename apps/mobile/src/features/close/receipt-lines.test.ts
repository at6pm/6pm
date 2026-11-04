import { describe, expect, it } from '@jest/globals';

import { sumCounted, sumDayPart, type SpendRow } from '@6pm/domain';

import { receiptSpends } from './receipt-lines';

const stamp = '2026-10-11T03:00:00.000Z';
const spend = (id: string, patch: Partial<SpendRow>): SpendRow => ({
  id,
  day: '2026-10-11',
  at: `2026-10-11T0${id.length}:00:00.000Z`,
  amount: 10_000,
  categoryId: 'food',
  merchant: id,
  note: null,
  source: 'manual',
  status: 'kept',
  previousStatus: null,
  wallet: null,
  forWork: false,
  detail: null,
  foreignAmount: null,
  createdAt: stamp,
  updatedAt: stamp,
  ...patch,
});

describe('receiptSpends', () => {
  const notDaily = new Set(['rent']);
  const day = [
    spend('a', { amount: 45_000 }),
    spend('bb', { amount: 3_000_000, categoryId: 'rent' }),
    spend('ccc', { amount: 120_000, forWork: true }),
    spend('dddd', { amount: 20_000, status: 'skipped' }),
    spend('eeeee', { amount: 9_000, day: '2026-10-10' }),
  ];

  it('prints only what counts, so the lines add up to the total', () => {
    const { lines, claimBack } = receiptSpends(day, '2026-10-11', notDaily);
    expect(lines.map((s) => s.id)).toEqual(['a']);
    expect(claimBack?.id).toBe('ccc');
    const total = sumCounted(
      day
        .filter((s) => s.day === '2026-10-11')
        .map((s) => ({
          amount: s.amount,
          category: s.categoryId,
          status: s.status,
          forWork: s.forWork,
        })),
      notDaily,
    );
    expect(lines.reduce((sum, s) => sum + s.amount, 0)).toBe(total);
  });

  it('is empty on a day with nothing kept', () => {
    expect(receiptSpends([], '2026-10-11', notDaily)).toEqual({
      lines: [],
      jars: [],
      claimBack: null,
    });
  });

  it('prints a spend from a jar in full and takes the jar’s part off, so lines meet the total', () => {
    const withJar = [
      spend('a', { amount: 45_000 }),
      spend('hotel', { amount: 1_200_000, fromPot: 'dalat', fromPotAmount: 1_200_000 }),
      spend('flight', { amount: 7_000_000, fromPot: 'dalat', fromPotAmount: 6_000_000 }),
    ];
    const { lines, jars } = receiptSpends(withJar, '2026-10-11', notDaily);
    expect(lines.map((s) => s.amount)).toEqual([45_000, 1_200_000, 7_000_000]);
    expect(jars).toEqual([{ potId: 'dalat', amount: 7_200_000 }]);
    const counted = lines.map((s) => ({ ...s, category: s.categoryId }));
    const printed = sumCounted(counted, notDaily) - jars.reduce((sum, j) => sum + j.amount, 0);
    // What the day's number counted: 45k and the 1tr the jar could not cover.
    expect(printed).toBe(sumDayPart(counted, notDaily));
    expect(printed).toBe(1_045_000);
  });
});
