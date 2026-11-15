import { csvField, CSV_BOM, CSV_EOL, textCell } from '../export/spends-csv';
import type { Money } from '../money/currency';
import type { LocalDate } from '../time/local-date';
import { certificateOf } from './held-back';
import { isTakings, isWorkCost, type WorkRow } from './work';

/**
 * The work year: work money in counted as billed (what landed plus what a client held back for
 * tax), what was held back and which certificates have not come, work costs, and what was kept.
 * The year is the calendar year. 6pm files nothing: this is a list for whoever does.
 */

/** A work row as the year reads it: money in may carry tax held back and its certificate. */
export interface YearWorkRow extends WorkRow {
  readonly heldBack?: Money | null | undefined;
  readonly certificate?: boolean | null | undefined;
  readonly certificateOn?: LocalDate | null | undefined;
}

/**
 * The line the year's figure is drawn against: one billion đồng. Taken from press summaries and
 * not checked against the decrees, so nothing calls it law, a threshold or a rule.
 */
export const WORK_YEAR_LINE = 1_000_000_000;
/** From this share of the line on, a quiet sentence suggests asking whoever files. */
export const NEAR_LINE_SHARE = 0.8;

export interface WorkYear {
  readonly year: number;
  /** Work money in as billed: landed plus held back. */
  readonly billed: Money;
  readonly heldBack: Money;
  /** Payments a client held tax from, and those whose certificate has not come. */
  readonly heldPayments: number;
  readonly uncertified: { readonly count: number; readonly amount: Money };
  readonly costs: Money;
  /** Billed less held back and costs: what the work left the person. */
  readonly kept: Money;
  /** Billed by month, January first. */
  readonly months: readonly Money[];
}

const yearOf = (day: LocalDate) => Number(day.slice(0, 4));
const monthOf = (day: LocalDate) => Number(day.slice(5, 7)) - 1;

/** Billed for one row of work money in: what landed and what was held back. */
export function billedOf(row: Pick<YearWorkRow, 'amount' | 'heldBack'>): Money {
  return row.amount + Math.max(0, row.heldBack ?? 0);
}

export function yearWork(rows: readonly YearWorkRow[], year: number): WorkYear {
  let billed = 0;
  let heldBack = 0;
  let heldPayments = 0;
  let uncertifiedCount = 0;
  let uncertifiedAmount = 0;
  let costs = 0;
  const months = Array.from({ length: 12 }, () => 0);
  for (const row of rows) {
    if (yearOf(row.day) !== year) continue;
    if (isTakings(row)) {
      const held = Math.max(0, row.heldBack ?? 0);
      const bill = row.amount + held;
      billed += bill;
      months[monthOf(row.day)] = (months[monthOf(row.day)] ?? 0) + bill;
      if (held > 0) {
        heldBack += held;
        heldPayments += 1;
        if (certificateOf(row).kind === 'waiting') {
          uncertifiedCount += 1;
          uncertifiedAmount += held;
        }
      }
    } else if (isWorkCost(row)) {
      costs += row.amount;
    }
  }
  return {
    year,
    billed,
    heldBack,
    heldPayments,
    uncertified: { count: uncertifiedCount, amount: uncertifiedAmount },
    costs,
    kept: billed - heldBack - costs,
    months,
  };
}

/** The year's figure against the line: how far under it, and what share of it. */
export interface YearLine {
  readonly line: Money;
  /** How much is left to the line; nothing once past it. */
  readonly under: Money;
  /** The share of the line reached, 0 to 1 (more past it). */
  readonly share: number;
  /** The share as a whole percent, rounded down so 27,4% reads 27%. */
  readonly percent: number;
  readonly near: boolean;
}

export function yearLine(billed: Money, line: Money = WORK_YEAR_LINE): YearLine {
  const share = line > 0 ? Math.max(0, billed) / line : 0;
  return {
    line,
    under: Math.max(0, line - billed),
    share,
    percent: Math.floor(share * 100),
    near: share >= NEAR_LINE_SHARE,
  };
}

/** One payment a client held tax from, for the list to chase certificates. */
export interface HeldBackEntry<Row extends YearWorkRow = YearWorkRow> {
  readonly row: Row;
  readonly heldBack: Money;
  /** The day the certificate came, null while it has not. */
  readonly certificateOn: LocalDate | null;
  readonly arrived: boolean;
}

/** Every payment of the year a client held tax from, oldest first: inked ones stay on the list. */
export function heldBackList<Row extends YearWorkRow>(
  rows: readonly Row[],
  year: number,
): HeldBackEntry<Row>[] {
  return rows
    .filter((row) => yearOf(row.day) === year && isTakings(row) && (row.heldBack ?? 0) > 0)
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
    .map((row) => {
      const mark = certificateOf(row);
      return {
        row,
        heldBack: row.heldBack ?? 0,
        certificateOn: mark.kind === 'arrived' ? mark.on : null,
        arrived: mark.kind === 'arrived',
      };
    });
}

/** The words the two files are written in: their header rows. */
export interface WorkYearCsvLabels {
  readonly income: {
    readonly date: string;
    readonly from: string;
    readonly job: string;
    readonly billed: string;
    readonly heldBack: string;
    readonly landed: string;
    readonly certificate: string;
  };
  readonly costs: {
    readonly date: string;
    readonly to: string;
    readonly category: string;
    readonly amount: string;
    readonly note: string;
  };
}

/** A row the files are written from: a spend or money in with its words. */
export interface WorkYearCsvRow extends YearWorkRow {
  readonly id: string;
  readonly merchant: string;
  readonly note?: string | null | undefined;
  readonly categoryId?: string | undefined;
  readonly at?: string | undefined;
}

const byDayThenTime = (a: WorkYearCsvRow, b: WorkYearCsvRow) =>
  a.day !== b.day ? (a.day < b.day ? -1 : 1) : (a.at ?? '') < (b.at ?? '') ? -1 : 1;

const fileOf = (header: readonly string[], rows: readonly (readonly string[])[]) =>
  CSV_BOM + [header, ...rows].map((cells) => cells.map(csvField).join(',') + CSV_EOL).join('');

/**
 * The year as two CSV files for whoever files: income (one row for each piece of work money in:
 * date, who from, the job, billed, held back, landed, and the day the certificate came) and costs
 * (one row for each work cost). UTF-8 with a byte order mark so Excel reads Vietnamese, amounts as
 * whole đồng with no grouping, dates as YYYY-MM-DD. `jobs` names the job of money in that paid a
 * request, by the money in's id; other money in gives its note.
 */
export function workYearCsv(
  rows: readonly WorkYearCsvRow[],
  year: number,
  labels: WorkYearCsvLabels,
  names: {
    readonly jobs?: ReadonlyMap<string, string>;
    readonly categories?: ReadonlyMap<string, string>;
  } = {},
): { readonly income: string; readonly costs: string; readonly incomeRows: number } {
  const ofYear = rows.filter((row) => yearOf(row.day) === year).sort(byDayThenTime);
  const income = ofYear.filter(isTakings).map((row) => {
    const held = Math.max(0, row.heldBack ?? 0);
    const mark = certificateOf(row);
    return [
      row.day,
      textCell(row.merchant.trim()),
      textCell(names.jobs?.get(row.id) ?? row.note ?? ''),
      String(row.amount + held),
      String(held),
      String(row.amount),
      mark.kind === 'arrived' ? (mark.on ?? '') : '',
    ];
  });
  const costs = ofYear
    .filter(isWorkCost)
    .map((row) => [
      row.day,
      textCell(row.merchant.trim()),
      textCell(names.categories?.get(row.categoryId ?? '') ?? ''),
      String(row.amount),
      textCell(row.note ?? ''),
    ]);
  const i = labels.income;
  const c = labels.costs;
  return {
    income: fileOf([i.date, i.from, i.job, i.billed, i.heldBack, i.landed, i.certificate], income),
    costs: fileOf([c.date, c.to, c.category, c.amount, c.note], costs),
    incomeRows: income.length,
  };
}
