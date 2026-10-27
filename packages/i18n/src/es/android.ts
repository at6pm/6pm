import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: "este teléfono" for the iPhone, Google Play for the App Store, a backup
// key that never leaves the phone, and no Apple product named anywhere.
export const esAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    'Tres formas de entrar: Añadir rápido (escrito o dicho), escanear un QR o un ticket, y reenviar correos de recibos. Lo que 6pm pilla espera en tu Bandeja hasta el cierre.',
  'capture.share.headline':
    'Guarda el comprobante como imagen y elígelo en Escanear. Yo leo el importe.',
  'capture.wallet.headline':
    'Este teléfono no tiene Apple Pay. Reenvía los correos de recibos de tu tarjeta y aparecerán solos.',
  'capture.widgets.headline':
    'No hay widgets de 6pm en este teléfono. Mantén pulsado el botón de escanear y se abre Añadir rápido.',

  'backup.row.on': 'Cifrada · {when}',
  'backup.status.sub': {
    one: '{count} elemento · cifrado. 6pm funciona igual sin ella.',
    other: '{count} elementos · cifrados. 6pm funciona igual sin ella.',
  },
  'backup.status.neverSub': 'Cifrada. 6pm funciona igual sin ella.',
  'backup.off.sub':
    'Se sella en este teléfono antes de salir. La clave se queda en este teléfono, así que no podemos leer nada.',
  'backup.tooLarge':
    'La última copia era demasiado grande para enviarla. Todo sigue en este teléfono.',
  'backup.note':
    'Se hace una copia al día, después del cierre. La clave nunca sale de este teléfono, así que la copia solo se abre aquí, no en un teléfono nuevo.',
  'backup.paused':
    'La copia de seguridad está en pausa sin Max. Tu última copia sigue a salvo, cifrada.',
  'backup.found.title': 'Ya hay una copia de seguridad de este teléfono.',
  'backup.found.sub':
    'Viene de una instalación anterior. Si haces la copia desde aquí, la sustituirá.',
  'backup.found.restoreConfirm': 'Toca otra vez para sustituir los días de este teléfono',
  'backup.found.replace': 'Sustituirla por este teléfono',
  'backup.restore.sub': {
    one: '{count} elemento · cifrado.',
    other: '{count} elementos · cifrados.',
  },
  'backup.restore.none': 'No hay ninguna copia de seguridad de este teléfono.',
  'backup.restore.wrongKey': 'La clave de este teléfono no puede abrir esta copia.',
  'backup.error.keychain':
    'Este teléfono no ha guardado la clave, así que no se ha copiado nada. Inténtalo de nuevo.',
  'backup.error.tooLarge':
    'Esta copia es demasiado grande para enviarla. Todo sigue en este teléfono.',

  'capture.email.sub': 'Sin dirección de reenvío en este teléfono',
  'capture.scan.tip':
    'Mantén pulsado el botón de escanear para Añadir rápido cuando no haya código que escanear.',
  'onboarding.catch.add.body':
    'Mantén pulsado el botón de escanear para Añadir rápido y di “café {amount}”.',
  'today.list.empty':
    'Aún no se ha pillado nada. Escanea un QR o un ticket, o toca + cuando gastes.',

  'looks.restore.none': 'No hay nada que restaurar en esta cuenta de Google.',
  'looks.restore.failed': 'No se ha podido conectar con Google Play. Inténtalo de nuevo.',
  'looks.legal':
    'Los estilos son compras únicas en tu cuenta de Google. Max es una suscripción que puedes cancelar cuando quieras en Google Play. Los precios los muestra Google Play.',
  'look.buying': 'Esperando a Google Play…',
  'look.noteStoreOff':
    'Google Play no responde, así que este estilo no se puede comprar ahora mismo.',
  'max.cta.waiting': 'Esperando a Google Play…',
  'max.terms.storeOff': 'Ahora mismo no se puede comprar Max: Google Play no responde.',
  'max.sub.backup': 'Copia de seguridad cifrada, historial completo, CSV y Hojas de cálculo.',
  'max.note.backup': 'Copia cifrada, CSV y Hojas de cálculo',
  'max.welcome.win.more': 'Huchas, viajes y el Anuario',

  'privacy.ai.device.title': 'Solo en este teléfono',
  'privacy.ai.device.unavailable': 'Este teléfono no tiene memoria para un modelo propio.',
  'settings.ai.device': 'En este teléfono',
  'privacy.leaves.device.none': 'Nada de IA. Todo se calcula en este teléfono.',
  'receiptEmail.deviceMode': 'Desactivado mientras la IA siga en este teléfono',
  'receiptEmail.deviceMode.body':
    'El correo de recibos necesita que nuestro servidor lea tu correo, así que está desactivado mientras 6pm mantenga la IA en este teléfono. Escanea el ticket en su lugar.',
  'settings.privacyBody':
    'Tu dinero se queda en este teléfono, cifrado. Para leer tus preguntas de Pregunta a 6pm y escribir las frases de tu compañero, 6pm envía a Anthropic, un servicio de IA, la pregunta o unos pocos datos de tu día: importes, lugares y nombres de categorías, nunca tu lista de gastos. Una foto de ticket que tu teléfono no pueda leer también va allí. Anthropic no entrena con ellos y los borra en 30 días. Cuando dices un gasto en voz alta, tu voz va a Deepgram para pasarla a texto. En IA, más arriba, puedes dejar todo esto en este teléfono. La copia de seguridad solo sale si la activas, con cifrado de extremo a extremo. Los informes de fallos van a Sentry sin importes, nombres ni notas, y RevenueCat gestiona las compras.',

  'scan.handoff.store': '{wallet} no está en este teléfono',
  'scan.handoff.savedQr':
    'QR guardado en tu galería: escanéalo desde tus fotos en la app del banco. Te preguntaré cuando vuelvas.',
  'sharing.saved': 'Guardado en tu galería.',
  'sharing.photosOff': '6pm no tiene acceso a tus fotos.',

  'startup.failedSub':
    'No se ha perdido nada. Inténtalo de nuevo y, si sigue pasando, reinicia el teléfono.',
  'voice.unavailable': 'La voz necesita el dictado en {language} en este teléfono',
};
