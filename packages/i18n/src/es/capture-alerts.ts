import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const esCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'Pillar un aviso del banco',
  'native.intents.catchAlert.description':
    'Lee un aviso del banco o del monedero en tu iPhone y deja el dinero que se ha movido en la Bandeja de 6pm. Se omiten los códigos, los pagos fallidos y las promociones.',
  'native.intents.catchAlert.alertTitle': 'Título',
  'native.intents.catchAlert.subtitle': 'Subtítulo',
  'native.intents.catchAlert.body': 'Cuerpo',
  'native.intents.catchAlert.date': 'Fecha',
  'native.intents.catchAlert.app': 'App',
  'capture.alerts.name': 'Avisos del banco',
  'capture.alerts.sub': 'Los avisos de tu banco y tu monedero se apuntan solos',
  'capture.alerts.headline': 'Los avisos de tu banco y tu monedero se apuntan solos.',
  'capture.alerts.time': 'Unos dos minutos, una vez',
  'capture.alerts.step1': 'En Atajos, crea una automatización para notificaciones',
  'capture.alerts.step1Chip': 'Automatización → Notificación',
  'capture.alerts.step2': 'Elige las apps de tu banco y tu monedero',
  'capture.alerts.step3': 'Haz que ejecute “Pillar un aviso del banco”',
  'capture.alerts.step3Chip': 'Pillar un aviso del banco',
  'capture.alerts.tip':
    'Se omiten los códigos, los pagos fallidos y las promociones. Un pago ya pillado con Apple Pay o por correo no se añade dos veces.',
  'capture.alerts.privacy': 'Los avisos se leen en tu iPhone y nunca salen de él.',
  'capture.alerts.statusTitle': 'Último aviso',
  'capture.alerts.none': 'Aún no ha llegado ningún aviso del banco',
  'capture.alerts.noneBody': 'Cuando esté configurado, haz un pago pequeño para probarlo.',
  'capture.alerts.seenBody':
    'La automatización funciona. Lo que se ha movido te espera en la Bandeja.',
  'capture.alerts.cameIn': 'Entran {amount}',
  'capture.alerts.skip.code': 'un código, omitido',
  'capture.alerts.skip.failed': 'pago fallido, omitido',
  'capture.alerts.skip.promo': 'promoción, omitida',
  'capture.alerts.skip.balance': 'aviso de saldo, omitido',
  'capture.alerts.skip.security': 'aviso de seguridad, omitido',
  'capture.alerts.skip.unread': 'no es un pago, omitido',
  'capture.alerts.actionAdd': 'Conseguir el atajo de 6pm',
  'capture.alerts.actionOpen': 'Abrir Atajos',
  'capture.walk.alerts.s1Title': 'Abre Automatización y toca +',
  'capture.walk.alerts.s1Body':
    'En Atajos, toca Biblioteca, luego Automatización y luego +. Si ves “Describe un atajo”, toca Editar.',
  'capture.walk.alerts.s2Title': 'Añade el activador de Notificación',
  'capture.walk.alerts.s2Body':
    'En el panel de abajo, toca Automatización y luego Notificación. Aparece la tarjeta “Cuando reciba una notificación de App”.',
  'capture.walk.alerts.s3Title': 'Elige tus bancos y monederos',
  'capture.walk.alerts.s3Body':
    'Toca App y elige tu banco. Toca + para añadir cada una de las demás apps de banco o monedero con las que pagas.',
  'capture.walk.alerts.s4Title': 'Añade “Pillar un aviso del banco”',
  'capture.walk.alerts.s4Body':
    'Toca Buscar, escribe “aviso del banco” y toca Pillar un aviso del banco de 6pm. En Título, Subtítulo, Cuerpo y Fecha, pon los de la propia Notificación.',
  'capture.walk.alerts.s5Title': 'Deja Notificar desactivado y vuelve atrás',
  'capture.walk.alerts.s5Body':
    'Toca › en el activador: deja Automatización activada y Notificar desactivado, para que los avisos se pillen en silencio. Al volver atrás se guarda.',
  'capture.walk.alerts.s6Title': 'Pruébalo',
  'capture.walk.alerts.s6Body':
    'Paga algo pequeño desde una de esas apps. Cuando llegue su aviso, el pago estará en tu Bandeja.',
  'capture.walk.alerts.l1Title': 'Añade el atajo de 6pm',
  'capture.walk.alerts.l1Body':
    'Toca “Conseguir el atajo de 6pm” aquí abajo y luego Añadir atajo. Se llama “Catch bank alerts”.',
  'capture.walk.alerts.l2Body':
    'Ábrelo en Atajos, toca App arriba y elige tu banco; luego toca + para cada uno de tus otros bancos y monederos.',
  'capture.walk.alerts.mistake1':
    'Título, Cuerpo o Fecha vacíos. Toca cada uno y elige el de la Notificación, o los avisos no apuntan nada.',
  'capture.walk.alerts.mistake2':
    'Notificar activado. Cada aviso te llega dos veces en vez de pillarse en silencio.',
  'capture.walk.alerts.mistake3':
    'Solo una app elegida. Marca cada banco y monedero que uses, MoMo y ZaloPay incluidos.',
  'capture.walk.ios.notification': 'Notificación',
  'capture.walk.ios.notificationEx': '“Cuando reciba una notificación de News”',
  'capture.walk.ios.whenNotified': 'Cuando reciba una notificación de',
  'capture.walk.ios.notificationTitle': 'Notificación › Título',
  'capture.walk.ios.notificationBody': 'Notificación › Cuerpo',
  'capture.walk.ios.notificationDate': 'Notificación › Fecha',
  'capture.walk.ios.notificationSummary': 'Cuando reciba una notificación de MB Bank o MoMo',
  'capture.walk.ios.alertSearch': 'aviso del banco',
  'capture.walk.ios.now': 'ahora',
  'capture.walk.test.alertRow': 'Aviso del banco · por revisar',
  'capture.siri.name': 'Díselo a Siri',
  'capture.siri.sub': 'Di “Apunta en 6pm” y luego qué ha sido',
  'capture.siri.headline': 'Apunta un gasto en voz alta, sin abrir 6pm.',
  'capture.siri.time': 'No hay nada que configurar',
  'capture.siri.step1': 'Di “Oye Siri, apunta en 6pm”',
  'capture.siri.step1Chip': 'Apunta en 6pm',
  'capture.siri.step2': 'Siri te pregunta cuánto. Di qué y cuánto',
  'capture.siri.step2Chip': '“phở cuarenta y cinco mil”',
  'capture.siri.step3': 'Aparece al momento en lo gastado hoy',
  'capture.siri.step3Chip': 'Hoy',
  'capture.siri.tip':
    'Siri aún no habla vietnamita, así que háblale en español. Para decirlo en vietnamita, mantén pulsado Añadir rápido.',
  'capture.backTap.name': 'Tocar atrás',
  'capture.backTap.sub': 'Toca dos veces la parte trasera del iPhone para apuntar un gasto',
  'capture.backTap.headline': 'Dos toques atrás y Añadir rápido se abre.',
  'capture.backTap.time': 'Treinta segundos, una vez',
  'capture.backTap.step1': 'Abre Ajustes y luego Accesibilidad, Tocar, Tocar atrás',
  'capture.backTap.step1Chip': 'Tocar atrás',
  'capture.backTap.step2': 'Elige Doble toque y luego Añadir rápido de 6pm',
  'capture.backTap.step2Chip': 'Doble toque → Añadir rápido',
  'capture.backTap.step3': 'Toca dos veces la parte trasera del iPhone. Se abre Añadir rápido',
  'capture.backTap.step3Chip': 'Añadir rápido',
  'capture.backTap.tip':
    '¿No ves Añadir rápido? En Atajos, toca +, añade Añadir rápido de 6pm y guárdalo. Triple toque también funciona.',
  'capture.walk.ios.notificationSubtitle': 'Notificación › Subtítulo',
  'capture.walk.ios.notify': 'Notificar',
  'capture.walk.ios.cancel': 'Cancelar',
};
