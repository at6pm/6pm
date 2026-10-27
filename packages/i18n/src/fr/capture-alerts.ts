import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const frCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'Repérer une alerte bancaire',
  'native.intents.catchAlert.description':
    'Lit une notification de ta banque ou de ton portefeuille sur ton iPhone et dépose l’argent qui a bougé dans la Boîte de réception de 6pm. Les codes, les paiements échoués et les promotions sont ignorés.',
  'native.intents.catchAlert.alertTitle': 'Titre',
  'native.intents.catchAlert.subtitle': 'Sous-titre',
  'native.intents.catchAlert.body': 'Corps',
  'native.intents.catchAlert.date': 'Date',
  'native.intents.catchAlert.app': 'App',
  'capture.alerts.name': 'Alertes bancaires',
  'capture.alerts.sub': 'Tes alertes de banque et de portefeuille se notent toutes seules',
  'capture.alerts.headline': 'Tes alertes de banque et de portefeuille se notent toutes seules.',
  'capture.alerts.time': 'Environ une minute, une seule fois',
  'capture.alerts.step1': 'Dans Raccourcis, crée une automatisation pour les notifications',
  'capture.alerts.step1Chip': 'Automatisation → Notification',
  'capture.alerts.step2': 'Choisis tes apps de banque et de portefeuille',
  'capture.alerts.step3': 'Fais-lui exécuter « Repérer une alerte bancaire »',
  'capture.alerts.step3Chip': 'Repérer une alerte bancaire',
  'capture.alerts.tip':
    'Les codes, les paiements échoués et les promos sont ignorés. Un paiement déjà repéré par Apple Pay ou par e-mail n’est pas ajouté deux fois.',
  'capture.alerts.privacy': 'Les alertes sont lues sur ton iPhone et ne le quittent jamais.',
  'capture.alerts.cameIn': 'Reçu : {amount}',
  'capture.alerts.skip.code': 'un code, ignoré',
  'capture.alerts.skip.failed': 'paiement échoué, ignoré',
  'capture.alerts.skip.promo': 'promo, ignorée',
  'capture.alerts.skip.balance': 'avis de solde, ignoré',
  'capture.alerts.skip.security': 'alerte de sécurité, ignorée',
  'capture.alerts.skip.unread': 'pas un paiement, ignoré',
  'capture.alerts.actionAdd': 'Obtenir le raccourci 6pm',
  'capture.alerts.actionOpen': 'Ouvrir Raccourcis',
  'capture.walk.alerts.s1Title': 'Ouvre Automatisation et touche +',
  'capture.walk.alerts.s1Body':
    'Dans Raccourcis, touche Bibliothèque, puis Automatisation, puis +. Si tu vois « Décrire un raccourci », touche Modifier.',
  'capture.walk.alerts.s2Title': 'Ajoute le déclencheur Notification',
  'capture.walk.alerts.s2Body':
    'Dans le panneau du bas, touche Automatisation, puis Notification. La carte « Lorsque je reçois une notification de App » apparaît.',
  'capture.walk.alerts.s3Title': 'Choisis tes banques et portefeuilles',
  'capture.walk.alerts.s3Body':
    'Touche App et choisis ta banque. Touche + pour ajouter chaque autre app de banque ou de portefeuille avec laquelle tu paies.',
  'capture.walk.alerts.s4Title': 'Ajoute « Repérer une alerte bancaire »',
  'capture.walk.alerts.s4Body':
    'Touche Rechercher, tape « alerte bancaire » et touche Repérer une alerte bancaire de 6pm. Règle Titre, Sous-titre, Corps et Date sur ceux de la Notification.',
  'capture.walk.alerts.s5Title': 'Laisse Notifier désactivé, puis reviens',
  'capture.walk.alerts.s5Body':
    'Touche › sur le déclencheur : laisse Automatisation activé et Notifier désactivé, pour que les alertes soient repérées sans bruit. Revenir en arrière l’enregistre.',
  'capture.walk.alerts.s6Title': 'Fais un test',
  'capture.walk.alerts.s6Body':
    'Paie un petit montant depuis une de ces apps. Quand son alerte arrive, le paiement est dans ta Boîte de réception.',
  'capture.walk.alerts.l1Title': 'Ajoute le raccourci 6pm',
  'capture.walk.alerts.l1Body':
    'Touche « Obtenir le raccourci 6pm » ci-dessus, puis Ajouter un raccourci. Il s’appelle « Catch a bank alert ».',
  'capture.walk.alerts.l2Body':
    'Ouvre-le dans Raccourcis, touche App en haut et choisis ta banque, puis + pour chaque autre banque et portefeuille.',
  'capture.walk.alerts.mistake1':
    'Titre, Corps ou Date laissé vide. Touche chacun et choisis celui de la Notification, sinon les alertes ne notent rien.',
  'capture.walk.alerts.mistake2':
    'Notifier activé. Chaque alerte te sonne alors une deuxième fois au lieu d’être repérée sans bruit.',
  'capture.walk.alerts.mistake3':
    'Une seule app choisie. Coche chaque banque et portefeuille que tu utilises, MoMo et ZaloPay compris.',
  'capture.walk.ios.notification': 'Notification',
  'capture.walk.ios.notificationEx': '« Lorsque je reçois une notification de Météo »',
  'capture.walk.ios.whenNotified': 'Lorsque je reçois une notification de',
  'capture.walk.ios.notificationTitle': 'Notification › Titre',
  'capture.walk.ios.notificationBody': 'Notification › Corps',
  'capture.walk.ios.notificationDate': 'Notification › Date',
  'capture.walk.ios.notificationSummary': 'Lorsque je reçois une notification de MB Bank ou MoMo',
  'capture.walk.ios.alertSearch': 'alerte bancaire',
  'capture.walk.ios.now': 'maintenant',
  'capture.walk.test.alertRow': 'Alerte bancaire · à vérifier',
  'capture.siri.name': 'Dis-le à Siri',
  'capture.siri.sub': 'Dis « Noter dans 6pm », puis ce que c’était',
  'capture.siri.headline': 'Note une dépense à voix haute, sans ouvrir 6pm.',
  'capture.siri.time': 'Rien à régler',
  'capture.siri.step1': 'Commence par « Dis Siri, noter dans 6pm »',
  'capture.siri.step1Chip': 'Noter dans 6pm',
  'capture.siri.step2': 'Siri demande combien. Dis quoi et combien',
  'capture.siri.step2Chip': '« phở quarante-cinq mille »',
  'capture.siri.step3': 'C’est tout de suite dans les dépenses du jour',
  'capture.siri.step3Chip': 'Aujourd’hui',
  'capture.siri.tip':
    'Siri ne parle pas encore vietnamien, alors parle-lui en français. Pour le dire en vietnamien, maintiens Ajout rapide.',
  'capture.backTap.name': 'Toucher le dos',
  'capture.backTap.sub': 'Touche deux fois le dos de ton iPhone pour noter une dépense',
  'capture.backTap.headline': 'Deux petits coups au dos, et Ajout rapide s’ouvre.',
  'capture.backTap.time': 'Trente secondes, une seule fois',
  'capture.backTap.step1': 'Ouvre Réglages, puis Accessibilité, Toucher, Toucher le dos',
  'capture.backTap.step1Chip': 'Toucher le dos',
  'capture.backTap.step2': 'Choisis Toucher deux fois, puis Ajout rapide de 6pm',
  'capture.backTap.step2Chip': 'Toucher deux fois → Ajout rapide',
  'capture.backTap.step3': 'Touche deux fois le dos de ton iPhone. Ajout rapide s’ouvre',
  'capture.backTap.step3Chip': 'Ajout rapide',
  'capture.backTap.tip':
    'Tu ne vois pas Ajout rapide ? Dans Raccourcis, touche +, ajoute Ajout rapide de 6pm et enregistre. Toucher trois fois marche aussi.',
  'capture.walk.ios.notificationSubtitle': 'Notification › Sous-titre',
  'capture.walk.ios.notify': 'Notifier',
  'capture.walk.ios.cancel': 'Annuler',
};
