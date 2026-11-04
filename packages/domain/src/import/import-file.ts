import type { LocalDate } from '../time/local-date';
import { importTargetOf, type ImportTarget } from './category-words';
import { isCompoundFile, readCompoundFile } from './cfb';
import { decodeText, readCsv } from './csv-read';
import {
  SET_ASIDE_REASONS,
  type ImportRow,
  type ReadLines,
  type SetAsideReason,
} from './import-read';
import { isLockedOffice, LockedFile, unlockWorkbook } from './office-crypto';
import { isZip, readWorkbook, WorkbookError, type Sheet } from './xlsx-read';

/**
 * Opening a file someone picked or shared: a CSV, an Excel workbook, or an Excel workbook locked
 * with a password (MoMo locks its history with the account holder's birthday). Then what is in
 * it, ready for "What's in the box": what 6pm would bring in, by year, and what it set aside.
 */

export type OpenFailure = 'locked' | 'wrongPassword' | 'unsupported' | 'damaged' | 'empty';

export type OpenedFile =
  | { readonly ok: true; readonly sheets: readonly Sheet[]; readonly kind: 'csv' | 'xlsx' }
  | { readonly ok: false; readonly reason: OpenFailure };

/** MoMo's password for a birthday: day, month and year, as ddmmyyyy. */
export function birthdayPassword(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}${String(year).padStart(4, '0')}`;
}

/** Whether the bytes are a locked workbook, which needs its password before it opens. */
export function needsPassword(bytes: Uint8Array): boolean {
  if (!isCompoundFile(bytes)) return false;
  try {
    return isLockedOffice(readCompoundFile(bytes));
  } catch {
    return false;
  }
}

function hasData(sheets: readonly Sheet[]): boolean {
  return sheets.some((s) => s.rows.filter((r) => r.some((c) => c !== null && c !== '')).length > 1);
}

/** Opens a file's bytes: CSV, xlsx, or xlsx locked by `password`. */
export function openImportFile(bytes: Uint8Array, password?: string): OpenedFile {
  if (bytes.length === 0) return { ok: false, reason: 'empty' };
  try {
    if (isCompoundFile(bytes)) {
      const file = readCompoundFile(bytes);
      // An old .xls workbook is a compound file too, with no lock: not read.
      if (!isLockedOffice(file)) return { ok: false, reason: 'unsupported' };
      if (password === undefined) return { ok: false, reason: 'locked' };
      const sheets = readWorkbook(unlockWorkbook(bytes, password));
      return hasData(sheets) ? { ok: true, sheets, kind: 'xlsx' } : { ok: false, reason: 'empty' };
    }
    if (isZip(bytes)) {
      const sheets = readWorkbook(bytes);
      return hasData(sheets) ? { ok: true, sheets, kind: 'xlsx' } : { ok: false, reason: 'empty' };
    }
    const head = bytes.subarray(0, 1024);
    const utf16 = (head[0] === 0xff && head[1] === 0xfe) || (head[0] === 0xfe && head[1] === 0xff);
    if (!utf16 && head.includes(0)) return { ok: false, reason: 'unsupported' };
    const sheets = [{ name: '', rows: readCsv(decodeText(bytes)) }];
    return hasData(sheets) ? { ok: true, sheets, kind: 'csv' } : { ok: false, reason: 'empty' };
  } catch (error) {
    if (error instanceof LockedFile) {
      return {
        ok: false,
        reason: error.reason === 'wrongPassword' ? 'wrongPassword' : error.reason,
      };
    }
    if (error instanceof WorkbookError) return { ok: false, reason: 'damaged' };
    return { ok: false, reason: 'damaged' };
  }
}

export interface YearStack {
  readonly year: string;
  readonly spending: number;
  readonly moneyIn: number;
}

export interface ImportLabel {
  /** Their name for it, as the file writes it. */
  readonly label: string;
  /** Spending lines under it. */
  readonly count: number;
  /** Where 6pm's own words put it; null when the person picks. */
  readonly target: ImportTarget | null;
}

export interface ImportSummary {
  /** What would be brought in: lines from before the day 6pm started, oldest first. */
  readonly rows: readonly ImportRow[];
  readonly spending: number;
  readonly moneyIn: number;
  /** Lines from days 6pm already covers: left to what 6pm caught itself. */
  readonly alreadyIn: number;
  readonly first: LocalDate | null;
  readonly last: LocalDate | null;
  readonly years: readonly YearStack[];
  readonly setAside: Readonly<Record<SetAsideReason, number>>;
  readonly setAsideTotal: number;
  /** Spending's labels: the ones that need a pick first, then the biggest. */
  readonly labels: readonly ImportLabel[];
}

/** What is in a read file for a person who started 6pm on `startDay`. */
export function summariseImport(read: ReadLines, startDay: LocalDate): ImportSummary {
  const rows = read.rows
    .filter((r) => r.day < startDay)
    .slice()
    .sort((a, b) =>
      a.day === b.day ? ((a.time ?? '') < (b.time ?? '') ? -1 : 1) : a.day < b.day ? -1 : 1,
    );
  const years = new Map<string, { spending: number; moneyIn: number }>();
  const labels = new Map<string, number>();
  let spending = 0;
  for (const row of rows) {
    const year = row.day.slice(0, 4);
    const stack = years.get(year) ?? { spending: 0, moneyIn: 0 };
    if (row.direction === 'out') {
      stack.spending++;
      spending++;
      labels.set(row.label, (labels.get(row.label) ?? 0) + 1);
    } else stack.moneyIn++;
    years.set(year, stack);
  }
  const setAsideTotal = SET_ASIDE_REASONS.reduce((n, r) => n + read.setAside[r], 0);
  const listed = [...labels].map(([label, count]) => ({
    label,
    count,
    target: importTargetOf(label),
  }));
  listed.sort((a, b) =>
    (a.target === null) !== (b.target === null) ? (a.target === null ? -1 : 1) : b.count - a.count,
  );
  return {
    rows,
    spending,
    moneyIn: rows.length - spending,
    alreadyIn: read.rows.length - rows.length,
    first: rows[0]?.day ?? null,
    last: rows[rows.length - 1]?.day ?? null,
    years: [...years]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([year, s]) => ({ year, spending: s.spending, moneyIn: s.moneyIn })),
    setAside: read.setAside,
    setAsideTotal,
    labels: listed,
  };
}

/**
 * What the brought-in lines spent in the pay cycle the person joined, before the day they started
 * (M2a): it stands in for onboarding's estimate. Only spending in categories that count daily.
 */
export function spentBeforeJoining(
  rows: readonly {
    readonly day: LocalDate;
    readonly amount: number;
    readonly direction: 'out' | 'in';
    readonly countsDaily: boolean;
  }[],
  cycleStart: LocalDate,
  startDay: LocalDate,
): number {
  let total = 0;
  for (const row of rows) {
    if (row.direction === 'out' && row.countsDaily && row.day >= cycleStart && row.day < startDay) {
      total += row.amount;
    }
  }
  return total;
}
