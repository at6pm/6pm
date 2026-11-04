import { strFromU8, unzipSync } from 'fflate';

/**
 * A minimal Excel (.xlsx) reader: the zip is opened, the shared strings and the sheets read, and
 * every cell comes out as text or a number. A number in a date format comes out as the date it
 * shows ("2026-10-09 08:12:40"), so the readers after this one never see Excel's day serials.
 */

/** One cell: its text, its number, or nothing. */
export type Cell = string | number | null;

export interface Sheet {
  readonly name: string;
  readonly rows: readonly (readonly Cell[])[];
}

export class WorkbookError extends Error {
  override readonly name = 'WorkbookError';
}

const ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** XML text with its entities read. */
export function xmlText(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (whole, name: string) => {
    if (name.startsWith('#x') || name.startsWith('#X')) {
      return String.fromCodePoint(parseInt(name.slice(2), 16));
    }
    if (name.startsWith('#')) return String.fromCodePoint(parseInt(name.slice(1), 10));
    return ENTITIES[name] ?? whole;
  });
}

/** The text of every `<t>` in a string item, run by run, without phonetic hints. */
function itemText(xml: string): string {
  const plain = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
  let out = '';
  for (const match of plain.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) out += match[1] ?? '';
  return xmlText(out);
}

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return match ? xmlText(match[1] ?? '') : null;
}

/** Built-in number formats that show a date or a time. */
const DATE_FORMATS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47]);

/** Which cell styles show a date: by built-in id, or by a custom format with day, month or year. */
function dateStyles(xml: string | null): ReadonlySet<number> {
  if (xml === null) return new Set();
  const custom = new Map<number, string>();
  for (const match of xml.matchAll(/<numFmt\b[^>]*>/g)) {
    const id = Number(attr(match[0], 'numFmtId'));
    custom.set(id, attr(match[0], 'formatCode') ?? '');
  }
  const isDate = (id: number) => {
    if (DATE_FORMATS.has(id)) return true;
    const code = custom.get(id);
    if (code === undefined) return false;
    // Quoted text and colours are not the format's letters.
    const bare = code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '');
    return /[dmy]/i.test(bare) && !/^[#0.,\s%]*$/.test(bare);
  };
  const xfs = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(xml)?.[1] ?? '';
  const out = new Set<number>();
  let index = 0;
  for (const match of xfs.matchAll(/<xf\b[^>]*>/g)) {
    if (isDate(Number(attr(match[0], 'numFmtId')))) out.add(index);
    index++;
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** An Excel day serial as the date (and time, when it has one) it shows. */
export function excelSerialText(serial: number, date1904 = false): string {
  const days = Math.floor(serial + 1e-9);
  // 1900 system: day 60 is the 29 February 1900 Excel believes in.
  const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, days >= 61 ? 30 : 31);
  const at = new Date(epoch + days * 86_400_000);
  const seconds = Math.round((serial - days) * 86_400);
  const day = `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`;
  if (seconds <= 0 || seconds >= 86_400) return day;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${day} ${pad(h)}:${pad(m)}:${pad(seconds % 60)}`;
}

/** "AB12" → 27 (zero-based column). */
function columnOf(ref: string): number {
  let n = 0;
  for (const ch of ref) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) break;
    n = n * 26 + (code - 64);
  }
  return n - 1;
}

/** The most rows and columns read from one sheet: far beyond any export, short of a phone's limits. */
const MAX_ROWS = 200_000;
const MAX_COLUMNS = 64;

function readSheet(
  xml: string,
  strings: readonly string[],
  dates: ReadonlySet<number>,
  date1904: boolean,
): Cell[][] {
  const rows: Cell[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    if (rows.length >= MAX_ROWS) break;
    const at = Number(attr(rowMatch[1] ?? '', 'r'));
    const index = Number.isInteger(at) && at > 0 ? at - 1 : rows.length;
    const row: Cell[] = [];
    let next = 0;
    for (const cell of (rowMatch[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const tag = cell[1] ?? '';
      const body = cell[2] ?? '';
      const ref = attr(tag, 'r');
      const column = ref ? columnOf(ref) : next;
      next = column + 1;
      if (column < 0 || column >= MAX_COLUMNS) continue;
      const type = attr(tag, 't');
      const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: Cell = null;
      if (type === 's') value = strings[Number(raw)] ?? null;
      else if (type === 'inlineStr') value = itemText(/<is>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? '');
      else if (type === 'str' || type === 'e' || type === 'd')
        value = raw === undefined ? null : xmlText(raw);
      else if (type === 'b') value = raw === '1' ? 'TRUE' : 'FALSE';
      else if (raw !== undefined) {
        const n = Number(raw);
        if (!Number.isFinite(n)) value = xmlText(raw);
        else if (dates.has(Number(attr(tag, 's') ?? '0'))) value = excelSerialText(n, date1904);
        else value = n;
      }
      while (row.length < column) row.push(null);
      row[column] = value;
    }
    while (rows.length < index) rows.push([]);
    rows[index] = row;
  }
  return rows;
}

/** Whether the bytes start like a zip, as every .xlsx does. */
export function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

/** Every sheet of an .xlsx workbook, in the workbook's order. */
export function readWorkbook(bytes: Uint8Array): Sheet[] {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes, {
      filter: (file) =>
        file.name === 'xl/workbook.xml' ||
        file.name === 'xl/_rels/workbook.xml.rels' ||
        file.name === 'xl/sharedStrings.xml' ||
        file.name === 'xl/styles.xml' ||
        file.name.startsWith('xl/worksheets/sheet'),
    });
  } catch {
    throw new WorkbookError('not a zip');
  }
  const text = (name: string) => {
    const file = files[name];
    return file ? strFromU8(file) : null;
  };
  const workbook = text('xl/workbook.xml');
  if (workbook === null) throw new WorkbookError('no workbook');
  const strings = [...(text('xl/sharedStrings.xml') ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
    (m) => itemText(m[1] ?? ''),
  );
  const dates = dateStyles(text('xl/styles.xml'));
  const date1904 = /<workbookPr\b[^>]*\bdate1904="(1|true)"/.test(workbook);
  const targets = new Map<string, string>();
  for (const match of (text('xl/_rels/workbook.xml.rels') ?? '').matchAll(
    /<Relationship\b[^>]*>/g,
  )) {
    const id = attr(match[0], 'Id');
    const target = attr(match[0], 'Target');
    if (id && target) targets.set(id, target.replace(/^\/?(xl\/)?/, 'xl/'));
  }
  const sheets: Sheet[] = [];
  for (const match of workbook.matchAll(/<sheet\b[^>]*>/g)) {
    const name = attr(match[0], 'name') ?? '';
    const id = attr(match[0], 'r:id');
    const path = id ? targets.get(id) : undefined;
    const xml = path ? text(path) : null;
    if (xml !== null) sheets.push({ name, rows: readSheet(xml, strings, dates, date1904) });
  }
  if (sheets.length === 0) {
    const first = Object.keys(files).find((n) => n.startsWith('xl/worksheets/sheet'));
    const xml = first ? text(first) : null;
    if (xml !== null) sheets.push({ name: '', rows: readSheet(xml, strings, dates, date1904) });
  }
  return sheets;
}
