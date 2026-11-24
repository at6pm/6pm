/**
 * The iPhone apps of the world's banks and wallets, by the world directory's code, as the published
 * "Catch a bank alert" shortcuts list them on their Notification trigger. One row each:
 * `code|bundle id|team id|names`. The team id is written only where it is certain (the prefix of
 * the app's `appID` in its own `apple-app-site-association`), and left empty otherwise. The names
 * are what iOS may show under the app's icon, which is what a Shortcuts automation hands the action
 * as the app a notification came from; the first is the one a shortcut writes beside a team id.
 *
 * Only apps that may go on a shortcut are here. Left out: a chat or super-app (Alipay, WeChat,
 * Grab, Toss, the M-PESA app) and a wallet of one (ShopeePay, LINE Pay), and an app whose bundle id
 * shares its maker's prefix with a chat or super-app of that maker (GoPay and Gojek, AlipayHK and
 * Alipay, Paycell and BiP, d払い and +Message, U-Money and Mocha): an entry with no team id can
 * attach itself to an installed app with a similar bundle id, as Zalopay's did to Zalo.
 */
const ROWS = `
US.CHASE|com.chase|88MPW8R88P|Chase;Chase Mobile
US.BOFA|com.bankofamerica.BofA|6VA92R47D3|BofA;Bank of America;Bank of America Mobile Banking
US.WELLSFARGO|com.wf.mobilebanking|4E5S3W9PH8|Wells Fargo;Wells Fargo Mobile
US.CAPITALONE|com.capitalone.enterprisemobilebanking|B9QGZRF45P|Capital One;Capital One Mobile
US.CITI|com.citigroup.citimobile||Citi Mobile;Citi
US.USBANK|com.usbank.icmobilebanking||U.S. Bank;US Bank;U.S. Bank Mobile Banking
US.PNC|com.pnc.pncmobile||PNC Mobile;PNC;PNC Mobile Banking
US.TRUIST|com.truistmobile.truist||Truist;Truist Mobile
US.TDBANK|com.tdbank.iphoneapp||TD Bank
US.NAVYFED|org.navyfederal.nfcuforiphone||Navy Federal;NFCU;Navy Federal Credit Union
US.USAA|com.usaa.UsaaMobile||USAA Mobile
US.AMEX|com.americanexpress.amexservice|8DR9MTC4E8|Amex;American Express
US.DISCOVER|com.discoverfinancial.mobile|29QZK2TJ24|Discover;Discover Mobile
US.CHIME|com.1debit.ChimeProdApp|3HR65T8TDW|Chime
US.SOFI|com.sofi.mobile||SoFi
US.ALLY|com.ally.MobileBanking|N253L8X7DJ|Ally
US.VENMO|net.kortina.labs.Venmo|6DEPQ9SPDK|Venmo
US.CASHAPP|com.squareup.cash|3Q5FAW8734|Cash App
CA.RBC|com.rbc.mobilebanking||RBC Mobile;RBC
CA.TD|com.td.tdiphoneapp||TD Canada;TD
CA.SCOTIA|com.scotiabank.locator||Scotiabank
CA.BMO|com.bmo.mbanking|3U5JHL548J|BMO;BMO Mobile Banking
CA.CIBC|com.CIBC.mobilebanking|6S27LX4PA8|CIBC;CIBC Mobile Banking
CA.DESJARDINS|com.desjardins.mobile||Desjardins;Desjardins mobile services
CA.NBC|ca.bnc.BNCMobile||National Bank;NBC;NBC mobile application
CA.TANGERINE|ca.tangerine.clients.banking||Tangerine Mobile Banking
CA.SIMPLII|com.cibc.mobilepcf||Simplii Financial
CA.EQBANK|com.eqbank.eqbank||EQ Bank Mobile Banking
CA.WEALTHSIMPLE|com.wealthsimple.trade||Wealthsimple
CA.KOHO|ca.koho||KOHO
CA.NEO|com.neofinancial.neo||Neo Financial
CA.PCFINANCIAL|ca.pcfinancial.bank||PC Financial Mobile
CA.ATB|com.atb.ATBMobile||ATB Personal
CA.AMEX|ca.co.americanexpress.amexservice||Amex Canada
GB.BARCLAYS|uk.co.barclays.bmbappstore||Barclays
GB.LLOYDS|com.lloydstsb.LloydsTSB|D24KY3EF68|Lloyds;Lloyds Bank;Lloyds Mobile Banking
GB.HSBC|uk.co.hsbc.hsbcukmobilebanking|AD6MER959C|HSBC UK;HSBC UK Mobile Banking
GB.NATWEST|com.monitise.matm.Monitise-iPhone-NatWest-EN-GB||NatWest;NatWest Mobile Banking
GB.SANTANDER|uk.co.santander.santanderUK||Santander UK;Santander Mobile Banking
GB.NATIONWIDE|co.uk.Nationwide.MobileBanking|H8UT7ZK26Q|Nationwide;Nationwide Mobile Banking
GB.HALIFAX|com.halifax.mobilebank||Halifax;Halifax Mobile Banking
GB.MONZO|io.b2a.BankProd|6944V8G4S2|Monzo;Monzo Bank
GB.STARLING|uk.co.starlingbank.Starling|9Y5SA82235|Starling;Starling Bank
GB.CHASE|com.chase.intl||Chase UK
GB.FIRSTDIRECT|com.firstdirect.bankingonthego||first direct
GB.TSB|uk.co.tsb.mobilebankt0||TSB Mobile Banking
GB.VIRGIN|com.virginmoney.uk.mobile.ios||Virgin Money Mobile Banking
GB.RBS|com.monitise.matm.Monitise-iPhone-RBS-EN-GB||RBS;Royal Bank;Royal Bank of Scotland
GB.BOS|com.bos.mobilebank||Bank of Scotland Mobile Bank
GB.BARCLAYCARD|uk.co.barclays.mybarclaycard||Barclaycard
GB.AMEX|uk.co.americanexpress.amexservice||Amex United Kingdom
IE.AIB|ie.aib.mobilebanking||AIB
IE.BOI|com.bankofireland.mobilebanking||Bank of Ireland Mobile Banking
IE.PTSB|ie.permanenttsb.ptsbapp||PTSB
DE.SPARKASSE|de.starfinanz.Finanzstatus|N4X8L897Y7|Sparkasse;Sparkasse Ihre mobile Filiale
DE.VOLKSBANK|de.fiduciagad.banking.vr||VR Banking;VR Banking Classic
DE.DEUTSCHE|com.db.pbc.ng.mobile||Deutsche Bank
DE.COMMERZBANK|de.softgames.commerzbank||Commerzbank Banking
DE.ING|de.ingdiba.bankingapp||ING Deutschland
DE.DKB|de.dkb.banking||DKB
DE.POSTBANK|de.postbank.banking||Postbank
DE.COMDIRECT|de.comdirect.App|U829YNWB46|comdirect
DE.N26|de.no26.Number26|2EYRG96PC2|N26
DE.TRADEREPUBLIC|de.traderepublic.app||Trade Republic
DE.CONSORS|de.consorsbank.universalapp||Consorsbank
DE.C24|de.c24.bankapp||C24 Bank
DE.SPARDA|de.sparda.banking.app||SpardaBanking App
DE.TARGOBANK|ei.targo.release||TARGOBANK Banking
DE.NORISBANK|de.norisbank.app.ios.norisbank||norisbank
FR.CA|fr.creditagricole.monbudget||Ma Banque;Crédit Agricole
FR.BNP|net.bnpparibas.mescomptesiphone||BNP Paribas;Mes Comptes BNP Paribas
FR.SG|mobi.societegenerale.mobile.lappli||L’Appli SG
FR.CM|ei.cm.release||Crédit Mutuel
FR.LBP|fr.labanquepostale.moncompte||La Banque Postale
FR.CE|fr.caisse-epargne.dem||Banxo;Caisse d’Epargne
FR.BP|fr.banquepopulaire.launcher||Banque Populaire
FR.LCL|com.lcl.application.iphone||LCL;Mes Comptes LCL
FR.BOURSO|com.boursorama.boursoclient|266C9E9VH9|BoursoBank;Boursorama
FR.LYDIA|com.lydia-app|R8SGCN459P|Sumeria;Lydia
FR.CIC|ei.cic.release||CIC Banque en ligne & Compte
FR.HELLOBANK|net.bnpparibas.hellobankiphone||Hello bank! par BNP Paribas
FR.FORTUNEO|com.fortuneo.fortuneo||Fortuneo
FR.NICKEL|com.fpe.comptenickel||NiCKEL
FR.WERO|eu.epicompany.wero.wallet||Wero
NL.ING|nl.ing.iphone.app.Bankieren|ED83ZJR6DX|ING Nederland;ING Bankieren
NL.RABOBANK|nl.Rabobank.Bankieren||Rabobank;Rabo
NL.ABNAMRO|com.abnamro.nl.bankieren||ABN AMRO
NL.BUNQ|com.bunq.ios|5C8Y578B5P|bunq
NL.SNS|nl.devolksbank.sns.banking||SNS
NL.ASN|nl.devolksbank.asn.banking||ASN Bank
NL.REGIO|nl.devolksbank.regiobank.banking||RegioBank
NL.KNAB|nl.aegon.knab.iphone||Knab Bankieren
NL.TRIODOS|com.triodos.bankingnl||Triodos Bankieren NL
NL.TIKKIE|com.abnamro.tikkie||Tikkie
ES.SANTANDER|com.isban.bancosantander.es.public||Santander España
ES.BBVA|com.bbva.BBVAMovil|FVZS42EB87|BBVA España;BBVA
ES.CAIXABANK|com.thenetfirm.mobile.wapicon.WapIcon||CaixaBankNow;CaixaBank
ES.SABADELL|com.bancosabadell.sabloc||App Banco Sabadell
ES.BANKINTER|com.bankinter.Launcher|U5QFPVANML|Bankinter;Bankinter Móvil
ES.ING|es.ingdirect.www||ING Banca Móvil y Finanzas
ES.IMAGIN|es.lacaixa.mobile.imaginBank||imagin
ES.OPENBANK|es.openbank.mobile||Openbank
ES.UNICAJA|es.unicajabanco.app||Unicaja
ES.ABANCA|com.abanca.bancamovil.particulares||ABANCA
ES.RURALVIA|com.rsi.nba||Ruralvía
IT.INTESA|com.intesasanpaolo.ibiphone||Intesa Sanpaolo;Intesa Sanpaolo Mobile
IT.UNICREDIT|com.internet.unicredit.iphoneapp||UniCredit;Mobile Banking UniCredit
IT.POSTE|it.poste.spim||Poste Italiane;BancoPosta
IT.BPM|it.bancopopolare.youapp.produzione||YouApp;Banco BPM
IT.BPER|it.bper.mobilebanking||BPER
IT.FINECO|com.fineco.fineco|2A8J8AKUVX|Fineco
IT.SATISPAY|com.satispay.customer.p2p|3KU6KJU4K4|Satispay
IT.ING|it.ing.app.OneApp||ING Italia
IT.BNL|it.bnl.apps.banking||BNL
IT.MEDIOLANUM|it.bancamediolanum.imedfullclient||Mediolanum
IT.MPS|com.mps.mb||Banca MPS
IT.ISYBANK|com.intesasanpaolo.isybank.mobile||isybank
IT.HYPE|com.hype.it||HYPE
IT.BBVA|com.bbva.italy||BBVA Italia
IT.BANCOMATPAY|it.bancomat.pay.user||BANCOMAT
AU.CBA|au.com.commbank.commbank|FP8T463CG8|CommBank
AU.WESTPAC|au.com.westpac.ConsultWPC||Westpac
AU.ANZ|com.anz.ANZGrow|4W69L62Z2B|ANZ Australia;ANZ Plus
AU.NAB|au.com.nab.NAB-iPad|7Q8JA2S38L|NAB Mobile Banking;NAB Banking
AU.ING|au.com.ing.oneapp.banking|75Q79EZ672|ING Australia
AU.MACQUARIE|com.macquarie.mobilebanking||Macquarie Mobile Banking
AU.BENDIGO|com.bendigobank.mobileios.BendigoBank||Bendigo Bank
AU.UP|au.com.up.money|FKHRDBY9RN|Up;Up Money
AU.UBANK|au.com.86400||Ubank
AU.BANKWEST|au.com.bankwest.Bankwest||Bankwest
AU.STGEORGE|au.com.stgeorge.Consult||St.George Mobile Banking
AU.SUNCORP|au.com.suncorp.dmpm.marketplace||Suncorp Bank App
AU.BOQ|au.com.boq.mobilebanking||myBOQ
AU.MEBANK|au.com.mebank.bankingman||ME Bank
AU.HSBC|au.com.hsbc.hsbcaustralia||HSBC Australia
AU.AMEX|au.co.americanexpress.amexservice||Amex Australia
AU.GREATSOUTHERN|au.com.cua.mb||Great Southern Bank Australia
NZ.ANZ|nz.co.anz.goMoneynz||ANZ goMoney;goMoney NZ;ANZ goMoney New Zealand
NZ.ASB|nz.co.asb.mobile.asbmobile||ASB Mobile Banking
NZ.BNZ|nz.co.bnz.MobileBanking|S8V473XFX9|BNZ;BNZ Mobile
NZ.WESTPAC|nz.co.westpac.mobilebanking||Westpac One;Westpac NZ;Westpac One NZ Mobile Banking
NZ.KIWIBANK|nz.co.kiwibank.mobile||Kiwibank Mobile Banking
NZ.COOP|nz.co.co-operativebank.Co-operative-Bank||The Co-operative Bank
SG.DBS|com.dbs.sg.dbsmbanking|N6MAQ56G9X|DBS digibank;digibank
SG.POSB|com.dbs.sg.posbmbanking|N6MAQ56G9X|POSB digibank
SG.OCBC|com.ocbc.mobile||OCBC Singapore
SG.UOB|com.uob.mighty||UOB TMRW;TMRW
SG.SCB|com.sc.Breeze||SC Mobile;SC Mobile SG;SC Mobile Singapore
SG.TRUST|sg.trust|9Q4SDT9QY5|Trust;Trust Bank;Trust Bank SG
SG.GXS|sg.com.gxs.app||GXS Bank
SG.PAYLAH|com.dbs.dbspaylah||DBS PayLah!
SG.MARIBANK|sg.com.maribankmobile.digitalbank||MariBank Singapore
SG.CITI|com.citibank.CitibankSG||Citibank SG
SG.CIMB|com.cimb.cimbsg||OCTO by CIMB Singapore
SG.AMEX|sg.co.americanexpress.amexservice||Amex Singapore
SG.YOUTRIP|co.you.youapp||YouTrip
MY.MAYBANK|com.maybank2u.life||MAE;MAE by Maybank2u;Maybank2u
MY.CIMB|com.cimb.cimbocto||CIMB OCTO MY;CIMB OCTO
MY.PUBLIC|com.pbb.mypb||MyPB;PB engage;MyPB by Public Bank
MY.RHB|com.rhbgroup.rhbmobilebanking||RHB Mobile Banking
MY.HLB|my.com.hongleongconnect.mobileconnect||HLB Connect;Hong Leong Connect;HLB Connect Mobile Banking App
MY.AMBANK|com.ambank.amonline||AmOnline
MY.BANKISLAM|com.bankislam.bimbmobile||BIMB Mobile;Bank Islam
MY.TNG|my.com.tngdigital.wallet||TNG eWallet;Touch n Go eWallet
MY.BOOST|my.com.myboost||Boost App Malaysia
MY.BSN|com.bsn.mybsn||myBSN
MY.GXBANK|my.com.gxbank.app||GXBank
MY.UOB|com.uob.mightymy||UOB TMRW Malaysia
MY.HSBC|my.com.hsbc.hsbcmalaysia||HSBC Malaysia
MY.AEONBANK|com.personal.adb||AEON Bank
MY.BOOSTBANK|co.myboostbank.boostberhad||Boost Bank
MY.BIGPAY|com.bigpayme.bigpay||BigPay
MY.RYT|my.rytbank.app||Ryt Bank
TH.KBANK|com.kasikornbank.retail.mbanking.wap|33C5EP5X49|K PLUS
TH.SCB|com.scb.iphone||SCB EASY
TH.BBL|com.bangkokbank.mbanking||Bangkok Bank Mobile Banking
TH.KTB|com.ktb.netbank||Krungthai NEXT;Krungthai
TH.KRUNGSRI|com.krungsri.kma|3QMTRQCNLT|krungsri;Krungsri app
TH.TTB|com.TMBTOUCH.PRODUCTION||ttb touch
TH.GSB|com.gsb.mobilife.MyMo||MyMo;MyMo By GSB Mobile Banking
TH.TRUEMONEY|com.tdcm.truemoneywallet|X2933S7SQW|TrueMoney
TH.PAOTANG|com.ktb.customer.qr||เป๋าตัง;Paotang
TH.MAKE|com.kasikornbank.makebykbank||MAKE by KBank แอปจัดการเงิน
TH.BAAC|com.baac.amobileplus||BAAC Mobile;A-Mobile
TH.UOB|com.uob.mightyth||UOB TMRW Thailand
TH.DIME|com.dimekkp.dimeapp||Dime!
TH.CARDX|th.co.cardx||CardX
ID.BCA|com.bca.bcamobile||BCA mobile
ID.MANDIRI|id.bmri.livin||Livin’ by Mandiri;Livin
ID.BRI|id.co.bri.newbrimobile||BRImo;BRImo BRI
ID.BNI|id.bni.wondr||wondr;wondr by BNI
ID.CIMBNIAGA|com.cimbniaga.CIMB||OCTO;OCTO Mobile;OCTO by CIMB Niaga
ID.JAGO|com.jago.digitalBanking||Jago;Bank Jago;Bank Jago/Jago Syariah
ID.OVO|ovo.id|842X47DEU9|OVO
ID.DANA|id.dana.app|WDSUNR4DKH|DANA;DANA Dompet Digital Indonesia
ID.MYBCA|com.bca.mybca.omni||myBCA
ID.BSI|co.id.bankbsi.superapp||BYOND;BYOND by BSI;BSI Mobile
ID.SEABANK|id.co.bankbkemobile.digitalbank||SeaBank
ID.BLU|com.bcadigital.blu||blu by BCA Digital
ID.LINKAJA|com.telkomsel.wallet||LinkAja / LinkAja Syariah
ID.PERMATA|net.myinfosys.PermataMobileX||Permata ME
ID.OCBC|com.ocbcnisp.onemobile||OCBC mobile Indonesia
PH.BDO|com.bdo.newdigital||BDO Online;BDO
PH.BPI|com.bpi.ng.app||BPI
PH.METROBANK|ph.com.metrobank.mcc.mbonline||Metrobank App
PH.LANDBANK|com.landbank.mobilebanking||LANDBANK;LANDBANK Mobile Banking
PH.SECURITY|com.securitybank.bbx||Security Bank App
PH.UNIONBANK|com.unionbankph.online||UnionBank Online
PH.GCASH|com.globetel.gcash|Z9783MH7AR|GCash
PH.MAYA|com.paymaya.ios|9A897GL6NF|Maya
PH.GOTYME|ph.com.gotyme||GoTyme Bank
PH.BDOPAY|ph.com.bdo.pay||BDO Pay
PH.SEABANK|ph.seabank.seabank||MariBank PH
PH.RCBC|com.rcbc.mobile||RCBC Pulz
PH.CIMB|com.cimbph.app2022||CIMB Bank Philippines
PH.EASTWEST|com.eastwest.mobile.dxp||EastWest EasyWay
PH.TONIK|com.mobile.tonik||Tonik Bank
KH.ABA|com.paygo24.ababank||ABA Mobile;ABA Mobile Bank
KH.ACLEDA|com.domain.acledabankqr|RJWBHET2KP|ACLEDA mobile;ACLEDA
KH.WING|com.wingmoney.app||Wing Bank;Wing
KH.BAKONG|kh.org.nbc.bakong||Bakong
KH.PRASAC|kh.com.prasac.ibanking.prasacmbanking||KB PRASAC Mobile
KH.AMK|com.amkcambodia.mobilebanking||AMK Mobile
KH.PPCB|kh.com.ppcbank.mbanking3p||PPCBank
KH.AMRET|com.bankgenie.geniemobile.amret||Amret
KH.TRUEMONEY|kh.com.truemoney.customerapp||TrueMoney Cambodia
LA.BCEL|com.bcel.one||BCEL One
LA.LDB|com.ldb.wallet||LDB Trust
LA.APB|com.apb.mobilebanking||APB Meporm
LA.IB|com.iblaos.ibcool||IB Cool
LA.MMONEY|com.ltc.lmm.consumer||M moneyX
KR.KB|com.kbstar.kbbank|8MX8HQ493Q|KB스타뱅킹;KB Star Banking
KR.SHINHAN|com.shinhan.sbank||신한 SOL뱅크;신한 슈퍼SOL;SOL;신한은행
KR.WOORI|com.wooribank.smart.npib||우리WON뱅킹;WON뱅킹;우리은행
KR.HANA|com.hanabank.oqf||하나원큐;하나은행
KR.NH|com.nonghyup.newsmartbanking||NH스마트뱅킹;NH Smart Banking;NH농협은행;NH농협
KR.IBK|com.ibk.ios.ionebank||i-ONE Bank;i-ONE뱅크;IBK기업은행
KR.KAKAOBANK|com.kakaobank.channel||카카오뱅크;KakaoBank
KR.KAKAOPAY|com.kakaopay.payapp.store||카카오페이;Kakao Pay;KakaoPay
KR.NAVERPAY|com.naverfin.payapp||네이버페이;Naver Pay;NaverPay
KR.KBANK|com.kbankwith.smartbank||케이뱅크
KR.NHALLONE|com.nonghyup.nhallonebank||NH올원뱅크
KR.SC|com.scbank.ma30||SC제일은행;SC제일은행 모바일뱅킹
KR.EPOST|com.epost.psf.sd||우체국뱅킹
KR.KBCARD|com.kbcard.cxh.appcard||KB Pay;KB국민카드
KR.SHINHANCARD|com.shinhancard.MobilePay||신한 SOL페이;SOL페이;신한카드
KR.HYUNDAICARD|com.hyundaicard.hcappcard||현대카드
KR.HANACARD|com.hanaskcard.paycli||하나Pay;하나페이
JP.MUFG|jp.mufg.bk.applisp.01||三菱UFJ銀行;MUFG
JP.SMBC|jp.co.smbc.direct||三井住友銀行;SMBC;三井住友銀行アプリ
JP.MIZUHO|jp.co.mizuhobank.bankingapp||みずほ銀行;みずほ;みずほ銀行アプリ
JP.YUCHO|jp.japanpost.jp-bank.bankbookapp||ゆうちょ通帳;ゆうちょ;ゆうちょ通帳アプリ-銀行 アプリ
JP.RAKUTEN|jp.co.rakuten-bank.sapp.rbapp||楽天銀行
JP.RESONA|jp.co.resona-gr.ss.SmartApp||りそな;りそなグループ;りそなグループアプリ
JP.SONY|net.moneykit.sbw||Sony Bank WALLET;ソニー銀行
JP.PAYPAY|jp.pay2.app.ios|8899ZUKF5G|PayPay
JP.RAKUTENPAY|jp.co.rakuten.pay.shopper|87CT3T3CK2|楽天ペイ;Rakuten Pay;楽天ペイ-楽天ポイントカードも利用できるスマホ決済アプリ
JP.AUPAY|com.kddi.auwalletapp|992GW8652B|au PAY;au PAY チャージや残高確認できるauのスマホ決済アプリ
JP.PAYPAYBANK|jp.co.japannetbank.smtapp.balance||PayPay銀行
JP.DOCOMOSMTB|jp.co.netbk.netbanking||ドコモの銀行;住信SBI;住信SBIネット銀行;ドコモの銀行 ドコモSMTBネット銀行
JP.JIBUN|jp.co.jibunbank.jibunmain||じぶん銀行;auじぶん銀行;じぶん銀行アプリ
JP.SHINSEI|com.shinseibank.powerdirect||SBI新生銀行;新生銀行
JP.GMOAOZORA|com.gmo-aozora.bank-app||GMOあおぞら;GMOあおぞらネット銀行;GMOあおぞらネット銀行 取引アプリ
JP.VPASS|com.smbc-card.vpass||Vpass;三井住友カード;三井住友カード Vpassアプリ
JP.RAKUTENCARD|jp.co.rakuten-card.RakutenCard||楽天カード;楽天カード：明細確認アプリ
CN.ICBC|com.icbc.iphoneclient||中国工商银行;工商银行
CN.CCB|com.ccb.ccbDemo||中国建设银行;建设银行
CN.ABC|com.bankabc.iphonerelease||中国农业银行;农业银行
CN.BOC|com.boc.BOCMBCI||中国银行;缤纷生活
CN.BOCOM|com.bankcomm.Bankcomm||交通银行;买单吧
CN.CMB|com.cmbchina.MPBBank||招商银行;掌上生活
CN.PSBC|com.psbc.mobilebank||邮储银行;中国邮政储蓄银行
CN.CITIC|com.citic.mobile||中信银行
CN.PINGAN|com.pingan.creditcard||平安口袋银行;平安银行;平安口袋银行-更懂您的智能银行
CN.UNIONPAY|com.unionpay.chsp||云闪付;云闪付-银行业统一移动支付App
CN.ECNY|cn.gov.pbc.ecny||数字人民币;e-CNY
HK.HSBC|hk.com.hsbc.hsbchkmobilebanking||HSBC HK;HSBC HK Mobile Banking
HK.HANGSENG|com.hangseng.rbmobileapp|D3459CP8HJ|恒生;Hang Seng;恒生銀行;恒生個人流動理財服務
HK.BOCHK|com.bochk.app.ios||BOCHK;中銀香港;BOCHK 中銀香港
HK.SCB|com.sc.breezehk||SC Mobile HK;SC Mobile Hong Kong
HK.ZA|group.za.bank||ZA Bank
HK.MOX|com.mox.app||Mox Bank
HK.PAYME|hk.com.hsbc.paymefromhsbc||PayMe;PayMe by HSBC
HK.OCTOPUS|com.octopuscards.octopus||Octopus;八達通;Octopus 八達通
HK.LIVI|com.livibank.hk||livi Bank
HK.AIRSTAR|com.airstarbank.hk||大象銀行;EleBank;大象銀行 EleBank：香港數字銀行
TW.CTBC|com.chinatrust.mobilebank||中國信託;中國信託行動銀行
TW.CATHAY|com.cathaybk.cathaybk|949C94LBAB|CUBE;國泰世華CUBE;國泰世華;國泰世華網路銀行CUBE
TW.FUBON|com.fubon.aibank||Fubon+;台北富邦;Fubon+ 台北富邦行動銀行
TW.ESUN|tw.com.ESunbank.mobilebanking.release||玉山銀行;玉山行動銀行
TW.POST|tw.gov.post.mpost||行動郵局;郵局
TW.JKOPAY|com.jkos.JKOS|GZKP525SU3|街口支付;街口;JKOPAY;街口支付 JKOPAY
TW.TAISHIN|tw.com.taishinbank.mobile||台新銀行;台新;台新銀行【行動銀行】
TW.RICHART|tw.com.taishinbank.richart||Richart
TW.FCB|com.firstbank.mbank||第e行動;第一銀行
TW.HNCB|tw.com.hncb.NMBank||華南銀行
TW.CHB|com.chb.mobile.pmb||彰銀;彰化銀行;ChaiBo;彰銀行動銀行ChaiBo
TW.YUANTA|com.yuantabank.bankinginyour.superapp.personal||元大銀行;元大行動銀行;元大行動銀行 Yuanta Commercial Bank
TW.NEXTBANK|com.nextbank.ncbportal||將來銀行;將來銀行 NEXT BANK
TW.IPASS|com.ipass.ipassmoney||一卡通;iPASS MONEY;一卡通 iPASS MONEY
TW.ESUNWALLET|tw.com.esunbank.app.esunwallet||玉山Wallet
IN.SBI|com.sbi.lotusintouch||YONO SBI;YONO
IN.HDFC|com.hdfcbank.ios.now||HDFC Bank;HDFC Bank App
IN.ICICI|com.icicibank.imobile||iMobile;iMobile Pay
IN.AXIS|com.axisbank.axismobile||Axis Mobile;Axis Bank;Axis Bank Mobile Banking
IN.KOTAK|com.kotak.bank.mobile||Kotak;Kotak Bank
IN.PNB|com.pnbios1128||PNB ONE
IN.BOB|com.bankofbaroda.mconnect||bob World;bob World New
IN.PHONEPE|com.phonepe.PhonePeApp|9GW78CXC2W|PhonePe;PhonePe UPI
IN.GPAY|com.google.paisa|EQHXZ8M8AV|Google Pay;GPay
IN.PAYTM|com.one97.paytm|885LR8YVNT|Paytm
IN.CANARA|com.canarabank.mobility||Canara ai1;Canara ai1- Mobile Banking App
IN.UNION|com.infrasoft.uboi||Union ease;Vyom
IN.BOI|com.boi.ua.ios||BOI Mobile
IN.IDFC|com.idfcfirstbank.optimus||IDFC FIRST Bank
IN.INDUSIND|com.indusind.indie||indie;IndusInd Bank
IN.BHIM|in.org.npci.ios.upiapp||BHIM Bharat's Own Payments App
IN.PAYZAPP|com.hdfcbank.payzapp||PayZapp
IN.CRED|com.dreamplug.cred||CRED
AE.ENBD|com.enbd.MobileBanking||ENBD X
AE.FAB|com.fab.PersonalBanking||FAB Mobile;FAB
AE.ADCB|com.adcb.nexgen||ADCB
AE.DIB|com.dib.app||DIB alt;DIB;DIB alt mobile banking app;Dubai Islamic Bank
AE.ADIB|com.adib.mobilebanking||ADIB Mobile Banking
AE.MASHREQ|com.mashreq.||Mashreq UAE
AE.WIO|io.wio.retail||Wio Personal;Wio
AE.EANDMONEY|ae.e-wallet.mobileapp||e& money;etisalat money;etisalat money UAE
AE.ZIINA|com.ziina.app||Ziina
BD.BKASH|com.bKash.customerapp||bKash
BD.NAGAD|com.konasl.bdpost.nagad||Nagad
BD.DBBL|com.dbbl.nexuspay.live||NexusPay
BD.ROCKET|com.dbbl.rocket||Rocket;DBBL Rocket
BD.ASTHA|com.bracbank.astha||Astha;BRAC Bank Astha
BD.CITYTOUCH|com.thecitybank.citytouch||Citytouch
BD.UPAY|bd.com.upay.customer||upay
BR.NUBANK|com.nu.iphone||Nubank;Nu
BR.ITAU|com.itau.iphone.varejo||Itaú;Banco Itaú
BR.BRADESCO|br.com.bradescora.app||Bradesco;Banco Bradesco
BR.BB|com.bb.bbapp||BB;Banco do Brasil
BR.CAIXA|br.gov.caixa.CAIXA||CAIXA
BR.SANTANDER|br.com.santander.minhacontapf||Santander Brasil;Banco Santander Brasil
BR.INTER|br.com.intermedium||Inter
BR.MERCADOPAGO|com.mercadopago.MercadoPago||Mercado Pago
BR.PICPAY|com.picpay.PicPay||PicPay
BR.C6|br.com.c6bank.app||C6 Bank
BR.PAGBANK|br.com.uol.pagseguro.PSAccount||Banco PagBank
BR.CAIXATEM|br.gov.caixa.tem||CAIXA Tem
BR.SICOOB|br.com.sicoob||Sicoob
BR.SICREDI|br.com.sicredi.fisital||Sicredi;Sicredi X
BR.NEON|br.com.Neon||
BR.INFINITEPAY|io.cloudwalk.infinitepaydash||InfinitePay Tap
BR.NOMAD|com.nomadfintech.bank.app.ios||Nomad
CH.UBS|com.ubs.mobileBanking||UBS;UBS & UBS key4
CH.POSTFINANCE|ch.post.pf.mp.iapp||PostFinance App
CH.RAIFFEISEN|ch.raiffeisen.bancomat||Raiffeisen;Raiffeisen E-Banking
CH.ZKB|ch.zkb.iapp||ZKB;ZKB Mobile Banking
CH.TWINT|ch.twint.wallet||TWINT;Prepaid TWINT & andere Banken
CH.MIGROS|ch.migrosbank.iphonebanking||Migros Bank E-Banking
CH.BCV|ch.bcv.mobile.bcv||BCV
CH.VALIANT|ch.vab.moba||Valiant
CH.YUH|com.swissquote.Yuh||Yuh
CH.NEON|com.neonbanking.app||
CH.CEMBRA|ch.cembra.cmf||Cembra App
CH.VISECA|ch.visecaone||Viseca one;one
CH.SWISSCARD|ch.swisscard.mobile||Swisscard
KE.EQUITY|ke.co.equitybank.equitymobile||Equity Mobile;Equity
KE.KCB|com.kcb.mobilebanking.iOS||KCB Mobile;KCB;New KCB Mobile
KE.COOP|com.mcoopcash.retail6||Co-op Bank App
KE.NCBA|craftsilicon.elmanic||NCBA NOW
KE.DTB|com.DigitalDist.DTB||DTB 24/7;DTB
MX.BBVA|com.bancomer.bbva.bancomermovil||BBVA México;BBVA MX
MX.SANTANDER|com.isban.santander.mx.supermovil||Santander México;SuperMóvil
MX.BANORTE|com.banorte.Banorte-Movil||Banorte Móvil;Banorte
MX.BANAMEX|com.citibanamex.iphoneprod||Banamex;App Banamex;Citibanamex
MX.NU|com.nu.iphone||
MX.MERCADOPAGO|com.mercadopago.MercadoPago||
MX.AZTECA|mx.com.bancoazteca.bazdigitalmovil||Banco Azteca
MX.SPIN|com.pagopopmobile||Spin by OXXO
MX.BANCOPPEL|com.bancoppel.BancoppelExpress||BanCoppel
MX.INBURSA|www.inbursa.com||Inbursa Móvil
MX.KLAR|mx.klar.app||Klar
MX.STORI|ai.powerup.stori||Stori
MX.PLATA|dif.tech.bank||Plata
NG.OPAY|com.opay.pay||OPay-Beyond Banking
NG.MONIEPOINT|com.teamapt.customers.moniepoint||Moniepoint Personal Banking
NG.PALMPAY|com.transsnet.newpalmpay||PalmPay
NG.GTB|com.gtbank.gtworldv1||GTWorld
NG.ACCESS|com.accessbank.nextgen||Access More
NG.ZENITH|com.zenithbank.mobileapp.eaZymoney||Zenith Bank;eaZymoney;Zenith Bank eaZymoney
NG.FIRSTBANK|com.firstbank.firstmobile||FirstMobile;FirstMobile App
NG.UBA|com.uba.vericash||UBA Mobile;UBA;UBA Mobile Banking
NG.KUDA|com.kudabank.app||Kuda
NG.FAIRMONEY|io.fairmoney.app||FairMoney
PK.EASYPAISA|com.telenor.easypaisa||easypaisa
PK.JAZZCASH|com.mobilink.jazzcash||JazzCash- Your Mobile Account
PK.HBL|com.hblmobile.ios||HBL Mobile
PK.MEEZAN|com.meezan.mobilebanking||Meezan Mobile App
PK.UBL|com.m3tech.ublnetbanking.enterprise223||UBL Digital
PK.MCB|com.mcb.mcblive||MCB Live
PK.ALFALAH|com.bankalfalah.bankalfalah||Alfa;Alfa by Bank Alfalah
PK.SADAPAY|com.sadapay.app||SadaPay
PK.NAYAPAY|com.nayapay.NayaPayApp||NayaPay
PL.PKO|pl.pkobp.iko||IKO;PKO Bank Polski;PKO IKO;PKO BP
PL.PEKAO|pl.pekao.pekaosa.peopay||PeoPay
PL.MBANK|pl.mobiltek.mbank||mBank PL
PL.ING|pl.ing.mojeing||Moje ING;Moje ING mobile
PL.ERSTE|pl.bzwbk.mobile.bzwbk24||Erste;Santander mobile
PL.MILLENNIUM|pl.millenniumbank.bankmillennium||Bank Millennium;Millennium
PL.ALIOR|pl.aliorbank.aib||Alior Mobile
PL.CA|pl.creditagricole.nmobi||CA24 Mobile
PL.BNP|pl.bgzbnpparibas.gomobile||GOmobile;BNP Paribas GOmobile
PL.VELO|com.getinbank.mobilebanking.MobileBanking||VeloBank
PL.NEST|pl.nestbank.nestbank-prod||Nest Bank
SA.ALRAJHI|sa.alrajhibank.retailapp||alrajhi bank;Al Rajhi
SA.SNB|com.snb.alahlimobile||SNB Mobile;SNB;SNB AlAhli;AlAhli
SA.RIYAD|com.riyadbank.digitalmobile||Riyad Bank App
SA.SAB|com.sabb.mobilebanking||SAB Mobile;SAB
SA.ALINMA|com.alinma.retail.mobile.v4||Alinma;الإنماء;Alinma App
SA.ALBILAD|com.bankalbilad.NewRMB||Bank Albilad App
SA.STCBANK|sa.com.STCBank||STC Bank
SA.URPAY|com.urpay.consumer||urpay
SA.D360|d360.ios.app||D360 Bank
SE.SWEDBANK|se.swedbank.iphonebanken||Swedbank;Swedbank privat
SE.HANDELSBANKEN|se.handelsbanken.TelesvarIBilder||Handelsbanken SE
SE.SEB|se.seb.privatkund||SEB
SE.NORDEA|com.nordea.mobilebank.se||Nordea;Nordea Mobile
SE.SWISH|se.bankgirot.swish||Swish;Swish betalningar
SE.LF|se.lansforsakringar.mobil||Länsförsäkringar
SE.DANSKE|com.danskebank.mobilebank3se||Danske Mobilbank;Mobilbank SE
SE.ICA|se.icabanken.iphoneapp||ICA Banken
SE.SBAB|se.sbab.bankapp||SBAB!
TR.ZIRAAT|com.ziraatbank.ZiraatMobile||Ziraat Mobil
TR.ISBANK|mobile.isbank.iscep||İşCep;İş Bankası
TR.GARANTI|com.garanti.cepsube||Garanti BBVA;Garanti BBVA Mobile
TR.YKB|com.pozitron.YKB||Yapı Kredi;Yapı Kredi Mobile
TR.AKBANK|com.Mobinex.Akbank-Direkt||Akbank;Akbank Mobile
TR.VAKIF|com.vakifbank.mobil||VakıfBank Mobil;VakıfBank;VakıfBank Mobil Bankacılık
TR.HALKBANK|com.halkbank.mobileapp||Halkbank Mobil;Halkbank
TR.QNB|com.ibtech.finansbank.FinansbankMobile||QNB Mobil
TR.DENIZ|com.denizbank.mobildeniz||MobilDeniz
TR.ENPARA|com.enparabank.retail||Enpara;Enpara Bank;Enpara Bank Cep Şube
TR.TEB|com.teb.CEPTETEB||CEPTETEB
TR.KUVEYT|com.kuveytturk.mobilsube2014||Kuveyt Türk;Kuveyt Türk Mobil
TR.PAPARA|com.mobillium.papara||Papara
ZA.CAPITEC|capitec.acuity.mobile.prod||Capitec;Capitec Bank
ZA.FNB|za.co.fnb.connect.touch||FNB;FNB Banking App
ZA.STANDARD|com.standardbank.retail.banking||Standard Bank;Standard Bank / Stanbic Bank
ZA.ABSA|za.co.absa.absabanking||Absa;Absa Banking
ZA.NEDBANK|za.co.nedbank.money||Nedbank Money;Nedbank
ZA.DISCOVERY|bank.discovery.banking.production.release||Discovery Bank
ZA.TYME|com.tymebank.smartapp.prod||TymeBank
PAYPAL|com.yourcompany.PPClient|7JMU3EK8QX|PayPal
WISE|com.transferwise.Transferwise|W53MTDV45J|Wise
REVOLUT|com.revolut.revolut|QUZEZSEARC|Revolut
`;

/**
 * The names iOS shows for banks and wallets that never go on a shortcut, by code: a super-app or
 * a wallet inside one, a shopping app, or one whose iPhone app is not certain. A person may still
 * put one on the trigger with +, so the action knows it by name. One row each: `code|names`.
 */
const NAMES_ONLY = `
CN.ALIPAY|支付宝;Alipay
HK.ALIPAYHK|AlipayHK;支付寶香港
ID.GOPAY|GoPay
ID.SHOPEEPAY|ShopeePay
JP.DBARAI|d払い
KE.MPESA|M-PESA;M-PESA App
LA.UMONEY|Umoney;U-Money
TR.PAYCELL|Paycell
SE.KLARNA|Klarna
IN.SBICARD|SBI Card
KR.SAMSUNGCARD|삼성카드;monimo;모니모
`;

/** A bank's or wallet's app on the iPhone. */
export interface WorldIosApp {
  /** Its bundle id ("com.chase"). */
  readonly bundle: string;
  /** Its developer team id, where it is known for certain. */
  readonly team: string | null;
  /** The names iOS may show for it, the one under its icon first. */
  readonly names: readonly string[];
}

/** The iPhone apps of the world's banks and wallets, by the world directory's code. */
export const WORLD_IOS_APPS: ReadonlyMap<string, WorldIosApp> = new Map(
  ROWS.trim()
    .split('\n')
    .map((line) => {
      const [code = '', bundle = '', team = '', names = ''] = line.split('|');
      const app: WorldIosApp = {
        bundle,
        team: team === '' ? null : team,
        names: names === '' ? [] : names.split(';'),
      };
      return [code, app] as const;
    }),
);

/** The names iOS shows for the apps of banks and wallets that never go on a shortcut, by code. */
export const WORLD_APP_NAMES_ONLY: ReadonlyMap<string, readonly string[]> = new Map(
  NAMES_ONLY.trim()
    .split('\n')
    .map((line) => {
      const [code = '', names = ''] = line.split('|');
      return [code, names.split(';')] as const;
    }),
);
