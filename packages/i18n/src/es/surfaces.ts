import type { Entry } from '../catalogue-types';
import type { enSurfaces } from '../en-surfaces';

export const esSurfaces: { readonly [Key in keyof typeof enSurfaces]: Entry } = {
  'surfaces.scanQr': 'Escanear QR',
  'surfaces.safeTodayShort': 'para hoy',
  'surfaces.today': 'Hoy',
  'surfaces.left': 'libres',
  'surfaces.amountLeft': 'Quedan {amount}',
  'surfaces.spent': '{amount} gastados',
  'surfaces.ofLine': 'de {amount}',
  'surfaces.brandSafe': '6pm · Puedes gastar hoy',
  'surfaces.pending': { one: '{count} pendiente', other: '{count} pendientes' },
  'surfaces.more': { one: '+{count} más', other: '+{count} más' },
  'surfaces.listEmpty': 'Hoy aún no has gastado nada',
  'surfaces.openApp': 'Abrir 6pm',
  'surfaces.setUp': 'Abre 6pm para configurarlo',
  'surfaces.activity.waiting': 'Esperando · toca al pagar',
  'surfaces.activity.to': '{amount} a {merchant}',
  'surfaces.activity.toMerchant': 'a {merchant}',
  'surfaces.activity.toMerchantBank': 'a {merchant} · {bank} abierto',
  'surfaces.activity.waitingBank': 'Esperando · {bank}',
  'surfaces.activity.paid': 'Pagado',
  'surfaces.context.today': 'Hoy',
  'surfaces.context.yesterday': 'Ayer',
  'surfaces.context.safeAfter': 'Ahora puedes gastar {amount} hoy',
};
