import { foldWords } from '../capture/fold-words';
import { fileAmount, fileDate } from './file-values';
import type { Cell, Sheet } from './xlsx-read';

/**
 * Which column of a file holds what. The three apps 6pm knows (MoMo, Money Lover, MISA) are told
 * apart by their headers; any other file gets a guess from its header words, which the person
 * confirms on "Which column is which?".
 */

/** The apps whose exports 6pm reads without asking. `other` is any file it had to be told about. */
export const IMPORT_APPS = ['moneyLover', 'misa', 'momo', 'other'] as const;
export type ImportApp = (typeof IMPORT_APPS)[number];

/** What the person can say a column is. */
export const COLUMN_ROLES = ['date', 'amount', 'category', 'note', 'inOut', 'skip'] as const;
export type ColumnRole = (typeof COLUMN_ROLES)[number];

/** Every role a column can have; the known layouts use the fuller set. */
export type FullRole =
  | ColumnRole
  | 'time'
  | 'amountIn'
  | 'amountOut'
  | 'subcategory'
  | 'wallet'
  | 'currency'
  | 'status'
  | 'ref'
  | 'from'
  | 'to';

export interface ColumnPlan {
  readonly app: ImportApp;
  /** The row the headers are on (zero-based); data starts on the next one. */
  readonly header: number;
  /** One role per column, in the file's order. */
  readonly roles: readonly FullRole[];
}

/** The text of a header cell, folded: lower case, no accents, single spaces. */
export function headerKey(cell: Cell): string {
  return foldWords(typeof cell === 'string' ? cell : cell === null ? '' : String(cell)).trim();
}

const MOMO_HEADERS: Readonly<Record<string, FullRole>> = {
  stt: 'skip',
  'thoi gian': 'date',
  'ma giao dich': 'ref',
  'loai giao dich': 'note',
  'tai khoan chuyen': 'skip',
  'ten dinh danh tai khoan chuyen': 'from',
  'tai khoan nhan': 'skip',
  'ten dinh danh tai khoan nhan': 'to',
  'so tien': 'amount',
  'so du sau giao dich': 'skip',
  'trang thai gd': 'status',
};

/** Header words by role, folded; the first role whose words a header is wins. */
const HEADER_WORDS: readonly (readonly [FullRole, readonly string[]])[] = [
  [
    'skip',
    [
      'stt',
      'no',
      'id',
      'so thu tu',
      'ma giao dich',
      'so du',
      'so du sau giao dich',
      'balance',
      'event',
      'su kien',
      'chuyen di su kien',
      'members',
      'with',
      'exclude report',
      'exclude from report',
      'khong tinh vao bao cao',
      'doi tuong',
      'chi cho ai',
    ],
  ],
  [
    'date',
    [
      'date',
      'ngay',
      'ngay gd',
      'ngay giao dich',
      'thoi gian',
      'transaction date',
      'posting date',
      'ngay hach toan',
      'ngay thang',
      'datetime',
      'day',
    ],
  ],
  ['time', ['time', 'gio']],
  [
    'amountIn',
    [
      'so tien thu',
      'thu',
      'tien vao',
      'income',
      'credit',
      'ghi co',
      'money in',
      'inflow',
      'deposit',
    ],
  ],
  [
    'amountOut',
    [
      'so tien chi',
      'chi',
      'tien ra',
      'expense',
      'debit',
      'ghi no',
      'money out',
      'outflow',
      'withdrawal',
    ],
  ],
  ['amount', ['amount', 'so tien', 'gia tri', 'value', 'tien', 'sum', 'total', 'so tien vnd']],
  ['subcategory', ['subcategory', 'sub category', 'hang muc con', 'danh muc con']],
  [
    'category',
    [
      'category',
      'category name',
      'hang muc',
      'danh muc',
      'nhom',
      'muc chi',
      'loai chi tieu',
      'hang muc thu chi',
    ],
  ],
  [
    'inOut',
    [
      'type',
      'loai',
      'category type',
      'thu chi',
      'loai thu chi',
      'kind',
      'direction',
      'in out',
      'transaction type',
      'loai giao dich',
    ],
  ],
  [
    'note',
    [
      'note',
      'notes',
      'ghi chu',
      'dien giai',
      'mo ta',
      'noi dung',
      'description',
      'memo',
      'details',
      'remark',
      'payee',
      'merchant',
    ],
  ],
  ['wallet', ['wallet', 'account', 'vi', 'tai khoan', 'wallet account', 'nguon tien']],
  ['currency', ['currency', 'tien te', 'loai tien', 'don vi tien']],
  ['status', ['status', 'trang thai']],
];

/**
 * A header's role from its words, or null. A bilingual header ("Date (Ngày)", "Wallet/Account (Tài
 * khoản)") reads by its longest leading words that name a role, then its trailing ones.
 */
export function roleOfHeader(cell: Cell): FullRole | null {
  const key = headerKey(cell);
  if (key === '') return null;
  const words = key.split(' ');
  const named = (text: string) => HEADER_WORDS.find(([, list]) => list.includes(text))?.[0] ?? null;
  for (let n = words.length; n >= 1; n--) {
    const role = named(words.slice(0, n).join(' '));
    if (role) return role;
  }
  for (let i = 1; i < words.length; i++) {
    const role = named(words.slice(i).join(' '));
    if (role) return role;
  }
  return null;
}

/** The text of every non-empty cell in the sheet's first rows, folded, for telling apps apart. */
function topText(sheet: Sheet, rows: number): string {
  return sheet.rows
    .slice(0, rows)
    .flat()
    .map((c) => headerKey(c))
    .join(' | ');
}

function momoPlan(sheet: Sheet): ColumnPlan | null {
  for (let at = 0; at < Math.min(15, sheet.rows.length); at++) {
    const keys = (sheet.rows[at] ?? []).map(headerKey);
    if (
      keys.includes('ma giao dich') &&
      keys.includes('trang thai gd') &&
      keys.includes('so tien')
    ) {
      return { app: 'momo', header: at, roles: keys.map((k) => MOMO_HEADERS[k] ?? 'skip') };
    }
  }
  return null;
}

/** The first row (of the first 15) whose headers name a date and an amount, with the roles read. */
function headerPlan(sheet: Sheet, app: ImportApp): ColumnPlan | null {
  let best: { at: number; roles: FullRole[]; score: number } | null = null;
  for (let at = 0; at < Math.min(15, sheet.rows.length); at++) {
    const row = sheet.rows[at] ?? [];
    const roles = row.map((c) => roleOfHeader(c) ?? 'skip');
    // One column per role: a second "Date" or "Category" is skipped.
    const seen = new Set<FullRole>();
    const unique = roles.map((r) => (r !== 'skip' && seen.has(r) ? 'skip' : (seen.add(r), r)));
    const hasDate = unique.includes('date');
    const hasAmount =
      unique.includes('amount') || unique.includes('amountIn') || unique.includes('amountOut');
    const score = unique.filter((r) => r !== 'skip').length + (hasDate && hasAmount ? 10 : 0);
    if (hasDate && hasAmount && (best === null || score > best.score))
      best = { at, roles: unique, score };
  }
  return best ? { app, header: best.at, roles: best.roles } : null;
}

/** Whether a sheet is a Money Lover export: its own sheet name or its own report columns. */
function isMoneyLover(sheet: Sheet): boolean {
  if (headerKey(sheet.name) === 'money lover report') return true;
  const top = topText(sheet, 5);
  return (
    /\bexclude (from )?report\b/.test(top) && /\bcategory\b/.test(top) && /\bamount\b/.test(top)
  );
}

/** Whether a sheet is a MISA Sổ Thu Chi export: its title, or MISA's own column names. */
function isMisa(sheet: Sheet): boolean {
  const top = topText(sheet, 15);
  return (
    /\bmisa\b/.test(top) ||
    /\b(income and expense list|danh sach thu chi|so thu chi)\b/.test(top) ||
    (/\bhang muc\b/.test(top) && /\bdien giai\b/.test(top))
  );
}

/**
 * How to read a sheet: MoMo, Money Lover and MISA by their own layouts; anything else, the guess
 * from its headers (`other`), which may lack a date or an amount: then the person is asked.
 */
export function planOf(sheet: Sheet): ColumnPlan {
  const momo = momoPlan(sheet);
  if (momo) return momo;
  const app: ImportApp = isMoneyLover(sheet) ? 'moneyLover' : isMisa(sheet) ? 'misa' : 'other';
  const plan = headerPlan(sheet, app);
  if (plan) return plan;
  return { app: 'other', header: 0, roles: (sheet.rows[0] ?? []).map(() => 'skip') };
}

/** Whether a plan can read a file: it has a date and an amount. */
export function planReads(plan: Pick<ColumnPlan, 'roles'>): boolean {
  return (
    plan.roles.includes('date') &&
    (plan.roles.includes('amount') ||
      plan.roles.includes('amountIn') ||
      plan.roles.includes('amountOut'))
  );
}

/** A full role as the six the person can pick from; the rest read as Skip. */
export function pickableRole(role: FullRole): ColumnRole {
  switch (role) {
    case 'date':
    case 'amount':
    case 'category':
    case 'note':
    case 'inOut':
    case 'skip':
      return role;
    case 'amountIn':
    case 'amountOut':
      return 'amount';
    case 'subcategory':
      return 'category';
    case 'time':
    case 'wallet':
    case 'currency':
    case 'status':
    case 'ref':
    case 'from':
    case 'to':
      return 'skip';
  }
}

/** The sheet worth reading in a workbook: the one whose plan reads, the longest first. */
export function mainSheet(sheets: readonly Sheet[]): Sheet | null {
  const readable = sheets.filter((s) => planReads(planOf(s)));
  const pool = readable.length > 0 ? readable : sheets;
  return pool.reduce<Sheet | null>(
    (a, b) => (a === null || b.rows.length > a.rows.length ? b : a),
    null,
  );
}

/** Short words that may go to the server as they are: a status, a type, a yes or a no. */
const PLAIN_WORDS = /^[\p{L} ]{1,14}$/u;

/**
 * A value's shape, with nothing personal left: every digit becomes `d` and every letter `w`, so
 * "-45.000" is "-dd.ddd" and "09/10/2026 08:12" is "dd/dd/dddd dd:dd". A short word that repeats
 * through the column ("Thành công", "Chi") is kept, since it names a kind, never a person or a
 * shop; anything else with letters is cut to its shape.
 */
export function valueShape(cell: Cell, repeats: boolean): string {
  if (cell === null) return '';
  const text = (typeof cell === 'number' ? String(cell) : cell).trim().slice(0, 40);
  if (repeats && PLAIN_WORDS.test(text)) return text;
  return text.replace(/\p{L}+/gu, 'w').replace(/\d/g, 'd');
}

export interface ColumnSample {
  readonly header: string;
  readonly shapes: readonly string[];
}

/** What the server is shown of a file: its headers and up to five value shapes per column. */
export function columnSamples(sheet: Sheet, header: number): ColumnSample[] {
  const head = sheet.rows[header] ?? [];
  const body = sheet.rows.slice(header + 1, header + 201);
  const width = Math.max(head.length, ...body.map((r) => r.length));
  return Array.from({ length: Math.min(width, 30) }, (_, col) => {
    const values = body.map((r) => r[col] ?? null).filter((v) => v !== null && v !== '');
    const counts = new Map<string, number>();
    for (const v of values) counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    const shapes = [
      ...new Set(values.map((v) => valueShape(v, (counts.get(String(v)) ?? 0) >= 3))),
    ];
    const name = head[col];
    return {
      header: (typeof name === 'string'
        ? name
        : name === null || name === undefined
          ? ''
          : String(name)
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60),
      shapes: shapes.slice(0, 5),
    };
  });
}

/** Whether most of a column's values read as dates, or as amounts: to check a guess. */
export function columnReadsAs(sheet: Sheet, header: number, col: number): 'date' | 'amount' | null {
  const values = sheet.rows
    .slice(header + 1, header + 41)
    .map((r) => r[col] ?? null)
    .filter((v) => v !== null && v !== '');
  if (values.length === 0) return null;
  const dates = values.filter((v) => fileDate(v) !== null).length;
  const amounts = values.filter((v) => fileAmount(v) !== null).length;
  if (dates >= values.length * 0.8) return 'date';
  if (amounts >= values.length * 0.8) return 'amount';
  return null;
}
