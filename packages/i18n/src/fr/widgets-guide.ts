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
  'widgetsGuide.hide.title': 'Masquer les montants',
  'widgetsGuide.hide.what':
    'Les widgets affichent ••• jusqu’à ce que Face ID déverrouille ton téléphone.',
  'widgetsGuide.hide.whatAndroid': 'Les widgets affichent ••• à la place de chaque montant.',
  'widgetsGuide.howToAdd': 'Comment l’ajouter',
  'widgetsGuide.whenItShows': 'Quand il s’affiche',

  'widgetsGuide.home.title': 'Widgets de l’écran d’accueil',
  'widgetsGuide.home.what':
    'De petites cartes postales de ta journée : le vrai ciel de l’heure, le soleil là où il est, et un nombre.',
  'widgetsGuide.home.small': 'Petit',
  'widgetsGuide.home.medium': 'Moyen',
  'widgetsGuide.home.large': 'Grand',
  'widgetsGuide.home.smallWhat':
    'Le nombre du jour sur son ciel, un bocal en compte à rebours, ou tes soirs clôturés d’affilée.',
  'widgetsGuide.home.mediumWhat':
    'Le nombre avec son ciel et tes bocaux. Touche un bocal pour l’ouvrir.',
  'widgetsGuide.home.largeWhat':
    'Le mois en soleils : chaque soir clôturé, et combien dans la limite.',
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
  'widgetsGuide.lock.step3':
    'Touche 6pm, puis choisis l’anneau, le nombre sur une ligne ou un bocal.',

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
    'À six heures, la clôture arrive sur ton écran verrouillé, où attendent aussi un paiement QR ou ton voyage.',
  'widgetsGuide.live.step1':
    'Scanne un QR et paie dans ton app bancaire. Le paiement attend sur ton écran verrouillé.',
  'widgetsGuide.live.step2': 'Touche Payé une fois l’argent parti. Elle se ferme toute seule.',
  'widgetsGuide.live.step3':
    'Elle ne s’affiche pas ? Dans Réglages, ouvre 6pm et active Activités en direct.',

  'widgetsGuide.home.addSafe': 'Ajouter À dépenser aujourd’hui',
  'widgetsGuide.lock.jar': 'Bocal',
  'widgetsGuide.home.addStreak': 'Ajouter Série',
  'widgetsGuide.home.addJar': 'Ajouter un bocal',
  'widgetsGuide.home.addToday': 'Ajouter Mon mois',
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
