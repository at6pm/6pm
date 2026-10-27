import { describe, expect, it } from 'vitest';

import { handleOfRecipient, hostOfApiBase, receiptEmailAddress } from '../contracts/receipt-email';
import { decodeEntities, htmlToLines, readForwarded, readSender } from './email-body';
import { parseReceiptEmail, type ReceiptEmail } from './receipt-email';

// Synthetic emails in the shape each bank and shop sends; no real account or person in them.

const receivedAt = '2026-10-10T10:00:00.000Z';
const email = (over: Partial<ReceiptEmail>): ReceiptEmail => ({
  from: null,
  subject: '',
  date: null,
  text: null,
  html: null,
  ...over,
});
const row = (label: string, value: string) => `<tr><td>${label}</td><td><b>${value}</b></td></tr>`;

const vietcombank = email({
  from: { name: 'Vietcombank', address: 'vcbdigibank@info.vietcombank.com.vn' },
  subject: 'Biên lai chuyển tiền qua tài khoản',
  date: '2026-10-09T09:41:02.000Z',
  html: `<html><head><style>td{color:#333}</style></head><body>
    <p>K&iacute;nh gửi Qu&yacute; kh&aacute;ch,</p><p>Vietcombank xin th&ocirc;ng b&aacute;o giao dịch:</p>
    <table>
      ${row('Ngày, giờ giao dịch / Trans. Date, Time', '09/10/2026 16:40:12')}
      ${row('Số lệnh giao dịch / Order Number', 'FT26282917400')}
      ${row('Tài khoản nguồn / Debit Account', '0071xxxx2345')}
      ${row('Tên người hưởng / Beneficiary Name', 'CIRCLE K VIET NAM')}
      ${row('Tên ngân hàng hưởng / Beneficiary Bank', 'Ngân hàng TMCP Quân đội')}
      ${row('Số tiền / Amount', '120,000 VND')}
      ${row('Phí / Charge Amount', '0 VND')}
      ${row('Nội dung chuyển tiền / Details of Payment', 'MUA HANG')}
    </table></body></html>`,
});

const mbForwarded = email({
  from: { name: 'Lan', address: 'lan.example@gmail.com' },
  subject: 'Fwd: Thong bao bien dong so du',
  date: '2026-10-10T06:02:00.000Z',
  text: [
    'Gửi 6pm nhé',
    '',
    '---------- Forwarded message ---------',
    'From: MB Bank <thongbao@mbbank.com.vn>',
    'Date: Sat, Oct 10, 2026 at 12:31 PM',
    'Subject: Thong bao bien dong so du',
    'To: <lan.example@gmail.com>',
    '',
    'TK 0123xxx789 | GD: -45,000VND | 10/10/2026 12:30 | SD: 1,250,000VND',
    'ND: CHUYEN TIEN TOI PHO HOA',
  ].join('\n'),
});

const techcombank = email({
  from: { name: 'Techcombank', address: 'alert@techcombank.com.vn' },
  subject: 'Techcombank: Transaction notification',
  date: '2026-10-09T14:41:00.000Z',
  html: `<div>Dear Customer, your account has a new transaction.</div><table>
      ${row('Account', '1903xxxx0012')}
      ${row('Amount', '- VND 59,000')}
      ${row('Balance', 'VND 3,210,000')}
      ${row('Description', 'Thanh toan QR tai HIGHLANDS COFFEE')}
      ${row('Date', '09/10/2026 21:40')}
    </table>`,
});

const tpbankCredit = email({
  from: { name: 'TPBank', address: 'ebank@tpb.com.vn' },
  subject: 'TPBank thông báo biến động số dư',
  html: `<table>${row('Tài khoản', '0201xxxx999')}${row('Số tiền', '+5,000,000 VND')}${row(
    'Nội dung',
    'LUONG THANG 10',
  )}</table>`,
});

const grab = email({
  from: { name: 'Grab', address: 'no-reply@grab.com' },
  subject: 'Your Grab E-Receipt',
  date: '2026-10-10T06:31:00.000Z',
  html: `<h1>Thanks for riding with Grab</h1><p>Picked up on 10 Oct 2026, 1:30 PM</p>
    <table><tr><td>Fare</td><td>&#8363;35,000</td></tr><tr><td>Platform fee</td><td>&#8363;3,000</td></tr>
    <tr><td>Total</td><td>&#8363;38,000</td></tr></table><p>Paid by MoMo</p>`,
});

const shopeeVi = email({
  from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
  subject: 'Xác nhận đơn hàng #26101099',
  date: '2026-10-10T02:15:00.000Z',
  text: 'Cảm ơn bạn đã mua sắm\nTạm tính: 210.000đ\nPhí vận chuyển: 15.000đ\nTổng thanh toán: 225.000đ',
});

describe('parseReceiptEmail', () => {
  it('reads a Vietcombank transfer receipt from its HTML table, in Vietnam time', () => {
    expect(parseReceiptEmail(vietcombank, { receivedAt })).toEqual({
      amount: 120_000,
      merchant: 'CIRCLE K VIET NAM',
      at: '2026-10-09T09:40:12.000Z',
      from: 'vcbdigibank@info.vietcombank.com.vn',
      bank: 'Vietcombank',
      code: 'FT26282917400',
      memo: 'MUA HANG',
    });
  });

  it('reads an MB Bank balance change forwarded by hand, from the original sender', () => {
    expect(parseReceiptEmail(mbForwarded, { receivedAt })).toEqual({
      amount: 45_000,
      merchant: 'PHO HOA',
      at: '2026-10-10T05:30:00.000Z',
      from: 'thongbao@mbbank.com.vn',
      bank: 'MB Bank',
      code: null,
      memo: 'CHUYEN TIEN TOI PHO HOA',
    });
  });

  it('takes the forwarded Date when the receipt prints no time', () => {
    const noTime = email({
      ...mbForwarded,
      text: (mbForwarded.text ?? '').replace(' | 10/10/2026 12:30', ''),
    });
    expect(parseReceiptEmail(noTime, { receivedAt })?.at).toBe('2026-10-10T05:31:00.000Z');
  });

  it('reads a Techcombank alert in English and names the shop from the description', () => {
    expect(parseReceiptEmail(techcombank, { receivedAt })).toMatchObject({
      amount: 59_000,
      merchant: 'HIGHLANDS COFFEE',
      at: '2026-10-09T14:40:00.000Z',
      bank: 'Techcombank',
    });
  });

  it('reads money coming in as money in, never naming the person themselves as who sent it', () => {
    expect(parseReceiptEmail(tpbankCredit, { receivedAt })).toMatchObject({
      kind: 'incoming',
      amount: 5_000_000,
      merchant: '',
      memo: 'LUONG THANG 10',
    });
  });

  it('marks nothing as money in on a payment out', () => {
    expect(parseReceiptEmail(grab, { receivedAt })?.kind).toBeUndefined();
  });

  it('reads a Grab e-receipt total, named after the shop', () => {
    expect(parseReceiptEmail(grab, { receivedAt })).toMatchObject({
      amount: 38_000,
      merchant: 'Grab',
      at: '2026-10-10T06:30:00.000Z',
      from: 'no-reply@grab.com',
    });
  });

  it('reads a Shopee order total in Vietnamese and falls back to the Date header', () => {
    expect(parseReceiptEmail(shopeeVi, { receivedAt })).toMatchObject({
      amount: 225_000,
      merchant: 'Shopee',
      at: '2026-10-10T02:15:00.000Z',
    });
  });

  it('reads the payment, not the balance, in a one-line balance change', () => {
    const alert = email({
      from: { name: 'VPBank', address: 'alert@vpbank.com.vn' },
      subject: 'Thông báo biến động số dư',
      text: 'Số dư cuối: 9,950,000 VND\nPhát sinh: -50,000 VND\nNội dung: Thanh toan QR tai PHUC LONG',
    });
    expect(parseReceiptEmail(alert, { receivedAt })).toMatchObject({
      amount: 50_000,
      merchant: 'PHUC LONG',
    });
  });

  it('skips a notice that prints only the balance', () => {
    const notice = email({ subject: 'Số dư tài khoản', text: 'Số dư khả dụng: 9,950,000 VND' });
    expect(parseReceiptEmail(notice, { receivedAt })).toBeNull();
  });

  it('skips an email with no amount in it', () => {
    const newsletter = email({ subject: 'Ưu đãi tháng 10', text: 'Giảm giá cho bạn! Xem ngay.' });
    expect(parseReceiptEmail(newsletter, { receivedAt })).toBeNull();
  });

  it('does not believe a time after the email arrived', () => {
    const late = email({ ...shopeeVi, date: '2026-10-11T02:15:00.000Z' });
    expect(parseReceiptEmail(late, { receivedAt })?.at).toBe(receivedAt);
  });

  it('reads a two-digit year, so a bank email sent minutes late keeps the time it printed', () => {
    const late = email({
      from: { name: 'MB Bank', address: 'mbbank@mbbank.com.vn' },
      subject: 'Thông báo biến động số dư',
      date: '2026-10-10T05:38:00.000Z',
      text: 'TK 0xxx123|GD: -45,000VND 10/10/26 12:30|SD: 1,000,000VND|ND: THANH TOAN QR-PHO HOA',
    });
    expect(parseReceiptEmail(late, { receivedAt })).toMatchObject({
      amount: 45_000,
      at: '2026-10-10T05:30:00.000Z',
    });
  });

  it('reads money in signed after the words that name the account', () => {
    const credit = email({
      from: { name: 'Vietcombank', address: 'vcbdigibank@info.vietcombank.com.vn' },
      subject: 'Thông báo biến động số dư',
      date: '2026-10-10T02:03:00.000Z',
      text: 'Số dư TK VCB 0011000123456 +5,000,000 VND lúc 10-10-2026 09:02:11. Số dư 12,345,678 VND. ND: LUONG T10',
    });
    expect(parseReceiptEmail(credit, { receivedAt })).toMatchObject({
      kind: 'incoming',
      amount: 5_000_000,
      at: '2026-10-10T02:02:11.000Z',
    });
  });

  it('reads a refund the subject names as money given back, never as spending', () => {
    const refund = email({
      from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
      subject: 'Hoàn tiền thành công cho đơn hàng 2410ABC',
      date: '2026-10-10T03:00:00.000Z',
      text: 'Shopee đã hoàn tiền ₫129.000 cho đơn hàng 2410ABC vào ví ShopeePay của bạn.',
    });
    expect(parseReceiptEmail(refund, { receivedAt })).toMatchObject({
      kind: 'refund',
      amount: 129_000,
      merchant: 'Shopee',
    });
    const asked = email({ ...refund, subject: 'Yêu cầu hoàn tiền cho đơn hàng 2410ABC' });
    expect(parseReceiptEmail(asked, { receivedAt })?.kind).toBeUndefined();
  });

  it('takes the email’s own time for a receipt that prints only its day', () => {
    const dayOnly = email({
      from: { name: 'Apple', address: 'no_reply@email.apple.com' },
      subject: 'Your receipt from Apple.',
      date: '2026-10-10T08:15:00.000Z',
      text: 'DATE 10 Oct 2026\nORDER ID MXYZ123\niCloud+ 50 GB 19.000 ₫\nTOTAL 19.000 ₫',
    });
    expect(parseReceiptEmail(dayOnly, { receivedAt })).toMatchObject({
      amount: 19_000,
      at: '2026-10-10T08:15:00.000Z',
    });
  });

  it('reads the printed time in another zone when told to', () => {
    const at = parseReceiptEmail(techcombank, { receivedAt, utcOffsetMinutes: 0 })?.at;
    expect(at).toBe('2026-10-09T21:40:00.000Z');
  });
});

// Card alerts, transfers and receipts as the banks and Stripe lay them out, one line per printed
// block; the holder is a made-up name and every card and account number is masked.

const vibLines = (head?: string[]) =>
  [
    ...(head ?? [
      'Thông báo giao dịch Thẻ tín dụng VIB Rewards Unlimited',
      'Kính gửi Quý khách hàng,',
      'Số thẻ: 5268***0000',
      'Chủ thẻ: TRAN VAN AN',
      'Giao dịch: Thanh toán dịch vụ - hàng hóa',
      'Giá trị: 29,000 VND',
      'Vào lúc: 09:53 26/10/2026',
      'Tại .OP*Green SM',
    ]),
    'Để biết thêm thông tin chi tiết, Quý khách hàng vui lòng liên hệ Dịch vụ khách hàng 24/7 của VIB: KH trong nước gọi 19002200 (1.000 đồng/phút) hoặc gửi email tới: dvkh247@vib.com.vn',
  ].join('\n');

const vibCard = email({
  from: { name: 'VIB', address: 'info@card.vib.com.vn' },
  subject: 'Thông báo giao dịch thẻ tín dụng',
  date: '2026-10-26T02:53:40.000Z',
  text: vibLines(),
});

const vcbCard = (at: string, amount: string, status: string) =>
  email({
    from: { name: 'Vietcombank', address: 'info@info.vietcombank.com.vn' },
    subject: 'Thông báo giao dịch thẻ/ Vietcombank card transaction notification',
    date: '2026-10-21T10:19:20.000Z',
    text: [
      'Thẻ',
      'Card',
      'Visa 400000...0000',
      'Sử dụng tại',
      'At',
      at,
      'Số tiền',
      'Transaction Amount',
      amount,
      'Ngày, giờ giao dịch',
      'Trans. Date, Time',
      '21-10-2026 17:19:11',
      'Tài khoản trích nợ',
      'Debit Account',
      '0000000000',
      'Tình trạng giao dịch',
      'Status of Transaction',
      status,
      'Cám ơn Quý khách đã sử dụng dịch vụ của Vietcombank!',
      'To ensure safety and security as well as to protect your rights and benefits, when making transactions via Vietcombank cards, please read carefully and follow transaction instructions on Vietcombank’s website.',
    ].join('\n'),
  });

/** MB's transfer email: each label broken over two lines, as its table cells wrap them. */
const mbTransfer = (payee: string, memo = 'TRAN VAN AN chuyen tien') =>
  email({
    from: { name: 'MB', address: 'mbebanking@mbbank.com.vn' },
    subject: 'Thong bao giao dich thanh cong',
    date: '2026-10-24T14:31:12.000Z',
    text: [
      'Cảm ơn Quý khách đã sử dụng dịch vụ MB eBanking.',
      'MB xin thông báo giao dịch của Quý khách đã được thực hiện như sau:',
      'Ngày,',
      'giờ giao dịch',
      '24-10-2026 21:31:05',
      'Loại',
      'giao dịch',
      'Chuyển tiền nhanh ngoài MB',
      'Số',
      'tham chiếu',
      '26102421310000000',
      'Tài',
      'khoản trích nợ',
      'TRAN VAN AN - 1000000000000 (VND)',
      'Người',
      'thụ hưởng',
      payee,
      'Số',
      'tiền giao dịch',
      '(VND) 161,000.00',
      'Nội',
      'dung chuyển tiền',
      memo,
      'Tình',
      'trạng',
      'Giao dịch thành công',
    ].join('\n'),
  });

describe('card alerts and transfers', () => {
  it('reads a VIB card alert, naming the shop without the processor’s prefix', () => {
    expect(parseReceiptEmail(vibCard, { receivedAt: '2026-10-26T03:00:00.000Z' })).toMatchObject({
      amount: 29_000,
      merchant: 'Green SM',
      at: '2026-10-26T02:53:00.000Z',
      bank: 'VIB',
    });
  });

  it('reads a Vietcombank card alert’s shop under its bilingual label, not its footer', () => {
    const alert = vcbCard('ELEVENLABS.IO +19170000000 US', '594,792 VND', 'Thành công');
    expect(parseReceiptEmail(alert, { receivedAt })).toMatchObject({
      amount: 594_792,
      merchant: 'ELEVENLABS.IO',
      bank: 'Vietcombank',
    });
  });

  it('names who an MB transfer paid, without the account or a household business’s title', () => {
    const shop = mbTransfer('HO KINH DOANH 79 MART 3 - 100886XX0000', 'KOVQR071VP000X');
    expect(parseReceiptEmail(shop, { receivedAt: '2026-10-25T00:00:00.000Z' })).toMatchObject({
      amount: 161_000,
      merchant: '79 MART 3',
      at: '2026-10-24T14:31:05.000Z',
      code: '26102421310000000',
    });
    const person = mbTransfer('LE THI MAI - 0560000000');
    expect(parseReceiptEmail(person, { receivedAt })?.merchant).toBe('LE THI MAI');
  });

  it('skips a transfer between the person’s own accounts, unless it repays a card', () => {
    const own = mbTransfer('TRAN VAN AN - 1020000000');
    expect(parseReceiptEmail(own, { receivedAt })).toBeNull();
    const card = mbTransfer('TRAN VAN AN - 1020000000', 'Thanh toan the tin dung');
    expect(parseReceiptEmail(card, { receivedAt })?.amount).toBe(161_000);
  });
});

describe('charges that did not go through', () => {
  it('skips a VIB notice of a declined card, which prints only its hotline’s price', () => {
    const declined = email({
      ...vibCard,
      subject: 'Thông báo về việc thẻ tín dụng VIB giao dịch không thành công',
      text: vibLines([
        'VIB xin thông báo tình trạng giao dịch Thẻ tín dụng của Quý khách như sau:',
        'Số thẻ: 5268***0000',
        'Chủ Thẻ: TRAN VAN AN',
        'Thời gian giao dịch: 10:09 27/10/2026',
        'Tại: .OP*Green SM',
        'Nội dung: Giao dịch không thành công do Thẻ không đủ số dư',
      ]),
    });
    expect(parseReceiptEmail(declined, { receivedAt })).toBeNull();
  });

  it('skips a Vietcombank card alert whose status is not successful', () => {
    const alert = vcbCard('ELEVENLABS.IO +19170000000 US', '1,486,981 VND', 'Không thành công');
    expect(parseReceiptEmail(alert, { receivedAt })).toBeNull();
  });

  it('skips a card check of nothing', () => {
    const check = vcbCard('GROK XAI +18000000000 US', '00 USD', 'Thành công');
    expect(parseReceiptEmail(check, { receivedAt })).toBeNull();
  });

  it('skips a Stripe notice of a failed payment', () => {
    const failed = email({
      from: { name: 'Eleven Labs Inc.', address: 'failed-payments+acct_0000@stripe.com' },
      subject: '₫1,486,981 payment to Eleven Labs Inc. was unsuccessful',
      text: [
        "We weren't able to charge the credit card you provided.",
        'Eleven Labs Inc.',
        '₫1,486,981 payment to Eleven Labs Inc. was unsuccessful',
        'We were unable to charge your Visa ending in 0000 for your Eleven Labs Inc. subscription.',
        'Update payment method',
      ].join('\n'),
    });
    expect(parseReceiptEmail(failed, { receivedAt })).toBeNull();
  });
});

describe('Stripe receipts', () => {
  it('reads the đồng a dollar receipt was charged as, named after the shop', () => {
    const receipt = email({
      from: { name: 'Eleven Labs Inc.', address: 'invoice+statements+acct_0000@stripe.com' },
      subject: 'Your receipt from Eleven Labs Inc. #2513-0000-0000',
      date: '2026-10-25T09:00:00.000Z',
      text: [
        'Eleven Labs Inc.',
        'Receipt from Eleven Labs Inc.',
        '$22.00',
        'Paid on October 25, 2026 with',
        '- 0000',
        'Receipt #2513-0000-0000',
        'Subtotal',
        '$20.00',
        'VAT - Vietnam (10%)',
        '$2.00',
        '(₫51,683)',
        'Total',
        '$22.00',
        'Amount paid',
        '$22.00',
        'Charged ₫594,792 using 1 USD = 27,036.0203 VND',
      ].join('\n'),
    });
    expect(parseReceiptEmail(receipt, { receivedAt: '2026-10-25T10:00:00.000Z' })).toMatchObject({
      amount: 594_792,
      merchant: 'Eleven Labs',
    });
  });

  it('names who a receipt is from, not the words of Stripe’s footer', () => {
    const grok = email({
      from: { name: 'Grok xAI', address: 'receipts+acct_0000@stripe.com' },
      subject: 'Your Grok xAI receipt [#1880-0000]',
      date: '2026-10-21T12:02:20.000Z',
      text: [
        'Receipt from Grok xAI',
        'Receipt #1880-0000',
        'Amount paid',
        '₫409,500',
        'Date paid',
        'October 21, 2026 at 5:02:15 AM PDT',
        "You're receiving this email because you made a purchase at Grok xAI, which uses Stripe to provide invoicing and payment processing.",
      ].join('\n'),
    });
    expect(parseReceiptEmail(grok, { receivedAt: '2026-10-21T13:00:00.000Z' })).toMatchObject({
      amount: 409_500,
      merchant: 'Grok xAI',
    });
  });
});

describe('emails that are not payments', () => {
  const notPayments: [string, ReceiptEmail][] = [
    [
      'a rewards-points statement',
      email({
        from: { name: 'VIB', address: 'info@card.vib.com.vn' },
        subject: 'SAO KE DIEM THUONG THE TIN DUNG VIB REWARDS UNLIMITED NGAY 25/10/2026',
        text: [
          'THÔNG BÁO ĐIỂM THƯỞNG THẺ TÍN DỤNG VIB',
          'VIB REWARDS UNLIMITED 526800******0000',
          'Tổng điểm thưởng tích lũy kỳ trước',
          '(Point carried forward)',
          '307,203.00',
          'Tổng điểm thưởng được cộng trong kỳ',
          '(Point earned)',
          '852.00',
        ].join('\n'),
      }),
    ],
    [
      'an advert the law marks [QC]',
      email({
        from: { name: 'Shopee', address: 'info@newsletter.shopee.vn' },
        subject: '[QC] Tặng thành viên Vàng voucher 35% + Hoàn 800K Xu',
        text: 'Loa siêu trầm khuếch đại ô tô\n₫ 62,800.00\n89 đã bán',
      }),
    ],
    [
      'a bank’s advert that promises money back',
      email({
        from: { name: 'VPBank', address: 'customercare@care.vpb.com.vn' },
        subject: '[QC] TRỌN BỘ MERCH CHÍNH HÃNG ĐÃ LÊN KỆ: HOÀN TIỀN ĐẾN 200.000Đ',
        text: 'Hoàn tiền đến 200.000đ khi thanh toán bằng thẻ VPBank.',
      }),
    ],
    [
      'a launch email with prices',
      email({
        from: { name: 'Apple', address: 'News@InsideApple.Apple.com' },
        subject: 'iPhone Duo mới đã có mặt.',
        text: 'Mua\nTừ 64.999.000đ hoặc 2.647.000đ/tháng trong 24 tháng\nSạc lên đến 50% pin trong khoảng 20 phút.',
      }),
    ],
    [
      'a subscription about to renew',
      email({
        from: { name: 'Apple', address: 'no_reply@email.apple.com' },
        subject: 'Your Subscription is Expiring',
        text: 'Subscription Expiring\nSketchUp Go Yearly (1 year)\n₫1.499.000/year\nTo renew or learn more, review your subscription .',
      }),
    ],
    [
      'a storage warning',
      email({
        from: { name: 'Google', address: 'google-noreply@google.com' },
        subject: '⚠️ Your Gmail has 1% of storage remaining',
        text: 'Get more storage or clean up space\n100 GB ₫19,000/month\nWhen your storage runs out, you will not be able to send and receive emails on Gmail.',
      }),
    ],
    [
      'a usage alert',
      email({
        from: { name: 'GitHub', address: 'noreply@github.com' },
        subject: '[GitHub] You have used 90% of the Actions minutes included for the account',
        text: 'Your plan includes 2,000 Actions minutes per month at no extra cost.\n1,800 min used / 2,000 min included',
      }),
    ],
    [
      'a newsletter',
      email({
        from: { name: 'OKX', address: 'updates@okx.com' },
        subject: 'Call earnings and more. 250K USDT in rewards',
        text: 'Compete for a share of 250,000 USDT across Season 3.\nIf you no longer want to receive our communication, please unsubscribe here .',
      }),
    ],
    [
      'a survey about an order',
      email({
        from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
        subject: 'Xin chào bạn, Shopee muốn lắng nghe ý kiến của bạn!',
        text: [
          'Shopee muốn được biết ý kiến của bạn về đơn hàng mã #261016R0000000 bạn đặt mua gần đây.',
          'Khảo sát ngay',
          'Giá:\t₫788,269',
          'Tổng tiền:\t₫788,269',
          'Tổng thanh toán:\t₫670,028',
        ].join('\n'),
      }),
    ],
    [
      'a job alert with a salary range',
      email({
        from: { name: 'ITviec', address: 'itviec@itviec.com' },
        subject: 'Looking for a ReactJS job? A company has openings',
        text: 'Frontend Developer (JavaScript, React)\n1,500 - 3,000 USD',
      }),
    ],
  ];
  it.each(notPayments)('skips %s', (_, notPayment) => {
    expect(parseReceiptEmail(notPayment, { receivedAt })).toBeNull();
  });

  it('reads what a shop order finally cost, after vouchers', () => {
    const order = email({
      from: { name: 'Shopee', address: 'info@mail.shopee.vn' },
      subject: 'Xác nhận thanh toán thành công',
      text: 'Tổng tiền:\t₫709,830\nVoucher từ Shopee:\t₫82,540\nTổng thanh toán:\t₫607,790',
    });
    expect(parseReceiptEmail(order, { receivedAt })?.amount).toBe(607_790);
  });
});

describe('email bodies', () => {
  it('turns table cells into label and value, and drops styles and comments', () => {
    const lines = htmlToLines(
      '<style>p{}</style><!-- x --><table><tr><td>Số tiền</td><td>1.000 đ</td></tr></table>',
    );
    expect(lines).toEqual(['Số tiền\t1.000 đ']);
  });

  it('decodes named, accented and numeric entities', () => {
    expect(decodeEntities('Qu&yacute; kh&aacute;ch &amp; &#7871; &#x20AB; &dstrok; &zz;')).toBe(
      'Quý khách & ế ₫ đ &zz;',
    );
  });

  it('reads a sender with or without a name', () => {
    expect(readSender('"Grab" <No-Reply@Grab.com>')).toEqual({
      name: 'Grab',
      address: 'no-reply@grab.com',
    });
    expect(readSender('x@vcb.vn')).toEqual({ name: '', address: 'x@vcb.vn' });
    expect(readSender('nobody')).toBeNull();
  });

  it('takes a Vietnamese Gmail forward block out of the body', () => {
    const read = readForwarded([
      '---------- Thư đã chuyển tiếp ---------',
      'Từ: TPBank <ebank@tpb.com.vn>',
      'Ngày: 10 thg 10, 2026 lúc 12:31',
      'Tiêu đề: Biến động số dư',
      'Tới: <me@example.com>',
      'Số tiền: -20.000 VND',
    ]);
    expect(read.lines).toEqual(['Số tiền: -20.000 VND']);
    expect(read.from?.address).toBe('ebank@tpb.com.vn');
    expect(read.date).toBe('10 thg 10, 2026 lúc 12:31');
  });
});

describe('addresses', () => {
  it('gives at6pm.app the handle alone, and other hosts the shared mailbox', () => {
    expect(receiptEmailAddress('k7m2qx', 'at6pm.app')).toBe('k7m2qx@at6pm.app');
    expect(receiptEmailAddress('k7m2qx', 'dev.at6pm.app')).toBe('r+k7m2qx@dev.at6pm.app');
  });

  it('reads the handle from every address a phone has been given, ignoring case', () => {
    expect(handleOfRecipient('K7M2QX@at6pm.app')).toBe('k7m2qx');
    expect(handleOfRecipient('r+k7m2qx@dev.at6pm.app')).toBe('k7m2qx');
    expect(handleOfRecipient('k7m2q9xd4p@at6pm.app')).toBe('k7m2q9xd4p');
    expect(handleOfRecipient('Receipts+K7M2Q9XD4P@6pm.oddeggs.studio')).toBe('k7m2q9xd4p');
  });

  it('refuses other mailboxes and anything that cannot be a handle', () => {
    expect(handleOfRecipient('postmaster@at6pm.app')).toBeNull();
    expect(handleOfRecipient('hello@at6pm.app')).toBeNull();
    expect(handleOfRecipient('hello+k7m2qx@at6pm.app')).toBeNull();
    expect(handleOfRecipient('r@dev.at6pm.app')).toBeNull();
    expect(handleOfRecipient('receipts@6pm.oddeggs.studio')).toBeNull();
    // `l` and `1` are not in the alphabet; 7 and 9 places are neither length.
    expect(handleOfRecipient('k7m2ql@at6pm.app')).toBeNull();
    expect(handleOfRecipient('k7m2qxa@at6pm.app')).toBeNull();
    expect(handleOfRecipient('r+k7m2q9xd4@dev.at6pm.app')).toBeNull();
  });

  it('reads the host of an API base', () => {
    expect(hostOfApiBase('https://dev.at6pm.app/api')).toBe('dev.at6pm.app');
    expect(hostOfApiBase('not a url')).toBeNull();
  });
});
