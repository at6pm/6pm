import type { SpendDirection, SpendSource } from '../spend/spend';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';
import { namesNoPayee } from './payee-names';
import { foldWords } from './spoken-spend';

/**
 * Two sightings of one payment that amount and minutes alone leave apart, each rule kept narrow:
 * a wallet or a card and the shop it paid, told a day apart; a card charged abroad and the shop's
 * own total, the bank's foreign fee apart; a shop's mails about one booking, told by its code.
 */

/** A wallet's or a card's notice and the receipt of the shop it paid can be this far apart. */
export const WALLET_SHOP_WINDOW_MS = 36 * 60 * 60_000;

/** One sighting, as these rules read it: its source, who told it, and who it says was paid. */
export interface Told {
  readonly source: SpendSource;
  /** An email's sender, an alert's app. */
  readonly detail?: string | null | undefined;
  readonly merchant?: string | null | undefined;
  /** The bank or wallet it says paid. */
  readonly bank?: string | null | undefined;
}

/** The last labels of a domain that only say where it is registered: `com`, `vn` in `com.vn`. */
const REGISTRY_LABELS: ReadonlySet<string> = new Set([
  'com',
  'net',
  'org',
  'co',
  'io',
  'ai',
  'app',
  'dev',
  'biz',
  'info',
  'edu',
  'gov',
  'vn',
  'sg',
  'us',
  'uk',
  'jp',
  'kr',
]);

/** A domain's own name, its registry labels dropped: `mail.shopee.vn` is `shopee`. */
function siteOfDomain(domain: string): string | null {
  const labels = domain.toLowerCase().split('.').filter(Boolean);
  while (labels.length > 1 && REGISTRY_LABELS.has(labels[labels.length - 1] ?? '')) labels.pop();
  const site = labels[labels.length - 1] ?? '';
  return site.length >= 3 && labels.length < domain.split('.').length ? site : null;
}

/** The site an email came from: `googleplay-noreply@google.com` is `google`. */
function siteOfSender(address: string | null | undefined): string | null {
  const domain = (address ?? '').split('@')[1]?.trim();
  return domain ? siteOfDomain(domain) : null;
}

/** A web address a card's line names as the shop ("AGODA.COM 9G SGN-HAN"). */
const SITE_IN_NAME = /(?:^|[\s*])((?:[a-z0-9][a-z0-9-]*\.)+[a-z]{2,})(?=$|[\s/])/iu;

/** The site a payee's name is, and whether it is registered in Vietnam; null when it names none. */
function siteNamed(name: string | null | undefined): { site: string; home: boolean } | null {
  const domain = SITE_IN_NAME.exec(name ?? '')?.[1];
  const site = domain ? siteOfDomain(domain) : null;
  return domain && site ? { site, home: /\.vn$/i.test(domain) } : null;
}

/** The bank or wallet behind a notice: an alert's app, an email's sending domain. */
function speaker(told: Told) {
  if (!told.detail) return null;
  if (told.source === 'alert') return bankOfApp(told.detail);
  if (told.source !== 'email') return null;
  return bankNamedIn((told.detail.split('@')[1] ?? '').replace(/[^a-z0-9]+/gi, ' '));
}

/** The wallet that told of a payment: a wallet app's alert or email, or Wallet's own tap. */
function walletOf(told: Told): string | null {
  if (told.source === 'applePay') return 'apple pay';
  const bank = speaker(told);
  return bank?.kind === 'wallet' ? foldWords(bank.shortName).trim() : null;
}

/** A bank's card notice of a charge at a site registered abroad: the bank, and the site. */
function cardAbroad(told: Told): { bank: string; site: string } | null {
  const bank = speaker(told);
  if (bank?.kind !== 'bank') return null;
  const named = siteNamed(told.merchant);
  return named && !named.home ? { bank: foldWords(bank.shortName).trim(), site: named.site } : null;
}

/** A shop's own email, from a site that is no bank's or wallet's: the site. */
function shopSite(told: Told): string | null {
  if (told.source !== 'email' || speaker(told) !== null) return null;
  return siteOfSender(told.detail);
}

/** Who paid and who was paid, for a wallet's or card's notice and the shop's receipt. */
export interface PaidAndPayee {
  readonly payer: string;
  readonly site: string;
}

/** The wallet paid the shop the receipt comes from: its payee is that site, by name. */
function walletNamesShop(wallet: Told, shop: Told): PaidAndPayee | null {
  const site = shopSite(shop);
  const payer = walletOf(wallet) ?? cardAbroad(wallet)?.bank ?? null;
  const payee = wallet.merchant ?? '';
  if (site === null || payer === null || payee.trim() === '' || namesNoPayee(payee)) return null;
  const words = foldWords(payee).trim().split(' ');
  if (!words.includes(site) && !words.join('').startsWith(site)) return null;
  // A receipt that says what paid it names this wallet or bank, or none.
  const said = foldWords(shop.bank ?? '').trim();
  return said === '' || said === payer ? { payer, site } : null;
}

/**
 * A wallet's or a card's notice and the receipt of the shop or platform it names as paid, either
 * way round: the notice's payee is the site the receipt was sent from, and the receipt names no
 * other wallet or bank as what paid. Null when the two are not such a pair.
 */
export function walletAndItsShop(a: Told, b: Told): PaidAndPayee | null {
  return walletNamesShop(a, b) ?? walletNamesShop(b, a);
}

/** Whether a sighting is told by the payer or the shop of a pair. */
export function toldBy(told: Told, pair: PaidAndPayee): boolean {
  return (
    walletOf(told) === pair.payer ||
    cardAbroad(told)?.bank === pair.payer ||
    shopSite(told) === pair.site
  );
}

/**
 * A bank's card notice of a charge at a site registered abroad, and that site's own email, either
 * way round: one charge, which the bank debits with its foreign fee on top.
 */
export function cardAbroadAndItsShop(a: Told, b: Told): boolean {
  const named = (card: Told, shop: Told) => {
    const charge = cardAbroad(card);
    return charge !== null && shopSite(shop) === charge.site;
  };
  return named(a, b) || named(b, a);
}

/** A shop's mail by its booking or order code, as these rules compare them. */
export interface Booked {
  readonly reference?: string | null | undefined;
  /** The sender's address. */
  readonly detail?: string | null | undefined;
  readonly direction?: SpendDirection | null | undefined;
}

/** The codes a reference holds: "1797…00, 1797…01" is two. */
function codesOf(reference: string | null | undefined): string[] {
  return (reference ?? '')
    .toUpperCase()
    .split(/[\s,;/|]+/)
    .filter((code) => code.length >= 4);
}

/**
 * Two mails from one shop's site about one booking or order: they share a code it printed, and
 * go the same way. A later mail about a booking already paid (its confirmation, a part of it
 * confirmed) restates that payment; a new booking has a code of its own.
 */
export function sameBooking(a: Booked, b: Booked): boolean {
  if ((a.direction ?? 'out') !== (b.direction ?? 'out')) return false;
  const site = siteOfSender(a.detail);
  if (site === null || site !== siteOfSender(b.detail)) return false;
  const codes = new Set(codesOf(a.reference));
  return codesOf(b.reference).some((code) => codes.has(code));
}
