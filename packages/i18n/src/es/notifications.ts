import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const esNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'Día de cobro',
  'notify.channel.capture': 'Pillar gastos',
  'notify.channel.reminders': 'Tus recordatorios',

  'notify.close.leadSix': 'Son las seis.',
  'notify.close.leadAt': 'Son las {time}.',

  'notify.close.jarReady.soft': '{lead} Tu bote {jar} está listo.',
  'notify.close.jarReady.cheeky': '{lead} Tu bote {jar} está listo. Ve a echarle un ojo.',
  'notify.close.jarReady.roast': '{lead} Tu bote {jar} está listo. Quién lo diría.',
  'notify.close.jarReady.plain': '{lead} El bote {jar} está listo.',

  'notify.close.countdown.soft': {
    one: '{lead} Falta 1 día para {festival}.',
    other: '{lead} Faltan {count} días para {festival}.',
  },
  'notify.close.countdown.cheeky': {
    one: '{lead} Falta 1 día para {festival}. Ya casi.',
    other: '{lead} Faltan {count} días para {festival}. Ya cuelgan los farolillos.',
  },
  'notify.close.countdown.roast': {
    one: '{lead} Falta 1 día para {festival}. Agarra bien la cartera.',
    other: '{lead} Faltan {count} días para {festival}. Agarra bien la cartera.',
  },
  'notify.close.countdown.plain': {
    one: '{lead} Falta 1 día para {festival}.',
    other: '{lead} Faltan {count} días para {festival}.',
  },
  'notify.close.countdownJar.soft': {
    one: '{lead} Falta 1 día para {festival}. Tu hucha de {festival} tiene {amount}.',
    other: '{lead} Faltan {count} días para {festival}. Tu hucha de {festival} tiene {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    one: '{lead} Falta 1 día para {festival}. Tu hucha guarda {amount}.',
    other: '{lead} Faltan {count} días para {festival}. Tu hucha guarda {amount}.',
  },
  'notify.close.countdownJar.roast': {
    one: '{lead} Falta 1 día para {festival}. {amount} en la hucha. Vigílala.',
    other: '{lead} Faltan {count} días para {festival}. {amount} en la hucha. Vigílala.',
  },
  'notify.close.countdownJar.plain': {
    one: '{lead} Falta 1 día para {festival}. La hucha de {festival} tiene {amount}.',
    other: '{lead} Faltan {count} días para {festival}. La hucha de {festival} tiene {amount}.',
  },

  'notify.close.pay.soft': '{lead} Tu sueldo espera su sitio.',
  'notify.close.pay.cheeky': '{lead} Ha llegado el sueldo. Ven a darle trabajo.',
  'notify.close.pay.roast': '{lead} Llegó el sueldo. Colócalo antes de que se escape.',
  'notify.close.pay.plain': '{lead} Tu sueldo está pendiente de repartir.',

  'notify.close.bonus.soft': '{lead} Tu paga extra de {festival} espera su sitio.',
  'notify.close.bonus.cheeky': '{lead} Ha llegado tu paga extra de {festival}. Ven a repartirla.',
  'notify.close.bonus.roast':
    '{lead} Llegó la paga extra de {festival}. Colócala antes de que la encuentren las tiendas.',
  'notify.close.bonus.plain': '{lead} Tu paga extra de {festival} está pendiente de repartir.',

  'notify.close.payback.soft': '{lead} {name} te ha devuelto el dinero.',
  'notify.close.payback.cheeky': '{lead} {name} te ha devuelto el dinero. Amistad intacta.',
  'notify.close.payback.roast': '{lead} {name} te ha devuelto el dinero. De verdad.',
  'notify.close.payback.plain': '{lead} {name} te ha devuelto el dinero.',

  'notify.close.moneyIn.soft': '{lead} Ha entrado dinero. Te espera en el cierre.',
  'notify.close.moneyIn.cheeky': '{lead} Ha entrado dinero. Ven a decirle adónde va.',
  'notify.close.moneyIn.roast': '{lead} Ha entrado dinero. Que no se le ocurra nada raro.',
  'notify.close.moneyIn.plain': '{lead} Ha entrado dinero. Repártelo en el cierre.',

  'notify.close.yearCard.soft': '{lead} Tu {year} está listo para mirar atrás.',
  'notify.close.yearCard.cheeky': '{lead} Tu {year} está listo. ¿Quieres verlo?',
  'notify.close.yearCard.roast': '{lead} Tu {year} entero. ¿Te atreves a mirarlo?',
  'notify.close.yearCard.plain': '{lead} Tu {year} está listo para revisarlo.',

  'notify.payday.amounts.soft': 'Día de cobro. {jars} a tus botes, {daily} al día hasta el {date}.',
  'notify.payday.amounts.cheeky':
    '¡Día de cobro! {jars} a tus botes, {daily} al día hasta el {date}.',
  'notify.payday.amounts.roast':
    'Día de cobro. {jars} ahorrados en un parpadeo, {daily} al día hasta el {date}.',
  'notify.payday.amounts.plain':
    'Día de cobro. {jars} a los botes, {daily} al día hasta el {date}.',
  'notify.payday.noJars': 'Día de cobro. {daily} al día hasta el {date}.',
  'notify.payday.hidden': 'Día de cobro. Tus botes ya tienen lo suyo.',
  'notify.payday.hiddenNoJars': 'Día de cobro. Empieza un mes nuevo.',

  'notify.firstCatch.amounts.soft': 'Pillado el primero: {amount} · {name}. No hace falta más.',
  'notify.firstCatch.amounts.cheeky': 'Pillado el primero: {amount} · {name}. Fácil, ¿no?',
  'notify.firstCatch.amounts.roast': 'Pillado el primero: {amount} · {name}. Ni ha dolido.',
  'notify.firstCatch.amounts.plain': 'Primer gasto: {amount} · {name}.',
  'notify.firstCatch.hidden': 'Pillado el primero en {name}. No hace falta más.',
  'notify.firstCatch.noName': 'Pillado el primero. No hace falta más.',

  'notify.quiet.soft': 'Nada de {way} en {count} días. ¿Sigue activa la automatización?',
  'notify.quiet.cheeky':
    'Nada de {way} en {count} días. ¿Mucha calma, o se apagó la automatización?',
  'notify.quiet.roast':
    'Nada de {way} en {count} días. O eres pura disciplina o la automatización está apagada.',
  'notify.quiet.plain':
    'Nada de {way} en {count} días. Comprueba que la automatización siga activa.',
  'notify.quiet.yourAlerts': 'tus avisos del banco',

  'notify.owed.one.soft': '{name} aún te debe {amount}. Pídeselo cuando te venga bien.',
  'notify.owed.one.cheeky': '{name} aún te debe {amount}. ¿Toca un recordatorio amable?',
  'notify.owed.one.roast': '{name} aún te debe {amount}. Tu dinero te echa de menos.',
  'notify.owed.one.plain': '{name} aún te debe {amount}.',
  'notify.owed.oneHidden': '{name} aún te debe dinero. Pídeselo cuando te venga bien.',
  'notify.owed.noName': 'Aún te deben {amount}.',
  'notify.owed.noNameHidden': 'Alguien aún te debe dinero. Pídeselo cuando te venga bien.',
  'notify.owed.many': '{count} personas aún te deben {amount}.',
  'notify.owed.manyHidden': '{count} personas aún te deben dinero.',

  'settings.notifications': 'Notificaciones',
  'settings.notificationsOn': 'Activadas',
  'notify.settings.title': 'Notificaciones',
  'notify.settings.phone': 'En este teléfono',
  'notify.settings.allowed': 'Permitidas',
  'notify.settings.turnOn': 'Activar',
  'notify.settings.offInSettings': 'Desactivadas en Ajustes',
  'notify.settings.offSub': 'No te llega nada hasta que las actives.',
  'notify.settings.kinds': 'Qué envía 6pm',
  'notify.kind.close': 'Aviso de cierre',
  'notify.kind.close.sub': 'Cada día a las {time}, con las novedades del día',
  'notify.kind.payday': 'Día de cobro',
  'notify.kind.payday.sub': 'La mañana en que llega el sueldo, a las 08:30',
  'notify.kind.capture': 'Pillar gastos',
  'notify.kind.capture.sub': 'Tu primer gasto pillado, y una vía que se queda en silencio',
  'notify.kind.reminders': 'Tus recordatorios',
  'notify.kind.reminders.sub': 'Quién te debe, el día que elijas',
  'notify.settings.lockScreen': 'Pantalla bloqueada',
  'notify.settings.amounts': 'Importes en la pantalla bloqueada',
  'notify.settings.amounts.sub': 'Si lo apagas, los textos no llevan cifras',
  'notify.settings.note':
    'Una al día es el ritual: el aviso de cierre trae las novedades del día. Como mucho una más al día, y entre las 22:00 y las 08:00 solo tu cierre.',

  'owed.remind.button': 'Recuérdamelo',
  'owed.remind.threeDays': 'En 3 días',
  'owed.remind.week': 'En una semana',
  'owed.remind.payday': 'El día de cobro',
  'owed.remind.set': 'Recordatorio: {date}',
  'owed.remind.cancel': 'No me lo recuerdes',
  'owed.remind.toast': 'Te lo recuerdo: {date}, 10:00.',
  'owed.remind.off': 'Tus recordatorios están desactivados en Ajustes.',
};
