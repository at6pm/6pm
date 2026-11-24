import type { SpendDirection } from '../spend/spend';
import type { BankInfo } from '../vietqr/bank-catalogue';
import { ALERT_WORDS, type AlertWords } from './alert-words';
import { EUROPE_ALERT_WORDS } from './alert-words-europe';
import { SCRIPT_ALERT_WORDS } from './alert-words-scripts';
import { foldWords } from './fold-words';

/**
 * Reading the alerts of banks and wallets outside Vietnam, in their own languages and the way they
 * print money ("1.234,56 €", "1,234円", "Rs.1,23,456.00", "R150.00", "Ksh1,000.00"). A Vietnamese
 * alert never comes here: `bank-alert` reads it exactly as it always has.
 */

/** Letters only Vietnamese writes. */
const VIETNAMESE_LETTERS = /[ăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/iu;
/** Words of a Vietnamese bank's alert, folded, that no other country's alerts use. */
const VIETNAMESE_WORDS =
  / (?:vnd|so du|sd|sdc|ghi no|ghi co|noi dung|nd|giao dich|tai khoan|chuyen khoan|chuyen tien|thanh toan|bien dong|luc|stk|quy khach) /;

/**
 * Whether an alert is Vietnamese: from a bank of Vietnam, or written as only Vietnam's banks
 * write. Every other alert is read with the world's words as well.
 */
export function isVietnameseAlert(text: string, bank: BankInfo | null): boolean {
  if (bank !== null) return bank.country === 'VN';
  return VIETNAMESE_LETTERS.test(text) || VIETNAMESE_WORDS.test(foldWords(text));
}

/** Lower case, accents off, every script's letters kept, everything else a single space. */
export function foldAlertWords(text: string): string {
  const bare = text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .replace(/ı/g, 'i')
    .replace(/ß/g, 'ss')
    .replace(/[đ]/g, 'd')
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  return bare === '' ? ' ' : ` ${bare} `;
}

/** One kind of word, folded, each with whether it is looked for as a whole word. */
type Folded = readonly (readonly [word: string, whole: boolean])[];

function folded(pick: (words: AlertWords) => readonly string[]): Folded {
  const all = [...ALERT_WORDS, ...EUROPE_ALERT_WORDS, ...SCRIPT_ALERT_WORDS].flatMap(pick);
  const seen = new Set<string>();
  const out: (readonly [string, boolean])[] = [];
  for (const word of all) {
    const fold = foldAlertWords(word).trim();
    if (fold === '' || seen.has(fold)) continue;
    seen.add(fold);
    out.push([fold, /^[a-z0-9 ]+$/.test(fold)]);
  }
  return out;
}

const IN = folded((w) => [...w.in, ...w.refund, ...w.reversal]);
const OUT_ALL = folded((w) => w.out);

/**
 * Nouns that name a payment either way ("Zahlung", "transfer", "pago", "이체"): they tell the way
 * only when no other word does, so "eine Zahlung über 1,00 € … erhalten" is money in.
 */
const EITHER_WAY = new Set(
  [
    'payment',
    'transfer',
    'transaction',
    'zahlung',
    'überweisung',
    'pago',
    'transferencia',
    'pagamento',
    'transferência',
    'paiement',
    'virement',
    'betaling',
    'overboeking',
    'bonifico',
    'płatność',
    'przelew',
    'betalning',
    'överföring',
    'ödeme',
    'pembayaran',
    'bayaran',
    'pindahan',
    '转账',
    '轉帳',
    '轉賬',
    '送金',
    '振込',
    '이체',
    '송금',
  ].map((word) => foldAlertWords(word).trim()),
);
const OUT = OUT_ALL.filter(([word]) => !EITHER_WAY.has(word));
const OUT_NOUNS = OUT_ALL.filter(([word]) => EITHER_WAY.has(word));
const REFUND = folded((w) => w.refund);
const REVERSAL = folded((w) => w.reversal);
const FAILED = folded((w) => w.failed);
const CODE = folded((w) => w.code);
const WARNING = folded((w) => w.warning);
const REQUEST = folded((w) => w.request);
const PROMO = folded((w) => w.promo);
const STATEMENT = folded((w) => w.statement);
const BALANCE = folded((w) => w.balance);
/**
 * Words that, last before an amount, make it what moved: a label in any language, and a way word
 * in a script that sets no space ("출금 10,450"), where no account number follows one.
 */
const LABEL = [
  ...folded((w) => w.amount),
  ...folded((w) => [...w.in, ...w.out, ...w.refund, ...w.reversal]).filter(([, whole]) => !whole),
];
/** Short words that tell the way only right before the amount ("W/D:20,000", "Dep.:297,000"). */
const LEAD_IN = folded(() => ['dep', 'cr']);
const LEAD_OUT = folded(() => ['w d', 'wd', 'pay', 'dr']);
const CHANGE = folded((w) => [...w.amount, ...w.in, ...w.out, ...w.refund, ...w.reversal]);

/** Where a word first stands in folded text (its first letter), or -1. */
function at(fold: string, [word, whole]: Folded[number]): number {
  if (whole) {
    const found = fold.indexOf(` ${word} `);
    return found < 0 ? -1 : found + 1;
  }
  return fold.indexOf(word);
}

function has(fold: string, words: Folded): boolean {
  return words.some((word) => at(fold, word) >= 0);
}

/** The earliest of some words, the longest where two start together: [where, how long]. */
function earliest(fold: string, words: Folded): readonly [number, number] {
  let best: readonly [number, number] = [-1, 0];
  for (const word of words) {
    const found = at(fold, word);
    if (found < 0) continue;
    if (best[0] < 0 || found < best[0] || (found === best[0] && word[0].length > best[1])) {
      best = [found, word[0].length];
    }
  }
  return best;
}

/** Where the last of some words ends in folded text, or -1; the longer where two end together. */
function lastWord(fold: string, words: Folded): readonly [end: number, length: number] {
  let best: readonly [number, number] = [-1, 0];
  for (const [word, whole] of words) {
    const found = whole ? fold.lastIndexOf(` ${word} `) : fold.lastIndexOf(word);
    if (found < 0) continue;
    const end = found + (whole ? 1 : 0) + word.length;
    if (end > best[0] || (end === best[0] && word.length > best[1])) best = [end, word.length];
  }
  return best;
}

function lastEnd(fold: string, words: Folded): number {
  return lastWord(fold, words)[0];
}

/** Clauses of an alert, as Latin and East Asian scripts end them (full-width marks are folded). */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?|\n。！？,;])\s*/u).filter((s) => s.trim() !== '');
}

/**
 * Why an alert in another language is no money that moved, from its words: a code, a payment that
 * failed, someone asking for money (read as nothing the phone can read), or null.
 */
export function worldSkip(text: string): 'code' | 'failed' | 'unread' | null {
  const fold = foldAlertWords(text);
  const coded = sentences(text).some((sentence) => {
    const words = foldAlertWords(sentence);
    return has(words, CODE) && !has(words, WARNING);
  });
  if (coded) return 'code';
  if (has(fold, FAILED)) return 'failed';
  if (has(fold, REQUEST)) return 'unread';
  return null;
}

/** Whether the words call for a promotion, a statement, or a balance. */
export function worldWords(text: string): {
  readonly promo: boolean;
  readonly statement: boolean;
  readonly balance: boolean;
} {
  const fold = foldAlertWords(text);
  return { promo: has(fold, PROMO), statement: has(fold, STATEMENT), balance: has(fold, BALANCE) };
}

/** True when the words last before an amount name the balance rather than what moved. */
export function worldBalanceLead(lead: string): boolean {
  const fold = foldAlertWords(lead);
  const balance = lastEnd(fold, BALANCE);
  return balance >= 0 && balance > lastEnd(fold, CHANGE);
}

/** True when the words last before an amount make it what moved ("Betrag:", "金額", "W/D:"). */
export function worldLabelled(lead: string): boolean {
  const fold = foldAlertWords(lead).trimEnd();
  const words = fold.split(' ').slice(-4).join(' ');
  return [...LABEL, ...LEAD_IN, ...LEAD_OUT].some(([word, whole]) =>
    whole ? ` ${words}`.endsWith(` ${word}`) : words.endsWith(word),
  );
}

/** Names that hold a way word but say nothing of the way ("credit card", "支付宝"). */
const NOT_A_WAY =
  / (?:credit card|debit card|credit limit|available credit|prepaid card)(?= )|支付宝|支付寶/g;

/** The words right before an amount, without the label that ends them ("DR Amt:" is "DR"). */
function leadOf(text: string, amountStart: number): string {
  let lead = foldAlertWords(text.slice(Math.max(0, amountStart - 32), amountStart)).trimEnd();
  for (let cut = true; cut;) {
    cut = false;
    for (const [word, whole] of LABEL) {
      if (!whole || !lead.endsWith(` ${word}`)) continue;
      lead = lead.slice(0, -word.length - 1);
      cut = true;
    }
  }
  return `${lead} `;
}

/**
 * Which way money went, from the world's words: the one right before it, else the earliest, else
 * a noun that names a payment ("Zahlung", "pago"), which goes out.
 */
export function worldWay(text: string, amountStart: number): SpendDirection | null {
  const lead = leadOf(text, amountStart);
  const [inEnd, inLength] = lastWord(lead, [...IN, ...LEAD_IN]);
  const [outEnd, outLength] = lastWord(lead, [...OUT, ...LEAD_OUT]);
  if (Math.max(inEnd, outEnd) >= lead.length - 2 && lead.trim() !== '') {
    return inEnd > outEnd || (inEnd === outEnd && inLength >= outLength) ? 'in' : 'out';
  }
  const fold = foldAlertWords(text).replace(NOT_A_WAY, ' ');
  // A refund tells of the purchase it gives back: its word wins wherever it stands.
  if (has(fold, REFUND)) return 'in';
  const [comes, comesLength] = earliest(fold, IN);
  const [goes, goesLength] = earliest(fold, OUT);
  if (comes < 0 && goes < 0) return has(fold, OUT_NOUNS) ? 'out' : null;
  if (goes < 0) return 'in';
  if (comes < 0) return 'out';
  if (comes === goes) return comesLength >= goesLength ? 'in' : 'out';
  return comes < goes ? 'in' : 'out';
}

/** Money that came in that the words call given back by a shop, or taken back by the bank. */
export function worldWhat(text: string): 'refund' | 'reversal' | null {
  const fold = foldAlertWords(text);
  if (has(fold, REVERSAL)) return 'reversal';
  return has(fold, REFUND) ? 'refund' : null;
}
