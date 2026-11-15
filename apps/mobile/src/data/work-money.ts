import {
  addDays,
  isTakings,
  wageLedger,
  workLanded,
  workMonth,
  type ClosedDayRow,
  type LocalDate,
  type PayCycle,
  type PlacedPay,
  type SpendRow,
  type WageLedger,
  type WorkMonth,
  type WorkSetting,
} from '@6pm/domain';

import type { PlanSettings } from './plan-settings';

/** The part of a snapshot work is read from. */
interface WorkSnapshot {
  readonly today: LocalDate;
  readonly plan: PlanSettings | null;
  readonly cycle: PayCycle;
  readonly cycleSpends: readonly SpendRow[];
  readonly closedDays: readonly Pick<ClosedDayRow, 'day'>[];
}

/**
 * The plan's work, for someone who turned it on; null for everyone else, and for a plan that
 * does not hold its incomes (work lives among them), so nothing about them changes.
 */
export function workOf(snapshot: Pick<WorkSnapshot, 'plan'>): WorkSetting | null {
  const { plan } = snapshot;
  if (plan?.work === undefined || plan.incomes === undefined) return null;
  return plan.work;
}

/** The days of the snapshot that are closed. */
function closedOf(snapshot: WorkSnapshot): ReadonlySet<LocalDate> {
  return new Set(snapshot.closedDays.map((d) => d.day));
}

/**
 * What work kept this month through its closed days and that reached the person's days as it
 * came (`workLanded`): every close for someone taking it as it comes; for someone paying
 * themselves, the closes before the wage began (the switch takes effect at the next close).
 * Nothing with no work.
 */
export function workKeptOf(snapshot: WorkSnapshot): number {
  const work = workOf(snapshot);
  if (work === null) return 0;
  const closed = closedOf(snapshot);
  if (work.mode === 'asItComes') {
    return workLanded(snapshot.cycleSpends, closed, snapshot.cycle.start, snapshot.today);
  }
  const ledger = wageLedgerOf(snapshot);
  if (ledger === null) return 0;
  const before = addDays(ledger.since, -1);
  return workLanded(
    snapshot.cycleSpends,
    closed,
    snapshot.cycle.start,
    before < snapshot.today ? before : snapshot.today,
  );
}

/**
 * The wage someone paying themselves takes from the work this month (`wageLedger`): each wage
 * paid as far as what the shop kept reaches, what the shop still owes them, and what it holds.
 * Null for anyone not paying themselves.
 */
export function wageLedgerOf(snapshot: WorkSnapshot): WageLedger | null {
  const work = workOf(snapshot);
  const plan = snapshot.plan;
  if (work === null || work.mode !== 'payMyself' || plan?.incomes === undefined) return null;
  return wageLedger({
    incomes: plan.incomes,
    rows: snapshot.cycleSpends,
    closed: closedOf(snapshot),
    from: snapshot.cycle.start,
    to: snapshot.today,
    anchor: plan.payday,
  });
}

/** The wages someone paying themselves has been paid this month, on their days. */
export function wagesOf(snapshot: WorkSnapshot): PlacedPay[] {
  return [...(wageLedgerOf(snapshot)?.paid ?? [])];
}

/**
 * The rows money in is summed from: everything, but for someone with work on, their takings,
 * which reach the number only as what the work kept.
 */
export function moneyInRowsOf(snapshot: WorkSnapshot): readonly SpendRow[] {
  if (workOf(snapshot) === null) return snapshot.cycleSpends;
  return snapshot.cycleSpends.filter((s) => !isTakings(s));
}

/** The work's month to today, for Plan's Work card; null with no work. */
export function workMonthOf(snapshot: WorkSnapshot): WorkMonth | null {
  const work = workOf(snapshot);
  const plan = snapshot.plan;
  if (work === null || plan?.incomes === undefined) return null;
  return workMonth({
    rows: snapshot.cycleSpends,
    closed: closedOf(snapshot),
    from: snapshot.cycle.start,
    to: snapshot.today,
    work,
    incomes: plan.incomes,
    anchor: plan.payday,
  });
}
