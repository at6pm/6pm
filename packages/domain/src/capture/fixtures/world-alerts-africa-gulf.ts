import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from Africa and the Gulf, as public sources quote them (`world-alerts`). */
export const AFRICA_GULF_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestGTBankParser.kt
  {
    country: 'NG',
    app: 'GTBank',
    body: 'Acct:******4321\nAmt:NGN15,000.00 DR\nDesc:OUTWARD TRANSFER TO OPAY - JANE DOE\nBal:NGN20,000.00\nDate:2026-08-23 9:36AM',
    reads: spent(1500000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestGTBankParser.kt
  {
    country: 'NG',
    app: 'GTBank',
    body: 'Acct:******4321\nAmt:NGN1,000.00 CR\nDesc:VIA GTWORLD OWN ACCOUNT TRANSFER\nBal:NGN40,000.00\nDate:2026-08-22 3:46PM',
    reads: got(100000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestGTBankParser.kt
  {
    country: 'NG',
    app: 'GTBank',
    body: 'Acct:******4321\nAmt:NGN25.00 DR\nDesc:Commission on NIP Transfer\nBal:NGN19,975.00\nDate:2026-08-23 9:36AM',
    reads: spent(2500, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAccessBankParser.kt
  {
    country: 'NG',
    app: 'Access Bank',
    body: 'Debit\nAmt:NGN20,400.00\nAcc:146******325\nDesc:179AMHY2616000hU/MOBILE TRF TO PAY/ POS /ABDULHADI  HAMISU\nDate:09/06/2026\nAvail Bal:NGN224,408.56\nTotal:NGN2',
    reads: spent(2040000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAccessBankParser.kt
  {
    country: 'NG',
    app: 'Access Bank',
    body: 'Credit\nAmt:NGN260,000.00\nAcc:146******325\nDesc:179NIPL2616000QZ/Paystack/CowrywiseCowrywise Financial Tech\nDate:09/06/2026\nAvail Bal:NGN260,000.38',
    reads: got(26000000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestZenithBankParser.kt
  {
    country: 'NG',
    app: 'Zenith Bank',
    body: 'Acct:421****577\nDT:09/06/2026 03:23:17 PM\nCIP/CR/MOB/OLIVER TWIST LOKOGO\nDR Amt:650.00\nBal:289.69\nDial *966# for quick airtime/Data purchase',
    reads: spent(65000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestZenithBankParser.kt
  {
    country: 'NG',
    app: 'Zenith Bank',
    body: 'Acct:421****577\nDT:24/05/2026 08:05:26 AM\nETI NXG  MOBILE TRF TO ZIB  CO\nCR Amt:40,000.00\nBal:40,277.08\nDial *966# for quick airtime/Data purchase',
    reads: got(4000000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestOpayBankParser.kt
  {
    country: 'NG',
    app: 'OPay',
    body: 'Dear OPay user, N2,300.00 has been debited for Card Payment via POS on 14-May-2026 19:28.',
    reads: spent(230000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMoniepointParser.kt
  {
    country: 'NG',
    app: 'Moniepoint',
    body: 'CREDIT ALERT\n\nAcc: 512****904 (Personal)\nAmt: NGN1,000.00\nBal: NGN5,000.00\nDate: 15/01/26\nTime: 03:09 PM\nDesc: Transfer from JANE DOE',
    reads: got(100000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestVFDBankParser.kt
  {
    country: 'NG',
    app: 'VFD Bank',
    body: 'Acct: xxx901\nAmt: N11,000.00 DR\nDate: 11-MAY-2026 21:53:32\nChgs: N25.00 (COMM VAT)\nDesc: Fruits/ To JANE DOE\nBalance:N30,000.00',
    reads: spent(1100000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'NG',
    app: 'Standard Chartered Nigeria',
    body: 'Debit Alert! Acct:xxxxxx1234, Amt:NGN15000.00, Desc:JOHN DOE RICE NG-013-000000-000000000-000000-000 , Date:2026-08-06, Bal:NGN800000.00',
    reads: spent(1500000, 'NGN'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMPESAParser.kt
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'UJB3S06XM8 Confirmed. Ksh100.00 sent to JANE  DOE 0712345678 on 11/10/26 at 12:28 PM. New M-PESA balance is Ksh4,324.29. Transaction cost, Ksh0.00.',
    reads: spent(10000, 'KES'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMPESAParser.kt
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJK6H7T3GA Confirmed. Ksh70.00 paid to person 1. on 20/10/24 at 4:21 PM.New M-PESA balance is Ksh123.12. Transaction cost, Ksh0.00. Amount you can transact within the day is 499,895.00. Save frequent Tills for quick payment on M-PESA app https://bit.ly/mpesalnk',
    reads: spent(7000, 'KES'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMPESAParser.kt
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJK6H7T0JT Confirmed. Ksh1000.00 sent to Equity Paybill Account for account 123123 on 20/10/25 at 4:26 PM New M-PESA balance is Ksh123.12. Transaction cost, Ksh23.00.Amount you can transact within the day is 499,795.00. Save frequent paybills for quick payment on M-PESA app https://bit.ly/mpesalnk',
    reads: spent(100000, 'KES'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMPESAParser.kt
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJF987E58C Confirmed.You have received Ksh300.00 from Person 3 0712121212 on 15/10/24 at 12:16 PM  New M-PESA balance is Ksh123.12. Earn interest daily on Ziidi MMF,Dial *334#',
    reads: got(30000, 'KES'),
  },
  // https://techweez.com/2026/10/06/safaricom-jumbe-mpesa-split-notifications/
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'UFAL477KQJ Confirmed. You sent: Ksh2,000.00. Received by: Petrol Station Till. TILL: 5678900. Your JumbeID: NK_74. Date: 2026-06-10 at 14:56:38.',
    reads: spent(200000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJA0000009 Confirmed. Reversal of transaction TJA0000001 has been successfully reversed  on 26/10/26 at 8:00 PM and Ksh1,500.00 is credited to your M-PESA account. New M-PESA account balance is Ksh4,056.00.',
    reads: got(150000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJA0000005 Confirmed.on 26/10/26 at 5:10 PMWithdraw Ksh1,000.00 from 123456 - EXAMPLE AGENT SHOP NAIROBI New M-PESA balance is Ksh2,656.00. Transaction cost, Ksh29.00.',
    reads: spent(100000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJA0000015 Confirmed. Fuliza M-PESA amount is Ksh 250.00. Access Fee charged Ksh 2.50. Total Fuliza M-PESA outstanding amount is Ksh 1794.51 due on 25/11/26. To check daily charges, Dial *334#OK Select Fuliza M-PESA to Query Charges.',
    reads: skipped('balance'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'M-PESA',
    body: 'TJA0000019 Confirmed . Your M-Shwari Deposit Account balance is Ksh1,300.00 .Transaction cost Ksh 0.00.',
    reads: skipped('balance'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/EquityBankKenyaParserTest.kt
  {
    country: 'KE',
    app: 'Equity Bank',
    body: 'You have received 2000.00 KES from TEST ENTERPRISES 0********1111 to your Equity account 0********1234. Ref. TESTREF0001 on 12 Sep 2026 at 17:56 EAT',
    reads: got(200000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'KCB',
    body: 'KES 1,250.00 transaction made on KCB card 4111***0007 at EXAMPLE GROCERS on 02/11/2026 09:05am has been declined. Reason - Insufficient funds.Balance KES 120.00. Queries call +254711087000.',
    reads: skipped('failed'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'KCB',
    body: 'Dear Customer, your acc 1234567890 has been debited KES 8,000.00 Pesalink Outgoing at KCB DATA PROCESSING CENTRE at 10:12:30 on 06 NOV 2026. For any queries call KCB on  +254700000000',
    reads: spent(800000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'Co-operative Bank',
    body: 'Dear ALEX, Card PAYMENT transaction dated 27-OCT-2026 19:17:46 of KES 1790  SAMPLE MEDICAL>NAIROBI KE Was Successful.Enquiries 0000000000.',
    reads: spent(179000, 'KES'),
  },
  // https://github.com/pesaclarity/ujumbe-parsers/blob/07ad926149776c1918720dd8fb6a2ea599c8c592/docs/MESSAGES.md
  {
    country: 'KE',
    app: 'Co-operative Bank',
    body: 'Dear ALEX, Card BAL ENQ transaction dated 28-OCT-2026 11:49:57 of KES 0 EXAMPLEBRANCH001>NAIROBI KE Was Successful.Enquiries 0000000000.',
    reads: skipped('balance'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestADCBParser.kt
  {
    country: 'AE',
    app: 'ADCB',
    body: 'Your debit card XXX0830 linked to acc. XXX810001 was used for AED26.80 on Jun 13 2025  4:28PM at TRANSPORT SERVICE,AE. Avl.Bal AED 2928.77.',
    reads: spent(2680, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestADCBParser.kt
  {
    country: 'AE',
    app: 'ADCB',
    body: 'AED750.50 transferred via ADCB Personal Internet Banking / Mobile App from acc. no. XXX810001 on Feb  4 2025 12:49PM. Avl. bal. AED 2000.00.',
    reads: spent(75050, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestADCBParser.kt
  {
    country: 'AE',
    app: 'ADCB',
    body: 'Transaction of USD 75.50 made on Jul 13, 2024 12:30AM on your Debit Card XXX1234 could not be completed due to insufficient funds. For assistance, please call BANK_HOTLINE',
    reads: skipped('failed'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestFABParser.kt
  {
    country: 'AE',
    app: 'FAB',
    body: 'Debit Card Purchase\nDebit\nAccount XXXX0002\nCard XXXX9879\nUSD 20.00\nCLAUDE.AI SUBSCRIPTION+14152360599 CA US\n10/07/24 20:07\nAvailable Balance AED 5978.78',
    reads: spent(2000, 'USD'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestFABParser.kt
  {
    country: 'AE',
    app: 'FAB',
    body: 'Dear customer, unsuccessful transaction of AED 42.13 has been credited to your account XXXX0002 Card XXXX2865 on 19/06/25 02:50 and your current available balance is AED 4444.13',
    reads: skipped('failed'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestFABParser.kt
  {
    country: 'AE',
    app: 'FAB',
    body: 'Inward Remittance\nCredit\nAccount XXXX5678\nAED 444.00\nValue Date 18/09/2025\nAvailable Balance AED 5444.00',
    reads: got(44400, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/fab_sms_test_data_anonymized.xml
  {
    country: 'AE',
    app: 'FAB',
    body: 'Dear Customer, 369385 is the OTP requested for Digital Service activation on 23-05-2024 12:17 AM for your FAB card ending with 3693. The code is valid for 15 minutes only. Do not disclose your OTP code to anyone. If you did not activate this request, ple',
    reads: skipped('code'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/EmiratesNBDParserTest.kt
  {
    country: 'AE',
    app: 'Emirates NBD',
    body: 'Purchase of AED 27.74 with Credit Card ending 9074 at Keeta, Dubai. Avl Cr. Limit is AED 30,978.13',
    reads: spent(2774, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestMashreqBankParser.kt
  {
    country: 'AE',
    app: 'Mashreq',
    body: 'Thank you for using NEO VISA Debit Card Card ending XXXX for AED 5.99 at CARREFOUR on 26-AUG-2025 10:25 PM. Available Balance is AED X,480.15',
    reads: spent(599, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'AE',
    app: 'Liv (Emirates NBD)',
    body: 'Purchase of AED 33.00 with Debit Card ending 4878 at JABAL HAFEET HAIRDRESS, Sharjah. Avl Balance is AED 4,344.01.',
    reads: spent(3300, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'AE',
    app: 'Liv (Emirates NBD)',
    body: 'AED 3,586.96 has been credited to account 095XXX71XXXO1. Current balance is AED 4,377.01.\n\nCredits post cut-offs will be available next day.',
    reads: got(358696, 'AED'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/EmiratesIslamicParserTest.kt
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'Debit Card Purchase\nCard Ending: 1111\nAt: talabat.com, DUBAI\nAmount: AED 12.34\nDate: 21/12/2024 20:18\nAvailable Balance: AED 12,123.12',
    reads: spent(1234, 'AED'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'تمّ خصم ١٫٨٠٠ درهم من حسابك كعملية شراء من نقطة بيع. يرجى زيارة www.emiratesislamic.ae',
    reads: spent(180000, 'AED'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'تمّ سحب ١٫٧٠٠ درهم من حسابك كعملية من جهاز صراف آلي. الرصيد المتوفر في حسابك هو ٥،٠٠٠ درهم.',
    reads: spent(170000, 'AED'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'تمّ إيداع ١٫٠٠٠ درهم في حسابك رقم ٠٠١-١٢٣٤٥٦-٠٠١٥ من خلال جهاز الإيداع النقدي... يرجى زيارة www.emiratesislamic.ae',
    reads: got(100000, 'AED'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'تمّ خصم ٢٠٠ درهم من بطاقة الائتمان/الشحن خاصتك كعملية دفع عند نقطة البيع لـ ...... . شكراً لك.',
    reads: spent(20000, 'AED'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'يتوفر اليوم ١،٠٠٠ درهم كرصيد في حسابك رقم ٠٠١-١٢٣٤٥٦-٠٠٢٢. يرجى زيارة www.emiratesislamic.ae',
    reads: skipped('balance'),
  },
  // https://www.emiratesislamic.ae/ar/ways-to-bank/sms-banking
  {
    country: 'AE',
    app: 'Emirates Islamic',
    body: 'أخبار سارة. تمّ إيداع الراتب الخاص بك اليوم. الرصيد المتوفر في حسابك رقم ٠٠١-١٢٣٤٥٦-٠٠١٥ هو ١،٠٠٠ درهم. يرجى زيارة www.emiratesislamic.ae',
    reads: skipped('balance'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'شراء\nعبر:****;مدى-جوجل باي\nبـSAR 5.75\nلـKiwi food suppl\n26/3/9 16:46',
    reads: spent(575, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'شراء انترنت\nعبر:****;مدى\nمن:****\nبـSAR 140\nلـbarq\n6/3/26 04:06',
    reads: spent(14000, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'حوالة محلية صادرة\nمصرف:ANB\nمن:****\nمبلغ:SAR 100\nالى:BARQ SAFE ACCOUNT\nالى:****\nالرسوم:SAR 0.58\n26/3/3 22:44',
    reads: spent(10000, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'حوالة محلية واردة\nعبر:SAUDI ARABIAN MONETARY AUTHORITY\nمبلغ:SAR 7714.80\nالى:****\nمن:ACME CORP\n26/2/26 00:42',
    reads: got(771480, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'سحب:صراف آلي\nبطاقة:****;مدى\nمبلغ:SAR 100\nمكان السحب:NORTHERN REGION\n5/3/26 04:20',
    reads: spent(10000, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'PoS Purchase\nBy:4196;mada(Google Pay)\nAmount:SR 2\nAt:FAST WAY\n26/6/19 23:54',
    reads: spent(200, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'SA',
    app: 'SAB (SABB)',
    body: 'شراء عبر نقاط البيع\nبطاقة: ***1111;mada(Samsung Pay);\nمبلغ: SAR 56.00\nلدى: TANOOR ALTAHI REST×\nفي: 2026-05-06 20:02:46',
    reads: spent(5600, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'SA',
    app: 'SAB (SABB)',
    body: 'حوالة صادرة مقبولة\nمن: **9999\nإلى: KHALID Ahmed\nآيبان: **8888\nبنك إس تي سي\nمبلغ: SAR 200.00\nرسوم: SAR 0.57\nفي: 2026-04-30 11:04:57',
    reads: spent(20000, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'SA',
    app: 'SAB (SABB)',
    body: 'إيداع حوالة واردة\nمن: FAHAD Ahmed\nإلى: **9999\nآيبان: **7777\nالبنك العربي الوطني\nمبلغ: SAR 75.00\nفي: 2026-05-05 00:59:09',
    reads: got(7500, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlinmaBankParser.kt
  {
    country: 'SA',
    app: 'Alinma Bank',
    body: 'شراء عبر Samsung Wallet\nمبلغ: ريال سعودى 75.25\nبطاقة مدى: 7777*\nحساب: *8888\nمن: Establishment Name\nفي: 2025-10-10 21:00',
    reads: spent(7525, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlinmaBankParser.kt
  {
    country: 'SA',
    app: 'Alinma Bank',
    body: 'شراء عبر: POS\nالبطاقة الائتمانية: **9999\nمبلغ: SAR 125.50\nلدى: Commercial Self-Technolog\nفي: 12:00 2025-10-20\nالرصيد: 875.75 ريال',
    reads: spent(12550, 'SAR'),
  },
];

/**
 * Alerts from Africa and the Gulf in the shape a parser's own test data gives them, its names made up:
 * the wording is not confirmed as captured, so these are tested as pattern cases.
 */
export const AFRICA_GULF_SHAPES: readonly WorldAlertSample[] = [
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestGTBankParser.kt
  {
    country: 'NG',
    app: 'GTBank',
    body: 'Your GTBank OTP is 123456. Do not share it with anyone.',
    reads: skipped('code'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'Online Purchase Refund\nBy:0007;mada\nFrom:0008\nAmount:SR 43.25\nAt:SYNTHETIC FOOD\n01/01/30 17:34',
    reads: got(4325, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/TestAlRajhiBankParser.kt
  {
    country: 'SA',
    app: 'Al Rajhi Bank',
    body: 'Online Purchase Declined\nBy:0007;mada\nFrom:0008\nAmount:SR 43.25\nAt:SYNTHETIC FOOD\n01/01/30 17:34',
    reads: skipped('failed'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/SNBAlAhliBankParserTest.kt
  {
    country: 'SA',
    app: 'SNB AlAhli',
    body: 'شراء نقاط بيع SamsungPay\nبـSAR 12.34\nمن SYNTHETIC STORE\nمدى *0007\nفي 00:00 01/01/30',
    reads: spent(1234, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/SNBAlAhliBankParserTest.kt
  {
    country: 'SA',
    app: 'SNB AlAhli',
    body: 'عملية مرفوضة\nشراء-POS\nبـ67.89 SAR\nرصيد غير كافي',
    reads: skipped('failed'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/kotlin/com/pennywiseai/parser/core/bank/STCBankParserTest.kt
  {
    country: 'SA',
    app: 'STC Bank',
    body: '**0007 Purchase\nVia:0007\nAmount: 12.34 SAR\nFrom: SYNTHETIC MERCHANT\nAt: 01/01/30 00:00',
    reads: spent(1234, 'SAR'),
  },
  // https://github.com/sarim2000/pennywiseai-tracker/blob/99341087027a3b3baa8c30220326f7694a11f95b/parser-core/src/test/resources/ios-parity.tsv
  {
    country: 'SA',
    app: 'D360 Bank',
    body: 'Incoming Transfer: SYNTHETIC BANK\nAmount: SAR 45.67\nFrom: *0008\nIBAN: SA00\nat: 2026-07-08 18:14',
    reads: got(4567, 'SAR'),
  },
];
