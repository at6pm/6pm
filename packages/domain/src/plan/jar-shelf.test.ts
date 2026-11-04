import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import {
  futureYouResume,
  jarShelfState,
  jarsEachPayday,
  lineWithFutureYou,
  lineWithSetAside,
  newJarMonths,
  sliceShareOf,
  steadyChoices,
} from './jar-shelf';
import { payCycleOn } from './pay-cycle';
import { FUTURE_YOU_POT_ID, intoJarsEachPayday } from './pots';

const cycle = payCycleOn('2026-10-09', { kind: 'lastDay' });

const fy = { id: FUTURE_YOU_POT_ID, kind: 'goal' as const, neededBy: null, monthly: null };
const tet = { id: 'tet', kind: 'occasion' as const, neededBy: '2027-02', monthly: null };
const rainy = { id: 'rainy', kind: 'occasion' as const, neededBy: null, monthly: 400_000 };
const bike = { id: 'bike', kind: 'occasion' as const, neededBy: null, monthly: null };
const phone = { id: 'phone', kind: 'goal' as const, neededBy: null, monthly: null };

function input(over: Partial<DailyNumberInput['plan']> = {}): DailyNumberInput {
  return {
    plan: {
      income: 17_400_000,
      bills: 4_000_000,
      futureYou: 2_100_000,
      occasions: 1_400_000,
      topUps: 0,
      ...over,
    },
    spentBefore: 2_000_000,
    today: [],
    notDaily: new Set(),
    daysLeft: 22,
  };
}

describe('jarsEachPayday', () => {
  it('gives Future you the slice less what the 2.1 goals take, and the others their set-aside', () => {
    const setAside = {
      [FUTURE_YOU_POT_ID]: 1_800_000,
      tet: 1_000_000,
      rainy: 400_000,
      phone: 300_000,
    };
    const each = jarsEachPayday({
      pots: [fy, tet, rainy, bike, phone],
      setAside,
      slice: 2_100_000,
    });
    expect(each).toEqual({
      [FUTURE_YOU_POT_ID]: 1_800_000,
      tet: 1_000_000,
      rainy: 400_000,
      bike: 0,
      phone: 300_000,
    });
  });

  it('adds up to the plan line', () => {
    const pots = [fy, tet, rainy, bike, phone];
    const setAside = { tet: 1_000_000, rainy: 400_000, phone: 300_000 };
    const each = jarsEachPayday({ pots, setAside, slice: 2_100_000 });
    const sum = Object.values(each).reduce((a, b) => a + b, 0);
    expect(sum).toBe(intoJarsEachPayday(2_100_000, pots, setAside));
  });

  it('gives Future you nothing in a cycle that skips its slice', () => {
    expect(jarsEachPayday({ pots: [fy], setAside: {}, slice: 0 })[FUTURE_YOU_POT_ID]).toBe(0);
  });
});

describe('jarShelfState', () => {
  const base = { cycle, futureYou: 2_100_000, spentFrom: false };
  const dalat = { id: 'dalat', goal: 6_000_000, neededBy: '2026-09', paused: false };

  it('pauses Future you when it has no slice this month', () => {
    expect(
      jarShelfState({ ...base, pot: { ...fy, goal: 0, paused: false }, saved: 0, futureYou: 0 }),
    ).toBe('paused');
    expect(jarShelfState({ ...base, pot: { ...fy, goal: 0, paused: false }, saved: 5 })).toBe(
      'normal',
    );
  });

  it('is past its date when the month went by before it filled', () => {
    expect(jarShelfState({ ...base, pot: dalat, saved: 4_800_000 })).toBe('pastDate');
    expect(
      jarShelfState({ ...base, pot: { ...dalat, neededBy: '2026-10' }, saved: 4_800_000 }),
    ).toBe('normal');
  });

  it('is full at its target, and full wins over a date gone by', () => {
    expect(jarShelfState({ ...base, pot: dalat, saved: 6_000_000 })).toBe('full');
  });

  it('is spent to empty only when spends took it to nothing', () => {
    expect(jarShelfState({ ...base, pot: dalat, saved: 0, spentFrom: true })).toBe('empty');
    expect(jarShelfState({ ...base, pot: { ...dalat, neededBy: null }, saved: 0 })).toBe('normal');
  });

  it('pauses a paused jar', () => {
    expect(jarShelfState({ ...base, pot: { ...dalat, paused: true }, saved: 1 })).toBe('paused');
  });
});

describe('today’s line with a change', () => {
  it('is today’s line when nothing changes', () => {
    const i = input();
    expect(lineWithFutureYou(i, 2_100_000)).toBe(dailyNumber(i).line);
    expect(lineWithSetAside(i, 0)).toBe(dailyNumber(i).line);
  });

  it('drops by the set-aside spread over the days left, today included', () => {
    // 7.9tr free over 23 days, then 4.4tr.
    expect(lineWithSetAside(input(), 0)).toBe(343_000);
    expect(lineWithSetAside(input(), 3_500_000)).toBe(191_000);
  });

  it('follows the slice, and holds still in a cycle that starts Future you at payday', () => {
    expect(lineWithFutureYou(input(), 1_100_000)).toBe(386_000);
    expect(lineWithFutureYou({ ...input(), futureYouSkipped: true }, 0)).toBe(
      dailyNumber({ ...input(), futureYouSkipped: true }).line,
    );
  });

  it('never reads below zero', () => {
    expect(lineWithSetAside(input(), 50_000_000)).toBe(0);
  });
});

describe('the slice', () => {
  it('says the slice as a percent of the pay', () => {
    expect(sliceShareOf(2_100_000, 17_400_000)).toBe(12);
    expect(sliceShareOf(2_100_000, 0)).toBe(0);
  });

  it('resumes at 12% of the pay on a notch', () => {
    expect(futureYouResume(17_400_000)).toBe(2_000_000);
    expect(futureYouResume(1_000_000)).toBe(250_000);
  });
});

describe('New jar choices', () => {
  it('offers the four months after the cycle’s', () => {
    expect(newJarMonths(cycle, 4)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });

  it('offers steady amounts worth the design’s in any currency', () => {
    expect(steadyChoices()).toEqual([200_000, 500_000, 1_000_000, 2_000_000]);
    for (const n of steadyChoices(currencyOf('USD'))) expect(n).toBeGreaterThan(0);
  });
});
