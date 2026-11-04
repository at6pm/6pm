import { strFromU8 } from 'fflate';

/**
 * Text files as exports write them: UTF-8 with or without a byte order mark (or UTF-16 with one,
 * as Excel's "Unicode text" saves), comma, semicolon or tab between fields, fields in quotes that
 * may hold the separator, a doubled quote or a line break, and CRLF or LF line ends.
 */

/** The file's text: UTF-16 by its byte order mark, else UTF-8, a leading mark dropped. */
export function decodeText(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return utf16(bytes.subarray(2), true);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return utf16(bytes.subarray(2), false);
  const text = strFromU8(bytes);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function utf16(bytes: Uint8Array, little: boolean): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: string[] = [];
  const chunk: number[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    chunk.push(view.getUint16(i, little));
    if (chunk.length === 4096) {
      parts.push(String.fromCharCode(...chunk));
      chunk.length = 0;
    }
  }
  parts.push(String.fromCharCode(...chunk));
  return parts.join('');
}

const SEPARATORS = [',', ';', '\t'] as const;

/** The separator a file uses: the one its first lines split into the most, equally, fields by. */
export function separatorOf(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
    .slice(0, 10);
  let best: string = ',';
  let bestScore = -1;
  for (const sep of SEPARATORS) {
    const counts = lines.map((line) => {
      let n = 0;
      let quoted = false;
      for (const ch of line) {
        if (ch === '"') quoted = !quoted;
        else if (ch === sep && !quoted) n++;
      }
      return n;
    });
    const first = counts[0] ?? 0;
    // A separator every line agrees on beats one that is merely frequent.
    const agree = counts.filter((n) => n === first).length;
    const score = first === 0 ? 0 : agree * 1000 + first;
    if (score > bestScore) {
      best = sep;
      bestScore = score;
    }
  }
  return best;
}

/** The rows of a delimited text file, every field as written (quotes taken off). */
export function readCsv(text: string, separator = separatorOf(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let wasQuoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? '';
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"' && field.trim() === '' && !wasQuoted) {
      quoted = true;
      wasQuoted = true;
      field = '';
    } else if (ch === separator) {
      row.push(wasQuoted ? field : field.trim());
      field = '';
      wasQuoted = false;
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(wasQuoted ? field : field.trim());
      if (row.length > 1 || (row[0] ?? '') !== '') rows.push(row);
      row = [];
      field = '';
      wasQuoted = false;
    } else field += ch;
  }
  if (field !== '' || row.length > 0) {
    row.push(wasQuoted ? field : field.trim());
    if (row.length > 1 || (row[0] ?? '') !== '') rows.push(row);
  }
  return rows;
}
