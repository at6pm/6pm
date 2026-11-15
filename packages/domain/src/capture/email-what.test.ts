import { describe, expect, it } from 'vitest';

import { emailSpendOf, type EmailModelReading } from './email-reading';
import { emailWhatOf, readReceiptEmail } from './email-what';
import { parseReceiptEmail, type ReceiptEmail } from './receipt-email';

// Invented mails in the shapes banks and shops send: every name, account and code is made up.

const options = { receivedAt: '2026-11-12T10:00:00.000Z' };
const whatFirst = { ...options, whatFirst: true };

const mail = (
  subject: string,
  lines: readonly string[],
  from = 'thongbao@mbbank.com.vn',
): ReceiptEmail => ({
  from: { name: 'Sender', address: from },
  subject,
  date: '2026-11-12T03:41:00.000Z',
  text: lines.join('\n'),
  html: null,
});

const debit = [
  'TK 0123xxx789 | GD: -250,000VND | 12/11/2026 10:30 | SD: 1,250,000VND',
  'ND: THANH TOAN DON HANG 55102',
];
const credit = [
  'TK 0123xxx789 | GD: +250,000VND | 12/11/2026 10:30 | SD: 1,500,000VND',
  'ND: HOAN TIEN DON HANG 55102',
];

/** A transfer whose remitter is its beneficiary, as Vietcombank labels them. */
const OWN_TRANSFER = [
  'Ngày, giờ giao dịch',
  '12/11/2026 10:30:00',
  'Tên người chuyển tiền',
  'Remitter’s name',
  'LE THI MAU',
  'Tên người hưởng',
  'Beneficiary Name',
  'LE THI MAU',
  'Số tiền',
  'Amount',
  '5,000,000 VND',
];

const reading = (over: Partial<EmailModelReading> = {}): EmailModelReading => ({
  kind: 'payment',
  amount: '250,000VND',
  currency: 'VND',
  merchant: 'Cua Hang Mau',
  category: null,
  at: '2026-11-12T10:30:00',
  reference: null,
  note: null,
  ...over,
});

describe('what an email is, decided first', () => {
  it.each([
    ['Giao dịch không thành công', 'failed'],
    ['Thanh toán thất bại', 'failed'],
    ['Payment unsuccessful', 'failed'],
    ['Your card was not charged', 'failed'],
    ['Your order #88120 has been cancelled', 'failed'],
    ['Đơn hàng đã bị hủy', 'failed'],
    ['Thông báo đảo giao dịch', 'reversal'],
    ['Transaction reversed', 'reversal'],
    ['Hoàn tiền thành công', 'refund'],
    ['Your refund is on its way', 'refund'],
    ['Cập nhật đặt chỗ của bạn', 'orderUpdate'],
    ['Your booking has been updated', 'orderUpdate'],
    ['[QC] Ưu đãi cuối tuần', 'notPayment'],
    ['Bạn đã nhận hàng thành công', 'notPayment'],
    ['Thong bao bien dong so du', null],
  ])('reads “%s” as %s', (subject, what) => {
    expect(emailWhatOf(mail(subject, debit))).toBe(what);
  });

  it('reads a status line that says the charge was called off', () => {
    for (const said of ['Hủy', 'Không thành công', 'Cancelled', 'Declined']) {
      const lines = [...debit, 'Tình trạng giao dịch', said];
      expect(emailWhatOf(mail('Thong bao giao dich the', lines))).toBe('failed');
    }
    expect(emailWhatOf(mail('Thong bao giao dich the', [...debit, 'Not charged']))).toBe('failed');
  });

  it('reads money moved between the person’s own accounts, and currency sold', () => {
    const own = mail('Biên lai chuyển tiền', OWN_TRANSFER);
    expect(emailWhatOf(own)).toBe('ownTransfer');
    const sale = mail('Giao dịch bán ngoại tệ thành công', [
      'Loại giao dịch: Bán ngoại tệ online',
      'Số tiền VND quy đổi: 12.700.000 VND',
    ]);
    expect(emailWhatOf(sale)).toBe('ownTransfer');
  });
});

describe('readReceiptEmail', () => {
  it('keeps a failed charge, a reversal and an own transfer as what they are', () => {
    expect(readReceiptEmail(mail('Giao dịch không thành công', debit), options)).toMatchObject({
      kind: 'failed',
      amount: 250_000,
    });
    expect(readReceiptEmail(mail('Transaction reversed', credit), options)).toMatchObject({
      kind: 'reversal',
      amount: 250_000,
    });
    const own = mail('Biên lai chuyển tiền', OWN_TRANSFER);
    expect(readReceiptEmail(own, options)?.kind).toBe('ownTransfer');
  });

  it('tells a booking’s update from its payment by what the mail is, not by “Đã thanh toán”', () => {
    const body = ['Mã đặt chỗ: BK-55102', 'Đã thanh toán hôm nay', 'Tổng cộng: 1.200.000 ₫'];
    const paid = mail('Xác nhận đặt chỗ BK-55102', body, 'booking@datchomau.example');
    const update = mail('Cập nhật đặt chỗ BK-55102', body, 'booking@datchomau.example');
    expect(readReceiptEmail(paid, options)?.amount).toBe(1_200_000);
    expect(readReceiptEmail(update, options)).toBeNull();
  });

  it('says what a mail’s time is: printed, or the date it was sent', () => {
    expect(readReceiptEmail(mail('Thong bao bien dong so du', debit), options)?.atKind).toBe(
      'printed',
    );
    const undated = [debit[0]?.replace(' | 12/11/2026 10:30', '') ?? '', debit[1] ?? ''];
    expect(readReceiptEmail(mail('Thong bao bien dong so du', undated), options)).toMatchObject({
      atKind: 'sent',
      at: '2026-11-12T03:41:00.000Z',
    });
  });

  it('still drops a delivery read as money in, and a currency sale as a spend', () => {
    const delivered = mail('Bạn đã nhận hàng', ['Bạn đã nhận hàng', 'Tổng cộng: 250.000 ₫']);
    expect(readReceiptEmail(delivered, options)).toBeNull();
    const sale = mail('Giao dịch bán ngoại tệ thành công', [
      'Loại giao dịch: Bán ngoại tệ online',
      'Số tiền VND quy đổi: 12.700.000 VND',
    ]);
    expect(readReceiptEmail(sale, options)?.kind).toBe('ownTransfer');
    // Read as before, without what first, they stay out entirely.
    expect(parseReceiptEmail(sale, options)).toBeNull();
    expect(parseReceiptEmail(mail('Giao dịch không thành công', debit), options)).toBeNull();
  });
});

describe('a booking’s later mail about what became of it', () => {
  const SITE = 'no-reply@datchomau.com';
  const CODES = 'Mã đặt chỗ: 5510200001,5510200002';
  // The payment's mail: paid, being ticketed, and terms that say what would happen.
  const payment = mail(
    `Datchomau đang xử lý việc đặt chỗ của quý khách – ${CODES}`,
    [
      'Thanh toán thành công! Vé của quý khách đang được xuất.',
      '(Mã số đặt phòng: 5510200001, 5510200002)',
      'Nếu chuyến bay không thể xác nhận, chúng tôi sẽ hoàn tiền đầy đủ cho quý khách.',
      'Tổng cộng',
      '₫ 3.950.000',
      'Đã thanh toán hôm nay',
      '₫ 3.950.000',
    ],
    SITE,
  );
  // Hours later: one flight confirmed, the other not, its money to come back.
  const update = mail(
    `Xác nhận đặt chỗ với Datchomau – ${CODES}`,
    [
      'Chuyến bay về của quý khách đã được xác nhận.',
      '(Mã số đặt phòng: 5510200002)',
      'Rất tiếc, chúng tôi không thể xác nhận chuyến bay đi của quý khách.',
      'Chúng tôi sẽ hoàn tiền cho chuyến bay không thể xác nhận vào phương thức thanh toán ban đầu.',
      'Đã xác nhận và thanh toán đơn đặt phòng',
      'Tổng cộng',
      '₫ 2.100.000',
      'Đã thanh toán hôm nay',
      '₫ 2.100.000',
    ],
    SITE,
  );

  it('reads the update as an order update, and its sibling payment as a payment', () => {
    expect(emailWhatOf(update)).toBe('orderUpdate');
    expect(readReceiptEmail(update, options)).toBeNull();
    expect(emailWhatOf(payment)).toBeNull();
    expect(readReceiptEmail(payment, options)).toMatchObject({
      amount: 3_950_000,
      code: '5510200001,5510200002',
    });
  });

  it('drops the update whatever the model reads it as', () => {
    expect(emailSpendOf(reading({ amount: '2.100.000 ₫' }), update, whatFirst)).toBeNull();
  });

  it('keeps a booking paid now whose add-on could not be confirmed and was not charged', () => {
    const addOn = mail(
      `Xác nhận đặt chỗ với Datchomau – ${CODES}`,
      [
        'Thanh toán thành công!',
        'Chúng tôi không thể xác nhận tiện ích bảo vệ chuyến đi, và quý khách đã không bị tính phí.',
        'Tổng cộng',
        '₫ 3.950.000',
        'Đã thanh toán hôm nay',
        '₫ 3.950.000',
      ],
      SITE,
    );
    expect(emailWhatOf(addOn)).toBeNull();
    expect(readReceiptEmail(addOn, options)?.amount).toBe(3_950_000);
  });

  it('reads English the same way, and terms that only say what would happen as nothing', () => {
    const told = mail(
      'Your booking with Datchomau',
      [
        'We could not confirm your outbound flight.',
        'Its fare will be refunded to your original payment method.',
        'Amount paid: 2,100,000 VND',
      ],
      SITE,
    );
    expect(emailWhatOf(told)).toBe('orderUpdate');
    const terms = mail(
      'Your booking with Datchomau',
      [
        'Payment successful.',
        'If we are unable to confirm your flight, the full fare will be refunded.',
        'Amount paid: 3,950,000 VND',
      ],
      SITE,
    );
    expect(emailWhatOf(terms)).toBeNull();
    expect(readReceiptEmail(terms, options)?.amount).toBe(3_950_000);
  });

  it('reads a new paid booking that follows an update as a payment, with its own code', () => {
    const next = mail(
      'Datchomau đang xử lý việc đặt chỗ của quý khách – Mã đặt chỗ: 5510200003',
      [
        'Thanh toán thành công!',
        'Tổng cộng',
        '₫ 2.100.000',
        'Đã thanh toán hôm nay',
        '₫ 2.100.000',
      ],
      SITE,
    );
    expect(emailWhatOf(next)).toBeNull();
    expect(readReceiptEmail(next, options)).toMatchObject({
      amount: 2_100_000,
      code: '5510200003',
    });
  });

  it('reads the booking code only from a booking label, and never over a bank’s own code', () => {
    const ride = mail(
      'Your Grab E-Receipt',
      ['Booking ID: A-0000TEST1', 'Total', '₫68,000'],
      'no-reply@grab.com',
    );
    expect(readReceiptEmail(ride, options)?.code).toBe('A-0000TEST1');
    const order = mail(
      'Biên nhận đơn hàng',
      ['Mã đơn hàng: 2610ABC123', 'Tổng cộng: 59.000 ₫'],
      SITE,
    );
    expect(readReceiptEmail(order, options)?.code).toBeNull();
    const bank = mail('Thong bao bien dong so du', [...debit, 'Mã đặt chỗ: 5510200001']);
    expect(readReceiptEmail(bank, options)?.code ?? null).toBeNull();
  });
});

describe('a model’s reading, checked against what the rules say the email is', () => {
  it('keeps a charge the rules say failed as failed, whatever the model said', () => {
    const failed = mail('Payment unsuccessful', debit);
    expect(emailSpendOf(reading(), failed, whatFirst)?.kind).toBe('failed');
    expect(emailSpendOf(reading(), failed, options)).toBeNull();
  });

  it('keeps what the model says failed or moved between own accounts', () => {
    const plain = mail('Thong bao giao dich', debit);
    expect(emailSpendOf(reading({ kind: 'failed' }), plain, whatFirst)?.kind).toBe('failed');
    expect(emailSpendOf(reading({ kind: 'own_transfer' }), plain, whatFirst)?.kind).toBe(
      'ownTransfer',
    );
    expect(emailSpendOf(reading({ kind: 'order_update' }), plain, whatFirst)).toBeNull();
  });

  it('drops an order update the model read as a payment', () => {
    const update = mail('Your booking has been updated', debit, 'booking@datchomau.example');
    expect(emailSpendOf(reading(), update, whatFirst)).toBeNull();
  });

  it('says what the time it read is', () => {
    expect(emailSpendOf(reading(), mail('Thong bao giao dich', debit), whatFirst)?.atKind).toBe(
      'printed',
    );
    expect(
      emailSpendOf(reading({ at: null }), mail('Thong bao giao dich', debit), whatFirst)?.atKind,
    ).toBe('sent');
  });
});
