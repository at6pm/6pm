import {
  cashTakingsId,
  isTakings,
  type ClosedDayRow,
  type DailyNumber,
  type LocalDate,
  type SpendRow,
} from '@6pm/domain';

import { dayOf, type MoneySnapshot } from './money-store';
import { workOf } from './work-money';

/** A closed day as the close is about to file it: only that it is closed counts here. */
function closingRow(day: LocalDate): ClosedDayRow {
  return {
    day,
    closedAt: new Date().toISOString(),
    late: false,
    spent: 0,
    line: 0,
    tomorrow: 0,
    note: null,
  };
}

/**
 * The snapshot with `day` counted as closed, as it will be once the close in progress files it:
 * what the day's work kept has landed (`workKeptOf` counts closed days only). Every number the
 * close shows (Today's takings' "a day from tomorrow", the receipt's Safe tomorrow, the reveal,
 * and the row the close files) is read from this, so they agree with each other and with Today
 * after the close. For anyone without work it changes nothing.
 */
export function withDayClosed(snapshot: MoneySnapshot, day: LocalDate): MoneySnapshot {
  if (snapshot.closedDays.some((d) => d.day === day)) return snapshot;
  return { ...snapshot, closedDays: [...snapshot.closedDays, closingRow(day)] };
}

/** The number of the day being closed, counted as the close will file it (`withDayClosed`). */
export function closingNumberOf(snapshot: MoneySnapshot, day: LocalDate): DailyNumber | null {
  return dayOf(withDayClosed(snapshot, day));
}

/**
 * What keeping a day's takings adds to each day from tomorrow, for someone who takes what work
 * keeps as it comes: tomorrow's line with the day closed and its takings kept (the caught
 * transfers, and `cash` as its one line), less tomorrow's line before. The plan counts it as a
 * landing: bills still open come first, and a line at its cap stays there. Nothing for someone
 * paying themselves a wage, whose work keeps what is above it.
 */
export function takingsPerDay(snapshot: MoneySnapshot, day: LocalDate, cash: number): number {
  const work = workOf(snapshot);
  if (work === null || work.mode !== 'asItComes') return 0;
  const open = snapshot.closedDays.filter((d) => d.day !== day);
  const before = dayOf({ ...snapshot, closedDays: open });
  const id = cashTakingsId(day);
  const rows = snapshot.cycleSpends
    .filter((s) => s.id !== id)
    .map((s): SpendRow => (s.day === day && isTakings(s) ? { ...s, status: 'kept' } : s));
  const now = new Date().toISOString();
  const typed: SpendRow[] =
    cash > 0
      ? [
          {
            id,
            day,
            at: now,
            amount: Math.round(cash),
            categoryId: snapshot.categories[0]?.id ?? 'cash',
            merchant: '',
            note: null,
            source: 'cash',
            status: 'kept',
            previousStatus: null,
            wallet: null,
            forWork: true,
            detail: null,
            foreignAmount: null,
            direction: 'in',
            createdAt: now,
            updatedAt: now,
          },
        ]
      : [];
  const after = dayOf({
    ...snapshot,
    cycleSpends: [...rows, ...typed],
    closedDays: [...open, closingRow(day)],
  });
  if (before === null || after === null) return 0;
  return Math.max(0, after.tomorrow - before.tomorrow);
}
