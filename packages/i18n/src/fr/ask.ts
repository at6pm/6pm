import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// Ask talks like the companion: « je » and « tu », short answers that show the sum.
export const frAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': 'Demande à 6pm',
  'ask.sub': 'Ça passe ? Et si ? Pour quand ?',
  'ask.back': 'Retour',
  'ask.intro':
    'Demande ce qui passe, comment une grosse dépense change tes journées, ou quand un bocal sera plein. Je te montre le calcul.',
  'ask.try': 'Essaie',
  'ask.placeholder': 'Demande ou dis-le simplement…',
  'ask.send': 'Envoyer',
  'ask.speak': 'Demander à voix haute',
  'ask.listening': 'J’écoute…',
  'ask.suggest.afford': 'Je peux m’offrir un dîner à {amount} samedi ?',
  'ask.suggest.weekend': 'Combien pour ce week-end ?',
  'ask.suggest.spend': 'Et si j’achète une veste à {amount} ?',
  'ask.suggest.pot': 'Quand ton bocal {pot} sera plein ?',
  'ask.suggest.save': 'Je devrais épargner plus ?',
  'ask.meter': 'Questions gratuites aujourd’hui : {left} sur {total}',
  'ask.unlimitedWith': 'Illimité avec',
  'ask.locked.title': 'C’était tes {total} questions du jour',
  'ask.locked.sub': 'D’autres demain, ou en illimité avec Max',
  'ask.locked.cta': 'Passer à Max',
  'ask.bar.now': 'Maintenant',
  'ask.bar.after': 'Après',
  'ask.bar.perDay': '{amount} par jour',
  'ask.bar.nothing': 'plus rien',
  'ask.row.free': 'Libre jusqu’à la paie',
  'ask.row.this': 'Cet achat',
  'ask.row.leftPerDay': 'Reste, par jour',
  'ask.row.safeToday': 'À dépenser aujourd’hui',
  'ask.row.tomorrow': 'Demain',
  'ask.row.futureYou': 'Toi du futur, par mois',
  'ask.row.moving': 'Versement en plus',
  'ask.row.inPot': 'Dans le bocal',
  'ask.row.goal': 'Objectif',
  'ask.row.perMonth': 'Chaque mois',
  'ask.answer.fitsToday':
    'Oui, sans problème. Ça tient dans tes {safe} du jour, donc demain ne change pas.',
  'ask.answer.fits': 'Oui. Les jours suivants passent de {from} à {to} jusqu’à la paie.',
  'ask.answer.tight': 'Tu peux, mais c’est juste : les jours suivants passent de {from} à {to}.',
  'ask.answer.tight.pots': 'Prendre {take} dans tes bocaux te laisserait {withPots} par jour.',
  'ask.answer.notThisMonth':
    'Pas ce mois-ci. C’est plus que tout ton argent libre. Ça passe après la paie du {payday}.',
  'ask.answer.notThisMonth.pots': 'Ou prends-en une partie dans un bocal.',
  'ask.answer.weekend.two':
    'Environ {total} pour {first} et {second}, si les jours d’avant restent dans le plan.',
  'ask.answer.weekend.one':
    'Environ {total} pour {first}, si les jours d’avant restent dans le plan.',
  'ask.answer.weekend.none':
    'La paie du {payday} tombe avant le week-end, donc un nouveau chiffre démarre ce jour-là.',
  'ask.answer.saveMore':
    'Verser {amount} de plus à Toi du futur coûterait environ {perDay} par jour jusqu’à la paie.',
  'ask.answer.saveMore.none':
    'Verser {amount} de plus à Toi du futur changerait à peine tes journées.',
  'ask.answer.saveMore.note': 'Tu peux le faire depuis Plan.',
  'ask.answer.potFull': 'À {monthly} par mois, ton bocal {pot} sera plein d’ici {month}.',
  'ask.answer.potFull.done': 'Ton bocal {pot} est déjà plein.',
  'ask.answer.potFull.idle':
    'Rien ne va dans ton bocal {pot} chaque mois pour l’instant, donc il ne se remplira pas tout seul.',
  'ask.answer.noSuchPot':
    'Je ne trouve pas de bocal {pot}. Demande-moi pour l’un des tiens, ou crée-le dans Plan.',
  'ask.answer.noPots':
    'Pas encore de bocal. Crées-en un dans Plan et je te dirai quand il sera plein.',
  'ask.answer.today':
    'Tu peux dépenser {safe} aujourd’hui. Le chiffre de demain est de {tomorrow}.',
  'ask.answer.today.used': 'Le chiffre du jour est épuisé. Celui de demain est de {tomorrow}.',
  'ask.answer.help':
    'Je peux te dire ce qui passe, comment une grosse dépense change tes journées, ou quand un bocal sera plein. Essaie « Je peux dépenser {amount} samedi ? »',
  'ask.error': 'Un souci m’a empêché de répondre. Réessaie.',
  'ask.answer.offline':
    'Je n’ai pas pu joindre le serveur, donc je ne comprends que les questions simples pour l’instant.',
};
