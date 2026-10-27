import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

export const esTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': 'Modo viaje',
  'travel.settings.sub': 'Se activa solo en el extranjero',
  'travel.settings.locationOff': 'Permite la ubicación para saber cuándo estás fuera',
  'travel.settings.stale': 'Cambio del {date}',
  'travel.settings.noRates': 'Esperando el cambio de hoy',
  'travel.pill': '{place} · {symbol} con {home} debajo',
  'travel.activity.place': '{place} · hoy',
  'travel.activity.left': 'Quedan {amount}',
  'travel.activity.over': '{amount} de más',
  'travel.activity.of': 'de {line} · ≈ {vnd}',
  'travel.activity.leftOf': 'libres de {line} · ≈ {home}',
  'travel.activity.overOf': 'por encima de {line} · ≈ {home}',
  'travel.activity.leftHome': 'libres · ≈ {home}',
  'travel.activity.overHome': 'de más · ≈ {home}',
  'travel.activity.log': 'Apuntar {symbol}',
  'travel.quick.underneath': 'unos {amount}',
  'travel.quick.underneathStale': 'unos {amount} · cambio del {date}',
  'travel.quick.currency': 'Cambiar moneda',
  'travel.scan.body':
    'Págalo en la app de tu banco: casi todos los bancos vietnamitas lo aceptan. 6pm lo guarda en {symbol} con ₫ debajo.',
  'travel.scan.bodyAway': 'Págalo como se paga allí. 6pm lo guarda en {symbol} con {home} debajo.',
  'travel.scan.keep': 'Pagado · guardar {amount}',
  'travel.scan.logIn': 'Apuntarlo en {symbol}',
};
