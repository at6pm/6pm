import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

export const deTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': 'Reisemodus',
  'travel.settings.sub': 'Schaltet sich im Ausland von selbst ein',
  'travel.settings.locationOff': 'Erlaube den Standort, damit 6pm merkt, dass du im Ausland bist',
  'travel.settings.stale': 'Kurse vom {date}',
  'travel.settings.noRates': 'Warte auf die heutigen Kurse',
  'travel.pill': '{place} · {symbol} mit {home} darunter',
  'travel.activity.place': '{place} · heute',
  'travel.activity.left': '{amount} übrig',
  'travel.activity.over': '{amount} drüber',
  'travel.activity.of': 'von {line} · ≈ {vnd}',
  'travel.activity.leftOf': 'übrig von {line} · ≈ {home}',
  'travel.activity.overOf': 'über {line} · ≈ {home}',
  'travel.activity.leftHome': 'übrig · ≈ {home}',
  'travel.activity.overHome': 'drüber · ≈ {home}',
  'travel.activity.log': '{symbol} erfassen',
  'travel.quick.underneath': 'ca. {amount}',
  'travel.quick.underneathStale': 'ca. {amount} · Kurs vom {date}',
  'travel.quick.currency': 'Währung wechseln',
  'travel.scan.body':
    'Zahl mit deiner Banking-App: Die meisten vietnamesischen Banken lesen diesen Code. 6pm erfasst es in {symbol} mit ₫ darunter.',
  'travel.scan.bodyAway':
    'Zahl so, wie man dort zahlt. 6pm erfasst es in {symbol} mit {home} darunter.',
  'travel.scan.keep': 'Bezahlt · {amount} behalten',
  'travel.scan.logIn': 'In {symbol} erfassen',
};
