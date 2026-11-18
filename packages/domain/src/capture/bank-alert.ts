import { VND, type Currency } from '../money/currency';
import type { SpendDirection } from '../spend/spend';
import { payeeByShape } from './alert-payee-shapes';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';
import { cleanMemo } from './bank-receipt';
import { tidyPayee } from './bill-topic';
import { namesNoPayee } from './payee-names';
import { readsAsBalance } from './receipt-amount';
import { readReceiptTime, withFullYears } from './receipt-time';
import { foldWords } from './spoken-spend';
import { currencyMarkOf, parseWalletAmount } from './wallet-amount';

/**
 * Reading a bank's or wallet's notification, as an iOS Shortcuts automation hands it over: the
 * balance-change alerts Vietnamese banks and wallets send ("biến động số dư"), and the English
 * ones of banks and cards elsewhere. Everything is read on the phone.
 */

/** One notification as the automation passes it. */
export interface BankAlertInput {
  /** The app it came from, by name or bundle id, when the automation passes it. */
  readonly app?: string | null | undefined;
  readonly title?: string | null | undefined;
  readonly subtitle?: string | null | undefined;
  readonly body: string;
  /** When iOS delivered it (ISO 8601); without it, the time the alert prints. */
  readonly date?: string | null | undefined;
}

/**
 * Why an alert is not money that moved: a one-time code, a payment that failed, a promotion, a
 * balance or statement notice, a sign-in or security notice, or nothing readable.
 */
export type BankAlertSkip = 'code' | 'failed' | 'promo' | 'balance' | 'security' | 'unread';

/** Money that moved, as the alert says it. */
export interface BankAlertMovement {
  readonly kind: 'moved';
  readonly direction: SpendDirection;
  /** In minor units of `currency`: đồng in Vietnam, cents for "RM 5.00". */
  readonly amount: number;
  /** ISO 4217. */
  readonly currency: string;
  /** Who was paid, or who paid in, as printed; null when the alert names nobody. */
  readonly counterparty: string | null;
  /** The transfer's own words ("ND: LUONG T10"), cut to `MEMO_MAX`. */
  readonly memo: string | null;
  /** When it happened (ISO 8601): the delivery time, else the time printed; null with neither. */
  readonly at: string | null;
  /** The bank or wallet's short name from the catalogue ("MB Bank", "MoMo"). */
  readonly bank: string | null;
}

/** What else an alert that moved money says about it, for telling one payment from another. */
export interface BankAlertKeys {
  /** What the read `at` is: when the phone was handed the alert, or the time it prints. */
  readonly atKind: 'delivered' | 'printed' | null;
  /** The bank's own code for the payment, when the alert prints one ("Ref: FT26316XQ7"). */
  readonly reference: string | null;
  /** The last digits of the person's account the alert names before the amount ("TK …456"). */
  readonly accountTail: string | null;
  /** Money that came in that the words call given back by a shop, or taken back by the bank. */
  readonly what: 'refund' | 'reversal' | null;
}

/** A payment the bank took back, as alerts word it. */
const REVERSAL_WORDS =
  / (?:hoan tra giao dich|dao giao dich|giao dich bi dao|tra lai giao dich|reversal|reversed) /;
/** Money a shop gave back. */
const REFUND_WORDS = / (?:hoan tien|refund|refunded) /;

export interface BankAlertSkipped {
  readonly kind: 'skipped';
  readonly reason: BankAlertSkip;
  readonly bank: string | null;
}

export type BankAlert = BankAlertMovement | BankAlertSkipped;

/** "ND: …", "Nội dung: …", "Mô tả: …", "Content: …", and ACB's "GD: <words>". */
const MEMO_LABEL =
  /(?:^|[\s|.;,(])(?:nd|n\.d|nd gd|nội dung(?: giao dịch| chuyển khoản| ck| gd)?|noi dung(?: giao dich| chuyen khoan| ck| gd)?|mô tả|mo ta|diễn giải|dien giai|lời nhắn|loi nhan|content|description|desc|message|remarks?|details|note|gd(?=\s*[:：]\s*\p{L}))\s*[:：]\s*/giu;

/** Where a memo stops: the next field of the alert. */
const MEMO_END =
  /\s*(?:\||\n|[.;]\s+(?=\p{L})|\s(?=(?:sd|sdc|số dư|so du|balance|ref|mã gd|ma gd|so gd|số gd)\s*[:：]?\s*\d))/iu;

/** An amount as alerts print it: signed or not, a currency mark before or after it, or neither. */
const AMOUNT =
  /(?:(?<![\p{L}\p{N}])([-−+])\s?)?(?:(?<![\p{L}\p{N}])((?:[a-z]{1,3}\$|[a-z]{2,3}\.?|\p{Sc})\s?)|(?<!\p{L}))(?<![\p{N}.,/]|\p{N}:)(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?!\p{N})(\s?(?:vnđ|vnd|đồng|đ|₫|[a-z]{3}|\p{Sc}))?(?![\p{L}\p{N}])/giu;

/** Words that, last before an amount, make it what moved ("GD:", "PS:", "Số tiền", "thay đổi"). */
const CHANGE_LEAD =
  / (?:gd|ps|so tien(?: gd| giao dich)?|thay doi|bien dong|giao dich|amount|ghi co|ghi no|tang|giam|duoc cong|cong tien|tru|nhan|nhan duoc|chuyen|thanh toan|of|paid|spent|charged|received|transferred|sent)\s*$/;

/** Words that mean money came in, folded; the earliest one in the alert decides. */
const IN_WORDS = [
  'ghi co',
  'da nhan',
  'vua nhan',
  'nhan duoc',
  'ban nhan',
  'nhan tien',
  'nhan chuyen',
  'duoc cong',
  'cong tien',
  'hoan tien',
  'hoan tra',
  'nap tien',
  'tien vao',
  'refund',
  'refunded',
  'received',
  'receive',
  'credited',
  'deposit',
  'deposited',
  'sent you',
  'paid you',
  'you got',
  'money in',
  'incoming',
];

/** Words that mean money went out, folded. */
const OUT_WORDS = [
  'ghi no',
  'bi tru',
  'da tru',
  'tru tien',
  'thanh toan',
  'da chuyen',
  'vua chuyen',
  'chuyen tien',
  'chuyen khoan',
  'chuyen',
  'rut tien',
  'chi tieu',
  'giao dich the',
  'you paid',
  'paid',
  'payment',
  'purchase',
  'spent',
  'spend',
  'charge',
  'charged',
  'debited',
  'transferred',
  'transfer',
  'sent',
  'withdraw',
  'withdrawal',
  'money out',
];

/** Words that name something else than a movement's way, taken out before the way is read. */
const NOT_A_WAY =
  / (?:credit card|debit card|the tin dung|the ghi no|nguoi nhan|ten nguoi nhan|xac nhan|ngan hang nhan|tai khoan nhan|tk nhan|nguoi chuyen|ten nguoi chuyen|tk chuyen|tai khoan chuyen) /g;

/** A one-time code, a verification code or a code to sign in with. */
const CODE =
  / (?:otp|smart otp|ma xac thuc|ma xac nhan|ma kich hoat|ma dang nhap|verification code|one time password|one time code|passcode|security code|activation code|login code|sign in code|your code is) /;

/** A sentence that only warns not to share a code; it says nothing about the alert. */
const CODE_WARNING =
  /(?<!\p{L})(?:không|khong|ko|never|do not|don['’]t)(?!\p{L}).{0,40}?(?<!\p{L})(?:cung cấp|cung cap|chia sẻ|chia se|tiết lộ|tiet lo|share|give|tell|disclose)(?!\p{L})/iu;

/** A payment that did not go through. */
const FAILED =
  / (?:khong thanh cong|that bai|bi tu choi|tu choi|khong the thuc hien|khong du so du|declined|failed|unsuccessful|not successful|was not completed|could not be completed|insufficient funds) /;

/** Promotions and marketing. */
const PROMO =
  / (?:uu dai|khuyen mai|giam gia|giam ngay|giam den|voucher|coupon|flash sale|sale|qua tang|mien phi|co hoi|nhan ngay|tang ngay|trung thuong|giai thuong|minigame|tri an|dang ky ngay|mo the ngay|mo ngay|len den|chi tu|lai suat|khoan vay|vay nhanh|promo|promotion|offer|discount|deal|deals|up to|earn|win|free|when you|khi thanh toan|khi mo|khi dang ky|khi nap) /;

/** A balance, a statement or a bill that is due: nothing moved yet. */
const STATEMENT =
  / (?:sao ke|ky sao ke|statement|du no|han thanh toan|den han|nhac no|thanh toan toi thieu|minimum payment|payment due|is due|bill is ready|so du hien tai cua|so du tai khoan|your balance|balance is|available balance is) /;

/**
 * A recap of spending over a while (a bank's monthly or weekly statistics, "Bạn đã chi tiêu
 * 5.142.790 VND cho danh mục Ăn uống trong tháng 10", "You spent $420 on Dining this month"):
 * a total of payments already caught, never one of its own.
 */
const SUMMARY =
  / (?:tong chi tieu|thong ke|tong ket|bao cao chi tieu|chi tieu (?:trong |cua )?(?:thang|tuan)|spending summary|spending report|spending recap|monthly summary|weekly summary|monthly recap|weekly recap|month in review|week in review|total spending|total spent|spent so far) /;

/** A while a recap covers: the month or the week, this one or the last. */
const SUMMARY_PERIOD =
  / (?:trong (?:thang|tuan)(?: nay| qua| truoc| \d{1,2})?|(?:thang|tuan) (?:nay|qua|truoc|vua qua)|this month|this week|last month|last week|so far this|month to date|in the past (?:week|month)) /;

/** A sign-in, a new device, a password or a setting changed. */
const SECURITY =
  / (?:dang nhap|thiet bi moi|thiet bi la|mat khau|doi mat khau|kich hoat|cai dat|bao mat|sign in|signed in|sign on|log in|logged in|login|new device|password|security alert|unusual activity) /;

/** After the amount, who it went to or came from, up to the next field. */
const TO_WHOM =
  /(?:^|\s)(?:đến|den|tới|toi|cho|tại|tai|to|at(?!\s+\d)|(?<=transaction\s)with)\s+(.+?)(?=\s+(?:lúc|luc|at\s+\d|vào|vao|ngày|ngay|on|via|qua|với|voi|ref|số dư|so du|sd|nd|nội dung|noi dung|thành công|thanh cong|was|has|is|for|using|bằng|bang|from|từ|tu)(?:\s|$|[:.,])|\s*(?:[,;|\n(]|\.(?:\s|$)|$))/iu;
const FROM_WHOM =
  /(?:^|\s)(?:từ|tu|from)\s+(.+?)(?=\s+(?:lúc|luc|at\s+\d|vào|vao|ngày|ngay|on|via|qua|với|voi|ref|số dư|so du|sd|nd|nội dung|noi dung|thành công|thanh cong|was|has|is|for|using|bằng|bang|to|đến|den|tới|toi)(?:\s|$|[:.,])|\s*(?:[,;|\n(]|\.(?:\s|$)|$))/iu;

/**
 * Before the amount, who it went to or came from, when the alert words the amount last: "cho
 * HIGHLANDS COFFEE với số tiền 119.000đ", "từ NGUYEN VAN A số tiền: 100.000đ". The name ends at
 * the amount's own label, in the sentence that holds the amount.
 */
const NAMED_UP_TO_AMOUNT = String.raw`\s+((?:[^\n;|.]|\.(?!\s))+?)\s+(?:với\s+|voi\s+)?(?:số\s+tiền|so\s+tien)(?:\s+(?:là|la))?\s*[:：]?\s*$`;
const TO_WHOM_BEFORE = new RegExp(
  String.raw`(?:^|\s)(?:đến|den|tới|toi|cho|tại|tai)` + NAMED_UP_TO_AMOUNT,
  'iu',
);
const FROM_WHOM_BEFORE = new RegExp(String.raw`(?:^|\s)(?:từ|tu)` + NAMED_UP_TO_AMOUNT, 'iu');

/** Words before a number that make a counterparty an account or a phone, not a name. */
const ACCOUNT_WORDS =
  /^(?:số điện thoại|so dien thoai|sđt|sdt|số tài khoản|so tai khoan|tài khoản|tai khoan|stk|tk|account|acct|phone|ví|vi)\b\s*/iu;

/** Names longer than this are a sentence read wrong. */
const NAME_MAX = 60;

interface Found {
  readonly signed: '-' | '+' | null;
  readonly amount: number;
  readonly currency: string;
  readonly marked: boolean;
  readonly labelled: boolean;
  readonly start: number;
  readonly end: number;
}

/** Every amount the alert prints that could be what moved, leaving out the balance. */
function amountsIn(text: string, home: Currency): Found[] {
  const found: Found[] = [];
  // Each lead runs from the last amount kept, so a date or an account number between them never
  // hides the "SD:" before a balance.
  let from = 0;
  for (const match of text.matchAll(AMOUNT)) {
    const [whole, sign, before = '', number = '', after = ''] = match;
    const lead = text.slice(from, match.index);
    const mark = (before && currencyMarkOf(before, home)) || (after && currencyMarkOf(after, home));
    const signed = sign === undefined ? null : sign === '+' ? '+' : '-';
    const labelled = CHANGE_LEAD.test(foldWords(lead + (mark ? '' : before)).trimEnd());
    if (signed === null && !mark && !labelled) continue;
    if (signed === null && readsAsBalance(lead)) continue;
    const read = parseWalletAmount(mark ? `${number} ${mark}` : number, home);
    if (read === null) continue;
    from = match.index + whole.length;
    found.push({
      signed,
      amount: read.amount,
      currency: read.currency,
      marked: Boolean(mark),
      labelled,
      start: match.index,
      end: from,
    });
  }
  return found;
}

/** One amount as an alert prints it, and where it stands in the text. */
export interface PrintedAmount {
  /** In minor units of `currency`. */
  readonly amount: number;
  /** ISO 4217: the mark printed with it, else the home currency. */
  readonly currency: string;
  readonly start: number;
  readonly end: number;
}

/** A number written as money is: its thousands grouped, or five digits and more. */
const WRITTEN_AS_MONEY = /\d[.,]\d{3}(?!\d)|\d{5}/;

/**
 * Every amount an alert prints, the balance among them, for a second reader to choose from: a
 * signed number, one with a currency mark or after a label, or any number written as money is. A
 * date, a time and a short code are none of them.
 */
export function printedAmounts(text: string, home: Currency = VND): PrintedAmount[] {
  const found: PrintedAmount[] = [];
  let from = 0;
  for (const match of text.matchAll(AMOUNT)) {
    const [whole, sign, before = '', number = '', after = ''] = match;
    const markBefore = before !== '' && currencyMarkOf(before, home) !== null;
    const markAfter = after !== '' && currencyMarkOf(after, home) !== null;
    const mark = (markBefore && currencyMarkOf(before, home)) || currencyMarkOf(after, home);
    const lead = text.slice(from, match.index);
    const labelled = CHANGE_LEAD.test(foldWords(lead + (markBefore ? '' : before)).trimEnd());
    if (sign === undefined && !mark && !labelled && !WRITTEN_AS_MONEY.test(number)) continue;
    // Nine digits in a row with no mark are an account or a phone number, never an amount.
    if (sign === undefined && !mark && /^\d{9,}$/.test(number)) continue;
    const read = parseWalletAmount(mark ? `${number} ${mark}` : number, home);
    if (read === null || read.amount <= 0) continue;
    from = match.index + whole.length;
    // Letters before a number that are no currency ("TK 1234") are not part of the amount.
    const numberAt = from - after.length - number.length;
    const start = markBefore || before === '' ? match.index : numberAt;
    const end = numberAt + number.length + (markAfter ? after.length : 0);
    found.push({ amount: read.amount, currency: read.currency, start, end });
  }
  return found;
}

/** The amount that moved: the first signed one, then the first after a label, then the first. */
function movedAmount(found: readonly Found[]): Found | null {
  return (
    found.find((f) => f.signed !== null) ??
    found.find((f) => f.labelled) ??
    found.find((f) => f.marked) ??
    null
  );
}

/** The memo's text and where it sits in the alert, when it prints one. */
function memoIn(text: string): { readonly memo: string; readonly start: number } | null {
  for (const match of text.matchAll(MEMO_LABEL)) {
    const from = match.index + match[0].length;
    const rest = text.slice(from);
    const end = MEMO_END.exec(rest);
    const memo = (end ? rest.slice(0, end.index) : rest).replace(/[\s.;,]+$/u, '');
    // The first label holding words is the memo; one holding none ("ND: 123") is passed over.
    if (/\p{L}/u.test(memo)) return { memo, start: match.index };
  }
  return null;
}

/** The earliest of some folded words in folded text, or -1. */
function earliest(folded: string, words: readonly string[]): number {
  let best = -1;
  for (const word of words) {
    const at = folded.indexOf(` ${word} `);
    if (at >= 0 && (best < 0 || at < best)) best = at;
  }
  return best;
}

/** Which way money went: its sign, the word right before it, else the earliest way word. */
function wayOf(text: string, amount: Found): SpendDirection | null {
  if (amount.signed === '-') return 'out';
  if (amount.signed === '+') return 'in';
  const lead = foldWords(text.slice(Math.max(0, amount.start - 24), amount.start)).trimEnd();
  if (/ (?:ghi co|tang|duoc cong|cong tien|nhan|nhan duoc|received)$/.test(lead)) return 'in';
  if (
    / (?:ghi no|giam|tru|thanh toan|chuyen|paid|spent|charged|transferred|sent|made a)$/.test(lead)
  ) {
    return 'out';
  }
  const folded = foldWords(text).replace(NOT_A_WAY, ' ');
  const comes = earliest(folded, IN_WORDS);
  const goes = earliest(folded, OUT_WORDS);
  if (comes < 0 && goes < 0) return null;
  if (goes < 0) return 'in';
  if (comes < 0) return 'out';
  // "paid you" and "sent you" start where "paid" and "sent" do: the longer words win.
  return comes <= goes ? 'in' : 'out';
}

/**
 * A counterparty as kept: one line, no account or phone number, a bill's lead words off, letters
 * in it, not too long.
 */
function cleanName(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  // "cho đơn hàng tại Circle K": the shop is the last place named.
  const place = raw.split(/\s(?:tại|tai|at)\s/iu).pop() ?? raw;
  // "cho hóa đơn của dịch vụ Điện lực Hồ Chí Minh": the payee is the company.
  const name = tidyPayee(place)
    .replace(ACCOUNT_WORDS, '')
    .split(/\s+/)
    .filter((word) => !/\d{3}/.test(word))
    .join(' ')
    .replace(/^[\s,.;:*-]+|[\s,.;:*-]+$/gu, '')
    .trim();
  if (!/\p{L}{2}/u.test(name) || name.length > NAME_MAX) return null;
  return ACCOUNT_WORDS.test(`${name} `) && foldWords(name).trim().split(' ').length <= 3
    ? null
    : name;
}

/**
 * Who was paid (money out) or who paid in, as printed after the amount. Before it an alert names
 * its own bank or account ("TK 1234 tại BIDV -120,000"), never the other side, unless the name
 * runs up to the amount's own label ("cho HIGHLANDS COFFEE với số tiền 119.000đ").
 */
function counterpartyOf(text: string, amount: Found, way: SpendDirection): string | null {
  const pattern = way === 'in' ? FROM_WHOM : TO_WHOM;
  const after = cleanName(pattern.exec(text.slice(amount.end))?.[1]);
  if (after !== null) return after;
  const before = way === 'in' ? FROM_WHOM_BEFORE : TO_WHOM_BEFORE;
  const named = cleanName(before.exec(text.slice(0, amount.start))?.[1]);
  return named !== null && !namesNoPayee(named) ? named : null;
}

/** A payment memo that names the shop: "Thanh toan QR-PHO HOA", "THANH TOAN TAI CIRCLE K". */
const MEMO_PAYEE =
  /^(?:thanh\s*to[aá]n|tt|payment)(?:\s*qr\s*(?:[-:]\s*|\s+)|\s+(?:qr\s+)?(?:tại|tai|cho|at|to)\s+)(.+)$/iu;

/** The shop a memo names, for money out whose alert names nobody else. */
function payeeInMemo(memo: string | null, way: SpendDirection): string | null {
  if (memo === null || way !== 'out') return null;
  return cleanName(MEMO_PAYEE.exec(memo)?.[1]);
}

function atOf(date: string | null | undefined, text: string): string | null {
  return atAndKindOf(date, text).at;
}

function atAndKindOf(
  date: string | null | undefined,
  text: string,
): { readonly at: string | null; readonly atKind: BankAlertKeys['atKind'] } {
  const delivered = date ? new Date(date) : null;
  if (delivered && !Number.isNaN(delivered.getTime())) {
    return { at: delivered.toISOString(), atKind: 'delivered' };
  }
  const printed = readReceiptTime(withFullYears(text));
  return { at: printed, atKind: printed === null ? null : 'printed' };
}

/**
 * A bank's own code for the payment, after its label ("Ref: FT26316XQ7", "Mã GD: 412345678",
 * "Số GD 0412…", "Trace no. 559201", "Số tham chiếu …") or as Vietcombank and Techcombank print
 * it bare ("FT26316XQ7"). A code holds a digit; a word after a label is no code.
 */
const REFERENCE_LABEL =
  /(?:^|[\s|.;,(])(?:ref(?:erence)?(?:\s*no\.?)?|mã gd|ma gd|mã giao dịch|ma giao dich|số gd|so gd|số tham chiếu|so tham chieu|trace(?:\s*no\.?)?)\s*[:：#]?\s*([a-z0-9][a-z0-9\-/]{3,39})/iu;
const BARE_REFERENCE = /(?<![\p{L}\p{N}])(FT\d{5}[A-Z0-9]{3,20})(?![\p{L}\p{N}])/u;

function referenceOf(text: string): string | null {
  const code = REFERENCE_LABEL.exec(text)?.[1] ?? BARE_REFERENCE.exec(text)?.[1] ?? null;
  if (code === null || !/\d/.test(code)) return null;
  return code.replace(/[-/]+$/, '').toUpperCase();
}

/** "TK 0123xxx456", "Tài khoản: 99xx01", "STK ...6789", "Acct *1234": the account an alert names. */
const ACCOUNT =
  /(?:^|[\s|(])(?:tk|tài khoản|tai khoan|stk|acct|account|a\/c)\s*[:：]?\s*(?:số\s*)?([0-9x*.…]*\d{2,})(?![\p{L}\p{N}])/iu;

/** The last digits (four at most) of the account an alert names before its amount. */
function accountTailOf(before: string): string | null {
  const account = ACCOUNT.exec(before)?.[1];
  if (!account) return null;
  const tail = /(\d{2,4})$/.exec(account)?.[1];
  return tail ?? null;
}

/** Sentences of an alert, without the ones that only warn about sharing a code. */
function withoutWarnings(text: string): string {
  return text
    .split(/(?<=[.!|\n])\s*/u)
    .filter((sentence) => !CODE_WARNING.test(sentence))
    .join(' ');
}

/**
 * Reads one notification into money that moved, or why it is skipped.
 *
 * - Codes (OTP, verification), payments that failed or were declined, promotions, balance and
 *   statement notices, recaps of spending over a month or a week, and sign-in or security
 *   notices are skipped (a recap as a balance notice).
 * - The amount is the one signed `+` or `-`, else the one after a label ("GD:", "PS:", "Số
 *   tiền"), else the first with a currency mark; a balance ("SD:", "Số dư", "Balance") never.
 *   Unmarked, it is in the home currency.
 * - The way is its sign, else the words: "+", "ghi có", "nhận", "received" bring money in; "-",
 *   "ghi nợ", "trừ", "thanh toán", "chuyển", "paid", "charge" send it out.
 */
export function readBankAlert(input: BankAlertInput, home: Currency = VND): BankAlert {
  const parts = [input.title, input.subtitle, input.body]
    .map((part) => (part ?? '').normalize('NFC').trim())
    .filter((part) => part !== '');
  const text = parts.join('\n');
  const memoFound = memoIn(text);
  const told = memoFound ? text.slice(0, memoFound.start) : text;
  const bankInfo =
    bankOfApp(input.app) ??
    bankNamedIn(input.title ?? '') ??
    bankNamedIn(input.subtitle ?? '') ??
    bankNamedIn(told);
  const bank = bankInfo?.shortName ?? null;
  const skip = (reason: BankAlertSkip): BankAlertSkipped => ({ kind: 'skipped', reason, bank });

  const plain = foldWords(withoutWarnings(told));
  if (CODE.test(plain)) return skip('code');
  if (FAILED.test(plain)) return skip('failed');
  // A recap's own words ("Tổng chi tiêu", "Thống kê", "weekly recap") say so whatever it prints.
  if (SUMMARY.test(plain)) return skip('balance');

  const found = amountsIn(told, home);
  const amount = movedAmount(found);
  const structured = amount?.signed != null || / (?:sd|so du|balance) /.test(plain);
  if (!structured && (PROMO.test(plain) || /\d\s?%/.test(told))) return skip('promo');
  if (amount === null || amount.amount <= 0) {
    if (SECURITY.test(plain)) return skip('security');
    if (STATEMENT.test(plain) || / (?:sd|so du|balance) /.test(plain)) return skip('balance');
    if (PROMO.test(plain)) return skip('promo');
    return skip('unread');
  }
  if (amount.signed === null && STATEMENT.test(plain)) return skip('balance');
  // A while a recap covers says so only of an unsigned total: a payment's own sign wins.
  if (amount.signed === null && SUMMARY_PERIOD.test(plain)) return skip('balance');
  const way = wayOf(told, amount);
  if (way === null) return skip('unread');
  const memo = cleanMemo(memoFound?.memo);
  // After the amount first, then the bank's own shapes, then a payment memo; never the bank.
  const named =
    counterpartyOf(told, amount, way) ??
    payeeByShape(bankInfo?.id ?? null, way, { memo, text: told }) ??
    payeeInMemo(memo, way);
  return {
    kind: 'moved',
    direction: way,
    amount: amount.amount,
    currency: amount.currency,
    counterparty: named !== null && !namesNoPayee(named) ? named : null,
    memo,
    at: atOf(input.date, text),
    bank,
  };
}

/**
 * The keys an alert that moved money carries besides its amount: what its time is, the bank's
 * code for the payment, and the person's account, each null when the alert does not print it.
 */
export function readBankAlertKeys(input: BankAlertInput, home: Currency = VND): BankAlertKeys {
  const text = [input.title, input.subtitle, input.body]
    .map((part) => (part ?? '').normalize('NFC').trim())
    .filter((part) => part !== '')
    .join('\n');
  const memoFound = memoIn(text);
  const told = memoFound ? text.slice(0, memoFound.start) : text;
  const amount = movedAmount(amountsIn(told, home));
  const plain = foldWords(text);
  return {
    atKind: atAndKindOf(input.date, text).atKind,
    reference: referenceOf(text),
    accountTail: amount ? accountTailOf(told.slice(0, amount.start)) : null,
    what: REVERSAL_WORDS.test(plain) ? 'reversal' : REFUND_WORDS.test(plain) ? 'refund' : null,
  };
}

/**
 * The amount a payment that failed or was declined was for, when its alert prints one: what it
 * would have taken, for the payment it tells of to be voided. Null for any other alert.
 */
export function readFailedBankAlert(
  input: BankAlertInput,
  home: Currency = VND,
): { readonly amount: number; readonly currency: string } | null {
  const read = readBankAlert(input, home);
  if (read.kind !== 'skipped' || read.reason !== 'failed') return null;
  const text = [input.title, input.subtitle, input.body]
    .map((part) => (part ?? '').normalize('NFC').trim())
    .filter((part) => part !== '')
    .join('\n');
  const memoFound = memoIn(text);
  const amount = movedAmount(amountsIn(memoFound ? text.slice(0, memoFound.start) : text, home));
  return amount && amount.amount > 0 ? { amount: amount.amount, currency: amount.currency } : null;
}
