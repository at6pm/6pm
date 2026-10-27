import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

// Permission prompts read like iOS's own Spanish ones. Siri speaks Spanish, so the App Shortcuts
// phrases are what a Spanish speaker says to Siri: "Apunta un gasto en 6pm".
export const esNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    '6pm usa la cámara para leer los códigos QR y los tickets que escaneas. Las fotos se quedan en tu iPhone, salvo que un ticket necesite una lectura más detallada.',
  'native.permission.microphone':
    '6pm te escucha mientras dices un gasto. Tu voz va a un servicio de voz a texto para transcribirla, o se queda en este iPhone en el modo en el dispositivo.',
  'native.permission.speech': '6pm convierte lo que dices en un importe y un nombre.',
  'native.permission.photos':
    '6pm solo guarda en Fotos el ticket de tu cierre y tu diario del dinero. Nunca mira tu fototeca.',
  'native.permission.photosAdd':
    '6pm guarda en Fotos el ticket de tu cierre y tu diario del dinero cuando se lo pides.',
  'native.permission.location':
    '6pm comprueba en qué país estás para que el modo viaje se active solo en el extranjero.',
  'native.surfaces.safeToday.name': 'Puedes gastar hoy',
  'native.surfaces.safeToday.description': 'Lo que puedes gastar hoy, de un vistazo.',
  'native.surfaces.setUp': 'Abre 6pm para configurarlo',
  'native.surfaces.markPaid.title': 'Pagado',
  'native.surfaces.todayList.name': 'Hoy',
  'native.surfaces.todayList.description': 'Lo que has gastado hoy, lo más reciente primero.',
  'native.share.title': 'Añadir a 6pm',
  'native.share.readFromBank': 'Leído en este iPhone de tu ticket de {bank}',
  'native.share.readHere': 'Leído en este iPhone de tu ticket',
  'native.share.unreadable': 'No se pudo leer este ticket. Escribe el importe.',
  'native.share.to': 'Para',
  'native.share.when': 'Cuándo',
  'native.share.code': 'Código',
  'native.share.category': 'Categoría',
  'native.share.unsure': 'El nombre no está claro. Tócalo para revisarlo.',
  'native.share.checkName': 'Revisa el nombre',
  'native.share.amountHint': 'Importe',
  'native.share.nameHint': 'A quién pagaste',
  'native.share.chooseCategory': 'Elegir',
  'native.share.edit': 'Editar',
  'native.share.done': 'Hecho',
  'native.share.confirm': 'Confirmar',
  'native.share.currency': 'Moneda',
  'native.share.currencyUnsure': 'El ticket no indica la moneda. Tócala para revisarla.',
  'native.share.checkCurrency': 'Revisa la moneda',
  'native.share.inDong': 'unos {amount}',
  'native.share.noRate':
    'Aún no hay tipo de cambio. 6pm lo calcula con el cambio de ese día en cuanto lo tenga.',
  'native.share.unknownCurrency': 'No se sabe la moneda. Escribe el importe en đồng.',
  'native.share.unknownCurrencyIn': 'No se sabe la moneda. Escribe el importe en {currency}.',
  'native.share.looking': 'Leyéndolo con más detalle…',
  'native.share.step': '{n} de {total}',
  'native.share.skip': 'Omitir',
  'native.intents.logSpend.title': 'Apuntar en 6pm',
  'native.intents.logSpend.amount': 'Importe',
  'native.intents.logSpend.merchant': 'Dónde',
  'native.intents.logSpend.description':
    'Apunta un gasto en 6pm: pagos con Apple Pay desde Cartera, o lo que le digas a Siri.',
  'native.intents.logSpend.short': 'Apuntar un gasto',
  'native.intents.logSpend.askAmount': '¿Cuánto ha sido?',
  'native.intents.logSpend.logged': 'Apuntado.',
  'native.intents.logSpend.failed':
    '6pm no ha podido apuntarlo. Abre 6pm y prueba con Añadir rápido.',
  'native.intents.scan.title': 'Escanear QR',
  'native.intents.scan.description': 'Abre Escanea y paga en 6pm.',
  'native.intents.quickAdd.title': 'Añadir rápido',
  'native.intents.quickAdd.description': 'Abre Añadir rápido en 6pm.',
  'native.appShortcuts.logIn': 'Apunta en ${applicationName}',
  'native.appShortcuts.logSpend': 'Apunta un gasto en ${applicationName}',
  'native.appShortcuts.scan': 'Escanea un QR en ${applicationName}',
  'native.appShortcuts.scanToPay': 'Escanea y paga en ${applicationName}',
  'native.appShortcuts.quickAdd': 'Añade un gasto rápido en ${applicationName}',
};
