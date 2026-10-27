import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// Ask doing things, always confirmed first, and how 6pm works in a few plain sentences. The spoken
// examples stay in Vietnamese, as the English keeps them.
export const esAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': 'Añadir',
  'ask.action.notNow': 'Ahora no',
  'ask.action.confirmSpend': '¿Añado {name}, {amount}, a {category}?',
  'ask.action.added': 'Añadido. {name}, {amount}, cuenta para hoy.',
  'ask.action.cancelled': 'Vale, no ha cambiado nada.',
  'ask.action.failed': 'No se ha guardado. Prueba con Añadir rápido.',
  'ask.action.confirmPot': 'Una hucha para {name}: {goal}. ¿La creo?',
  'ask.action.confirmPotBy': 'Una hucha para {name}: {goal} para {month}. ¿La creo?',
  'ask.action.setUp': 'Crearla',
  'ask.action.potLocked':
    'La versión gratis incluye una hucha propia, y la tuya ya está en uso. Con Max caben más.',
  'ask.action.seeMax': 'Ver Max',
  'ask.action.potGoal': '¿Cuánto necesitas para {name}? Dímelo, como “10tr”.',
  'ask.action.showMe': 'Enséñame cómo',
  'ask.action.openQuickAdd': 'Abrir Añadir rápido',
  'ask.howTo.ways':
    'Seis formas de entrar: Añadir rápido (escrito o dicho), compartir con 6pm un comprobante del banco, reenviar correos de recibos, escanear un VietQR para pagar, los pagos con Apple Pay, que llegan solos, y los widgets y controles. Lo que 6pm pilla espera en tu Bandeja hasta el cierre.',
  'ask.howTo.quickAdd':
    'Añadir rápido acepta un gasto escrito o dicho en voz alta, como “trà sữa 45k”. O dímelo aquí sin más: “vừa ăn phở 50k”.',
  'ask.howTo.dailyNumber':
    'Tu número del día es el dinero libre de este ciclo de pago, después de facturas, tu yo del futuro y huchas, repartido entre los días que faltan para cobrar. Gasta por debajo y el de mañana crece; pásate y el de mañana baja un poco.',
  'ask.howTo.negative':
    'Baja de cero cuando lo gastado en este ciclo supera su dinero libre. No se rompe nada: el plan lo reparte entre los días que quedan. Afloja unos días, o saca algo de una hucha en Plan.',
  'ask.howTo.pot':
    'Una hucha es dinero apartado para una cosa, como un viaje o el Tết. 6pm mete un poco cada mes y lo deja fuera de tu número del día, para que esté ahí cuando lo necesites.',
  'ask.howTo.close':
    'A las 6pm cierras el día: guardas o descartas lo que se ha pillado y ves dónde has quedado. Si te lo saltas, no se pierde nada; los gastos pillados esperan, y cuentan, hasta que decidas.',
  'ask.howTo.budget':
    '6pm no tiene presupuesto por categoría. Tu número del día es el presupuesto: las facturas, tu yo del futuro y las huchas ya están apartados. Para gastar menos en algo, crea una hucha o dale más a tu yo del futuro en Plan.',
};
