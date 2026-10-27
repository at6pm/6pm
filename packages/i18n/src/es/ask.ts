import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// "Pregunta a 6pm" is the feature; answers speak in the first person and show the sums plainly.
export const esAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': 'Pregunta a 6pm',
  'ask.sub': 'Qué cabe, qué pasaría si, cuándo se cubre',
  'ask.back': 'Atrás',
  'ask.intro':
    'Pregunta qué cabe, cómo cambia tus días un gasto grande o cuándo se llena una hucha. Te enseño las cuentas.',
  'ask.try': 'Prueba',
  'ask.placeholder': 'Pregunta o dilo sin más…',
  'ask.send': 'Enviar',
  'ask.speak': 'Preguntar en voz alta',
  'ask.listening': 'Escuchando…',
  'ask.suggest.afford': '¿Puedo permitirme una cena de {amount} el sábado?',
  'ask.suggest.weekend': '¿Cuánto tengo para este finde?',
  'ask.suggest.spend': '¿Y si me compro una chaqueta de {amount}?',
  'ask.suggest.pot': '¿Cuándo se llena la hucha {pot}?',
  'ask.suggest.save': '¿Debería ahorrar más?',
  'ask.meter': 'Te quedan {left} de {total} preguntas gratis hoy',
  'ask.unlimitedWith': 'Ilimitadas con',
  'ask.locked.title': 'Ya van las {total} preguntas de hoy',
  'ask.locked.sub': 'Más mañana, o ilimitadas con Max',
  'ask.locked.cta': 'Hazte Max',
  'ask.bar.now': 'Ahora',
  'ask.bar.after': 'Después',
  'ask.bar.perDay': '{amount} al día',
  'ask.bar.nothing': 'no queda nada',
  'ask.row.free': 'Libre hasta el día de cobro',
  'ask.row.this': 'Esto',
  'ask.row.leftPerDay': 'Queda al día',
  'ask.row.safeToday': 'Puedes gastar hoy',
  'ask.row.tomorrow': 'Mañana',
  'ask.row.futureYou': 'Tu yo del futuro al mes',
  'ask.row.moving': 'Apartar más',
  'ask.row.inPot': 'En la hucha',
  'ask.row.goal': 'Objetivo',
  'ask.row.perMonth': 'Cada mes',
  'ask.answer.fitsToday': 'Sí, sin problema. Cabe en los {safe} de hoy, así que mañana no cambia.',
  'ask.answer.fits': 'Sí. Los días siguientes pasan de {from} a {to} hasta el día de cobro.',
  'ask.answer.tight': 'Puedes, pero va justo: los días siguientes bajan de {from} a {to}.',
  'ask.answer.tight.pots': 'Si sacas {take} de tus huchas, te quedarían {withPots} al día.',
  'ask.answer.notThisMonth':
    'Este mes no. Es más que todo tu dinero libre. Cabe después del día de cobro, el {payday}.',
  'ask.answer.notThisMonth.pots': 'O saca una parte de una hucha.',
  'ask.answer.weekend.two':
    'Unos {total} entre el {first} y el {second}, si los días anteriores siguen el plan.',
  'ask.answer.weekend.one': 'Unos {total} el {first}, si los días anteriores siguen el plan.',
  'ask.answer.weekend.none':
    'El día de cobro, el {payday}, llega antes del finde, así que entonces empieza un número nuevo.',
  'ask.answer.saveMore':
    'Apartar {amount} más para tu yo del futuro te costaría unos {perDay} al día hasta el día de cobro.',
  'ask.answer.saveMore.none':
    'Apartar {amount} más para tu yo del futuro apenas cambiaría tus días.',
  'ask.answer.saveMore.note': 'Puedes hacerlo desde Plan.',
  'ask.answer.potFull': 'Con {monthly} al mes, la hucha {pot} se llena hacia {month}.',
  'ask.answer.potFull.done': 'La hucha {pot} ya está llena.',
  'ask.answer.potFull.idle':
    'Ahora mismo no entra nada en la hucha {pot} cada mes, así que no se llenará sola.',
  'ask.answer.noSuchPot':
    'No encuentro ninguna hucha {pot}. Pregúntame por una de las tuyas, o créala en Plan.',
  'ask.answer.noPots': 'Aún no hay ninguna hucha. Crea una en Plan y te diré cuándo estará llena.',
  'ask.answer.today': 'Hoy puedes gastar {safe}. El número de mañana es {tomorrow}.',
  'ask.answer.today.used': 'El número de hoy ya está gastado. El de mañana es {tomorrow}.',
  'ask.answer.help':
    'Puedo decirte qué cabe, cómo cambia tus días un gasto grande o cuándo se llenará una hucha. Prueba “¿Puedo gastar {amount} el sábado?”',
  'ask.error': 'Algo ha fallado y no he podido responder. Inténtalo de nuevo.',
  'ask.answer.offline':
    'No he podido conectar con el servidor, así que ahora solo entiendo preguntas sencillas.',
};
