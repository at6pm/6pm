import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import { bankOfApp } from './bank-alert-senders';
import { isVietnameseAlert } from './alert-world';
import { normalizeWorldAlert } from './alert-world-money';
import { readBankAlert, readBankAlertKeys, readFailedBankAlert } from './bank-alert';

// Every name, account and amount here is made up.

const money = (text: string, home: string) => normalizeWorldAlert(text, currencyOf(home));
const amountOf = (body: string, home: string) => {
  const alert = readBankAlert({ body }, currencyOf(home));
  return alert.kind === 'moved' ? [alert.amount, alert.currency] : alert.reason;
};

describe('which alerts are Vietnamese', () => {
  it('knows them by their bank, their letters or their words', () => {
    expect(isVietnameseAlert('Payment of $5.00', bankOfApp('MB Bank'))).toBe(true);
    expect(isVietnameseAlert('Bạn đã chuyển 50.000đ', null)).toBe(true);
    expect(isVietnameseAlert('TK 0123 -50,000VND luc 12:30. SD: 1,000,000VND', null)).toBe(true);
  });

  it('reads every other alert as from abroad', () => {
    expect(isVietnameseAlert('Tk 500.00 sent to 01700000000', null)).toBe(false);
    expect(isVietnameseAlert('Paiement de 12,50 € chez CARREFOUR', null)).toBe(false);
    expect(isVietnameseAlert('Paid £4.50', bankOfApp('com.revolut.revolut'))).toBe(false);
  });
});

describe('money as banks abroad print it', () => {
  it('writes a currency word as its code', () => {
    expect(money('1,234円', 'JPY')).toBe('1,234 JPY ');
    expect(money('12,000원', 'KRW')).toBe('12,000 KRW ');
    expect(money('500.00 บาท', 'THB')).toBe('500.00 THB ');
    expect(money('125,00 kr', 'SEK')).toBe('125,00 SEK ');
    expect(money('12,50 zł', 'PLN')).toBe('12,50 PLN ');
    expect(money('1.234,56 TL', 'TRY')).toBe('1.234,56 TRY ');
  });

  it('gives a shared mark to the home that writes it, else to its usual owner', () => {
    expect(money('Rs.500', 'PKR')).toBe(' PKR 500');
    expect(money('Rs.500', 'USD')).toBe(' INR 500');
    expect(money('100元', 'TWD')).toBe('100 TWD ');
    expect(money('100元', 'USD')).toBe('100 CNY ');
  });

  it('reads a single-letter mark only on a phone counting that currency', () => {
    expect(money('R150.00', 'ZAR')).toBe(' ZAR 150.00');
    expect(money('R150.00', 'USD')).toBe('R150.00');
    expect(money('N5,000.00', 'NGN')).toBe(' NGN 5,000.00');
    expect(money('P1,250.00', 'PHP')).toBe(' PHP 1,250.00');
  });

  it('joins thousands grouped by spaces, apostrophes, lakhs or dots before cents', () => {
    expect(amountOf('Wpływ 1 234,56 zł', 'PLN')).toEqual([123456, 'PLN']);
    expect(amountOf('Virement reçu de 1 234,56 €', 'EUR')).toEqual([123456, 'EUR']);
    expect(amountOf("Belastung CHF 1'234.50", 'CHF')).toEqual([123450, 'CHF']);
    expect(amountOf('Rs. 1,23,456.00 credited to A/c XX1234', 'INR')).toEqual([12345600, 'INR']);
    expect(amountOf('Transfer Rp100.000.00 ke BUDI berhasil', 'IDR')).toEqual([100000, 'IDR']);
  });

  it('reads Arabic-Indic digits', () => {
    expect(amountOf('تم خصم ١٥٠٫٠٠ درهم من حسابك', 'AED')).toEqual([15000, 'AED']);
  });

  it('takes no phone number, masked card or date for an amount', () => {
    expect(amountOf('KES 8,000.00 debited. Call +254700000000', 'KES')).toEqual([800000, 'KES']);
    expect(amountOf('농협 입금73,000원 352-****-4054-93 잔액123,189원', 'KRW')).toEqual([
      73000,
      'KRW',
    ]);
    expect(amountOf('SGD41.90 was charged to your card (-9485)', 'SGD')).toEqual([4190, 'SGD']);
    expect(amountOf('收到一笔转账 10月13日 0.01元', 'CNY')).toEqual([1, 'CNY']);
  });

  it('leaves a Vietnamese alert as it always read', () => {
    expect(amountOf('TK 0123 -50,000VND luc 12:30. SD: 1,000,000VND', 'VND')).toEqual([
      50000,
      'VND',
    ]);
  });
});

describe('what an alert from abroad says besides its amount', () => {
  it('calls money given back a refund, and money taken back a reversal', () => {
    const keys = (body: string, home: string) => readBankAlertKeys({ body }, currencyOf(home)).what;
    expect(keys('Zwrot 50,00 PLN na kartę', 'PLN')).toBe('refund');
    expect(keys('Estorno de R$ 12,50 na sua conta', 'BRL')).toBe('reversal');
    expect(keys('[신한카드] 승인취소 12,000원', 'KRW')).toBe('reversal');
  });

  it('keeps the amount of a payment that was declined, to void it', () => {
    expect(
      readFailedBankAlert({ body: 'Compra rechazada por 12,50 EUR en ZARA' }, currencyOf('EUR')),
    ).toEqual({ amount: 1250, currency: 'EUR' });
  });

  it('never takes a payment request, an approval prompt or a promotion for money', () => {
    expect(amountOf('Jan vraagt je om € 12,50 te betalen', 'EUR')).toBe('unread');
    expect(amountOf('Bitte bestätigen Sie die Online-Zahlung über 1,00 € bei SHOP', 'EUR')).toBe(
      'code',
    );
    expect(amountOf('(광고) 이벤트 참여하고 5,000원 받기', 'KRW')).toBe('promo');
  });
});
