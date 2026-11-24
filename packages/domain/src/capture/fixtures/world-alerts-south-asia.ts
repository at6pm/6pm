import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from South Asia, as public sources quote them (`world-alerts`). */
export const SOUTH_ASIA_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank',
    body: 'Spent Rs.572.25 On HDFC Bank Card 0000 At ..SAMPLE CAFE HOUSE On 2026-11-22:08:26:20.Not You? To Block+Reissue Call 0000000000/SMS BLOCK CC 0000 to 0000000000',
    reads: spent(57225, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank',
    body: 'Sent Rs.15000.00 From HDFC Bank A/C *1234 To TEST MERCHANT PVT LTD On 01/01/26 Ref 567890567890 Not You? Call 18005556789/SMS BLOCK UPI to 7305556789',
    reads: spent(1500000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank',
    body: 'Update! INR 1.00 deposited in HDFC Bank A/c XX9999 on 30-MAR-26 for NEFT Cr-CITI0100000-ACME TECHNOLOGIES-PERSON NAME-CITIN99999999999.Avl bal INR 8.00. Cheque deposits in A/C are subject to clearing',
    reads: got(100, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank',
    body: 'Transaction Reversed!On HDFC Bank CREDIT Card xx5555 Amt: Rs.862.16 By AMAZON                000 On 2026-08-21:05:20:26',
    reads: got(86216, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank',
    body: 'New Bill Alert:\nYour XUBA00000TST1A Bill 1234567890 of Rs.1500.00 is due on 15-Jan-2026. To pay, login to HDFC Bank Net/Mobile Banking>BillPay\nT&C. Ignore if paid',
    reads: skipped(),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestHDFCBankParser.kt
  {
    country: 'IN',
    app: 'HDFC Bank (PayZapp)',
    body: 'Rs.50 Deducted\nFrom PayZapp Wallet\nOn 05-11-2026 10:19:24\nBal: Rs.120.00\nNot you? Report:\nhttps://1.hdfc.bank.in/HDFCBK/s/9 or SMS BLOCKXXW to 5676712',
    reads: spent(5000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestICICIBankParser.kt
  {
    country: 'IN',
    app: 'ICICI Bank',
    body: 'ICICI Bank Acct XX051 debited for Rs 180.00 on 10-Nov-25; DINDUGAL ORIGIN credited. UPI:568069174081. Call 18002662 for dispute. SMS BLOCK 051 to 9215676766. 06:33 PM',
    reads: spent(18000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestICICIBankParser.kt
  {
    country: 'IN',
    app: 'ICICI Bank',
    body: 'INR 500.00 spent using ICICI Bank Card XX5678 on 06-Sep-25 on Swiggy. Avl Limit: INR 1,50,000.00.',
    reads: spent(50000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestICICIBankParser.kt
  {
    country: 'IN',
    app: 'ICICI Bank',
    body: 'ICICI Bank Account XX566 credited:Rs. 18,832.00 on 28-Feb-25. Info INF*000169831922*IQBO SAL FE. Available Balance is Rs. 28,076.14.',
    reads: got(1883200, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestICICIBankParser.kt
  {
    country: 'IN',
    app: 'ICICI Bank',
    body: '123456 is One-Time Password for INR 478.00 transaction towards SAMPLE MERCHANT using ICICI Bank INR Prepaid Card XX1234. OTPs are SECRET. DO NOT disclose',
    reads: skipped('code'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestICICIBankParser.kt
  {
    country: 'IN',
    app: 'ICICI Bank',
    body: 'Your account will be debited with Rs 649.00 on 03-Oct-25 towards Netflix Entertainment Ser for AutoPay MERCHANTMANDATE, RRN 421723106963-ICICI Bank.',
    reads: skipped(),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAxisBankParser.kt
  {
    country: 'IN',
    app: 'Axis Bank',
    body: 'Spent INR 174\nAxis Bank Card no. XX7441\n13-09-25 21:35:56 IST\nBlinkit\nAvl Limit: INR 6652.78\nNot you? SMS BLOCK 7441 to 919951860002',
    reads: spent(17400, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAxisBankParser.kt
  {
    country: 'IN',
    app: 'Axis Bank',
    body: 'INR 209.00 debited from A/c no. XXxxxxy on BURGRILL 04-12-2025 13:13:27 IST. Avl bal: INR xxxxxxx. Not you? SMS BLOCKCARD XX0023 to +919951860002 - Axis Bank',
    reads: spent(20900, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestKotakBankParser.kt
  {
    country: 'IN',
    app: 'Kotak Bank',
    body: 'Sent Rs.15.00 from Kotak Bank AC X1234 to paytmqr288005050101t74afkchmxjd@paytm on 14-10-25.UPI Ref 1234567890. Not you, https://kotak.com/KBANKT/Fraud',
    reads: spent(1500, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestKotakBankParser.kt
  {
    country: 'IN',
    app: 'Kotak Bank',
    body: 'Received Rs.250.00 in your Kotak Bank AC X3333 from john.doe@oksbi on 14-10-25.UPI Ref 2222222222. Not you, https://kotak.com/KBANKT/Fraud',
    reads: got(25000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestKotakBankParser.kt
  {
    country: 'IN',
    app: 'Kotak Bank',
    body: 'INR 2 from Airport Lounge refunded to your Kotak Credit Card x8848 on 17-Jul-2026. Opted for EMI? Please call 18602662666 to cancel.',
    reads: got(200, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestSBIParser.kt
  {
    country: 'IN',
    app: 'SBI',
    body: 'Dear Customer, transaction number 1234 for Rs.383.00 by SBI Debit Card 0000 done at merchant on 13Sep25 at 21:38:26. Your updated available balance is Rs.999999999. If not done by you, forward this SMS to 7400165218/ call 1800111109/9449112211 to block card. GOI helpline for cyber fraud 1930.',
    reads: spent(38300, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestSBIParser.kt
  {
    country: 'IN',
    app: 'SBI Card',
    body: 'Rs.90.00 𝗌𝗉𝖾𝗇𝗍 𝗈𝗇 𝗒𝗈𝗎𝗋 𝖲𝖡𝖨 𝖢𝗋𝖾𝖽𝗂𝗍 𝖢𝖺𝗋𝖽 𝖾𝗇𝖽𝗂𝗇𝗀 5667 at SUPREMEGOURMET on 13/02/26. 𝖳𝗋𝗑𝗇. 𝗇𝗈𝗍 𝖽𝗈𝗇𝖾 𝖻𝗒 𝗒𝗈𝗎? 𝖱𝖾𝗉𝗈𝗋𝗍 𝖺𝗍 https://sbicard.com/Dispute',
    reads: spent(9000, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestSBIParser.kt
  {
    country: 'IN',
    app: 'SBI Card',
    body: 'SBI Card Bill Pay Alert! Dear Cardholder, you have a new Jio Postpaid bill with account no. XXXXXXXXXX for Rs. 850.00 due by 22-Nov-2026. Click here to pay now. - SBI Card',
    reads: skipped('unread'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/PhonePeWalletParserTest.kt
  {
    country: 'IN',
    app: 'PhonePe',
    body: "You've paid Rs.14.36 via PhonePe wallet for SAMPLE KIRANA STORE. Not you? Call us on 022-00000000. Remaining balance: Rs.0. To top-up click https://phone.pe/PHONPE/ws",
    reads: spent(1436, 'INR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/FaysalBankParserTest.kt
  {
    country: 'PK',
    app: 'Faysal Bank',
    body: 'PKR 16738.79 Debit Card purchase at Sample Delivery Karachi from FBL A/C *1234 on 02/FEB/2026 at 09:14:51 PM',
    reads: spent(16739, 'PKR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/FaysalBankParserTest.kt
  {
    country: 'PK',
    app: 'Faysal Bank',
    body: 'PKR 70.000.00 sent to SAMPLE BENEFICIARY A/C *8518 via IBFT from FBL A/C *1234 on 06-FEB-2026 02:20 PM Ref # 950900.',
    reads: spent(70000, 'PKR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/FaysalBankParserTest.kt
  {
    country: 'PK',
    app: 'Faysal Bank',
    body: 'ACCOUNT HOLDER A/c # *1234 received PKR 500.00 via RAAST from SENDER ALIAS IBAN *3867 on 06-Feb-26 at 04:22 PM Ref#:121621592909 Info:111060606',
    reads: got(500, 'PKR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/FaysalBankParserTest.kt
  {
    country: 'PK',
    app: 'Faysal Bank',
    body: 'PKR 10,000.00 ATM cash withdrawal from FBL A/C *1234 on 01/FEB/2026 at 02:52 PM',
    reads: spent(10000, 'PKR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestStandardCharteredBankParser.kt
  {
    country: 'PK',
    app: 'Standard Chartered Pakistan',
    body: 'Dear Client, PKR 1,958.98 have been paid at FOOD PANDA KARACHI PAK on 23-03-26 using Credit Card no 0141. Avail Limit PKR5174.79. SCBPL',
    reads: spent(1959, 'PKR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestStandardCharteredBankParser.kt
  {
    country: 'PK',
    app: 'Standard Chartered Pakistan',
    body: 'Dear Client, your account 01-01***9901 has been credited with amount PKR 1,083,503.58 from account 18-87xxxxx-9039959 PAYONEER from IBFT 04/12/202 on 04/12/25.',
    reads: got(1083504, 'PKR'),
  },
  // https://gist.github.com/fmtarif/c28690b90de7e3ff902612ca7c241b36
  {
    country: 'BD',
    app: 'bKash',
    body: 'You have received Tk 800.00 from 0199999999.Ref XYZ. Fee Tk 0.00. Balance Tk 0.00. TrxID XYZABC at 15/07/2021 11:00',
    reads: got(80000, 'BDT'),
  },
  // https://gist.github.com/fmtarif/c28690b90de7e3ff902612ca7c241b36
  {
    country: 'BD',
    app: 'bKash',
    body: 'You have received deposit from iBanking of Tk 1,000.00 from Eastern Bank Limited Internet Banking. Fee Tk 0.00. Balance Tk 0.00. TrxID XYZABC at 14/07/2021 16:43',
    reads: got(100000, 'BDT'),
  },
  // https://gist.github.com/fmtarif/c28690b90de7e3ff902612ca7c241b36
  {
    country: 'BD',
    app: 'bKash',
    body: 'Cash In Tk 3,260.00 from 0199999999 successful. Fee Tk 0.00. Balance Tk 0.00. TrxID XYZABC at 14/07/2021 20:19. Download App: https://bKa.sh/8app',
    reads: got(326000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestBkashParser.kt
  {
    country: 'BD',
    app: 'bKash',
    body: 'Payment of Tk 20.00 to 01800000000 is successful. Balance Tk 20,268.41. TrxID DEF5678UVW at 26/05/2026 15:07',
    reads: spent(2000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestBkashParser.kt
  {
    country: 'BD',
    app: 'bKash',
    body: 'Send Money Tk 0.20 to 01600000000 successful. Ref 2. Fee Tk 0.00. Balance Tk 0.08. TrxID JKL3456MNO at 07/06/2026 22:45.',
    reads: spent(20, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/BRACBankParserTest.kt
  {
    country: 'BD',
    app: 'BRAC Bank',
    body: 'BDT 1,920 transacted at TEST DIAGNOSTIC and  DH on 18/10/26 [08:45:24 AM BST] using Card#***2222. Available balance: BDT 98,997.32. Helpline 16221.',
    reads: spent(192000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/BRACBankParserTest.kt
  {
    country: 'BD',
    app: 'BRAC Bank',
    body: 'Tk 10,010.00 (incl. charges) has been debited from your BBL A/C: 11111**4444 to A/C: 9**9999 for NPSB transfer. Available balance: Tk. 66,330.95. Helpline:16221',
    reads: spent(1001000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/BRACBankParserTest.kt
  {
    country: 'BD',
    app: 'BRAC Bank',
    body: 'TK 28,500.00 credited to A/C#11111**3333 on 12-10-26 @11:23 AM from OTHER BANK. Balance TK 37,130.95. BRAC Bank.',
    reads: got(2850000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/BRACBankParserTest.kt
  {
    country: 'BD',
    app: 'BRAC Bank',
    body: 'Your OTP for BRAC Bank transaction of TK 500.00 is 123456. Do not share it with anyone.',
    reads: skipped('code'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/CityBankBangladeshParserTest.kt (names and numbers changed)
  {
    country: 'BD',
    app: 'City Bank',
    body: '21-Oct-2026\nE-COMM/POS TXN\nTk. 1,000 Purchased\nTk. 1,01,533 Balance\nA/C: 7777***1234\nPlease rate us: https://example.invalid/rate',
    reads: spent(100000, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/CityBankBangladeshParserTest.kt
  {
    country: 'BD',
    app: 'City Bank',
    body: 'OTP is 0000 for Tk. 25,000.00 utility txn in Citytouch, validity 2 min.',
    reads: skipped('code'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/StandardCharteredBangladeshParserTest.kt
  {
    country: 'BD',
    app: 'Standard Chartered Bangladesh',
    body: 'BDT 1234.50 transaction was made on card ending 1234 at DISCOUNT STORE DHAKA BD on 18-Sep-26. Available credit: BDT 50,000.00. Enquiries:12345',
    reads: spent(123450, 'BDT'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/StandardCharteredBangladeshParserTest.kt
  {
    country: 'BD',
    app: 'Standard Chartered Bangladesh',
    body: 'Statement of your Credit Card ( 1234) has been sent.Closing Balance:BDT 65442.52, Min Pmt:BDT 11111.00 Due Dt: 17-Nov-26.',
    reads: skipped('balance'),
  },
];
