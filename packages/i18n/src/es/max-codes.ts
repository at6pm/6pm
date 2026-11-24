import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const esMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'Regala Max a un amigo',
  'maxCodes.give.sub': 'Envía un enlace con una oferta de Max',
  'maxCodes.give.message':
    '6pm me dice cuánto puedo gastar hoy y apunta mis gastos solo. Aquí tienes una oferta de 6pm Max: {url}',
  'maxCodes.give.failed': 'No se pudo abrir el menú de compartir. Inténtalo de nuevo.',
  'maxCodes.redeem': 'Canjear un código',
  'maxCodes.head.friend': 'Un amigo te envía Max.',
  'maxCodes.head.code': 'Tu oferta de Max.',
  'maxCodes.playHint': 'En Google Play, toca el método de pago y luego Canjear código.',
  'maxCodes.playHint.code':
    'Código {code} copiado. En Google Play, toca el método de pago y luego Canjear código.',
};
