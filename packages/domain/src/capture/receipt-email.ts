import type { Vnd } from '../money/format';
import { BANKS } from '../vietqr/bank-catalogue';
import { namesRepayment } from './bill-payment';
import { cleanMemo, parseBankReceipt, readFields, readReceiptTime, toRows } from './bank-receipt';
import { htmlToLines, readForwarded, textToLines, type EmailSender } from './email-body';
import { dongIn } from './receipt-amount';
import {
  cardMerchant,
  cleanPayeeName,
  isAdvert,
  isFailed,
  isMailingList,
  isOwnTransfer,
  joinBrokenLabels,
  paidTotal,
  receiptFrom,
  subjectIsNotPayment,
  subjectNamesTransaction,
} from './receipt-email-signs';
import { withFullYears } from './receipt-time';
import { foldWords } from './spoken-spend';

/** Vietnamese banks and shops print their local time, UTC+7. */
export const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;

/** An email as the mail parser hands it over: decoded, nothing else of it is kept. */
export interface ReceiptEmail {
  readonly from: EmailSender | null;
  readonly subject: string;
  /** The Date header as an instant (ISO 8601), when it had one. */
  readonly date: string | null;
  readonly text: string | null;
  readonly html: string | null;
}

/** A spend read from a receipt email. */
export interface EmailReceipt {
  readonly amount: Vnd;
  /** Who was paid: the shop that sent it, else the payee the receipt names; empty when neither. */
  readonly merchant: string;
  /** When it was paid, ISO 8601 in UTC. */
  readonly at: string;
  /** The address the receipt came from: the original sender of a forwarded email. */
  readonly from: string | null;
  readonly bank: string | null;
  readonly code: string | null;
  /** The transfer's own words ("Nội dung: Thanh toan the tin dung"); null when it printed none. */
  readonly memo: string | null;
  /** Money that came in, or a refund of a spend; absent for a payment out. */
  readonly kind?: 'incoming' | 'refund';
}

export interface ReceiptEmailOptions {
  /** When the email arrived, ISO 8601: the time of a receipt that prints none. */
  readonly receivedAt: string;
  /** The zone the receipt's printed time is in. Vietnam unless said otherwise. */
  readonly utcOffsetMinutes?: number;
}

/** Shops whose e-receipts 6pm reads, by a word of their sending domain. */
const SHOPS: Readonly<Record<string, string>> = {
  grab: 'Grab',
  be: 'Be',
  shopee: 'Shopee',
  shopeefood: 'ShopeeFood',
  xanhsm: 'Xanh SM',
  gojek: 'Gojek',
  tiki: 'Tiki',
  lazada: 'Lazada',
  baemin: 'Baemin',
};

const BANK_BY_WORD = new Map<string, string>(
  BANKS.flatMap((bank) => {
    const words = [foldWords(bank.shortName).replace(/ /g, '')];
    if (bank.id.length >= 3) words.push(bank.id.toLowerCase());
    return words.map((word) => [word, bank.shortName] as const);
  }),
);

/** The words of an address's domain, without the endings every domain has. */
function domainWords(address: string): string[] {
  const domain = address.split('@')[1] ?? '';
  return domain.split('.').filter((w) => !['com', 'vn', 'net', 'org', 'info'].includes(w));
}

function shopOf(sender: EmailSender | null): string | null {
  if (!sender) return null;
  for (const word of domainWords(sender.address)) {
    const shop = SHOPS[word];
    if (shop) return shop;
  }
  return null;
}

function bankOf(sender: EmailSender | null): string | null {
  if (!sender) return null;
  for (const word of domainWords(sender.address)) {
    const bank = BANK_BY_WORD.get(word.replace(/[^a-z0-9]/g, ''));
    if (bank) return bank;
  }
  return null;
}

/** Totals as shops print them, read as the receipt's amount. */
const TOTAL_LABELS = new Set([
  'total',
  'grand total',
  'total paid',
  'total amount',
  'amount paid',
  'you paid',
  'tong cong',
  'tong thanh toan',
  'tong so tien',
  'thanh tien',
  'ban da thanh toan',
  'da thanh toan',
  'amount charged',
  'charged',
  'khoan thanh toan',
  'gia tri',
  'gia tri giao dich',
]);

const LABEL_AND_VALUE =
  /^(.{2,40}?)\s*(?::|\t|\s{2,}|\s(?=[-–]?\s?(?:vnd|vnđ|₫|đ)?\s?\d))\s*(.+)$/iu;

/** "Total ₫38,000" → "Số tiền: ₫38,000"; a total's label alone on its line → "Số tiền". */
function withTotalsAsAmount(line: string): string {
  if (TOTAL_LABELS.has(foldWords(line).trim())) return 'Số tiền';
  const split = LABEL_AND_VALUE.exec(line);
  if (
    split?.[1] &&
    split[2] &&
    /\d/.test(split[2]) &&
    TOTAL_LABELS.has(foldWords(split[1]).trim())
  ) {
    return `Số tiền: ${split[2]}`;
  }
  return line;
}

const SIGNED_AMOUNT = /(?:^|[\s:|(])([+-])\s?(?:vnd\s?)?\d{1,3}(?:[.,]\d{3})+/giu;

/** Money that came in: a balance change only ever signed `+`, or a credit with no debit. */
function isIncoming(lines: readonly string[]): boolean {
  const text = lines.join('\n');
  const signs = new Set([...text.matchAll(SIGNED_AMOUNT)].map((m) => m[1]));
  if (signs.has('+') && !signs.has('-')) return true;
  const folded = foldWords(text);
  const credit = [' ghi co ', ' bao co ', ' credited ', ' you received ', ' ban da nhan '];
  const debit = [' ghi no ', ' bao no ', ' debited '];
  return credit.some((w) => folded.includes(w)) && !debit.some((w) => folded.includes(w));
}

const NOTE_LINE =
  /^(?:nội dung|noi dung|nd|mô tả|mo ta|description|details|diễn giải|dien giai)\s*[:\t]\s*(.+)$/iu;
const PAID_AT = /(?:^|\s)(?:tại|tai|at|tới|toi|to)\s+([^\d]+?)\s*(?:[-–.,;]|\d|$)/iu;

/** The transfer's words on a "Nội dung:" line, as the receipt printed them. */
function noteIn(lines: readonly string[]): string | null {
  for (const line of lines) {
    const note = cleanMemo(NOTE_LINE.exec(line)?.[1]);
    if (note !== null) return note;
  }
  return null;
}

/** "Nội dung: Thanh toan QR tai HIGHLANDS COFFEE" → "HIGHLANDS COFFEE", for a payee no label names. */
function payeeInNote(lines: readonly string[]): string {
  for (const line of lines) {
    const note = NOTE_LINE.exec(line)?.[1];
    const payee = note ? PAID_AT.exec(note)?.[1]?.trim() : undefined;
    if (payee && /\p{L}{2}/u.test(payee)) return payee;
  }
  return '';
}

/** A time read as this runtime's local wall clock, moved to the zone the receipt printed it in. */
function inZone(localIso: string, utcOffsetMinutes: number): string {
  const d = new Date(localIso);
  const wall = Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  );
  return new Date(wall - utcOffsetMinutes * 60_000).toISOString();
}

/** A forwarded Date line in Gmail's or Outlook's words, as `readReceiptTime` reads dates. */
function forwardedTime(value: string | null): string | null {
  if (!value) return null;
  const plain = value
    .replace(/\b([a-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})/i, '$2 $1 $3')
    .replace(/(\d{1,2}) thg (\d{1,2}),? (\d{4})/i, '$1/$2/$3')
    .replace(/ at | lúc /gi, ' ');
  return readReceiptTime(plain);
}

/** Where an email came from: its body lines, the original sender of a forwarded one, its date. */
export interface EmailOrigin {
  /** The subject without the "Fwd:" a forward put before it. */
  readonly subject: string;
  /** The subject, then the body with any forwarded header taken out. */
  readonly lines: readonly string[];
  readonly sender: EmailSender | null;
  /** The bank the sender is, from its domain. */
  readonly bank: string | null;
  /** The forwarded email's own Date line, as printed. */
  readonly forwardedDate: string | null;
}

export function emailOrigin(email: ReceiptEmail): EmailOrigin {
  const body = email.html ? htmlToLines(email.html) : textToLines(email.text ?? '');
  const forwarded = readForwarded(body);
  const subject = email.subject.replace(/^(?:\s*(?:fwd?|tr|chuyển tiếp)\s*:)+/iu, '').trim();
  const sender = forwarded.from ?? email.from;
  return {
    subject,
    lines: [subject, ...forwarded.lines].filter((l) => l !== ''),
    sender,
    bank: bankOf(sender),
    forwardedDate: forwarded.date,
  };
}

/** How far a receipt's printed day can be from when its email was sent, in any time zone. */
const DATE_ONLY_SLACK_MS = 36 * 60 * 60_000;

/**
 * A printed time that is only a date: midnight, as a model writes a date it was given no clock
 * for, or noon, as `readReceiptTime` takes one.
 */
function isDateOnly(localIso: string): boolean {
  const d = new Date(localIso);
  return (
    d.getMinutes() === 0 && d.getSeconds() === 0 && (d.getHours() === 0 || d.getHours() === 12)
  );
}

/**
 * When a receipt was paid: the time it prints (local, `YYYY-MM-DDTHH:MM:SS`, taken as Vietnam
 * time), else the forwarded email's own date, else the email's Date, else when it arrived. A time
 * later than its arrival is not believed. A receipt that prints only its day ("Date paid October
 * 22, 2026") was paid when its email was sent, when that is the same day in some zone: its midnight
 * would file it on the day before and miss every other sighting of the payment.
 */
export function emailPaidAt(
  printedLocal: string | null,
  origin: Pick<EmailOrigin, 'forwardedDate'>,
  email: Pick<ReceiptEmail, 'date'>,
  options: ReceiptEmailOptions,
): string {
  const offset = options.utcOffsetMinutes ?? VIETNAM_UTC_OFFSET_MINUTES;
  const fromForward = forwardedTime(origin.forwardedDate);
  const printed = printedLocal ? inZone(printedLocal, offset) : null;
  const sent = fromForward ? inZone(fromForward, offset) : email.date;
  const sentThatDay =
    printedLocal !== null &&
    printed !== null &&
    sent !== null &&
    isDateOnly(printedLocal) &&
    Math.abs(Date.parse(sent) - Date.parse(printed)) <= DATE_ONLY_SLACK_MS;
  const candidates = [
    sentThatDay ? sent : null,
    printed,
    fromForward ? inZone(fromForward, offset) : null,
    email.date,
  ];
  const arrived = Date.parse(options.receivedAt);
  return (
    candidates.find((c) => c !== null && Date.parse(c) <= arrived + 10 * 60_000) ??
    new Date(arrived).toISOString()
  );
}

/** A subject that says money was given back ("Hoàn tiền thành công", "Your refund"), not asked for. */
function isRefund(subject: string): boolean {
  const folded = foldWords(subject);
  const refund = [' hoan tien ', ' hoan tra ', ' refund ', ' refunded '];
  const asked = [' yeu cau ', ' request ', ' requested '];
  return refund.some((w) => folded.includes(w)) && !asked.some((w) => folded.includes(w));
}

/**
 * An amount signed as money out ("GD: -45,000VND"), as balance changes print one: never the second
 * half of a range ("1,500 - 3,000 USD"), nor in another currency.
 */
const DEBIT =
  /(?:^|[:|(]|(?<![\d.,]\s?)\s)-\s?(?:vnd\s?)?\d{1,3}(?:[.,]\d{3})+(?![.,]?\d|\s?(?:usd|us\$|\$|eur|€))/iu;

/** A payee read from a sentence ("… tới PHO HOA lúc 12:30"): in capitals as banks print one, or short. */
function sentencePayee(payee: string): string {
  const name = cleanPayeeName(payee.replace(/\s+on\s+\p{L}{3,}\.?\s+\d.*$/u, ''));
  return !/\p{Ll}/u.test(name) || name.split(' ').length <= 6 ? name : '';
}

/**
 * Reads the spend in a bank notification or a shop's e-receipt, forwarded or sent on by a filter,
 * with rules alone: the body (HTML tables or plain text) is turned into lines and read like a
 * shared receipt, with shop totals read as the amount (the last total paid, when one is labelled)
 * and two-digit years ("27/10/26 12:30") read as this century's. The shop or bank comes from the
 * sender's domain; otherwise who was paid is the shop a card alert names, the labelled payee, who
 * a receipt is from, or the payee its note names. Money that came in is read the same way and
 * marked `incoming`, or `refund` when the subject says it was given back.
 *
 * Null when it holds no payment: no amount; an advert ("[QC]"), a statement, a survey or a
 * warning by its subject; a charge that did not go through; a transfer between the person's own
 * accounts (unless it repays a card); or an amount only found in prose, in an email whose subject
 * names no transaction or that is sent to a mailing list. The server reads email with a model when
 * it can (`emailSpendOf`); this is what it falls back to.
 */
export function parseReceiptEmail(
  email: ReceiptEmail,
  options: ReceiptEmailOptions,
): EmailReceipt | null {
  const origin = emailOrigin(email);
  const subject = origin.subject;
  if (isAdvert(subject) || subjectIsNotPayment(subject)) return null;
  const printed = joinBrokenLabels(origin.lines.map(withFullYears));
  if (isFailed(subject, printed)) return null;
  const lines = printed.map(withTotalsAsAmount);
  const refund = isRefund(email.subject);
  const incoming = refund || isIncoming(lines);
  const receiptLines = lines.map((text) => ({ text }));
  const receipt = parseBankReceipt(receiptLines);
  const paid = paidTotal(printed);
  const amount = paid ?? receipt?.amount ?? null;
  if (!receipt || amount === null) return null;

  const { fields } = readFields(toRows(receiptLines));
  const labelledAmount = fields.get('amount');
  const labelled =
    paid !== null || (labelledAmount !== undefined && dongIn(labelledAmount.value) !== null);
  const debit = DEBIT.test(lines.join('\n'));
  const named = subjectNamesTransaction(subject) && !isMailingList(lines);
  if (!labelled && !debit && !named) return null;

  const labelledPayee = cleanPayeeName(fields.get('payee')?.value ?? '');
  const memo = receipt.memo ?? noteIn(lines);
  if (labelledPayee !== '' && isOwnTransfer(lines, labelledPayee) && !namesRepayment(memo ?? '')) {
    return null;
  }
  const payee =
    cardMerchant(lines) ||
    labelledPayee ||
    receiptFrom(lines) ||
    payeeInNote(lines) ||
    sentencePayee(receipt.payee);
  return {
    ...(incoming ? { kind: refund ? ('refund' as const) : ('incoming' as const) } : {}),
    amount,
    // For money in, the payee a receipt names is the person themselves: only a shop is said.
    merchant: shopOf(origin.sender) ?? (incoming ? '' : payee),
    at: emailPaidAt(receipt.at, origin, email, options),
    from: origin.sender?.address ?? null,
    bank: origin.bank ?? receipt.bank,
    code: receipt.code,
    memo,
  };
}

/** What a bank's transfer email says under its labels about who was paid. */
export interface LabelledTransfer {
  /** Who it went to, as labelled ("Người thụ hưởng", "Beneficiary"); empty when no label says. */
  readonly payee: string;
  /** The transfer's own words, as printed; null when it printed none. */
  readonly memo: string | null;
  /**
   * The person's own accounts on both sides (the account it left is in the payee's name), and
   * not a card's repayment.
   */
  readonly own: boolean;
}

/**
 * The payee a transfer email labels, and whether the transfer was between the person's own
 * accounts, read with rules as `parseReceiptEmail` reads them, for a model's reading to be
 * checked against.
 */
export function labelledTransfer(email: ReceiptEmail): LabelledTransfer {
  const printed = joinBrokenLabels(emailOrigin(email).lines.map(withFullYears));
  const lines = printed.map(withTotalsAsAmount);
  const receiptLines = lines.map((text) => ({ text }));
  const payee = cleanPayeeName(readFields(toRows(receiptLines)).fields.get('payee')?.value ?? '');
  const memo = parseBankReceipt(receiptLines)?.memo ?? noteIn(lines);
  const own = payee !== '' && isOwnTransfer(lines, payee) && !namesRepayment(memo ?? '');
  return { payee, memo, own };
}
