import { payCycleOn, type Income, type LocalDate, type Payday } from '@6pm/domain';

import type { MoneyStore } from './money-store';
import { readPlan, writePlan, type PlanSettings } from './plan-settings';
import { moveCycleRecords } from './pot-moves';

/**
 * "Make it last until": the day money that only lands is divided through, kept until it passes;
 * null goes back to the month's end. Reloads so every number moves with it.
 */
export function setLastUntil(store: MoneyStore, day: LocalDate | null): Promise<void> {
  return store.exclusive(async () => {
    const plan = await readPlan(store.db);
    if (plan === null) return;
    await writePlan(store.db, { ...plan, lastUntil: day });
    await store.loadInTurn(store.getSnapshot().today);
  });
}

/**
 * The answer to "How does money reach you?" asked again, from the card on Today or from Plan's
 * edit: the plan the answers make, saved as onboarding saves it (`planOfAnswers`). A salary on a
 * day it knows is the month as it always was, with no incomes; anything else holds its incomes,
 * counted from the day they were first set (months before were monthly and carry nothing over).
 * The month's anchor becomes the answers' own (the calendar month when no monthly pay leads), so
 * "End of month" is the same day it is for someone who answered when they joined; the month that
 * is running moves to the new anchor with what was recorded in it, as a new payday does.
 */
export function answerReach(
  store: MoneyStore,
  answer: {
    readonly income: number;
    readonly payday: Payday;
    readonly incomes: {
      readonly incomes: readonly Income[];
      readonly lastUntil: LocalDate | null;
      readonly work: boolean;
    } | null;
  },
): Promise<void> {
  return store.exclusive(async () => {
    const plan = await readPlan(store.db);
    if (plan === null) return;
    const snap = store.getSnapshot();
    const { today } = snap;
    const { incomes: _incomes, incomesFrom, lastUntil: _lastUntil, work, ...monthly } = plan;
    const made = answer.incomes;
    const next: PlanSettings =
      made === null
        ? { ...monthly, income: Math.max(0, Math.round(answer.income)), payday: answer.payday }
        : {
            ...monthly,
            income: Math.max(0, Math.round(answer.income)),
            payday: answer.payday,
            incomes: [...made.incomes],
            incomesFrom: incomesFrom ?? today,
            lastUntil: made.lastUntil,
            // Work of one's own keeps what was said about it (its mode, each bank's answer).
            ...(made.work ? { work: work ?? { mode: 'asItComes' as const } } : {}),
          };
    await store.db.withTransactionAsync(async () => {
      await writePlan(store.db, next);
      await moveCycleRecords(store.db, snap.cycle.start, payCycleOn(today, next.payday).start);
    });
    await store.loadInTurn(today);
  });
}
