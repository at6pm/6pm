import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: « ce téléphone », Google Play and the gallery; never an Apple name.
export const frAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    'Trois façons d’entrer une dépense : Ajout rapide (tapé ou dicté), scanner un QR ou un ticket, et transférer tes e-mails de tickets. Ce que 6pm repère t’attend dans la Boîte de réception jusqu’à la clôture.',
  'capture.share.headline':
    'Enregistre le ticket en image, puis choisis-la dans Scanner. Je lirai le montant.',
  'capture.wallet.headline':
    'Apple Pay n’existe pas sur ce téléphone. Transfère les e-mails de tickets de ta carte, et ils arrivent tout seuls.',
  'capture.widgets.headline':
    'Pas de widgets 6pm sur ce téléphone. Maintiens le bouton de scan, et Ajout rapide s’ouvre.',

  'backup.row.on': 'Chiffrée · {when}',
  'backup.status.sub': {
    one: '{count} élément · chiffré. 6pm marche aussi sans.',
    other: '{count} éléments · chiffrés. 6pm marche aussi sans.',
  },
  'backup.status.neverSub': 'Chiffrée. 6pm marche aussi sans.',
  'backup.off.sub':
    'Scellée sur ce téléphone avant de partir. La clé reste sur ce téléphone, donc nous ne pouvons rien lire.',
  'backup.tooLarge':
    'La dernière sauvegarde était trop lourde pour être envoyée. Tout est encore sur ce téléphone.',
  'backup.note':
    'Une sauvegarde par jour, après ta clôture. La clé ne quitte jamais ce téléphone : une sauvegarde ne s’ouvre qu’ici, pas sur un nouveau téléphone.',
  'backup.paused':
    'La sauvegarde est en pause sans Max. Ta dernière sauvegarde reste en sécurité, chiffrée.',
  'backup.found.title': 'Il y a déjà une sauvegarde pour ce téléphone.',
  'backup.found.sub':
    'Elle vient d’une installation précédente. Sauvegarder depuis ici la remplacerait.',
  'backup.found.restoreConfirm': 'Touche encore pour remplacer les journées de ce téléphone',
  'backup.found.replace': 'La remplacer par ce téléphone',
  'backup.restore.sub': {
    one: '{count} élément · chiffré.',
    other: '{count} éléments · chiffrés.',
  },
  'backup.restore.none': 'Aucune sauvegarde trouvée pour ce téléphone.',
  'backup.restore.wrongKey': 'La clé de ce téléphone ne peut pas ouvrir cette sauvegarde.',
  'backup.error.keychain':
    'Ce téléphone n’a pas gardé la clé, donc rien n’a été sauvegardé. Réessaie.',
  'backup.error.tooLarge':
    'Cette sauvegarde est trop lourde pour être envoyée. Tout est encore sur ce téléphone.',

  'capture.email.sub': 'Pas d’adresse de transfert sur ce téléphone',
  'capture.scan.tip':
    'Maintiens le bouton de scan pour Ajout rapide quand il n’y a pas de code à scanner.',
  'onboarding.catch.add.body':
    'Maintiens le bouton de scan pour Ajout rapide et dis « café {amount} ».',
  'today.list.empty':
    'Rien de repéré pour l’instant. Scanne un QR ou un ticket, ou touche + quand tu dépenses.',

  'looks.restore.none': 'Rien à restaurer sur ce compte Google.',
  'looks.restore.failed': 'Impossible de joindre Google Play. Réessaie.',
  'looks.legal':
    'Les Looks sont des achats uniques sur ton compte Google. Max est un abonnement que tu peux résilier à tout moment dans Google Play. Les prix sont affichés par Google Play.',
  'look.buying': 'En attente de Google Play…',
  'look.noteStoreOff': 'Google Play ne répond pas, donc ce look ne peut pas encore être acheté.',
  'max.cta.waiting': 'En attente de Google Play…',
  'max.terms.storeOff': 'Max ne peut pas être acheté pour l’instant : Google Play ne répond pas.',
  'max.sub.backup': 'Sauvegarde chiffrée, historique complet, CSV et Sheets.',
  'max.note.backup': 'Sauvegarde chiffrée, CSV et Sheets',
  'max.welcome.win.more': 'Cagnottes, voyages et l’Album de l’année',

  'privacy.ai.device.title': 'Uniquement sur ce téléphone',
  'privacy.ai.device.unavailable': 'Ce téléphone n’a pas assez de mémoire pour un modèle à lui.',
  'settings.ai.device': 'Sur ce téléphone',
  'privacy.leaves.device.none': 'Rien côté IA. Tout est calculé sur ce téléphone.',
  'receiptEmail.deviceMode': 'Désactivé tant que l’IA reste sur ce téléphone',
  'receiptEmail.deviceMode.body':
    'Les tickets par e-mail ont besoin de notre serveur pour lire tes messages, donc c’est désactivé tant que 6pm garde l’IA sur ce téléphone. Scanne plutôt le ticket.',
  'settings.privacyBody':
    'Ton argent reste sur ce téléphone, chiffré. Pour lire tes questions à Demande à 6pm et écrire les répliques de ton compagnon, 6pm envoie à Anthropic, un service d’IA, la question ou quelques faits sur ta journée : montants, lieux et noms de catégories, jamais ta liste de dépenses. Une photo de ticket que ton téléphone ne sait pas lire y part aussi. Anthropic ne s’en sert pas pour l’entraînement et les supprime sous 30 jours. Quand tu dictes une dépense, ta voix part chez Deepgram pour devenir du texte. Dans IA, plus haut, tu peux tout garder sur ce téléphone. La sauvegarde ne part que si tu l’actives, chiffrée de bout en bout. Les rapports de plantage partent chez Sentry sans montants, noms ni notes, et RevenueCat gère les achats.',

  'scan.handoff.store': '{wallet} n’est pas sur ce téléphone',
  'scan.handoff.savedQr':
    'QR enregistré dans ta galerie : scanne-le depuis tes photos dans l’app bancaire. Je te demande à ton retour.',
  'sharing.saved': 'Enregistrée dans ta galerie.',
  'sharing.photosOff': 'L’accès aux photos est désactivé pour 6pm.',

  'startup.failedSub': 'Rien n’est perdu. Réessaie et, si ça continue, redémarre ton téléphone.',
  'voice.unavailable': 'La voix demande la dictée en {language} sur ce téléphone',

  'onboarding.privacy.phone': 'Uniquement sur ce téléphone',
  'onboarding.privacy.backupSub': 'Verrouillées par une clé qui ne quitte jamais ce téléphone',
};
