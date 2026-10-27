import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

export const frTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': 'Mode voyage',
  'travel.settings.sub': 'S’active tout seul à l’étranger',
  'travel.settings.locationOff': 'Autorise la localisation pour qu’il sache que tu es à l’étranger',
  'travel.settings.stale': 'Taux du {date}',
  'travel.settings.noRates': 'En attente des taux du jour',
  'travel.pill': '{place} · {symbol} avec {home} en dessous',
  'travel.activity.place': '{place} · aujourd’hui',
  'travel.activity.left': 'Reste {amount}',
  'travel.activity.over': 'Dépassé de {amount}',
  'travel.activity.of': 'sur {line} · ≈ {vnd}',
  'travel.activity.leftOf': 'restants sur {line} · ≈ {home}',
  'travel.activity.overOf': 'de trop sur {line} · ≈ {home}',
  'travel.activity.leftHome': 'restants · ≈ {home}',
  'travel.activity.overHome': 'de trop · ≈ {home}',
  'travel.activity.log': 'Noter en {symbol}',
  'travel.quick.underneath': '≈ {amount}',
  'travel.quick.underneathStale': '≈ {amount} · taux du {date}',
  'travel.quick.currency': 'Changer de devise',
  'travel.scan.body':
    'Paie-le dans ton app bancaire : la plupart des banques vietnamiennes l’acceptent. 6pm le garde en {symbol} avec ₫ en dessous.',
  'travel.scan.bodyAway':
    'Paie comme on paie là-bas. 6pm le garde en {symbol} avec {home} en dessous.',
  'travel.scan.keep': 'Payé · garder {amount}',
  'travel.scan.logIn': 'Le noter en {symbol}',
};
