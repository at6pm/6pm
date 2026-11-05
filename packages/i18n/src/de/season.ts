import type { Entry } from '../catalogue-types';
import type { enSeason } from '../en-season';

export const deSeason: { readonly [Key in keyof typeof enSeason]: Entry } = {
  'season.festival.tet': 'Tết',
  'season.festival.seollal': 'Koreanisches Neujahr',
  'season.festival.chunjie': 'Chinesisches Neujahr',
  'season.envelope.tet': 'Lì xì',
  'season.envelope.seollal': 'Neujahrsgeld',
  'season.envelope.chunjie': 'Rote Umschläge',

  'season.card.title': 'Ein Spartopf für {festival}?',
  'season.card.sub': {
    one: '{festival} ist in einer Woche. Füll ihn an jedem Zahltag ein bisschen.',
    other: '{festival} ist in {count} Wochen. Füll ihn an jedem Zahltag ein bisschen.',
  },
  'season.card.open': 'Einrichten',
  'season.card.later': 'Nicht jetzt',

  'season.offer.later': 'Später',
  'season.offer.title': 'Ein Spartopf für {festival}',
  'season.offer.kicker': {
    one: '{festival} · 1 Woche',
    other: '{festival} · {count} Wochen',
  },
  'season.offer.perPay': {
    one: '{amount} am Zahltag · 1 Zahltag',
    other: '{amount} pro Zahltag · {count} Zahltage',
  },
  'season.offer.ask.gifts': 'Geschenke für die Familie',
  'season.offer.ask.trip': 'Die Heimreise',
  'season.offer.none': 'Keine',
  'season.offer.daily': 'Jeden Tag bis {festival}',
  'season.offer.start': 'Spartopf für {festival} starten',

  'season.bonus.kicker': 'EINNAHMEN',
  'season.bonus.title': 'Dein Bonus für {festival}?',
  'season.bonus.slipJar': 'Spartopf {festival}',
  'season.bonus.jarFull': 'Spartopf {festival} · voll',
  'season.bonus.jarIn': 'Spartopf {festival} · +{amount}',
  'season.bonus.today': 'HEUTE',
  'season.bonus.payday': '{date} · ZAHLTAG',
  'season.bonus.spread': '{amount} verteilt · +{daily} pro Tag bis {date}',
  'season.bonus.allIn': 'Alles kommt in den Spartopf',
  'season.bonus.yes': 'Ja, so aufteilen',
  'season.bonus.yesAll': 'Ja, in den Spartopf',
  'season.bonus.save': 'Lieber {amount} sparen',

  'season.quick.keypad': 'Ziffernblock',
  'season.quick.voice': 'Sprache',
  'season.quick.given': 'Gegeben',
  'season.quick.received': 'Bekommen',
  'season.quick.count': {
    one: '1 Umschlag × {each}',
    other: '{count} Umschläge × {each}',
  },
  'season.quick.total': '= {amount}',
  'season.quick.fromJar': 'Aus dem Spartopf für {festival}',
  'season.quick.jarLeft': '{from} → {to} übrig',
  'season.quick.counts': 'Zählt für heute',
  'season.quick.countsSub': 'Kein Spartopf für {festival}, aus dem es kommen kann',
  'season.quick.saved': 'Fürs Zukunfts-Ich',
  'season.quick.savedSub': 'Vorschlag. Hebt die Tageszahl nicht an.',
  'season.quick.keep': 'Behalten',
  'season.quick.less': 'Ein Umschlag weniger',
  'season.quick.more': 'Noch ein Umschlag',
  'season.quick.merchant': {
    one: '{name} · 1 Umschlag',
    other: '{name} · {count} Umschläge',
  },

  'season.kicker.countdown': {
    one: 'Noch 1 Tag bis {festival}',
    other: 'Noch {count} Tage bis {festival}',
  },
  'season.kicker.holiday': '{festival}, Tag {day}',
  'season.card.saved': 'Vorschlag: fürs Zukunfts-Ich sparen',
};
