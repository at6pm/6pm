import type { Vnd } from '../money/format';
import { labelOf } from './bank-receipt';
import { dongIn } from './receipt-amount';
import { foldWords } from './spoken-spend';

/**
 * What the rules look for in an email before believing it holds a payment, and how they name who
 * was paid. Everything here reads the email's lines (subject first) as `emailOrigin` gives them.
 */

const hasAny = (folded: string, words: readonly string[]) =>
  words.some((word) => folded.includes(` ${word} `));

/** Vietnamese law has advertising email say so first: "[QC] Ưu đãi …". */
export function isAdvert(subject: string): boolean {
  return /^\s*[[(]\s*QC\s*[\])]/iu.test(subject);
}

/** Subjects that name what an email is about when it is not a payment made. */
const NOT_PAYMENT_SUBJECT = [
  // A statement or a points summary: a period's figures, never one payment.
  'sao ke',
  'statement',
  'diem thuong',
  // A survey about an order already read when it was paid.
  'y kien',
  'khao sat',
  'survey',
  'feedback',
  // A warning about something that has not been charged yet.
  'expiring',
  'will expire',
  'sap het han',
  'reminder',
];

/** A subject that says what the email is, and it is not a payment: a statement, a survey, a warning. */
export function subjectIsNotPayment(subject: string): boolean {
  return hasAny(foldWords(subject), NOT_PAYMENT_SUBJECT);
}

/** Subjects that name money moving: a receipt, a transaction, an order, a balance change. */
const TRANSACTION_SUBJECT = [
  'giao dich',
  'thanh toan',
  'bien dong',
  'so du',
  'bien lai',
  'bien nhan',
  'hoa don',
  'don hang',
  'chuyen tien',
  'chuyen khoan',
  'hoan tien',
  'hoan tra',
  'ghi no',
  'ghi co',
  'mua hang',
  'chuyen di',
  'receipt',
  'payment',
  'paid',
  'transaction',
  'order',
  'invoice',
  'purchase',
  'charged',
  'refund',
  'refunded',
  'transfer',
  'trip',
  'ride',
  'booking',
];

export function subjectNamesTransaction(subject: string): boolean {
  return hasAny(foldWords(subject), TRANSACTION_SUBJECT);
}

/** Words of a mailing list's footer: an email that has one is sent to many, not about one payment. */
const MAILING_LIST = ['unsubscribe', 'huy dang ky', 'ngung nhan', 'tu choi nhan'];

export function isMailingList(lines: readonly string[]): boolean {
  return lines.some((line) => hasAny(foldWords(line), MAILING_LIST));
}

/** Words that say a charge did not go through. */
const FAILED = [
  'khong thanh cong',
  'that bai',
  'bi tu choi',
  'unsuccessful',
  'not successful',
  'failed',
  'declined',
];

/** Labels of the line that says how a transaction ended: "Tình trạng giao dịch / Status". */
const STATUS_LABELS = new Set([
  'tinh trang',
  'tinh trang giao dich',
  'trang thai',
  'trang thai giao dich',
  'ket qua',
  'ket qua giao dich',
  'status',
  'transaction status',
  'status of transaction',
]);

/** Labels card alerts put before the shop: "Tại .OP*Green SM", "Sử dụng tại / At". */
const MERCHANT_LABELS = new Set([
  'tai',
  'su dung tai',
  'at',
  'merchant',
  'merchant name',
  'don vi chap nhan',
  'don vi chap nhan the',
  'noi giao dich',
  'dia diem giao dich',
  // A wallet's e-bill: "Dịch vụ / Google".
  'dich vu',
]);

/** Labels of the account money left, whose holder is the person themselves. */
const PAYER_LABELS = new Set([
  'tai khoan trich no',
  'tai khoan nguon',
  'tu tai khoan',
  'debit account',
  'from account',
  'nguoi chuyen',
  'ten nguoi chuyen',
]);

const EMAIL_LABELS = [STATUS_LABELS, MERCHANT_LABELS, PAYER_LABELS];

/** A line that is a label the email rules know, with no value after it. */
function isLabel(line: string): boolean {
  if (/\d/.test(line)) return false;
  const folded = foldWords(line.replace(/\(.*?\)/g, ' ')).trim();
  return EMAIL_LABELS.some((labels) => labels.has(folded)) || labelOf(line) !== null;
}

/** "Tình trạng: Thành công", "Tại .OP*Green SM": the label it starts with and the value. */
function splitLabel(
  line: string,
  labels: ReadonlySet<string>,
): { label: string; value: string } | null {
  const colon = /^([^:\t\d]{1,40})[:\t]\s*(.*)$/u.exec(line);
  if (colon?.[1] !== undefined && colon[2] !== undefined) {
    const label = foldWords(colon[1].replace(/\(.*?\)/g, ' ')).trim();
    if (labels.has(label)) return { label, value: colon[2].trim() };
  }
  const folded = foldWords(line.replace(/\(.*?\)/g, ' ')).trim();
  if (labels.has(folded)) return { label: folded, value: '' };
  // "Tại .OP*Green SM": a card alert's place, with no colon after the word.
  const inline = /^(?:Tại|Sử dụng tại)\s+(\S.*)$/u.exec(line);
  if (labels === MERCHANT_LABELS && inline?.[1] && inline[1].split(/\s+/).length <= 8) {
    return { label: 'tai', value: inline[1] };
  }
  return null;
}

/**
 * The value printed for one of `labels`: after it on its line, else on the first line under it
 * that is not another label (a bilingual alert prints "Sử dụng tại", then "At", then the shop).
 */
function valueOf(lines: readonly string[], labels: ReadonlySet<string>): string | null {
  for (let i = 0; i < lines.length; i++) {
    const found = splitLabel(lines[i] ?? '', labels);
    if (!found) continue;
    if (found.value !== '') return found.value;
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      const below = lines[j] ?? '';
      if (!isLabel(below)) return below;
    }
  }
  return null;
}

/**
 * Label words a template broke over two lines ("Người" / "thụ hưởng", "Tình" / "trạng") put back
 * on one, so the label reads whole.
 */
export function joinBrokenLabels(lines: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const next = lines[i + 1];
    const short = (text: string) => !/\d/.test(text) && text.split(/\s+/).length <= 3;
    const joined = `${line} ${next ?? ''}`;
    // "Ngày," reads as a label alone, but "Ngày, giờ giao dịch" is the label printed.
    if (next !== undefined && short(line) && short(next) && !isLabel(next) && isLabel(joined)) {
      out.push(joined);
      i++;
    } else out.push(line);
  }
  return out;
}

/** A charge that did not go through: the subject says so, or the status line does. */
export function isFailed(subject: string, lines: readonly string[]): boolean {
  if (hasAny(foldWords(subject), FAILED)) return true;
  const status = valueOf(lines, STATUS_LABELS);
  return status !== null && hasAny(foldWords(status), FAILED);
}

/** Totals that are what was finally paid, after discounts and fees, in the order printed. */
const PAID_LABELS = new Set([
  'amount paid',
  'you paid',
  'total paid',
  'amount charged',
  'charged',
  'tong thanh toan',
  'ban da thanh toan',
  'da thanh toan',
  'khoan thanh toan',
  'so tien thanh toan',
]);

/** Đồng marked as such, or digits grouped in thousands with no other currency beside them. */
const MONEY =
  /(?:₫|vn[dđ])\s?\d[\d.,]*|\d[\d.,]*\s?(?:₫|vn[dđ]|đ)(?!\p{L})|(?<![\p{L}\p{Sc}\d.,]\s?)\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?(?![\d.,]|\s?[\p{L}\p{Sc}])/iu;

/** The first amount in a value, in đồng: "₫594,792 using 1 USD = 27,036 VND" → 594,792. */
function firstDong(value: string): Vnd | null {
  const money = MONEY.exec(value)?.[0];
  return money === undefined ? null : dongIn(money);
}

/**
 * What was finally paid, when the email labels it: the last of "Amount paid", "Tổng thanh toán",
 * "Charged ₫…" printed in đồng. A shop's "Tổng tiền" before vouchers, or a dollar total beside the
 * đồng it was charged as, is not it.
 */
export function paidTotal(lines: readonly string[]): Vnd | null {
  let paid: Vnd | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const whole = foldWords(line).trim();
    let value: string | undefined;
    if (PAID_LABELS.has(whole)) value = lines[i + 1];
    else {
      const split = /^(.{2,40}?)\s*(?::|\t|\s(?=[-–]?\s?(?:vnd|vnđ|₫|đ)?\s?\d))\s*(.+)$/iu.exec(
        line,
      );
      if (split?.[1] && PAID_LABELS.has(foldWords(split[1]).trim())) value = split[2];
    }
    const amount = value === undefined ? null : firstDong(value);
    if (amount !== null) paid = amount;
  }
  return paid;
}

/** Corporate endings a shop's name does without: "Eleven Labs Inc." is Eleven Labs. */
const COMPANY_ENDING =
  /(?:[,\s]+(?:co\.?,?\s*)?(?:inc|llc|ltd|limited|corp|corporation|pte|gmbh|jsc|plc)\.?)+$/iu;

/**
 * A payee as people call it: the account number after it, a household business's "HỘ KINH DOANH",
 * a card processor's "OP*", "SQ*" and a company's "Inc." taken off.
 */
export function cleanPayeeName(value: string): string {
  let name = value
    .replace(/\s*[-–|]\s*[\p{L}\d*.]*\d{3}[\p{L}\d*.]*(?:\s*\([^)]*\))?\s*$/u, '')
    .replace(/^\s*\d[\d\s.]*[-–|]\s*/u, '')
    .replace(/^[.\s]*[\p{L}\d]{1,7}\s?\*\s*(?=\S)/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  const folded = foldWords(name);
  const household = folded.startsWith(' ho kinh doanh ') ? 3 : folded.startsWith(' hkd ') ? 1 : 0;
  if (household > 0) name = name.split(' ').slice(household).join(' ');
  return name
    .replace(COMPANY_ENDING, '')
    .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '')
    .trim();
}

/**
 * The shop a card alert names: "Tại .OP*Green SM" is Green SM, "ELEVENLABS.IO +19177203691 US" is
 * ELEVENLABS.IO (the phone and country a card network adds dropped).
 */
export function cardMerchant(lines: readonly string[]): string {
  const value = valueOf(lines, MERCHANT_LABELS);
  if (value === null) return '';
  // The card network's tail: a phone and country ("+19177203691 US"), or a city and country
  // after a name of its own ("Google CLOUD 8NPWv9 Singapore SG"; "Green SM" keeps its "SM").
  const bare = value
    .replace(/\s+\+?\d[\d\s().-]{6,}\d(?:\s+[A-Z]{2,3})?\s*$/u, '')
    .replace(/^(\S+(?:\s+\S+){2,})\s+[A-Z]{2}$/u, '$1');
  const name = cleanPayeeName(bare);
  return /\p{L}{2}/u.test(name) && name.split(' ').length <= 8 ? name : '';
}

/** "Your receipt from Eleven Labs Inc. #2513-…", "Receipt from Grok xAI [#1880-8623]". */
const RECEIPT_FROM = /(?:^|\s)receipt from\s+(.+?)(?=\s*(?:[#[(]|\bamount\b|$))/iu;

/** Who a receipt says it is from, when no label names who was paid. */
export function receiptFrom(lines: readonly string[]): string {
  for (const line of lines) {
    const from = RECEIPT_FROM.exec(line)?.[1];
    const name = from === undefined ? '' : cleanPayeeName(from);
    if (/\p{L}{2}/u.test(name)) return name;
  }
  return '';
}

/**
 * A transfer between the person's own accounts: the account it left is held in the same name as
 * the one it reached ("Tài khoản trích nợ BUI VAN AN - 1000…", "Người thụ hưởng BUI VAN AN - 1028…").
 */
export function isOwnTransfer(lines: readonly string[], payee: string): boolean {
  const payer = valueOf(lines, PAYER_LABELS);
  if (payer === null) return false;
  const from = foldWords(cleanPayeeName(payer));
  return /[a-z]{2}/.test(from) && from === foldWords(payee);
}
