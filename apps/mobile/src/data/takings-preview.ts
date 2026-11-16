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

/** A closed day as the close is about to file it: that it is closed, and the line it keeps. */
function closingRow(day: LocalDate, line = 0): ClosedDayRow {
  return {
    day,
    closedAt: new Date().toISOString(),
    late: false,
    spent: 0,
    line,
    tomorrow: 0,
    note: null,
  };
}

/**
 * The snapshot with `day` counted as closed, as it will be once the close in progress files it:
 * what the day's work kept has landed (`workKeptOf` counts closed days only), and the day keeps
 * `line`, the line the close found it at (by default the day's line as it stands, still open).
 * Money that reached the days during the close (the day's takings, a landing kept in it) adds to
 * tomorrow and never to the day being closed. Every number the close shows (Today's takings' "a
 * day from tomorrow", the receipt's Safe tomorrow, the reveal, and the row the close files) is read
 * from this, so they agree with each other, with Today after the close and with the Diary. A
 * monthly salary's number is counted as it always was.
 */
export function withDayClosed(
  snapshot: MoneySnapshot,
  day: LocalDate,
  line?: number,
): MoneySnapshot {
  if (snapshot.closedDays.some((d) => d.day === day)) return snapshot;
  const found = line ?? (snapshot.today === day ? (dayOf(snapshot)?.line ?? 0) : 0);
  return { ...snapshot, closedDays: [...snapshot.closedDays, closingRow(day, found)] };
}

/** The number of the day being closed, counted as the close will file it (`withDayClosed`). */
export function closingNumberOf(
  snapshot: MoneySnapshot,
  day: LocalDate,
  line?: number,
): DailyNumber | null {
  return dayOf(withDayClosed(snapshot, day, line));
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
