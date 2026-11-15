import { describe, expect, it } from 'vitest';

import type { EmailCapture } from '../contracts/receipt-email';
import type { InboxSpend } from '../contracts/surfaces';
import { heardAlertId, heardKeyOf } from './alert-repeat';
import {
  channelOfSource,
  sightingOfEmail,
  sightingOfInboxItem,
  sightingOfSpend,
  type CaptureSighting,
} from './sighting';

const AT = '2026-11-12T09:41:07.000Z';
const NOW = new Date('2026-11-12T09:45:00.000Z');

const item = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: '5b0e6c1a-2f4d-4e8a-9c3b-7d1f0a2e6b54',
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: AT,
  amount: 120_000,
  merchant: 'Quan Bun Ca Hoa Sen',
  categoryId: null,
  ...over,
});

const mail = (over: Partial<EmailCapture> = {}): EmailCapture => ({
  id: 'em-0001',
  amount: 85_000,
  merchant: 'Tiem Banh Gio',
  at: AT,
  from: 'no-reply@shopmau.vn',
  bank: null,
  code: null,
  ...over,
});

/** Every field a sighting may carry, so a test says which ones a way in left out. */
const keysOf = (sighting: CaptureSighting) => Object.keys(sighting).sort();

describe('channelOfSource', () => {
  it('names the channel each capture source arrives by', () => {
    expect(channelOfSource('manual')).toBe('typed');
    expect(channelOfSource('applePay')).toBe('wallet');
    expect(channelOfSource('alert')).toBe('alert');
    expect(channelOfSource('import')).toBe('import');
  });
});

describe('sightingOfInboxItem', () => {
  it('reads a bank alert: the bank as witness, its fingerprint, no time kind', () => {
    const id = heardAlertId(
      { app: 'MB Bank', title: 'Biến động số dư', body: 'TK 99xx01 GD -120,000VND' },
      '0f1e2d3c-4b5a-4968-a7b6-c5d4e3f2a1b0',
    );
    const seen = sightingOfInboxItem(item({ id, receipt: { bank: 'MB Bank', namingLines: [] } }));
    expect(seen).toEqual({
      witness: { kind: 'bank', name: 'MB Bank' },
      channel: 'alert',
      what: 'payment',
      direction: 'out',
      at: AT,
      amount: 120_000,
      currency: 'VND',
      bank: 'MB Bank',
      payee: 'Quan Bun Ca Hoa Sen',
      words: heardKeyOf(id),
    });
  });

  it('keeps a wallet as a wallet, and money in as incoming', () => {
    const seen = sightingOfInboxItem(
      item({ direction: 'in', receipt: { bank: 'MoMo', namingLines: [] } }),
    );
    expect(seen.witness).toEqual({ kind: 'wallet', name: 'MoMo' });
    expect(seen.what).toBe('incoming');
    expect(seen.direction).toBe('in');
  });

  it('leaves out an amount the alert did not give, and a fingerprint an older id lacks', () => {
    const seen = sightingOfInboxItem(item({ amount: null, merchant: '' }));
    expect(keysOf(seen)).toEqual(['at', 'channel', 'direction', 'what', 'witness']);
    expect(seen.witness).toEqual({ kind: 'bank' });
  });

  it('reads a shared bank receipt: its code as the reference, its memo, the bank', () => {
    const seen = sightingOfInboxItem(
      item({
        source: 'shared',
        receipt: {
          bank: 'Vietcombank',
          code: 'FT26316XQ7',
          memo: 'tra tien an trua',
          namingLines: [],
        },
      }),
    );
    expect(seen).toMatchObject({
      witness: { kind: 'bank', name: 'Vietcombank' },
      channel: 'shared',
      reference: 'FT26316XQ7',
      memo: 'tra tien an trua',
      bank: 'Vietcombank',
    });
    expect(seen.atKind).toBeUndefined();
  });

  it('calls a receipt photographed in Scan by its own channel, its shop the witness', () => {
    const seen = sightingOfInboxItem(item({ source: 'shared' }), 'receiptPhoto');
    expect(seen.channel).toBe('receiptPhoto');
    expect(seen.witness).toEqual({ kind: 'shop', name: 'Quan Bun Ca Hoa Sen' });
  });

  it('reads a Wallet tap as the wallet speaking, timed when it was caught', () => {
    const seen = sightingOfInboxItem(item({ source: 'applePay', receipt: undefined }));
    expect(seen.witness).toEqual({ kind: 'wallet', name: 'Apple Pay' });
    expect(seen.channel).toBe('wallet');
    expect(seen.atKind).toBe('now');
  });

  it('keeps a foreign amount in its own currency and minor units', () => {
    const seen = sightingOfInboxItem(
      item({ source: 'shared', amount: null, foreign: { currency: 'USD', amount: '12.50' } }),
    );
    expect(seen.amount).toBe(1_250);
    expect(seen.currency).toBe('USD');
  });

  it('a spend said to Siri is the person speaking', () => {
    expect(sightingOfInboxItem(item({ source: 'voice' })).witness).toEqual({ kind: 'person' });
  });
});

describe('sightingOfEmail', () => {
  it('reads a shop’s mail: the shop by its domain, its code as the reference', () => {
    const seen = sightingOfEmail(mail({ code: 'DH-77120' }));
    expect(seen).toEqual({
      witness: { kind: 'shop', name: 'shopmau.vn' },
      channel: 'email',
      what: 'payment',
      direction: 'out',
      at: AT,
      amount: 85_000,
      currency: 'VND',
      reference: 'DH-77120',
      payee: 'Tiem Banh Gio',
    });
  });

  it('reads a bank’s mail with the bank as witness', () => {
    const seen = sightingOfEmail(mail({ bank: 'Vietcombank', from: 'info@vcbmau.example' }));
    expect(seen.witness).toEqual({ kind: 'bank', name: 'Vietcombank' });
    expect(seen.bank).toBe('Vietcombank');
  });

  it('reads money in and a refund as what they are', () => {
    expect(sightingOfEmail(mail({ kind: 'incoming' }))).toMatchObject({
      what: 'incoming',
      direction: 'in',
    });
    expect(sightingOfEmail(mail({ kind: 'refund' }))).toMatchObject({
      what: 'refund',
      direction: 'in',
    });
  });

  it('keeps the currency a card was charged in', () => {
    expect(sightingOfEmail(mail({ amount: 999, currency: 'USD' }))).toMatchObject({
      amount: 999,
      currency: 'USD',
    });
  });
});

describe('sightingOfSpend', () => {
  it('a typed spend is the person speaking, timed now', () => {
    const seen = sightingOfSpend(
      { source: 'manual', amount: 45_000, merchant: 'Pho Ga Lan', wallet: 'Cash' },
      'VND',
      NOW,
    );
    expect(seen).toEqual({
      witness: { kind: 'person' },
      channel: 'typed',
      what: 'payment',
      direction: 'out',
      at: NOW.toISOString(),
      atKind: 'now',
      amount: 45_000,
      currency: 'VND',
      payee: 'Pho Ga Lan',
    });
  });

  it('a code scanned keeps the bank it is paid from; a given time has no kind', () => {
    const at = new Date(AT);
    const seen = sightingOfSpend(
      { source: 'qr', amount: 30_000, merchant: 'Ca Phe Goc Pho', wallet: 'MB Bank', at },
      'VND',
      NOW,
    );
    expect(seen).toMatchObject({ channel: 'qr', bank: 'MB Bank', at: AT });
    expect(seen.atKind).toBeUndefined();
  });

  it('cash said at the close comes by voice; an amount of 0 is none read', () => {
    const seen = sightingOfSpend({ source: 'voice', amount: 0, merchant: 'Xe om' }, 'VND', NOW);
    expect(seen.channel).toBe('voice');
    expect(seen.amount).toBeUndefined();
    expect(seen.currency).toBeUndefined();
  });

  it('a bank line dropped on the phone names its bank from the words', () => {
    const seen = sightingOfSpend(
      { source: 'shared', amount: 50_000, merchant: 'Tap hoa Minh', detail: 'TK VCB 0011 -50,000' },
      'VND',
      NOW,
    );
    expect(seen.witness).toEqual({ kind: 'bank', name: 'Vietcombank' });
  });

  it('money in read as a refund is a refund, in its home currency', () => {
    const seen = sightingOfSpend(
      { source: 'email', amount: 1_250, merchant: 'Shop', direction: 'in', moneyIn: 'refund' },
      'USD',
      NOW,
    );
    expect(seen).toMatchObject({ what: 'refund', direction: 'in', amount: 1_250, currency: 'USD' });
  });

  it('a charge abroad keeps the amount paid, not the home one', () => {
    const seen = sightingOfSpend(
      {
        source: 'qr',
        amount: 330_000,
        merchant: 'Warung Sari',
        foreignAmount: { currency: 'IDR', amount: 200_000 },
      },
      'VND',
      NOW,
    );
    expect(seen).toMatchObject({ amount: 200_000, currency: 'IDR' });
  });
});
