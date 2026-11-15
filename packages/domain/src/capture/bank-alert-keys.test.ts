import { describe, expect, it } from 'vitest';

import { readBankAlertKeys, readFailedBankAlert } from './bank-alert';

// Every account number, code and name here is made up.

describe('readBankAlertKeys', () => {
  it('reads the account before the amount and a printed time', () => {
    expect(
      readBankAlertKeys({
        app: 'MB Bank',
        body: 'TK 0123xxx456|GD: -92,000VND 28/10/26 17:09|SD: 1,234,567VND|ND: QANDSD8634 MOMO',
      }),
    ).toEqual({ atKind: 'printed', reference: null, accountTail: '456', what: null });
  });

  it('reads a labelled transaction code', () => {
    expect(
      readBankAlertKeys({
        body: 'Tài khoản 99xx01 -120.000đ lúc 12:30 Mã GD: 412345678 ND chuyen tien an trua',
      }),
    ).toMatchObject({ reference: '412345678', accountTail: '01' });
    expect(
      readBankAlertKeys({ body: 'Acct *7781 debited USD 12.50. Ref: TRX-55102A. Thank you' }),
    ).toMatchObject({ reference: 'TRX-55102A', accountTail: '7781' });
  });

  it('reads a bare FT code as Vietcombank and Techcombank print it', () => {
    expect(
      readBankAlertKeys({ body: 'TK 4410 -15,000 VND FT26316XQ7K2 ND ca phe sang' }),
    ).toMatchObject({ reference: 'FT26316XQ7K2', accountTail: '4410' });
  });

  it('says the time was delivered when the phone gave one', () => {
    expect(
      readBankAlertKeys({ body: 'TK 4410 -15,000 VND', date: '2026-10-28T10:09:21.374Z' }).atKind,
    ).toBe('delivered');
  });

  it('leaves out what the alert does not print', () => {
    expect(readBankAlertKeys({ body: 'Ban vua thanh toan 45.000d tai Quan Mau' })).toEqual({
      atKind: null,
      reference: null,
      accountTail: null,
      what: null,
    });
    // A word after "Ref" is no code; an account after the amount is the other side's.
    expect(
      readBankAlertKeys({ body: '+2,000,000 VND tu TK 5566 cua NGUYEN VAN MAU. Ref: luong' }),
    ).toMatchObject({ reference: null, accountTail: null });
  });

  it('reads money given back and money the bank took back', () => {
    expect(readBankAlertKeys({ body: '+120,000 VND hoan tien don hang 88120' }).what).toBe(
      'refund',
    );
    expect(
      readBankAlertKeys({ body: 'TK 4410 +120,000 VND Hoan tra giao dich FT26316XQ7K2' }).what,
    ).toBe('reversal');
  });

  it('reads what a failed payment was for, and nothing for one that went through', () => {
    expect(
      readFailedBankAlert({
        body: 'Giao dịch thanh toán 250.000đ tại Cửa Hàng Mẫu không thành công',
      }),
    ).toEqual({ amount: 250_000, currency: 'VND' });
    expect(readFailedBankAlert({ body: 'TK 4410 -15,000 VND ND ca phe' })).toBeNull();
  });
});
