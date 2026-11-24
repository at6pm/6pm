import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/**
 * Pattern cases: alerts written for the tests in the shape a country's banks commonly use, for the
 * countries, languages and kinds of alert no public source quoted. Every name, amount and number
 * is made up, and none of these is a captured alert.
 */
export const PATTERN_ALERTS: readonly WorldAlertSample[] = [
  {
    country: 'US',
    app: 'Bank of America',
    body: 'Your debit card ending in 1234 was used for $25.00 at STARBUCKS.',
    reads: spent(2500, 'USD'),
  },
  { country: 'US', app: 'Cash App', body: 'You received $20 from John', reads: got(2000, 'USD') },
  { country: 'IE', app: 'AIB', body: '€12.50 spent at TESCO', reads: spent(1250, 'EUR') },
  {
    country: 'NZ',
    app: 'ASB',
    body: 'Card purchase of $12.50 at COUNTDOWN',
    reads: spent(1250, 'NZD'),
  },
  {
    country: 'ZA',
    app: 'FNB',
    body: 'FNB :-) R150.00 paid from cheq a/c..1234 @ Checkers. Avail R1,000. 12Nov 13:45',
    reads: spent(15000, 'ZAR'),
  },
  {
    country: 'ZA',
    app: 'Capitec',
    body: 'Capitec: Purchase R1,250.50 at CHECKERS. Avail bal R3,400.00',
    reads: spent(125050, 'ZAR'),
  },
  {
    country: 'HK',
    app: 'HSBC HK',
    body: 'A transaction of HKD 150.00 was made with your card ending 1234 at PARKNSHOP',
    reads: spent(15000, 'HKD'),
  },
  { country: 'HK', app: 'BOCHK', body: '你的戶口已存入港幣1,000.00', reads: got(100000, 'HKD') },
  {
    country: 'TW',
    app: '玉山銀行',
    body: '您的信用卡於11/12消費NT$1,234元',
    reads: spent(1234, 'TWD'),
  },
  { country: 'TW', app: '國泰世華', body: '您的帳戶轉入新台幣5,000元', reads: got(5000, 'TWD') },
  {
    country: 'NL',
    app: 'ING Nederland',
    body: 'Je hebt € 12,50 betaald aan Albert Heijn',
    reads: spent(1250, 'EUR'),
  },
  {
    country: 'NL',
    app: 'bunq',
    body: 'Je hebt € 50,00 ontvangen van Jan',
    reads: got(5000, 'EUR'),
  },
  {
    country: 'NL',
    app: 'Tikkie',
    body: 'Jan vraagt je om € 12,50 te betalen',
    reads: skipped('unread'),
  },
  { country: 'SE', app: 'Swish', body: 'Du har fått 100 kr från Anna', reads: got(10000, 'SEK') },
  {
    country: 'SE',
    app: 'Swish',
    body: 'Du har swishat 250 kr till Anna',
    reads: spent(25000, 'SEK'),
  },
  {
    country: 'SE',
    app: 'Swedbank',
    body: 'Köp 1 250,00 kr ICA MAXI',
    reads: spent(125000, 'SEK'),
  },
  {
    country: 'CH',
    app: 'TWINT',
    body: 'Sie haben CHF 12.50 an Migros bezahlt',
    reads: spent(1250, 'CHF'),
  },
  {
    country: 'CH',
    app: 'PostFinance',
    body: "Belastung CHF 1'234.50 Coop",
    reads: spent(123450, 'CHF'),
  },
  {
    country: 'FR',
    app: 'Crédit Agricole',
    body: 'Paiement de 12,50 € chez CARREFOUR',
    reads: spent(1250, 'EUR'),
  },
  {
    country: 'FR',
    app: 'Société Générale',
    body: 'Virement reçu de 1 234,56 € de Jean',
    reads: got(123456, 'EUR'),
  },
  {
    country: 'TR',
    app: 'Garanti BBVA',
    body: '1.234,56 TL tutarında harcama yapılmıştır',
    reads: spent(123456, 'TRY'),
  },
  {
    country: 'TR',
    app: 'İşCep',
    body: 'Hesabınıza 500,00 TL gelmiştir',
    reads: got(50000, 'TRY'),
  },
  {
    country: 'TR',
    app: 'Akbank',
    body: '50,00 TL iade kartınıza yapılmıştır',
    reads: got(5000, 'TRY'),
  },
  {
    country: 'KR',
    app: '신한은행',
    body: '[Web발신] 인증번호 [123456]를 입력해주세요',
    reads: skipped('code'),
  },
  {
    country: 'KR',
    app: '신한카드',
    body: '[신한카드] 승인취소 12,000원 스타벅스',
    reads: got(12000, 'KRW'),
  },
  {
    country: 'CN',
    app: '建设银行',
    body: '您尾号1234的储蓄卡11月12日13时45分消费支出人民币100.00元,活期余额1,234.00元。[建设银行]',
    reads: spent(10000, 'CNY'),
  },
  {
    country: 'CN',
    app: '招商银行',
    body: '【招商银行】您的验证码为123456，请勿泄露',
    reads: skipped('code'),
  },
  {
    country: 'JP',
    app: 'Vpass',
    body: 'ご利用金額：1,234円 ご利用先：セブン-イレブン',
    reads: spent(1234, 'JPY'),
  },
  {
    country: 'PK',
    app: 'HBL',
    body: 'Rs.1,500.00 has been debited from your account',
    reads: spent(1500, 'PKR'),
  },
  {
    country: 'IN',
    app: 'SBI',
    body: 'Rs. 1,23,456.00 credited to A/c XX1234',
    reads: got(12345600, 'INR'),
  },
  {
    country: 'TH',
    app: 'K PLUS',
    body: 'เงินออก 500.00 บาท คงเหลือ 1,000.00 บาท',
    reads: spent(50000, 'THB'),
  },
  { country: 'TH', app: 'SCB EASY', body: 'รับโอนเงิน 1,500.00 บาท', reads: got(150000, 'THB') },
  {
    country: 'ID',
    app: 'BCA mobile',
    body: 'Transfer masuk Rp50.000 dari BUDI',
    reads: got(50000, 'IDR'),
  },
  {
    country: 'MY',
    app: 'MAE',
    body: 'Anda telah membuat bayaran RM50.00 kepada XYZ',
    reads: spent(5000, 'MYR'),
  },
  {
    country: 'SA',
    app: 'Riyad Bank',
    body: 'شراء بمبلغ 150.00 ر.س من متجر',
    reads: spent(15000, 'SAR'),
  },
  {
    country: 'AE',
    app: 'Dubai Islamic Bank',
    body: 'تم خصم ١٥٠٫٠٠ درهم من حسابك',
    reads: spent(15000, 'AED'),
  },
  {
    country: 'PL',
    app: 'PKO IKO',
    body: 'Wpływ 1 234,56 zł od JAN',
    reads: got(123456, 'PLN'),
  },
  {
    country: 'NG',
    app: 'GTBank',
    body: 'Debit Alert: N5,000.00 POS purchase. Bal: N10,000.00',
    reads: spent(500000, 'NGN'),
  },
  { country: 'LA', app: 'BCEL One', body: 'ເງິນເຂົ້າ 50,000 ກີບ', reads: got(50000, 'LAK') },
];
