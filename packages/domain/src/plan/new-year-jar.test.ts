import { describe, expect, it } from 'vitest';

import { dueJarFor } from '../close/jar-match';
import { currencyOf } from '../money/currency';
import { bonusSplit, looksLikeBonus, moneyInAsk } from '../spend/money-in';
import { newYearWindow } from '../time/lunar';
import { dailyNumber, type DailyNumberInput } from './daily-number';
import {
  isNewYearJar,
  newYearArmedJar,
  newYearAskOptions,
  newYearJarGoal,
  newYearJarOf,
  newYearJarRow,
  newYearOffer,
  newYearTradition,
  NEW_YEAR_ASK_START,
} from './new-year-jar';
import { newYearRecap } from './new-year-recap';
import { payCycleOn } from './pay-cycle';
import { futureYouPotRow, newJarLocked } from './pots';

const window2027 = newYearWindow(2027, 'tet');
if (window2027 === null) throw new Error('2027 is in the table');
const tetJar = newYearJarRow({
  id: 'tet',
  name: 'Tết',
  goal: 5_000_000,
  window: window2027,
  createdAt: '2026-12-01T03:00:00.000Z',
});

describe('who keeps a Lunar New Year', () => {
  it('is Tết for a home in đồng or a phone in Vietnam, whatever the language', () => {
    expect(newYearTradition({ currency: 'VND', region: 'US', language: 'en' })).toBe('tet');
    expect(newYearTradition({ currency: 'USD', region: 'VN', language: 'ko' })).toBe('tet');
  });

  it('is Seollal in Korean and the Spring Festival in Simplified Chinese, and nothing otherwise', () => {
    expect(newYearTradition({ currency: 'KRW', region: 'KR', language: 'ko' })).toBe('seollal');
    expect(newYearTradition({ currency: 'CNY', region: 'CN', language: 'zh-Hans' })).toBe(
      'chunjie',
    );
    expect(newYearTradition({ currency: 'USD', region: 'US', language: 'en' })).toBeNull();
    expect(newYearTradition({ currency: 'KRW', region: 'KR', language: 'en' })).toBeNull();
  });
});

describe('the Tết jar', () => {
  it('builds its goal from three taps: 3tr lì xì, 2tr gifts home and 2tr for the trip is 7tr', () => {
    expect(newYearJarGoal(NEW_YEAR_ASK_START)).toBe(7_000_000);
    expect(newYearJarGoal({ lixi: 2, gifts: 2, trip: 0 })).toBe(8_000_000);
    expect(newYearAskOptions('trip')).toEqual([0, 1_000_000, 2_000_000]);
    expect(newYearAskOptions('lixi', currencyOf('KRW')).every((n) => n > 0)).toBe(true);
  });

  it('fills by mùng 1’s month and is marked as the season’s', () => {
    expect(tetJar).toMatchObject({ neededBy: '2027-02', season: 'newYear', kind: 'occasion' });
    expect(isNewYearJar(tetJar)).toBe(true);
    expect(newYearJarOf([futureYouPotRow('2026-11-01T00:00:00.000Z'), tetJar])?.id).toBe('tet');
    expect(newYearJarOf([{ ...tetJar, archivedAt: '2027-03-01T00:00:00.000Z' }])).toBeNull();
  });

  it('does not count against the free jars', () => {
    const own = ['a', 'b', 'c'].map((id) => ({ ...tetJar, id, season: null }));
    expect(newJarLocked([...own.slice(0, 2), tetJar], false)).toBe(false);
    expect(newJarLocked(own, false)).toBe(true);
  });
});

describe('the Tết jar offer', () => {
  const offer = (today: string, extra: Partial<Parameters<typeof newYearOffer>[0]> = {}) =>
    newYearOffer({ today, tradition: 'tet', pots: [], laterUntil: null, ...extra });

  it('nobody gets one by default: the card shows from 1 December to the day before the season', () => {
    expect(offer('2026-11-30')?.card).toBe(false);
    expect(offer('2026-12-01')?.card).toBe(true);
    expect(offer('2027-01-29')?.card).toBe(true);
    expect(offer('2027-01-30')).toBeNull();
  });

  it('is offered at onboarding once mùng 1 is ten weeks away', () => {
    expect(offer('2026-11-27')?.onboarding).toBe(false);
    expect(offer('2026-11-28')?.onboarding).toBe(true);
  });

  it('waits after Later, and stops once the season’s jar exists', () => {
    expect(offer('2026-12-10', { laterUntil: '2026-12-31' })?.card).toBe(false);
    expect(offer('2026-12-31', { laterUntil: '2026-12-31' })?.card).toBe(true);
    expect(offer('2026-12-10', { pots: [tetJar] })).toBeNull();
    // Last season's jar does not stand in for this one.
    expect(offer('2027-12-10', { pots: [tetJar] })?.card).toBe(true);
  });

  it('is never offered to someone who keeps no Lunar New Year', () => {
    expect(offer('2026-12-10', { tradition: null })).toBeNull();
  });
});

describe('the close asks about the Tết jar by itself in the season', () => {
  const lixi = { day: '2027-02-06', amount: 1_000_000 };
  const options = (armed: Set<string>) => ({ travelling: false, armed, season: window2027 });

  it('arms the jar from 23 tháng Chạp to mùng 6, until a No in that season', () => {
    const arm = (day: string, declinedOn: Record<string, string> = {}) =>
      newYearArmedJar({ pots: [tetJar], day, window: window2027, declinedOn })?.id ?? null;
    expect(arm('2027-01-29')).toBeNull();
    expect(arm('2027-01-30')).toBe('tet');
    expect(arm('2027-02-11')).toBe('tet');
    expect(arm('2027-02-12')).toBeNull();
    expect(arm('2027-02-06', { tet: '2027-02-03' })).toBeNull();
    expect(arm('2027-02-06', { tet: '2027-01-20' })).toBe('tet');
  });

  it('asks about a lì xì on mùng 1, a month the jar is not dated for', () => {
    const jan = { ...tetJar, neededBy: '2027-01' };
    expect(dueJarFor(lixi, [jan], { tet: 3_000_000 }, options(new Set(['tet'])))?.id).toBe('tet');
    expect(dueJarFor(lixi, [jan], { tet: 3_000_000 }, options(new Set()))).toBeNull();
    expect(
      dueJarFor(
        { ...lixi, day: '2027-02-20' },
        [jan],
        { tet: 3_000_000 },
        options(new Set(['tet'])),
      ),
    ).toBeNull();
  });
});

describe('the Tết bonus', () => {
  const cycle = payCycleOn('2027-01-25', { kind: 'sameDay', day: 31 });
  const bonus = { day: '2027-01-25', amount: 9_000_000, merchant: 'Công ty ABC' };
  const season = { window: window2027, jar: { id: 'tet', goal: 5_000_000, held: 3_000_000 } };

  it('a 9tr bonus on 25 Jan, income 15tr, a 5tr jar holding 3tr: 2tr to the jar, 7tr spread', () => {
    expect(moneyInAsk(bonus, { income: 15_000_000, cycle, spends: [], season })).toEqual({
      kind: 'bonus',
      jarId: 'tet',
      toJar: 2_000_000,
    });
    expect(bonusSplit(9_000_000, season.jar)).toEqual({ toJar: 2_000_000, rest: 7_000_000 });
  });

  it('raises today’s number by the spread’s share only', () => {
    const base: DailyNumberInput = {
      plan: {
        income: 15_000_000,
        bills: 4_000_000,
        futureYou: 2_000_000,
        occasions: 1_000_000,
        topUps: 0,
      },
      spentBefore: 3_000_000,
      today: [],
      notDaily: new Set(),
      daysLeft: 6,
    };
    const before = dailyNumber(base).line;
    // Spread, with the jar's 2tr taken back out as its top-up.
    const after = dailyNumber({
      ...base,
      moneyIn: 9_000_000,
      plan: { ...base.plan, topUps: 2_000_000 },
    }).line;
    expect(after - before).toBe(1_000_000);
  });

  it('is asked from 15 December to mùng 6, by its size or its words', () => {
    const ctx = { income: 15_000_000, ...season };
    expect(looksLikeBonus({ ...bonus, day: '2026-12-14' }, ctx)).toBe(false);
    expect(looksLikeBonus({ ...bonus, day: '2026-12-15' }, ctx)).toBe(true);
    expect(looksLikeBonus({ ...bonus, day: '2027-02-12' }, ctx)).toBe(false);
    const small = { ...bonus, amount: 3_000_000 };
    expect(looksLikeBonus(small, ctx)).toBe(false);
    expect(looksLikeBonus({ ...small, memo: 'THUONG TET 2027' }, ctx)).toBe(true);
    expect(looksLikeBonus({ ...small, memo: 'Lương tháng 13' }, ctx)).toBe(true);
    // Thương is a name; thưởng is a bonus.
    expect(looksLikeBonus({ ...small, merchant: 'Thương Nguyễn' }, ctx)).toBe(false);
    expect(looksLikeBonus({ ...small, note: 'thưởng' }, ctx)).toBe(true);
  });

  it('is not asked without a jar still missing something', () => {
    const ctx = { income: 15_000_000, window: window2027 };
    expect(looksLikeBonus(bonus, { ...ctx, jar: null })).toBe(false);
    expect(
      looksLikeBonus(bonus, { ...ctx, jar: { id: 'tet', goal: 5_000_000, held: 5_000_000 } }),
    ).toBe(false);
    expect(moneyInAsk(bonus, { income: 15_000_000, cycle, spends: [] })).toBeNull();
  });

  it('keeps the pay first, unless the memo names the bonus', () => {
    const payday = payCycleOn('2027-01-31', { kind: 'sameDay', day: 31 });
    const pay = { ...bonus, day: '2027-01-31', amount: 15_000_000 };
    expect(moneyInAsk(pay, { income: 15_000_000, cycle: payday, spends: [], season })?.kind).toBe(
      'pay',
    );
    expect(
      moneyInAsk(
        { ...pay, memo: 'THUONG TET' },
        { income: 15_000_000, cycle: payday, spends: [], season },
      )?.kind,
    ).toBe('bonus');
  });
});

describe('the Tết recap', () => {
  it('counts lì xì given and received, the jar used and the days inside the number', () => {
    const spend = {
      status: 'kept',
      categoryId: 'lixi',
      direction: null,
      fromPot: null,
      fromPotAmount: null,
    };
    const recap = newYearRecap({
      window: window2027,
      today: '2027-02-12',
      lixiCategoryId: 'lixi',
      jar: { id: 'tet', left: 400_000 },
      spends: [
        { ...spend, day: '2027-02-06', amount: 1_000_000, envelopes: 5, fromPot: 'tet' },
        {
          ...spend,
          day: '2027-02-07',
          amount: 1_600_000,
          envelopes: 7,
          fromPot: 'tet',
          fromPotAmount: 1_600_000,
        },
        { ...spend, day: '2027-02-06', amount: 700_000, envelopes: 7, direction: 'in' as const },
        { ...spend, day: '2027-01-20', amount: 500_000, envelopes: 2 },
        { ...spend, day: '2027-02-08', amount: 90_000, categoryId: 'food', fromPot: 'tet' },
        { ...spend, day: '2027-02-08', amount: 200_000, status: 'skipped' },
      ],
      closedDays: [
        { day: '2027-01-30', spent: 200_000, line: 300_000 },
        { day: '2027-01-31', spent: 400_000, line: 300_000 },
        { day: '2027-02-06', spent: 0, line: 300_000 },
      ],
    });
    expect(recap.given).toEqual({ envelopes: 12, amount: 2_600_000 });
    expect(recap.received).toEqual({ envelopes: 7, amount: 700_000 });
    expect(recap.jar).toEqual({
      id: 'tet',
      used: 2_690_000,
      held: 3_090_000,
      share: 2_690_000 / 3_090_000,
    });
    expect(recap.daysInside).toBe(2);
    expect(recap.days).toBe(13);
  });
});
