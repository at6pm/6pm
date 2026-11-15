import {
  sumCounted,
  sumDayPart,
  type CategoryRow,
  type LocalDate,
  type SpendRow,
  type Vnd,
} from '@6pm/domain';

import { toRowViews, type Labels } from '../today/today-view';
import type { SpendRowView } from '../today/spend-row';
import { countedSpendOf } from './jar-lines';

/** A payment voided since by what a later message said: it failed, or the bank took it back. */
export interface VoidedRecord {
  readonly spend: SpendRow;
  readonly why: 'failed' | 'reversal';
}

/** What `readDayRecords` holds for one day. */
export interface DayRecordsData {
  readonly spends: readonly SpendRow[];
  readonly givenBack: Readonly<Record<string, LocalDate>>;
  readonly voided: readonly VoidedRecord[];
  /** The day was closed in 6pm; a day only brought in from another app was not. */
  readonly closed: boolean;
}

export interface DayRecords {
  /** Every record still filed that day, oldest first: each opens its Details. */
  readonly records: readonly SpendRow[];
  /** The kept spends whose jars the list takes back off under them, as the receipt does. */
  readonly kept: readonly SpendRow[];
  readonly voided: readonly VoidedRecord[];
  /** The receipt's TOTAL, as the calendar's tile and the Diary's receipt count it now. */
  readonly total: Vnd;
  /** History brought in from another app: a day never closed in 6pm. */
  readonly brought: boolean;
}

/**
 * One day's records and total. A closed day's total is what its receipt lists now: the kept spends
 * that count, less what jars covered (`restateClosedDays` counts the same). A day only brought in
 * counts the brought-in spends that count, as the calendar outlines it.
 */
export function dayRecordsOf(data: DayRecordsData, notDaily: ReadonlySet<string>): DayRecords {
  const brought =
    !data.closed && data.spends.some((s) => s.source === 'import' && s.status === 'kept');
  const kept = data.spends.filter(
    (s) => s.status === 'kept' && (!brought || s.source === 'import'),
  );
  const counted = kept.map(countedSpendOf);
  return {
    records: data.spends,
    kept,
    voided: data.voided,
    total: brought ? sumCounted(counted, notDaily) : sumDayPart(counted, notDaily),
    brought,
  };
}

/** The words the day's rows add to Today's. */
export interface DayRowWords {
  /** "BACK 27 OCT" for a spend given back since. */
  readonly back: (day: LocalDate) => string;
  /** "FAILED", "REVERSED". */
  readonly voided: (why: VoidedRecord['why']) => string;
}

/**
 * The day's rows as Today draws them: its records, then the payments voided since, struck
 * through like a spend that was not theirs and tagged with what voided them. A spend given back
 * since carries the day it came back as its tag.
 */
export function dayRowViews(
  day: DayRecords,
  givenBack: Readonly<Record<string, LocalDate>>,
  categories: readonly CategoryRow[],
  labels: Labels,
  words: DayRowWords,
): { readonly rows: readonly SpendRowView[]; readonly voided: readonly SpendRowView[] } {
  const rows = toRowViews(day.records, categories, labels).map((row) => {
    const back = givenBack[row.id];
    return back ? { ...row, tag: words.back(back) } : row;
  });
  const voided = toRowViews(
    day.voided.map((v) => v.spend),
    categories,
    labels,
  ).map((row, i) => ({
    ...row,
    reviewable: false,
    skipped: true,
    first: rows.length === 0 && i === 0,
    tag: words.voided(day.voided[i]?.why ?? 'failed'),
  }));
  return { rows, voided };
}
