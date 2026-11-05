import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const frPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'Photo jointe',
  'photo.slot': 'PHOTO',
  'photo.add': 'Ajouter une photo',
  'photo.open': 'Ouvrir la photo',
  'photo.take': 'Prendre une photo',
  'photo.choose': 'Choisir dans Photos',
  'photo.close': 'Fermer',
  'photo.hint': 'Glisse vers le bas pour la rattacher',
  'photo.replace': 'Remplacer',
  'photo.remove': 'Retirer',
  'photo.removed': 'Photo retirée. La dépense reste.',
  'photo.stamp.top': 'GARDÉE',
  'photo.stamp.bottom': 'SUR CE TÉLÉPHONE SEULEMENT',
  'photo.clipOne': 'ATTACHE-EN UNE',
  'photo.cameraOff': 'L’appareil photo est désactivé pour 6pm. Active-le dans Réglages.',
  'photo.failed': 'Impossible de garder cette photo.',
};
