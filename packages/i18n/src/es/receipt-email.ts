import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

// "Correo de recibos" is the feature; a mail service's own confirm step is named plainly.
export const esReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'Copiar dirección',
  'receiptEmail.share': 'Compartir tu dirección de 6pm',
  'receiptEmail.offline': 'Tu dirección aparece cuando tengas conexión',
  'receiptEmail.from': 'De {address}',
  'receiptEmail.deviceMode': 'Desactivado mientras la IA siga en este iPhone',
  'receiptEmail.deviceMode.body':
    'El correo de recibos necesita que nuestro servidor lea tu correo, así que está desactivado mientras 6pm mantenga la IA en este iPhone. Comparte el ticket o escanéalo.',
  'receiptEmail.check.title': '{provider} pide confirmar el reenvío desde {address}',
  'receiptEmail.check.titleNoAddress': '{provider} pide confirmar el reenvío a 6pm',
  'receiptEmail.check.code': 'Código de confirmación',
  'receiptEmail.check.copy': 'Copiar',
  'receiptEmail.check.copyLabel': 'Copiar el código de confirmación',
  'receiptEmail.check.copied': 'Código copiado.',
  'receiptEmail.check.hint':
    'Abre la página de confirmación o pega el código en los ajustes de {provider}. Después, los recibos reenviados llegarán aquí.',
  'receiptEmail.check.open': 'Abrir página de confirmación',
  'receiptEmail.check.openFailed': 'No se ha podido abrir la página. Copia el código.',
  'receiptEmail.check.hintNoCode':
    'Abre la página de confirmación y toca Confirmar. Después, los recibos reenviados llegarán aquí.',
  'receiptEmail.check.openFailedNoCode':
    'No se ha podido abrir la página. Inténtalo de nuevo en un momento.',
  'receiptEmail.check.done': 'Hecho',
};
