import type { Entry } from '../catalogue-types';
import type { enSeason } from '../en-season';

export const frSeason: { readonly [Key in keyof typeof enSeason]: Entry } = {
  'season.festival.tet': 'Tết',
  'season.festival.seollal': 'Nouvel An coréen',
  'season.festival.chunjie': 'Nouvel An chinois',
  'season.envelope.tet': 'Lì xì',
  'season.envelope.seollal': 'Étrennes',
  'season.envelope.chunjie': 'Enveloppes rouges',

  'season.card.title': 'Une cagnotte {festival} ?',
  'season.card.sub': {
    one: '{festival} arrive dans une semaine. Remplis-la un peu à chaque paie.',
    other: '{festival} arrive dans {count} semaines. Remplis-la un peu à chaque paie.',
  },
  'season.card.open': 'La créer',
  'season.card.later': 'Pas maintenant',

  'season.offer.later': 'Plus tard',
  'season.offer.title': 'Une cagnotte {festival}',
  'season.offer.kicker': {
    one: '{festival} · 1 semaine',
    other: '{festival} · {count} semaines',
  },
  'season.offer.perPay': {
    one: '{amount} le jour de paie · 1 paie',
    other: '{amount} à chaque paie · {count} paies',
  },
  'season.offer.ask.gifts': 'Cadeaux pour la famille',
  'season.offer.ask.trip': 'Le retour au pays',
  'season.offer.none': 'Aucun',
  'season.offer.daily': 'Chaque jour jusqu’à {festival}',
  'season.offer.start': 'Lancer la cagnotte {festival}',

  'season.bonus.kicker': 'RENTRÉES',
  'season.bonus.title': 'Ta prime de {festival} ?',
  'season.bonus.slipJar': 'Cagnotte {festival}',
  'season.bonus.jarFull': 'Cagnotte {festival} · pleine',
  'season.bonus.jarIn': 'Cagnotte {festival} · +{amount}',
  'season.bonus.today': 'AUJOURD’HUI',
  'season.bonus.payday': '{date} · JOUR DE PAIE',
  'season.bonus.spread': '{amount} répartis · +{daily} par jour jusqu’au {date}',
  'season.bonus.allIn': 'Tout va dans la cagnotte',
  'season.bonus.yes': 'Oui, répartis comme ça',
  'season.bonus.yesAll': 'Oui, dans la cagnotte',
  'season.bonus.save': 'Plutôt mettre {amount} de côté',

  'season.quick.keypad': 'Clavier',
  'season.quick.voice': 'Voix',
  'season.quick.given': 'Donné',
  'season.quick.received': 'Reçu',
  'season.quick.count': {
    one: '1 enveloppe × {each}',
    other: '{count} enveloppes × {each}',
  },
  'season.quick.total': '= {amount}',
  'season.quick.fromJar': 'De la cagnotte {festival}',
  'season.quick.jarLeft': '{from} → {to} restants',
  'season.quick.counts': 'Compte pour aujourd’hui',
  'season.quick.countsSub': 'Pas de cagnotte {festival} où le prendre',
  'season.quick.saved': 'Pour toi du futur',
  'season.quick.savedSub': 'Suggéré. Ne fait pas monter le chiffre du jour.',
  'season.quick.keep': 'Garder',
  'season.quick.less': 'Une enveloppe de moins',
  'season.quick.more': 'Une enveloppe de plus',
  'season.quick.merchant': {
    one: '{name} · 1 enveloppe',
    other: '{name} · {count} enveloppes',
  },

  'season.kicker.countdown': {
    one: '{festival} dans 1 jour',
    other: '{festival} dans {count} jours',
  },
  'season.kicker.holiday': '{festival}, jour {day}',
  'season.card.saved': 'Suggéré : garde-le pour toi du futur',
};
