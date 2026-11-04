import {
  cycleFutureYou,
  goalMonthly,
  jarFillOf,
  type AskContext,
  type AskLedger,
  type AskPot,
  type PotRow,
  type SpendRow,
} from '@6pm/domain';

import { dailyInputOf, dayOf, type MoneySnapshot } from '../../data/money-store';
import type { I18n } from '../../i18n/i18n';
import { homeCurrencyOf } from '../../money/use-money-format';
import { jarName } from '../pots/jar-name';
import { insightInputOf, previousCycleStartOf } from '../wording/insight-input';

/**
 * What goes into a jar each payday, as Ask counts a pace from: Future you and a dated jar what this
 * cycle set aside, a 2.1 goal its share of the slice, a steady jar its amount, and a jar filled
 * only by hand (or paused) nothing.
 */
function eachPayday(snap: MoneySnapshot, pot: PotRow): number {
  if (pot.paused) return 0;
  switch (jarFillOf(pot)) {
    case 'futureYou':
    case 'date':
      return snap.setAsideThisCycle[pot.id] ?? 0;
    case 'slice':
      return goalMonthly(snap.plan?.futureYou ?? 0, pot.share ?? 0);
    case 'steady':
      return pot.monthly ?? 0;
    case 'byHand':
      return 0;
  }
}

/**
 * Each jar by the name the person sees, what it holds, its target and what goes in each payday.
 * Jars with a target come first: "when is it full?" with no jar named means one that can fill,
 * not Future you's, which has none unless one was set.
 */
function askPots(snap: MoneySnapshot, t: I18n['t']): AskPot[] {
  const pots = snap.pots.map((pot) => ({
    name: jarName(pot, t),
    goal: pot.goal,
    saved: snap.potSaved[pot.id] ?? 0,
    monthly: eachPayday(snap, pot),
  }));
  return [...pots.filter((p) => p.goal > 0), ...pots.filter((p) => p.goal <= 0)];
}

/**
 * What an answer is worked out from: today's one number, the days left, payday, Future you and
 * the jars, all read from the store as it stands now. Null before the month is set up. `t` names
 * Future you's jar in the phone's language.
 */
export function askContextOf(snap: MoneySnapshot, t: I18n['t']): AskContext | null {
  const input = dailyInputOf(snap);
  const day = dayOf(snap);
  if (input === null || day === null || snap.plan === null) return null;
  return {
    today: snap.today,
    day,
    daysLeft: snap.cycle.daysLeft,
    payday: snap.cycle.payday,
    futureYou: snap.plan.futureYou,
    futureYouThisCycle: cycleFutureYou(input),
    share: input.share ?? 1,
    pots: askPots(snap, t),
    currency: homeCurrencyOf(snap.plan),
  };
}

/**
 * The user's own records an answer may read: this cycle's spends and the waiting ones from the
 * store, plus the previous cycle's (`earlier`), which the store does not hold.
 */
export function askLedgerOf(snap: MoneySnapshot, earlier: readonly SpendRow[]): AskLedger {
  const input = insightInputOf(snap, dayOf(snap) ?? ZERO_DAY, earlier);
  const previousCycleStart = previousCycleStartOf(snap);
  return {
    cycleStart: snap.cycle.start,
    previousCycleStart,
    since: previousCycleStart ?? snap.cycle.start,
    spends: input.spends,
    closed: input.closed,
    categories: snap.categories.map((c) => ({ id: c.id, name: c.name })),
    notDaily: input.notDaily,
    bills: input.bills,
    pots: input.pots,
  };
}

/** Only the ledger's spends and records are read; a day before set-up has nothing to count. */
const ZERO_DAY = {
  startFree: 0,
  line: 0,
  spent: 0,
  free: 0,
  safe: 0,
  tomorrow: 0,
  replan: false,
  overspent: false,
} as const;
