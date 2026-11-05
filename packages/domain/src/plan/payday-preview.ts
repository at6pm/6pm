import type { PotRow } from '../contracts/local-rows';
import { VND, type Currency, type Money } from '../money/currency';
import type { LocalDate } from '../time/local-date';
import { billsThisCycle, type CycleBill } from './bills';
import { dailyNumber } from './daily-number';
import { payCycleOn, type Payday } from './pay-cycle';
import { FUTURE_YOU_POT_ID, intoJarsEachPayday, occasionsOf, potSetAside } from './pots';

/** What payday's notification says: what goes into the jars, and the line it leaves each day. */
export interface PaydayPreview {
  /** Everything that goes into jars on the payday: Future you's slice and each jar's set-aside. */
  readonly jars: Money;
  /** The new cycle's first line, with nothing spent yet. */
  readonly daily: Money;
  /** The payday after it: the day the line runs to. */
  readonly until: LocalDate;
}

/**
 * The coming payday as the plan will count it: a new cycle starting that day, each jar setting
 * aside what it will take then (from what it holds now), bills that still come off in it, and
 * the free money left spread over the cycle's days. No money in and no spending yet.
 */
export function paydayPreview(input: {
  /** The payday the new cycle starts on. */
  readonly payday: LocalDate;
  readonly rule: Payday;
  readonly income: Money;
  readonly futureYou: Money;
  readonly bills: readonly CycleBill[];
  readonly pots: readonly Pick<
    PotRow,
    'id' | 'kind' | 'goal' | 'neededBy' | 'share' | 'paused' | 'monthly' | 'archivedAt'
  >[];
  /** What each jar holds now: what it will have before the payday's set-aside. */
  readonly saved: Readonly<Record<string, Money>>;
  readonly currency?: Currency;
}): PaydayPreview {
  const { income, futureYou, currency = VND } = input;
  const cycle = payCycleOn(input.payday, input.rule);
  const pots = input.pots.filter((p) => p.archivedAt === null);
  const setAside: Record<string, Money> = {};
  for (const pot of pots) {
    if (pot.id === FUTURE_YOU_POT_ID) continue;
    setAside[pot.id] = potSetAside({
      pot,
      savedBefore: input.saved[pot.id] ?? 0,
      futureYou,
      cycle,
      currency,
    });
  }
  const occasions = occasionsOf(pots, setAside);
  const day = dailyNumber({
    plan: {
      income,
      bills: billsThisCycle(input.bills, cycle),
      futureYou,
      occasions,
      topUps: 0,
    },
    spentBefore: 0,
    today: [],
    notDaily: new Set(),
    daysLeft: cycle.daysLeft,
    currency,
  });
  return {
    jars: intoJarsEachPayday(futureYou, pots, setAside),
    daily: day.line,
    until: cycle.payday,
  };
}
