import { got, skipped, spent, type WorldAlertSample } from './world-alerts';

/** Real alerts from Latin America, as public sources quote them (`world-alerts`). */
export const LATIN_AMERICA_ALERTS: readonly WorldAlertSample[] = [
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Compra no crédito aprovada',
    body: 'Compra de R$ 23,99 APROVADA em Google One para o cartão com final 1234.',
    reads: spent(2399, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Compra no débito aprovada',
    body: 'Compra de R$ 44,90 em NETFLIX ENTRETENIMENTO',
    reads: spent(4490, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Compra no crédito negada',
    body: 'Compra de R$ 58,67 NEGADA em OPENCODE para o cartão com final 1234, pois o limite disponível não é suficiente.',
    reads: skipped('failed'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Transferência recebida',
    body: 'Você recebeu uma transferência de R$ 45,00 de Maria Souza Lima.',
    reads: got(4500, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Transferência recebida',
    body: 'Recebemos sua transferência de R$\u00a0150,00.',
    reads: got(15000, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Nubank',
    title: 'Nubank',
    body: 'Recebemos seu pagamento no valor de R$ 1.263,10. Obrigado!',
    reads: skipped('balance'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Nubank',
    title: 'NuCel por apenas R$1/dia',
    body: 'Preço fixo, sem pegadinhas e sem letrinhas miúdas. Garanta sua oferta exclusiva de R$1 por dia direto no app do Nu.',
    reads: skipped('promo'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Sua compra foi aprovada 💳',
    body: 'Olá! Compra aprovada de R$ 10,29 em DL *UberRides no dia 05/11 às 20:44 no seu cartão Itau. Boas compras.',
    reads: spent(1029, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Sua compra foi aprovada 💳',
    body: 'Olá! Compra aprovada de USD 20.00 em FACTORY AI no dia 03/11 às 13:30 no seu cartão Itau. Boas compras.',
    reads: spent(2000, 'USD'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Segurança Cartoes Itau',
    body: 'Olá, foi negada a compra no cartão final 1234 no valor de R$119.23 em FACTORY AI no dia 03/11. Para desbloquear seu cartão e poder refazer a compra, clique aqui.',
    reads: skipped('failed'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Feito. Pix enviado',
    body: 'Você enviou R$ 500,00 para JOAO, CPF XXX.123.456-XX.',
    reads: spent(50000, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Pix recebido',
    body: 'Você recebeu R$ 430,65 de ANA, CPF XXX.654.321-XX.',
    reads: got(43065, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Seu pagamento foi feito',
    body: 'O boleto de R$\u00a01.251,74 para SOCIEDADE MINEIRA DE CULT foi pago. Confira no extrato',
    reads: spent(125174, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Itaú',
    title: 'A fatura do cartão final 1234 fechou',
    body: 'O total é de R$ 676,96 e vence em 10/11/2026. Confira detalhes',
    reads: skipped('balance'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Itaú',
    title: 'Você tem um novo boleto',
    body: 'Confira o boleto de R$ 676,96 emitido por Itau Unibanco Holding S.a., que vence em 10/11. Você já pode pagar ou agendar',
    reads: skipped(),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Inter',
    title: 'Pix recebido',
    body: 'Maria Oliveira Santos te enviou um Pix de R$\u00a0450,00 creditado na sua conta final ***12345-6.',
    reads: got(45000, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Inter',
    body: 'Olá Pedro, você acaba de comprar no débito no DL*99 99 o valor de R$ 37,50.',
    reads: spent(3750, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus (names and numbers changed)
  {
    country: 'BR',
    app: 'Inter',
    title: 'Compra no crédito',
    body: 'Olá, Pedro. Você acaba de comprar R$ 29,00 em FLASH UTILIDADES. A compra foi no crédito nacional, com o cartão final 1234.',
    reads: spent(2900, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Inter',
    title: 'Pix Automático realizado',
    body: 'Tudo certo com o pagamento de R$\u00a012,90 feito à Ebanx em 23/10/2026.',
    reads: spent(1290, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Você pagou Uber',
    body: 'Debitamos R$ 4,89 da sua conta.',
    reads: spent(489, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Você pagou R$ 78,02 a Amazon',
    body: 'O valor vai entrar na próxima fatura do seu Cartão Mercado Pago.',
    reads: spent(7802, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Devolução de R$ 9,73 do Pix',
    body: 'Você pode conferir mais detalhes na atividade.',
    reads: got(973, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Você ganhou R$ 0,39 de cashback',
    body: 'Continue usando seu Cartão de Crédito Mercado Pago para ganhar mais.',
    reads: got(39, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Seu cartão de crédito com R$9.600 está disponível! 🎉',
    body: 'Sem anuidade e parcelamento em até 18x. Ideal para impulsionar suas vendas!',
    reads: skipped(),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Mercado Pago',
    title: 'Mercado Pago',
    body: 'Houve um acesso em sua conta a partir de um novo dispositivo, foi você?',
    reads: skipped(),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Caju',
    title: 'Pagamento aprovado',
    body: 'Compra de R$ 20,00 em Tia Sol Comida Mineira APROVADA no CRÉDITO, seu saldo em AUXÍLIO ALIMENTAÇÃO é R$ 1187,68.',
    reads: spent(2000, 'BRL'),
  },
  // https://github.com/oDaviML/pingo-android/tree/main/core/parser/src/test/resources/corpus
  {
    country: 'BR',
    app: 'Caju',
    title: 'Seu Caju caiu!',
    body: 'Oba! R$ 830,00 disponíveis no seu Caju. Aproveite!',
    reads: got(83000, 'BRL'),
  },
  // https://github.com/ry-diffusion/Garden/blob/develop/Garden/Ledger/NotificationParser.swift
  {
    country: 'BR',
    app: 'BTG Pactual',
    title: 'Transação Pix Confirmada',
    body: 'A transferência Pix de R$ 900,00 foi confirmada.',
    reads: spent(90000, 'BRL'),
  },
  // https://github.com/ry-diffusion/Garden/blob/develop/Garden/Ledger/NotificationParser.swift (names and numbers changed)
  {
    country: 'BR',
    app: 'BTG Pactual',
    title: 'Pix Recebido',
    body: 'Você recebeu um Pix de Cliente Exemplo Tecnologia Ltda 12.345.678/0001-90 no valor de R$ 6.000,00 - Prestação de serviço.',
    reads: got(600000, 'BRL'),
  },
  // https://github.com/davidojedalopez/notifications_to_ynab/blob/main/docs/notification-examples.md
  {
    country: 'MX',
    app: 'Nu México',
    title: 'Compra aprobada por $155.00',
    body: 'Compraste en ALTURA PADEL CLUB con tu tarjeta por $155.00',
    reads: spent(15500, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/nu-card-purchase.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Nu México',
    title: 'Compra aprobada por $123.45',
    body: 'Compraste en COMERCIO FICTICIO con tu tarjeta con terminación 0123 por $123.45.',
    reads: spent(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/blob/master/tests/capture-nu-transfer-duplicates.test.ts (names and numbers changed)
  {
    country: 'MX',
    app: 'Nu México',
    title: 'Transferencia exitosa',
    body: 'Enviaste $275.40 a BANCO FICTICIO.',
    reads: spent(27540, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/nu-card-payment.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Nu México',
    title: 'Recibimos tu pago por $123.45',
    body: '¡Muchas gracias! Con tu pago a tiempo mantienes un buen historial y evitas recargos. ¡Sigue así!',
    reads: skipped('balance'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/nu-cfe-service-payment.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Nu México',
    title: 'Tu pago a CFE fue exitoso',
    body: 'El pago de $123.45 a CFE fue exitoso.',
    reads: spent(12345, 'MXN'),
  },
  // https://github.com/davidojedalopez/notifications_to_ynab/blob/main/docs/notification-examples.md
  {
    country: 'MX',
    app: 'BBVA México',
    title: 'Compra en',
    body: 'COMPRA TDC EN JAPAC MU $276.00 15 mayo 02:19h',
    reads: spent(27600, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/bbva-debit-card-charge.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'BBVA México',
    title: 'Compra con TDD',
    body: 'Compra con TDD 0123 en MERPAGO*TARJETADE $67.89 23 octubre 00:11h',
    reads: spent(6789, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/banamex-card-charge.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Citibanamex',
    body: 'Retiro/Compra COMERCIO FICTICIO CIUDAD -  ADICIONAL 123 monto $ 123.45 el 20/10/26 08:28:47 PM. Auto. 999111',
    reads: spent(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/banamex-joy-card-charge.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Citibanamex',
    body: 'Retiro/Compra COMERCIO FICTICIO     CIUDAD JOY BANAMEX456 monto $123.45 el 20/10/26 04:21:22 PM. Auto. 999111',
    reads: spent(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/banamex-purchase-cancellation.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Citibanamex',
    title: 'Notificacion',
    body: 'CANCELADA compra por $ 123.45 con su tarjeta JOY BANAMEX 123 en COMERCIO FICTICIO el 24/10/2026 12:00:00 PM',
    reads: got(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/banamex-card-payment.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Citibanamex',
    title: 'Notificacion',
    body: 'Deposito SPEI 001234 JOY BANAMEX 123 monto $123.45 el 23/10/26 00:10:00 AM. Auto. 654321',
    reads: got(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/santander-card-purchase.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Santander México',
    title: 'Compra con tarjeta',
    body: 'En COMERCIO FICTICIO por $$123.45 MXN con tarjeta de credito **0123, el 20/10/2026 a las 14:49:02 hrs.',
    reads: spent(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/mercadopago-card-purchase.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Mercado Pago',
    title: 'Compra por $ 123 fue aprobada',
    body: 'Ve los detalles de tu compra en COMERCIO FICTICIO aquí.',
    reads: spent(12300, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/mercadopago-refund.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Mercado Pago',
    title: 'COMERCIO FICTICIO te devolvió $123.45',
    body: 'Para más detalles, entra aquí.',
    reads: got(12345, 'MXN'),
  },
  // https://github.com/minnica/afp/tree/master/tests/fixtures/captures/mercadopago-card-payment.es.v1.json (names and numbers changed)
  {
    country: 'MX',
    app: 'Mercado Pago',
    title: 'Pagaste $ 67.89 a tu tarjeta de crédito',
    body: '¡Cubriste el total y liberaste límite!',
    reads: skipped('balance'),
  },
];
