import { billTopicOf } from './bill-topic';
import { namesNoPayee } from './payee-names';

/**
 * Where each bank's alert names who was paid, or who paid in, when it does not say it after
 * "đến/cho/tại/từ/to/at/from" (the reading every bank gets). Each shape is one line of data: the
 * banks that print it (by their catalogue id), the way of the money, where the name sits (the
 * transfer's memo, or the alert's own words before it), and the pattern whose first group is the
 * name. When a bank rewords its alerts, the new shape goes in beside the old one with the month
 * it was first seen, and both stay: a phone on an older app version still gets the old wording.
 *
 * Written from the alert wordings 6pm's tests hold (MB, Techcombank, ACB, VIB, BIDV, VietinBank,
 * Sacombank, OCB); every other bank is read the shared way only.
 */
export interface AlertPayeeShape {
  /** Catalogue ids of the banks that print it ("MB", "TCB"). */
  readonly banks: readonly string[];
  readonly way: 'out' | 'in';
  /** `memo`: the transfer's own words ("ND:", "Mô tả:"); `text`: the alert before the memo. */
  readonly from: 'memo' | 'text';
  /** Case-insensitive, Unicode; the first group is the name. */
  readonly pattern: string;
  /** The month the wording was first seen, for telling a bank's versions apart. */
  readonly since: string;
}

/** A sender's name, two to five words of letters only, as banks print it in a memo. */
const SENDER = String.raw`(\p{L}+(?:\s+\p{L}+){1,4}?)`;
/** What a sender writes after their name: "chuyển tiền", "CK", "trả nợ", "trả tiền ăn". */
const SENT_WORDS = String.raw`(?:chuy[eể]n\s*ti[eề]n|chuy[eể]n\s*kho[aả]n|ck|tr[aả]\s*n[oợ]|tr[aả]\s*ti[eề]n)`;

const SENDER_IN_MEMO = String.raw`^${SENDER}\s+${SENT_WORDS}(?:\s|$)`;

export const ALERT_PAYEE_SHAPES: readonly AlertPayeeShape[] = [
  // "ND: NGUYEN VAN A chuyen tien"
  { banks: ['MB'], way: 'in', from: 'memo', pattern: SENDER_IN_MEMO, since: '2026-10' },
  // "Mô tả: NGUYEN VAN A chuyen tien"
  { banks: ['TCB'], way: 'in', from: 'memo', pattern: SENDER_IN_MEMO, since: '2026-10' },
  // "GD: NGUYEN VAN B CHUYEN KHOAN"
  { banks: ['ACB'], way: 'in', from: 'memo', pattern: SENDER_IN_MEMO, since: '2026-10' },
  // "ND: Tran Thi B tra tien an"
  { banks: ['VIB'], way: 'in', from: 'memo', pattern: SENDER_IN_MEMO, since: '2026-10' },
  // "ND: TRAN THI C tra no"
  { banks: ['BIDV'], way: 'in', from: 'memo', pattern: SENDER_IN_MEMO, since: '2026-10' },
  // "Nội dung: thanh toan Grab", "ND:Thanh toan Shopee"
  {
    banks: ['ICB', 'STB'],
    way: 'out',
    from: 'memo',
    pattern: String.raw`^thanh\s*to[aá]n\s+(\p{L}[\p{L}\s.&'*-]{1,40})$`,
    since: '2026-10',
  },
  // "Nội dung: Grab thanh toan"
  {
    banks: ['OCB'],
    way: 'out',
    from: 'memo',
    pattern: String.raw`^(\p{L}[\p{L}\s.&'*-]{1,40}?)\s+thanh\s*to[aá]n$`,
    since: '2026-10',
  },
];

const compiled = new Map<string, RegExp>();
const regexOf = (pattern: string) => {
  let found = compiled.get(pattern);
  if (!found) {
    found = new RegExp(pattern, 'iu');
    compiled.set(pattern, found);
  }
  return found;
};

/**
 * What a memo can say after "thanh toán" that is the bill or the purpose paid, not who was paid:
 * a bill, a card, a service, money, a debt, power, water, the phone, the internet, school fees.
 */
const NOT_A_PAYEE =
  /^(?:h[oó]a\s*[đd][oơ]n|ho[aá]\s*[đd][oơ]n|th[eẻ]|d[iị]ch\s*v[uụ]|ti[eề]n|n[oợ]|[đd]i[eệ]n|n[uư][oớ]c|c[uư][oớ]c|internet|h[oọ]c\s*ph[ií])(?:\s|$)/iu;

/** A name a shape read that can be a payee: letters, not a bank, not a bill's topic. */
function asPayee(raw: string | undefined): string | null {
  const name = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!/\p{L}{2}/u.test(name) || name.length > 60) return null;
  if (namesNoPayee(name) || NOT_A_PAYEE.test(name) || billTopicOf(name) !== null) return null;
  return name;
}

/** The shapes a bank prints, newest first; none for a bank the list does not hold. */
export function shapesOf(
  bankId: string | null,
  shapes: readonly AlertPayeeShape[] = ALERT_PAYEE_SHAPES,
): readonly AlertPayeeShape[] {
  if (bankId === null) return [];
  return shapes
    .filter((shape) => shape.banks.includes(bankId))
    .sort((a, b) => (a.since < b.since ? 1 : a.since > b.since ? -1 : 0));
}

/**
 * The name a bank's own shapes read from its alert, or null when none of its shapes reads one.
 * `text` is the alert before its memo.
 */
export function payeeByShape(
  bankId: string | null,
  way: 'out' | 'in',
  parts: { readonly memo: string | null; readonly text: string },
  shapes: readonly AlertPayeeShape[] = ALERT_PAYEE_SHAPES,
): string | null {
  for (const shape of shapesOf(bankId, shapes)) {
    if (shape.way !== way) continue;
    const where = shape.from === 'memo' ? parts.memo : parts.text;
    if (!where) continue;
    const name = asPayee(regexOf(shape.pattern).exec(where.trim())?.[1]);
    if (name !== null) return name;
  }
  return null;
}
