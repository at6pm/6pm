import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from Europe and Turkey, as public sources quote them (`world-alerts`). */
export const EUROPE_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/zenmoney/sms-formats/tree/main/src/C24-de_15989 (names and numbers changed)
  {
    country: 'DE',
    app: 'C24 Bank',
    title: 'Zahlung erfolgreich',
    body: 'Max Muster hat 47,32 € an Lidl sagt Danke gezahlt.',
    reads: spent(4732, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/C24-de_15989
  {
    country: 'DE',
    app: 'C24 Bank',
    body: 'Sie haben 23,32 € an Preply gezahlt.',
    reads: spent(2332, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/C24-de_15989 (names and numbers changed)
  {
    country: 'DE',
    app: 'C24 Bank',
    title: 'Echtzeit-Überweisung erfolgreich',
    body: 'Sie haben 35,00\u00a0€ an Anna Beispiel gesendet.',
    reads: spent(3500, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/C24-de_15989 (names and numbers changed)
  {
    country: 'DE',
    app: 'C24 Bank',
    body: 'Sie haben eine Zahlung über 1,00 € von Max Muster erhalten.',
    reads: got(100, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/C24-de_15989 (names and numbers changed)
  {
    country: 'DE',
    app: 'C24 Bank',
    title: 'Kartenzahlung bestätigen',
    body: 'Bitte bestätigen Sie die Online-Zahlung über 1,00 € bei PAYPAL *Muster Max.',
    reads: skipped('code'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ING-DiBa-de_15560
  {
    country: 'DE',
    app: 'ING (ING-DiBa)',
    title: 'Umsatz vorgemerkt',
    body: '-60,00 EUR: Hofbraeu an der Alster Ha',
    reads: spent(6000, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Sparkasse%20Bank-de_15720
  {
    country: 'DE',
    app: 'Sparkasse (Kontowecker SMS)',
    body: 'Umsatzwecker "Umsatz soll": DEUTSCHE .: -12,10 EUR Neuer Saldo zu Konto xxxxx253: -48,14 EUR Ihre Sparkasse',
    reads: spent(1210, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Sparkasse%20Bank-de_15720
  {
    country: 'DE',
    app: 'Sparkasse (Kontowecker SMS)',
    body: 'Umsatzwecker: Klarna Ba.: -13,29 EUR Neuer Saldo zu Konto *9680: 655,77 EUR Ihre Sparkasse',
    reads: spent(1329, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/comdirect%20bank-de_15525 (names and numbers changed)
  {
    country: 'DE',
    app: 'comdirect (SMS)',
    body: 'Für Ihre comdirect Visa-Karte Endziffer-1234 wurden 66,87 EUR angefragt. 21.03.16, Lidl Vertriebs GmbH  Bei Fragen wenden Sie sich an +49 69 6657 1913.',
    reads: spent(6687, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'DE',
    app: 'Revolut',
    title: 'OpenAI',
    body: '⚒️ Du hast 23,80 $ bei OpenAI bezahlt. Guthaben USD: 2.775,04 $',
    reads: spent(2380, 'USD'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'DE',
    app: 'Revolut',
    title: 'Eine Zahlung verifizieren 💵',
    body: 'Tippe, um eine Online-Zahlung mit deiner Karte zu verifizieren: £0 an PAYPAL.',
    reads: skipped('code'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/N26-de_15542
  {
    country: 'DE',
    app: 'N26',
    body: 'Your refund of €11.12 from CIRCLE K NOMME has been successfully processed.',
    reads: got(1112, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/N26-de_15542
  {
    country: 'DE',
    app: 'N26',
    title: 'N26',
    body: "You've received a transfer of € 1,390.18 from Paysend PLC.",
    reads: got(139018, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/N26-de_15542
  {
    country: 'FR',
    app: 'N26',
    body: "Votre paiement de 3,21 € chez MC DONALD'S PASEO DE G a été traité avec succès.",
    reads: spent(321, 'EUR'),
  },
  // https://www.moneyvox.fr/forums/fil/notifications-push-de-lapplication-boursorama.45608/page-4 (names and numbers changed)
  {
    country: 'FR',
    app: 'BoursoBank (SMS)',
    body: 'CB xx1234 autorisation de paiement de 266.52 EUR chez LIDL xxxcville xx',
    reads: spent(26652, 'EUR'),
  },
  // https://www.journaldunet.com/patrimoine/finances-personnelles/1540251-cd1-sms-banque/
  {
    country: 'FR',
    app: 'LCL (SMS)',
    body: "LCL - Alerte fraude sur votre CB. Etes-vous à l'origine du paiement ?",
    reads: skipped('unread'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ABN%20Amro-nl_15540
  {
    country: 'NL',
    app: 'ABN AMRO',
    title: 'An amount has been credited',
    body: 'An amount of € 3.937,77 has been credited to account **************5398. This is shown in the transactions overview.',
    reads: got(393777, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ABN%20Amro-nl_15540
  {
    country: 'NL',
    app: 'ABN AMRO',
    title: 'An amount has been debited',
    body: 'An amount of € 6,99 has been debited from account **************1397. This is shown in the transactions overview.',
    reads: spent(699, 'EUR'),
  },
  // https://www.cajamar.es/storage/documents/4931/infografia-bizum-cajamar-2021-2.pdf
  {
    country: 'ES',
    app: 'Bizum (bank SMS)',
    body: 'Has recibido un Bizum de 10.00 EUR de Manuel A.E. por regalo cumple Luis',
    reads: got(1000, 'EUR'),
  },
  // https://www.cajamar.es/storage/documents/4931/infografia-bizum-cajamar-2021-2.pdf
  {
    country: 'ES',
    app: 'Bizum (bank SMS)',
    body: 'Pablo, ¿quieres pagarle 10.00 EUR a Manuel A. E. por regalo cumple Luis? Entra en tu app para aceptar o rechazar',
    reads: skipped('unread'),
  },
  // https://www.cajamar.es/storage/documents/4931/infografia-bizum-cajamar-2021-2.pdf
  { country: 'ES', app: 'Bizum', body: 'Has recibido una solicitud', reads: skipped('unread') },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721 (names and numbers changed)
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Pago Bizum 💶 📲',
    body: 'Has recibido un BIZUM de 150,00 EUR de Laura M. por -.',
    reads: got(15000, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Pago aceptado  👍💳',
    body: 'Pago aceptado de 16,00 EUR en CIUDAD DE LAS ARTES Y LAS con tu tarjeta terminada en 2940.',
    reads: spent(1600, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Compra aceptada 👍💳',
    body: 'Compra de 1,80 EUR en BLAT CAFE con tu tarjeta terminada en 5361.',
    reads: spent(180, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Pago aceptado ✅',
    body: 'Aceptado el pago de 65,21  EUR en FEU VERT 601 CONDESA VEN. con Bizum',
    reads: spent(6521, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Recibo cargado',
    body: 'Se ha cargado en tu cuenta *9665 un adeudo de Centro Educativo y de Estudios Nuevo Mer de 38,00 EUR.',
    reads: spent(3800, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Importe retenido',
    body: 'Retenido importe de 150,00 EUR para realizar tu pago en US377A PLENERGY MASSANASS con tu tarjeta terminada en 2940',
    reads: spent(15000, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Aviso saldo inferior ⚠ 💰',
    body: 'El saldo de tu cuenta terminada en 5040 es inferior a 100,00 EUR',
    reads: skipped('balance'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Confirmar pago',
    body: 'Por seguridad, pulsa para poder confirmar el pago de 20,00 EUR realizado con tu tarjeta *5361 en T MOBILITAT APP',
    reads: skipped('code'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/BBVA-es_15721
  {
    country: 'ES',
    app: 'BBVA',
    title: 'Reimbursement accepted 👍🔙',
    body: 'A refund of 10,00 EUR for your payment in RENFE CERCANIAS TNA 08 (5 with your card ending in 4844 has been made.',
    reads: got(1000, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander-es_15873
  {
    country: 'ES',
    app: 'Santander',
    title: '💸 ¡Transferencia enviada!',
    body: 'Acabas de enviar 165.0 EUR desde tu cuenta **4533. Pulsa aquí para ver el detalle',
    reads: spent(16500, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander-es_15873
  {
    country: 'ES',
    app: 'Santander',
    body: 'Pago de 5.70 EUR en MARKET ANTONIO con Tarjeta **5258 + info. en tu banca online.',
    reads: spent(570, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander-es_15873 (names and numbers changed)
  {
    country: 'ES',
    app: 'Santander',
    title: 'Aquí tienes tu ticket del cajero',
    body: 'Hola Marta, has realizado una retirada de efectivo de 260,00EUR en el cajero 0049.5448.00 situado en Centelles, 13, Valencia, 46006, Valencia. Pulsa aquí para ver el ticket.',
    reads: spent(26000, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander-es_15873
  {
    country: 'ES',
    app: 'Santander',
    title: 'Santander Key',
    body: 'Confirma\u00a0tu\u00a0compra\u00a0en\u00a0Comercio\u00a0CASA DEL LIBRO\u00a0por\u00a01\u00a0EUR\u00a0con\u00a0tarjeta\u00a0*6699',
    reads: skipped('code'),
  },
  // https://github.com/devilteo911/budgetti/issues/39 (names and numbers changed)
  {
    country: 'IT',
    app: 'PayPal',
    title: 'Hai ricevuto 8,50 € EUR',
    body: 'da Marco Bianchi',
    reads: got(850, 'EUR'),
  },
  // https://www.alatel.it/alatel/wp-content/uploads/2021/07/satispay4.pdf
  {
    country: 'IT',
    app: 'Satispay',
    title: 'Pagamento confermato',
    body: 'Ristorante di pesce ha accettato il tuo pagamento di 55,70€',
    reads: spent(5570, 'EUR'),
  },
  // https://www.alatel.it/alatel/wp-content/uploads/2021/07/satispay4.pdf
  {
    country: 'IT',
    app: 'Satispay',
    title: 'Richiesta di pagamento',
    body: "Farmacia ha richiesto 42,70€. Apri l'app e completa il pagamento.",
    reads: skipped('unread'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Intesa%20Sanpaolo-it_15846
  {
    country: 'IT',
    app: 'Intesa Sanpaolo (SMS)',
    body: 'INTESA SANPAOLO: Hai pagato 5,00 EUR con la carta virtuale *5071 rif. carta *5605 il 11.03 alle ore 08:52 da ARGENTA, 0, REGGIO EMILIA.',
    reads: spent(500, 'EUR'),
  },
  // https://bnl.it/it/Individui-e-Famiglie/Internet-e-Mobile/SMS-Alert
  {
    country: 'IT',
    app: 'BNL (SMS Alert)',
    body: 'Pag. carta cred. MASTERCARD ***1695 di 11,91 EUR del 16-04-13 Ora 16:08 presso FELTRINELLI RM Totale spese del mese 261,91 Info 060060',
    reads: spent(1191, 'EUR'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Z%C3%BCrcher%20Kantonalbank-ch_16048
  {
    country: 'CH',
    app: 'ZKB',
    body: 'online@zkb.ch Your card has been charged CHF 22.52 Purchase ZKB Visa Debit card No. xxxx 5387, BILLA DANKT .',
    reads: spent(2252, 'CHF'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Z%C3%BCrcher%20Kantonalbank-ch_16048
  {
    country: 'CH',
    app: 'ZKB',
    body: 'online@zkb.ch Your card has been credited CHF 32.70 Refund ZKB Visa Debit card no. xxxx 5387, digitec Galaxus (Online).',
    reads: got(3270, 'CHF'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Z%C3%BCrcher%20Kantonalbank-ch_16048
  {
    country: 'CH',
    app: 'ZKB',
    body: 'online@zkb.ch Your card has been charged CHF 86.32 Reservation ZKB Visa Debit card No. xxxx 5387, UBER   * EATS PENDING  .',
    reads: spent(8632, 'CHF'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'SE',
    app: 'Revolut',
    title: 'ICA',
    body: '🛒 You spent 325,69\u00a0kr SEK balance: 574,19\u00a0kr',
    reads: spent(32569, 'SEK'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'SE',
    app: 'Revolut',
    title: 'MyWay',
    body: '🍽️ Paid 99\u00a0kr at MyWay SEK Balance: 7\u00a0737,42\u00a0kr',
    reads: spent(9900, 'SEK'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'SE',
    app: 'Revolut',
    title: 'Refund arrived  🎉',
    body: "You've received a payment refund of SEK248.20 from ICA",
    reads: got(24820, 'SEK'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Klarna-se_16134
  {
    country: 'SE',
    app: 'Klarna',
    title: 'Maxi Ica Stormarknad',
    body: 'You made a 131,35 kr purchase with your Klarna Credit Card and earned cashback',
    reads: spent(13135, 'SEK'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Klarna-se_16134
  {
    country: 'SE',
    app: 'Klarna',
    title: 'Klarna',
    body: 'You got a 4 766 kr refund from Outnorth!',
    reads: got(476600, 'SEK'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Klarna-se_16134
  {
    country: 'SE',
    app: 'Klarna',
    title: 'AliExpress',
    body: 'Your payment of 630,92 kr will be charged on 28 December 2026. Tap to view details.',
    reads: skipped('balance'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/mBank-pl_15833
  {
    country: 'PL',
    app: 'mBank',
    title: 'Nowa wpłata',
    body: '2\u00a0910,00 PLN wpłynęło na Twoje konto.',
    reads: got(291000, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/mBank-pl_15833
  {
    country: 'PL',
    app: 'mBank',
    title: 'Nowa operacja kartą',
    body: '46,49 PLN w GOOGLE WORKSPACE_SHCNE WARSAW',
    reads: spent(4649, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/mBank-pl_15833
  {
    country: 'PL',
    app: 'mBank',
    title: 'BLIK zbliżeniowy',
    body: 'Płatność 12,99 PLN.',
    reads: spent(1299, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/ING%20Bank-pl_15589
  {
    country: 'PL',
    app: 'ING (Moje ING)',
    title: 'Moje ING. Twój Asystent',
    body: '10,00 PLN mniej na Twoim koncie - płatność kartą VISA zbliżeniowa',
    reads: spent(1000, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Autoryzacja transakcji kartą',
    body: 'Kwota: 332,00 PLN. Miejsce: DIAGNOSTYKA S.A., WARSZAWA. Data transakcji: 2026-07-07 08:55:29. Karta *2734 do konta 48..1012',
    reads: spent(33200, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Założenie blokady',
    body: 'Kwota: 53,39 PLN. Rachunek:  31..7970 Lokalizacja: BLIK INTERNET: ALLEGRO.PL',
    reads: spent(5339, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607 (names and numbers changed)
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Obciążenie konta',
    body: '-70,00 PLN Przelew z konta Konto odbiorcy: 87..9980 Odbiorca: JAN KOWALSKI    Tytuł: ZA KOREPETYCJE   Na koncie: 16..7069 Stan konta po transakcji:+3957,25 PLN',
    reads: spent(7000, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607 (names and numbers changed)
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Uznanie rachunku',
    body: '+20,00 PLN Przelew na telefon - odebrany Rachunek nadawcy: 47..6020 Nadawca: KOWALSKA ANNA Tytuł: PRZELEW BLIK NA TELEFON Na rachunku 61..8006 Data waluty: 2024-08-11',
    reads: got(2000, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Uznanie rachunku',
    body: '+90,71 PLN ZWROT BLIK    Nadawca: www.aliexpress.com/    Na rachunku 31..7970. Data waluty: 2020-10-21',
    reads: got(9071, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/PKO%20Bank%20Polski-pl_15607
  {
    country: 'PL',
    app: 'PKO BP (IKO)',
    title: 'Anulowanie transakcji WEB',
    body: 'Transakcja WEB została anulowana Data: 2023-03-31 17:15:13 Anulowana kwota:25,00 PLN',
    reads: got(2500, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Bank%20Millennium-pl_15513
  {
    country: 'PL',
    app: 'Bank Millennium',
    title: 'Bank Millennium',
    body: 'Brak wystarczających środków na karcie Visa Millennium 360 o numerze **** **** **** 0870.',
    reads: skipped('failed'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Bank%20Millennium-pl_15513 (names and numbers changed)
  {
    country: 'PL',
    app: 'Bank Millennium (SMS)',
    body: 'Operacja nr 1 z dn. 10-03-2018 Przelew krajowy  z rach.: 0123456789 na rach.: 38 10...00388983 kwota: 1,300.00 PLN     HasloSMS: 123456',
    reads: skipped('code'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander%20Polska-pl_15738
  {
    country: 'PL',
    app: 'Santander Bank Polska (Alerty24 SMS)',
    body: 'Alerty24: wplyw na konto ...147534704 * 12 783,30 PLN od PLAYTIKA POLAND SP. 08-04-2021 * Saldo po operacji: 13 205,01 PLN',
    reads: got(1278330, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Santander%20Polska-pl_15738
  {
    country: 'PL',
    app: 'Santander Bank Polska (Alerty24 SMS)',
    body: 'Alerty24: platnosc karta na kwote -458,13 PLN 28-03-2021 Dopasowana Visa 1111 AUCHAN POLSKA SP. Z 02 WARSZAWA',
    reads: spent(45813, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Cr%C3%A9dit%20Agricole-pl_16038
  {
    country: 'PL',
    app: 'Credit Agricole PL',
    title: 'Nowa transakcja kartowa',
    body: 'Kwota: 147.58 PLN, carVertical, Vilnius, LT, 31.05.2026',
    reads: spent(14758, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'PL',
    app: 'Revolut',
    title: 'Delight Kebab And Grill S',
    body: 'Zapłacono 39\u00a0zł w: Delight Kebab And Grill S. Saldo konta „PLN”: 187,63\u00a0zł.',
    reads: spent(3900, 'PLN'),
  },
  // https://github.com/zenmoney/sms-formats/tree/main/src/Revolut_15693
  {
    country: 'PL',
    app: 'Revolut',
    title: 'Zweryfikuj płatność online 💵',
    body: 'Stuknij tutaj, aby zweryfikować następującą płatność kartą: 97.69 PLN — Google.',
    reads: skipped('code'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv (names and numbers changed)
  {
    country: 'TR',
    app: 'Garanti BBVA (Bonus)',
    body: "5 Mayis'a kadar 123456 ile biten kartinizla 50TL ve uzeri ilk taksitli alisverisinize 20TL BONUS! KARAR yazin kart son 6haneyi 3340'a gonderin! bonus.com.tr/x",
    reads: skipped('promo'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv
  {
    country: 'TR',
    app: 'Garanti BBVA (Bonus)',
    body: '1675.09TL EKSTRELI KARTINIZIN,MIN.TUTARINI ODEYIP AYLIK SADECE %2.02 FAIZ (VERGILER HARIC) ILE 1AY ERTELEMEK ICIN 20.08.2015 TARIHINE KADAR ATLAT,KART SON 6NOYU 3340A GONDER. SIZE OZEL INDIRIM VE KAMPANYALARIMIZ ILE ILGILI UCRETSIZ SMS ALMAK ISTEMIYORSANIZ SMSIPTAL YAZIP 3344 GONDERİN',
    reads: skipped('promo'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv
  {
    country: 'TR',
    app: 'Garanti BBVA (Bonus)',
    body: "BONUS PLATINUM'LA BU ISLEMDEN %10 INDIRIM KAZANDINIZ! INDIRIM TUTARI 4 SUBAT 2016 TARIHINDE KARTINIZA YUKLENECEKTIR. BILGI: BONUS.COM.TR",
    reads: skipped('promo'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv
  {
    country: 'TR',
    app: 'VakıfBank',
    body: 'Kampanya: 1100.00 TL tutarindaki isleminizi aylik 378.98 TL lik taksitle 3 ayda odemek icin BOL yazip bosluk birakin, 02 yazin 6635e gonderin. Aylik faiz yuzde 1.39, yillik maliyet yuzde 20.01 dir. Kampanya SMS istemiyorsaniz VBRED yazin 6757ye ucretsiz gonderin.',
    reads: skipped('promo'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv (names and numbers changed)
  {
    country: 'TR',
    app: 'unknown card issuer (Opet campaign)',
    body: "15 Nisan'a kadar 12**3456 nolu kartınızla tek seferde 2 adet 150 TL ve üzeri yakıt alımınıza OPET'te harcanabilir 5 kat puan.Puan son kullanım tarihi 15 Mayıs.",
    reads: skipped('promo'),
  },
  // https://github.com/onrkrsy/TurkishSMS-Collection/blob/main/TurkishSMSCollection.csv
  {
    country: 'TR',
    app: 'İş Bankası',
    body: 'Bankamatik Karti\'nizla 15-31 Ocak arasi yapacaginiz toplam 200TL ve uzeri Giyim ya da Restoran harcamaniza tam 15TL MaxiPuan!Katilim icin "Maxipuan" yazip 4402\'ye gonderin. Bilgi: www.isbank.com.tr/?issp=egl1 ',
    reads: skipped('promo'),
  },
  // https://www.posta.com.tr/galeri/kartta-gece-yarisi-operasyonu-on-binlerce-lirasi-gidecekti-o-mesaj-kurtardi-2968085
  {
    country: 'TR',
    app: 'unknown bank',
    body: 'Kredi kartınız alışverişe kapatıldığı için bu işlem onaylanmamıştır',
    reads: skipped('failed'),
  },
];
