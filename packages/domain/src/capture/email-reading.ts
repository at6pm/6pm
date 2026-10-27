import { EMAIL_CATEGORY_IDS, type EmailCategoryId } from '../contracts/receipt-email';
import { currencyCodeSchema, receiptMinorUnits } from '../contracts/receipt-read';
import { bankNamedIn } from './bank-alert-senders';
import { cleanMemo } from './bank-receipt';
import { isAdvert } from './receipt-email-signs';
import { foldWords } from './spoken-spend';
import {
  emailOrigin,
  emailPaidAt,
  parseReceiptEmail,
  type EmailReceipt,
  type ReceiptEmail,
  type ReceiptEmailOptions,
  VIETNAM_UTC_OFFSET_MINUTES,
} from './receipt-email';

/**
 * Reading a receipt email with a model. The model says what kind of email it is and copies what a
 * payment prints; code decides the number: the amount is taken only when its text is printed in
 * the email, and is converted by `receiptMinorUnits`, never worked out by the model.
 */

/** What an email can be. A payment becomes a spend; a refund or incoming money, money in. */
export const EMAIL_KINDS = [
  'payment',
  'own_transfer',
  'refund',
  'incoming',
  'failed',
  'order_update',
  'promo',
  'otp',
  'statement',
  'other',
] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

/** The model's reading of one email, as it answered. */
export interface EmailModelReading {
  readonly kind: EmailKind;
  /** The final amount paid, copied as printed ("₫607,790", "(VND) 700,000.00", "99 USD"). */
  readonly amount: string | null;
  /** ISO 4217 code of that amount. */
  readonly currency: string | null;
  readonly merchant: string | null;
  readonly category: string | null;
  /** When it was paid, as printed in local time: `YYYY-MM-DDTHH:MM:SS`. */
  readonly at: string | null;
  /** The order id or the bank's transaction reference, as printed. */
  readonly reference: string | null;
  /** The transfer's own words ("Nội dung"), as printed. */
  readonly note: string | null;
}

/** A spend read from an email with a model: in its own currency, with a category when it says. */
export interface EmailSpend extends Omit<EmailReceipt, 'amount'> {
  /** Whole minor units of `currency`. */
  readonly amount: number;
  readonly currency: string;
  readonly category: EmailCategoryId | null;
}

/** The most of an email's text the model reads; receipts say what matters well before this. */
export const EMAIL_MODEL_TEXT_MAX = 12_000;

/** An instant as the clock at `utcOffsetMinutes` shows it, with that offset: "2026-10-27T00:08:38+07:00". */
function localStamp(instant: string, utcOffsetMinutes: number): string {
  const at = Date.parse(instant);
  if (Number.isNaN(at)) return instant;
  const wall = new Date(at + utcOffsetMinutes * 60_000).toISOString().slice(0, 19);
  const sign = utcOffsetMinutes < 0 ? '-' : '+';
  const off = Math.abs(utcOffsetMinutes);
  const hh = String(Math.floor(off / 60)).padStart(2, '0');
  const mm = String(off % 60).padStart(2, '0');
  return `${wall}${sign}${hh}:${mm}`;
}

/**
 * The text the model reads: the sender, the date and the email's lines (subject first). The date is
 * the one the person's clock showed: a receipt that prints only its day is dated from it, and a UTC
 * time copied from here would land the payment hours early, even on the day before.
 */
export function emailModelText(
  email: ReceiptEmail,
  utcOffsetMinutes: number = VIETNAM_UTC_OFFSET_MINUTES,
): string {
  const origin = emailOrigin(email);
  const sender = origin.sender;
  const sent = email.date ? localStamp(email.date, utcOffsetMinutes) : null;
  const head = [
    `From: ${sender ? `${sender.name} <${sender.address}>`.trim() : '(unknown)'}`,
    `Date: ${origin.forwardedDate ?? sent ?? '(unknown)'}`,
    '',
  ];
  return [...head, ...origin.lines].join('\n').slice(0, EMAIL_MODEL_TEXT_MAX);
}

const CURRENCY = '(?:₫|đ|vn[dđ]|us\\$|usd|\\$|idr|rp|eur|€|sgd|s\\$|thb|฿)';
/**
 * An amount as payments print one: a currency next to digits ("₫607,790", "(VND) 700,000.00",
 * "99 USD", "10,00 $ USD"), or digits grouped in thousands with no currency ("179.000", as MoMo
 * prints it).
 */
const PRINTED_MONEY = new RegExp(
  `${CURRENCY}\\)?\\s?\\(?\\s?\\d|\\d[\\d.,]*\\s?${CURRENCY}(?![a-z])|(?<![\\d.,])\\d{1,3}(?:[.,]\\d{3})+(?!\\d)`,
  'iu',
);

/**
 * Whether an email's subject or body prints anything that could be an amount paid. One that does
 * not (an alert, a sign-in code, a newsletter) holds no payment, and is never sent to the model;
 * nor is an advert, which Vietnamese law has say so in its subject ("[QC] …").
 */
export function mayHoldPayment(email: ReceiptEmail): boolean {
  const origin = emailOrigin(email);
  if (isAdvert(origin.subject)) return false;
  return origin.lines.some((line) => PRINTED_MONEY.test(line));
}

const squash = (text: string) => text.normalize('NFC').replace(/\s+/g, '');

/** The titles bank and shop emails give themselves, folded: never who was paid. */
const EMAIL_TITLES = [
  'bien nhan giao dich',
  'bien nhan chuyen tien',
  'bien lai giao dich',
  'bien lai chuyen tien',
  'bien lai',
  'thong bao giao dich',
  'thong bao bien dong so du',
  'thong bao thay doi so du',
  'xac nhan giao dich',
  'xac nhan thanh toan',
  'giao dich thanh cong',
  'thanh toan thanh cong',
  'transaction receipt',
  'transaction notification',
  'payment receipt',
  'payment confirmation',
  'your receipt',
];

/**
 * Who was paid, when a model gave the email's own title for it ("BIÊN NHẬN GIAO DỊCH …"): what the
 * title leaves after it when that names someone other than the bank, else the payee the rules
 * read from the body, else nobody. Any other name is kept as the model gave it.
 */
function payeeNotTitle(
  merchant: string,
  email: ReceiptEmail,
  options: ReceiptEmailOptions,
): string {
  const folded = foldWords(merchant);
  const title = EMAIL_TITLES.find((t) => folded.startsWith(` ${t} `));
  if (title === undefined) return merchant;
  const words = merchant.trim().split(/\s+/);
  const rest = words
    .slice(title.split(' ').length)
    .join(' ')
    .replace(/^[\s:|–-]+/u, '')
    .trim();
  const named = /\p{L}{2}/u.test(rest) && !/\d{3}/.test(rest) && bankNamedIn(rest) === null;
  if (named) return rest;
  return parseReceiptEmail(email, options)?.merchant ?? '';
}
const printedLocalTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const isCategory = (id: string): id is EmailCategoryId =>
  (EMAIL_CATEGORY_IDS as readonly string[]).includes(id);

/**
 * The spend (or money in) a model's reading describes, or null when it is neither a payment, a
 * refund nor money that came in, or its amount cannot be trusted: not printed in the email, no
 * currency, or not a positive amount.
 */
export function emailSpendOf(
  reading: EmailModelReading,
  email: ReceiptEmail,
  options: ReceiptEmailOptions,
): EmailSpend | null {
  const moving =
    reading.kind === 'payment' || reading.kind === 'incoming' || reading.kind === 'refund';
  if (!moving || reading.amount === null) return null;
  const currency = currencyCodeSchema.safeParse(reading.currency?.trim().toUpperCase());
  if (!currency.success) return null;
  const origin = emailOrigin(email);
  const printed = squash(reading.amount);
  if (printed === '' || !squash(origin.lines.join('\n')).includes(printed)) return null;
  const amount = receiptMinorUnits(reading.amount, currency.data);
  if (amount === null || amount <= 0) return null;

  // A time that is the email's own UTC timestamp was copied from its header, not printed in it.
  const copied = email.date !== null && reading.at?.trim() === email.date.slice(0, 19);
  const at = copied ? '' : (reading.at?.trim() ?? '');
  const category = reading.category?.trim().toLowerCase() ?? '';
  return {
    ...(reading.kind === 'payment' ? {} : { kind: reading.kind }),
    amount,
    currency: currency.data,
    category: isCategory(category) ? category : null,
    merchant: payeeNotTitle(reading.merchant?.trim() ?? '', email, options).slice(0, 120),
    at: emailPaidAt(
      printedLocalTime.test(at) && !Number.isNaN(Date.parse(at)) ? at : null,
      origin,
      email,
      options,
    ),
    from: origin.sender?.address ?? null,
    bank: origin.bank,
    code: reading.reference?.trim().slice(0, 40) || null,
    memo: cleanMemo(reading.note),
  };
}
