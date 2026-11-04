import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import { readBankAlert, type BankAlertInput } from './bank-alert';
import { alertPackages, bankNamedIn, bankOfApp } from './bank-alert-senders';

/**
 * Alerts from banks and wallets outside Vietnam, as their apps word them, read on a phone that
 * counts in their currency. Names, amounts and card numbers are made up.
 */
const read = (input: BankAlertInput | string, home = 'USD') =>
  readBankAlert(typeof input === 'string' ? { body: input } : input, currencyOf(home));

const way = (input: BankAlertInput | string, home = 'USD') => {
  const alert = read(input, home);
  return alert.kind === 'moved' ? alert.direction : alert.reason;
};

describe('Vietnam’s banks come first', () => {
  it('keeps short codes Vietnam shares with banks elsewhere', () => {
    expect(bankOfApp('NAB')?.id).toBe('NAB');
    expect(bankOfApp('NAB')?.country).toBe('VN');
    expect(bankOfApp('DBS')?.id).toBe('DBS');
    expect(bankOfApp('UOB')?.id).toBe('UOB');
  });

  it('reads a Vietnamese alert that names Nam A by its code as Nam A', () => {
    const alert = readBankAlert({ body: 'TK NAB 0123456789 -50,000VND luc 12:30. ND: an trua' });
    expect(alert.bank).toBe(bankOfApp('NAB')?.shortName);
  });

  it('never tags a shop named like a foreign bank’s code', () => {
    expect(bankNamedIn('Thanh toan tai ABC Bakery')).toBeNull();
    expect(readBankAlert({ body: 'Thanh toan tai ABC Bakery -50,000 VND' }).bank).toBeNull();
  });
});

describe('banks of other countries', () => {
  it('knows a foreign bank by its Android package or its whole name', () => {
    expect(bankOfApp('com.chase.sig.android')?.id).toBe('US.CHASE');
    expect(bankOfApp('com.revolut.revolut')?.id).toBe('REVOLUT');
    expect(bankOfApp('Revolut')?.id).toBe('REVOLUT');
    expect(bankOfApp('Chase')?.id).toBe('US.CHASE');
  });

  it('listens to bank and wallet apps only, never a chat or super-app', () => {
    const packages = alertPackages();
    expect(packages).toEqual(expect.arrayContaining(['com.mbmobile', 'com.chase.sig.android']));
    expect(packages).toContain('com.revolut.revolut');
    for (const chat of [
      'com.tencent.mm',
      'com.grabtaxi.passenger',
      'jp.naver.line.android',
      'com.gojek.app',
      'com.shopee.id',
      'com.eg.android.AlipayGphone',
      'viva.republica.toss',
      'com.whatsapp',
      'com.zing.zalo',
    ]) {
      expect(packages).not.toContain(chat);
    }
    expect(new Set(packages).size).toBe(packages.length);
  });
});

describe('English alerts', () => {
  it('reads money in, whatever the word “transaction” says', () => {
    expect(way('Transaction of $500.00 received from John')).toBe('in');
    expect(way('New transaction: $500.00 deposited')).toBe('in');
    expect(way('Transaction refunded: $20.00')).toBe('in');
  });

  it('reads a Chase card alert as money out at the shop', () => {
    const alert = read({
      app: 'com.chase.sig.android',
      title: 'Chase',
      body: 'You made a $25.00 transaction with STARBUCKS on Chase Freedom card ending in 1234.',
    });
    expect(alert).toMatchObject({
      kind: 'moved',
      direction: 'out',
      amount: 2500,
      currency: 'USD',
      counterparty: 'STARBUCKS',
      bank: 'Chase',
    });
  });

  it('reads Revolut’s payments and money in', () => {
    expect(
      read(
        { app: 'com.revolut.revolut', title: 'Pret A Manger', body: 'Paid £4.50 at Pret A Manger' },
        'GBP',
      ),
    ).toMatchObject({
      direction: 'out',
      amount: 450,
      counterparty: 'Pret A Manger',
      bank: 'Revolut',
    });
    expect(way('You received €20.00 from John', 'EUR')).toBe('in');
  });

  it('reads Wise, PayPal, Venmo and Cash App', () => {
    expect(read('You spent 12.50 EUR at Lidl', 'EUR')).toMatchObject({
      direction: 'out',
      amount: 1250,
      counterparty: 'Lidl',
    });
    expect(read('You sent $20.00 USD to John Smith')).toMatchObject({
      direction: 'out',
      counterparty: 'John Smith',
    });
    expect(way('You’ve got money: John sent you $20.00')).toBe('in');
    expect(way('Sarah paid you $20.00')).toBe('in');
    expect(way('You paid Sarah $20.00')).toBe('out');
    expect(way('You sent $15 to $john')).toBe('out');
  });

  it('does not take a request for money as a payment', () => {
    expect(way('Sarah requests $20.00 for pizza')).toBe('unread');
  });
});
