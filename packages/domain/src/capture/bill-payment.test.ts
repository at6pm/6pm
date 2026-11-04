import { describe, expect, it } from 'vitest';

import { payCycleOn } from '../plan/pay-cycle';
import {
  asksBillAmount,
  billChoicesFor,
  billPaymentAsks,
  billPaymentMarks,
  namesRepayment,
  REPAYMENT,
  type PayableBill,
  type PaymentCapture,
} from './bill-payment';

// 25 Sep → 25 Oct: every bill below falls due in October.
const cycle = payCycleOn('2026-10-10', { kind: 'sameDay', day: 25 });

const bill = (over: Partial<PayableBill> & Pick<PayableBill, 'id'>): PayableBill => ({
  name: over.id,
  amount: 5_000_000,
  dueDay: 10,
  paidCycle: null,
  ...over,
});

const spend = (
  over: Partial<PaymentCapture> & Pick<PaymentCapture, 'id' | 'amount'>,
): PaymentCapture => ({
  day: '2026-10-10',
  merchant: 'CHUYEN TIEN',
  note: null,
  ...over,
});

describe('namesRepayment', () => {
  it('reads repayment words with or without accents, in either language', () => {
    expect(namesRepayment('Thanh toán thẻ tín dụng VPBank')).toBe(true);
    expect(namesRepayment('TRA GOP DIEN THOAI')).toBe(true);
    expect(namesRepayment('Trả nợ anh Nam')).toBe(true);
    expect(namesRepayment('khoản vay tiêu dùng')).toBe(true);
    expect(namesRepayment('Credit card payment')).toBe(true);
    expect(namesRepayment('Highlands Coffee')).toBe(false);
    expect(namesRepayment('Thanh toan')).toBe(false);
  });
});

describe('billPaymentAsks', () => {
  it('asks about a spend of a bill’s exact amount near its due day', () => {
    const asks = billPaymentAsks(
      [spend({ id: 'a', amount: 5_000_000, day: '2026-10-14' })],
      [bill({ id: 'rent', name: 'Rent' })],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'a', billId: 'rent' }]);
  });

  it('asks when the payee names the bill, whatever the amount', () => {
    const asks = billPaymentAsks(
      [spend({ id: 'a', amount: 6_100_000, merchant: 'EVN tien dien', note: 'Tiền điện T10' })],
      [bill({ id: 'power', name: 'Tiền điện', amount: 900_000 })],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'a', billId: 'power' }]);
  });

  it('asks about a card statement of any amount that names a card payment', () => {
    const asks = billPaymentAsks(
      [spend({ id: 'a', amount: 8_000_000, merchant: 'THANH TOAN THE TIN DUNG' })],
      [bill({ id: 'card', name: 'Credit card', amount: 2_000_000, kind: 'card' })],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'a', billId: 'card' }]);
  });

  it('never matches a repayment word to a bill that pays nothing off', () => {
    const asks = billPaymentAsks(
      [spend({ id: 'a', amount: 3_000_000, merchant: 'Tra gop Home Credit' })],
      [bill({ id: 'rent', name: 'Rent' })],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'a', billId: null }]);
  });

  it('leaves a spend more than a week from the due day alone', () => {
    const asks = billPaymentAsks(
      [
        spend({ id: 'early', amount: 5_000_000, day: '2026-10-02' }),
        spend({ id: 'late', amount: 5_000_000, day: '2026-10-18' }),
      ],
      [bill({ id: 'rent' })],
      cycle,
    );
    expect(asks).toEqual([]);
  });

  it('asks about each bill once: a paid bill, or one already asked this cycle, is not asked', () => {
    const two = [spend({ id: 'a', amount: 5_000_000 }), spend({ id: 'b', amount: 5_000_000 })];
    expect(billPaymentAsks(two, [bill({ id: 'rent' })], cycle)).toEqual([
      { spendId: 'a', billId: 'rent' },
    ]);
    expect(billPaymentAsks(two, [bill({ id: 'rent', paidCycle: cycle.start })], cycle)).toEqual([]);
    expect(billPaymentAsks(two, [bill({ id: 'rent', askedCycle: cycle.start })], cycle)).toEqual(
      [],
    );
    // Asked last cycle: this cycle may ask again.
    expect(billPaymentAsks(two, [bill({ id: 'rent', askedCycle: '2026-08-25' })], cycle)).toEqual([
      { spendId: 'a', billId: 'rent' },
    ]);
  });

  it('gives each bill the spend that matches it best', () => {
    const asks = billPaymentAsks(
      [
        spend({ id: 'named', amount: 4_000_000, merchant: 'Tien nha thang 10' }),
        spend({ id: 'exact', amount: 5_000_000 }),
      ],
      [bill({ id: 'rent', name: 'Tiền nhà' })],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'exact', billId: 'rent' }]);
  });

  it('asks "Paying off a card or loan?" about a repayment with no bill to match', () => {
    const asks = billPaymentAsks(
      [spend({ id: 'a', amount: 12_000_000, merchant: 'Credit card payment' })],
      [],
      cycle,
    );
    expect(asks).toEqual([{ spendId: 'a', billId: null }]);
  });

  it('does not ask about a spend already marked as a bill, or a bill that has ended', () => {
    const marked = spend({ id: 'a', amount: 5_000_000, paysBill: REPAYMENT });
    expect(billPaymentAsks([marked], [bill({ id: 'rent' })], cycle)).toEqual([]);
    const ended = bill({ id: 'phone', lastMonth: '2026-09' });
    expect(billPaymentAsks([spend({ id: 'b', amount: 5_000_000 })], [ended], cycle)).toEqual([]);
  });

  it('matches only spends inside the cycle to its bills', () => {
    const before = spend({ id: 'a', amount: 5_000_000, day: '2026-09-20' });
    expect(billPaymentAsks([before], [bill({ id: 'rent', dueDay: 25 })], cycle)).toEqual([]);
  });
});

describe('billChoicesFor', () => {
  const bills = [
    bill({ id: 'rent' }),
    bill({ id: 'card', paidCycle: cycle.start }),
    bill({ id: 'phone' }),
  ];

  it('offers not a bill, each bill still to pay, then a card or loan', () => {
    const fresh = spend({ id: 'a', amount: 250_000 });
    expect(billChoicesFor(fresh, bills, cycle)).toEqual([null, 'rent', 'phone', REPAYMENT]);
  });

  it('never steps onto a bill another payment already paid this cycle', () => {
    const marked = spend({ id: 'a', amount: 250_000, paysBill: 'rent' });
    expect(billChoicesFor(marked, bills, cycle)).not.toContain('card');
  });

  it('keeps the bill the spend itself pays in its place', () => {
    const paying = spend({ id: 'a', amount: 3_500_000, paysBill: 'card' });
    expect(billChoicesFor(paying, bills, cycle)).toEqual([
      null,
      'rent',
      'card',
      'phone',
      REPAYMENT,
    ]);
  });

  it('offers only its own bill for a spend from before this cycle', () => {
    const old = spend({ id: 'a', amount: 250_000, day: '2026-09-20', paysBill: 'phone' });
    expect(billChoicesFor(old, bills, cycle)).toEqual([null, 'phone', REPAYMENT]);
    const plain = spend({ id: 'b', amount: 250_000, day: '2026-09-20' });
    expect(billChoicesFor(plain, bills, cycle)).toEqual([null, REPAYMENT]);
  });
});

describe('a bill paid by its kind', () => {
  // Payday the 25th: 25 Oct → 25 Nov. The founder's phone: an EVN payment on Tue 3 Nov.
  const november = payCycleOn('2026-11-04', { kind: 'sameDay', day: 25 });
  const evn = spend({
    id: 'evn',
    amount: 727_428,
    day: '2026-11-03',
    merchant: 'hóa đơn của dịch vụ Điện lực Hồ Chí Minh',
  });
  const power = (dueDay: number) =>
    bill({ id: 'power', name: 'Điện nước', amount: 600_000, dueDay, paidCycle: null });

  it.each([3, 10, 20])('asks and marks "Điện nước" due on the %ith', (dueDay) => {
    expect(billPaymentAsks([evn], [power(dueDay)], november)).toEqual([
      { spendId: 'evn', billId: 'power' },
    ]);
    expect(billPaymentMarks([evn], [power(dueDay)], november)).toEqual([
      { spendId: 'evn', billId: 'power' },
    ]);
  });

  it('matches a phone bill to its telco, never to the power company', () => {
    const phone = bill({ id: 'phone', name: 'Điện thoại & mạng', amount: 300_000, dueDay: 15 });
    const vnpt = spend({ id: 'vnpt', amount: 287_000, day: '2026-11-01', merchant: 'VNPT' });
    const viettel = spend({ id: 'viettel', amount: 199_000, day: '2026-10-28', memo: 'Viettel' });
    expect(billPaymentMarks([vnpt], [phone], november)).toEqual([
      { spendId: 'vnpt', billId: 'phone' },
    ]);
    expect(billPaymentMarks([viettel], [phone], november)).toEqual([
      { spendId: 'viettel', billId: 'phone' },
    ]);
    expect(billPaymentMarks([evn], [phone], november)).toEqual([]);
    expect(billPaymentAsks([evn], [phone], november)).toEqual([]);
  });

  it('gives each payee the bill of its own kind', () => {
    const phone = bill({ id: 'phone', name: 'Điện thoại & mạng', amount: 300_000, dueDay: 3 });
    const vnpt = spend({ id: 'vnpt', amount: 287_000, day: '2026-11-03', merchant: 'VNPT' });
    expect(billPaymentMarks([vnpt, evn], [phone, power(20)], november)).toEqual([
      { spendId: 'vnpt', billId: 'phone' },
      { spendId: 'evn', billId: 'power' },
    ]);
  });

  it('never takes a phone payment for a bill named only "Điện"', () => {
    const dien = bill({ id: 'dien', name: 'Điện', amount: 500_000, dueDay: 3 });
    const call = spend({
      id: 'call',
      amount: 150_000,
      day: '2026-11-03',
      merchant: 'Cước điện thoại Viettel',
    });
    expect(billPaymentMarks([call], [dien], november)).toEqual([]);
  });

  it('still needs the week around the due day for an exact amount alone', () => {
    const rent = bill({ id: 'rent', name: 'Nhà', amount: 5_000_000, dueDay: 5 });
    const far = spend({ id: 'far', amount: 5_000_000, day: '2026-11-20' });
    const near = spend({ id: 'near', amount: 5_000_000, day: '2026-11-09' });
    expect(billPaymentMarks([far], [rent], november)).toEqual([]);
    expect(billPaymentMarks([near], [rent], november)).toEqual([
      { spendId: 'near', billId: 'rent' },
    ]);
  });

  it('leaves a bill already paid, already asked about, or a repayment with no bill alone', () => {
    const paid = { ...power(3), paidCycle: november.start };
    const asked = { ...power(3), askedCycle: november.start };
    expect(billPaymentMarks([evn], [paid], november)).toEqual([]);
    expect(billPaymentMarks([evn], [asked], november)).toEqual([]);
    const card = spend({
      id: 'card',
      amount: 8_000_000,
      day: '2026-11-03',
      merchant: 'Credit card payment',
    });
    expect(billPaymentMarks([card], [], november)).toEqual([]);
  });

  it('asks once about a spend marked when it was caught, until the bill is answered', () => {
    const marked = { ...evn, paysBill: 'power' };
    const paid = { ...power(3), paidCycle: november.start, paidAmount: 727_428 };
    expect(billPaymentAsks([marked], [paid], november)).toEqual([
      { spendId: 'evn', billId: 'power' },
    ]);
    expect(billPaymentAsks([marked], [{ ...paid, askedCycle: november.start }], november)).toEqual(
      [],
    );
    // Marked from Details or Scan, the bill was answered already.
    expect(billPaymentMarks([marked], [paid], november)).toEqual([]);
  });
});

describe('asksBillAmount', () => {
  it('asks about a different amount, never about a card or the same amount', () => {
    expect(asksBillAmount({ amount: 600_000, kind: 'other' }, 727_428)).toBe(true);
    expect(asksBillAmount({ amount: 600_000 }, 600_000)).toBe(false);
    expect(asksBillAmount({ amount: 2_000_000, kind: 'card' }, 8_000_000)).toBe(false);
    expect(asksBillAmount({ amount: 600_000 }, 0)).toBe(false);
  });
});
