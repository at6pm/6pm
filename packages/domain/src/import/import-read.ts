import { sha1 } from '@noble/hashes/legacy.js';
import { strToU8 } from 'fflate';

import { foldWords } from '../capture/fold-words';
import type { LocalDate } from '../time/local-date';
import type { ColumnPlan, FullRole, ImportApp } from './columns';
import { dateOrderOf, fileAmount, fileDate, fileTime } from './file-values';
import type { Cell, Sheet } from './xlsx-read';

/**
 * Every line of an export read into what 6pm keeps: spending and money in, each with its day,
 * amount, their category (or, in a MoMo history, the shop), and a stable id. Lines that are not
 * spending or money in are set aside and counted: moves between the person's own accounts,
 * balance fixes, loans and debts, failed payments, and lines in another currency.
 */

export type SetAsideReason = 'ownMove' | 'balanceFix' | 'debt' | 'failed' | 'otherCurrency';
export const SET_ASIDE_REASONS: readonly SetAsideReason[] = [
  'ownMove',
  'balanceFix',
  'debt',
  'failed',
  'otherCurrency',
];

export interface ImportRow {
  /** The same line read from the same file always has the same id, so a second import adds nothing. */
  readonly id: string;
  readonly day: LocalDate;
  /** 'HH:MM:SS' when the file says. */
  readonly time: string | null;
  /** Positive, in minor units of the home currency. */
  readonly amount: number;
  readonly direction: 'out' | 'in';
  /** Their category; in a MoMo history, the shop or the kind of move. */
  readonly label: string;
  /** Who was paid (or who paid), as the Diary names the line. */
  readonly merchant: string;
  readonly note: string | null;
  /** Paid with MoMo's pay-later: spending counts when it happens, as a card's does. */
  readonly payLater: boolean;
}

export interface ReadLines {
  readonly app: ImportApp;
  readonly rows: readonly ImportRow[];
  readonly setAside: Readonly<Record<SetAsideReason, number>>;
}

const text = (cell: Cell | undefined): string =>
  cell === null || cell === undefined ? '' : String(cell).replace(/\s+/g, ' ').trim();
const has = (folded: string, words: readonly string[]) =>
  words.some((w) => folded.includes(` ${w} `));

const TRANSFER_NAMES = [
  'tien chuyen di',
  'tien chuyen den',
  'outgoing transfer',
  'incoming transfer',
  'transfer',
  'chuyen khoan',
  'chuyen khoan noi bo',
  'phi chuyen khoan',
];
const ADJUST_WORDS = [
  'dieu chinh so du',
  'adjust balance',
  'balance adjustment',
  'adjustment',
  'so du ban dau',
  'initial balance',
  'opening balance',
];
const DEBT_NAMES = [
  'cho vay',
  'thu no',
  'di vay',
  'tra no',
  'loan',
  'debt',
  'repayment',
  'debt collection',
  'vay no',
  'thu lai',
  'collect interest',
];

/** Lines whose category or type says what they are, in Money Lover, MISA or any other app. */
function reasonOf(category: string, kind: string, note: string): SetAsideReason | null {
  const names = [foldWords(category).trim(), foldWords(kind).trim()];
  if (
    names.some((n) => ADJUST_WORDS.includes(n)) ||
    has(foldWords(note), ADJUST_WORDS.slice(0, 3))
  ) {
    return 'balanceFix';
  }
  if (names.some((n) => TRANSFER_NAMES.includes(n))) return 'ownMove';
  if (names.some((n) => DEBT_NAMES.includes(n))) return 'debt';
  return null;
}

const OUT_WORDS = [
  'chi',
  'chi tien',
  'expense',
  'expenses',
  'out',
  'debit',
  'ra',
  'tien ra',
  'spend',
  'spending',
  'payment',
  'withdrawal',
  'ghi no',
];
const IN_WORDS = [
  'thu',
  'thu tien',
  'income',
  'in',
  'credit',
  'vao',
  'tien vao',
  'nhan',
  'deposit',
  'refund',
  'ghi co',
];

/** Which way a type column says money went, or null when it does not say. */
export function directionWord(cell: Cell | undefined): 'out' | 'in' | null {
  const raw = text(cell);
  if (raw === '-' || raw === '−') return 'out';
  if (raw === '+') return 'in';
  const folded = foldWords(raw).trim();
  // "Expense (Chi)": the first word that says.
  for (const word of folded.split(' ')) {
    if (OUT_WORDS.includes(word)) return 'out';
    if (IN_WORDS.includes(word)) return 'in';
  }
  if (OUT_WORDS.includes(folded)) return 'out';
  if (IN_WORDS.includes(folded)) return 'in';
  return null;
}

/** A stable id: the app, the line's own words and numbers, and which of its kind it is in the file. */
function idOf(parts: readonly (string | number | null)[], seen: Map<string, number>): string {
  const key = parts.map((p) => (p === null ? '' : String(p))).join('\u001f');
  const n = seen.get(key) ?? 0;
  seen.set(key, n + 1);
  const bytes = sha1(strToU8(`${key}\u001f${n}`));
  let hex = '';
  for (let i = 0; i < 16; i++) hex += (bytes[i] ?? 0).toString(16).padStart(2, '0');
  return `imp-${hex}`;
}

/** "Thanh toán CIRCLE K" → "CIRCLE K"; dates and long numbers dropped from a MoMo label. */
function momoLabel(description: string): string {
  return description
    .replace(/^thanh to[aá]n\s+/i, '')
    .replace(/\b(ng[aà]y\s*)?\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi, '')
    .replace(/\b\d{6,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const MOMO_OWN = ['tui than tai'];
const MOMO_OWN_MOVES = [
  'nap tien vao vi',
  'nap tien tu',
  'rut tien',
  'nap vi',
  'chuyen tien tu vi',
];
const MOMO_WALLETS = ['vi momo', 'vi tra sau', 'tui than tai', 'momo'];

interface Columns {
  readonly at: (role: FullRole) => number;
}

function columnsOf(plan: ColumnPlan): Columns {
  return { at: (role) => plan.roles.indexOf(role) };
}

/**
 * Reads every line under the header. `homeCurrency` is the ISO code the plan counts in, with its
 * minor digits: a line in another currency is set aside, as history has no rate for its day.
 */
export function readLines(
  sheet: Sheet,
  plan: ColumnPlan,
  home: { readonly code: string; readonly minorDigits: number },
): ReadLines {
  const cols = columnsOf(plan);
  const body = sheet.rows.slice(plan.header + 1);
  const cell = (row: readonly Cell[], role: FullRole): Cell | undefined => {
    const at = cols.at(role);
    return at < 0 ? undefined : row[at];
  };
  const order = dateOrderOf(body.map((r) => cell(r, 'date') ?? null));
  const setAside: Record<SetAsideReason, number> = {
    ownMove: 0,
    balanceFix: 0,
    debt: 0,
    failed: 0,
    otherCurrency: 0,
  };
  const rows: ImportRow[] = [];
  const seen = new Map<string, number>();
  const signed = body.some((r) => (fileAmount(cell(r, 'amount') ?? null) ?? 0) < 0);
  for (const row of body) {
    const date = fileDate(cell(row, 'date') ?? null, order);
    if (date === null) continue;
    const time = date.time ?? fileTime(cell(row, 'time') ?? null);
    const amountIn = fileAmount(cell(row, 'amountIn') ?? null, home.minorDigits);
    const amountOut = fileAmount(cell(row, 'amountOut') ?? null, home.minorDigits);
    const single = fileAmount(cell(row, 'amount') ?? null, home.minorDigits);
    let value: number;
    let direction: 'out' | 'in';
    const said = directionWord(cell(row, 'inOut'));
    if (single !== null && single !== 0) {
      value = Math.abs(single);
      direction = said ?? (single < 0 || !signed ? 'out' : 'in');
    } else if (amountOut !== null && amountOut !== 0) {
      value = Math.abs(amountOut);
      direction = 'out';
    } else if (amountIn !== null && amountIn !== 0) {
      value = Math.abs(amountIn);
      direction = 'in';
    } else continue;

    const category = text(cell(row, 'category'));
    const sub = text(cell(row, 'subcategory'));
    const note = text(cell(row, 'note'));
    const kind = text(cell(row, 'inOut'));
    const currency = text(cell(row, 'currency')).toUpperCase();
    const status = foldWords(text(cell(row, 'status'))).trim();

    let label = sub || category;
    let merchant = note || label;
    let payLater = false;
    let reason: SetAsideReason | null = null;
    if (plan.app === 'momo') {
      const from = text(cell(row, 'from'));
      const to = text(cell(row, 'to'));
      const described = foldWords(note);
      const fromKey = foldWords(from).trim();
      const toKey = foldWords(to).trim();
      if (status !== '' && status !== 'thanh cong') reason = 'failed';
      else if (has(described, ['tien loi'])) reason = null;
      else if (
        // Into or out of the savings pocket, from or to the wallet; a shop paid straight from the
        // pocket (or a refund into it) is spending and money in like any other.
        has(described, MOMO_OWN) ||
        (MOMO_OWN.includes(fromKey) && MOMO_WALLETS.includes(toKey)) ||
        (MOMO_OWN.includes(toKey) && MOMO_WALLETS.includes(fromKey)) ||
        MOMO_OWN_MOVES.some((w) => described.startsWith(` ${w} `)) ||
        (fromKey !== '' && fromKey === toKey)
      ) {
        reason = 'ownMove';
      }
      payLater = fromKey === 'vi tra sau';
      const counterpart = direction === 'out' ? to : from;
      const named =
        counterpart !== '' &&
        !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(counterpart) &&
        !MOMO_WALLETS.includes(foldWords(counterpart).trim());
      merchant = named ? counterpart : momoLabel(note) || note;
      label = has(described, ['chuyen tien'])
        ? 'Chuyển tiền'
        : momoLabel(named ? counterpart : note) || merchant;
    } else {
      reason = reasonOf(category, kind, note);
      if (
        reason === null &&
        currency !== '' &&
        /^[A-Z]{3}$/.test(currency) &&
        currency !== home.code
      ) {
        reason = 'otherCurrency';
      }
      if (!label) label = merchant;
    }
    if (reason !== null) {
      setAside[reason]++;
      continue;
    }
    rows.push({
      id: idOf(
        [
          plan.app,
          date.day,
          time,
          direction === 'out' ? -value : value,
          label,
          note,
          text(cell(row, 'ref')),
        ],
        seen,
      ),
      day: date.day,
      time,
      amount: value,
      direction,
      label,
      merchant: merchant || label,
      note: plan.app === 'momo' || note === '' || note === merchant ? null : note,
      payLater,
    });
  }
  return { app: plan.app, rows, setAside };
}
