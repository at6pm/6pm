import type { Entry } from '../catalogue-types';
import type { enIntents } from '../en-intents';

// iOS's own Spanish names (Atajos, Cartera, pantalla de bloqueo, centro de control, botón de
// acción). The shared shortcut keeps its name “Log to 6pm”; spoken examples stay in Vietnamese.
export const esIntents: { readonly [Key in keyof typeof enIntents]: Entry } = {
  'capture.settings.title': 'Cómo se pillan los gastos',
  'capture.settings.summary': '{on} de {total} activados',
  'capture.status.on': 'Sí',
  'capture.status.off': 'No',
  'capture.settings.widgets': 'Widgets',
  'capture.settings.widgetsValue': 'Inicio y bloqueo',
  'capture.last': 'Último: {name} · {time}',

  'capture.guide.back': 'Ajustes',
  'capture.guide.howItWorks': 'Cómo funciona',
  'capture.guide.trouble': '¿No funciona?',
  'capture.guide.lands': 'Qué llega a tu Bandeja',
  'capture.guide.landsNote':
    'Espera ahí hasta que lo guardes en el cierre de las 6pm. Nada cuenta hasta que tú lo digas.',

  'capture.share.name': 'Compartir con 6pm',
  'capture.share.sub': 'Toca Compartir en un comprobante del banco y luego 6pm',
  'capture.share.headline': 'Comparte un comprobante del banco. Yo leo el importe.',
  'capture.share.time': 'Menos de un minuto',
  'capture.share.step1': 'Abre el comprobante de la transferencia en la app de tu banco',
  'capture.share.step2': 'Toca Compartir y luego 6pm',
  'capture.share.step2Chip': 'Compartir → 6pm',
  'capture.share.step3': 'Vuelve a lo tuyo. Ya está en tu Bandeja',
  'capture.share.step3Chip': 'Bandeja',
  'capture.share.tip':
    'Arrastra 6pm al principio de tu fila de compartir. Así queda a un toque de cualquier comprobante.',
  'capture.share.action': 'Fijar 6pm en Compartir',
  'capture.share.pinText': 'Toca Más, luego Editar y añade 6pm.',

  'capture.email.name': 'Correo de recibos',
  'capture.email.sub': 'Sin dirección de reenvío en este iPhone',
  'capture.email.headline': 'Reenvía tus recibos. Aparecen solos.',
  'capture.email.time': 'Dos minutos, una vez',
  'capture.email.step1': 'Copia tu dirección de 6pm',
  'capture.email.step1Chip': 'Tu dirección de 6pm',
  'capture.email.step2': 'Reenvíale un correo de Grab, Shopee o del banco',
  'capture.email.step2Chip': 'Reenviar',
  'capture.email.step3': 'O crea un filtro una vez para que se reenvíen solos',
  'capture.email.step3Chip': 'Filtro de Gmail u Outlook',
  'capture.email.tip':
    'Funciona mejor con los recibos electrónicos de Grab, Be, Shopee y los bancos. Los demás correos se ignoran.',
  'capture.email.sample': 'Grab de vuelta a casa',

  'capture.scan.name': 'Escanea y paga',
  'capture.scan.sub':
    'Escanea un VietQR para pagar en la app de tu banco, o un ticket para apuntarlo',
  'capture.scan.headline': 'Escanea, paga en la app de tu banco y vuelve.',
  'capture.scan.time': 'Cada vez que pagas',
  'capture.scan.step1': 'Escanea cualquier VietQR desde 6pm',
  'capture.scan.step1Chip': 'Escanear',
  'capture.scan.step2': 'Elige tu banco. Se abre con el importe listo',
  'capture.scan.step2Chip': 'Abrir tu banco',
  'capture.scan.step3': 'De vuelta en 6pm, toca Pagado. O te pregunto luego',
  'capture.scan.step3Chip': 'Pagado · Aún no',
  'capture.scan.tip':
    'Añade Escanear a tu pantalla de bloqueo o al botón de acción para no tener que desbloquear.',
  'capture.scan.action': 'Escanear ahora',

  'capture.wallet.name': 'Automatización de Cartera',
  'capture.wallet.subOn': 'Activada · pilla los pagos con Apple Pay',
  'capture.wallet.subOff': 'Actívala en Atajos para pillar Apple Pay',
  'capture.wallet.statusOn': 'Activada · cada pago',
  'capture.wallet.headline': 'Pilla los pagos con Apple Pay sin mover un dedo.',
  'capture.wallet.time': 'Un minuto, una vez',
  'capture.wallet.step1': 'Añade el atajo de 6pm',
  'capture.wallet.step1Chip': 'Log to 6pm',
  'capture.wallet.step2': 'En Atajos, añade una automatización de Cartera',
  'capture.wallet.step2Chip': 'Automatización → Cartera',
  'capture.wallet.step3': 'Haz que ejecute “Log to 6pm”',
  'capture.wallet.step3Chip': 'Ejecutar atajo',
  'capture.wallet.tip':
    'Los pagos traen el comercio y el importe. Tú los confirmas igual a las 6pm.',
  'capture.wallet.actionAdd': 'Añadir el atajo de 6pm',
  'capture.wallet.actionOff': 'Abrir Atajos',
  'capture.wallet.actionOn': 'Desactivar',

  'capture.widgets.name': 'Widgets y controles',
  'capture.widgets.sub': 'Pantalla de bloqueo · Centro de control · Botón de acción',
  'capture.widgets.headline': 'Apúntalo antes de que el teléfono vuelva al bolsillo.',
  'capture.widgets.time': 'Treinta segundos',
  'capture.widgets.step1': 'Mantén pulsada la pantalla de bloqueo y toca Personalizar',
  'capture.widgets.step1Chip': 'Pantalla de bloqueo',
  'capture.widgets.step2': 'Añade Escanear o Añadir rápido de 6pm',
  'capture.widgets.step2Chip': '6pm · Añadir rápido',
  'capture.widgets.step3': 'O asigna 6pm al botón de acción',
  'capture.widgets.step3Chip': 'Botón de acción',
  'capture.widgets.tip': 'Mantén pulsado Añadir rápido y dilo: “trà sữa 45k”.',
  'capture.widgets.action': 'Hecho',
};
