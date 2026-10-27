import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// Each `{range}` carries its own preposition ("hoy", "en el último mes", "del 3 al 9"), so the
// answers read whichever range fills them. "Has gastado" covers past and current spans alike.
export const esAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': 'hoy',
  'ask.range.yesterday': 'ayer',
  'ask.range.thisWeek': 'esta semana',
  'ask.range.lastWeek': 'la semana pasada',
  'ask.range.thisCycle': 'desde el día de cobro',
  'ask.range.lastCycle': 'en el ciclo de pago anterior',
  'ask.range.thisMonth': 'este mes',
  'ask.range.lastMonth': 'el mes pasado',
  'ask.range.last7Days': 'en la última semana',
  'ask.range.last30Days': 'en el último mes',
  'ask.range.dates': 'del {from} al {to}',

  'ask.answer.spent': {
    one: 'Has gastado {total} {range}, en un solo gasto.',
    other: 'Has gastado {total} {range}, en {count} gastos.',
  },
  'ask.answer.spentOn': {
    one: 'Has gastado {total} en {category} {range}, una vez.',
    other: 'Has gastado {total} en {category} {range}, {count} veces.',
  },
  'ask.answer.spentAt': {
    one: 'Has gastado {total} en {merchant} {range}, en una visita.',
    other: 'Has gastado {total} en {merchant} {range}, en {count} visitas.',
  },
  'ask.answer.spentNone': 'No has gastado nada {range}.',
  'ask.answer.spentNoneOn': 'Nada en {category} {range}.',
  'ask.answer.spentNoneAt': 'Nada en {merchant} {range}.',
  'ask.answer.breakdown': 'De los {total} gastados {range}, lo que más se llevó fue {top}.',
  'ask.answer.compared.up': 'Sube: {now} {range}, frente a {before} {against}.',
  'ask.answer.compared.down': 'Baja: {now} {range}, frente a {before} {against}.',
  'ask.answer.compared.same': 'Más o menos igual: {now} {range}, {before} {against}.',
  'ask.answer.listed': {
    one: 'Un gasto {range}: {total}.',
    other: '{count} gastos {range}, {total} en total.',
  },
  'ask.answer.listedMore': 'Y {more} más.',
  'ask.answer.listedNone': 'No hay gastos así {range}.',
  'ask.answer.bills': {
    one: 'Queda una factura antes del día de cobro: {total}.',
    other: 'Quedan {count} facturas antes del día de cobro, {total} en total.',
  },
  'ask.answer.billsNone': 'No quedan facturas antes del día de cobro.',
  'ask.answer.how': 'Esto es lo que destaca ahora mismo.',
  'ask.answer.howNothing': 'Todo tranquilo de momento. Nada destaca todavía.',
  'ask.answer.noSuchCategory':
    'No encuentro ninguna categoría {category}. Pregúntame por una de las tuyas.',
  'ask.answer.noRange': 'Aún no hay nada que mirar para eso.',
  'ask.answer.chat': 'Cuando quieras. Pregúntame por tu dinero siempre que te apetezca.',
  'ask.answer.partial': 'Esto cuenta lo que 6pm ha guardado desde el {since}.',
  'ask.row.total': 'Total',
  'ask.row.before': 'Antes',
  'ask.answer.goalPace.months': {
    one: 'Con {monthly} al mes para tu yo del futuro, {amount} para {what} te lleva cerca de un mes, hacia {month}.',
    other:
      'Con {monthly} al mes para tu yo del futuro, {amount} para {what} te lleva unos {count} meses, hacia {month}.',
  },
  'ask.answer.goalPace.years': {
    one: 'Con {monthly} al mes para tu yo del futuro, {amount} para {what} te lleva cerca de un año, hacia {month}.',
    other:
      'Con {monthly} al mes para tu yo del futuro, {amount} para {what} te lleva unos {count} años, hacia {month}.',
  },
  'ask.answer.goalPace.note': 'Una hucha solo para eso separa ese dinero del resto.',
  'ask.answer.goalNoPace':
    'Todavía no va nada a tu yo del futuro cada mes, así que no hay ritmo con el que calcular {amount} para {what}. Un poco cada mes y empezamos.',
  'ask.answer.goalAmount':
    '¿Cuánto cuesta más o menos {what}? Dime el precio, como “{example}”, y te hago la cuenta.',
  'ask.row.reachedBy': 'Hacia',
};
