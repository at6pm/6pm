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
  // Word that an order arrived: it was paid for when it was placed, and read then.
  'giao hang thanh cong',
  'giao thanh cong',
  'da giao hang',
  'da duoc giao',
  'da nhan hang',
  'delivered',
];

/**
 * A subject that says what the email is, and it is not a payment: a statement, a survey, a warning,
 * a delivery.
 */
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

/**
 * Subjects of an order or booking changing after it was paid: rescheduled, changed, on its way.
 * Such a mail can print "Đã thanh toán hôm nay" exactly as the payment's did; what it is, not that
 * line, says it moved no money.
 */
const ORDER_UPDATE_SUBJECT = [
  'cap nhat',
  'thay doi',
  'doi lich',
  'dang giao',
  'dang van chuyen',
  'dang duoc giao',
  'updated',
  'update',
  'changed',
  'changes to',
  'rescheduled',
  'modified',
  'shipped',
  'on its way',
  'out for delivery',
];

/** A subject that says an order or a booking changed, not that it was paid. */
export function subjectIsOrderUpdate(subject: string): boolean {
  return hasAny(foldWords(subject), ORDER_UPDATE_SUBJECT);
}

/** Words for a payment the bank took back: reversed, not refunded by the shop. */
const REVERSAL = [
  'dao giao dich',
  'giao dich bi dao',
  'hoan tra giao dich',
  'reversal',
  'reversed',
  'transaction reversed',
];

/** The subject or the status line says the bank reversed the payment. */
export function isReversal(subject: string, lines: readonly string[]): boolean {
  if (hasAny(foldWords(subject), REVERSAL)) return true;
  const status = valueOf(lines, STATUS_LABELS);
  return status !== null && hasAny(foldWords(status), REVERSAL);
}

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
  'not charged',
];

/**
 * Words that say an order or a charge was called off. Never a bare "hủy" in a subject, where it
 * can be a person's name ("… đến NGUYEN VAN HUY") or a policy's ("Chính sách hủy").
 */
const CANCELLED = ['da huy', 'bi huy', 'da bi huy', 'cancelled', 'canceled'];

/** What a status line says of a charge called off, the line holding nothing else: "Hủy". */
const CANCELLED_STATUS = new Set(['huy', 'da huy', 'bi huy', 'da bi huy', 'cancelled', 'canceled']);

/** A subject about money given back: a cancelled order's refund is money that did move. */
const REFUND_SUBJECT = ['hoan tien', 'hoan tra', 'refund', 'refunded'];

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
  'nguoi chuyen tien',
  'ten nguoi chuyen tien',
  'remitter',
  'remitter name',
  'remitter s name',
]);

/** Labels of the line that says what kind of transaction it was: "Loại giao dịch / Bán ngoại tệ". */
const TYPE_LABELS = new Set(['loai giao dich', 'transaction type', 'type of transaction']);

const EMAIL_LABELS = [STATUS_LABELS, MERCHANT_LABELS, PAYER_LABELS, TYPE_LABELS];

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
  return valuesOf(lines, labels)[0] ?? null;
}

/** Every value printed for `labels`, in order: a transfer names the account it left and its holder. */
function valuesOf(lines: readonly string[], labels: ReadonlySet<string>): string[] {
  const values: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const found = splitLabel(lines[i] ?? '', labels);
    if (!found) continue;
    if (found.value !== '') {
      values.push(found.value);
      continue;
    }
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      const below = lines[j] ?? '';
      if (isLabel(below)) continue;
      values.push(below);
      break;
    }
  }
  return values;
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

/**
 * A charge that did not go through, or was called off: the subject says so, the status line does
 * ("Tình trạng giao dịch: Hủy", "Status: Cancelled"), or a line says only "Not charged". Words
 * about cancelling anywhere else (a ticket's policy, how to end a subscription) say nothing of
 * this payment, and a refund's subject may name the cancelled order it gives back.
 */
export function isFailed(subject: string, lines: readonly string[]): boolean {
  const about = foldWords(subject);
  if (hasAny(about, FAILED)) return true;
  if (hasAny(about, CANCELLED) && !hasAny(about, REFUND_SUBJECT)) return true;
  if (lines.some((line) => foldWords(line) === ' not charged ')) return true;
  const status = valueOf(lines, STATUS_LABELS);
  if (status === null) return false;
  const said = foldWords(status);
  return hasAny(said, FAILED) || hasAny(said, CANCELLED) || CANCELLED_STATUS.has(said.trim());
}

/** Words for one currency sold or bought for another, as a bank names the transaction. */
const EXCHANGE = [
  'ban ngoai te',
  'mua ngoai te',
  'mua ban ngoai te',
  'foreign currency sale',
  'foreign currency purchase',
  'currency exchange',
];

/**
 * The person's own money changing form: foreign currency sold for đồng or bought with it, between
 * their own accounts ("Giao dịch bán ngoại tệ thành công", "Loại giao dịch: Bán ngoại tệ online").
 */
export function isCurrencyExchange(subject: string, lines: readonly string[]): boolean {
  if (hasAny(foldWords(subject), EXCHANGE)) return true;
  return valuesOf(lines, TYPE_LABELS).some((type) => hasAny(foldWords(type), EXCHANGE));
}

/** A foreign amount as receipts print one: "$22.00", "US$ 22", "22.00 USD", "€9,99". */
const FOREIGN_MONEY =
  /(?:us\$|s\$|a\$|hk\$|\$|€|£|¥)\s?\d|(?<![\p{L}\d])(?:usd|eur|gbp|sgd|aud|cad|jpy|cny|thb|krw|hkd)\s?\d|\d\s?(?:usd|eur|gbp|sgd|aud|cad|jpy|cny|thb|krw|hkd|\$|€|£)(?!\p{L})/iu;

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
  return paidValues(lines).reduce<Vnd | null>((paid, value) => firstDong(value) ?? paid, null);
}

/**
 * A receipt whose paid total is labelled in another currency and nowhere in đồng ("Amount paid
 * $16.50"): what it cost is not for these rules to price, and the đồng it prints elsewhere is
 * something else (a tax line's "VAT - Vietnam (10%) $1.50 (₫38,400)", a quantity).
 */
export function paidAbroad(lines: readonly string[]): boolean {
  const values = paidValues(lines);
  return (
    values.some((value) => FOREIGN_MONEY.test(value)) &&
    values.every((value) => firstDong(value) === null)
  );
}

/** The value beside each paid-total label, in the order printed. */
function paidValues(lines: readonly string[]): string[] {
  const values: string[] = [];
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
    if (value !== undefined) values.push(value);
  }
  return values;
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
  const to = foldWords(payee);
  // Vietcombank prints the account's number under one label and its holder under another
  // ("Tài khoản nguồn 0071…", "Tên người chuyển tiền TRAN VAN AN"): any of them can name the payer.
  return valuesOf(lines, PAYER_LABELS).some((payer) => {
    const from = foldWords(cleanPayeeName(payer));
    return /[a-z]{2}/.test(from) && from === to;
  });
}

/** Labels a booking site prints its own code under ("Mã đặt chỗ: 1234567890", "Booking ID"). */
const BOOKING_CODE_LABELS = [
  'ma dat cho',
  'ma so dat cho',
  'ma dat phong',
  'ma so dat phong',
  'ma dat ve',
  'booking id',
  'booking code',
  'booking reference',
  'booking number',
  'booking no',
  'reservation code',
  'reservation number',
  'confirmation code',
  'confirmation number',
  'itinerary number',
];

/** One or more codes after a label: "1234567890, 1234567891", "A-0000TEST1". */
const BOOKING_CODES = /^\s*((?:[A-Z0-9][A-Z0-9-]{3,})(?:\s*,\s*[A-Z0-9][A-Z0-9-]{3,})*)/iu;

/**
 * The code a booking site gives a booking, as the first line that labels it prints it (the
 * subject first): every code it names, joined by commas. Null when none is labelled. Its later
 * mails about the same booking print the same code.
 */
export function bookingCodeOf(lines: readonly string[]): string | null {
  for (const line of lines) {
    const mark = /[:#]/u.exec(line);
    if (!mark) continue;
    const label = foldWords(line.slice(0, mark.index));
    if (!BOOKING_CODE_LABELS.some((name) => label.endsWith(` ${name} `))) continue;
    const codes = BOOKING_CODES.exec(line.slice(mark.index + 1))?.[1];
    const kept = (codes ?? '')
      .split(',')
      .map((code) => code.trim().toUpperCase())
      .filter((code) => /\d/.test(code));
    if (kept.length > 0) return kept.join(',').slice(0, 40);
  }
  return null;
}
