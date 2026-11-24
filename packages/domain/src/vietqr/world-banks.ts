/**
 * The main banks and wallets of the countries 6pm's people come from or travel to, most used first
 * in each (an editorial order from public customer counts and app-store rankings, not a
 * measurement), then wallets used everywhere. One row each: `country|code|everyday name|registered
 * name|kind`, the country ISO 3166-1 alpha-2 and `*` for everywhere. Codes are the country and the
 * bank's short code ("US.CHASE"), so none can be read as a Vietnamese bank's.
 *
 * Names only: 6pm pays nothing from these apps, so it keeps no link to open them.
 */
export const WORLD_DIRECTORY = `
US|US.CHASE|Chase|JPMorgan Chase Bank|bank
US|US.BOFA|Bank of America|Bank of America|bank
US|US.WELLSFARGO|Wells Fargo|Wells Fargo Bank|bank
US|US.CAPITALONE|Capital One|Capital One|bank
US|US.CITI|Citi|Citibank|bank
US|US.USBANK|U.S. Bank|U.S. Bank|bank
US|US.PNC|PNC|PNC Bank|bank
US|US.TRUIST|Truist|Truist Bank|bank
US|US.TDBANK|TD Bank|TD Bank, N.A.|bank
US|US.NAVYFED|Navy Federal|Navy Federal Credit Union|bank
US|US.USAA|USAA|USAA Federal Savings Bank|bank
US|US.AMEX|American Express|American Express|bank
US|US.DISCOVER|Discover|Discover Bank|bank
US|US.CHIME|Chime|Chime|bank
US|US.SOFI|SoFi|SoFi Bank|bank
US|US.ALLY|Ally|Ally Bank|bank
US|US.VENMO|Venmo|Venmo|wallet
US|US.CASHAPP|Cash App|Cash App|wallet
CA|CA.RBC|RBC|Royal Bank of Canada|bank
CA|CA.TD|TD|TD Canada Trust|bank
CA|CA.SCOTIA|Scotiabank|Bank of Nova Scotia|bank
CA|CA.BMO|BMO|Bank of Montreal|bank
CA|CA.CIBC|CIBC|Canadian Imperial Bank of Commerce|bank
CA|CA.DESJARDINS|Desjardins|Desjardins|bank
CA|CA.NBC|National Bank|National Bank of Canada|bank
CA|CA.TANGERINE|Tangerine|Tangerine Bank|bank
CA|CA.SIMPLII|Simplii|Simplii Financial|bank
CA|CA.EQBANK|EQ Bank|Equitable Bank|bank
CA|CA.WEALTHSIMPLE|Wealthsimple|Wealthsimple|bank
CA|CA.KOHO|KOHO|KOHO Financial|wallet
CA|CA.NEO|Neo Financial|Neo Financial|bank
CA|CA.PCFINANCIAL|PC Financial|President’s Choice Financial|bank
CA|CA.ATB|ATB|ATB Financial|bank
CA|CA.AMEX|Amex Canada|Amex Bank of Canada|bank
GB|GB.BARCLAYS|Barclays|Barclays Bank|bank
GB|GB.LLOYDS|Lloyds|Lloyds Bank|bank
GB|GB.HSBC|HSBC UK|HSBC UK Bank|bank
GB|GB.NATWEST|NatWest|National Westminster Bank|bank
GB|GB.SANTANDER|Santander UK|Santander UK|bank
GB|GB.NATIONWIDE|Nationwide|Nationwide Building Society|bank
GB|GB.HALIFAX|Halifax|Halifax|bank
GB|GB.MONZO|Monzo|Monzo Bank|bank
GB|GB.STARLING|Starling|Starling Bank|bank
GB|GB.CHASE|Chase UK|J.P. Morgan Europe|bank
GB|GB.FIRSTDIRECT|first direct|first direct|bank
GB|GB.TSB|TSB|TSB Bank|bank
GB|GB.VIRGIN|Virgin Money|Virgin Money UK|bank
GB|GB.RBS|Royal Bank of Scotland|The Royal Bank of Scotland|bank
GB|GB.BOS|Bank of Scotland|Bank of Scotland|bank
GB|GB.BARCLAYCARD|Barclaycard|Barclays Bank UK|bank
GB|GB.AMEX|Amex UK|American Express Services Europe|bank
IE|IE.AIB|AIB|Allied Irish Banks|bank
IE|IE.BOI|Bank of Ireland|Bank of Ireland|bank
IE|IE.PTSB|PTSB|Permanent TSB|bank
DE|DE.SPARKASSE|Sparkasse|Sparkasse|bank
DE|DE.VOLKSBANK|Volksbank|Volksbanken Raiffeisenbanken|bank
DE|DE.DEUTSCHE|Deutsche Bank|Deutsche Bank|bank
DE|DE.COMMERZBANK|Commerzbank|Commerzbank|bank
DE|DE.ING|ING|ING-DiBa|bank
DE|DE.DKB|DKB|Deutsche Kreditbank|bank
DE|DE.POSTBANK|Postbank|Postbank|bank
DE|DE.COMDIRECT|comdirect|comdirect|bank
DE|DE.N26|N26|N26 Bank|bank
DE|DE.TRADEREPUBLIC|Trade Republic|Trade Republic Bank|bank
DE|DE.CONSORS|Consorsbank|Consorsbank|bank
DE|DE.C24|C24|C24 Bank|bank
DE|DE.SPARDA|Sparda-Bank|Sparda-Banken|bank
DE|DE.TARGOBANK|TARGOBANK|TARGOBANK|bank
DE|DE.NORISBANK|norisbank|norisbank|bank
FR|FR.CA|Crédit Agricole|Crédit Agricole|bank
FR|FR.BNP|BNP Paribas|BNP Paribas|bank
FR|FR.SG|Société Générale|Société Générale|bank
FR|FR.CM|Crédit Mutuel|Crédit Mutuel|bank
FR|FR.LBP|La Banque Postale|La Banque Postale|bank
FR|FR.CE|Caisse d’Épargne|Caisse d’Épargne|bank
FR|FR.BP|Banque Populaire|Banque Populaire|bank
FR|FR.LCL|LCL|Le Crédit Lyonnais|bank
FR|FR.BOURSO|BoursoBank|BoursoBank|bank
FR|FR.LYDIA|Lydia|Lydia|wallet
FR|FR.CIC|CIC|Crédit Industriel et Commercial|bank
FR|FR.HELLOBANK|Hello bank!|BNP Paribas|bank
FR|FR.FORTUNEO|Fortuneo|Fortuneo|bank
FR|FR.NICKEL|Nickel|Financière des Paiements Électroniques|bank
FR|FR.WERO|Wero|European Payments Initiative|wallet
NL|NL.ING|ING|ING Bank|bank
NL|NL.RABOBANK|Rabobank|Rabobank|bank
NL|NL.ABNAMRO|ABN AMRO|ABN AMRO Bank|bank
NL|NL.BUNQ|bunq|bunq|bank
NL|NL.SNS|SNS|SNS Bank|bank
NL|NL.ASN|ASN Bank|ASN Bank|bank
NL|NL.REGIO|RegioBank|RegioBank|bank
NL|NL.KNAB|Knab|Knab|bank
NL|NL.TRIODOS|Triodos|Triodos Bank|bank
NL|NL.TIKKIE|Tikkie|ABN AMRO|wallet
ES|ES.SANTANDER|Santander|Banco Santander|bank
ES|ES.BBVA|BBVA|Banco Bilbao Vizcaya Argentaria|bank
ES|ES.CAIXABANK|CaixaBank|CaixaBank|bank
ES|ES.SABADELL|Sabadell|Banco Sabadell|bank
ES|ES.BANKINTER|Bankinter|Bankinter|bank
ES|ES.BIZUM|Bizum|Bizum|wallet
ES|ES.ING|ING España|ING España|bank
ES|ES.IMAGIN|imagin|imaginBank|bank
ES|ES.OPENBANK|Openbank|Open Bank|bank
ES|ES.UNICAJA|Unicaja|Unicaja Banco|bank
ES|ES.ABANCA|ABANCA|ABANCA Corporación Bancaria|bank
ES|ES.RURALVIA|Ruralvía|Caja Rural|bank
IT|IT.INTESA|Intesa Sanpaolo|Intesa Sanpaolo|bank
IT|IT.UNICREDIT|UniCredit|UniCredit|bank
IT|IT.POSTE|BancoPosta|Poste Italiane|bank
IT|IT.BPM|Banco BPM|Banco BPM|bank
IT|IT.BPER|BPER|BPER Banca|bank
IT|IT.FINECO|Fineco|FinecoBank|bank
IT|IT.SATISPAY|Satispay|Satispay|wallet
IT|IT.ING|ING Italia|ING Italia|bank
IT|IT.BNL|BNL|Banca Nazionale del Lavoro|bank
IT|IT.MEDIOLANUM|Mediolanum|Banca Mediolanum|bank
IT|IT.MPS|MPS|Banca Monte dei Paschi di Siena|bank
IT|IT.ISYBANK|isybank|isybank|bank
IT|IT.HYPE|HYPE|HYPE|bank
IT|IT.BBVA|BBVA Italia|BBVA Italia|bank
IT|IT.BANCOMATPAY|Bancomat Pay|Bancomat|wallet
AU|AU.CBA|CommBank|Commonwealth Bank of Australia|bank
AU|AU.WESTPAC|Westpac|Westpac Banking Corporation|bank
AU|AU.ANZ|ANZ|Australia and New Zealand Banking Group|bank
AU|AU.NAB|NAB|National Australia Bank|bank
AU|AU.ING|ING|ING Australia|bank
AU|AU.MACQUARIE|Macquarie|Macquarie Bank|bank
AU|AU.BENDIGO|Bendigo Bank|Bendigo and Adelaide Bank|bank
AU|AU.UP|Up|Up|bank
AU|AU.UBANK|ubank|ubank|bank
AU|AU.BANKWEST|Bankwest|Bankwest|bank
AU|AU.STGEORGE|St.George|St.George Bank|bank
AU|AU.SUNCORP|Suncorp Bank|Suncorp Bank|bank
AU|AU.BOQ|BOQ|Bank of Queensland|bank
AU|AU.MEBANK|ME Bank|ME Bank|bank
AU|AU.HSBC|HSBC Australia|HSBC Bank Australia|bank
AU|AU.AMEX|Amex Australia|American Express Australia|bank
AU|AU.GREATSOUTHERN|Great Southern Bank|Great Southern Bank|bank
NZ|NZ.ANZ|ANZ|ANZ Bank New Zealand|bank
NZ|NZ.ASB|ASB|ASB Bank|bank
NZ|NZ.BNZ|BNZ|Bank of New Zealand|bank
NZ|NZ.WESTPAC|Westpac|Westpac New Zealand|bank
NZ|NZ.KIWIBANK|Kiwibank|Kiwibank|bank
NZ|NZ.COOP|Co-operative Bank|The Co-operative Bank|bank
SG|SG.DBS|DBS|DBS Bank|bank
SG|SG.POSB|POSB|POSB Bank|bank
SG|SG.OCBC|OCBC|Oversea-Chinese Banking Corporation|bank
SG|SG.UOB|UOB|United Overseas Bank|bank
SG|SG.SCB|Standard Chartered|Standard Chartered Bank (Singapore)|bank
SG|SG.TRUST|Trust Bank|Trust Bank Singapore|bank
SG|SG.GXS|GXS Bank|GXS Bank|bank
SG|SG.GRABPAY|GrabPay|GrabPay|wallet
SG|SG.PAYLAH|PayLah!|DBS Bank|wallet
SG|SG.MARIBANK|MariBank|MariBank Singapore|bank
SG|SG.CITI|Citibank SG|Citibank Singapore|bank
SG|SG.CIMB|CIMB SG|CIMB Bank Singapore|bank
SG|SG.AMEX|Amex Singapore|American Express Singapore|bank
SG|SG.YOUTRIP|YouTrip|YouTrip|wallet
MY|MY.MAYBANK|Maybank|Malayan Banking Berhad|bank
MY|MY.CIMB|CIMB|CIMB Bank|bank
MY|MY.PUBLIC|Public Bank|Public Bank Berhad|bank
MY|MY.RHB|RHB|RHB Bank|bank
MY|MY.HLB|Hong Leong Bank|Hong Leong Bank|bank
MY|MY.AMBANK|AmBank|AmBank|bank
MY|MY.BANKISLAM|Bank Islam|Bank Islam Malaysia|bank
MY|MY.TNG|Touch ’n Go eWallet|Touch ’n Go eWallet|wallet
MY|MY.BOOST|Boost|Boost|wallet
MY|MY.BSN|BSN|Bank Simpanan Nasional|bank
MY|MY.GXBANK|GXBank|GX Bank|bank
MY|MY.UOB|UOB Malaysia|United Overseas Bank (Malaysia)|bank
MY|MY.HSBC|HSBC Malaysia|HSBC Bank Malaysia|bank
MY|MY.AEONBANK|AEON Bank|AEON Bank (M)|bank
MY|MY.BOOSTBANK|Boost Bank|Boost Bank|bank
MY|MY.BIGPAY|BigPay|BigPay|wallet
MY|MY.RYT|Ryt Bank|Ryt Bank|bank
TH|TH.KBANK|K PLUS|Kasikornbank|bank
TH|TH.SCB|SCB|Siam Commercial Bank|bank
TH|TH.BBL|Bangkok Bank|Bangkok Bank|bank
TH|TH.KTB|Krungthai|Krung Thai Bank|bank
TH|TH.KRUNGSRI|Krungsri|Bank of Ayudhya|bank
TH|TH.TTB|ttb|TMBThanachart Bank|bank
TH|TH.GSB|GSB|Government Savings Bank|bank
TH|TH.TRUEMONEY|TrueMoney|TrueMoney Wallet|wallet
TH|TH.PAOTANG|Paotang|Krung Thai Bank|wallet
TH|TH.MAKE|MAKE by KBank|Kasikornbank|bank
TH|TH.BAAC|BAAC|Bank for Agriculture and Agricultural Cooperatives|bank
TH|TH.UOB|UOB Thailand|United Overseas Bank (Thai)|bank
TH|TH.DIME|Dime|Kiatnakin Phatra Bank|bank
TH|TH.CARDX|CardX|CardX|bank
ID|ID.BCA|BCA|Bank Central Asia|bank
ID|ID.MANDIRI|Mandiri|Bank Mandiri|bank
ID|ID.BRI|BRI|Bank Rakyat Indonesia|bank
ID|ID.BNI|BNI|Bank Negara Indonesia|bank
ID|ID.CIMBNIAGA|CIMB Niaga|Bank CIMB Niaga|bank
ID|ID.JAGO|Jago|Bank Jago|bank
ID|ID.GOPAY|GoPay|GoPay|wallet
ID|ID.OVO|OVO|OVO|wallet
ID|ID.DANA|DANA|DANA|wallet
ID|ID.SHOPEEPAY|ShopeePay|ShopeePay|wallet
ID|ID.MYBCA|myBCA|Bank Central Asia|bank
ID|ID.BSI|BSI|Bank Syariah Indonesia|bank
ID|ID.SEABANK|SeaBank|Bank Seabank Indonesia|bank
ID|ID.BLU|blu|BCA Digital|bank
ID|ID.LINKAJA|LinkAja|Fintek Karya Nusantara|wallet
ID|ID.PERMATA|PermataBank|Bank Permata|bank
ID|ID.OCBC|OCBC Indonesia|Bank OCBC NISP|bank
PH|PH.BDO|BDO|BDO Unibank|bank
PH|PH.BPI|BPI|Bank of the Philippine Islands|bank
PH|PH.METROBANK|Metrobank|Metropolitan Bank and Trust Company|bank
PH|PH.LANDBANK|Landbank|Land Bank of the Philippines|bank
PH|PH.SECURITY|Security Bank|Security Bank|bank
PH|PH.UNIONBANK|UnionBank|Union Bank of the Philippines|bank
PH|PH.GCASH|GCash|GCash|wallet
PH|PH.MAYA|Maya|Maya|wallet
PH|PH.GOTYME|GoTyme|GoTyme Bank|bank
PH|PH.BDOPAY|BDO Pay|BDO Unibank|wallet
PH|PH.SEABANK|MariBank PH|MariBank Philippines|bank
PH|PH.RCBC|RCBC|Rizal Commercial Banking Corporation|bank
PH|PH.CIMB|CIMB PH|CIMB Bank Philippines|bank
PH|PH.EASTWEST|EastWest|East West Banking Corporation|bank
PH|PH.TONIK|Tonik|Tonik Digital Bank|bank
KH|KH.ABA|ABA|Advanced Bank of Asia|bank
KH|KH.ACLEDA|ACLEDA|ACLEDA Bank|bank
KH|KH.CANADIA|Canadia|Canadia Bank|bank
KH|KH.WING|Wing|Wing Bank|wallet
KH|KH.BAKONG|Bakong|National Bank of Cambodia|wallet
KH|KH.PRASAC|PRASAC|KB PRASAC Bank|bank
KH|KH.AMK|AMK Bank|AMK Bank|bank
KH|KH.PPCB|PPCBank|Phnom Penh Commercial Bank|bank
KH|KH.AMRET|Amret|Amret|bank
KH|KH.TRUEMONEY|TrueMoney Cambodia|TrueMoney Cambodia|wallet
LA|LA.BCEL|BCEL|Banque pour le Commerce Extérieur Lao|bank
LA|LA.LDB|LDB|Lao Development Bank|bank
LA|LA.APB|APB|Agricultural Promotion Bank|bank
LA|LA.IB|Indochina Bank|Indochina Bank|bank
LA|LA.MMONEY|M-Money|Lao Telecom|wallet
LA|LA.UMONEY|U-Money|Unitel|wallet
KR|KR.KB|KB Kookmin|KB Kookmin Bank|bank
KR|KR.SHINHAN|Shinhan|Shinhan Bank|bank
KR|KR.WOORI|Woori|Woori Bank|bank
KR|KR.HANA|Hana|Hana Bank|bank
KR|KR.NH|NH NongHyup|NongHyup Bank|bank
KR|KR.IBK|IBK|Industrial Bank of Korea|bank
KR|KR.KAKAOBANK|KakaoBank|KakaoBank|bank
KR|KR.TOSSBANK|Toss Bank|Toss Bank|bank
KR|KR.TOSS|Toss|Toss|wallet
KR|KR.KAKAOPAY|Kakao Pay|Kakao Pay|wallet
KR|KR.NAVERPAY|Naver Pay|Naver Pay|wallet
KR|KR.KBANK|K Bank|K Bank|bank
KR|KR.NHALLONE|NH All One Bank|NongHyup Bank|bank
KR|KR.SC|SC First Bank|Standard Chartered Bank Korea|bank
KR|KR.EPOST|Post Office Bank|Korea Post|bank
KR|KR.KBCARD|KB Pay|KB Kookmin Card|wallet
KR|KR.SHINHANCARD|Shinhan SOL Pay|Shinhan Card|wallet
KR|KR.HYUNDAICARD|Hyundai Card|Hyundai Card|bank
KR|KR.HANACARD|Hana Pay|Hana Card|wallet
JP|JP.MUFG|MUFG|MUFG Bank|bank
JP|JP.SMBC|SMBC|Sumitomo Mitsui Banking Corporation|bank
JP|JP.MIZUHO|Mizuho|Mizuho Bank|bank
JP|JP.YUCHO|Japan Post Bank|Japan Post Bank|bank
JP|JP.RAKUTEN|Rakuten Bank|Rakuten Bank|bank
JP|JP.RESONA|Resona|Resona Bank|bank
JP|JP.SONY|Sony Bank|Sony Bank|bank
JP|JP.PAYPAY|PayPay|PayPay|wallet
JP|JP.RAKUTENPAY|Rakuten Pay|Rakuten Pay|wallet
JP|JP.DBARAI|d Barai|d Barai|wallet
JP|JP.AUPAY|au PAY|au PAY|wallet
JP|JP.PAYPAYBANK|PayPay Bank|PayPay Bank|bank
JP|JP.DOCOMOSMTB|DOCOMO SMTB|DOCOMO SMTB Net Bank|bank
JP|JP.JIBUN|au Jibun Bank|au Jibun Bank|bank
JP|JP.SHINSEI|SBI Shinsei|SBI Shinsei Bank|bank
JP|JP.GMOAOZORA|GMO Aozora|GMO Aozora Net Bank|bank
JP|JP.VPASS|Vpass|Sumitomo Mitsui Card|bank
JP|JP.RAKUTENCARD|Rakuten Card|Rakuten Card|bank
CN|CN.ICBC|ICBC|Industrial and Commercial Bank of China|bank
CN|CN.CCB|CCB|China Construction Bank|bank
CN|CN.ABC|ABC|Agricultural Bank of China|bank
CN|CN.BOC|Bank of China|Bank of China|bank
CN|CN.BOCOM|BOCOM|Bank of Communications|bank
CN|CN.CMB|China Merchants Bank|China Merchants Bank|bank
CN|CN.PSBC|PSBC|Postal Savings Bank of China|bank
CN|CN.CITIC|China CITIC Bank|China CITIC Bank|bank
CN|CN.PINGAN|Ping An Bank|Ping An Bank|bank
CN|CN.ALIPAY|Alipay|Alipay|wallet
CN|CN.WECHATPAY|WeChat Pay|WeChat Pay|wallet
CN|CN.UNIONPAY|UnionPay|China UnionPay|wallet
CN|CN.ECNY|e-CNY|People’s Bank of China|wallet
HK|HK.HSBC|HSBC HK|The Hongkong and Shanghai Banking Corporation|bank
HK|HK.HANGSENG|Hang Seng|Hang Seng Bank|bank
HK|HK.BOCHK|BOCHK|Bank of China (Hong Kong)|bank
HK|HK.SCB|Standard Chartered|Standard Chartered Bank (Hong Kong)|bank
HK|HK.ZA|ZA Bank|ZA Bank|bank
HK|HK.MOX|Mox|Mox Bank|bank
HK|HK.PAYME|PayMe|PayMe|wallet
HK|HK.ALIPAYHK|AlipayHK|AlipayHK|wallet
HK|HK.OCTOPUS|Octopus|Octopus|wallet
HK|HK.LIVI|livi|livi bank|bank
HK|HK.AIRSTAR|airstar|Airstar Bank|bank
TW|TW.CTBC|CTBC|CTBC Bank|bank
TW|TW.CATHAY|Cathay United|Cathay United Bank|bank
TW|TW.FUBON|Taipei Fubon|Taipei Fubon Bank|bank
TW|TW.ESUN|E.SUN|E.SUN Bank|bank
TW|TW.POST|Chunghwa Post|Chunghwa Post|bank
TW|TW.MEGA|Mega Bank|Mega International Commercial Bank|bank
TW|TW.LINEPAY|LINE Pay|LINE Pay|wallet
TW|TW.JKOPAY|JKOPAY|JKOPAY|wallet
TW|TW.TAISHIN|Taishin|Taishin International Bank|bank
TW|TW.RICHART|Richart|Taishin International Bank|bank
TW|TW.FCB|First Bank|First Commercial Bank|bank
TW|TW.HNCB|Hua Nan Bank|Hua Nan Commercial Bank|bank
TW|TW.CHB|Chang Hwa Bank|Chang Hwa Commercial Bank|bank
TW|TW.YUANTA|Yuanta Bank|Yuanta Commercial Bank|bank
TW|TW.NEXTBANK|Next Bank|Next Commercial Bank|bank
TW|TW.IPASS|iPASS MONEY|iPASS|wallet
TW|TW.ESUNWALLET|E.SUN Wallet|E.SUN Bank|wallet
IN|IN.SBI|SBI|State Bank of India|bank
IN|IN.HDFC|HDFC Bank|HDFC Bank|bank
IN|IN.ICICI|ICICI Bank|ICICI Bank|bank
IN|IN.AXIS|Axis Bank|Axis Bank|bank
IN|IN.KOTAK|Kotak|Kotak Mahindra Bank|bank
IN|IN.PNB|PNB|Punjab National Bank|bank
IN|IN.BOB|Bank of Baroda|Bank of Baroda|bank
IN|IN.PHONEPE|PhonePe|PhonePe|wallet
IN|IN.GPAY|Google Pay|Google Pay|wallet
IN|IN.PAYTM|Paytm|Paytm|wallet
IN|IN.CANARA|Canara Bank|Canara Bank|bank
IN|IN.UNION|Union Bank|Union Bank of India|bank
IN|IN.BOI|Bank of India|Bank of India|bank
IN|IN.IDFC|IDFC FIRST|IDFC FIRST Bank|bank
IN|IN.INDUSIND|IndusInd|IndusInd Bank|bank
IN|IN.BHIM|BHIM|National Payments Corporation of India|wallet
IN|IN.CRED|CRED|Dreamplug Technologies|wallet
AE|AE.ENBD|Emirates NBD|Emirates NBD Bank|bank
AE|AE.FAB|FAB|First Abu Dhabi Bank|bank
AE|AE.ADCB|ADCB|Abu Dhabi Commercial Bank|bank
AE|AE.DIB|DIB|Dubai Islamic Bank|bank
AE|AE.ADIB|ADIB|Abu Dhabi Islamic Bank|bank
AE|AE.MASHREQ|Mashreq|Mashreq Bank|bank
AE|AE.WIO|Wio|Wio Bank|bank
AE|AE.EANDMONEY|e& money|Emirates Telecommunications|wallet
AE|AE.ZIINA|Ziina|Ziina|wallet
BD|BD.BKASH|bKash|bKash|wallet
BD|BD.NAGAD|Nagad|Nagad|wallet
BD|BD.DBBL|DBBL|Dutch-Bangla Bank|bank
BD|BD.ROCKET|Rocket|Dutch-Bangla Bank|wallet
BD|BD.ASTHA|BRAC Bank|BRAC Bank|bank
BD|BD.CITYTOUCH|City Bank|The City Bank|bank
BD|BD.UPAY|upay|UCB Fintech|wallet
BR|BR.NUBANK|Nubank|Nu Pagamentos|bank
BR|BR.ITAU|Itaú|Itaú Unibanco|bank
BR|BR.BRADESCO|Bradesco|Banco Bradesco|bank
BR|BR.BB|Banco do Brasil|Banco do Brasil|bank
BR|BR.CAIXA|Caixa|Caixa Econômica Federal|bank
BR|BR.SANTANDER|Santander Brasil|Banco Santander Brasil|bank
BR|BR.INTER|Inter|Banco Inter|bank
BR|BR.MERCADOPAGO|Mercado Pago|Mercado Pago|wallet
BR|BR.PICPAY|PicPay|PicPay|wallet
BR|BR.C6|C6 Bank|Banco C6|bank
BR|BR.PAGBANK|PagBank|PagSeguro|bank
BR|BR.CAIXATEM|Caixa Tem|Caixa Econômica Federal|wallet
BR|BR.SICOOB|Sicoob|Sicoob|bank
BR|BR.SICREDI|Sicredi|Sicredi|bank
BR|BR.NEON|Neon|Banco Neon|bank
BR|BR.INFINITEPAY|InfinitePay|CloudWalk|wallet
BR|BR.NOMAD|Nomad|Nomad|bank
CH|CH.UBS|UBS|UBS Switzerland|bank
CH|CH.POSTFINANCE|PostFinance|PostFinance|bank
CH|CH.RAIFFEISEN|Raiffeisen|Raiffeisen Schweiz|bank
CH|CH.ZKB|ZKB|Zürcher Kantonalbank|bank
CH|CH.TWINT|TWINT|TWINT|wallet
CH|CH.MIGROS|Migros Bank|Migros Bank|bank
CH|CH.BCV|BCV|Banque Cantonale Vaudoise|bank
CH|CH.VALIANT|Valiant|Valiant Bank|bank
CH|CH.YUH|Yuh|Swissquote and PostFinance|bank
CH|CH.NEON|neon Switzerland|neon Switzerland|bank
CH|CH.CEMBRA|Cembra|Cembra Money Bank|bank
CH|CH.VISECA|Viseca one|Viseca Payment Services|bank
CH|CH.SWISSCARD|Swisscard|Swisscard AECS|bank
KE|KE.MPESA|M-PESA|Safaricom|wallet
KE|KE.EQUITY|Equity Bank|Equity Bank|bank
KE|KE.KCB|KCB|KCB Bank|bank
KE|KE.COOP|Co-op Bank|Co-operative Bank of Kenya|bank
KE|KE.NCBA|NCBA|NCBA Bank|bank
KE|KE.DTB|DTB|Diamond Trust Bank|bank
MX|MX.BBVA|BBVA México|BBVA México|bank
MX|MX.SANTANDER|Santander México|Santander México|bank
MX|MX.BANORTE|Banorte|Banorte|bank
MX|MX.BANAMEX|Banamex|Banamex|bank
MX|MX.NU|Nu México|Nu México|bank
MX|MX.MERCADOPAGO|Mercado Pago México|Mercado Pago|wallet
MX|MX.AZTECA|Banco Azteca|Banco Azteca|bank
MX|MX.SPIN|Spin by OXXO|Spin by OXXO|wallet
MX|MX.BANCOPPEL|BanCoppel|BanCoppel|bank
MX|MX.INBURSA|Inbursa|Banco Inbursa|bank
MX|MX.KLAR|Klar|Klar|bank
MX|MX.STORI|Stori|Stori|bank
MX|MX.PLATA|Plata|Plata|bank
NG|NG.OPAY|OPay|OPay Digital Services|wallet
NG|NG.MONIEPOINT|Moniepoint|Moniepoint Microfinance Bank|bank
NG|NG.PALMPAY|PalmPay|PalmPay|wallet
NG|NG.GTB|GTBank|Guaranty Trust Bank|bank
NG|NG.ACCESS|Access Bank|Access Bank|bank
NG|NG.ZENITH|Zenith Bank|Zenith Bank|bank
NG|NG.FIRSTBANK|FirstBank|First Bank of Nigeria|bank
NG|NG.UBA|UBA|United Bank for Africa|bank
NG|NG.KUDA|Kuda|Kuda Microfinance Bank|bank
NG|NG.FAIRMONEY|FairMoney|FairMoney Microfinance Bank|bank
PK|PK.EASYPAISA|easypaisa|Easypaisa Microfinance Bank|wallet
PK|PK.JAZZCASH|JazzCash|Mobilink Microfinance Bank|wallet
PK|PK.HBL|HBL|Habib Bank Limited|bank
PK|PK.MEEZAN|Meezan Bank|Meezan Bank|bank
PK|PK.UBL|UBL|United Bank Limited|bank
PK|PK.MCB|MCB|MCB Bank|bank
PK|PK.ALFALAH|Bank Alfalah|Bank Alfalah|bank
PK|PK.SADAPAY|SadaPay|SadaPay|wallet
PK|PK.NAYAPAY|NayaPay|NayaPay|wallet
PL|PL.PKO|PKO BP|PKO Bank Polski|bank
PL|PL.PEKAO|Pekao|Bank Pekao|bank
PL|PL.MBANK|mBank|mBank|bank
PL|PL.ING|ING Polska|ING Bank Śląski|bank
PL|PL.ERSTE|Erste|Erste Bank Polska|bank
PL|PL.MILLENNIUM|Millennium|Bank Millennium|bank
PL|PL.ALIOR|Alior Bank|Alior Bank|bank
PL|PL.CA|Credit Agricole|Credit Agricole Bank Polska|bank
PL|PL.BNP|BNP Paribas Polska|BNP Paribas Bank Polska|bank
PL|PL.VELO|VeloBank|VeloBank|bank
PL|PL.NEST|Nest Bank|Nest Bank|bank
SA|SA.ALRAJHI|Al Rajhi Bank|Al Rajhi Bank|bank
SA|SA.SNB|SNB|Saudi National Bank|bank
SA|SA.RIYAD|Riyad Bank|Riyad Bank|bank
SA|SA.SAB|SAB|Saudi Awwal Bank|bank
SA|SA.ALINMA|Alinma Bank|Alinma Bank|bank
SA|SA.ALBILAD|Bank Albilad|Bank Albilad|bank
SA|SA.STCBANK|STC Bank|STC Bank|bank
SA|SA.URPAY|urpay|urpay|wallet
SA|SA.D360|D360 Bank|D360 Bank|bank
SE|SE.SWEDBANK|Swedbank|Swedbank|bank
SE|SE.HANDELSBANKEN|Handelsbanken|Svenska Handelsbanken|bank
SE|SE.SEB|SEB|Skandinaviska Enskilda Banken|bank
SE|SE.NORDEA|Nordea|Nordea Bank|bank
SE|SE.SWISH|Swish|Getswish|wallet
SE|SE.LF|Länsförsäkringar|Länsförsäkringar Bank|bank
SE|SE.DANSKE|Danske Bank|Danske Bank|bank
SE|SE.ICA|ICA Banken|ICA Banken|bank
SE|SE.SBAB|SBAB|SBAB Bank|bank
TR|TR.ZIRAAT|Ziraat Bankası|T.C. Ziraat Bankası|bank
TR|TR.ISBANK|İş Bankası|Türkiye İş Bankası|bank
TR|TR.GARANTI|Garanti BBVA|Garanti BBVA|bank
TR|TR.YKB|Yapı Kredi|Yapı ve Kredi Bankası|bank
TR|TR.AKBANK|Akbank|Akbank|bank
TR|TR.VAKIF|VakıfBank|Türkiye Vakıflar Bankası|bank
TR|TR.HALKBANK|Halkbank|Türkiye Halk Bankası|bank
TR|TR.QNB|QNB|QNB Bank|bank
TR|TR.DENIZ|DenizBank|DenizBank|bank
TR|TR.ENPARA|Enpara|Enpara Bank|bank
TR|TR.TEB|TEB|Türk Ekonomi Bankası|bank
TR|TR.KUVEYT|Kuveyt Türk|Kuveyt Türk Katılım Bankası|bank
TR|TR.PAPARA|Papara|Papara|wallet
TR|TR.PAYCELL|Paycell|Turkcell Ödeme|wallet
TR|TR.ININAL|ininal|ininal|wallet
ZA|ZA.CAPITEC|Capitec|Capitec Bank|bank
ZA|ZA.FNB|FNB|First National Bank|bank
ZA|ZA.STANDARD|Standard Bank|Standard Bank|bank
ZA|ZA.ABSA|Absa|Absa Bank|bank
ZA|ZA.NEDBANK|Nedbank|Nedbank|bank
ZA|ZA.DISCOVERY|Discovery Bank|Discovery Bank|bank
ZA|ZA.TYME|TymeBank|TymeBank|bank
*|PAYPAL|PayPal|PayPal|wallet
*|WISE|Wise|Wise|wallet
*|REVOLUT|Revolut|Revolut|wallet
`;
