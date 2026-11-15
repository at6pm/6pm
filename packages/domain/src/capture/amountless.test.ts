import { describe, expect, it } from 'vitest';

import { matchWithoutAmount } from './amountless';
import type { NewSighting, SightedSpend } from './duplicate';

// Every name, account and amount here is made up.

const T0 = Date.parse('2026-11-14T05:10:00.000Z');
const at = (seconds: number) => new Date(T0 + seconds * 1000).toISOString();

const tap = (over: Partial<NewSighting> = {}): NewSighting => ({
  amount: 0,
  source: 'applePay',
  at: at(0),
  merchant: 'Bep Nha Lan',
  atKind: 'now',
  ...over,
});

const alertRow = (over: Partial<SightedSpend> = {}): SightedSpend => ({
  id: 'alert',
  amount: 64_000,
  source: 'alert',
  status: 'caught',
  at: at(20),
  detail: 'MB Bank',
  merchant: 'BEP NHA LAN',
  atKind: 'delivered',
  ...over,
});

describe('matchWithoutAmount', () => {
  it('joins a Wallet tap at 0đ to the bank’s alert of it', () => {
    expect(matchWithoutAmount(tap(), [alertRow()])?.id).toBe('alert');
  });

  it('joins the bank’s alert to a Wallet tap saved at 0đ, the other way round', () => {
    const row: SightedSpend = {
      id: 'tap',
      amount: 0,
      source: 'applePay',
      status: 'caught',
      at: at(0),
      merchant: 'Bep Nha Lan',
      atKind: 'now',
    };
    const alert: NewSighting = {
      amount: 64_000,
      source: 'alert',
      at: at(20),
      detail: 'MB Bank',
      merchant: 'BEP NHA LAN',
      atKind: 'delivered',
    };
    expect(matchWithoutAmount(alert, [row])?.id).toBe('tap');
  });

  it('never joins two that both have an amount, or both have none', () => {
    expect(matchWithoutAmount(tap({ amount: 64_000 }), [alertRow()])).toBeNull();
    expect(matchWithoutAmount(tap(), [alertRow({ amount: 0 })])).toBeNull();
  });

  it('stays apart past the window its kinds of time allow', () => {
    expect(matchWithoutAmount(tap(), [alertRow({ at: at(10 * 60) })])).toBeNull();
  });

  it('stays apart when the two name different payees', () => {
    expect(matchWithoutAmount(tap(), [alertRow({ merchant: 'Circle K' })])).toBeNull();
  });

  it('takes the one whose payee agrees when two are near', () => {
    const other = alertRow({ id: 'other', merchant: 'CHUYEN TIEN', at: at(5) });
    expect(matchWithoutAmount(tap(), [other, alertRow()])?.id).toBe('alert');
  });

  it('leaves two near ones that cannot be told apart alone', () => {
    const one = alertRow({ id: 'one', merchant: 'CHUYEN TIEN' });
    const two = alertRow({ id: 'two', merchant: '', amount: 30_000, at: at(40) });
    expect(matchWithoutAmount(tap({ merchant: '' }), [one, two])).toBeNull();
    expect(matchWithoutAmount(tap({ merchant: '' }), [one])?.id).toBe('one');
  });

  it('never joins something the person typed, or a row they answered', () => {
    expect(matchWithoutAmount(tap(), [alertRow({ source: 'manual' })])).toBeNull();
    expect(matchWithoutAmount(tap(), [alertRow({ status: 'skipped' })])).toBeNull();
    expect(matchWithoutAmount(tap(), [alertRow({ direction: 'in' })])).toBeNull();
  });

  it('never gives a payment a second sighting from the witness that told it', () => {
    expect(matchWithoutAmount(tap(), [alertRow({ source: 'applePay' })])).toBeNull();
  });
});
