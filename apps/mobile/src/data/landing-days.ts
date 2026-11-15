import { futureYouIn, joinedCycle, landingDays, occasionsOf, type LandingDays } from '@6pm/domain';

import { dayOf, periodOf, type MoneySnapshot } from './money-store';
import { joinedAnswersOf } from './plan-settings';

/**
 * Days a landing of `amount` adds, for someone whose money only lands and whose day is at its cap
 * (`landingDays`): Quick add's "+5 days · covered to …" and the close's code match (7d). Null for
 * anyone else, and while the day is below its cap (then the money raises the day instead).
 */
export function landingDaysOf(snap: MoneySnapshot, amount: number): LandingDays | null {
  const { plan } = snap;
  if (plan === null || amount <= 0) return null;
  const period = periodOf(snap);
  const day = dayOf(snap);
  if (period === null || day === null || period.kind !== 'landed') return null;
  const joined = joinedCycle(snap.cycle, joinedAnswersOf(plan));
  return landingDays({
    day: snap.today,
    pool: day.startFree,
    line: day.line,
    cycle: snap.cycle,
    anchor: plan.payday,
    bills: snap.bills,
    jars: futureYouIn(plan.futureYou, joined) + occasionsOf(snap.pots, snap.setAsideThisCycle),
    amount,
    cap: period.cap,
  });
}
