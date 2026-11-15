import { describe, expect, it } from 'vitest';

import { findDuplicate, mayBeSamePayment, type NewSighting, type SightedSpend } from './duplicate';
import { WALLET_SHOP_WINDOW_MS, sameBooking } from './witness-pairs';

// Every shop, site, code and amount here is made up; the wallet and bank are catalogue names.

const T0 = Date.parse('2026-11-11T01:48:00.000Z');
const at = (ms: number) => new Date(T0 + ms).toISOString();
const HOUR = 60 * 60_000;

/** A wallet's mail that it paid a shop, printing its time. */
const wallet = (over: Partial<SightedSpend> = {}): SightedSpend => ({
  id: 'wallet',
  amount: 165_000,
  source: 'email',
  status: 'caught',
  at: at(0),
  detail: 'no-reply@momo.vn',
  merchant: 'Playmau',
  atKind: 'printed',
  bank: 'MoMo',
  ...over,
});

/** The shop's own receipt for it, sent a day later, naming the wallet that paid. */
const receipt = (over: Partial<NewSighting> = {}): NewSighting => ({
  amount: 165_000,
  source: 'email',
  at: at(24 * HOUR),
  detail: 'receipts@playmau.com',
  merchant: 'Gói Premium (Playmau)',
  atKind: 'sent',
  bank: 'MoMo',
  ...over,
});

describe('a wallet and the shop it paid, told a day apart', () => {
  it('is one payment up to a day and a half apart, either way round', () => {
    expect(findDuplicate(receipt(), [wallet()])?.id).toBe('wallet');
    expect(findDuplicate(receipt({ at: at(WALLET_SHOP_WINDOW_MS) }), [wallet()])?.id).toBe(
      'wallet',
    );
    expect(findDuplicate(receipt({ at: at(WALLET_SHOP_WINDOW_MS + 1) }), [wallet()])).toBeNull();
    const shop: SightedSpend = { ...receipt(), id: 'shop', status: 'caught', at: at(0) };
    const late = { ...wallet(), at: at(24 * HOUR) };
    expect(findDuplicate(late, [shop])?.id).toBe('shop');
    // The receipt can say nothing of what paid it, or come before the wallet's word.
    expect(findDuplicate(receipt({ bank: null }), [wallet()])?.id).toBe('wallet');
    expect(findDuplicate(receipt({ at: at(-24 * HOUR) }), [wallet()])?.id).toBe('wallet');
  });

  it('takes a wallet’s alert or a Wallet tap as the wallet', () => {
    const alerted = wallet({ source: 'alert', detail: 'MoMo' });
    expect(findDuplicate(receipt(), [alerted])?.id).toBe('wallet');
    const tapped = wallet({ source: 'applePay', detail: null, bank: null, atKind: 'now' });
    expect(findDuplicate(receipt({ bank: null }), [tapped])?.id).toBe('wallet');
  });

  it('needs the same amount, and the wallet naming the very site the receipt came from', () => {
    expect(findDuplicate(receipt({ amount: 165_500 }), [wallet()])).toBeNull();
    expect(findDuplicate(receipt(), [wallet({ merchant: 'Shopmau' })])).toBeNull();
    expect(findDuplicate(receipt(), [wallet({ merchant: '' })])).toBeNull();
    expect(findDuplicate(receipt(), [wallet({ merchant: 'Chuyen tien' })])).toBeNull();
    // A receipt naming another wallet as what paid it is another payment.
    expect(findDuplicate(receipt({ bank: 'ZaloPay' }), [wallet()])).toBeNull();
    // A bank's transfer is not a wallet's or a card's word: its own windows apply.
    const bank = wallet({ detail: 'thongbao@mbbank.com.vn', bank: 'MB Bank' });
    expect(findDuplicate(receipt({ bank: null }), [bank])).toBeNull();
    // Two wallets' words, or the wallet's word twice, are not a shop's.
    expect(findDuplicate(receipt({ detail: 'no-reply@zalopay.vn' }), [wallet()])).toBeNull();
    expect(findDuplicate(receipt({ detail: 'no-reply@momo.vn' }), [wallet()])).toBeNull();
    expect(findDuplicate(receipt({ direction: 'in' }), [wallet()])).toBeNull();
  });

  it('keeps two real payments to one shop a day apart as two', () => {
    // The first was paid and its receipt came at once; the next day the wallet pays again.
    const first = wallet({
      seenBy: [{ source: 'email', detail: 'receipts@playmau.com', at: at(2 * 60_000) }],
    });
    const again = { ...wallet(), at: at(24 * HOUR) };
    expect(findDuplicate(again, [first])).toBeNull();
    // That payment's receipt joins it, not the first.
    const second = wallet({ id: 'second', at: at(24 * HOUR) });
    expect(findDuplicate(receipt({ at: at(24 * HOUR + 60_000) }), [first, second])?.id).toBe(
      'second',
    );
  });

  it('pairs nothing when another payment of that amount from that wallet or to that shop is near', () => {
    // Two wallet payments a few hours apart and one receipt a day on: whose it is cannot be told.
    const later = wallet({ id: 'later', at: at(8 * HOUR) });
    expect(findDuplicate(receipt(), [wallet(), later])).toBeNull();
    // A receipt of that amount from the shop already standing alone, paid some other way.
    const card: SightedSpend = { ...receipt(), id: 'card', status: 'caught', at: at(10 * HOUR) };
    expect(findDuplicate(receipt(), [wallet(), card])).toBeNull();
    // Another wallet payment of that amount to someone else, a month back, changes nothing.
    const old = wallet({ id: 'old', at: at(-30 * 24 * HOUR) });
    expect(findDuplicate(receipt(), [wallet(), old])?.id).toBe('wallet');
  });

  it('is not used to void a payment or set one aside', () => {
    expect(findDuplicate(receipt(), [wallet()], { anyWitness: true })).toBeNull();
    expect(findDuplicate(receipt(), [wallet()], { anyDirection: true })).toBeNull();
  });
});

/** A bank's card mail of a charge in đồng at a booking site registered abroad. */
const card = (over: Partial<SightedSpend> = {}): SightedSpend => ({
  id: 'card',
  amount: 8_142_000,
  source: 'email',
  status: 'caught',
  at: at(0),
  detail: 'thongbao@mbbank.com.vn',
  merchant: 'BOOKMAU.COM 9X AAA-BBB',
  atKind: 'printed',
  bank: 'MB Bank',
  ...over,
});

/** The site's own mail of the booking's total, 1.7% below what the card was charged. */
const total = (over: Partial<NewSighting> = {}): NewSighting => ({
  amount: 8_004_000,
  source: 'email',
  at: at(50_000),
  detail: 'no-reply@bookmau.com',
  merchant: '',
  atKind: 'sent',
  ...over,
});

describe('a card charged abroad and the site’s own total', () => {
  it('is one payment the bank’s foreign fee apart, either way round', () => {
    expect(findDuplicate(total(), [card()])?.id).toBe('card');
    const site: SightedSpend = { ...total(), id: 'site', status: 'caught', at: at(0) };
    expect(findDuplicate({ ...card(), at: at(50_000) }, [site])?.id).toBe('site');
    // Up to five percent, as a charge priced abroad.
    expect(findDuplicate(total({ amount: 7_734_900 }), [card()])?.id).toBe('card');
    expect(findDuplicate(total({ amount: 7_734_000 }), [card()])).toBeNull();
    // A card's line naming the site among other words, or the site naming itself, still agrees.
    expect(findDuplicate(total({ merchant: 'Bookmau' }), [card()])?.id).toBe('card');
  });

  it('keeps a domestic pair 1.7% apart as two', () => {
    // The card's line names a Vietnamese site, or no site at all.
    expect(findDuplicate(total(), [card({ merchant: 'BOOKMAU.VN' })])).toBeNull();
    expect(findDuplicate(total(), [card({ merchant: 'BOOKMAU SAIGON' })])).toBeNull();
    // A transfer at home from a bank 1.7% apart from a shop's receipt.
    const transfer = card({ merchant: 'CONG TY BOOKMAU' });
    expect(findDuplicate(total({ merchant: 'Bookmau' }), [transfer])).toBeNull();
  });

  it('needs the site the card names to be the one that sent the total', () => {
    expect(findDuplicate(total({ detail: 'no-reply@othermau.com' }), [card()])).toBeNull();
    // Two banks' cards, or a wallet, are not the site's own word.
    expect(findDuplicate(total({ detail: 'info@info.vietcombank.com.vn' }), [card()])).toBeNull();
    expect(findDuplicate(total({ detail: 'no-reply@momo.vn' }), [card()])).toBeNull();
    // Further apart in time than any notice's window, they stay two.
    expect(findDuplicate(total({ at: at(16 * 60_000) }), [card()])).toBeNull();
  });

  it('lets an exact amount win, and is not used to void a payment', () => {
    const exact = card({ id: 'exact', amount: 8_004_000, merchant: 'BOOKMAU.COM' });
    expect(findDuplicate(total(), [card(), exact])?.id).toBe('exact');
    expect(findDuplicate(total(), [card()], { anyWitness: true })).toBeNull();
  });

  it('lets the phone hold the card’s row as a candidate when told who sent the total', () => {
    expect(mayBeSamePayment(card(), 8_004_000, total())).toBe(true);
    expect(mayBeSamePayment(card(), 8_004_000)).toBe(false);
    expect(mayBeSamePayment(card({ merchant: 'BOOKMAU.VN' }), 8_004_000, total())).toBe(false);
  });
});

describe('sameBooking', () => {
  const paid = { reference: '5510200001,5510200002', detail: 'no-reply@bookmau.com' };

  it('ties two mails from one site sharing a code', () => {
    expect(sameBooking(paid, { ...paid })).toBe(true);
    expect(sameBooking(paid, { ...paid, reference: '5510200002' })).toBe(true);
    expect(sameBooking(paid, { ...paid, detail: 'booking@mail.bookmau.com' })).toBe(true);
  });

  it('keeps a new booking, another site, money back, or no code apart', () => {
    expect(sameBooking(paid, { ...paid, reference: '5510200003' })).toBe(false);
    expect(sameBooking(paid, { ...paid, detail: 'no-reply@othermau.com' })).toBe(false);
    expect(sameBooking(paid, { ...paid, direction: 'in' })).toBe(false);
    expect(sameBooking(paid, { ...paid, reference: null })).toBe(false);
    expect(sameBooking({ ...paid, reference: 'A1' }, { ...paid, reference: 'A1' })).toBe(false);
  });
});
