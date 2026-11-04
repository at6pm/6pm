import { daysInMonth, makeDate, type LocalDate } from '../time/local-date';
import { excelSerialText, type Cell } from './xlsx-read';

/**
 * Amounts and dates as export files write them. An amount may be a number cell or text in any of
 * the ways Vietnamese and English apps print one ("1.250.000", "1,250,000.00", "-45,000",
 * "45.000 ₫", "(45.000)", "−45000"); a date may be "09/10/2026 08:12:40", "2026-10-09",
 * "10/09/2026" in a month-first file, or an Excel day serial.
 */

/** A signed amount in minor units (negative for money out when the file signs it), or null. */
export function fileAmount(cell: Cell, minorDigits = 0): number | null {
  const scale = 10 ** minorDigits;
  if (typeof cell === 'number') {
    if (!Number.isFinite(cell)) return null;
    const minor = Math.round(cell * scale);
    return Number.isSafeInteger(minor) ? minor : null;
  }
  if (cell === null) return null;
  let text = cell.trim();
  if (text === '') return null;
  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }
  text = text.replace(/[\s\u00a0\u202f]/g, '');
  if (/^[-−–]/.test(text) || /[-−–]$/.test(text)) negative = true;
  // What is left must be one number: digits with dots and commas, and a currency mark or code.
  const bare = text
    .replace(/^[-−–+]+|[-−–+]+$/g, '')
    .replace(/đồng|vnđ|vnd|₫|đ|[a-z]{3}$|^[a-z]{3}|[$€£¥₩₹฿]/giu, '');
  if (!/^\d[\d.,]*$/.test(bare) || /[.,]$/.test(bare)) return null;
  const dots = bare.split('.').length - 1;
  const commas = bare.split(',').length - 1;
  let digits: string;
  let decimals = '';
  if (dots > 0 && commas > 0) {
    // The last mark is the decimal one: "1,250,000.00", "1.250.000,50".
    const mark = bare.lastIndexOf('.') > bare.lastIndexOf(',') ? '.' : ',';
    const at = bare.lastIndexOf(mark);
    digits = bare.slice(0, at).replace(/[.,]/g, '');
    decimals = bare.slice(at + 1);
  } else if (dots + commas === 0) {
    digits = bare;
  } else {
    const mark = dots > 0 ? '.' : ',';
    const at = bare.lastIndexOf(mark);
    const after = bare.length - at - 1;
    const grouping = dots + commas > 1 || (after === 3 && !(minorDigits > 0 && mark === '.'));
    if (grouping) {
      if (
        !bare
          .split(mark)
          .slice(1)
          .every((g) => g.length === 3)
      )
        return null;
      digits = bare.replace(/[.,]/g, '');
    } else {
      digits = bare.slice(0, at);
      decimals = bare.slice(at + 1);
    }
  }
  const value = Number(`${digits}.${decimals || '0'}`);
  const minor = Math.round(value * scale);
  if (!Number.isSafeInteger(minor)) return null;
  return negative ? -minor : minor;
}

/** Which part of a slashed date is the day: Vietnam writes day first, some exports month first. */
export type DateOrder = 'dmy' | 'mdy';

export interface FileDate {
  readonly day: LocalDate;
  /** 'HH:MM:SS' when the cell carries a time. */
  readonly time: string | null;
}

const ISO = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/;
const SLASHED =
  /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})(?!\d)(?:[,\s]+(\d{1,2})[:h](\d{2})(?::(\d{2}))?\s*(am|pm|sa|ch)?)?/i;

/** Excel serials for 1980 to 2079: a bare number in this range in a date column is one. */
const SERIAL_MIN = 29_221;
const SERIAL_MAX = 65_380;

function dateOf(year: number, month: number, day: number): LocalDate | null {
  if (year < 1970 || year > 2100 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return makeDate(year, month, day);
}

function timeOf(h?: string, m?: string, s?: string, half?: string): string | null {
  if (h === undefined || m === undefined) return null;
  let hour = Number(h);
  const marker = half?.toLowerCase();
  if ((marker === 'pm' || marker === 'ch') && hour < 12) hour += 12;
  if ((marker === 'am' || marker === 'sa') && hour === 12) hour = 0;
  if (hour > 23 || Number(m) > 59) return null;
  return `${String(hour).padStart(2, '0')}:${m}:${s ?? '00'}`;
}

/** The two leading numbers of a slashed date, for telling the order of a whole column. */
function slashedParts(cell: Cell): [number, number] | null {
  if (typeof cell !== 'string') return null;
  const match = SLASHED.exec(cell.trim());
  return match ? [Number(match[1]), Number(match[2])] : null;
}

/**
 * The order a column writes its dates in: month first only when some first part cannot be a
 * month's day count but some second part goes past 12, else day first, as Vietnam writes it.
 */
export function dateOrderOf(cells: readonly Cell[]): DateOrder {
  let firstOver = false;
  let secondOver = false;
  for (const cell of cells) {
    const parts = slashedParts(cell);
    if (parts === null) continue;
    if (parts[0] > 12) firstOver = true;
    if (parts[1] > 12) secondOver = true;
  }
  return secondOver && !firstOver ? 'mdy' : 'dmy';
}

/** A date (and time) from a cell, or null. */
export function fileDate(cell: Cell, order: DateOrder = 'dmy'): FileDate | null {
  if (typeof cell === 'number') {
    if (cell < SERIAL_MIN || cell > SERIAL_MAX) return null;
    return fileDate(excelSerialText(cell), order);
  }
  if (cell === null) return null;
  const text = cell.trim();
  const iso = ISO.exec(text);
  if (iso) {
    const day = dateOf(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    return day ? { day, time: timeOf(iso[4], iso[5], iso[6]) } : null;
  }
  const slashed = SLASHED.exec(text);
  if (slashed) {
    const a = Number(slashed[1]);
    const b = Number(slashed[2]);
    const rawYear = Number(slashed[3]);
    const year = (slashed[3] ?? '').length === 2 ? 2000 + rawYear : rawYear;
    const day = order === 'dmy' ? dateOf(year, b, a) : dateOf(year, a, b);
    return day ? { day, time: timeOf(slashed[4], slashed[5], slashed[6], slashed[7]) } : null;
  }
  if (/^\d{5}(\.\d+)?$/.test(text)) return fileDate(Number(text), order);
  return null;
}

/** A time of day from its own cell ("08:12", "8:12:40", an Excel fraction of a day), or null. */
export function fileTime(cell: Cell): string | null {
  if (typeof cell === 'number') {
    if (cell < 0 || cell >= 1) return null;
    const seconds = Math.round(cell * 86_400);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  const match = /^(\d{1,2})[:h](\d{2})(?::(\d{2}))?\s*(am|pm|sa|ch)?$/i.exec((cell ?? '').trim());
  return match ? timeOf(match[1], match[2], match[3], match[4]) : null;
}
