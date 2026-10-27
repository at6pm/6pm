import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// iOS calls the keychain « Trousseau iCloud » and its settings « Réglages ».
export const frBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'Sauvegarde',
  'backup.row.off': 'Désactivée',
  'backup.row.on': 'iCloud, {when}',
  'backup.row.found': 'Sauvegarde trouvée',
  'backup.row.deleting': 'Suppression…',
  'backup.ago.now': 'à l’instant',
  'backup.ago.minutes': { one: 'il y a {count} minute', other: 'il y a {count} minutes' },
  'backup.ago.hours': { one: 'il y a {count} heure', other: 'il y a {count} heures' },
  'backup.ago.days': { one: 'il y a {count} jour', other: 'il y a {count} jours' },

  'backup.status.on': 'Sauvegardé {when}.',
  'backup.status.sub': {
    one: 'iCloud · {count} élément · chiffré. 6pm marche aussi sans.',
    other: 'iCloud · {count} éléments · chiffrés. 6pm marche aussi sans.',
  },
  'backup.status.never': 'Prête quand tu l’es.',
  'backup.status.neverSub': 'iCloud · chiffrée. 6pm marche aussi sans.',
  'backup.off.title': 'Garde chaque journée, pour toujours.',
  'backup.off.sub':
    'Scellée sur cet iPhone avant de partir. La clé reste dans ton Trousseau iCloud, donc nous ne pouvons rien lire.',
  'backup.tooLarge':
    'La dernière sauvegarde était trop lourde pour être envoyée. Tout est encore sur cet iPhone.',
  'backup.note':
    'Une sauvegarde par jour, après ta clôture. Pour restaurer sur un nouvel iPhone, active le Trousseau iCloud dans les Réglages iOS.',
  'backup.paused':
    'La sauvegarde est en pause sans Max. Ta dernière sauvegarde reste en sécurité dans iCloud.',
  'backup.empty': 'Rien à sauvegarder pour l’instant. Clôture ta première journée et reviens.',

  'backup.turnOn': 'Activer la sauvegarde',
  'backup.now': 'Sauvegarder maintenant',
  'backup.working': 'Sauvegarde en cours…',
  'backup.delete': 'Supprimer la sauvegarde',
  'backup.deleteConfirm': 'Touche encore pour supprimer ta sauvegarde',
  'backup.deleting': 'Suppression…',
  'backup.deletePending':
    'Ta sauvegarde sera supprimée dès que 6pm sera en ligne. Plus rien n’est envoyé d’ici là.',

  'backup.found.title': 'Il y a déjà une sauvegarde dans ton iCloud.',
  'backup.found.sub':
    'Elle vient d’un autre iPhone ou d’une installation précédente. Sauvegarder depuis ici la remplacerait.',
  'backup.found.restore': 'La restaurer ici',
  'backup.found.restoreConfirm': 'Touche encore pour remplacer les journées de cet iPhone',
  'backup.found.replace': 'La remplacer par cet iPhone',

  'backup.restore.link': 'Restaurer une sauvegarde',
  'backup.restore.title': 'Restaurer une sauvegarde',
  'backup.restore.found': 'Ta sauvegarde du {date} est là.',
  'backup.restore.sub': {
    one: '{count} élément · chiffré dans iCloud.',
    other: '{count} éléments · chiffrés dans iCloud.',
  },
  'backup.restore.do': 'Restaurer mes journées',
  'backup.restore.working': 'Restauration…',
  'backup.restore.fresh': 'Repartir de zéro',
  'backup.restore.freshNote':
    'Repartir de zéro garde ta sauvegarde jusqu’à ce que la prochaine la remplace.',
  'backup.restore.looking': 'Recherche de ta sauvegarde…',
  'backup.restore.none': 'Aucune sauvegarde trouvée pour ce Trousseau iCloud.',
  'backup.restore.unsupported':
    'Cette sauvegarde vient d’une version plus récente de 6pm. Mets l’app à jour pour la restaurer.',
  'backup.restore.wrongKey': 'La clé de cet iPhone ne peut pas ouvrir cette sauvegarde.',
  'backup.restore.damaged': 'Cette sauvegarde est endommagée et ne peut pas être restaurée.',

  'backup.error.network': 'Impossible de joindre 6pm. Réessaie dans un instant.',
  'backup.error.keychain':
    'Le Trousseau iCloud n’a pas gardé la clé, donc rien n’a été sauvegardé. Vérifie qu’il est activé dans les Réglages iOS.',
  'backup.error.tooLarge':
    'Cette sauvegarde est trop lourde pour être envoyée. Tout est encore sur cet iPhone.',
  'backup.retry': 'Réessayer',
  'backup.error.generic': 'Ça n’a pas marché. Réessaie.',

  'backup.toast.deleted': 'Sauvegarde supprimée.',
  'companion.backupDone.soft': 'Sauvegardé. Tes journées sont à l’abri.',
  'companion.backupDone.cheeky': 'Sauvegardé. Même ton pire mardi est à l’abri maintenant.',
  'companion.backupDone.roast': 'Sauvegardé. Tes petits écarts sont dans le cloud pour toujours.',
  'companion.backupDone.plain': 'Sauvegarde terminée.',
  'companion.backupRestored.soft': 'Bon retour. Tout est là.',
  'companion.backupRestored.cheeky': 'De retour du cloud. Rien ne manque.',
  'companion.backupRestored.roast': 'Restauré. Évite de perdre un autre téléphone, hein.',
  'companion.backupRestored.plain': 'Sauvegarde restaurée.',
};
