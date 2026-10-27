import type { Entry } from '../catalogue-types';
import type { enCaptureWalk } from '../en-capture-walk';

// Labels inside the pictured screens are the ones Spanish iOS (Atajos, Cartera) and Gmail in
// Spanish show, so the steps match what the user sees. 6pm's own Inbox is "Bandeja"; the shared
// shortcut keeps its name “Log to 6pm”, as it shows in Atajos.
export const esCaptureWalk: { readonly [Key in keyof typeof enCaptureWalk]: Entry } = {
  'capture.walk.stepOf': 'Paso {step} de {total}',
  'capture.walk.next': 'Siguiente',
  'capture.walk.back': 'Atrás',
  'capture.walk.again': 'Empezar de nuevo',
  'capture.walk.mistakes': 'Errores habituales',

  'capture.walk.wallet.s1Title': 'Añade el atajo de 6pm',
  'capture.walk.wallet.s1Body':
    'Toca “Añadir el atajo de 6pm” aquí abajo y luego Añadir atajo. Se llama “Log to 6pm”.',
  'capture.walk.wallet.s2Title': 'Abre Automatización y toca +',
  'capture.walk.wallet.s2Body':
    'En Atajos, toca Biblioteca, luego Automatización y luego +. Si ves “Describe un atajo”, toca Editar.',
  'capture.walk.wallet.s3Title': 'Añade el activador de Cartera',
  'capture.walk.wallet.s3Body':
    'En el panel de abajo, toca Automatización y luego Cartera. Aparece la tarjeta “Cuando se pulse cualquier tarjeta”.',
  'capture.walk.wallet.s4Title': 'Ejecuta “Log to 6pm”',
  'capture.walk.wallet.s4Body':
    'Toca Buscar, escribe “Ejecutar atajo” y tócalo. Luego toca Atajo y elige “Log to 6pm”.',
  'capture.walk.wallet.s5Title': 'Desactiva Mostrar al ejecutar y vuelve atrás',
  'capture.walk.wallet.s5Body':
    'Deja Automatización activada. Al volver atrás se guarda. Para pillar solo algunas tarjetas, toca Cualquier tarjeta y elígelas.',
  'capture.walk.wallet.s6Title': 'Pruébalo',
  'capture.walk.wallet.s6Body':
    'Paga algo con Apple Pay en este iPhone y abre 6pm. El pago está en tu Bandeja.',
  'capture.walk.wallet.mistake1':
    'Un atajo sin la tarjeta “Cuando se pulse cualquier tarjeta” arriba. Solo se ejecuta cuando lo lanzas tú.',
  'capture.walk.wallet.mistake2':
    'Ejecutar atajo sin ningún atajo elegido. Toca Atajo y elige “Log to 6pm”, o los pagos no apuntan nada.',
  'capture.walk.wallet.mistake3':
    'Mostrar al ejecutar activado. Cada pago se detiene para enseñarte una tarjeta en vez de apuntarse sin más.',
  'capture.walk.wallet.olderTitle': 'En iOS 26',
  'capture.walk.wallet.older1': 'En Atajos, abre la pestaña Automatización y toca +.',
  'capture.walk.wallet.older2':
    'Toca Cartera, elige tus tarjetas, marca Ejecutar inmediatamente y luego Siguiente.',
  'capture.walk.wallet.older3': 'Elige “Log to 6pm” entre tus atajos y luego OK.',
  'capture.walk.wallet.handTitle': '¿Prefieres montarlo tú?',
  'capture.walk.wallet.hand1':
    'En lugar de Ejecutar atajo, añade “Apuntar en 6pm” y desactiva Mostrar al ejecutar.',
  'capture.walk.wallet.hand2':
    'Pon Importe en Transacción › Importe, y Dónde en Transacción › Comercio.',

  'capture.walk.email.s1Title': 'En un ordenador, abre los ajustes de Gmail',
  'capture.walk.email.s1Body':
    'El reenvío no se puede configurar en la app de Gmail. En Gmail para web, haz clic en la rueda dentada y luego en Ver todos los ajustes.',
  'capture.walk.email.s2Title': 'Reenvío y correo POP/IMAP',
  'capture.walk.email.s2Body': 'Abre esa pestaña y haz clic en Añadir una dirección de reenvío.',
  'capture.walk.email.s3Title': 'Pega tu dirección de 6pm',
  'capture.walk.email.s3Body':
    'Cópiala con el botón de abajo, pégala y luego Siguiente y Continuar.',
  'capture.walk.email.s4Title': 'Escribe el código que te muestra 6pm',
  'capture.walk.email.s4Body':
    'Gmail envía una confirmación a tu dirección de 6pm y 6pm te muestra el código. Escríbelo junto a Verificar.',
  'capture.walk.email.s5Title': 'Crea un filtro para los recibos',
  'capture.walk.email.s5Body':
    'No lo reenvíes todo. Abre las opciones de búsqueda y pon en De los remitentes de tus recibos.',
  'capture.walk.email.s6Title': 'Reenvíalo a 6pm',
  'capture.walk.email.s6Body':
    'Haz clic en Crear filtro, marca Reenviarlo a, elige tu dirección de 6pm y vuelve a hacer clic en Crear filtro.',
  'capture.walk.email.otherTitle': 'Otro correo',
  'capture.walk.email.outlook': 'Outlook.com',
  'capture.walk.email.outlook1': 'En la web, abre Configuración, luego Correo y luego Reglas.',
  'capture.walk.email.outlook2':
    'Agregar nueva regla: si viene de los remitentes de tus recibos, reenvíalo a tu dirección de 6pm.',
  'capture.walk.email.outlook3': 'Guarda. Puede que Outlook te pida iniciar sesión otra vez.',
  'capture.walk.email.icloud': 'iCloud Mail',
  'capture.walk.email.icloud1': 'En icloud.com/mail, abre Ajustes, luego Reglas y luego +.',
  'capture.walk.email.icloud2':
    'Si un mensaje viene de un remitente de recibos, reenvíalo a tu dirección de 6pm.',
  'capture.walk.email.icloud3':
    'Añade una regla por remitente. Puede tardar 15 minutos en empezar a funcionar.',

  'capture.walk.share.s1Title': 'Abre el comprobante en la app de tu banco',
  'capture.walk.share.s1Body':
    'La pantalla que sale tras una transferencia, o una de tu historial. Toca Compartir.',
  'capture.walk.share.s2Title': 'Toca 6pm',
  'capture.walk.share.s2Body':
    'Desliza la fila de apps si no aparece. También puedes compartir una o varias fotos de tickets.',
  'capture.walk.share.s3Title': 'Revísalo y confirma',
  'capture.walk.share.s3Body':
    'Leo el importe y a quién pagaste. Confirma y ya está en tu Bandeja.',
  'capture.walk.share.inInbox': 'En tu Bandeja',

  'capture.walk.bank.done': 'Transferencia realizada',
  'capture.walk.bank.from': 'Desde',
  'capture.walk.bank.yourBank': 'Tu banco',
  'capture.walk.bank.share': 'Compartir',
  'capture.walk.bank.home': 'Inicio',

  'capture.walk.test.paid': 'Hecho',
  'capture.walk.test.inbox': 'Bandeja',
  'capture.walk.test.row': 'Apple Pay · por revisar',

  'capture.walk.ios.library': 'Biblioteca',
  'capture.walk.ios.allShortcuts': 'Todos los atajos',
  'capture.walk.ios.shareSheet': 'Hoja de compartir',
  'capture.walk.ios.gallery': 'Galería',
  'capture.walk.ios.automation': 'Automatización',
  'capture.walk.ios.apps': 'Apps',
  'capture.walk.ios.edit': 'Editar',
  'capture.walk.ios.noAutomations': 'No hay automatizaciones',
  'capture.walk.ios.noAutomationsSub': 'Haz que los atajos se ejecuten automáticamente.',
  'capture.walk.ios.newShortcut': 'Nuevo atajo',
  'capture.walk.ios.describe': 'Describe un atajo',
  'capture.walk.ios.addActions': 'Añade acciones desde abajo para crear un atajo.',
  'capture.walk.ios.search': 'Buscar',
  'capture.walk.ios.scripting': 'Scripts',
  'capture.walk.ios.sendMessage': 'Enviar mensaje',
  'capture.walk.ios.openApp': 'Abrir app',
  'capture.walk.ios.playMusic': 'Reproducir música',
  'capture.walk.ios.app': 'App',
  'capture.walk.ios.appEx': '“Cuando se abra o se cierre Tiempo”',
  'capture.walk.ios.wallet': 'Cartera',
  'capture.walk.ios.walletEx': '“Cuando pulse una tarjeta o un pase de Cartera”',
  'capture.walk.ios.screenshot': 'Captura de pantalla',
  'capture.walk.ios.screenshotEx': '“Cuando se guarde una captura de pantalla”',
  'capture.walk.ios.when': 'Cuando',
  'capture.walk.ios.isTapped': 'se pulse',
  'capture.walk.ios.anyCard': 'Cualquier tarjeta',
  'capture.walk.ios.showWhenRun': 'Mostrar al ejecutar',
  'capture.walk.ios.addShortcut': 'Añadir atajo',
  'capture.walk.ios.dontAdd': 'No añadir',
  'capture.walk.ios.runShortcut': 'Ejecutar atajo',
  'capture.walk.ios.run': 'Ejecutar',
  'capture.walk.ios.shortcut': 'Atajo',
  'capture.walk.ios.shortcutA': 'Llegada a casa',
  'capture.walk.ios.shortcutB': 'Temporizador colada',
  'capture.walk.ios.personal': 'Personal',
  'capture.walk.ios.walletSummary': 'Cuando pulse un pase o una tarjeta de pago de Cartera',
  'capture.walk.ios.messages': 'Mensajes',
  'capture.walk.ios.mail': 'Mail',
  'capture.walk.ios.image': 'Imagen',
  'capture.walk.ios.copy': 'Copiar',
  'capture.walk.ios.saveImage': 'Guardar imagen',

  'capture.walk.gmail.searchMail': 'Buscar en el correo',
  'capture.walk.gmail.quickSettings': 'Configuración rápida',
  'capture.walk.gmail.seeAll': 'Ver todos los ajustes',
  'capture.walk.gmail.settings': 'Ajustes',
  'capture.walk.gmail.general': 'General',
  'capture.walk.gmail.labels': 'Etiquetas',
  'capture.walk.gmail.filters': 'Filtros y direcciones bloqueadas',
  'capture.walk.gmail.forwarding': 'Reenvío y correo POP/IMAP',
  'capture.walk.gmail.forwardingHead': 'Reenvío:',
  'capture.walk.gmail.addAddress': 'Añadir una dirección de reenvío',
  'capture.walk.gmail.enterAddress': 'Introduce una nueva dirección de correo de reenvío:',
  'capture.walk.gmail.next': 'Siguiente',
  'capture.walk.gmail.cancel': 'Cancelar',
  'capture.walk.gmail.proceed': 'Continuar',
  'capture.walk.gmail.forwardTo': 'Reenviar una copia del correo entrante a',
  'capture.walk.gmail.verify': 'Verificar',
  'capture.walk.gmail.code': 'código de confirmación',
  'capture.walk.gmail.disable': 'Inhabilitar el reenvío',
  'capture.walk.gmail.from': 'De',
  'capture.walk.gmail.subject': 'Asunto',
  'capture.walk.gmail.hasWords': 'Contiene las palabras',
  'capture.walk.gmail.createFilter': 'Crear filtro',
  'capture.walk.gmail.search': 'Buscar',
  'capture.walk.gmail.whenArrives':
    'Cuando llegue un mensaje que coincida exactamente con tus criterios de búsqueda:',
  'capture.walk.gmail.skipInbox': 'Omitir Recibidos (Archivarlo)',
  'capture.walk.gmail.markRead': 'Marcar como leído',
  'capture.walk.gmail.forwardIt': 'Reenviarlo a:',
  'capture.walk.gmail.inbox': 'Recibidos',
};
