import { withoutBankNames } from './bank-alert-senders';
import { foldWords } from './spoken-spend';

/** Two names that can be one payee: either is unnamed, one holds the other, or they share a word. */
export function namesAgree(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = foldWords(a ?? '').trim();
  const y = foldWords(b ?? '').trim();
  if (x === '' || y === '') return true;
  const [cx, cy] = [x.replace(/ /g, ''), y.replace(/ /g, '')];
  if (cx.includes(cy) || cy.includes(cx)) return true;
  const words = new Set(x.split(' ').filter((w) => w.length >= 4));
  return y.split(' ').some((w) => words.has(w));
}

/** Words a payee's name can hold that only say how money moved: a transfer, a QR code, a card. */
const PAYMENT_WORDS: ReadonlySet<string> = new Set([
  'qr',
  'vietqr',
  'napas',
  'ibft',
  'ck',
  'ct',
  'mbct',
  'tt',
  'gd',
  'chuyen',
  'khoan',
  'tien',
  'thanh',
  'toan',
  'giao',
  'dich',
  'nap',
  'rut',
  'tk',
  'tai',
  'cho',
  'den',
  'tu',
  'qua',
  'ngan',
  'hang',
  'the',
  'bank',
  'banking',
  'card',
  'visa',
  'mastercard',
  'debit',
  'credit',
  'transfer',
  'payment',
  'pay',
]);

/**
 * A name that says nothing about who was paid: blank, or only bank and wallet names and words for
 * how money moved ("Techcombank QR", "MBCT", "Chuyen tien").
 */
export function namesNoPayee(name: string): boolean {
  return withoutBankNames(name)
    .trim()
    .split(' ')
    .every((word) => word === '' || PAYMENT_WORDS.has(word) || !/[a-z]/.test(word));
}
