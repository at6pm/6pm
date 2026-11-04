import { describe, expect, it } from '@jest/globals';

import {
  FUTURE_YOU_POT_ID,
  futureYouPotRow,
  matching,
  payCycleOn,
  totalOf,
  type PotRow,
  type SpendRow,
} from '@6pm/domain';
import { t, type Language } from '@6pm/i18n';

import { NO_JAR_FIELDS, type MoneySnapshot } from '../../data/money-store';
import type { I18n } from '../../i18n/i18n';
import { askContextOf, askLedgerOf } from './ask-context';

const today = '2026-10-09';
const at = '2026-10-01T00:00:00.000Z';
const say =
  (language: Language): I18n['t'] =>
  (key, ...params) =>
    t(language, key, ...params);

const pot = (p: Partial<PotRow> & Pick<PotRow, 'id' | 'kind' | 'goal'>): PotRow => ({
  name: p.id,
  icon: 'celebration',
  hue: 20,
  neededBy: null,
  share: null,
  paused: false,
  createdAt: at,
  archivedAt: null,
  ...p,
});

const spend = (id: string, amount: number, more: Partial<SpendRow> = {}): SpendRow => ({
  id,
  day: '2026-10-08',
  at: '2026-10-08T05:00:00.000Z',
  amount,
  categoryId: 'food',
  merchant: id,
  note: null,
  source: 'cash',
  status: 'kept',
  previousStatus: null,
  wallet: null,
  forWork: false,
  detail: null,
  foreignAmount: null,
  createdAt: at,
  updatedAt: at,
  ...more,
});

const snap: MoneySnapshot = {
  today,
  plan: {
    income: 17_400_000,
    payday: { kind: 'sameDay', day: 31 },
    futureYou: 2_000_000,
    closeAt: '18:00',
    persona: 'cheeky',
    serious: false,
  },
  cycle: payCycleOn(today, { kind: 'sameDay', day: 31 }),
  categories: [],
  cycleSpends: [],
  waitingBefore: [],
  bills: [],
  pots: [
    { ...futureYouPotRow(at), name: 'Future you' },
    pot({ id: 'Japan', kind: 'goal', goal: 6_000_000, share: 0.6, neededBy: '2027-03' }),
    pot({ id: 'Tết', kind: 'occasion', goal: 3_000_000, neededBy: '2027-02' }),
    pot({ id: 'Phone', kind: 'occasion', goal: 8_000_000, monthly: 500_000 }),
    pot({ id: 'Rainy', kind: 'occasion', goal: 5_000_000 }),
    pot({ id: 'Paused', kind: 'occasion', goal: 1_000_000, neededBy: '2027-02', paused: true }),
  ],
  potSaved: { [FUTURE_YOU_POT_ID]: 4_000_000, Japan: 3_600_000, Tết: 1_200_000 },
  topUpsThisCycle: 0,
  setAsideThisCycle: { [FUTURE_YOU_POT_ID]: 800_000, Japan: 1_200_000, Tết: 450_000 },
  closedDays: [],
  ...NO_JAR_FIELDS,
};

describe('askContextOf', () => {
  it('reads today, payday, Future you and each jar with what goes in each payday', () => {
    const ctx = askContextOf(snap, say('en'));
    expect(ctx).toMatchObject({
      today,
      daysLeft: 22,
      payday: '2026-10-31',
      futureYou: 2_000_000,
      share: 1,
    });
    expect(ctx?.pots).toEqual([
      // A 2.1 goal still takes its share of the slice; a dated jar what this cycle set aside.
      { name: 'Japan', goal: 6_000_000, saved: 3_600_000, monthly: 1_200_000 },
      { name: 'Tết', goal: 3_000_000, saved: 1_200_000, monthly: 450_000 },
      { name: 'Phone', goal: 8_000_000, saved: 0, monthly: 500_000 },
      // Filled only by hand, or paused: nothing goes in by itself.
      { name: 'Rainy', goal: 5_000_000, saved: 0, monthly: 0 },
      { name: 'Paused', goal: 1_000_000, saved: 0, monthly: 0 },
      // Future you has no target, so "when is it full?" never means it unless it is named.
      { name: 'Future you', goal: 0, saved: 4_000_000, monthly: 800_000 },
    ]);
  });

  it('names Future you’s jar in the phone’s language, never by its row', () => {
    const ctx = askContextOf(
      { ...snap, pots: [{ ...futureYouPotRow(at), name: 'Future you' }] },
      say('vi'),
    );
    expect(ctx?.pots.map((p) => p.name)).toEqual([t('vi', 'pots.futureYou')]);
    expect(t('vi', 'pots.futureYou')).toBe('Tương lai');
  });

  it('carries the joined share of the cycle, so saving more costs only the part still to come', () => {
    // Set up on 9 October: 23 of the cycle's 32 days (30 Sep to 31 Oct) are still to come.
    const joined = askContextOf(
      { ...snap, plan: snap.plan && { ...snap.plan, startedOn: today } },
      say('en'),
    );
    expect(joined?.share).toBeCloseTo(23 / 32, 5);
  });

  it('has nothing to work from before the month is set up', () => {
    expect(askContextOf({ ...snap, plan: null }, say('en'))).toBeNull();
  });
});

describe('askLedgerOf', () => {
  it('counts a spend taken from a jar as spending, in full', () => {
    const ledger = askLedgerOf(
      {
        ...snap,
        cycleSpends: [
          spend('hotel', 1_200_000, { fromPot: 'Tết', fromPotAmount: 1_200_000 }),
          spend('lunch', 60_000),
        ],
      },
      [],
    );
    const range = { from: snap.cycle.start, to: today, preset: null };
    const spent = matching(ledger, range, { categoryId: null, merchant: null });
    expect(totalOf(range, spent).total).toBe(1_260_000);
  });
});
