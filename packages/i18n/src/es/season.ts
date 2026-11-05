import type { Entry } from '../catalogue-types';
import type { enSeason } from '../en-season';

export const esSeason: { readonly [Key in keyof typeof enSeason]: Entry } = {
  'season.festival.tet': 'Tết',
  'season.festival.seollal': 'Año Nuevo coreano',
  'season.festival.chunjie': 'Año Nuevo chino',
  'season.envelope.tet': 'Lì xì',
  'season.envelope.seollal': 'Dinero de Año Nuevo',
  'season.envelope.chunjie': 'Sobres rojos',

  'season.card.title': '¿Una hucha para {festival}?',
  'season.card.sub': {
    one: 'Queda una semana para {festival}. Llénala un poco cada día de cobro.',
    other: 'Quedan {count} semanas para {festival}. Llénala un poco cada día de cobro.',
  },
  'season.card.open': 'Crearla',
  'season.card.later': 'Ahora no',

  'season.offer.later': 'Luego',
  'season.offer.title': 'Una hucha para {festival}',
  'season.offer.kicker': {
    one: '{festival} · 1 semana',
    other: '{festival} · {count} semanas',
  },
  'season.offer.perPay': {
    one: '{amount} el día de cobro · 1 cobro',
    other: '{amount} cada día de cobro · {count} cobros',
  },
  'season.offer.ask.gifts': 'Regalos para casa',
  'season.offer.ask.trip': 'El viaje a casa',
  'season.offer.none': 'Nada',
  'season.offer.daily': 'Cada día hasta {festival}',
  'season.offer.start': 'Empezar la hucha de {festival}',

  'season.bonus.kicker': 'DINERO QUE ENTRA',
  'season.bonus.title': '¿Tu paga extra de {festival}?',
  'season.bonus.slipJar': 'Hucha de {festival}',
  'season.bonus.jarFull': 'Hucha de {festival} · llena',
  'season.bonus.jarIn': 'Hucha de {festival} · +{amount}',
  'season.bonus.today': 'HOY',
  'season.bonus.payday': '{date} · DÍA DE COBRO',
  'season.bonus.spread': '{amount} repartido · +{daily} al día hasta el {date}',
  'season.bonus.allIn': 'Todo va a la hucha',
  'season.bonus.yes': 'Sí, repártelo así',
  'season.bonus.yesAll': 'Sí, a la hucha',
  'season.bonus.save': 'Mejor guardar {amount}',

  'season.quick.keypad': 'Teclado',
  'season.quick.voice': 'Voz',
  'season.quick.given': 'Dado',
  'season.quick.received': 'Recibido',
  'season.quick.count': {
    one: '1 sobre × {each}',
    other: '{count} sobres × {each}',
  },
  'season.quick.total': '= {amount}',
  'season.quick.fromJar': 'De la hucha de {festival}',
  'season.quick.jarLeft': '{from} → quedan {to}',
  'season.quick.counts': 'Cuenta para hoy',
  'season.quick.countsSub': 'No hay hucha de {festival} de la que sacarlo',
  'season.quick.saved': 'Para tu yo del futuro',
  'season.quick.savedSub': 'Sugerido. No sube el número del día.',
  'season.quick.keep': 'Guardar',
  'season.quick.less': 'Un sobre menos',
  'season.quick.more': 'Un sobre más',
  'season.quick.merchant': {
    one: '{name} · 1 sobre',
    other: '{name} · {count} sobres',
  },

  'season.kicker.countdown': {
    one: 'Falta 1 día para {festival}',
    other: 'Faltan {count} días para {festival}',
  },
  'season.kicker.holiday': '{festival}, día {day}',
  'season.card.saved': 'Sugerido: guárdalo para tu yo del futuro',
};
