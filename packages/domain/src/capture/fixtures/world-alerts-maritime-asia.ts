import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from Singapore, Malaysia, Indonesia and the Philippines, as public sources quote them (`world-alerts`). */
export const MARITIME_ASIA_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/lpohsien/finance-tracker/blob/HEAD/tests/test_parser.py (names and numbers changed)
  {
    country: 'SG',
    app: 'UOB TMRW',
    body: 'A transaction of SGD 15.00 was made with your UOB Card ending 9012 on 26/12/25 at SAMPLE CHICKEN @ JEWEL. If unauthorised, call 24/7 Fraud Hotline now',
    reads: spent(1500, 'SGD'),
  },
  // https://github.com/lpohsien/finance-tracker/blob/HEAD/tests/test_parser.py (names and numbers changed)
  {
    country: 'SG',
    app: 'UOB TMRW',
    body: 'You made a PayNow transfer of SGD 20.00 to Tan Wei (Mobile ending 1234) on your a/c ending 4567 at 12:38PM SGT, 9 Jan 26. If unauthorised, call UOB 24/7 Fraud Hotline.',
    reads: spent(2000, 'SGD'),
  },
  // https://github.com/lpohsien/finance-tracker/blob/HEAD/tests/test_uob_comma.py
  {
    country: 'SG',
    app: 'UOB TMRW',
    body: 'You made a PayNow transfer of SGD 1,234.56 to PAYNOW - SUPPORTED B (UEN ending C002) on your a/c ending 1234 at 1:44PM SGT, 27 Dec 25. If unauthorised, call UOB 24/7 Fraud Hotline.',
    reads: spent(123456, 'SGD'),
  },
  // https://github.com/lpohsien/finance-tracker/blob/HEAD/tests/test_parser.py
  {
    country: 'SG',
    app: 'UOB TMRW',
    body: 'You have received SGD 18.62 in your PayNow-linked account ending 5678 on 07-MAY-2025 01:42AM.',
    reads: got(1862, 'SGD'),
  },
  // https://github.com/shyamsundar2007/lunchsync-sg/blob/HEAD/tests/test_card_alerts.py (names and numbers changed)
  {
    country: 'SG',
    app: 'UOB (email alert)',
    title: 'Your transaction has been reversed',
    body: 'A transaction of 33.80 SGD made with your UOB card ending 4444 on 18 Oct 26, 7:12PM at Example Taxi Pte Ltd has been reversed.',
    reads: got(3380, 'SGD'),
  },
  // https://github.com/lpohsien/finance-tracker/blob/HEAD/tests/test_uob_comma.py
  {
    country: 'SG',
    app: 'UOB',
    body: 'UOB Instalment Payment Plan: Your monthly instalment of SGD 1,200.00 has been billed to your UOB card ending 1234 on 01/01/26',
    reads: skipped('balance'),
  },
  // https://github.com/shyamsundar2007/lunchsync-sg/blob/HEAD/tests/test_card_alerts.py (names and numbers changed)
  {
    country: 'SG',
    app: 'DBS digibank (email alert)',
    title: 'Card Transaction Alert',
    body: 'Transaction Ref: SP0000000000000000000001 Dear Sir / Madam, We refer to your card transaction request dated 16/02/26. We are pleased to confirm that the transaction was completed. Date & Time: 16 FEB 15:32 (SGT) Amount: SGD15.00 From: DBS/POSB card ending 2222 To: EXAMPLE AGENCY SINGAPORE SGP If unauthorised, please login to DBS digibank mobile to report fraud dispute immediately.',
    reads: spent(1500, 'SGD'),
  },
  // https://github.com/nicholaslimck/actual-transaction-automation/blob/HEAD/tests/test_dbs.py (names and numbers changed)
  {
    country: 'SG',
    app: 'DBS digibank (email alert)',
    body: 'Transaction Ref: PIB00000000000000001   C000000000001 You have received SGD 25.00 via PayNow on 30 May 2026 15:02  SGT. From: ALICE TAN To: Your DBS/ POSB account ending 0000',
    reads: got(2500, 'SGD'),
  },
  // https://github.com/nicholaslimck/actual-transaction-automation/blob/HEAD/tests/test_dbs.py
  {
    country: 'SG',
    app: 'DBS digibank (email alert)',
    body: "Transaction Ref: 10000000000000000001 You've successfully made a payment for your other bank's credit card. Date and Time: 02 Jun 16:00 (SGT) Amount: SGD 100.00 From: DBS Savings Plus Account (A/C ending 0000) To: Other bank's card ending 1234",
    reads: spent(10000, 'SGD'),
  },
  // https://github.com/Chenn02z/self-bot/blob/HEAD/apps-script/Code.gs (names and numbers changed)
  {
    country: 'SG',
    app: 'OCBC (email alert)',
    title: 'Card Transaction Alert',
    body: 'SGD41.90 was charged at 19:38 on 18-Dec-25 to your card (-9485) at Sample Store Pte. Ltd. SG.',
    reads: spent(4190, 'SGD'),
  },
  // https://github.com/darrencjh8/friday/blob/HEAD/modules/expense-tracker/tests/ocbc-trust-transfer-hold.test.js
  {
    country: 'SG',
    app: 'Trust',
    title: "KACHING. You've got a transfer",
    body: '💰❤️🎉 Sweet! You have received SGD 6.48 from OverseaChinese Banking Corporation Ltd A/C ending 6600 on 27 Sep 2026 11:49 SGT. For more info, please contact us via Trust App.',
    reads: got(648, 'SGD'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: "You've just spent RM 23.40 at KEDAI RUNCIT AMAN with your Maybank Debit Card Visa ending 1234. View your receipt now.",
    reads: spent(2340, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: 'Successful payment of RM 9.80 to CONTOHKITCHENSDN.BHD.. REF: QR123456.',
    reads: spent(980, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: 'M2U: You have successfully paid RM12.00 to CONTOH SDN BHD.',
    reads: spent(1200, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: "You've transferred RM 10.00 to SITI AMINAH's TOUCH N GO eWALLET account ending ****1234. REF: 123456789M",
    reads: spent(1000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: "You've successfully withdrawn RM 100.00 from your account ending 1234.",
    reads: spent(10000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: "You've received RM 40.00 from SITI AMINAH. REF: 123456Q",
    reads: got(4000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: "You've just received RM 40.00 in your account ending ***1234. REF: 123ABC456",
    reads: got(4000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: 'Maybank MAE',
    body: 'Your new transfer limit of RM 5000.00 for Interbank Transfer will be reflected after 12 hour(s). Not you? Call Maybank now.',
    reads: skipped(),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'You have paid RM7.50 to CAFE CONTOH. Balance RM20.00.',
    reads: spent(750, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'Transfer Successful. RM 30.00 has been successfully transferred to ALI BIN ABU.',
    reads: spent(3000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'RM 20.00 received from SITI AMINAH.',
    reads: got(2000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'ALI BIN ABU has transferred RM 10.00 to you. Tap here to check the transaction details.',
    reads: got(1000, 'MYR'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'Kamu kebagian akses ke Payday Flash Deals! Klaim diskon RM50 buat tiket pesawat.',
    reads: skipped('promo'),
  },
  // https://github.com/Skooyo/koban/blob/HEAD/app/src/test/java/com/expensetracker/app/parser/PaymentRulesTest.kt
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    body: 'Harga emas turun hari ini. Miliki emas mulai RM10 saja dengan TNG eWallet!',
    reads: skipped(),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    title: 'Payment To: McD KAMPAR',
    body: 'McD KAMPAR: RM12.50 has been deducted from you TNG eWallet. Merchant Reference No. 7RWFE66ZS1QX8',
    reads: spent(1250, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    title: 'Payment To: Tenaga Nasional Berhad',
    body: 'Tenaga Nasional Berhad: RM191.00 has been deducted from you TNG eWallet. Merchant Reference No. 07RTAV56SX2NDF',
    reads: spent(19100, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv (names and numbers changed)
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    title: "You've received money!",
    body: 'TAN AH KOW has transferred RM 100.00 to you. Tap here to check the transaction details.',
    reads: got(10000, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv (names and numbers changed)
  {
    country: 'MY',
    app: "Touch 'n Go eWallet",
    title: 'Transfer Successful.',
    body: 'RM 23.50 has been successfully transferred to LIM MEI LING.',
    reads: spent(2350, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv (names and numbers changed)
  {
    country: 'MY',
    app: 'Maybank MAE',
    title: 'Maybank2u: Scan & Pay',
    body: 'Successful payment to RM 10.00 to AHMAD BIN ALI. REF: 193620507Q',
    reads: spent(1000, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv
  {
    country: 'MY',
    app: 'Maybank MAE',
    title: 'Maybank2u: Card Transaction',
    body: "You've spent RM 105.80 at GRAB-EC with your Maybank Debit Card Visa ending 1234. View your receipt now",
    reads: spent(10580, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv (names and numbers changed)
  {
    country: 'MY',
    app: 'Maybank MAE',
    title: 'Maybank2u: Transfer',
    body: "You've transferred RM 4.00 to NUR AINA BINTI's MAYBANK account ending ****4475. REF: 624207663M",
    reads: spent(400, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv
  {
    country: 'MY',
    app: 'Maybank MAE',
    title: 'Maybank2u: Funds Received',
    body: "You've just received RM34.00 in your account ending ***7654. REF: 20240801CIGGMYKL020ORM01052599",
    reads: got(3400, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv (names and numbers changed)
  {
    country: 'MY',
    app: 'unknown e-wallet/bank (Malaysia)',
    title: 'Ka-ching! Incoming money',
    body: 'RM 25.00 received from LIM MEI LING for Fund Transfer.',
    reads: got(2500, 'MYR'),
  },
  // https://github.com/luhouyang/hackattack-sakitjantung/blob/HEAD/model/transaction_category/categories-2.csv
  {
    country: 'MY',
    app: 'Rize (AmBank)',
    title: "You've received a fund transfer.",
    body: "You've received RM 1800.00 in your account ***5432 on 12 Jul 2024 06:36:34. Log in to Rize and check your account for transaction details.",
    reads: got(180000, 'MYR'),
  },
  // https://github.com/41524120021/notification_listener/blob/HEAD/PANDUAN_SETUP_TRANSAKSI.md (names and numbers changed)
  {
    country: 'ID',
    app: 'BRImo',
    title: 'BRImo',
    body: 'Sobat BRI! Dana Rp1.000.451 masuk ke rekening 123401000555301 pada 05/12/2025 11:14:59 KET.:TRANSFER DARI BUDI SANTOSO',
    reads: got(1000451, 'IDR'),
  },
  // https://github.com/41524120021/notification_listener/blob/HEAD/PANDUAN_SETUP_TRANSAKSI.md (names and numbers changed)
  {
    country: 'ID',
    app: 'BCA mobile / myBCA (Catatan Finansial)',
    title: 'Catatan Finansial',
    body: 'Pemasukan Rp1.500.000,00 dari BUDI SANTOSO pada 05/12/2025 10:30',
    reads: got(1500000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'BRImo',
    body: '08/12/2022 11:23:48 - Transaksi Top Up OVO 08999999999 sebesar Rp20.000,00 BERHASIL. Info lebih lanjut hubungi Call Center BRI 14017',
    reads: spent(20000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'OVO',
    body: 'Transfer Rp100.000.00 ke HAXIM berhasil. Kamu dikenakan biaya transaksi Rp5.000',
    reads: spent(100000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'OVO',
    body: 'Rp1.000 telah dipotong dari OVO Cash untuk biaya top up dari BANK BRI',
    reads: spent(1000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'OVO',
    body: 'Top up sebesar Rp100.000 melalui BANK BRI, telah berhasil',
    reads: got(100000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md (names and numbers changed)
  {
    country: 'ID',
    app: 'OVO',
    body: 'Budi mengirimkan dana sebesar Rp 10.000 melalui aplikasi OVO',
    reads: got(10000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'DANA',
    body: 'Berhasil top up saldo Rp20.000 dari BRI BANK RAKYAT INDONESIA. Lihat detailnya di sini!',
    reads: got(20000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md
  {
    country: 'ID',
    app: 'GoPay',
    body: 'Top up saldo sebesar Rp10.000 via ATM Bersama Permata berhasil.',
    reads: got(10000, 'IDR'),
  },
  // https://github.com/moneytoring/moneytoring/blob/HEAD/README.md (names and numbers changed)
  {
    country: 'ID',
    app: 'ShopeePay',
    title: 'Isi saldo',
    body: 'AB12CD34EF56 sebesar Rp10.000 telah ditambahkan ke ShopeePay-mu. Saldo saat ini Rp140.329',
    reads: got(10000, 'IDR'),
  },
  // https://github.com/adlnfkhrzmn/sigap-app/blob/HEAD/v2/DEMO.md
  {
    country: 'ID',
    app: 'GoPay Merchant',
    body: 'Pembayaran QRIS statis diterima - Rp 100 di Joeragans, CIMAUNG.',
    reads: got(100, 'IDR'),
  },
  // https://github.com/Cxslin/dana-qris-gateway/blob/HEAD/matcher.py
  { country: 'ID', app: 'DANA Bisnis', body: 'Rp1 diterima DANA Bisnis.', reads: got(1, 'IDR') },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'GCash',
    title: 'You have received money in GCash!',
    body: 'You have received PHP 1,096.10 of GCash from MI*A P. 0915••••847.',
    reads: got(109610, 'PHP'),
  },
  // https://github.com/XQYB2/Konfirma/blob/HEAD/src/lib/gcashParser.ts (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash',
    body: 'You have received PHP 90.85 of GCash from PA**A T . 09171234567',
    reads: got(9085, 'PHP'),
  },
  // https://github.com/crystalineddd/safeprint-notif-capture/blob/HEAD/README.md
  {
    country: 'PH',
    app: 'GCash',
    body: 'You have received PHP 1.00 of Gcash from CR*******E D. 09XXXXXXXXX',
    reads: got(100, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash',
    body: 'You have received PHP 500.00 of GCash from MA•IA S. (0917•••5678). Your new balance is PHP 12,340.50. Ref. No. 1234567890123.',
    reads: got(50000, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'Maya',
    title: 'Money received ↙️',
    body: 'You received ₱1,899.00 in your wallet via InstaPay',
    reads: got(189900, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'Maya',
    title: 'Money received ↙️',
    body: 'You received 500.00 in your wallet via InstaPay',
    reads: got(50000, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'GoTyme',
    title: 'Transfer received',
    body: 'You received P1,250.00 from A. Santos. Your available balance is P9,000.00.',
    reads: got(125000, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'MariBank',
    title: 'Successful Incoming Transfer',
    body: 'You’ve received PHP 1,299.99 from bank with account ending 5678',
    reads: got(129999, 'PHP'),
  },
  // https://github.com/danrave1234/paytsek/blob/HEAD/modules/payment-collector/android/src/test/java/ph/paytsek/collector/NotificationParserTest.kt
  {
    country: 'PH',
    app: 'MariBank',
    title: 'Transfer Successful',
    body: "You've successfully sent PHP 500.00 to account ending 9012",
    reads: spent(50000, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have sent PHP 620.00 of GCash to MARIA SANTOS 09171234567 on 09-16-2022 02:29 PM. Your new balance is PHP 22.02. Ref. No. 0005933230416',
    reads: spent(62000, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have sent P200.00 of GCash on 2022-Apr-09 12:09:53 AM to BDO Unibank, Inc. account ending in 6177. Convenience fee for this transaction is P15.00. Your new balance is P258.00 with GCash Ref. No. 0004123079546 & InstaPay Trace No. 711297. Thank you for using GCash!',
    reads: spent(20000, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have paid P39.00 of GCash to 7 Eleven on 04-22-23 10:39:11 PM. Ref. No. 001538396.',
    reads: spent(3900, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have paid P50.00 of GCash to purchase Php 50 load for 09171234567 on 03-07-22 01:48 AM. Your GCash balance is P42.00. Ref. No. 038187734.',
    reads: spent(5000, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'Your payment of P149.00 to Netflix Inc. has been successfully processed on 06-17-22 01:44:27 PM. Ref. No. 022376150',
    reads: spent(14900, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have received PHP 500.00 of GCash from JA****E A. 09171234567 w/ MSG: . Your new balance is PHP 521.52. Ref. No. 3006503167908.',
    reads: got(50000, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: 'You have received P792.00 GCash from 7eleven Kiosk w/ MSG - 2401-8003-9666. Your new balance is P927.57 01-18-24 4:20AM. Ref no. 0014628370228.',
    reads: got(79200, 'PHP'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv (names and numbers changed)
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: "Did you request to SEND MONEY to NH**L AL***N P.'s GCash number, 09171234567 with amount of PHP 25.00? If not, DON'T ENTER YOUR OTP ON ANY SITE OR SEND IT TO ANYONE because IT'S A SCAM! If you requested, your OTP is 559238.",
    reads: skipped('code'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'GCash (SMS)',
    body: "You've got a PHP 30.00 QR voucher! Use it on your next QR purchase on GCash. Valid for 7 days. Go to your GCash Profile and tap Voucher Pocket to view your voucher.",
    reads: skipped('promo'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'Maya (SMS)',
    body: "Maya account upgraded! That also means you're a step closer to your FREE Maya card. To get it, simply open a Maya Savings account and deposit P500. Let's go!",
    reads: skipped('promo'),
  },
  // https://github.com/Notanne1305/SMS-Scam-Detection-in-English-Filipino-Texts/blob/HEAD/data/preprocessed/master_dataset.csv
  {
    country: 'PH',
    app: 'BDO (SMS)',
    body: 'BDO Pay is currently unavailable due to a system maintenance. In the meantime, you can use the new BDO Online app to Send Money and Pay Bills.',
    reads: skipped(),
  },
];
