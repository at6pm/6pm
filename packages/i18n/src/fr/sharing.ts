import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const frSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': 'Enregistrer l’image',
  'sharing.share': 'Partager',
  'sharing.saved': 'Enregistrée dans Photos.',
  'sharing.photosOff': 'L’accès à Photos est désactivé pour 6pm.',
  'sharing.openSettings': 'Ouvrir Réglages',
  'sharing.failed': 'Impossible de créer l’image. Réessaie.',
};
