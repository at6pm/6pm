import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from Thailand, Cambodia and Laos, as public sources quote them (`world-alerts`). */
export const MAINLAND_ASIA_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/Phongsathornjan/apay-backend/blob/HEAD/src/webhook/utils/kbank-ios-notification.parser.spec.ts
  {
    country: 'TH',
    app: 'K PLUS',
    title: 'รายการเงินเข้า',
    body: 'บัญชี xxx-x-x8583-x  จำนวนเงิน 1.00 บาท  วันที่ 1 พ.ย. 69  22:57 น.',
    reads: got(100, 'THB'),
  },
  // https://github.com/Phongsathornjan/apay-backend/blob/HEAD/src/webhook/utils/kbank-ios-notification.parser.spec.ts (names and numbers changed)
  {
    country: 'TH',
    app: 'K PLUS',
    title: 'รายการเงินออก',
    body: 'บัญชี xxx-x-x8583-x  จำนวนเงิน 1.00 บาท  วันที่ 1 พ.ย. 69  22:57 น.',
    reads: spent(100, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/kbank_in.txt
  {
    country: 'TH',
    app: 'KBank (LINE KBank)',
    title: 'รายการเงินเข้า',
    body: 'รายการเงินเข้า | 7 ก.ย. 69 14:13  น. | เข้าบัญชี | xxx-x-x0133-x | จำนวนเงิน | 15.00  บาท | ยอดเงินคงเหลือ | 8,751.94  บาท',
    reads: got(1500, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/ktb_in.txt (names and numbers changed)
  {
    country: 'TH',
    app: 'Krungthai (Krungthai Connext on LINE)',
    title: 'เงินเข้า',
    body: 'เงินเข้า | +2,000.00 | บาท | ประเภท | เงินโอนเข้า | เข้าบัญชี | XX3090 | จากบัญชี | SCB XX9148 | ผู้โอน | นาย สมชาย ใจดี | ยอดที่ใช้ได้ | 3,234.75 | บาท | วันที่ทำรายการ | 25/07/69 16:35',
    reads: got(200000, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/ktb_out.txt (names and numbers changed)
  {
    country: 'TH',
    app: 'Krungthai (Krungthai Connext on LINE)',
    title: 'เงินออก',
    body: 'เงินออก | -200.00 | บาท | ประเภท | โอนเงินออก | จากบัญชี | XX3090 | ไปยังบัญชี | SCB XX9148 | ผู้รับโอน | นาย สมชาย ใจดี | ยอดที่ใช้ได้ | 3,034.75 | บาท | วันที่ทำรายการ | 25/07/69 16:40',
    reads: spent(20000, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/blob/HEAD/.docs/forwarding.md
  {
    country: 'TH',
    app: 'Krungthai (Krungthai Connext on LINE)',
    title: 'Krungthai Connext',
    body: 'เงินเข้า: 23.25 บาท เข้าบัญชี XX7157 เมื่อ 16/06/6',
    reads: got(2325, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/scb_in.txt (names and numbers changed)
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'รายการเงินเข้า',
    body: 'รายการเงินเข้า | +200.00 บาท | จากบัญชี | SOMCHAI JAID X-3090\nกรุงไทย | เข้าบัญชี | X-9148 | วันที่/เวลา | 25/07/2026 16:40 | ยอดเงินที่ใช้ได้ | 19,116.39 บาท',
    reads: got(20000, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/scb_out.txt (names and numbers changed)
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'รายการเงินออก',
    body: 'รายการเงินออก | -2,000.00 บาท | จากบัญชี | X-9148 | รายการ | DSC-โอนไป KTB x3090 นายสมชาย ใจดี | วันที่/เวลา | 25/07/2026 16:35 | ยอดเงินที่ใช้ได้ | 18,916.39 บาท',
    reads: spent(200000, 'THB'),
  },
  // https://github.com/wintech-thai/please-payment-agent/tree/HEAD/scripts/fixtures/bank-tx/scb_promo_intro.txt
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    body: 'ขอแนะนำฟีเจอร์ “เช็กยอดเงินฝาก” บริการเช็กยอดเงินสำหรับบัญชีออมทรัพย์และกระแสรายวัน พิเศษสำหรับลูกค้า SCB Connect 💁🏻‍♀️',
    reads: skipped(),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[รายการเงินเข้า 1,488.03 บาท เข้าบัญชี X-1139 วันที่ 17/06/2025 @22:47 ยอดเงินที่ใช้ได้ 295,772.03 บาท]',
    reads: got(148803, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[รายการเงินเข้า: ดอกเบี้ยเงินฝาก 314.61 บาท เข้าบัญชี X-1139 วันที่ 25/06/2025]',
    reads: got(31461, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[รายการเงินออก 2,000.00 บาท จากบัญชี X-1139 วันที่ 14/06/2025 @13:29 ยอดเงินที่ใช้ได้ 294,284.00 บาท]',
    reads: spent(200000, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[ชำระเงิน 163.52 บาท ด้วยบัตรเดบิต X-4885 จากบัญชี X-1139 @Yandex.Go ค่าธรรมเนียม 0.00 บาท วันที่ 06/08/2025 @13:07]',
    reads: spent(16352, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[รายการเงินออก 2,900.00 บาท ด้วยบัตรเดบิต X-4885 จากบัญชี X-1139 ผ่านตู้ TMBA ATM ค่าธรรมเนียม 20.00 บาท วันที่ 05/07/2025 @20:45]',
    reads: spent(290000, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SCB Connect on LINE)',
    title: 'SCB Connect',
    body: '[หักภาษีเงินได้ สำหรับดอกเบี้ยเงินฝาก 47.19 บาท จากบัญชี X-1139 วันที่ 25/06/2025]',
    reads: spent(4719, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SMS)',
    body: 'เงินโอน/เงินเดือน 220,910.70บ เข้าบ/ชx121139 27/06@02:03',
    reads: got(22091070, 'THB'),
  },
  // https://github.com/raidenyn/line-mcp/blob/HEAD/docs/superpowers/specs/2026-06-29-scb-templates-currency-aliases-design.md
  {
    country: 'TH',
    app: 'SCB (SMS)',
    body: 'หักค่าธรรมเนียมอัตโนมัติ 200.00 บ. จาก บ/ช x121139 วันที่ 01/07 เวลา 03:43',
    reads: spent(20000, 'THB'),
  },
  // https://github.com/next-dev-team/nestjs-next-boilerplate/blob/HEAD/TELEGRAM_BOT_README.md (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '$24.00 paid by SOK DARA (*208) on Dec 11, 12:01 PM via ABA PAY at SAMPLE SHOP by K.CHAN. Trx. ID: 176542930423491, APV: 875362',
    reads: got(2400, 'USD'),
  },
  // https://github.com/next-dev-team/nestjs-next-boilerplate/blob/HEAD/src/common/utils/invoice-parser.util.ts (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '៛43,500 paid by KEO SREYNEANG (*026) on Dec 11, 10:27 AM via ABA PAY at SAMPLE SHOP by K.CHAN. Remark: Food. Trx. ID: 176542365842864, APV: 812621.',
    reads: got(43500, 'KHR'),
  },
  // https://github.com/bunthorngnop/ABA/blob/HEAD/app/dashboard.py (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '$5.00 paid by CHAN SOPHEA (*298) on Aug 28, 08:55 PM via ABA KHQR (ACLEDA Bank Plc.) at SAMPLE MART D by S.VANNA. Trx. ID: 178792533376804, APV: 360850.',
    reads: got(500, 'USD'),
  },
  // https://github.com/HoutWill/khqr-payment-with-telegram-group/blob/HEAD/test/test-aba-real.js (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '$0.01 paid by DARA SOK (*774) on Aug 22, 03:31 PM via ABA KHQR (BKRTKHPPXXX) at SOK DARA. Trx. ID: 1787389102',
    reads: got(1, 'USD'),
  },
  // https://github.com/HoutWill/khqr-payment-with-telegram-group/blob/HEAD/test/test-aba-real.js (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '៛12,000 paid by MENG LINA (*493) on Aug 22, 02:39 PM via ABA PAY at CHHAY KIM. Trx. ID: 17873843',
    reads: got(12000, 'KHR'),
  },
  // https://github.com/tangheng05/checksen/blob/HEAD/research_notes/Cambodia%20scam%20message%20data/legit_message_formats.md
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: '$2.70 paid by CUSTOMER (*098) on Sep 05, 04:09 PM via ABA PAY at MERCHANT. Remark:  . Trx. ID: 178859934628331, APV: 964372.',
    reads: got(270, 'USD'),
  },
  // https://github.com/samchanpanha/car_project7/blob/HEAD/src/lib/api/aba-parser.ts (names and numbers changed)
  {
    country: 'KH',
    app: 'ABA PayWay (merchant alert, Telegram)',
    body: 'PayWay by ABA: ៛200 paid by Sok Dara (*674) on Oct 22, 01:05 PM via ABA KHQR (AMRTKHPPXXX) at SOK DARA. Trx. ID: 179264913984347, APV: 135160.',
    reads: got(200, 'KHR'),
  },
  // https://github.com/heangdeniss/aba_sum_bot/blob/HEAD/bot.py (names and numbers changed)
  {
    country: 'KH',
    app: 'ACLEDA',
    body: 'Received 6,000 KHR from 081 *** 854 SOK DARA, 08-Mar-2026 11:13AM...',
    reads: got(6000, 'KHR'),
  },
  // https://github.com/heangdeniss/aba_sum_bot/blob/HEAD/bot.py (names and numbers changed)
  {
    country: 'KH',
    app: 'ACLEDA',
    body: 'Received 7,000 KHR from CHAN SOPHEA,ABA Bank by KHQR,on 08-Mar-2026 11:23AM...',
    reads: got(7000, 'KHR'),
  },
];
