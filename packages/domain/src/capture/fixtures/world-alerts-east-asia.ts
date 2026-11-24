import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from East Asia, as public sources quote them (`world-alerts`). */
export const EAST_ASIA_ALERTS: readonly WorldAlertSample[] = [
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPayカード (PayPay app)',
    title: '支払いが完了しました。',
    body: '店舗名：PayPay商店\n金額: 1,000円\n支払日: 2026年4月20日',
    reads: spent(1000, 'JPY'),
  },
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPay',
    title: '5,000円が届いています',
    body: 'たろうさんからの5,000円を受け取りますか？',
    reads: skipped('unread'),
  },
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPay',
    body: '〇〇さんが500円を受け取りました',
    reads: spent(500, 'JPY'),
  },
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPay',
    title: '別の端末がログインしようとしています',
    body: 'ご自身の操作の場合はタップして認証コードを入力してください',
    reads: skipped('code'),
  },
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPay',
    title: '有効期限は4/1まで！',
    body: '500ptの期間限定ポイントを期限前に使おう',
    reads: skipped(),
  },
  // https://paypay.ne.jp/article/push-notification/
  {
    country: 'JP',
    app: 'PayPay',
    title: '4月30日まで！あなたは対象',
    body: '最大30％戻ってくるクーポンを今すぐ獲得しよう （※ 条件・上限あり）',
    reads: skipped('promo'),
  },
  // https://www.smbc.co.jp/kojin/mailannai/mailinfo/sample_1.html
  {
    country: 'JP',
    app: '三井住友銀行',
    title: '【三井住友銀行】振込入金のお知らせ',
    body: 'ワカクサ　タロウさま\n三井住友銀行より、以下の振込入金についてお知らせします。\n入金口座：○○支店　普通　口座番号○○○○○○○\n入金日：○○年○月○日\n金額：123,456円\n内容：振込　カ）ミツイスミトモギンコウ\n○年○月○日○時○分現在（配信番号：○○○○○○○−○○○○）',
    reads: got(123456, 'JPY'),
  },
  // https://www.smbc.co.jp/kojin/mailannai/mailinfo/sample_6.html
  {
    country: 'JP',
    app: '三井住友銀行',
    title: '【三井住友銀行】口座出金通知のお知らせ',
    body: 'ワカクサ　タロウさま\n三井住友銀行より、キャッシュカードでの出金についてお知らせします。\n出金日：○○年○月○日\n出金額：123,456円\n内容：カード\n○年○月○日○時○分現在（配信番号：○○○○○○○−○○○○）',
    reads: spent(123456, 'JPY'),
  },
  // https://www.smbc.co.jp/kojin/mailannai/mailinfo/sample_4.html
  {
    country: 'JP',
    app: '三井住友銀行',
    title: '【三井住友銀行】口座引き落とし未済のお知らせ',
    body: 'ワカクサ　タロウさま\n三井住友銀行より、夜間の初回口座引き落とし時に、残高不足等の理由によりお手続ができなかった旨、ご連絡します。\n口座引落日：○○年○月○日\n◆引き落としできなかった明細\n引落金額：10,000円\n内容：○○カード　(カ\n再引落日：○○年○月○日',
    reads: skipped('failed'),
  },
  // https://www.smbc.co.jp/kojin/mailannai/mailinfo/sample_4.html
  {
    country: 'JP',
    app: '三井住友銀行',
    title: '【三井住友銀行】口座引き落としの事前お知らせ',
    body: 'ワカクサ　タロウさま\n三井住友銀行より、以下の口座引き落としについて事前にお知らせします。\n口座引落予定日：○○年○月○日\n◆明細1\n引落金額：123,456円\n内容：○○ケイタイ',
    reads: skipped('balance'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KB%EA%B5%AD%EB%AF%BC%EC%9D%80%ED%96%89%EC%9D%80-kr_15791 (names and numbers changed)
  {
    country: 'KR',
    app: 'KB국민카드 (체크)',
    body: '[Web발신] KB국민체크(4821) 홍*동님 11/14 11:36 68,990원 쿠팡(쿠페이) 사용',
    reads: spent(68990, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%82%BC%EC%84%B1%EC%B9%B4%EB%93%9C-kr_16207 (names and numbers changed)
  {
    country: 'KR',
    app: '삼성카드',
    body: '[Web발신] 삼성8222승인 박* 732,710원 12개월 10/28 12:17 지자체세입금 누적2,550,680원',
    reads: spent(732710, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EB%86%8D%ED%98%91%EC%9D%80%ED%96%89-kr_15825 (names and numbers changed)
  {
    country: 'KR',
    app: '삼성카드',
    body: '삼성1476승인 김* 100원 일시불 01/09 20:07 세븐일레븐아산음 누적80,090원',
    reads: spent(100, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823
  {
    country: 'KR',
    app: '신한카드 (체크)',
    body: '[Web발신] [신한체크승인] 김*투(9306) 10/24 18:12 (금액)81,450원 (유)청정베스트식자재할인마',
    reads: spent(81450, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823
  {
    country: 'KR',
    app: '신한카드 (체크)',
    body: '[Web발신] 신한체크해외승인 김*투(9306) 10/16 16:00 14.99 달러 (US)GOOGLE *Ya',
    reads: spent(1499, 'USD'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823
  {
    country: 'KR',
    app: '신한카드 (체크)',
    body: '[Web발신] 신한체크해외승인 김*투(9306) 10/12 16:59 RUB 299.00 (RU)MORE TV',
    reads: spent(29900, 'RUB'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823 (names and numbers changed)
  {
    country: 'KR',
    app: '신한은행',
    body: '[Web발신] 신한11/14 22:42 110-530-482913 출금 10,450 잔액 136,269 유튜브프리미엄',
    reads: spent(10450, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823 (names and numbers changed)
  {
    country: 'KR',
    app: '신한은행',
    body: '[Web발신] 신한12/13 18:26 110-530-482913 입금 500,000 잔액 514,112 홍길동',
    reads: got(500000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%8B%A0%ED%95%9C-kr_15823 (names and numbers changed)
  {
    country: 'KR',
    app: '신한은행',
    body: '[Web발신] [신한은행]07/08 10:35:14 [110-***-543030] 출금 2,210,000원 (홍길동)',
    reads: spent(2210000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KEB%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-kr_15681 (names and numbers changed)
  {
    country: 'KR',
    app: '하나은행',
    body: '[Web발신] 하나,08/31,09:54 215******36307 입금420,000원 홍길동 잔액437,892원',
    reads: got(420000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KEB%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-kr_15681
  {
    country: 'KR',
    app: '하나은행',
    body: '[Web발신] 하나,09/11,02:37 215******36307 출금40,000원 한패스　　　　　 잔액201,610원',
    reads: spent(40000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KEB%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-kr_15681
  {
    country: 'KR',
    app: '하나은행',
    body: '[Web발신] HANABANK,11/23,04:34 339******40007 W/D:20,000 1234567890 Bal.:1,316,760',
    reads: spent(20000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KEB%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-kr_15681 (names and numbers changed)
  {
    country: 'KR',
    app: '하나은행',
    body: '[Web발신] HANABANK,12/05,17:03 339******40007 Dep.:297,000 홍길동 Bal.:1,345,083',
    reads: got(297000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EB%86%8D%ED%98%91%EC%9D%80%ED%96%89-kr_15825
  {
    country: 'KR',
    app: 'NH농협은행',
    body: '[Web발신] 농협07/22 20:18  352-****-4054-93  자동출금16,421원 (LGU+인터넷)  잔액51,089원',
    reads: spent(16421, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EB%86%8D%ED%98%91%EC%9D%80%ED%96%89-kr_15825 (names and numbers changed)
  {
    country: 'KR',
    app: 'NH농협은행',
    body: '[Web발신]  농협 입금73,000원  08/14 23:34  352-****-4054-93  홍길동  잔액123,189원',
    reads: got(73000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%9A%B0%EB%A6%AC%EC%9D%80%ED%96%89-kr_15682
  {
    country: 'KR',
    app: '우리은행',
    body: '[Web발신] WOORI 07/29 [11:24] *629644 PAY 25,000WON 아마레 BAL 7,960WON',
    reads: spent(25000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%EC%9A%B0%EB%A6%AC%EC%9D%80%ED%96%89-kr_15682
  {
    country: 'KR',
    app: '우리은행',
    body: '우리 06/20 11:20 *954950 입금 472원 예금결산 잔액 1,199,234원',
    reads: got(472, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/IBK%EA%B8%B0%EC%97%85%EC%9D%80%ED%96%89-kr_15826 (names and numbers changed)
  {
    country: 'KR',
    app: 'IBK기업은행',
    body: '[Web발신] 2021/08/17 19:00 입금 1,000원. 잔액 1,014,145원 홍길동 665***08301015 기업',
    reads: got(1000, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/KEB%ED%95%98%EB%82%98%EC%9D%80%ED%96%89-kr_15681
  {
    country: 'KR',
    app: '쿠팡페이 (하나 체크카드)',
    body: '쿠팡페이(쿠팡이 / 체크카드(일시불) / 05.09 13:14 ║ (결제) 33,900원',
    reads: spent(33900, 'KRW'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ICBC-cn_15688 (names and numbers changed)
  {
    country: 'CN',
    app: '工商银行',
    body: '您尾号1740卡9月22日23:14快捷支付支出(消费支付宝-张三)10元，余额2,826.63元。【工商银行】',
    reads: spent(1000, 'CNY'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ICBC-cn_15688
  {
    country: 'CN',
    app: '工商银行',
    body: '您尾号1740卡9月20日10:15ATM收入(现存)3,000元，余额3,006元。【工商银行】',
    reads: got(300000, 'CNY'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%E4%B8%AD%E5%9C%8B%E8%BE%B2%E6%A5%AD%E9%8A%80%E8%A1%8C-cn_15635
  {
    country: 'CN',
    app: '农业银行',
    body: '【中国农业银行】您尾号6776账户09月06日18:08完成支付宝交易人民币-19.80，余额26053.49。',
    reads: spent(1980, 'CNY'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/%E4%B8%AD%E5%9C%8B%E8%BE%B2%E6%A5%AD%E9%8A%80%E8%A1%8C-cn_15635 (names and numbers changed)
  {
    country: 'CN',
    app: '农业银行',
    body: '【中国农业银行】张三于09月05日20:40向您尾号6776账户完成转存交易人民币5000.00，余额26073.29。',
    reads: got(500000, 'CNY'),
  },
  // https://github.com/Kilerd/blog/blob/d0ea21e2c390b0005c19ff8fd84e1d61b462098c/src/content/posts/iphone-sms-financial-worker.md (names and numbers changed)
  {
    country: 'CN',
    app: '招商银行',
    body: '【招商银行】您账户0000于04月09日06:43在【支付宝-星巴克】快捷支付114.15元，余额9999.99',
    reads: spent(11415, 'CNY'),
  },
  // https://github.com/a2244921700-code/blue-whale-keeper/blob/27acec429c5b0f50d1f653d51498af9cdff3a23c/app/src/main/java/com/moneydafeiyu/ledger/capture/ParserTestSamples.kt (names and numbers changed)
  {
    country: 'CN',
    app: '招商银行',
    body: '您账户8473于10月10日23:04在【支付宝-消费-张三】发生快捷支付扣款0.08元',
    reads: spent(8, 'CNY'),
  },
  // https://github.com/a2244921700-code/blue-whale-keeper/blob/27acec429c5b0f50d1f653d51498af9cdff3a23c/app/src/main/java/com/moneydafeiyu/ledger/capture/ParserTestSamples.kt
  {
    country: 'CN',
    app: '支付宝',
    title: '交易提醒',
    body: '你有一笔0.08元的支出，点击领取6个支付宝积分。',
    reads: spent(8, 'CNY'),
  },
  // https://github.com/Auto-Accounting/AutoRule/blob/main/src/rule/app/%E6%94%AF%E4%BB%98%E5%AE%9D%E6%B6%88%E6%81%AF%E7%9B%92%E5%AD%90/tests/%E6%94%AF%E4%BB%98%E5%AE%9D%E8%BD%AC%E8%B4%A6%E6%94%B6%E6%AC%BE.txt (names and numbers changed)
  {
    country: 'CN',
    app: '支付宝',
    title: '收到一笔转账',
    body: '收到一笔转账 10月13日 0.01元 付款人：张三 185******30',
    reads: got(1, 'CNY'),
  },
  // https://github.com/Auto-Accounting/AutoRule/blob/main/src/rule/app/%E6%94%AF%E4%BB%98%E5%AE%9D%E6%B6%88%E6%81%AF%E7%9B%92%E5%AD%90/tests/%E6%94%AF%E4%BB%98%E5%AE%9D%E6%94%B6%E6%AC%BE%E7%A0%81%E6%94%B6%E6%AC%BE.txt
  {
    country: 'CN',
    app: '支付宝',
    title: '支付宝商家服务',
    body: '收款金额￥0.01',
    reads: got(1, 'CNY'),
  },
  // https://www.foi.org.tw/Article.aspx?Lang=1&Arti=11062&k=&ClassId=&p=1 (names and numbers changed)
  {
    country: 'TW',
    app: 'A銀行 (bank anonymised by source)',
    body: 'A銀行○○卡末四碼1234網路交易USD＄1,200元，認證碼4829135分鐘有效。勿將密碼告知他人以防詐騙',
    reads: skipped('code'),
  },
  // https://www.ptt.cc/bbs/creditcard/M.1717060936.A.273.html (names and numbers changed)
  {
    country: 'TW',
    app: 'A銀行 (bank anonymised by source)',
    body: 'A銀行卡末四碼1234網路交易金額約TRY 50000.00元，交易認證碼123於六分鐘後失效。提醒您，勿將密碼交付他人以防詐騙',
    reads: skipped('code'),
  },
];

/**
 * Alerts from East Asia in the shape a parser's own test data gives them, its names made up:
 * the wording is not confirmed as captured, so these are tested as pattern cases.
 */
export const EAST_ASIA_SHAPES: readonly WorldAlertSample[] = [
  // https://github.com/chinatsu-yan/boc-sms-ledger/blob/main/README.md (names and numbers changed)
  {
    country: 'CN',
    app: '中国银行',
    body: '您的借记卡账户8246，于08月17日收入(公积金)(提取托付)人民币720.00元，交易后余额3150.20【中国银行】',
    reads: got(72000, 'CNY'),
  },
  // https://github.com/chinatsu-yan/boc-sms-ledger/blob/main/core/src/main/kotlin/local/boc/ledger/BocParser.kt (names and numbers changed)
  {
    country: 'CN',
    app: '中国银行',
    body: '您的借记卡账户7304，于06月19日手机银行支取(跨行支付)人民币200.00元,交易后余额18776.00【中国银行】',
    reads: spent(20000, 'CNY'),
  },
  // https://github.com/chinatsu-yan/boc-sms-ledger/blob/main/core/src/main/kotlin/local/boc/ledger/BocParser.kt (names and numbers changed)
  {
    country: 'CN',
    app: '中国银行',
    body: '您的信用卡4826于2026年06月01日，在SYNTH_STORE消费USD20.00元。【中国银行】',
    reads: spent(2000, 'USD'),
  },
  // https://github.com/chinatsu-yan/boc-sms-ledger/blob/main/core/src/test/kotlin/local/boc/ledger/LedgerTest.kt (names and numbers changed)
  {
    country: 'CN',
    app: '中国银行',
    body: '您的信用卡4444于2025年04月07日，在DEMO-SHOP撤销TWD2,360.00元。【中国银行】',
    reads: got(2360, 'TWD'),
  },
  // https://github.com/chinatsu-yan/boc-sms-ledger/blob/main/core/src/test/kotlin/local/boc/ledger/LedgerTest.kt (names and numbers changed)
  {
    country: 'CN',
    app: '中国银行',
    body: '您的信用卡4444于2025年04月19日成功退货HKD38.50元【中国银行】',
    reads: got(3850, 'HKD'),
  },
];
