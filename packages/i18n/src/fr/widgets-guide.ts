import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps use the names iOS shows in French (Modifier, Ajouter un widget, Personnaliser, Réglages).
export const frWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'Widgets et commandes',
  'widgetsGuide.headline': '6pm, à un coup d’œil ou une pression.',
  'widgetsGuide.lede':
    'Garde le chiffre du jour là où tu regardes déjà, et ouvre Scanner QR ou Ajout rapide sans chercher l’app.',
  'widgetsGuide.lookMax': 'Dessinés dans ton look.',
  'widgetsGuide.lookFree': 'Gratuits, en Heure dorée. Avec Max, ils prennent ton look.',
  'widgetsGuide.howToAdd': 'Comment l’ajouter',
  'widgetsGuide.whenItShows': 'Quand il s’affiche',

  'widgetsGuide.home.title': 'Widgets de l’écran d’accueil',
  'widgetsGuide.home.what': 'Le chiffre du jour en un coup d’œil. Touche-en un pour ouvrir 6pm.',
  'widgetsGuide.home.small': 'Petit',
  'widgetsGuide.home.medium': 'Moyen',
  'widgetsGuide.home.large': 'Grand',
  'widgetsGuide.home.smallWhat': 'Ce que tu peux dépenser aujourd’hui.',
  'widgetsGuide.home.mediumWhat': 'Le chiffre, avec Scanner QR et Ajout rapide à côté.',
  'widgetsGuide.home.largeWhat': 'Ce qui reste, et les dernières dépenses du jour.',
  'widgetsGuide.home.step1':
    'Touche et maintiens un espace vide de l’écran d’accueil jusqu’à ce que les apps bougent.',
  'widgetsGuide.home.step2': 'Touche Modifier en haut, puis Ajouter un widget.',
  'widgetsGuide.home.step3':
    'Cherche 6pm, balaie jusqu’à la taille voulue, puis touche Ajouter un widget.',

  'widgetsGuide.lock.title': 'Widgets de l’écran verrouillé',
  'widgetsGuide.lock.what': 'Vois ce qui reste aujourd’hui sans déverrouiller ton iPhone.',
  'widgetsGuide.lock.ring': 'Anneau',
  'widgetsGuide.lock.card': 'Carte',
  'widgetsGuide.lock.step1': 'Touche et maintiens l’écran verrouillé, puis touche Personnaliser.',
  'widgetsGuide.lock.step2': 'Choisis Écran verrouillé, puis touche l’espace sous l’heure.',
  'widgetsGuide.lock.step3': 'Touche 6pm, puis choisis l’anneau ou la carte.',

  'widgetsGuide.control.title': 'Centre de contrôle',
  'widgetsGuide.control.what':
    'Balaie vers le bas, touche une fois, et te voilà dans Scanner QR ou Ajout rapide.',
  'widgetsGuide.control.needs': 'iOS 18 ou ultérieur',
  'widgetsGuide.control.step1': 'Balaie vers le bas depuis le coin supérieur droit de l’écran.',
  'widgetsGuide.control.step2':
    'Touche et maintiens un espace vide, puis touche Ajouter une commande.',
  'widgetsGuide.control.step3': 'Cherche 6pm et choisis Scanner QR ou Ajout rapide.',
  'widgetsGuide.control.note':
    'Ces deux-là peuvent aussi remplacer la lampe torche ou l’appareil photo en bas de ton écran verrouillé.',

  'widgetsGuide.action.title': 'Bouton Action',
  'widgetsGuide.action.what': 'Maintiens le bouton sur le côté pour ouvrir Scanner QR.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro et ultérieurs',
  'widgetsGuide.action.step1': 'Ouvre Réglages, puis Bouton Action.',
  'widgetsGuide.action.step2':
    'Balaie jusqu’à Commandes, puis touche le nom de la commande en dessous.',
  'widgetsGuide.action.step3': 'Cherche 6pm et choisis Scanner QR ou Ajout rapide.',
  'widgetsGuide.action.note':
    'Tu préfères le dire ? Dis à Siri « Noter dans 6pm », puis le montant.',

  'widgetsGuide.live.title': 'Activité en direct',
  'widgetsGuide.live.what':
    'S’affiche toute seule pendant qu’un paiement QR attend, et pendant tes voyages.',
  'widgetsGuide.live.step1':
    'Scanne un QR et paie dans ton app bancaire. Le paiement attend sur ton écran verrouillé.',
  'widgetsGuide.live.step2': 'Touche Payé une fois l’argent parti. Elle se ferme toute seule.',
  'widgetsGuide.live.step3':
    'Elle ne s’affiche pas ? Dans Réglages, ouvre 6pm et active Activités en direct.',

  'widgetsGuide.home.addSafe': 'Ajouter À dépenser aujourd’hui',
  'widgetsGuide.home.addToday': 'Ajouter Aujourd’hui',
  'widgetsGuide.tiles.title': 'Blocs des Réglages rapides',
  'widgetsGuide.tiles.what':
    'Glisse vers le bas, touche une fois, et tu es dans Scanner QR ou Ajout rapide.',
  'widgetsGuide.tiles.step1': 'Glisse deux fois vers le bas depuis le haut de l’écran.',
  'widgetsGuide.tiles.step2': 'Touche le crayon pour modifier tes blocs.',
  'widgetsGuide.tiles.step3':
    'Trouve Scanner QR et Ajout rapide de 6pm, puis fais-les glisser vers le haut.',
  'widgetsGuide.tiles.addScan': 'Ajouter le bloc Scanner QR',
  'widgetsGuide.tiles.addQuickAdd': 'Ajouter le bloc Ajout rapide',
  'widgetsGuide.tiles.scanIn': 'Scanner QR est dans les Réglages rapides',
  'widgetsGuide.tiles.quickAddIn': 'Ajout rapide est dans les Réglages rapides',
};
