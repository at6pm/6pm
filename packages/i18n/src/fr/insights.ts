import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion says "je" and "tu", like a friend texting. The daily line is "la barre" in the
// personality lines and "le chiffre du jour" in plain ones; a pot is a "cagnotte".
export const frInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'beaucoup plus',
  'insight.compare.more': 'plus',
  'insight.compare.about': 'à peu près autant',
  'insight.compare.less': 'moins',
  'insight.compare.muchLess': 'beaucoup moins',

  'insight.todayOver.soft.1':
    '{over} de dépassement aujourd’hui. Pas grave : demain, c’est {tomorrow}.',
  'insight.todayOver.soft.2':
    'Une plus grosse journée, {over} au-dessus. Le plan s’adapte : demain, c’est {tomorrow}.',
  'insight.todayOver.cheeky.1':
    '{over} de trop aujourd’hui. Demain, c’est {tomorrow}, et tout neuf.',
  'insight.todayOver.cheeky.2':
    'Aujourd’hui a passé la barre de {over}. Rebondissement ; demain, c’est {tomorrow}.',
  'insight.todayOver.roast.1':
    '{over} de trop. La barre s’est défendue. Demain, c’est {tomorrow}, en douceur cette fois.',
  'insight.todayOver.roast.2':
    'La barre a dit non ; aujourd’hui a dit {over} de plus. Demain, c’est {tomorrow}, deuxième round.',
  'insight.todayOver.plain':
    'Aujourd’hui dépasse le chiffre du jour de {over}. Celui de demain est de {tomorrow}.',

  'insight.todayUnder.soft.1': '{spent} pour l’instant, encore {safe} de marge. Bien régulier.',
  'insight.todayUnder.soft.2': 'Encore {safe} de marge aujourd’hui. Tu t’en sors bien.',
  'insight.todayUnder.cheeky.1':
    'Il reste {safe} aujourd’hui. Dépense bien, ou garde tout. À toi de voir.',
  'insight.todayUnder.cheeky.2': '{spent} de fait, encore {safe} devant toi. Tout en douceur.',
  'insight.todayUnder.roast.1':
    'Seulement {spent} jusqu’ici ? Le portefeuille est perplexe, dans le bon sens. Encore {safe} de marge.',
  'insight.todayUnder.roast.2': 'Encore {safe} de marge. Presque suspect. Continue comme ça.',
  'insight.todayUnder.plain': 'Dépensé aujourd’hui : {spent}. Encore disponible : {safe}.',

  'insight.noSpendYet.soft.1':
    'Rien de dépensé pour l’instant. Tes {line} du jour sont encore tout à toi.',
  'insight.noSpendYet.soft.2': 'Page blanche : {line} pour aujourd’hui.',
  'insight.noSpendYet.cheeky.1': '{line} aujourd’hui, et pas une égratignure. Pour l’instant.',
  'insight.noSpendYet.cheeky.2': 'Tes {line} du jour, intacts. Pour le moment.',
  'insight.noSpendYet.roast.1':
    'Rien de dépensé encore. {line} attendent de voir ce que tu vas en faire.',
  'insight.noSpendYet.roast.2': '{line} posés là, intacts. Suspect. Continue.',
  'insight.noSpendYet.plain': 'Rien de dépensé pour l’instant. Le chiffre du jour est de {line}.',

  'insight.waitingTonight.soft.1': {
    one: 'Une dépense ({amount}) t’attend ce soir. Une minute, pas plus.',
    other: '{count} dépenses ({amount}) t’attendent ce soir. Une minute, pas plus.',
  },
  'insight.waitingTonight.soft.2': {
    one: 'Une dépense à revoir ce soir, {amount}.',
    other: '{count} dépenses à revoir ce soir, {amount} au total.',
  },
  'insight.waitingTonight.cheeky.1': {
    one: 'Une dépense ({amount}) attend son verdict ce soir.',
    other: '{count} dépenses ({amount}) attendent leur verdict ce soir.',
  },
  'insight.waitingTonight.cheeky.2': {
    one: 'Clôture de ce soir : une dépense, {amount}. Facile.',
    other: 'Clôture de ce soir : {count} dépenses, {amount}. Facile.',
  },
  'insight.waitingTonight.roast.1': {
    one: '{amount} en attente. Ça ne va pas se clôturer tout seul, mais une minute suffit.',
    other:
      '{count} dépenses, {amount}, en attente. Elles ne vont pas se clôturer toutes seules ; une minute suffit.',
  },
  'insight.waitingTonight.roast.2': {
    one: '{amount} attend que tu dises « oui, c’était moi ».',
    other: '{count} dépenses, {amount}, attendent que tu dises « oui, c’était moi ».',
  },
  'insight.waitingTonight.plain': {
    one: 'Une dépense ({amount}) attend la clôture de ce soir.',
    other: '{count} dépenses ({amount}) attendent la clôture de ce soir.',
  },

  'insight.paydaySoon.soft.1': {
    one: 'La paie, c’est demain. Tu as tenu.',
    other: 'La paie dans {count} jours. On y est presque.',
  },
  'insight.paydaySoon.soft.2': {
    one: 'Plus qu’un jour avant la paie. Chapeau pour ce mois.',
    other: 'Plus que {count} jours avant la paie, le {payday}. Tiens bon.',
  },
  'insight.paydaySoon.cheeky.1': {
    one: 'Paie demain. Évite d’acheter un yacht.',
    other: 'La paie dans {count} jours. Je la sens venir.',
  },
  'insight.paydaySoon.cheeky.2': {
    one: 'Demain, c’est la paie. Fais comme si de rien n’était.',
    other: 'Encore {count} dodos avant la paie.',
  },
  'insight.paydaySoon.roast.1': {
    one: 'Paie demain. Le portefeuille a survécu.',
    other: 'La paie dans {count} jours. Tiens bon.',
  },
  'insight.paydaySoon.roast.2': {
    one: 'Un jour. On peut résister à tout pendant un jour.',
    other: 'La paie tombe le {payday}. Portefeuille fermé d’ici là.',
  },
  'insight.paydaySoon.plain': {
    one: 'La paie est demain.',
    other: 'La paie est dans {count} jours, le {payday}.',
  },

  'insight.billDueToday.soft.1': '{bill} ({amount}) est à payer aujourd’hui.',
  'insight.billDueToday.soft.2': 'Petit rappel : {bill}, {amount}, à payer aujourd’hui.',
  'insight.billDueToday.cheeky.1': '{bill} réclame ses {amount} aujourd’hui.',
  'insight.billDueToday.cheeky.2': 'L’invité du jour : {bill}, {amount}.',
  'insight.billDueToday.roast.1': '{bill} tombe aujourd’hui. Ça n’attendra pas.',
  'insight.billDueToday.roast.2': '{amount} pour {bill}, aujourd’hui. Pas de ghosting.',
  'insight.billDueToday.plain': 'À payer aujourd’hui : {bill} ({amount}).',

  'insight.billDue.soft.1': {
    one: '{bill} ({amount}) est à payer demain.',
    other: '{bill} ({amount}) est à payer dans {count} jours.',
  },
  'insight.billDue.soft.2': {
    one: 'Petit rappel : {bill}, {amount}, demain.',
    other: 'Petit rappel : {bill}, {amount}, dans {count} jours.',
  },
  'insight.billDue.cheeky.1': {
    one: '{bill} vient chercher ses {amount} demain.',
    other: '{bill} vient chercher ses {amount} dans {count} jours.',
  },
  'insight.billDue.cheeky.2': {
    one: 'Demain : {bill}, {amount}. Note-le.',
    other: 'Dans {count} jours : {bill}, {amount}. Note-le.',
  },
  'insight.billDue.roast.1': {
    one: '{bill} veut {amount} demain. Comme toujours.',
    other: '{bill} veut {amount} dans {count} jours. Comme toujours.',
  },
  'insight.billDue.roast.2': {
    one: '{amount} pour {bill} demain. Pas de fausse surprise.',
    other: '{amount} pour {bill} dans {count} jours. Pas de fausse surprise.',
  },
  'insight.billDue.plain': {
    one: 'À payer demain : {bill} ({amount}).',
    other: 'À payer dans {count} jours : {bill} ({amount}).',
  },

  'insight.categoryPaceUp.soft.1':
    '{category} en est à {now} ce cycle, {compare} qu’au même moment la dernière fois.',
  'insight.categoryPaceUp.soft.2':
    '{category} prend de l’avance : {now} jusqu’ici, contre {before} au dernier cycle.',
  'insight.categoryPaceUp.cheeky.1':
    '{category} : déjà {now}. Au dernier cycle, tu en étais à {before}. Hmm.',
  'insight.categoryPaceUp.cheeky.2': '{category} vit sa meilleure vie : {now} contre {before}.',
  'insight.categoryPaceUp.roast.1':
    '{category} à {now}. Dernier cycle : {before}. Je vois tout. Une semaine calme, et ça s’équilibre.',
  'insight.categoryPaceUp.roast.2':
    'Déjà {now} côté {category} ; c’était {before} la dernière fois. Je dis ça avec amour.',
  'insight.categoryPaceUp.plain':
    '{category} : {now} ce cycle, {before} au même stade du cycle précédent.',

  'insight.categoryPaceDown.soft.1':
    '{category} redescend à {now}, contre {before} au dernier cycle. Joli.',
  'insight.categoryPaceDown.soft.2':
    'Côté {category}, {compare} qu’au dernier cycle : {now} contre {before}.',
  'insight.categoryPaceDown.cheeky.1':
    '{category} : {now}, contre {before} avant. Mais regarde-toi !',
  'insight.categoryPaceDown.cheeky.2': '{category} au régime : {now} contre {before}.',
  'insight.categoryPaceDown.roast.1':
    '{category} seulement à {now} ? C’était {before}. Garde cette version-là.',
  'insight.categoryPaceDown.roast.2':
    '{now} côté {category}, contre {before} avant. Quelle maturité.',
  'insight.categoryPaceDown.plain':
    '{category} : {now} ce cycle, {before} au même stade du cycle précédent.',

  'insight.repeatMerchant.soft.1': '{merchant}, {visits} fois cette semaine. Ils doivent t’adorer.',
  'insight.repeatMerchant.soft.2':
    '{visits} passages chez {merchant} depuis lundi, {amount} au total.',
  'insight.repeatMerchant.cheeky.1': 'Encore {merchant} ? Ça fait {visits} depuis lundi.',
  'insight.repeatMerchant.cheeky.2':
    'Toi et {merchant} : {visits} rendez-vous cette semaine, {amount}.',
  'insight.repeatMerchant.roast.1':
    '{merchant}, visite numéro {visits}. Ils connaissent déjà ton prénom ?',
  'insight.repeatMerchant.roast.2':
    '{amount} chez {merchant} cette semaine. {visits} visites. Un art de vivre.',
  'insight.repeatMerchant.plain': '{merchant} : {visits} visites cette semaine, {amount}.',

  'insight.firstTimeMerchant.soft.1': 'Première fois chez {merchant}. J’espère que c’était bien.',
  'insight.firstTimeMerchant.soft.2': 'Un nouvel endroit : {merchant}, {amount}.',
  'insight.firstTimeMerchant.cheeky.1': '{merchant} ? Nouvelle adresse. Quel esprit d’aventure.',
  'insight.firstTimeMerchant.cheeky.2': 'Oh, {merchant}. Jamais vu celui-là.',
  'insight.firstTimeMerchant.roast.1': '{merchant}. Nouvel endroit, même portefeuille.',
  'insight.firstTimeMerchant.roast.2':
    'Première visite chez {merchant}. N’en fais pas une habitude. Ou si.',
  'insight.firstTimeMerchant.plain': 'Première dépense chez {merchant} : {amount}.',

  'insight.biggestSpend.soft.1': 'La grosse dépense de la semaine : {amount} chez {merchant}.',
  'insight.biggestSpend.soft.2':
    '{merchant}, {amount} : la plus grosse de la semaine. Le plan l’encaisse.',
  'insight.biggestSpend.cheeky.1': 'Tête d’affiche de la semaine : {merchant}, {amount}.',
  'insight.biggestSpend.cheeky.2': '{amount} chez {merchant}. On se fait plaisir, apparemment.',
  'insight.biggestSpend.roast.1':
    '{amount} chez {merchant}. Le personnage principal de la semaine.',
  'insight.biggestSpend.roast.2':
    '{merchant} a pris {amount} cette semaine. Ça valait le coup ? Ne réponds pas. Le plan l’encaisse.',
  'insight.biggestSpend.plain': 'Plus grosse dépense de la semaine : {amount} chez {merchant}.',

  'insight.underStreak.soft.1': '{days} jours d’affilée sous la barre. Quelle régularité.',
  'insight.underStreak.soft.2': '{days} jours calmes à la suite.',
  'insight.underStreak.cheeky.1': '{days} jours sous la barre. En pleine série.',
  'insight.underStreak.cheeky.2': 'Sous la barre depuis {days} jours. Chut, pas de poisse.',
  'insight.underStreak.roast.1': '{days} jours sous la barre. J’avais des blagues prêtes. Gâchées.',
  'insight.underStreak.roast.2': '{days} jours d’affilée. Je suis à court de blagues.',
  'insight.underStreak.plain': '{days} jours clôturés d’affilée sans dépasser le chiffre du jour.',

  'insight.closeStreak.soft.1': '{days} jours clôturés d’affilée. C’est ça, le rituel.',
  'insight.closeStreak.soft.2': 'Une série de {days} jours de clôture. Merci d’être là.',
  'insight.closeStreak.cheeky.1': '{days} clôtures d’affilée. Habitude débloquée.',
  'insight.closeStreak.cheeky.2': 'Série : {days}. Ce soir, on l’allonge.',
  'insight.closeStreak.roast.1': '{days} jours de suite. La série te va bien ; ne la casse pas.',
  'insight.closeStreak.roast.2':
    '{days} clôtures à la suite. Ce n’est pas le moment de casser la série.',
  'insight.closeStreak.plain': '{days} jours clôturés d’affilée.',

  'insight.weekSpare.soft.1': {
    one: 'Cette semaine laisse {spare} d’avance, reportés sur les jours qui viennent.',
    other: '{count} jours sous la barre cette semaine : {spare} reportés sur la suite.',
  },
  'insight.weekSpare.soft.2': {
    one: '{spare} de reste cette semaine, reportés sur la suite.',
    other: '{spare} de reste cette semaine, reportés sur la suite.',
  },
  'insight.weekSpare.cheeky.1': {
    one: '{spare} de reste cette semaine. Les jours à venir te disent merci.',
    other: '{spare} de reste grâce à {count} bonnes journées. Les jours à venir te disent merci.',
  },
  'insight.weekSpare.cheeky.2': {
    one: 'La semaine a {spare} d’avance. Tout en douceur.',
    other: 'La semaine a {spare} d’avance. Tout en douceur.',
  },
  'insight.weekSpare.roast.1': {
    one: '{spare} de reste. Ne dépense pas tout d’un coup.',
    other: '{count} jours sous la barre, {spare} de reste. Ne dépense pas tout d’un coup.',
  },
  'insight.weekSpare.roast.2': {
    one: 'Semaine à {spare} d’avance. Bon, je laisse passer.',
    other: 'Semaine à {spare} d’avance. Bon, je laisse passer.',
  },
  'insight.weekSpare.plain': {
    one: 'Les jours clôturés de cette semaine laissent {spare} de reste.',
    other: 'Les jours clôturés de cette semaine laissent {spare} de reste.',
  },

  'insight.weekOver.soft.1':
    'Cette semaine a dépassé de {over}. Les jours à venir seront un peu plus serrés, et ce n’est pas grave.',
  'insight.weekOver.soft.2': '{over} de trop cette semaine. On va lisser ça.',
  'insight.weekOver.cheeky.1': 'La semaine est à {over} de trop. Le reste du mois s’ajuste.',
  'insight.weekOver.cheeky.2': '{over} de trop pour l’instant. Un rebondissement, pas la fin.',
  'insight.weekOver.roast.1':
    'Cette semaine : {over} de trop. Une semaine prochaine plus calme, et le mois encaisse.',
  'insight.weekOver.roast.2': '{over} de trop. Une semaine à oublier, un mois pour rattraper.',
  'insight.weekOver.plain': 'Les jours clôturés de cette semaine ont dépassé de {over}.',

  'insight.potMilestone.soft.1': 'La cagnotte {pot} a passé les {percent} %. Regarde-la grandir.',
  'insight.potMilestone.soft.2': '{percent} % du chemin vers la cagnotte {pot}.',
  'insight.potMilestone.cheeky.1': 'Cagnotte {pot} : {percent} % atteints. Ça se concrétise.',
  'insight.potMilestone.cheeky.2':
    '{percent} % de la cagnotte {pot}, c’est fait. Continue à la nourrir.',
  'insight.potMilestone.roast.1':
    'Cagnotte {pot} à {percent} %. La cagnotte gagne. Laisse-la faire.',
  'insight.potMilestone.roast.2': '{percent} % vers la cagnotte {pot}. Pas touche.',
  'insight.potMilestone.plain': 'La cagnotte {pot} a passé {percent} % de son objectif.',

  'insight.potFull.soft.1': 'La cagnotte {pot} est pleine. C’est grâce à toi.',
  'insight.potFull.soft.2': 'Cagnotte {pot} : c’est fait. Profites-en, vraiment.',
  'insight.potFull.cheeky.1': 'La cagnotte {pot} est pleine ! Confettis, mais en silence.',
  'insight.potFull.cheeky.2': 'Cagnotte {pot}, remplie à ras bord.',
  'insight.potFull.roast.1':
    'La cagnotte {pot} est pleine. J’avais une blague prête ; tu n’en as pas eu besoin.',
  'insight.potFull.roast.2':
    'Cagnotte pleine : {pot}. Maintenant, dépense-la pour ce à quoi elle était destinée.',
  'insight.potFull.plain': 'La cagnotte {pot} a atteint son objectif.',

  'insight.workToClaim.soft.1': {
    one: 'Une dépense pro ({amount}) à te faire rembourser.',
    other: '{count} dépenses pro ({amount}) à te faire rembourser.',
  },
  'insight.workToClaim.soft.2': {
    one: '{amount} de frais pro en attente de remboursement.',
    other: '{amount} de frais pro, {count} dépenses, en attente de remboursement.',
  },
  'insight.workToClaim.cheeky.1': {
    one: 'Le boulot te doit {amount}.',
    other: 'Le boulot te doit {amount}. {count} tickets, quand même.',
  },
  'insight.workToClaim.cheeky.2': {
    one: '{amount} de dépenses pro. Va les récupérer.',
    other: '{count} dépenses pro, {amount}. Va les récupérer.',
  },
  'insight.workToClaim.roast.1': {
    one: 'Ta boîte te doit {amount}. Ne sois pas timide.',
    other: 'Ta boîte te doit {amount}. {count} fois. Ne sois pas timide.',
  },
  'insight.workToClaim.roast.2': {
    one: 'Tu finances ton boulot à hauteur de {amount}. Fais-toi rembourser.',
    other: 'Tu finances ton boulot à hauteur de {amount}. Fais-toi rembourser.',
  },
  'insight.workToClaim.plain': {
    one: 'Une dépense pro ({amount}) attend d’être remboursée.',
    other: '{count} dépenses pro ({amount}) attendent d’être remboursées.',
  },
};
