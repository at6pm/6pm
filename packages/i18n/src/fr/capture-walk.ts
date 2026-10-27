import type { Entry } from '../catalogue-types';
import type { enCaptureWalk } from '../en-capture-walk';

// The labels inside the pictured screens are the French iOS and Gmail ones. "Log to 6pm" is the
// shared shortcut's own name, so it stays as it is.
export const frCaptureWalk: { readonly [Key in keyof typeof enCaptureWalk]: Entry } = {
  'capture.walk.stepOf': 'Étape {step} sur {total}',
  'capture.walk.next': 'Suivant',
  'capture.walk.back': 'Retour',
  'capture.walk.again': 'Recommencer',
  'capture.walk.mistakes': 'Erreurs fréquentes',

  'capture.walk.wallet.s1Title': 'Ajoute le raccourci 6pm',
  'capture.walk.wallet.s1Body':
    'Touche « Ajouter le raccourci 6pm » ci-dessous, puis Ajouter un raccourci. Il s’appelle « Log to 6pm ».',
  'capture.walk.wallet.s2Title': 'Ouvre Automatisation et touche +',
  'capture.walk.wallet.s2Body':
    'Dans Raccourcis, touche Bibliothèque, puis Automatisation, puis +. Si tu vois « Décrire un raccourci », touche Modifier.',
  'capture.walk.wallet.s3Title': 'Ajoute le déclencheur Cartes',
  'capture.walk.wallet.s3Body':
    'Dans le panneau du bas, touche Automatisation, puis Cartes. La carte « Lorsque N’importe quelle carte est touchée » apparaît.',
  'capture.walk.wallet.s4Title': 'Exécute « Log to 6pm »',
  'capture.walk.wallet.s4Body':
    'Touche Rechercher, tape « Exécuter le raccourci » et touche-le. Puis touche Raccourci et choisis « Log to 6pm ».',
  'capture.walk.wallet.s5Title': 'Désactive Afficher lors de l’exécution, puis reviens',
  'capture.walk.wallet.s5Body':
    'Laisse l’automatisation activée. Revenir en arrière l’enregistre. Pour ne repérer que certaines cartes, touche N’importe quelle carte et choisis-les.',
  'capture.walk.wallet.s6Title': 'Fais un test',
  'capture.walk.wallet.s6Body':
    'Paie quelque chose avec Apple Pay sur cet iPhone, puis ouvre 6pm. Le paiement est dans ta Boîte de réception.',
  'capture.walk.wallet.mistake1':
    'Un raccourci sans la carte « Lorsque N’importe quelle carte est touchée » en haut. Il ne s’exécute que si tu le lances toi-même.',
  'capture.walk.wallet.mistake2':
    'Exécuter le raccourci laissé sans raccourci. Touche Raccourci et choisis « Log to 6pm », sinon les paiements n’enregistrent rien.',
  'capture.walk.wallet.mistake3':
    'Afficher lors de l’exécution laissé activé. Chaque paiement s’arrête pour t’afficher une carte au lieu de s’enregistrer sans bruit.',
  'capture.walk.wallet.olderTitle': 'Sur iOS 26',
  'capture.walk.wallet.older1': 'Dans Raccourcis, ouvre l’onglet Automatisation et touche +.',
  'capture.walk.wallet.older2':
    'Touche Cartes, choisis tes cartes, sélectionne Exécuter immédiatement, puis Suivant.',
  'capture.walk.wallet.older3': 'Choisis « Log to 6pm » parmi tes raccourcis, puis OK.',
  'capture.walk.wallet.handTitle': 'Tu préfères le créer toi-même ?',
  'capture.walk.wallet.hand1':
    'Au lieu d’Exécuter le raccourci, ajoute « Noter dans 6pm » et désactive Afficher lors de l’exécution.',
  'capture.walk.wallet.hand2':
    'Règle Montant sur Transaction › Montant, et Où sur Transaction › Commerçant.',

  'capture.walk.email.s1Title': 'Sur un ordinateur, ouvre les paramètres de Gmail',
  'capture.walk.email.s1Body':
    'Le transfert ne se règle pas dans l’app Gmail. Dans Gmail sur le Web, clique sur la roue dentée, puis Voir tous les paramètres.',
  'capture.walk.email.s2Title': 'Transfert et POP/IMAP',
  'capture.walk.email.s2Body': 'Ouvre cet onglet et clique sur Ajouter une adresse de transfert.',
  'capture.walk.email.s3Title': 'Colle ton adresse 6pm',
  'capture.walk.email.s3Body':
    'Copie-la avec le bouton ci-dessous, colle-la, puis Suivant et Continuer.',
  'capture.walk.email.s4Title': 'Saisis le code que 6pm t’affiche',
  'capture.walk.email.s4Body':
    'Gmail envoie une confirmation à ton adresse 6pm, et 6pm t’affiche le code. Tape-le à côté de Valider.',
  'capture.walk.email.s5Title': 'Crée un filtre pour les tickets',
  'capture.walk.email.s5Body':
    'Ne transfère pas tout. Ouvre les options de recherche et mets les expéditeurs de tes tickets dans De.',
  'capture.walk.email.s6Title': 'Transfère-les à 6pm',
  'capture.walk.email.s6Body':
    'Clique sur Créer un filtre, coche Transférer à, choisis ton adresse 6pm, puis Créer un filtre à nouveau.',
  'capture.walk.email.otherTitle': 'Autres messageries',
  'capture.walk.email.outlook': 'Outlook.com',
  'capture.walk.email.outlook1': 'Sur le Web, ouvre Paramètres, puis Courrier, puis Règles.',
  'capture.walk.email.outlook2':
    'Ajoute une règle : si le message vient d’un expéditeur de tickets, transfère-le à ton adresse 6pm.',
  'capture.walk.email.outlook3': 'Enregistre. Outlook peut d’abord te demander de te reconnecter.',
  'capture.walk.email.icloud': 'iCloud Mail',
  'capture.walk.email.icloud1': 'Sur icloud.com/mail, ouvre Réglages, puis Règles, puis +.',
  'capture.walk.email.icloud2':
    'Si un message vient d’un expéditeur de tickets, transfère-le à ton adresse 6pm.',
  'capture.walk.email.icloud3': 'Une règle par expéditeur. Ça peut mettre 15 minutes à démarrer.',

  'capture.walk.share.s1Title': 'Ouvre le ticket dans ton app bancaire',
  'capture.walk.share.s1Body':
    'L’écran qui suit un virement, ou un ticket de ton historique. Touche Partager.',
  'capture.walk.share.s2Title': 'Touche 6pm',
  'capture.walk.share.s2Body':
    'Fais défiler la rangée d’apps s’il n’y est pas. Tu peux aussi partager une ou plusieurs photos de tickets.',
  'capture.walk.share.s3Title': 'Vérifie et confirme',
  'capture.walk.share.s3Body':
    'Je lis le montant et le destinataire. Confirme, et c’est dans ta Boîte de réception.',
  'capture.walk.share.inInbox': 'Dans ta Boîte de réception',

  'capture.walk.bank.done': 'Virement effectué',
  'capture.walk.bank.from': 'De',
  'capture.walk.bank.yourBank': 'Ta banque',
  'capture.walk.bank.share': 'Partager',
  'capture.walk.bank.home': 'Accueil',

  'capture.walk.test.paid': 'Terminé',
  'capture.walk.test.inbox': 'Boîte de réception',
  'capture.walk.test.row': 'Apple Pay · à vérifier',

  'capture.walk.ios.library': 'Bibliothèque',
  'capture.walk.ios.allShortcuts': 'Tous les raccourcis',
  'capture.walk.ios.shareSheet': 'Feuille de partage',
  'capture.walk.ios.gallery': 'Galerie',
  'capture.walk.ios.automation': 'Automatisation',
  'capture.walk.ios.apps': 'Apps',
  'capture.walk.ios.edit': 'Modifier',
  'capture.walk.ios.noAutomations': 'Aucune automatisation',
  'capture.walk.ios.noAutomationsSub': 'Exécutez des raccourcis automatiquement.',
  'capture.walk.ios.newShortcut': 'Nouveau raccourci',
  'capture.walk.ios.describe': 'Décrire un raccourci',
  'capture.walk.ios.addActions': 'Ajoutez des actions ci-dessous pour créer un raccourci.',
  'capture.walk.ios.search': 'Rechercher',
  'capture.walk.ios.scripting': 'Scripts',
  'capture.walk.ios.sendMessage': 'Envoyer un message',
  'capture.walk.ios.openApp': 'Ouvrir l’app',
  'capture.walk.ios.playMusic': 'Lire de la musique',
  'capture.walk.ios.app': 'App',
  'capture.walk.ios.appEx': '« Lorsque Météo est ouverte ou fermée »',
  'capture.walk.ios.wallet': 'Cartes',
  'capture.walk.ios.walletEx': '« Lorsque je touche une carte ou un pass Cartes »',
  'capture.walk.ios.screenshot': 'Capture d’écran',
  'capture.walk.ios.screenshotEx': '« Lorsqu’une capture d’écran est enregistrée »',
  'capture.walk.ios.when': 'Lorsque',
  'capture.walk.ios.isTapped': 'est touchée',
  'capture.walk.ios.anyCard': 'N’importe quelle carte',
  'capture.walk.ios.showWhenRun': 'Afficher lors de l’exécution',
  'capture.walk.ios.addShortcut': 'Ajouter un raccourci',
  'capture.walk.ios.dontAdd': 'Ne pas ajouter',
  'capture.walk.ios.runShortcut': 'Exécuter le raccourci',
  'capture.walk.ios.run': 'Exécuter',
  'capture.walk.ios.shortcut': 'Raccourci',
  'capture.walk.ios.shortcutA': 'Heure d’arrivée',
  'capture.walk.ios.shortcutB': 'Minuteur lessive',
  'capture.walk.ios.personal': 'Personnelle',
  'capture.walk.ios.walletSummary': 'Lorsque je touche un pass Cartes ou une carte de paiement',
  'capture.walk.ios.messages': 'Messages',
  'capture.walk.ios.mail': 'Mail',
  'capture.walk.ios.image': 'Image',
  'capture.walk.ios.copy': 'Copier',
  'capture.walk.ios.saveImage': 'Enregistrer l’image',

  'capture.walk.gmail.searchMail': 'Rechercher dans les messages',
  'capture.walk.gmail.quickSettings': 'Configuration rapide',
  'capture.walk.gmail.seeAll': 'Voir tous les paramètres',
  'capture.walk.gmail.settings': 'Paramètres',
  'capture.walk.gmail.general': 'Général',
  'capture.walk.gmail.labels': 'Libellés',
  'capture.walk.gmail.filters': 'Filtres et adresses bloquées',
  'capture.walk.gmail.forwarding': 'Transfert et POP/IMAP',
  'capture.walk.gmail.forwardingHead': 'Transfert :',
  'capture.walk.gmail.addAddress': 'Ajouter une adresse de transfert',
  'capture.walk.gmail.enterAddress': 'Veuillez saisir une nouvelle adresse e-mail de transfert :',
  'capture.walk.gmail.next': 'Suivant',
  'capture.walk.gmail.cancel': 'Annuler',
  'capture.walk.gmail.proceed': 'Continuer',
  'capture.walk.gmail.forwardTo': 'Transférer une copie des messages entrants à',
  'capture.walk.gmail.verify': 'Valider',
  'capture.walk.gmail.code': 'code de validation',
  'capture.walk.gmail.disable': 'Désactiver le transfert',
  'capture.walk.gmail.from': 'De',
  'capture.walk.gmail.subject': 'Objet',
  'capture.walk.gmail.hasWords': 'Contient les mots',
  'capture.walk.gmail.createFilter': 'Créer un filtre',
  'capture.walk.gmail.search': 'Rechercher',
  'capture.walk.gmail.whenArrives':
    'Lorsqu’un message correspond exactement à vos critères de recherche :',
  'capture.walk.gmail.skipInbox': 'Ignorer la boîte de réception (archiver)',
  'capture.walk.gmail.markRead': 'Marquer comme lu',
  'capture.walk.gmail.forwardIt': 'Transférer à :',
  'capture.walk.gmail.inbox': 'Boîte de réception',
};
