import type { EmailCapture } from '../contracts/receipt-email';
import type { InboxSpend } from '../contracts/surfaces';
import { currencyOf, toMinor } from '../money/currency';
import type { SpendDirection, SpendSource } from '../spend/spend';
import type { BankInfo } from '../vietqr/bank-catalogue';
import { heardKeyOf } from './alert-repeat';
import { bankNamedIn, bankOfApp } from './bank-alert-senders';

/**
 * A sighting is what one witness said once about one payment: a bank's alert, a forwarded mail, a
 * shared receipt, a Wallet tap, a code scanned, a spend typed or said. Every way in turns what it
 * was handed into one, before anything decides whether the payment is new. A field the way in
 * cannot know is left out, never guessed.
 */

/** How the words reached 6pm. Not who said them (`witness`). */
export type SightingChannel =
  | 'alert'
  | 'email'
  | 'shared'
  | 'receiptPhoto'
  | 'qr'
  | 'wallet'
  | 'typed'
  | 'voice'
  | 'cash'
  | 'import';

/** What the words say happened, decided before any other field is read. */
export type SightingWhat =
  'payment' | 'incoming' | 'refund' | 'reversal' | 'failed' | 'ownTransfer';

/**
 * What a sighting's time is: printed in the message, the moment the message reached the phone,
 * the date a mail was sent, or the moment it was captured.
 */
export type SightingAtKind = 'printed' | 'delivered' | 'sent' | 'now';

/** Who is speaking: a bank, a wallet, a shop, or the person. */
export interface SightingWitness {
  readonly kind: 'bank' | 'wallet' | 'shop' | 'person';
  /** "MB Bank", "MoMo", "grab.com"; absent when the way in does not say. */
  readonly name?: string;
}

export interface CaptureSighting {
  readonly witness: SightingWitness;
  readonly channel: SightingChannel;
  readonly what: SightingWhat;
  /** In minor units of `currency` (đồng, cents), as the witness gave it; absent when none was read. */
  readonly amount?: number;
  /** ISO 4217; absent with the amount. */
  readonly currency?: string;
  readonly direction: SpendDirection;
  /** When it happened, ISO 8601. */
  readonly at: string;
  /** What `at` is; absent when the way in cannot tell. */
  readonly atKind?: SightingAtKind;
  /** The bank's or shop's own code for the payment ("Mã GD", an order number), as printed. */
  readonly reference?: string;
  /** The last digits of the account it left or entered. */
  readonly accountTail?: string;
  /** The bank or wallet holding that account, by its catalogue name. */
  readonly bank?: string;
  /** Who was paid (or who paid, for money in), as printed or typed. */
  readonly payee?: string;
  /** The transfer's own words ("Nội dung"). */
  readonly memo?: string;
  /** A fingerprint of the message's words, the same for the same message delivered again. */
  readonly words?: string;
}

/** The fields a builder may not know, each dropped when empty. */
type Optional = Omit<CaptureSighting, 'witness' | 'channel' | 'what' | 'direction' | 'at'>;
type Loose = { readonly [K in keyof Optional]?: Optional[K] | null | undefined };

/** The sighting with every unknown field left out rather than written as null or blank. */
function sightingOf(
  known: Pick<CaptureSighting, 'witness' | 'channel' | 'what' | 'direction' | 'at'>,
  loose: Loose,
): CaptureSighting {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(loose)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    kept[key] = typeof value === 'string' ? value.trim() : value;
  }
  return { ...known, ...(kept as Optional) };
}

const CHANNEL_OF: Readonly<Record<SpendSource, SightingChannel>> = {
  manual: 'typed',
  voice: 'voice',
  cash: 'cash',
  qr: 'qr',
  shared: 'shared',
  email: 'email',
  applePay: 'wallet',
  alert: 'alert',
  import: 'import',
};

/** The channel a capture of this source arrives by. */
export function channelOfSource(source: SpendSource): SightingChannel {
  return CHANNEL_OF[source];
}

const witnessOfBank = (bank: BankInfo | null): SightingWitness | null =>
  bank ? { kind: bank.kind, name: bank.shortName } : null;

/** A bank or wallet the catalogue knows, by any name it answers to; null for one it does not. */
function bankWitness(name: string | null | undefined): SightingWitness | null {
  return witnessOfBank(bankOfApp(name));
}

/** Money in read as a refund, as money in, or a payment out. */
function whatOf(direction: SpendDirection | null | undefined, refund: boolean): SightingWhat {
  if (direction !== 'in') return 'payment';
  return refund ? 'refund' : 'incoming';
}

/** An amount in its own currency's minor units, or none when it was not read (0, or absent). */
function amountOf(
  home: { readonly amount: number | null; readonly currency: string },
  foreign: { readonly currency: string; readonly amount: number } | null | undefined,
): { readonly amount?: number; readonly currency?: string } {
  if (foreign && Number.isFinite(foreign.amount) && foreign.amount > 0) {
    return {
      amount: toMinor(foreign.amount, currencyOf(foreign.currency)),
      currency: foreign.currency,
    };
  }
  if (home.amount === null || !(home.amount > 0)) return {};
  return { amount: home.amount, currency: home.currency };
}

/** What a capture saved by the app itself carries: the spend it would become. */
export interface SpendSeen {
  readonly source: SpendSource;
  /** In the home currency; 0 when none was read. */
  readonly amount: number;
  readonly merchant: string;
  /** When it happened; absent means now. */
  readonly at?: Date | undefined;
  readonly wallet?: string | null | undefined;
  readonly detail?: string | null | undefined;
  readonly memo?: string | null | undefined;
  readonly direction?: SpendDirection | null | undefined;
  readonly moneyIn?: 'refund' | null | undefined;
  readonly foreignAmount?:
    { readonly currency: string; readonly amount: number } | null | undefined;
}

/** Who speaks for a capture the app made itself, by its source. */
function witnessOfSpend(input: SpendSeen): SightingWitness {
  switch (input.source) {
    case 'manual':
    case 'voice':
    case 'cash':
    case 'qr':
    case 'import':
      return { kind: 'person' };
    case 'applePay':
      return { kind: 'wallet', name: 'Apple Pay' };
    case 'email':
    case 'alert':
    case 'shared':
      // A bank's line dropped on the phone or its alert names the bank; a mail without one, a shop.
      return (
        bankWitness(input.wallet) ??
        witnessOfBank(bankNamedIn(input.detail ?? '')) ?? {
          kind: input.source === 'email' ? 'shop' : 'bank',
        }
      );
  }
}

/**
 * The sighting of a spend the app captured from its own screens: Quick add, voice, cash at the
 * close, Ask, Market mode, a scanned code waiting for the bank, a bank line dropped on the phone.
 * The person is the witness for what they typed, said or scanned; `home` is the currency the
 * amount is counted in.
 */
export function sightingOfSpend(
  input: SpendSeen,
  home: string,
  now: Date = new Date(),
): CaptureSighting {
  const direction = input.direction === 'in' ? 'in' : 'out';
  const witness = witnessOfSpend(input);
  const typed = witness.kind === 'person';
  return sightingOf(
    {
      witness,
      channel: channelOfSource(input.source),
      what: whatOf(direction, input.moneyIn === 'refund'),
      direction,
      at: (input.at ?? now).toISOString(),
    },
    {
      ...amountOf({ amount: input.amount, currency: home }, input.foreignAmount),
      atKind: input.at ? null : 'now',
      // A code scanned names the bank paid from; a typed spend's wallet is the person's own word.
      bank: input.source === 'qr' || !typed ? input.wallet : null,
      payee: input.merchant,
      memo: input.memo,
    },
  );
}

/**
 * The sighting of a file the extensions left in the inbox: a bank's alert, a shared receipt, a
 * Wallet tap, a spend said to Siri. `channel` names a receipt photographed in Scan, which arrives
 * as a shared receipt does. The alert's fingerprint is its words'; what its time is, its code and
 * its account are the alert reader's, on files that carry them.
 */
export function sightingOfInboxItem(
  item: InboxSpend,
  channel: SightingChannel = channelOfSource(item.source),
): CaptureSighting {
  const direction = item.direction ?? 'out';
  const receipt = item.receipt;
  const witness: SightingWitness =
    item.source === 'applePay'
      ? { kind: 'wallet', name: 'Apple Pay' }
      : item.source === 'voice'
        ? { kind: 'person' }
        : (bankWitness(receipt?.bank) ??
          (item.source === 'alert'
            ? receipt?.bank
              ? { kind: 'bank', name: receipt.bank }
              : { kind: 'bank' }
            : item.merchant.trim()
              ? { kind: 'shop', name: item.merchant.trim() }
              : { kind: 'shop' }));
  const foreign = item.foreign
    ? { currency: item.foreign.currency, amount: Number(item.foreign.amount) }
    : null;
  return sightingOf(
    { witness, channel, what: item.what ?? whatOf(direction, false), direction, at: item.at },
    {
      ...amountOf({ amount: item.amount, currency: item.currency ?? 'VND' }, foreign),
      atKind: item.atKind ?? (item.source === 'applePay' || item.source === 'voice' ? 'now' : null),
      reference: item.reference ?? receipt?.code,
      accountTail: item.accountTail,
      bank: receipt?.bank,
      payee: item.merchant,
      memo: receipt?.memo,
      words: item.source === 'alert' ? heardKeyOf(item.id) : null,
    },
  );
}

/** The site a mail came from: `no-reply@grab.com` → `grab.com`. */
function domainOf(from: string | null): string | null {
  const domain = (from ?? '').split('@')[1]?.trim().toLowerCase();
  return domain ? domain : null;
}

/**
 * The sighting of a mail the server read: the bank that sent it, else the shop by its domain;
 * the bank's code for the payment as the reader kept it; what the mail is, and what its time is,
 * as the server says (a server from before it said leaves the time's kind out).
 */
export function sightingOfEmail(capture: EmailCapture): CaptureSighting {
  const kind = capture.kind;
  const direction = kind === 'incoming' || kind === 'refund' || kind === 'reversal' ? 'in' : 'out';
  const domain = domainOf(capture.from);
  const witness: SightingWitness =
    bankWitness(capture.bank) ??
    witnessOfBank(bankNamedIn((domain ?? '').replace(/[^a-z0-9]+/g, ' '))) ??
    (domain ? { kind: 'shop', name: domain } : { kind: 'shop' });
  return sightingOf(
    {
      witness,
      channel: 'email',
      what: kind === undefined ? 'payment' : kind,
      direction,
      at: capture.at,
    },
    {
      ...amountOf({ amount: capture.amount, currency: capture.currency ?? 'VND' }, null),
      atKind: capture.atKind,
      reference: capture.code,
      bank: capture.bank,
      payee: capture.merchant,
      memo: capture.memo,
    },
  );
}
