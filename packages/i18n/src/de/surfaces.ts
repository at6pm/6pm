import type { Entry } from '../catalogue-types';
import type { enSurfaces } from '../en-surfaces';

export const deSurfaces: { readonly [Key in keyof typeof enSurfaces]: Entry } = {
  'surfaces.scanQr': 'QR scannen',
  'surfaces.safeTodayShort': 'heute verfügbar',
  'surfaces.today': 'Heute',
  'surfaces.left': 'übrig',
  'surfaces.amountLeft': '{amount} übrig',
  'surfaces.spent': '{amount} ausgegeben',
  'surfaces.ofLine': 'von {amount}',
  'surfaces.brandSafe': '6pm · Heute verfügbar',
  'surfaces.pending': { one: '{count} offen', other: '{count} offen' },
  'surfaces.more': { one: '+{count} weitere', other: '+{count} weitere' },
  'surfaces.listEmpty': 'Heute noch nichts ausgegeben',
  'surfaces.openApp': '6pm öffnen',
  'surfaces.setUp': '6pm zum Einrichten öffnen',
  'surfaces.activity.waiting': 'Wartet · tippen, wenn bezahlt',
  'surfaces.activity.to': '{amount} an {merchant}',
  'surfaces.activity.toMerchant': 'an {merchant}',
  'surfaces.activity.toMerchantBank': 'an {merchant} · {bank} geöffnet',
  'surfaces.activity.waitingBank': 'Wartet · {bank}',
  'surfaces.activity.paid': 'Bezahlt',
  'surfaces.context.today': 'Heute',
  'surfaces.context.yesterday': 'Gestern',
  'surfaces.context.safeAfter': 'Heute verfügbar: jetzt {amount}',
};
