import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// Spoken examples stay Vietnamese-flavoured (« 45k », « 10tr », « phở »): that is how prices read
// where 6pm is used.
export const frAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': 'Ajouter',
  'ask.action.notNow': 'Pas maintenant',
  'ask.action.confirmSpend': 'Ajouter {name}, {amount}, à {category} ?',
  'ask.action.added': 'Ajouté. {name}, {amount}, compte pour aujourd’hui.',
  'ask.action.cancelled': 'OK, rien n’a changé.',
  'ask.action.failed': 'Ça n’a pas été enregistré. Essaie plutôt Ajout rapide.',
  'ask.action.confirmPot': 'Une cagnotte pour {name} : {goal}. On la crée ?',
  'ask.action.confirmPotBy': 'Une cagnotte pour {name} : {goal} d’ici {month}. On la crée ?',
  'ask.action.setUp': 'La créer',
  'ask.action.potLocked':
    'La version gratuite garde une cagnotte à toi, et elle est déjà prise. Max fait de la place pour d’autres.',
  'ask.action.seeMax': 'Voir Max',
  'ask.action.potGoal': 'Combien pour {name} ? Dis-le-moi, comme « 10tr ».',
  'ask.action.showMe': 'Montre-moi',
  'ask.action.openQuickAdd': 'Ouvrir Ajout rapide',
  'ask.howTo.ways':
    'Six façons d’entrer une dépense : Ajout rapide (tapé ou dicté), partager un ticket bancaire avec 6pm, transférer tes e-mails de tickets, scanner un VietQR pour payer, les paiements Apple Pay qui arrivent tout seuls, et les widgets et commandes. Ce que 6pm repère t’attend dans la Boîte de réception jusqu’à la clôture.',
  'ask.howTo.quickAdd':
    'Ajout rapide prend une dépense tapée ou dite à voix haute, comme « thé au lait 45k ». Ou dis-le-moi ici : « je viens de manger un phở 50k ».',
  'ask.howTo.dailyNumber':
    'Ton chiffre du jour, c’est l’argent libre de ce cycle de paie, après les factures, Toi du futur et les cagnottes, réparti sur les jours qui restent avant la paie. Dépense moins et celui de demain grossit ; dépasse et il diminue un peu.',
  'ask.howTo.negative':
    'Il passe sous zéro quand les dépenses du cycle dépassent son argent libre. Rien ne casse : le plan répartit l’écart sur les jours restants. Lève le pied quelques jours, ou prends un peu dans une cagnotte depuis Plan.',
  'ask.howTo.pot':
    'Une cagnotte, c’est de l’argent mis de côté pour une seule chose, comme un voyage ou le Tết. 6pm y verse un peu chaque mois et le garde hors de ton chiffre du jour, pour qu’il soit là quand tu en as besoin.',
  'ask.howTo.close':
    'À 18 h, tu clôtures ta journée : garde ou écarte ce qui a été repéré, puis vois où tu en es. Si tu la rates, rien n’est perdu ; les dépenses repérées attendent, et comptent, jusqu’à ce que tu décides.',
  'ask.howTo.budget':
    '6pm n’a pas de budget par catégorie. Ton chiffre du jour est le budget : factures, Toi du futur et cagnottes sont déjà mis de côté. Pour dépenser moins sur quelque chose, lance une cagnotte ou donne plus à Toi du futur dans Plan.',
};
