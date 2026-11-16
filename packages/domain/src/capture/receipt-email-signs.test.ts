import { describe, expect, it } from 'vitest';

import { labelledTransfer, parseReceiptEmail, type ReceiptEmail } from './receipt-email';
import { isFailed } from './receipt-email-signs';

// Synthetic emails in the shape each bank and shop sends; every name, account, order and amount
// is made up.

const receivedAt = '2026-10-20T12:00:00.000Z';
const email = (over: Partial<ReceiptEmail>): ReceiptEmail => ({
  from: null,
  subject: '',
  date: '2026-10-20T04:12:47.000Z',
  text: null,
  html: null,
  ...over,
});

const cell = (...cells: string[]) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;

/** Vietcombank Digibank's transfer receipt: each label in Vietnamese, then English, then its value. */
const vcbTransfer = (beneficiary: string, memo = 'TRAN VAN AN chuyen tien') =>
  email({
    from: { name: 'VCB Digibank', address: 'VCBDigibank@info.vietcombank.com.vn' },
    subject: 'Biên lai chuyển tiền qua tài khoản',
    text: [
      'Biên lai chuyển tiền qua tài khoản',
      '(Payment Receipt)',
      'Ngày, giờ giao dịch',
      'Trans. Date, Time',
      '11:12 Thứ Ba 20/10/2026',
      'Số lệnh giao dịch',
      'Order Number',
      '10000000001',
      'Tài khoản nguồn',
      'Debit Account',
      '0000000001',
      'Tên người chuyển tiền',
      'Remitter’s name',
      'TRAN VAN AN',
      'Tài khoản người hưởng',
      'Credit Account',
      '0000000000002',
      'Tên người hưởng',
      'Beneficiary Name',
      beneficiary,
      'Tên ngân hàng hưởng',
      'Beneficiary Bank Name',
      'Ngân hàng Quân Đội',
      'Số tiền',
      'Amount',
      '3,300,000 VND',
      'Số tiền phí',
      'Charge Amount',
      '0 VND',
      'Nội dung chuyển tiền',
      'Details of Payment',
      memo,
      'Cám ơn Quý khách đã sử dụng dịch vụ của Vietcombank!',
    ].join('\n'),
  });

/** MB's notice that foreign currency was sold for đồng: a table of label and value. */
const mbCurrencySale = email({
  from: { name: 'MB', address: 'mbebanking@mbbank.com.vn' },
  subject: 'Giao dịch bán ngoại tệ thành công',
  html: `<p>MB xin thông báo xác nhận giao dịch bán ngoại tệ của bạn đã được xử lý thành công</p>
    <table>
      ${cell('Thời điểm giao dịch', '09h15 ngày 20/10/2026')}
      ${cell('Loại giao dịch', 'Bán ngoại tệ online')}
      ${cell('Loại ngoại tệ', 'USD')}
      ${cell('Tài khoản ngoại tệ', '0000000000003/TRAN VAN AN')}
      ${cell('Số ngoại tệ bán', '500 USD')}
      ${cell('Tỷ giá', '25400.0')}
      ${cell('Số tiền VND quy đổi', '12.700.000 VND')}
      ${cell('Tài khoản thụ hưởng', '0000000000002/TRAN VAN AN')}
      ${cell('Tình trạng giao dịch', 'Thành công')}
    </table>`,
});

/** Shopee's word that an order arrived, with the order's totals printed again. */
const delivered = email({
  from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
  subject: 'Đơn hàng #2610ABCDEF0001 đã giao hàng thành công',
  text: [
    'Đơn hàng #2610ABCDEF0001 của bạn đã được giao thành công ngày 20/10/2026.',
    'Vui lòng đăng nhập Shopee để xác nhận bạn đã nhận hàng và hài lòng với sản phẩm trong vòng 3 ngày.',
    'Đã nhận hàng',
    'Người bán:',
    'meo.petshop',
    'Tổng tiền:',
    '₫250,000',
    'Tổng thanh toán:',
    '₫215,000',
    'Lưu ý: Shopee sẽ từ chối hỗ trợ các khiếu nại sau khi Người mua nhấn "Đã nhận được hàng" và Người',
    'bán đã nhận được thanh toán cho đơn hàng.',
  ].join('\n'),
});

/** Grab's order receipt, with a status line and what was charged under the total. */
const grabOrder = (subject: string, status: string, charged: string) =>
  email({
    from: { name: 'Grab', address: 'no-reply@grab.com' },
    subject,
    text: [
      'GrabFood',
      'Booking ID: A-0000TESTBOOKING',
      'Order breakdown',
      'Merchant',
      'Quán Cơm Bình Dân',
      'Status',
      status,
      '1x',
      'Cơm sườn',
      '₫55,000',
      'Total',
      '₫68,000',
      charged,
    ].join('\n'),
  });

/** Vietcombank's card alert, bilingual labels over each value. */
const vcbCard = (status: string) =>
  email({
    from: { name: 'Vietcombank', address: 'info@info.vietcombank.com.vn' },
    subject: 'Thông báo giao dịch thẻ/ Vietcombank card transaction notification',
    text: [
      'Thẻ',
      'Card',
      'Visa 400000...0000',
      'Sử dụng tại',
      'At',
      'SAMPLE*STORE Singapore SG',
      'Số tiền',
      'Transaction Amount',
      '129,000 VND',
      'Ngày, giờ giao dịch',
      'Trans. Date, Time',
      '20-10-2026 10:41:07',
      'Tình trạng giao dịch',
      'Status of Transaction',
      status,
    ].join('\n'),
  });

/** A Stripe invoice receipt for a dollar price, its Vietnamese VAT also printed in đồng. */
const stripeReceipt = (charged: string) =>
  email({
    from: { name: 'Sample Labs Inc', address: 'invoice+statements@stripe.com' },
    subject: 'Your receipt from Sample Labs Inc #1000-2000-3000',
    html: `<table>
      ${cell('Receipt from Sample Labs Inc')}${cell('$16.50')}${cell('Paid on October 20, 2026')}
      ${cell('Usage', 'Qty 12,400', '$0.00')}
      ${cell('Basic Plan', 'Qty 1', '$15.00')}
      ${cell('Subtotal', '$15.00')}
      ${cell('VAT - Vietnam (10%)', '$1.50 (₫38,400)')}
      ${cell('Total', '$16.50')}
      ${cell('Amount paid', '$16.50')}
      ${charged}
    </table>`,
  });

describe('the person’s own money', () => {
  it('skips a Vietcombank transfer whose remitter is the beneficiary', () => {
    const own = vcbTransfer('TRAN VAN AN');
    expect(parseReceiptEmail(own, { receivedAt })).toBeNull();
    expect(labelledTransfer(own).own).toBe(true);
  });

  it('still reads a Vietcombank transfer to someone else, and a card’s repayment', () => {
    expect(parseReceiptEmail(vcbTransfer('LE THI MAI'), { receivedAt })).toMatchObject({
      amount: 3_300_000,
      merchant: 'LE THI MAI',
      at: '2026-10-20T04:12:00.000Z',
    });
    const card = vcbTransfer('TRAN VAN AN', 'Thanh toan the tin dung');
    expect(parseReceiptEmail(card, { receivedAt })?.amount).toBe(3_300_000);
  });

  it('skips foreign currency sold for đồng, which only changes the money’s form', () => {
    expect(parseReceiptEmail(mbCurrencySale, { receivedAt })).toBeNull();
    expect(labelledTransfer(mbCurrencySale).own).toBe(true);
    // The type line says so even under a subject that does not.
    const plain = { ...mbCurrencySale, subject: 'Thong bao giao dich thanh cong' };
    expect(parseReceiptEmail(plain, { receivedAt })).toBeNull();
  });

  it('still reads a card charge in a foreign currency’s name', () => {
    const fee = email({
      from: { name: 'MB', address: 'mbebanking@mbbank.com.vn' },
      subject: 'Thong bao giao dich thanh cong',
      text: 'Loại giao dịch | Thanh toán thẻ\nSố tiền giao dịch | 129.000 VND\nNội dung | Phi chuyen doi ngoai te',
    });
    expect(parseReceiptEmail(fee, { receivedAt })?.amount).toBe(129_000);
  });
});

describe('deliveries and money received', () => {
  it('skips a delivery notice, which is neither money in nor a second payment', () => {
    expect(parseReceiptEmail(delivered, { receivedAt })).toBeNull();
    const forwarded = { ...delivered, subject: `Fwd: ${delivered.subject}` };
    expect(parseReceiptEmail(forwarded, { receivedAt })).toBeNull();
  });

  it('never reads goods received, or a seller paid, as money in', () => {
    // The same words under a subject that does name a payment.
    const paid = { ...delivered, subject: 'Xác nhận thanh toán thành công' };
    const read = parseReceiptEmail(paid, { receivedAt });
    expect(read?.amount).toBe(215_000);
    expect(read?.kind).toBeUndefined();
  });

  it('reads money the email says the person received as money in', () => {
    const received = (text: string) =>
      email({
        from: { name: 'MoMo', address: 'no-reply@momo.vn' },
        subject: 'Giao dịch thành công',
        text,
      });
    for (const text of [
      'Bạn đã nhận 150.000đ từ LE THI MAI.',
      'Bạn đã nhận được số tiền 150.000đ từ LE THI MAI.',
      'Bạn đã nhận tiền từ LE THI MAI\nSố tiền: 150.000đ',
    ]) {
      expect(parseReceiptEmail(received(text), { receivedAt })).toMatchObject({
        kind: 'incoming',
        amount: 150_000,
      });
    }
  });
});

describe('charges called off', () => {
  it('skips an order whose status line says it was cancelled', () => {
    const cancelled = grabOrder('Sorry your order was cancelled', 'Cancelled', 'Not charged');
    expect(parseReceiptEmail(cancelled, { receivedAt })).toBeNull();
    // Each sign alone is enough: the subject, the status, the line under the total.
    const done = 'Your Grab E-Receipt';
    expect(parseReceiptEmail(grabOrder(done, 'Cancelled', 'Paid'), { receivedAt })).toBeNull();
    expect(parseReceiptEmail(grabOrder(done, 'Canceled', 'Paid'), { receivedAt })).toBeNull();
    expect(parseReceiptEmail(grabOrder(done, 'Completed', 'Not charged'), { receivedAt })).toBe(
      null,
    );
    expect(parseReceiptEmail(grabOrder(done, 'Completed', 'Paid'), { receivedAt })?.amount).toBe(
      68_000,
    );
  });

  it('skips a card alert whose status is Hủy, in either spelling', () => {
    for (const status of ['Hủy', 'Huỷ', 'Đã hủy', 'Giao dịch đã bị huỷ']) {
      expect(parseReceiptEmail(vcbCard(status), { receivedAt })).toBeNull();
    }
    expect(parseReceiptEmail(vcbCard('Thành công'), { receivedAt })?.amount).toBe(129_000);
  });

  it('skips an order the subject says was cancelled or not charged', () => {
    for (const subject of [
      'Cập nhật giao dịch: Đơn hàng đã bị hủy',
      'Đơn hàng #2610ABC đã hủy',
      'Your order #2610ABC was canceled',
      'Your card was not charged for order #2610ABC',
    ]) {
      expect(isFailed(subject, [])).toBe(true);
    }
  });

  it('keeps a paid receipt that only mentions cancelling', () => {
    const booking = email({
      from: { name: 'Sample Travel', address: 'no-reply@sampletravel.example' },
      subject: 'Xác nhận thanh toán đặt chỗ 100200300',
      text: [
        'Thanh toán thành công!',
        'Hủy và Số tiền hoàn trả',
        'Vé của quý khách không thể hủy để lấy lại tiền.',
        'Quý khách đã không bị tính phí cho tiện ích bảo vệ chuyến đi.',
        'Chính sách hủy: xem trong đơn đặt chỗ, hoặc gửi yêu cầu hủy đơn đặt phòng.',
        'Đã thanh toán hôm nay',
        '₫ 2.150.000',
      ].join('\n'),
    });
    expect(parseReceiptEmail(booking, { receivedAt })?.amount).toBe(2_150_000);

    const subscription = email({
      from: { name: 'Sample Play', address: 'receipts@sampleplay.example' },
      subject: 'Biên nhận đơn hàng của bạn từ 20 thg 10, 2026',
      text: [
        'Tổng cộng: 59.000 ₫',
        'Bạn có thể hủy bất cứ lúc nào. Gói đăng ký sẽ không bị hủy khi bạn gỡ ứng dụng.',
        'You can cancel at any time; a cancelled plan is not charged again.',
      ].join('\n'),
    });
    expect(parseReceiptEmail(subscription, { receivedAt })?.amount).toBe(59_000);
  });

  it('keeps a payment to someone named Huy, and the refund of a cancelled order', () => {
    expect(isFailed('Biên lai thanh toán của bạn đến NGUYEN VAN HUY', [])).toBe(false);
    expect(parseReceiptEmail(vcbTransfer('NGUYEN VAN HUY'), { receivedAt })?.merchant).toBe(
      'NGUYEN VAN HUY',
    );
    const refund = email({
      from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
      subject: 'Đơn hàng 2610ABC đã hủy: hoàn tiền thành công',
      text: 'Shopee đã hoàn tiền ₫129.000 cho đơn hàng 2610ABC vào ví của bạn.',
    });
    expect(parseReceiptEmail(refund, { receivedAt })).toMatchObject({
      kind: 'refund',
      amount: 129_000,
    });
  });
});

describe('a total paid in another currency', () => {
  it('never takes a tax line’s đồng, or a quantity, for what a dollar receipt cost', () => {
    expect(parseReceiptEmail(stripeReceipt(''), { receivedAt })).toBeNull();
  });

  it('reads the đồng the receipt says it was charged as', () => {
    const charged = stripeReceipt(cell('Charged ₫437,250 using 1 USD = 26,500.00 VND'));
    expect(parseReceiptEmail(charged, { receivedAt })).toMatchObject({
      amount: 437_250,
      merchant: 'Sample Labs',
    });
  });
});
