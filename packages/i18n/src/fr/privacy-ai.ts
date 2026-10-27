import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

// French writes sizes in « Go » and a space before « % ».
export const frPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': 'Où 6pm doit-il réfléchir ?',
  'privacy.ai.sub':
    'Là où tes questions et les répliques de ton compagnon sont calculées. Modifiable à tout moment dans Réglages.',
  'privacy.ai.server.title': 'Sur notre serveur, avec Claude',
  'privacy.ai.server.text':
    'Les réponses les plus fines, et une voix qui comprend bien le vietnamien. Seuls une question ou quelques faits quittent ton téléphone, jamais ta liste de dépenses.',
  'privacy.ai.server.tag': 'Recommandé',
  'privacy.ai.device.title': 'Uniquement sur cet iPhone',
  'privacy.ai.device.text':
    'Rien côté IA ne quitte ton téléphone. Un modèle est téléchargé une seule fois, en Wi‑Fi.',
  'privacy.ai.device.unavailable': 'Cet iPhone n’a pas assez de mémoire pour un modèle à lui.',
  'privacy.ai.models': 'Modèle',
  'privacy.model.fast': 'Le plus rapide et léger',
  'privacy.model.words': 'Meilleures formulations',
  'privacy.model.reading': 'Meilleur en questions',
  'privacy.model.size': '{size} Go',
  'privacy.model.download': 'Télécharger',
  'privacy.model.downloading': '{percent} %',
  'privacy.model.verifying': 'Vérification',
  'privacy.model.ready': 'Prêt',
  'privacy.model.failed': 'Réessayer',
  'privacy.model.delete': 'Supprimer',
  'privacy.model.later': 'Tu peux continuer pendant le téléchargement.',
  'settings.ai': 'IA',
  'settings.ai.server': 'Sur notre serveur',
  'settings.ai.device': 'Sur cet iPhone',
  'privacy.leaves.title': 'Ce qui quitte ton téléphone',
  'privacy.leaves.server.ask':
    'Une question, avec les noms de tes catégories et cagnottes, pour la lire',
  'privacy.leaves.server.lines': 'Les quelques faits d’une réplique du compagnon',
  'privacy.leaves.server.receipts': 'Une photo de ticket que ton téléphone ne sait pas lire',
  'privacy.leaves.server.voice': 'Ta voix pendant que tu parles, pour la transformer en texte',
  'privacy.leaves.device.none': 'Rien côté IA. Tout est calculé sur cet iPhone.',
  'privacy.leaves.device.network':
    'Les taux de change (seulement une date), les mises à jour et les achats passent toujours par Internet.',
  'privacy.leaves.device.emails': 'Les tickets par e-mail sont désactivés dans ce mode.',
};
