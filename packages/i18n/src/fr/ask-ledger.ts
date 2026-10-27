import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// Ranges slot in after the amount (« Tu as dépensé 1,2M cette semaine »), so each reads as an
// adverb; a row label capitalises it. Dates arrive as « 9 octobre » and take « le ».
export const frAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': 'aujourd’hui',
  'ask.range.yesterday': 'hier',
  'ask.range.thisWeek': 'cette semaine',
  'ask.range.lastWeek': 'la semaine dernière',
  'ask.range.thisCycle': 'depuis la paie',
  'ask.range.lastCycle': 'sur le dernier cycle de paie',
  'ask.range.thisMonth': 'ce mois-ci',
  'ask.range.lastMonth': 'le mois dernier',
  'ask.range.last7Days': 'sur les 7 derniers jours',
  'ask.range.last30Days': 'sur les 30 derniers jours',
  'ask.range.dates': 'du {from} au {to}',

  'ask.answer.spent': {
    one: 'Tu as dépensé {total} {range}, en une dépense.',
    other: 'Tu as dépensé {total} {range}, en {count} dépenses.',
  },
  'ask.answer.spentOn': {
    one: 'Tu as dépensé {total} pour {category} {range}, une fois.',
    other: 'Tu as dépensé {total} pour {category} {range}, {count} fois.',
  },
  'ask.answer.spentAt': {
    one: 'Tu as dépensé {total} chez {merchant} {range}, en une visite.',
    other: 'Tu as dépensé {total} chez {merchant} {range}, en {count} visites.',
  },
  'ask.answer.spentNone': 'Rien de dépensé {range}.',
  'ask.answer.spentNoneOn': 'Rien pour {category} {range}.',
  'ask.answer.spentNoneAt': 'Rien chez {merchant} {range}.',
  'ask.answer.breakdown': 'Sur {total} {range}, c’est {top} qui a pris le plus.',
  'ask.answer.compared.up': 'Ça fait {now} {range}, en hausse par rapport à {before} {against}.',
  'ask.answer.compared.down': 'Ça fait {now} {range}, en baisse par rapport à {before} {against}.',
  'ask.answer.compared.same': 'À peu près pareil : {now} {range}, {before} {against}.',
  'ask.answer.listed': {
    one: 'Une dépense {range} : {total}.',
    other: '{count} dépenses {range}, {total} au total.',
  },
  'ask.answer.listedMore': 'Et {more} de plus.',
  'ask.answer.listedNone': 'Aucune dépense de ce genre {range}.',
  'ask.answer.bills': {
    one: 'Il reste une facture avant la paie : {total}.',
    other: 'Il reste {count} factures avant la paie, {total} au total.',
  },
  'ask.answer.billsNone': 'Plus aucune facture avant la paie.',
  'ask.answer.how': 'Voici ce qui ressort en ce moment.',
  'ask.answer.howNothing': 'Tout est calme pour l’instant. Rien ne ressort encore.',
  'ask.answer.noSuchCategory':
    'Je ne trouve pas de catégorie {category}. Demande-moi pour l’une des tiennes.',
  'ask.answer.noRange': 'Il n’y a encore rien à regarder pour ça.',
  'ask.answer.chat': 'Quand tu veux. Pose-moi tes questions d’argent quand ça te chante.',
  'ask.answer.partial': 'Ce calcul compte ce que 6pm garde depuis le {since}.',
  'ask.row.total': 'Total',
  'ask.row.before': 'Avant',
  'ask.answer.goalPace.months': {
    one: 'À {monthly} par mois pour Toi du futur, {amount} pour {what} prend environ {count} mois, vers {month}.',
    other:
      'À {monthly} par mois pour Toi du futur, {amount} pour {what} prend environ {count} mois, vers {month}.',
  },
  'ask.answer.goalPace.years': {
    one: 'À {monthly} par mois pour Toi du futur, {amount} pour {what} prend environ {count} an, vers {month}.',
    other:
      'À {monthly} par mois pour Toi du futur, {amount} pour {what} prend environ {count} ans, vers {month}.',
  },
  'ask.answer.goalPace.note': 'Une cagnotte rien que pour ça garde cet argent à part du reste.',
  'ask.answer.goalNoPace':
    'Rien ne va encore à Toi du futur chaque mois, donc pas de rythme pour calculer {amount} pour {what}. Un petit peu chaque mois, et c’est parti.',
  'ask.answer.goalAmount':
    'Combien coûte {what}, à peu près ? Donne-moi le prix, comme « {example} », et je fais le calcul.',
  'ask.row.reachedBy': 'Vers',
};
