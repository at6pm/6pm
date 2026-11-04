import { describe, expect, it } from '@jest/globals';

import {
  dailyNumber,
  FUTURE_YOU_POT_ID,
  joinedShare,
  payCycleOn,
  type BillRow,
  type PotRow,
  type SpendRow,
} from '@6pm/domain';

import { dayOf, NO_JAR_FIELDS, type MoneySnapshot } from '../../data/money-store';
import {
  billViews,
  newPotLocked,
  occasionsMonthly,
  planJarsOf,
  planSplitOf,
  riverOf,
  potMonthAt,
} from './plan-view';

const today = '2026-10-09';
const cycle = payCycleOn(today, { kind: 'sameDay', day: 31 });
const at = '2026-10-01T00:00:00.000Z';

const bill = (id: string, amount: number, dueDay: number, paid: boolean): BillRow => ({
  id,
  name: id,
  icon: 'home',
  hue: 30,
  amount,
  dueDay,
  paidCycle: paid ? cycle.start : null,
  sort: 0,
  archivedAt: null,
  kind: 'other',
  lastMonth: null,
  paidAmount: null,
  askedCycle: null,
});

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

const spendRow = (
  id: string,
  day: string,
  amount: number,
  extra: Partial<SpendRow> = {},
): SpendRow => ({
  id,
  day,
  at: `${day}T05:00:00.000Z`,
  amount,
  categoryId: 'food',
  merchant: 'Phở Thìn',
  note: null,
  source: 'manual',
  status: 'kept',
  previousStatus: null,
  wallet: null,
  forWork: false,
  detail: null,
  foreignAmount: null,
  createdAt: at,
  updatedAt: at,
  ...extra,
});

/** The prototype's Friday: four bills (rent and phone paid), two goals, three occasions. */
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
  cycle,
  categories: [],
  cycleSpends: [],
  waitingBefore: [],
  bills: [
    bill('rent', 3_500_000, 1, true),
    bill('phone', 100_000, 3, true),
    bill('net', 220_000, 12, false),
    bill('power', 380_000, 15, false),
  ],
  pots: [
    pot({ id: 'japan', kind: 'goal', goal: 6_000_000, share: 0.6, neededBy: '2027-03' }),
    pot({ id: 'cushion', kind: 'goal', goal: 15_000_000, share: 0.4 }),
    pot({ id: 'tet', kind: 'occasion', goal: 3_000_000, neededBy: '2027-02' }),
    pot({ id: 'wedding', kind: 'occasion', goal: 500_000, neededBy: '2026-10' }),
    pot({ id: 'dalat', kind: 'occasion', goal: 4_000_000, neededBy: '2027-01' }),
  ],
  potSaved: { japan: 3_600_000, cushion: 5_000_000, tet: 1_200_000, wedding: 500_000 },
  topUpsThisCycle: 0,
  setAsideThisCycle: {
    japan: 1_200_000,
    cushion: 800_000,
    tet: 450_000,
    wedding: 0,
    dalat: 1_350_000,
  },
  closedDays: [],
  ...NO_JAR_FIELDS,
};

describe('plan view', () => {
  it('reads the bills against the cycle: paid ones, days to go, place on the line', () => {
    const views = billViews(snap);
    expect(views.map((v) => v.paid)).toEqual([true, true, false, false]);
    expect(views[2]).toMatchObject({ due: '2026-10-12', inDays: 3 });
    expect(views[0]?.inDays).toBe(-8);
    expect(views[2]?.position).toBeCloseTo(11 / 30);
  });

  it('builds the river so it adds up to the income', () => {
    const day = dailyNumber({
      plan: {
        income: 17_400_000,
        bills: 4_200_000,
        futureYou: 2_000_000,
        occasions: 1_800_000,
        topUps: 0,
      },
      spentBefore: 2_365_000,
      today: [],
      notDaily: new Set(),
      daysLeft: cycle.daysLeft,
    });
    const river = riverOf(snap, day, { goal: 0, occasion: 0 });
    expect(river.bills).toBe(4_200_000);
    expect(river.before).toBe(0);
    expect(river.spent).toBe(2_365_000);
    expect(Object.values(river).reduce((a, b) => a + b, 0)).toBe(17_400_000);
  });

  it('shows the free money gone before joining as its own segment', () => {
    const joined: MoneySnapshot = {
      ...snap,
      plan: snap.plan && { ...snap.plan, startedOn: '2026-10-16' },
    };
    const share = joinedShare(cycle, '2026-10-16');
    const day = dailyNumber({
      plan: {
        income: 17_400_000,
        bills: 4_200_000,
        futureYou: 2_000_000,
        occasions: 1_800_000,
        topUps: 0,
      },
      spentBefore: 0,
      today: [],
      notDaily: new Set(),
      daysLeft: cycle.daysLeft,
      share,
    });
    const river = riverOf(joined, day, { goal: 0, occasion: 0 });
    expect(river.before).toBeGreaterThan(0);
    expect(river.spent).toBe(0);
    expect(Object.values(river).reduce((a, b) => a + b, 0)).toBe(17_400_000);
  });

  it('splits the snapshot with the same input as Today, so Plan shows Today’s line', () => {
    const spent: MoneySnapshot = {
      ...snap,
      cycleSpends: [
        spendRow('a', '2026-10-03', 900_000),
        spendRow('b', '2026-10-09', 120_000),
        spendRow('c', '2026-10-05', 1_200_000, { fromPot: 'dalat', fromPotAmount: 1_200_000 }),
      ],
    };
    const split = planSplitOf(spent);
    expect(split?.line).toBe(dayOf(spent)?.line);
    expect(split?.days.find((d) => d.day === '2026-10-03')?.spent).toBe(900_000);
    // What a jar covered stays out of the day, as it does in the number.
    expect(split?.days.find((d) => d.day === '2026-10-05')?.spent).toBe(0);
    expect(split?.maths.find((r) => r.kind === 'spentBefore')?.amount).toBe(-900_000);
  });

  it('says what each jar takes each payday, and the line they add up to', () => {
    const { jars, eachPayday } = planJarsOf(snap);
    expect(jars.map((j) => j.pot.id)).toEqual(snap.pots.map((p) => p.id));
    expect(jars.find((j) => j.pot.id === 'tet')?.each).toBe(450_000);
    expect(jars.find((j) => j.pot.id === 'wedding')?.state).toBe('full');
    expect(eachPayday).toBe(2_000_000 + occasionsMonthly(snap));
  });

  it('puts a template month the given months after the cycle, or no date', () => {
    expect(potMonthAt('2026-10', 24)).toBe('2028-10');
    expect(potMonthAt('2026-10', 3)).toBe('2027-01');
    expect(potMonthAt('2026-10', 0)).toBeNull();
  });

  it('keeps three jars of one’s own free, Future you never counting, and more behind Max', () => {
    const own = (n: number) =>
      Array.from({ length: n }, (_, k) =>
        pot({ id: `jar${k}`, kind: 'occasion', goal: 1_000_000 }),
      );
    const futureYou = pot({ id: FUTURE_YOU_POT_ID, kind: 'goal', goal: 0 });
    expect(newPotLocked([], false)).toBe(false);
    expect(newPotLocked([futureYou, ...own(2)], false)).toBe(false);
    expect(newPotLocked([futureYou, ...own(3)], false)).toBe(true);
    expect(newPotLocked([futureYou, ...own(3)], true)).toBe(false);
  });
});
