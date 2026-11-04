import type { ForeignScheme } from './foreign-scheme';

/** A payment code that is not an EMV QR, read for what Scan shows and logs. */
export interface OtherPayment {
  scheme: ForeignScheme;
  /** ISO 3166-1 alpha-2 country. */
  country: string;
  /** ISO 4217 alphabetic currency the code asks for, when it says. */
  currency?: string;
  /** The amount as a plain decimal ("12.30"), when the code carries one. */
  amount?: string;
  merchantName?: string;
}

const DECIMAL = /^\d{1,13}(?:\.\d{1,2})?$/;
const CODE = /^[A-Z]{3}$/;

/**
 * Reads the payment codes other countries use instead of an EMV QR: India's UPI link, the
 * European Payments Council's SEPA transfer code, the Swiss QR-bill, the Czech QR Platba
 * (SPAYD), and the links Alipay, WeChat Pay, Taiwan Pay and PayPay put in their shop codes
 * (recognised, with no amount to read). Null for anything else.
 */
export function readOtherPayment(raw: string): OtherPayment | null {
  const text = raw.trim();
  const lower = text.toLowerCase();
  if (lower.startsWith('upi://pay')) return upi(text);
  // The UPI apps' own schemes carry the same fields as the UPI link.
  if (/^(phonepe:\/\/pay|paytmmp:\/\/pay|tez:\/\/upi\/pay|gpay:\/\/upi\/pay)\?/.test(lower))
    return upi(text);
  if (text.startsWith('BCD\n') || text.startsWith('BCD\r\n')) return epc(lines(text));
  if (text.startsWith('SPC\n') || text.startsWith('SPC\r\n')) return swiss(lines(text));
  if (text.startsWith('SPD*')) return spayd(text);
  const app = readAppPayment(text, lower);
  if (app) return app;
  if (lower.startsWith('https://qr.alipay.com/')) return linked('alipay', 'CN', 'CNY');
  if (lower.startsWith('wxp://')) return linked('wechat', 'CN', 'CNY');
  if (lower.startsWith('twqrp://')) return linked('twqr', 'TW', 'TWD');
  if (lower.startsWith('https://qr.paypay.ne.jp/')) return linked('paypay', 'JP', 'JPY');
  return null;
}

/** `https://host/path?query` as host (no `www.`), path segments and query. */
function parts(text: string): { host: string; path: string[]; query: Map<string, string> } | null {
  const match = /^https?:\/\/([^/?#\s]+)([^?#\s]*)(?:\?([^#\s]*))?(?:#\S*)?$/i.exec(text);
  if (!match?.[1]) return null;
  const query = new Map<string, string>();
  for (const pair of (match[3] ?? '').split('&')) {
    const at = pair.indexOf('=');
    if (at > 0) query.set(pair.slice(0, at).toLowerCase(), decode(pair.slice(at + 1)));
  }
  return {
    host: match[1].toLowerCase().replace(/^www\./, ''),
    path: (match[2] ?? '')
      .split('/')
      .filter((part) => part !== '')
      .map(decode),
    query,
  };
}

/** "20", "20.50" or "20USD" as an amount and the currency it names, if any. */
function moneyOf(value: string | undefined): { amount: string; currency?: string } | null {
  const match = /^(\d{1,13}(?:\.\d{1,2})?)([A-Za-z]{3})?$/.exec((value ?? '').trim());
  if (!match?.[1] || Number(match[1]) <= 0) return null;
  return match[2] ? { amount: match[1], currency: match[2].toUpperCase() } : { amount: match[1] };
}

/**
 * The payment links of person-to-person and wallet apps: Venmo, Cash App, PayPal.me, Revolut,
 * Wise, Tikkie, Vipps, KakaoPay, UnionPay's cloud QR and ABA PAY. The amount is read where the
 * link carries one (PayPal.me and Cash App in the path, Venmo in its query); the rest are named.
 */
function readAppPayment(text: string, lower: string): OtherPayment | null {
  if (lower.startsWith('venmo://paycharge?')) return venmo(text.slice(text.indexOf('?') + 1));
  const url = parts(text);
  if (!url) return null;
  const { host, path } = url;
  if (host === 'venmo.com') return venmo(text.slice(text.indexOf('?') + 1));
  if (host === 'cash.app' && path[0]?.startsWith('$')) {
    const found = linked('cashapp', 'US', 'USD');
    const money = moneyOf(path[1]);
    if (money) found.amount = money.amount;
    return found;
  }
  const paypal =
    host === 'paypal.me'
      ? path
      : host.endsWith('paypal.com') && path[0] === 'paypalme'
        ? path.slice(1)
        : null;
  if (paypal && paypal[0]) {
    const found: OtherPayment = { scheme: 'paypal', country: 'US' };
    const money = moneyOf(paypal[1]);
    if (money) {
      found.amount = money.amount;
      if (money.currency && CODE.test(money.currency)) found.currency = money.currency;
    }
    return found;
  }
  if (host === 'revolut.me' && path[0]) return { scheme: 'revolut', country: 'GB' };
  if (host === 'wise.com' && path[0] === 'pay') return { scheme: 'wise', country: 'GB' };
  if (host === 'tikkie.me' && path[0] === 'pay') return linked('tikkie', 'NL', 'EUR');
  if (host === 'qr.vipps.no') return linked('vipps', 'NO', 'NOK');
  if (host === 'qr.kakaopay.com') return linked('kakaopay', 'KR', 'KRW');
  if (host === 'qr.95516.com') return linked('unionpay', 'CN', 'CNY');
  if (host === 'pay.ababank.com') return { scheme: 'abapay', country: 'KH' };
  return null;
}

/** Venmo's `paycharge?txn=pay&recipients=name&amount=12.50&note=…` or its profile link. */
function venmo(query: string): OtherPayment {
  const found = linked('venmo', 'US', 'USD');
  const params = new Map<string, string>();
  for (const pair of query.split('&')) {
    const at = pair.indexOf('=');
    if (at > 0) params.set(pair.slice(0, at).toLowerCase(), decode(pair.slice(at + 1)));
  }
  setAmount(found, params.get('amount'));
  return found;
}

function linked(scheme: ForeignScheme, country: string, currency: string): OtherPayment {
  return { scheme, country, currency };
}

/** `upi://pay?pa=shop@bank&pn=Name&am=150.00&cu=INR` (NPCI's UPI linking specification). */
function upi(text: string): OtherPayment {
  const query = text.slice(text.indexOf('?') + 1);
  const params = new Map<string, string>();
  for (const pair of query.split('&')) {
    const at = pair.indexOf('=');
    if (at <= 0) continue;
    params.set(pair.slice(0, at).toLowerCase(), decode(pair.slice(at + 1)));
  }
  const found: OtherPayment = { scheme: 'upi', country: 'IN', currency: 'INR' };
  const currency = params.get('cu')?.toUpperCase();
  if (currency && CODE.test(currency)) found.currency = currency;
  setAmount(found, params.get('am'));
  setName(found, params.get('pn'));
  return found;
}

/**
 * The EPC's SEPA credit transfer code: "BCD", version, character set, "SCT", BIC, name, IBAN,
 * "EUR" and the amount, then the purpose and the remittance information.
 */
function epc(fields: readonly string[]): OtherPayment | null {
  if (fields[3] !== 'SCT' && fields[3] !== 'INST') return null;
  const iban = (fields[6] ?? '').replace(/\s/g, '').toUpperCase();
  const country = /^[A-Z]{2}/.exec(iban)?.[0];
  if (!country) return null;
  const found: OtherPayment = { scheme: 'epc', country, currency: 'EUR' };
  const money = /^([A-Z]{3})(\d+(?:\.\d{1,2})?)$/.exec((fields[7] ?? '').trim().toUpperCase());
  if (money?.[1] && money[2]) {
    found.currency = money[1];
    setAmount(found, money[2]);
  }
  setName(found, fields[5]);
  return found;
}

/**
 * The Swiss QR-bill (SIX's Swiss Payment Standards): "SPC", version, coding, IBAN, the
 * creditor's address type and name and five address lines, seven lines for an ultimate creditor,
 * then the amount and the currency (CHF or EUR).
 */
function swiss(fields: readonly string[]): OtherPayment | null {
  const iban = (fields[3] ?? '').replace(/\s/g, '').toUpperCase();
  const country = /^(CH|LI)/.exec(iban)?.[0];
  if (!country) return null;
  const found: OtherPayment = { scheme: 'swissqr', country, currency: 'CHF' };
  const currency = fields[19]?.trim().toUpperCase();
  if (currency === 'CHF' || currency === 'EUR') found.currency = currency;
  setAmount(found, fields[18]);
  setName(found, fields[5]);
  return found;
}

/** The Czech banks' QR Platba: `SPD*1.0*ACC:CZ…*AM:480.50*CC:CZK*RN:Name*MSG:…`. */
function spayd(text: string): OtherPayment {
  const params = new Map<string, string>();
  for (const part of text.split('*').slice(2)) {
    const at = part.indexOf(':');
    if (at <= 0) continue;
    params.set(part.slice(0, at).toUpperCase(), decode(part.slice(at + 1)));
  }
  const account = params.get('ACC')?.toUpperCase() ?? '';
  const country = /^[A-Z]{2}/.exec(account)?.[0] ?? 'CZ';
  const found: OtherPayment = { scheme: 'spayd', country, currency: 'CZK' };
  const currency = params.get('CC')?.toUpperCase();
  if (currency && CODE.test(currency)) found.currency = currency;
  setAmount(found, params.get('AM'));
  setName(found, params.get('RN'));
  return found;
}

function lines(text: string): string[] {
  return text.split(/\r?\n/);
}

function setAmount(found: OtherPayment, value: string | undefined): void {
  const amount = value?.trim();
  if (amount && DECIMAL.test(amount) && Number(amount) > 0) found.amount = amount;
}

function setName(found: OtherPayment, value: string | undefined): void {
  const name = value?.normalize('NFC').trim();
  if (name) found.merchantName = name;
}

/** Percent-decoding that keeps a malformed escape as written, with "+" for a space. */
function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}
