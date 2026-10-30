import type { Entry } from '../catalogue-types';
import type { enIntents } from '../en-intents';

// iOS names as the French iPhone shows them: Raccourcis, Cartes, écran verrouillé, bouton Action.
// "Log to 6pm" is the shared shortcut's own name and stays as it is.
export const frIntents: { readonly [Key in keyof typeof enIntents]: Entry } = {
  'capture.settings.title': 'Comment tes dépenses sont repérées',
  'capture.settings.summary': '{on} sur {total} activés',
  'capture.status.on': 'Activé',
  'capture.status.off': 'Désactivé',
  'capture.settings.widgets': 'Widgets',
  'capture.settings.widgetsValue': 'Accueil & verrouillage',
  'capture.last': 'Dernier : {name} · {time}',

  'capture.guide.back': 'Réglages',
  'capture.guide.howItWorks': 'Comment ça marche',
  'capture.guide.trouble': 'Ça ne marche pas ?',
  'capture.guide.lands': 'Ce qui arrive dans ta Boîte de réception',
  'capture.guide.landsNote':
    'Ça t’y attend jusqu’à ce que tu le gardes à la clôture de 18 h. Rien ne compte tant que tu ne l’as pas dit.',

  'capture.share.name': 'Partager avec 6pm',
  'capture.share.sub': 'Touche Partager sur un ticket bancaire, puis 6pm',
  'capture.share.headline': 'Partage un ticket bancaire. Je lis le montant.',
  'capture.share.time': 'Moins d’une minute',
  'capture.share.step1': 'Ouvre le ticket du virement dans ton app bancaire',
  'capture.share.step2': 'Touche Partager, puis 6pm',
  'capture.share.step2Chip': 'Partager → 6pm',
  'capture.share.step3': 'Retourne à ta journée. C’est dans ta Boîte de réception',
  'capture.share.step3Chip': 'Boîte de réception',
  'capture.share.tip':
    'Fais glisser 6pm en tête de ta rangée de partage. Il sera alors à un toucher de n’importe quel ticket.',
  'capture.share.action': 'Épingler 6pm dans Partager',
  'capture.share.pinText': 'Touche Plus, puis Modifier, puis ajoute 6pm.',

  'capture.email.name': 'Tickets par e-mail',
  'capture.email.sub': 'Pas d’adresse de transfert sur cet iPhone',
  'capture.email.headline': 'Transfère tes tickets. Ils arrivent tout seuls.',
  'capture.email.time': 'Deux minutes, une seule fois',
  'capture.email.step1': 'Copie ton adresse 6pm',
  'capture.email.step1Chip': 'Ton adresse 6pm',
  'capture.email.step2': 'Transfère-lui un e-mail de Grab, de Shopee ou de ta banque',
  'capture.email.step2Chip': 'Transférer',
  'capture.email.step3': 'Ou crée un filtre une fois, pour qu’ils se transfèrent tout seuls',
  'capture.email.step3Chip': 'Filtre Gmail ou Outlook',
  'capture.email.tip':
    'Marche mieux avec les tickets électroniques de Grab, Be, Shopee et des banques. Les autres e-mails sont ignorés.',
  'capture.email.sample': 'Course Grab pour rentrer',

  'capture.scan.name': 'Scanner et payer',
  'capture.scan.sub':
    'Scanne un VietQR pour payer dans ton app bancaire, ou un ticket pour le noter',
  'capture.scan.headline': 'Scanne, paie dans ton app bancaire, reviens.',
  'capture.scan.time': 'À chaque paiement',
  'capture.scan.step1': 'Scanne n’importe quel VietQR depuis 6pm',
  'capture.scan.step1Chip': 'Scanner',
  'capture.scan.step2': 'Choisis ta banque. Elle s’ouvre avec le montant déjà rempli',
  'capture.scan.step2Chip': 'Ouvrir ta banque',
  'capture.scan.step3': 'De retour dans 6pm, touche Payé. Sinon, je te demanderai plus tard',
  'capture.scan.step3Chip': 'Payé · Pas encore',
  'capture.scan.tip':
    'Ajoute Scanner à ton écran verrouillé ou au bouton Action pour ne pas avoir à déverrouiller.',
  'capture.scan.action': 'Scanner maintenant',

  'capture.wallet.name': 'Automatisation Cartes',
  'capture.wallet.subOn': 'Activée · repère les paiements Apple Pay',
  'capture.wallet.subOff': 'Active-la dans Raccourcis pour repérer Apple Pay',
  'capture.wallet.statusOn': 'Activée · chaque paiement',
  'capture.wallet.headline': 'Repère tes paiements Apple Pay sans lever le petit doigt.',
  'capture.wallet.time': 'Environ une minute, une seule fois',
  'capture.wallet.step1': 'Ajoute le raccourci 6pm',
  'capture.wallet.step1Chip': 'Raccourci Log to 6pm',
  'capture.wallet.step2': 'Dans Raccourcis, ajoute une automatisation Cartes',
  'capture.wallet.step2Chip': 'Automatisation → Cartes',
  'capture.wallet.step3': 'Fais-lui exécuter « Log to 6pm »',
  'capture.wallet.step3Chip': 'Exécuter le raccourci',
  'capture.wallet.tip':
    'Les paiements apportent le commerçant et le montant. Tu les confirmes quand même à 18 h.',
  'capture.wallet.actionAdd': 'Ajouter le raccourci 6pm',
  'capture.wallet.actionOff': 'Ouvrir Raccourcis',
  'capture.wallet.actionOn': 'Désactiver',

  'capture.widgets.name': 'Widgets et commandes',
  'capture.widgets.sub': 'Écran verrouillé · Centre de contrôle · Bouton Action',
  'capture.widgets.headline': 'Note-la avant que ton téléphone retourne dans ta poche.',
  'capture.widgets.time': 'Trente secondes',
  'capture.widgets.step1': 'Maintiens le doigt sur ton écran verrouillé, puis Personnaliser',
  'capture.widgets.step1Chip': 'Écran verrouillé',
  'capture.widgets.step2': 'Ajoute Scanner ou Ajout rapide de 6pm',
  'capture.widgets.step2Chip': '6pm · Ajout rapide',
  'capture.widgets.step3': 'Ou règle le bouton Action sur 6pm',
  'capture.widgets.step3Chip': 'Bouton Action',
  'capture.widgets.tip': 'Maintiens Ajout rapide et dis-le : « thé au lait 45k ».',
  'capture.widgets.action': 'Terminé',
};
