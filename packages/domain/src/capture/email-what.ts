import {
  emailOrigin,
  labelledTransfer,
  parseReceiptEmail,
  type EmailReceipt,
  type ReceiptEmail,
  type ReceiptEmailOptions,
} from './receipt-email';
import {
  isAdvert,
  isFailed,
  isReversal,
  joinBrokenLabels,
  subjectIsNotPayment,
  subjectIsOrderUpdate,
} from './receipt-email-signs';
import { withFullYears } from './receipt-time';
import { foldWords } from './spoken-spend';

/**
 * What an email is, decided before any amount or name in it is read:
 * - `notPayment`: an advert, a statement, a survey, a warning, a delivery;
 * - `orderUpdate`: an order or booking changed after it was paid, or told what became of it (it
 *   can print "Đã thanh toán" just as the payment's mail did);
 * - `failed`: a charge that did not go through or was called off;
 * - `reversal`: a payment the bank took back;
 * - `ownTransfer`: money moved between the person's own accounts, or one currency of theirs sold
 *   for another;
 * - `refund`: money a shop gave back.
 * Anything else is left to the reading: a payment, or money that came in.
 */
export type EmailWhat =
  'notPayment' | 'orderUpdate' | 'failed' | 'reversal' | 'ownTransfer' | 'refund';

/** A subject about money given back ("Hoàn tiền thành công", "Your refund"), not asked for. */
function namesRefund(subject: string): boolean {
  const folded = foldWords(subject);
  const refund = [' hoan tien ', ' hoan tra ', ' refund ', ' refunded '];
  const asked = [' yeu cau ', ' request ', ' requested '];
  return refund.some((w) => folded.includes(w)) && !asked.some((w) => folded.includes(w));
}

/** A booking, or a part of it, that could not be confirmed. */
const NOT_CONFIRMED = [
  'khong the xac nhan',
  'chua the xac nhan',
  'could not be confirmed',
  'could not confirm',
  'unable to confirm',
  'was not confirmed',
];

/** Money for it promised back, still to come. */
const REFUND_TO_COME = [
  'se hoan tien',
  'se duoc hoan tien',
  'se hoan tra',
  'se duoc hoan tra',
  'will be refunded',
  'will refund',
  'will receive a refund',
];

/** Words that make a sentence say what would happen, not what did ("Nếu …", "If …"). */
const IF = ['neu', 'if', 'trong truong hop', 'in case', 'in the event'];

/** Some sentence says one of `words` as having happened, not as a condition. */
function saysHappened(lines: readonly string[], words: readonly string[]): boolean {
  return lines.some((line) =>
    line.split(/[.!?;]+/u).some((sentence) => {
      const folded = foldWords(sentence);
      const at = Math.min(
        ...words.map((w) => folded.indexOf(` ${w} `)).filter((i) => i >= 0),
        Infinity,
      );
      return at !== Infinity && !IF.some((w) => folded.slice(0, at + 1).includes(` ${w} `));
    }),
  );
}

/**
 * A booking's later mail about what became of it: a part could not be confirmed and its money
 * will be given back. The payment was told when the booking was made, by a mail that says it was
 * paid and nothing of a part that failed; this one restates that payment (it can print "Đã thanh
 * toán hôm nay" and the part's total, as the payment's mail did) and moves no money of its own.
 * A booking's terms that only say what would happen ("If we cannot confirm it, we will refund")
 * are not it.
 */
export function tellsBookingOutcome(lines: readonly string[]): boolean {
  return saysHappened(lines, NOT_CONFIRMED) && saysHappened(lines, REFUND_TO_COME);
}

/** What an email is by the rules alone, or null when they leave it to the reading. */
export function emailWhatOf(email: ReceiptEmail): EmailWhat | null {
  const origin = emailOrigin(email);
  const subject = origin.subject;
  if (isAdvert(subject) || subjectIsNotPayment(subject)) return 'notPayment';
  const printed = joinBrokenLabels(origin.lines.map(withFullYears));
  if (isFailed(subject, printed)) return 'failed';
  if (isReversal(subject, printed)) return 'reversal';
  if (namesRefund(subject)) return 'refund';
  if (subjectIsOrderUpdate(subject) || tellsBookingOutcome(printed)) return 'orderUpdate';
  if (labelledTransfer(email).own) return 'ownTransfer';
  return null;
}

/** An email that moves nothing at all: nothing of it reaches the phone. */
export function emailMovesNothing(what: EmailWhat | null): boolean {
  return what === 'notPayment' || what === 'orderUpdate';
}

/**
 * The money an email tells of, its `what` decided first: null for one that moves nothing (an
 * advert, an order update), else what the rules read (`parseReceiptEmail`), kept as `failed`,
 * `reversal` or `ownTransfer` where the email is one, with what its time is.
 */
export function readReceiptEmail(
  email: ReceiptEmail,
  options: ReceiptEmailOptions,
): EmailReceipt | null {
  const what = emailWhatOf(email);
  if (emailMovesNothing(what)) return null;
  const read = parseReceiptEmail(email, { ...options, whatFirst: true });
  if (read === null) return null;
  const kind =
    what === 'failed' || what === 'reversal' || what === 'ownTransfer' || what === 'refund'
      ? what
      : read.kind;
  const { kind: _read, ...rest } = read;
  return kind === undefined ? rest : { ...rest, kind };
}
